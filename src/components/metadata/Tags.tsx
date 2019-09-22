import * as React from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import AsyncSelect from 'react-select/async';
import { API } from 'aws-amplify';
import { find } from 'lodash';

export interface Tag {
  id?: number;
  value: number | string;
  label: string;
}

interface State {
  tags: Tag[];
  selectedTags: Tag[];
  isLoading: boolean;

  rekognitionTags: Tag[] | [];
}

interface Props {
  className?: string;
  location?: string;

  defaultValues?: Tag[] | [];
  defaultOptions?: Tag[];

  type: 'concept' | 'keyword';
  callback?: Function;

  loadItemRekognitionTags?: string; // the items s3_key
}

export default class Tags extends React.Component<Props, State> {
  _isMounted;
  loadTagsTimeout;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;

    const { defaultValues } = this.props;

    this.state = {
      tags: [],
      selectedTags: defaultValues ? defaultValues : [],
      isLoading: false,
      rekognitionTags: []
    };
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;
    const { loadItemRekognitionTags } = this.props;

    if (this.props.type === 'keyword' && loadItemRekognitionTags && loadItemRekognitionTags.length) {
      this.getItemRekognitionTags(loadItemRekognitionTags);
    }

    if (this.props.type === 'concept') {
      const
        response = await API.get('tba21', 'tags', {
          queryStringParameters: {
            type: 'concept',
            limit: 2000
          }
        }),
        tags = response.tags.map(t => ({id: parseInt(t.id, 0), value: parseInt(t.id, 0), label: t.tag_name})),
        // filterTags = tags.filter( tag => !find(this.state.tags, { label: tag.label })),
        filterSelected = tags.filter( tag => !find(this.state.selectedTags, { label: tag.label }) );

      if (this._isMounted) {
        this.setState({tags: [...this.state.tags, ...filterSelected]});
      }
    }
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  /**
   *
   * Polls the DB for the Items Machine Rekognition Tags
   *
   * @param s3key { string }
   */
  getItemRekognitionTags = async (s3key: string) => {
    let
      counter = 6,
      timeoutSeconds = 1000;

    // Function with a Timeout Promise, as we increase the time between calls, this is due to Rekognition and the helpers taking time.
    const doAPICall = async (): Promise<string[]> => {
      return new Promise( resolve => {

        const apiTimeout = setTimeout( async () => {
          if (!this._isMounted) { clearTimeout(apiTimeout); return; }
          counter --;

          try {
            const response = await API.get('tba21', 'items/getRekognitionTags', {
              queryStringParameters: {
                s3key: s3key
              }
            });

            timeoutSeconds = timeoutSeconds * 1.5;

            if (response.tags && response.tags.length) {
              clearTimeout(apiTimeout);
              return resolve(response.tags);
            } else {
              if (!counter) {
                clearTimeout(apiTimeout);
                return resolve([]);
              } else {
                return resolve(await doAPICall());
              }
            }
          } catch (e) {
            console.log('ERR - ', e);
            return resolve([]);
          }

        }, timeoutSeconds);
      });
    };

    const state = {
      isLoading: false
    };
    try {
      const results = await doAPICall();
      Object.assign(state, {rekognitionTags: results.map( t => ( { value: t, label: t} )) });
    } catch (e) {
      console.log('ERROR -- ', e);
    } finally {
      if (this._isMounted) {
        this.setState(state);
      }
    }
  }

  /**
   *
   * Load tags that match the given string
   *
   * Timeout for the user keyboard presses, clear the timeout if they've pressed another key within 500ms and start again,
   * This avoids multiple calls before the user has finished typing.
   *
   * @param inputValue { string }
   */
  loadTags = async (inputValue: string) => {
    if (inputValue && inputValue.length <= 1) { clearTimeout(this.loadTagsTimeout); return; }

    if (this.loadTagsTimeout) { clearTimeout(this.loadTagsTimeout); }

    return new Promise( resolve => {
      this.loadTagsTimeout = setTimeout(async () => {
        clearTimeout(this.loadTagsTimeout);

        const
          queryStringParameters = ( inputValue ? { query: inputValue, type: this.props.type, limit: 1000} : {} ),
          queriedTags = await API.get('tba21', 'tags', { queryStringParameters: queryStringParameters }),

          tags = queriedTags.tags.map(t => ({id: parseInt(t.id, 0), value: parseInt(t.id, 0), label: t.tag_name})),
          filteredTags = tags.filter( tag => !find(this.state.selectedTags, { label: tag.label }) );

        if (!this._isMounted) { clearTimeout(this.loadTagsTimeout); return; }
        this.setState(
          {
            isLoading: false,
            tags: [...this.state.tags, ...filteredTags]
          }
        );

        // Return the tags to React Select
        resolve(filteredTags.filter(tag => tag.label.toLowerCase().includes(inputValue.toLowerCase())));
      }, 500);
    });
  }

  /**
   *
   * Adds a tag to the DB
   *
   * @param inputValue { string }
   */
  createTag = async (inputValue: string) => {
    if (!this._isMounted) { return; }

    this.setState( { isLoading: true });

    const results = await API.put('tba21', 'contributor/tags', {
      body: {
        // type: this.props.type,
        tags: [inputValue]
      }
    });

    return results.tags.map( t => ({ id: parseInt(t.id, 0), value: parseInt(t.id, 0), label: t.tag_name}) );
  }

  /**
   * OnChange event for React-Select
   *
   * Detects each ActionMeta (event) from React Select and does the correct action.
   *
   * @param tagsList { any }
   * @param actionMeta { any }
   */
  onChange = async (tagsList: any, actionMeta: any) => { // tslint:disable-line: no-any
    if (!this._isMounted) { return; }

    if (actionMeta.action === 'clear') {
      this.setState({ selectedTags: [] });
    }

    const createNewTags = async () => {
      const tags: Tag[] = [];

      for (let tag of tagsList) {
        // If the tag has no id it's more than likely a Rekognition tag, so we'll attempt to create it
        if (!tag.id) {
          const results = await this.createTag(tag.label);
          tags.push({ id: parseInt(results[0].id, 0), value: parseInt(results[0].id, 0), label: results[0].label });
        } else {
          tags.push({ id: parseInt(tag.id, 0), value: parseInt(tag.id, 0), label: tag.label });
        }
      }
      return tags;
    };

    const parentCallback = (): void => {
      if ((this.props.callback && typeof this.props.callback === 'function') && (this.state.selectedTags && this.state.selectedTags.length > 0)) {
        this.props.callback(this.state.selectedTags);
      }
    };

    if (actionMeta.action === 'select-option' || actionMeta.action === 'create-option') {
      this.setState({isLoading: false, selectedTags: await createNewTags()}, () => {
        parentCallback();
      });
    }

    if (actionMeta.action === 'remove-value') {
      this.setState({selectedTags: tagsList}, () => {
        parentCallback();
      });
    }
  }

  render() {
    const {
      className
    } = this.props;

    return (
      <div className={className ? className : ''}>
        {this.props.type === 'keyword' ?
          <AsyncCreatableSelect
            isMulti
            maxMenuHeight={200}
            menuPlacement="auto"
            isDisabled={this.state.isLoading}
            isLoading={this.state.isLoading}
            placeholder={(this.state.rekognitionTags.length > 0) ? 
              "Pick generated keyword, or start typing then select, or type then hit enter/tab to add a new keyword..."
              :
              "Start typing then select, or type then hit enter/tab to add a new keyword..."
            }
            cacheOptions
            className="select"
            classNamePrefix="select"

            value={this.state.selectedTags}
            defaultOptions={[{
              label: 'Generated Suggestions',
              options: [...this.state.rekognitionTags]
            }, ...this.state.tags]}
            options={[{label: 'Generated Suggestions', options: [...this.state.rekognitionTags]}, ...this.state.tags]}

            loadOptions={this.loadTags}
            onChange={this.onChange}
          />
          :
          <AsyncSelect
            isMulti
            maxMenuHeight={200}
            menuPlacement="auto"
            isDisabled={this.state.isLoading}
            isLoading={this.state.isLoading}
            cacheOptions
            className="select"
            classNamePrefix="select"

            defaultValue={this.state.selectedTags}
            defaultOptions={this.state.tags}
            options={this.state.tags}

            loadOptions={this.loadTags}
            onChange={this.onChange}
          />
        }
      </div>
    );
  }
}
