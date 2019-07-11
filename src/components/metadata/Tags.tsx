import * as React from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
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
  rekognitionTags: Tag[];
}

interface Props {
  className?: string;

  defaultValues?: Tag[];
  defaultOptions?: Tag[];
  defaultOptionsStrings?: string[];

  type: 'concept' | 'keyword';
  callback?: Function;
}

class Tags extends React.Component<Props, State> {
  loadTagsTimeout;

  constructor(props: Props) {
    super(props);

    const { defaultOptionsStrings } = this.props;

    let rekognitionTags: Tag[] = [];
    if (defaultOptionsStrings && defaultOptionsStrings.length) {
      rekognitionTags = defaultOptionsStrings.map( t => ( { value: t, label: t} ));
    }

    this.state = {
      tags: [],
      selectedTags: [],
      isLoading: false,
      rekognitionTags: rekognitionTags
    };
  }

  loadTags = async (inputValue: string) => {
    if (inputValue && inputValue.length <= 1) { clearTimeout(this.loadTagsTimeout); return; }

    if (this.loadTagsTimeout) { clearTimeout(this.loadTagsTimeout); }

    return new Promise( resolve => {
      this.loadTagsTimeout = setTimeout(async () => {
        clearTimeout(this.loadTagsTimeout);

        const
          queryStringParameters = ( inputValue ? { query: inputValue, type: this.props.type } : {} ),
          queriedTags = await API.get('tba21', 'tags', { queryStringParameters: queryStringParameters }),

          tags = queriedTags.tags.map(t => ({id: t.id, value: t.id, label: t.tag_name.charAt(0).toUpperCase() + t.tag_name.slice(1)})),
          filteredTags = tags.filter( tag => !find(this.state.tags, { tag_name: tag.tag_name }) );

        this.setState(
          {
            isLoading: false,
            tags: [...this.state.tags, ...filteredTags]
          }
        );

        resolve(filteredTags.filter(tag => tag.label.toLowerCase().includes(inputValue.toLowerCase())));
      }, 1500);
    });
  }

  createTag = async (inputValue: string) => {
    this.setState( { isLoading: true });

    const results = await API.put('tba21', 'admin/tags', {
      body: {
        type: this.props.type,
        tags: [inputValue]
      }
    });

    return results.tags.map( t => ({ id: t.id, value: t.id, label: t.tag_name}) );
  }

  onChange = async (tagsList: any, actionMeta: any) => {

    if (actionMeta.action === 'clear') {
      this.setState({ selectedTags: [] });
    }

    const createNewTags = async () => {
      const tags: Tag[] = [];

      for (let tag of tagsList) {
        // If the tag has no id it's more than likely a Rekognition tag, so we'll attempt to create it
        // If the tag has the __isNew__ property, it's brand spankin' new so create it.
        if (!tag.id || tag.__isNew__) {
          const results = await this.createTag(tag.label);
          tags.push({ id: results[0].id, value: results[0].id, label: results[0].label });
        } else {
          tags.push({ id: tag.id, value: tag.id, label: tag.label });
        }
      }
      return tags;
    };

    if (actionMeta.action === 'select-option' || actionMeta.action === 'create-option') {
      this.setState({ isLoading: false, selectedTags: await createNewTags() } );
    }

    if (actionMeta.action === 'remove-value') {
      this.setState({ selectedTags: tagsList} );
    }

    if (this.props.callback && typeof this.props.callback === 'function') {
      this.props.callback(this.state.selectedTags.map( tag => tag.id));
    }

  }

  render() {
    const {
      className, defaultValues
    } = this.props;
    return (
      <div className={className ? className : ''}>
        <AsyncCreatableSelect
          isMulti
          isDisabled={this.state.isLoading}
          isLoading={this.state.isLoading}
          cacheOptions

          defaultValues={defaultValues ? defaultValues : []}
          defaultOptions={[ { label: 'Generated Suggestions', options: [...this.state.rekognitionTags] } , ...this.state.tags]}

          options={this.state.tags}

          loadOptions={this.loadTags}

          onChange={this.onChange}
          value={this.state.selectedTags}
        />
      </div>
    );
  }
}

export default Tags;
