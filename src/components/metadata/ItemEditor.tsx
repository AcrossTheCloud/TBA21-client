import * as React from 'react';
import {
  Button,
  Col,
  CustomInput,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormFeedback,
  FormGroup,
  FormText,
  Input,
  InputGroup,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  UncontrolledButtonDropdown
} from 'reactstrap';
import TimeField from 'react-simple-timefield';

import { API } from 'aws-amplify';
import Select from 'react-select';
import { isArray, isEqual } from 'lodash';
import { Item, itemAudio, itemImage, itemText, itemVideo } from '../../types/Item';

import {
  countries,
  itemAudioSubTypes,
  itemImageSubTypes,
  itemTextSubTypes,
  itemVideoSubTypes,
  languages,
  licenseType,
  oceans,
  regions as selectableRegions
} from './SelectOptions';

import Tags from './Tags';
import { sdkGetObject } from '../utils/s3File';
import { Alerts, ErrorMessage, SuccessMessage, WarningMessage } from '../utils/alerts';
import { License } from '../../types/License';

import CustomSelect from './fields/CustomSelect';
import { validateURL } from '../utils/inputs/url';
import ShortPaths from '../admin/utils/ShortPaths';
import YearSelect from './fields/YearSelect';

import 'styles/components/metadata/itemEditor.scss';
import 'styles/components/metadata/editors.scss';

interface Props {
  item: Item;
  index?: number;
  onChange?: Function;
  isContributorPath?: boolean;
}

interface State extends Alerts {
  originalItem: Item;
  changedItem: Item;
  changedFields: {
    [key: string]: string
  };
  isDifferent: boolean;

  isLoading: boolean;
  hideForm: boolean;

  activeTab: string;

  validate: {
    [key: string]: boolean
  };
}

const defaultRequiredFields = (item: Item) => {
  const {
    title,
    description,
    item_subtype,
    regions,
    aggregated_concept_tags,
    concept_tags
  } = item;

  let conceptTags: boolean = false;
  if (aggregated_concept_tags !== null && aggregated_concept_tags.length > 0) {
    conceptTags = true;
  }
  if (concept_tags) {
    conceptTags = true;
  }

  return {
    'title': (!!title && title.length > 0),
    'description': (!!description && description.length > 0),
    'item_subtype': (!!item_subtype && item_subtype.length > 0),
    'regions': (!!regions && regions.length > 0),
    'concept_tags': conceptTags
  };
};

export class ItemEditor extends React.Component<Props, State> {
  _isMounted;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;

    this.state = {
      originalItem: props.item,
      changedItem: {...props.item},
      changedFields: {},
      isDifferent: false,
      isLoading: true,
      hideForm: false,
      activeTab: '1',
      validate: defaultRequiredFields(props.item),
    };
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;
    await this.getItemByS3Key();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getItemByS3Key = async (): Promise<void> => {
    const state = {
      originalItem: this.state.originalItem,
      changedItem: this.state.changedItem,
      isLoading: false,
      warningMessage: undefined,
      errorMessage: undefined
    };

    try {
      const response = await API.get('tba21', (this.props.isContributorPath ? 'contributor/items/getItem' : 'admin/items/getItemNC'), {
        queryStringParameters : {
          s3Key: this.props.item.s3_key
        }
      });

      if (response.item && Object.keys(response.item).length) {

        // Get the items s3 file
        const getFileResult = await sdkGetObject(this.state.originalItem.s3_key);
        const data = {
          originalItem: { ...response.item, file: getFileResult },
          changedItem: { ...response.item, file: getFileResult, type: (getFileResult && getFileResult.type) ? getFileResult.type.substr(0, 1).toUpperCase() : null }
        };
        Object.assign(state, data);

      } else {
        Object.assign(state, { errorMessage: 'No item by that name.', hideForm: true });
      }
    } catch (e) {
      Object.assign(state, { hideForm: true, errorMessage: `${e}` });
    } finally {
      if (this._isMounted) {
        this.setState(state);
      }
    }
  }

  /**
   *
   * Converts the items file from S3 and outputs the correct HTML Element for the ContentType
   *
   */
  filePreview = (): JSX.Element => {
    if (!this.state.isLoading) {
      const
        { file, title } = this.state.originalItem,
        warning = <WarningMessage message={'Unable to load file.'}/>;

      if (file && file.url) {
        if (file.type === 'image') {
          return <img src={file.url} alt=""/>;
        } else if (file.type === 'pdf') {
          return (
            <div className="embed-responsive embed-responsive-4by3">
              <iframe title={!!title ? title : file.url} className="embed-responsive-item" src={file.url} />
            </div>
          );
        } else if (file.type === 'downloadText' || file.type === 'text') {
          return (
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              <img alt="" src="https://upload.wikimedia.org/wikipedia/commons/2/22/Unscharfe_Zeitung.jpg" className="image-fluid"/>
            </a>
          );
        } else { return warning; }
      } else {
        return warning;
      }
    } else {
      return <></>;
    }
  }

  /**
   *
   * Updates the item in the database
   *
   */
  updateItem = async () => {
    if (!this._isMounted) { return; }

    this.setState(
      {
        errorMessage: undefined,
        successMessage: undefined,
        warningMessage: undefined,
        isLoading: true
      }
    );

    const
      state = {
        isLoading: false
      },
      item = this.state.changedFields,
      invalidFields = Object.entries(this.state.validate).filter(v => v[1] === false).map(([key, val]) => key);

    // If we don't have one of time_produced or year_produced, show an error.
    if (
      (!this.state.validate.hasOwnProperty('time_produced') && !this.state.validate.time_produced) && (!this.state.validate.hasOwnProperty('year_produced') && !this.state.validate.year_produced)
    ) {
      Object.assign(invalidFields, {'time_produced or year_produced': ''});
    }

    if (invalidFields.length > 0) {
      const message: JSX.Element = (
        <>
          Missing required Field(s) <br/>
          {invalidFields.map( (f, i) => ( <div key={i} style={{ textTransform: 'capitalize' }}>{f.replace(/_/g, ' ')}<br/></div> ) )}
        </>
      );

      Object.assign(state, { errorMessage: message });
      if (!this._isMounted) { return; }
      this.setState(state);
      return;
    }

    if (
      // If no Focus has been checked
      (this.state.changedItem.focus_arts === null || this.state.changedItem.focus_arts === '0') &&
      (this.state.changedItem.focus_scitech === null || this.state.changedItem.focus_scitech === '0') &&
      (this.state.changedItem.focus_action === null || this.state.changedItem.focus_action === '0')
    ) {
      Object.assign(state, { errorMessage: <>You need to select at least one Focus area.</> });
      if (!this._isMounted) { return; }
      this.setState(state);
      return;
    } else {
      Object.assign(item, {
        focus_arts: this.state.changedItem.focus_arts === '1' ? '1' : '0',
        focus_scitech: this.state.changedItem.focus_scitech === '1' ? '1' : '0',
        focus_action: this.state.changedItem.focus_action === '1' ? '1' : '0'
      });
    }

    try {
      const itemsProperties = {};

      // We filter out specific values here as the API doesn't accept them, but returns them in the Item object.
      Object.entries(item)
        .filter( ([key, value]) => {
          return !(
            value === null
            || key === 'id' // use this to exclude things, you shouldn't need to (eg don't put them in changedFields...
          );
        })
        .forEach( field => {
          Object.assign(itemsProperties, { [field[0]]: field[1] });
        });

      // If no license assign OA
      if (!itemsProperties.hasOwnProperty('license')) {
        Object.assign(itemsProperties, { 'license': 'Ocean Archive' });
      }

      // Assign s3_key
      Object.assign(itemsProperties, { 's3_key': this.state.originalItem.s3_key });

      const result = await API.put('tba21', (this.props.isContributorPath ? 'contributor/items/update' : 'admin/items/update'), {
        body: {
          ...itemsProperties
        }
      });

      if (!result.success && result.message && result.message.length) {
        // If we've failed
        Object.assign(state, { errorMessage: result.message });
      } else if (result.success) {
        Object.assign(state, { successMessage: 'Updated item!', changedFields: {}, originalItem: {...this.state.changedItem}, isDifferent: false});

        if (this.props.onChange && typeof this.props.onChange === 'function') {
          const onChangeResult = {
            item: this.state.changedItem
          };
          if (typeof this.props.index !== 'undefined') {
            Object.assign(onChangeResult, { index: this.props.index });
          }
          this.props.onChange(onChangeResult);
        }

      } else {
        Object.assign(state, { warningMessage: result });
      }

    } catch (e) {
      console.log(e);
      Object.assign(state, { errorMessage: 'We had an issue updating this item.' });
    } finally {
      if (!this._isMounted) { return; }
      this.setState(state);
    }
  }

  /**
   *
   * Adds changed values to changedItem and changedFields
   * Compares props.item to changedItem and enables/disabled Update button
   *
   * @param key { string }
   * @param value { any }
   * @param callback { Function } a callback once the state has finished.
   */
  changeItem = (key: string, value: any, callback?: Function) => { // tslint:disable-line: no-any
    if (!this._isMounted) { return; }

    const { changedItem, changedFields } = this.state;

    if (value.toString().length) {
      Object.assign(changedFields, { [key]: value });
      Object.assign(changedItem, { [key]: value });
    } else {
      if (changedFields[key]) {
        delete changedFields[key];
        // Reset back to original item key value
        Object.assign(changedItem, { [key]: this.state.originalItem[key] });
      }
    }

    if (!this._isMounted) { return; }
    this.setState(
      {
        changedFields: changedFields,
        changedItem: changedItem,
        isDifferent: !isEqual(this.state.originalItem, changedItem)
      },
      () => {
        if (callback && typeof callback === 'function') {
          callback();
        }
      });
  }

  SubType = (): JSX.Element => {
    let options: {[value: string]: string}[] = [];

    const { file } = this.state.originalItem;

    // If we can't get the file at all, for whatever reason, show all types.
    if (!file) {
      options.push(...itemTextSubTypes, ...itemVideoSubTypes, ...itemImageSubTypes, ...itemAudioSubTypes);
    } else if (file.type === 'pdf') {
      options.push(...itemTextSubTypes, ...itemImageSubTypes.filter(t => t.label !== 'Other'));
    } else if (file.type === 'text' || file.type === 'downloadText') {
      options = itemTextSubTypes;
    } else if (file.type === 'video') {
      options = itemVideoSubTypes;
    } else if (file.type === 'audio') {
      options = itemAudioSubTypes;
    } else if (file.type === 'image') {
      options = itemImageSubTypes;
    }

    return <Select menuPlacement="auto" className="select item_subtype" classNamePrefix="select" options={options} value={[options.find( o => o.value === this.state.changedItem.item_subtype)]} onChange={e => this.validateLength('item_subtype', e.value)} isSearchable/>;
  }

  subTypeOnChange = (subType: string) => {
    if (!this._isMounted) { return; }
    const state = {
      ...defaultRequiredFields(this.state.changedItem)
    };

    const {
      authors,
      subtitle,
      news_outlet,
      host_organisation,
      organisation,
      publisher,
      city_of_publication,
      venues,
      edition,
      institution,
      performers,
      episode_name,
      speakers,
      lecturer,
      interviewers,
      interviewees,
      recording_name,
      medium,
      dimensions,
      directors,
      writers,
      exhibited_at,
      location,
      event_title,
      produced_by
    } = this.state.changedItem;

    const { file } = this.state.originalItem;

    const textFields =  (file.type === 'text')  ? {
        'Academic Publication': {
          'authors': (authors || false),
          'subtitle': (subtitle || false)
        },
        'News': {
          'authors': (authors || false),
          'news_outlet': (news_outlet || false)
        },
        'Policy Paper': {
          'authors': (authors || false),
          'host_organisation': (host_organisation || false)
        },
        'Report': {
          'authors': (authors || false),
          'organisation': (organisation || false)
        },
        'Book': {
          'authors': (authors || false),
          'publisher': (publisher || false),
          'city_of_publication': (city_of_publication	 || false),
          'edition': (edition	 || false)
        },
        'Essay': {
          'authors': (authors || false),
          'venues': (venues || false),
        },
        'Historical Text': {
          'authors': (authors || false),
          'publisher': (publisher || false),
          'venues': (venues || false),
          'edition': (edition	 || false)
        },
        'Event Press': {
          'authors': (authors || false),
          'institution': (institution || false),
        },
        'Toolkit': {
          'authors': (authors || false),
          'institution': (institution || false),
        }
      } : '';
    const audioFields = (file.type === 'audio')  ?  {
        'Sound Art': {
          'performers': (performers || false)
        },
        'Music': {
          'performers': (performers || false)
        },
        'Podcast': {
          'episode_name': (episode_name || false),
          'speakers': (speakers || false)
        },
        'Lecture': {
          'lecturer': (lecturer || false)
        },
        'Interview': {
          'interviewers': (interviewers || false),
          'interviewees': (interviewees || false)
        },
        'Radio': {
          'recording_name ': (recording_name || false)
        },
        'Performance Poetry ': {
          'performers ': (performers || false)
        }
      } : '';
    const imageFields = (file.type === 'image')  ?  {
        'Photograph': {
          'medium': (medium || false),
          'dimensions': (dimensions || false)
        },
        'Graphics': {
          'medium': (medium || false),
          'dimensions': (dimensions || false)
        },
        'Map': {
          'medium': (medium || false)
        },
        'Film Still': {
          'directors': (directors || false),
          'writers': (writers || false),
        },
        'Sculpture': {
          'medium': (medium || false),
          'dimensions': (dimensions || false)
        },
        'Painting': {
          'medium': (medium || false),
          'dimensions': (dimensions || false)
        },
        'Illustration': {
          'medium': (medium || false),
          'dimensions': (dimensions || false)
        },
        'Artwork Documentation': {
          'exhibited_at': (exhibited_at || false)
        }
      } : '';
    const videoFields  = (file.type === 'video')  ?   {
        'Movie': {
          'directors': (directors || false)
        },
        'Documentary': {
          'directors': (directors || false)
        },
        'Interview': {
          'interviewers': (interviewers || false),
          'interviewees': (interviewees || false)
        },
        'Art': {
          'directors': (directors || false)
        },
        'News / Journalism': {
          'authors': (authors || false),
          'news_outlet': (news_outlet || false)
        },
        'Event Recording': {
          'location': (location || false),
          'event_title': (event_title  || false)
        },
        'Lecture Recording': {
          'location': (location || false),
          'event_title': (event_title  || false)
        },
        'Trailer': {
          'directors': (directors || false)
        },
        'Informational Video': {
          'produced_by': (produced_by || false)
        }
      } : '';

    // All the required fields per sub type
    const subtypeRequiredFields = {
      ...textFields,
      ...audioFields,
      ...imageFields,
      ...videoFields,
    };

    Object.assign(state, subtypeRequiredFields[subType]);
    if (!this._isMounted) { return; }
    this.setState({ validate: {...state} });
  }

  validateLength = (field: string, inputValue: string | string[] | number | number[]): void => {
    if (!this._isMounted) { return; }

    let valid = false;
    this.changeItem(field, inputValue);
    if (inputValue && inputValue.toString().length > 0) {
      valid = true;
    }

    const state = { validate: { ...this.state.validate, [field]: valid } };

    if (!this._isMounted) { return; }
    this.setState(state, () => {
      if (!isArray(inputValue) && field === 'item_subtype') {
        this.subTypeOnChange(inputValue.toString());
      }
    });
  }

  // ITEM TEXT
  TextAcademicPublication = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <CustomSelect values={item.authors} callback={values => this.validateLength('authors', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('authors') && !this.state.validate.authors ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Author.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="subtitle">Subtitle</Label>
            <Input
              type="text"
              className="subtitle"
              required
              defaultValue={item.subtitle ? item.subtitle : ''}
              invalid={this.state.validate.hasOwnProperty('subtitle') && !this.state.validate.subtitle}
              onChange={e => this.validateLength('subtitle', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="in_title">In (title of book or journal)</Label>
            <Input
              type="text"
              className="in_title"
              defaultValue={item.in_title ? item.in_title : ''}
              onChange={e => this.changeItem('in_title', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="volume">Volume #</Label>
            <Input type="number" className="volume" defaultValue={this.state.changedItem.volume ? this.state.changedItem.volume.toString() : ''} onChange={e => this.changeItem('volume', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="issue">Issue #</Label>
            <Input
              type="number"
              className="issue"
              defaultValue={item.issue ? item.issue.toString() : ''}
              onChange={e => this.changeItem('issue', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="edition">Edition #</Label>
            <Input
              type="number"
              className="edition"
              defaultValue={this.state.changedItem.edition ? this.state.changedItem.edition.toString() : ''}
              onChange={e => this.changeItem('edition', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="pages">Pages (Count)</Label>
            <Input
              type="number"
              className="pages"
              defaultValue={item.pages ? item.pages.toString() : ''}
              onChange={e => this.changeItem('pages', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="doi">DOI</Label>
            <Input
              type="text"
              className="doi"
              defaultValue={item.doi ? item.doi.toString() : ''}
              invalid={this.state.validate.hasOwnProperty('doi') && !this.state.validate.doi}
              onChange={e => {
                const value = e.target.value;
                let valid = /^10.\d{4,9}\/[-._;()/:a-zA-Z0-9]+$/.test(value);
                if (!value) {
                  valid = true;
                } // set valid to true for no content
                if (valid) {
                  this.changeItem('doi', value);
                } // if valid set the data in changedItem
                if (!this._isMounted) { return; }
                this.setState({validate: {...this.state.validate, doi: valid}});
              }}
            />
            <FormFeedback>This field is required.</FormFeedback>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="isbn">ISBN</Label>
            <Input type="number" className="isbn" defaultValue={this.state.changedItem.isbn ? this.state.changedItem.isbn.toString() : ''} onChange={e => this.changeItem('isbn', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  TextArticle  = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <CustomSelect values={item.authors} callback={values => this.validateLength('authors', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('authors') && !this.state.validate.authors ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Author.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="journal">Journal</Label>
            <Input
              type="text"
              className="journal"
              defaultValue={item.journal ? item.journal : ''}
              onChange={e => this.changeItem('journal', e.target.value)}
            />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  TextNews = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <CustomSelect values={item.authors} callback={values => this.validateLength('authors', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('authors') && !this.state.validate.authors ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Author.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="subtitle">Subtitle</Label>
            <Input
              type="text"
              className="subtitle"
              required
              defaultValue={item.subtitle ? item.subtitle : ''}
              invalid={this.state.validate.hasOwnProperty('subtitle') && !this.state.validate.subtitle}
              onChange={e => this.validateLength('subtitle', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="news_outlet">News Outlet</Label>
            <Input
              type="text"
              className="news_outlet"
              defaultValue={item.news_outlet ? item.news_outlet : ''}
              invalid={this.state.validate.hasOwnProperty('news_outlet') && !this.state.validate.news_outlet}
              onChange={e => this.validateLength('news_outlet', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>

      </Row>
    );
  }
  TextPolicyPaperReport = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <CustomSelect values={item.authors} callback={values => this.validateLength('authors', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('authors') && !this.state.validate.authors ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Author.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="host_organisation">Organization</Label>
            <CustomSelect values={item.host_organisation} callback={values => this.validateLength('host_organisation', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('host_organisation') && !this.state.validate.host_organisation ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Organization.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="project">Project</Label>
            <Input
              type="text"
              className="project"
              defaultValue={item.project ? item.project : ''}
              onChange={e => this.changeItem('project', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="document_code">Document Code</Label>
            <Input
              type="text"
              className="document_code"
              defaultValue={item.document_code ? item.document_code : ''}
              onChange={e => this.changeItem('document_code', e.target.value)}
            />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  TextBook = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <CustomSelect values={item.authors} callback={values => this.validateLength('authors', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('authors') && !this.state.validate.authors ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Author.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="subtitle">Subtitle</Label>
            <Input
              type="text"
              className="subtitle"
              required
              defaultValue={item.subtitle ? item.subtitle : ''}
              onChange={e => this.changeItem('subtitle', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="editor">Editor</Label>
            <Input
              type="text"
              className="editor"
              defaultValue={item.editor ? item.editor : ''}
              onChange={e => this.changeItem('editor', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="series_name">Series Name</Label>
            <Input
              type="text"
              className="series_name"
              defaultValue={item.series_name ? item.series_name : ''}
              onChange={e => this.changeItem('series_name', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="volume">Volume In Series</Label>
            <Input type="number" className="volume" defaultValue={this.state.changedItem.volume ? this.state.changedItem.volume.toString() : ''} onChange={e => this.changeItem('volume', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="publisher">Publisher</Label>
            <CustomSelect values={item.publisher} callback={values => this.validateLength('publisher', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('publisher') && !this.state.validate.publisher ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Publisher.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="city_of_publication">City</Label>
            <Input
              type="text"
              className="city_of_publication"
              defaultValue={item.city_of_publication ? item.city_of_publication : ''}
              required
              invalid={this.state.validate.hasOwnProperty('city_of_publication') && !this.state.validate.city_of_publication}
              onChange={e => this.validateLength('city_of_publication', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="edition">Edition #</Label>
            <Input
              type="number"
              className="edition"
              defaultValue={this.state.changedItem.edition ? this.state.changedItem.edition.toString() : ''}
              required
              invalid={this.state.validate.hasOwnProperty('edition') && !this.state.validate.edition}
              onChange={e => this.validateLength('edition', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="translated_from">Translated From</Label>
            <Select menuPlacement="auto" className="select translated_from" classNamePrefix="select" options={languages} value={item.language ? languages.find( c => c.value === item.language ) : []} onChange={e => this.changeItem('translated_from', e.value)} isSearchable/>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="pages">Pages (Count)</Label>
            <Input
              type="number"
              className="pages"
              defaultValue={item.pages ? item.pages.toString() : ''}
              onChange={e => this.changeItem('pages', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="isbn">ISBN</Label>
            <Input type="number" className="isbn" defaultValue={this.state.changedItem.isbn ? this.state.changedItem.isbn.toString() : ''} onChange={e => this.changeItem('isbn', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="related_isbn">Related ISBN</Label>
            <Input type="number" className="related_isbn" defaultValue={this.state.changedItem.related_isbn ? this.state.changedItem.related_isbn.toString() : ''} onChange={e => this.changeItem('related_isbn', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  TextEssay = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <CustomSelect values={item.authors} callback={values => this.validateLength('authors', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('authors') && !this.state.validate.authors ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Author.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="subtitle">Subtitle</Label>
            <Input
              type="text"
              className="subtitle"
              defaultValue={item.subtitle ? item.subtitle : ''}
              onChange={e => this.changeItem('subtitle', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="publication_venue">Publication Venue(s)</Label>
            <CustomSelect values={item.venues} callback={values => this.validateLength('venues', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('venues') && !this.state.validate.venues ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Venue.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="related_project">Related Project</Label>
            <Input
              type="text"
              className="related_project"
              defaultValue={item.related_project ? item.related_project : ''}
              onChange={e => this.changeItem('related_project', e.target.value)}
            />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  TextHistoricalText = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <CustomSelect values={item.authors} callback={values => this.validateLength('authors', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('authors') && !this.state.validate.authors ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Author.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="subtitle">Subtitle</Label>
            <Input
              type="text"
              className="subtitle"
              defaultValue={item.subtitle ? item.subtitle : ''}
              onChange={e => this.changeItem('subtitle', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="birth_date">Date Of Birth</Label>
            <Input
              type="date"
              className="birth_date"
              defaultValue={item.birth_date ? new Date(item.birth_date).toISOString().substr(0, 10) : ''}
              onChange={e => this.validateLength('birth_date', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="death_date">Day Of Death</Label>
            <Input
              type="date"
              className="death_date"
              defaultValue={item.death_date ? new Date(item.death_date).toISOString().substr(0, 10) : ''}
              onChange={e => this.validateLength('death_date', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="editor">Editor</Label>
            <Input
              type="text"
              className="editor"
              defaultValue={item.editor ? item.editor : ''}
              onChange={e => this.changeItem('editor', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="series_name">Series Name</Label>
            <Input
              type="text"
              className="series_name"
              defaultValue={item.series_name ? item.series_name : ''}
              onChange={e => this.changeItem('series_name', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="volume">Volume In Series</Label>
            <Input
              type="number"
              className="volume"
              defaultValue={this.state.changedItem.volume ? this.state.changedItem.volume.toString() : ''}
              onChange={e => this.changeItem('volume', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="publisher">Publisher</Label>
            <CustomSelect values={item.publisher} callback={values => this.validateLength('publisher', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('publisher') && !this.state.validate.publisher ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Publisher.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="city_of_publication">City</Label>
            <Input
              type="text"
              className="city_of_publication"
              defaultValue={item.city_of_publication ? item.city_of_publication : ''}
              required
              invalid={this.state.validate.hasOwnProperty('city_of_publication') && !this.state.validate.city_of_publication}
              onChange={e => this.validateLength('city_of_publication', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="first_edition">First Edition</Label>
            <Input
              type="number"
              className="first_edition"
              defaultValue={item.first_edition ? item.first_edition.toString() : ''}
              onChange={e => this.changeItem('first_edition', e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="edition">Edition</Label>
            <Input
              type="number"
              className="edition"
              defaultValue={item.edition ? item.edition.toString() : ''}
              invalid={this.state.validate.hasOwnProperty('edition') && !this.state.validate.edition}
              required
              onChange={e => this.validateLength('edition', e.target.value)}
            />
            <FormFeedback>This field is required.</FormFeedback>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="translated_from">Translated From</Label>
            <Select menuPlacement="auto" className="select translated_from" classNamePrefix="select" options={languages} value={item.language ? languages.find( c => c.value === item.language ) : []} onChange={e => this.changeItem('translated_from', e.value)} isSearchable/>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="original_title">Original Title</Label>
            <Input
              type="text"
              className="original_title"
              defaultValue={item.original_title ? item.original_title.toString() : ''}
              onChange={e => this.changeItem('original_title', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="pages">Page Count</Label>
            <Input
              type="number"
              className="pages"
              defaultValue={item.pages ? item.pages.toString() : ''}
              onChange={e => this.changeItem('pages', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="isbn">ISBN</Label>
            <Input type="number" className="isbn" defaultValue={this.state.changedItem.isbn ? this.state.changedItem.isbn.toString() : ''} onChange={e => this.changeItem('isbn', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="related_isbn">Related ISBN</Label>
            <Input type="number" className="related_isbn" defaultValue={this.state.changedItem.related_isbn ? this.state.changedItem.related_isbn.toString() : ''} onChange={e => this.changeItem('related_isbn', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  TextEventPress = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <CustomSelect values={item.authors} callback={values => this.validateLength('authors', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('authors') && !this.state.validate.authors ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Author.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="host">Host/Artist/Curator Of Event</Label>
            <CustomSelect values={item.host} callback={values => this.changeItem('host', values)} />
            <FormText>Use tab or enter to add a new Host, Artist or Curator.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="institution">Institution</Label>
            <Input
              type="text"
              className="institution"
              required
              defaultValue={item.institution ? item.institution : ''}
              invalid={this.state.validate.hasOwnProperty('institution') && !this.state.validate.institution}
              onChange={e => this.validateLength('institution', e.target.value)}
            />
            <FormFeedback>This field is required.</FormFeedback>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="related_event">Related Event</Label>
            <Input
              type="text"
              className="related_event"
              required
              defaultValue={item.related_event ? item.related_event : ''}
              onChange={e => this.changeItem('related_event', [e.target.value])}
            />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  TextToolkit = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <CustomSelect values={item.authors} callback={values => this.validateLength('authors', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('authors') && !this.state.validate.authors ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Author.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="host">Host/Artist/Curator Of Event</Label>
            <CustomSelect values={item.host} callback={values => this.changeItem('host', values)} />
            <FormText>Use tab or enter to add a new Host, Artist or Curator.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="organisation">Organisation</Label>
            <Input
              type="text"
              className="organisation"
              defaultValue={item.organisation ? item.organisation : ''}
              invalid={this.state.validate.hasOwnProperty('organisation') && !this.state.validate.organisation}
              onChange={e => this.validateLength('organisation', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  TextOther = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <CustomSelect values={item.collaborators} callback={values => this.changeItem('collaborators', values)} />
            <FormText>Use tab or enter to add a new Collaborator.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="organisation">Organisation</Label>
            <Input
              type="text"
              className="organisation"
              defaultValue={item.organisation ? item.organisation : ''}
              onChange={e => this.changeItem('organisation', [e.target.value])}
            />
          </FormGroup>
        </Col>
      </Row>
    );
  }

  // ITEM VIDEO
  Video = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>

        <Col md="6">
          <FormGroup>
            <Label for="medium">Medium</Label>
            <Input
              type="text"
              className="medium"
              defaultValue={item.medium ? item.medium : ''}
              onChange={e => this.validateLength('medium', e.target.value)}
              invalid={this.state.validate.hasOwnProperty('medium') && !this.state.validate.medium}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="exhibited_at">Exhibited At</Label>
            <CustomSelect values={item.exhibited_at} callback={values => this.changeItem('exhibited_at', values)} />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="Provenance">Provenance</Label>
            <CustomSelect values={item.provenance} callback={values => this.changeItem('provenance', values)} />
            <FormText>Use tab or enter to add a new Provenance.</FormText>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  VideoMovieTrailer = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="directors">Directors</Label>
            <CustomSelect values={item.directors} callback={values => this.validateLength('directors', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('directors') && !this.state.validate.directors ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Director.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <CustomSelect values={item.collaborators} callback={values => this.changeItem('collaborators', values)} />
            <FormText>Use tab or enter to add a new Collaborator.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="writers">Writer</Label>
            <CustomSelect values={item.writers} callback={values => this.changeItem('writers', values)} />
            <FormText>Use tab or enter to add a new Collaborator.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="cast_">Cast</Label>
            <CustomSelect values={item.cast_} callback={values => this.changeItem('cast_', values)} />
            <FormText>Use tab or enter to add a new cast member.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="screened_at">Screened At</Label>
            <Input type="text" className="screened_at" defaultValue={item.screened_at ? item.screened_at : ''} onChange={e => this.changeItem('screened_at', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="genre">Genre</Label>
            <Input type="text" className="genre" defaultValue={item.genre ? item.genre : ''} onChange={e => this.changeItem('genre', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  VideoDocumentaryArt = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="directors">Director</Label>
            <CustomSelect values={item.directors} callback={values => this.validateLength('directors', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('directors') && !this.state.validate.directors ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Director.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <CustomSelect values={item.collaborators} callback={values => this.changeItem('collaborators', values)} />
            <FormText>Use tab or enter to add a new Collaborator.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="cast_">Cast</Label>
            <CustomSelect values={item.cast_} callback={values => this.changeItem('cast_', values)} />
            <FormText>Use tab or enter to add a new cast member.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="screened_at">Screened At</Label>
            <Input type="text" className="screened_at" defaultValue={item.screened_at ? item.screened_at : ''} onChange={e => this.changeItem('screened_at', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  VideoResearch = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <CustomSelect values={item.collaborators} callback={values => this.changeItem('collaborators', values)} />
            <FormText>Use tab or enter to add a new Collaborator.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="medium">Medium</Label>
            <Input
              type="text"
              className="medium"
              defaultValue={item.medium ? item.medium : ''}
              onChange={e => this.validateLength('medium', e.target.value)}
              invalid={this.state.validate.hasOwnProperty('medium') && !this.state.validate.medium}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="dimensions">Physical Dimensions</Label>
            <Input
              type="text"
              className="dimensions"
              defaultValue={item.dimensions ? item.dimensions : ''}
              onChange={e => this.validateLength('dimensions', e.target.value)}
              invalid={this.state.validate.hasOwnProperty('dimensions') && !this.state.validate.dimensions}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="exhibited_at">Exhibited At</Label>
            <CustomSelect values={item.exhibited_at} callback={values => this.changeItem('exhibited_at', values)} />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="Provenance">Provenance</Label>
            <CustomSelect values={item.provenance} callback={values => this.changeItem('provenance', values)} />
            <FormText>Use tab or enter to add a new Provenance.</FormText>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  VideoInterview = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="interviewers">Interviewer</Label>
            <CustomSelect values={item.interviewers} callback={values => this.validateLength('interviewers', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('interviewers') && !this.state.validate.interviewers ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Interviewer.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="interviewees">Interviewee(s)</Label>
            <CustomSelect values={item.interviewees} callback={values => this.validateLength('interviewees', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('interviewees') && !this.state.validate.interviewees ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Interviewee(s).</FormText>
          </FormGroup>
        </Col>

      </Row>
    );
  }
  VideoNewsJournalism = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="news_outlet">News Outlet</Label>
            <Input type="text" className="news_outlet" defaultValue={item.news_outlet ? item.news_outlet : ''} onChange={e => this.changeItem('news_outlet', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <CustomSelect values={item.authors} callback={values => this.changeItem(values, 'authors')} />
            <FormText>Use tab or enter to add a new Author.</FormText>
          </FormGroup>
        </Col>

      </Row>
    );
  }
  VideoEventRecording = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="location">Location</Label>
            <Input required invalid={this.state.validate.hasOwnProperty('location') && !this.state.validate.location} type="text" className="location" defaultValue={item.location ? item.location : ''} onChange={e => this.validateLength('location', e.target.value)}/>
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="participants">Participant(s)</Label>
            <CustomSelect values={item.participants} callback={values => this.validateLength('participants', values)} />
            <FormText>Use tab or enter to add a new Participant.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="event_title">Event Title</Label>
            <Input required invalid={this.state.validate.hasOwnProperty('event_title') && !this.state.validate.event_title} type="text" className="event_title" defaultValue={item.event_title ? item.event_title : ''} onChange={e => this.validateLength('event_title', e.target.value)}/>
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>

      </Row>
    );
  }
  VideoLectureRecording = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="location">Location</Label>
            <Input required invalid={this.state.validate.hasOwnProperty('location') && !this.state.validate.location} type="text" className="location" defaultValue={item.location ? item.location : ''} onChange={e => this.validateLength('location', e.target.value)}/>
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="participants">Participant(s)</Label>
            <CustomSelect values={item.participants} callback={values => this.validateLength('participants', values)} />
            <FormText>Use tab or enter to add a new Participant.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="program_title">Program Title</Label>
            <Input required invalid={this.state.validate.hasOwnProperty('event_title') && !this.state.validate.event_title} type="text" className="event_title" defaultValue={item.event_title ? item.event_title : ''} onChange={e => this.validateLength('event_title', e.target.value)}/>
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>

      </Row>
    );
  }
  VideoInformationalVideo = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <CustomSelect values={item.collaborators} callback={values => this.changeItem('collaborators', values)} />
            <FormText>Use tab or enter to add a new Collaborator.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="produced_by">Produced By</Label>
            <CustomSelect values={item.produced_by} callback={values => this.validateLength('produced_by', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('produced_by') && !this.state.validate.produced_by ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new item.</FormText>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  VideoArtworkDocumentation = (): JSX.Element => {
    const item = this.state.changedItem;
    let duration = '';
    if (!!item.duration) {
      // we have to ignore this as it complains that it might be null ... even though we're checking..
      // @ts-ignore
      duration = item.duration.toString().match(/.{1,2}/g).join(':');
    }
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="produced_by">Exhibition History</Label>
            <CustomSelect values={item.exhibited_at} callback={values => this.validateLength('exhibited_at', values)} />
            <FormText>Use tab or enter to add a new Exhibit.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="medium">Medium</Label>
            <Input
              type="text"
              className="medium"
              defaultValue={item.medium ? item.medium : ''}
              onChange={e => this.validateLength('medium', e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="duration">Duration (Hour : Minute : Second)</Label>
            <TimeField
              value={duration}
              colon=":"
              showSeconds
              onChange={e => this.changeItem('duration', e.split(':').join(''))}
              input={<Input type="text" placeholder="HH:MM:SS" />}
            />
          </FormGroup>
        </Col>

      </Row>
    );
  }
  VideoOther = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <CustomSelect values={item.authors} callback={values => this.validateLength('authors', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('authors') && !this.state.validate.authors ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Author.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <CustomSelect values={item.collaborators} callback={values => this.changeItem('collaborators', values)} />
            <FormText>Use tab or enter to add a new Collaborator.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="organisation">Organisation(s)</Label>
            <Input
              type="text"
              className="organisation"
              required
              defaultValue={item.organisation ? item.organisation : ''}
              onChange={e => this.changeItem('organisation', [e.target.value])}
            />
          </FormGroup>
        </Col>
      </Row>
    );
  }

  // ITEM IMAGE
  ItemImageDrawing = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="dimensions">Physical Dimensions</Label>
            <Input
              type="text"
              className="dimensions"
              defaultValue={item.dimensions ? item.dimensions : ''}
              onChange={e => this.validateLength('dimensions', e.target.value)}
              invalid={this.state.validate.hasOwnProperty('dimensions') && !this.state.validate.dimensions}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="exhibited_at">Exhibited At</Label>
            <CustomSelect values={item.exhibited_at} callback={values => this.validateLength('exhibited_at', values)} />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  ItemImage = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="medium">Medium</Label>
            <Input
              type="text"
              className="medium"
              defaultValue={item.medium ? item.medium : ''}
              onChange={e => this.validateLength('medium', e.target.value)}
              invalid={this.state.validate.hasOwnProperty('medium') && !this.state.validate.medium}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="dimensions">Physical Dimensions</Label>
            <Input
              type="text"
              className="dimensions"
              defaultValue={item.dimensions ? item.dimensions : ''}
              onChange={e => this.validateLength('dimensions', e.target.value)}
              invalid={this.state.validate.hasOwnProperty('dimensions') && !this.state.validate.dimensions}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="exhibited_at">Exhibited At</Label>
            <CustomSelect values={item.exhibited_at} callback={values => this.validateLength('exhibited_at', values)} />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  ItemImagePhotographSculpturePaintingDrawing = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="medium">Medium</Label>
            <Input
              type="text"
              className="medium"
              defaultValue={item.medium ? item.medium : ''}
              onChange={e => this.validateLength('medium', e.target.value)}
              invalid={this.state.validate.hasOwnProperty('medium') && !this.state.validate.medium}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="dimensions">Physical Dimensions</Label>
            <Input
              type="text"
              className="dimensions"
              defaultValue={item.dimensions ? item.dimensions : ''}
              onChange={e => this.validateLength('dimensions', e.target.value)}
              invalid={this.state.validate.hasOwnProperty('dimensions') && !this.state.validate.dimensions}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="exhibited_at">Exhibited At</Label>
            <CustomSelect values={item.exhibited_at} callback={values => this.changeItem('exhibited_at', values)} />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="Provenance">Provenance</Label>
            <CustomSelect values={item.provenance} callback={values => this.changeItem('provenance', values)} />
            <FormText>Use tab or enter to add a new Provenance.</FormText>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  ItemDigitalArtOther = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="medium">Medium</Label>
            <Input type="text" className="medium" defaultValue={item.medium ? item.medium : ''} onChange={e => this.changeItem('medium', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="dimensions">Dimensions</Label>
            <Input type="text" className="dimensions" defaultValue={item.dimensions ? item.dimensions : ''} onChange={e => this.changeItem('dimensions', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="exhibited_at">Exhibited At</Label>
            <CustomSelect values={item.exhibited_at} callback={values => this.validateLength('exhibited_at', values)} />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  ImageResearch = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="medium">Medium</Label>
            <Input type="text" className="medium" defaultValue={item.medium ? item.medium : ''} onChange={e => this.changeItem('medium', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="dimensions">Dimensions</Label>
            <Input type="text" className="dimensions" defaultValue={item.dimensions ? item.dimensions : ''} onChange={e => this.changeItem('dimensions', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <CustomSelect values={item.collaborators} callback={values => this.changeItem('collaborators', values)} />
            <FormText>Use tab or enter to add a new Collaborator.</FormText>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  ImageGraphics = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="medium">Medium</Label>
            <Input
              type="text"
              className="medium"
              defaultValue={item.medium ? item.medium : ''}
              onChange={e => this.validateLength('medium', e.target.value)}
              invalid={this.state.validate.hasOwnProperty('medium') && !this.state.validate.medium}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="dimensions">Dimensions</Label>
            <Input
              type="text"
              className="dimensions"
              defaultValue={item.dimensions ? item.dimensions : ''}
              onChange={e => this.validateLength('dimensions', e.target.value)}
              invalid={this.state.validate.hasOwnProperty('dimensions') && !this.state.validate.dimensions}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="exhibited_at">Exhibited At</Label>
            <CustomSelect values={item.exhibited_at} callback={values => this.validateLength('exhibited_at', values)} />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="created_for">Created For</Label>
            <Input type="text" className="created_for" defaultValue={item.created_for ? item.created_for : ''} onChange={e => this.changeItem('created_for', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  ImageMap = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="medium">Medium</Label>
            <Input
              type="text"
              className="medium"
              defaultValue={item.medium ? item.medium : ''}
              onChange={e => this.validateLength('medium', e.target.value)}
              invalid={this.state.validate.hasOwnProperty('medium') && !this.state.validate.medium}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="projection">Projection</Label>
            <Input type="text" className="projection" defaultValue={item.projection ? item.projection : ''} onChange={e => this.changeItem('projection', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="location">Coordinates (Lat, Lng)</Label>
            <Input type="text" className="location" defaultValue={item.location ? item.location : ''} onChange={e => this.changeItem('location', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="exhibited_at">Exhibited At</Label>
            <CustomSelect values={item.exhibited_at} callback={values => this.validateLength('exhibited_at', values)} />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  ImageFilmStill = (): JSX.Element => {
    const item = this.state.changedItem;

    let duration = '';
    if (!!item.duration) {
      // we have to ignore this as it complains that it might be null ... even though we're checking..
      // @ts-ignore
      duration = item.duration.toString().match(/.{1,2}/g).join(':');
    }

    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="directors">Director</Label>
            <CustomSelect values={item.directors} callback={values => this.validateLength('directors', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('directors') && !this.state.validate.directors ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Director.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="writers">Writer</Label>
            <CustomSelect values={item.writers} callback={values => this.validateLength('writers', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('writers') && !this.state.validate.writers ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Writer.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <CustomSelect values={item.collaborators} callback={values => this.changeItem('collaborators', values)} />
            <FormText>Use tab or enter to add a new Collaborator.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="genre">Genre</Label>
            <Input type="text" className="genre" defaultValue={item.genre ? item.genre : ''} onChange={e => this.changeItem('genre', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="cast_">Cast</Label>
            <CustomSelect values={item.cast_} callback={values => this.changeItem('cast_', values)} />
            <FormText>Use tab or enter to add a new cast member.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="duration">Minute : Second</Label>
            <TimeField
              value={duration}
              colon=":"
              showSeconds
              onChange={e => this.changeItem('duration', e.split(':').join(''))}
              input={<Input type="text" placeholder="HH:MM:SS" />}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="screened_at">Screened At</Label>
            <Input type="text" className="screened_at" defaultValue={item.screened_at ? item.screened_at : ''} onChange={e => this.changeItem('screened_at', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }

  // ITEM AUDIO
  AudioFieldRecording = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="recording_technique">Recording Technique</Label>
            <Input type="text" className="recording_technique" defaultValue={item.recording_technique ? item.recording_technique : ''} onChange={e => this.changeItem('recording_technique', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="exhibited_at">Exhibited At</Label>
            <CustomSelect values={item.exhibited_at} callback={values => this.validateLength('exhibited_at', values)} />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  AudioSoundArt = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="performers">Performer(s)</Label>
            <CustomSelect values={item.performers} callback={values => this.validateLength('performers', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('performers') && !this.state.validate.performers ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Performer.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="original_sound_credit">Original Sounds Credit</Label>
            <Input type="text" className="original_sound_credit" defaultValue={item.original_sound_credit ? item.original_sound_credit : ''} onChange={e => this.changeItem('original_sound_credit', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="exhibited_at">Exhibited At</Label>
            <CustomSelect values={item.exhibited_at} callback={values => this.validateLength('exhibited_at', values)} />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  AudioMusic = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="performers">Performer(s)</Label>
            <CustomSelect values={item.performers} callback={values => this.validateLength('performers', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('performers') && !this.state.validate.performers ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Performer.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="record_label">Recording Studio</Label>
            <Input type="text" className="record_label" defaultValue={item.record_label ? item.record_label : ''} onChange={e => this.changeItem('record_label', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="recording_studio">Recording Label</Label>
            <Input type="text" className="recording_studio" defaultValue={item.recording_studio ? item.recording_studio : ''} onChange={e => this.changeItem('recording_studio', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  AudioPodcast = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="series_name">Series Name</Label>
            <Input type="text" className="series_name" defaultValue={item.series_name ? item.series_name : ''} onChange={e => this.changeItem('series_name', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="episode_name">Episode Name</Label>
            <Input
              type="text"
              className="episode_name"
              defaultValue={item.episode_name ? item.episode_name : ''}
              onChange={e => this.validateLength('episode_name', e.target.value)}
              invalid={this.state.validate.hasOwnProperty('episode_name') && !this.state.validate.episode_name}
            />
            <FormFeedback>This is a required field</FormFeedback>

          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="episode_number">Episode Number</Label>
            <Input type="text" className="episode_number" defaultValue={item.episode_number ? item.episode_number.toString() : ''} onChange={e => this.changeItem('episode_number', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <FormGroup>
              <Label for="speakers">Speakers(s)</Label>
              <CustomSelect values={item.speakers} callback={values => this.validateLength('speakers', values)} />
              <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('speakers') && !this.state.validate.speakers ? 'block' : 'none') }}>This is a required field</FormFeedback>
              <FormText>Use tab or enter to add a new Speaker.</FormText>
            </FormGroup>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  AudioLecture = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="lecturer">Lecturer</Label>
            <Input type="text" className="lecturer" defaultValue={item.lecturer ? item.lecturer : ''} onChange={e => this.changeItem('lecturer', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="host_organisation">Organization</Label>
            <CustomSelect values={item.host_organisation} callback={values => this.validateLength('host_organisation', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('host_organisation') && !this.state.validate.host_organisation ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Organization.</FormText>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  AudioInterview = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="interviewers">Interviewer</Label>
            <CustomSelect values={item.interviewers} callback={values => this.validateLength('interviewers', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('interviewers') && !this.state.validate.interviewers ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Interviewer.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="interviewees">Interviewee(s)</Label>
            <CustomSelect values={item.interviewees} callback={values => this.validateLength('interviewees', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('interviewees') && !this.state.validate.interviewees ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Interviewee(s).</FormText>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  AudioRadio = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="series_name">Series Name</Label>
            <Input type="text" className="series_name" defaultValue={item.series_name ? item.series_name : ''} onChange={e => this.changeItem('series_name', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="recording_name">Recording Name</Label>
            <Input
              type="text"
              className="recording_name"
              defaultValue={item.recording_name ? item.recording_name : ''}
              onChange={e => this.validateLength('recording_name', e.target.value)}
              invalid={this.state.validate.hasOwnProperty('recording_name') && !this.state.validate.recording_name}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="episode_number">Episode Number</Label>
            <Input type="text" className="episode_number" defaultValue={item.episode_number ? item.episode_number.toString() : ''} onChange={e => this.changeItem('episode_number', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="speakers">Speakers(s)</Label>
            <CustomSelect values={item.speakers} callback={values => this.changeItem('speakers', values)} />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="radio_station">Radio Station</Label>
            <Input type="text" className="radio_station" defaultValue={item.radio_station ? item.radio_station.join(',') : ''} onChange={e => this.changeItem('radio_station', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  AudioPerformancePoetry  = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="performers">Performer</Label>
            <CustomSelect values={item.performers} callback={values => this.validateLength('performers', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('performers') && !this.state.validate.performers ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Performer.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="original_text_credit">Original Text Credit</Label>
            <Input type="text" className="original_text_credit" defaultValue={item.original_text_credit ? item.original_text_credit : ''} onChange={e => this.changeItem('original_text_credit', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="host_organisation">Organization</Label>
            <CustomSelect values={item.host_organisation} callback={values => this.validateLength('host_organisation', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('host_organisation') && !this.state.validate.host_organisation ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Organization.</FormText>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  AudioOther  = (): JSX.Element => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <CustomSelect values={item.authors} callback={values => this.changeItem(values, 'authors')} />
            <FormText>Use tab or enter to add a new Author.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <CustomSelect values={item.collaborators} callback={values => this.changeItem('collaborators', values)} />
            <FormText>Use tab or enter to add a new Collaborator.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="organisation">Organisation(s)</Label>
            <Input type="text" className="organisation" defaultValue={item.organisation ? item.organisation : ''} onChange={e => this.changeItem('organisation', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }

  render() {
    const
      item = this.state.changedItem,
      conceptTags = item.aggregated_concept_tags ? item.aggregated_concept_tags.map( t => ({ id: t.id, value: t.id, label: t.tag_name }) ) : [],
      keywordTags = item.aggregated_keyword_tags ? item.aggregated_keyword_tags.map( t => ({ id: t.id, value: t.id, label: t.tag_name }) ) : [],
      selectedRegions = !!item.regions ? selectableRegions.filter(s => !!item.regions ? item.regions.find(a => a === s.value) : false) : [];

    if (this.state.hideForm) {
      return (
        <>
          <WarningMessage message={this.state.warningMessage} />
          <ErrorMessage message={this.state.errorMessage} />
          <SuccessMessage message={this.state.successMessage} />
        </>
      );
    }

    return (
      <Form className="container-fluid itemEditor">
        <div className={`overlay ${this.state.isLoading ? 'show' : ''}`} />
        <Row>
          <Col xs="12">
            <WarningMessage message={this.state.warningMessage} />
            <ErrorMessage message={this.state.errorMessage} />
            <SuccessMessage message={this.state.successMessage} />
          </Col>
        </Row>

        <Row>
          <Col>
            <div className="sticky">
              <Row>
                <Col xs="12" className="text-center">
                  <this.filePreview />
                </Col>
              </Row>

              <Row>
                <Col xs="8">
                  <InputGroup>
                    <CustomInput type="switch" id={`${this.state.originalItem.s3_key}_oa_highlight`} name="OA_highlight" label="OA Highlight" checked={this.state.changedItem.oa_highlight || false} onChange={e => this.changeItem('oa_highlight', e.target.checked)} />
                  </InputGroup>
                  <InputGroup>
                    <CustomInput type="switch" id={`${this.state.originalItem.s3_key}_oa_original`} name="OA_original" label="OA Original" checked={this.state.changedItem.oa_original || false} onChange={e => this.changeItem('oa_original', e.target.checked)} />
                  </InputGroup>
                  <InputGroup>
                    <CustomInput type="switch" id={`${this.state.originalItem.s3_key}_tba21_material`} name="TBA21_material" label="TBA21 Material" checked={this.state.changedItem.tba21_material || false} onChange={e => this.changeItem('tba21_material', e.target.checked)} />
                  </InputGroup>
                </Col>
                <Col xs="4">
                  <UncontrolledButtonDropdown className="float-right">
                    <Button className="caret" onClick={this.updateItem} disabled={!this.state.isDifferent}>Save</Button>
                    <DropdownToggle caret />
                    <DropdownMenu>
                      {this.state.originalItem.status ?
                        <DropdownItem onClick={() => { this.changeItem('status', false, () => this.updateItem() ); }}>Unpublish</DropdownItem>
                        :
                        <DropdownItem onClick={() => { this.changeItem('status', true, () => this.updateItem() ); }}>Publish</DropdownItem>
                      }
                    </DropdownMenu>
                  </UncontrolledButtonDropdown>
                </Col>
              </Row>
            </div>
          </Col>

          <Col md="8">
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={this.state.activeTab === '1' ? 'active' : ''}
                  onClick={() => { if (this._isMounted) { this.setState({ activeTab: '1' }); }}}
                >
                  Details
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="1">
                <Row>
                  <Col xs="12">
                    <FormGroup>
                      <Label for="title">Title</Label>
                      <Input
                        className="title"
                        defaultValue={item.title ? item.title : ''}
                        placeholder="Please Enter A Title"
                        onChange={e => this.validateLength('title', e.target.value)}
                        required
                        invalid={this.state.validate.hasOwnProperty('title') && !this.state.validate.title}
                      />
                      <FormFeedback>This is a required field</FormFeedback>

                      <ShortPaths
                        type="Item"
                        id={item.id ? item.id : undefined}
                      />

                    </FormGroup>
                  </Col>

                  <Col xs="12">
                    <FormGroup>
                      <Label for="description">Description</Label>
                      <Input
                        type="textarea"
                        className="description"
                        defaultValue={item.description ? item.description : ''}
                        onChange={e => this.validateLength('description', e.target.value)}
                        invalid={this.state.validate.hasOwnProperty('description') && !this.state.validate.description}
                      />
                      <FormFeedback>This is a required field</FormFeedback>
                    </FormGroup>

                    <FormGroup>
                      <Label for="time_produced">Date Produced</Label>
                      <Input
                        type="date"
                        className="time_produced"
                        defaultValue={item.time_produced ? new Date(item.time_produced).toISOString().substr(0, 10) : ''}
                        onChange={e => {
                          this.validateLength('time_produced', e.target.value);
                          if (e.target.value && e.target.value.length) {
                            this.validateLength('year_produced', new Date(e.target.value).getFullYear());
                          }
                        }}
                      />

                      <Label for="year_produced">Year Produced</Label>
                      <YearSelect
                        value={item.year_produced}
                        callback={e => this.validateLength('year_produced', e)}
                      />

                      <FormFeedback
                        style={
                          (this.state.validate.hasOwnProperty('time_produced') && this.state.validate.time_produced) ||
                          (this.state.validate.hasOwnProperty('year_produced') && this.state.validate.year_produced) ? {display: 'none'}
                            : {display: 'block'}
                        }
                      >
                        You must select either a Date and/or a Year produced.
                      </FormFeedback>
                    </FormGroup>

                    <FormGroup>
                      <Label for="creators">Creator(s)</Label>
                      <CustomSelect values={!!item.creators ? item.creators : []} callback={values => this.validateLength('creators', values)} />
                      <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('creators') && !this.state.validate.creators ? 'block' : 'none') }}>This is a required field</FormFeedback>
                      <FormText>Use tab or enter to add a new Creator.</FormText>
                    </FormGroup>

                    <FormGroup>
                      <Label for="regions">Region(s) (Country/Ocean)</Label>
                      <Select className="select" classNamePrefix="select" isMulti isSearchable menuPlacement="auto" options={[ { label: 'Oceans', options: oceans }, { label: 'Countries', options: countries } ]} defaultValue={selectedRegions} onChange={e => this.validateLength('regions', !!e && e.length ? e.map(r => r.value) : [])} />
                      <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('regions') && !this.state.validate.regions ? 'block' : 'none') }}>This is a required field</FormFeedback>
                    </FormGroup>

                    <FormGroup>
                      <Label for="language">Language</Label>
                      <Select menuPlacement="auto" className="select language" classNamePrefix="select" options={languages} value={item.language ? languages.find( c => c.value === item.language ) : []} onChange={e => this.changeItem('language', e.value)} isSearchable/>
                    </FormGroup>

                    <FormGroup>
                      <Label for="sub_type">Object Category</Label>
                      <this.SubType />
                      <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('item_subtype') && !this.state.validate.item_subtype ? 'block' : 'none') }}>This is a required field</FormFeedback>
                    </FormGroup>

                    {/* Item Text */}
                    {item.item_subtype === itemText.Academic_Publication ? <this.TextAcademicPublication /> : <></>}
                    {item.item_subtype === itemText.Article ? <this.TextArticle /> : <></>}
                    {item.item_subtype === itemText.News ? <this.TextNews /> : <></>}
                    {item.item_subtype === itemText.Policy_Paper ? <this.TextPolicyPaperReport /> : <></>}
                    {item.item_subtype === itemText.Report ? <this.TextPolicyPaperReport /> : <></>}
                    {item.item_subtype === itemText.Book ? <this.TextBook /> : <></>}
                    {item.item_subtype === itemText.Essay ? <this.TextEssay /> : <></>}
                    {item.item_subtype === itemText.Historical_Text ? <this.TextHistoricalText /> : <></>}
                    {item.item_subtype === itemText.Event_Press ? <this.TextEventPress /> : <></>}
                    {item.item_subtype === itemText.Toolkit ? <this.TextToolkit /> : <></>}
                    {(!!item.file && (item.file.type === 'text' || item.file.type === 'pdf' || item.file.type === 'downloadText')) && item.item_subtype === itemText.Other ? <this.TextOther /> : <></>}

                    {/* Item Video */}
                    {item.item_subtype === itemVideo.Video ? <this.Video /> : <></>}
                    {item.item_subtype === itemVideo.Movie ? <this.VideoMovieTrailer /> : <></>}
                    {item.item_subtype === itemVideo.Documentary ? <this.VideoDocumentaryArt /> : <></>}
                    {(!!item.file && item.file.type === 'video') && item.item_subtype === itemVideo.Research ? <this.VideoResearch /> : <></>}
                    {(!!item.file && item.file.type === 'video') && item.item_subtype === itemVideo.Interview ? <this.VideoInterview /> : <></>}
                    {item.item_subtype === itemVideo.Art ? <this.VideoDocumentaryArt /> : <></>}
                    {item.item_subtype === itemVideo.News_Journalism ? <this.VideoNewsJournalism /> : <></>}
                    {item.item_subtype === itemVideo.Event_Recording ? <this.VideoEventRecording /> : <></>}
                    {item.item_subtype === itemVideo.Lecture_Recording ? <this.VideoLectureRecording /> : <></>}
                    {item.item_subtype === itemVideo.Informational_Video ? <this.VideoInformationalVideo /> : <></>}
                    {item.item_subtype === itemVideo.Trailer ? <this.VideoMovieTrailer /> : <></>}
                    {((item.item_subtype === itemVideo.Video_Artwork_Documentation) && (!!item.file && item.file.type === 'video')) ? <this.VideoArtworkDocumentation /> : <></>}
                    {(!!item.file && item.file.type === 'video') && item.item_subtype === itemVideo.Other ? <this.VideoOther /> : <></>}

                    {/*Item Image */}
                    {item.item_subtype === itemImage.Illustration ?  <this.ItemImage /> : <></>}
                    {(item.item_subtype === itemImage.Artwork_Documentation) && (!!item.file && item.file.type === 'image') ?  <this.ItemImage /> : <></>}

                    {
                      item.item_subtype === itemImage.Photograph ||
                      item.item_subtype === itemImage.Sculpture ||
                      item.item_subtype === itemImage.Drawing ||
                      item.item_subtype === itemImage.Painting ? <this.ItemImagePhotographSculpturePaintingDrawing /> : <></>
                    }

                    {
                      item.item_subtype === itemImage.Digital_Art ||
                      (!!item.file && item.file.type === 'image' && item.item_subtype === itemImage.Other) ? <this.ItemDigitalArtOther />
                        : <></>
                    }

                    {(!!item.file && item.file.type === 'image') && item.item_subtype === itemImage.Research ? <this.ImageResearch /> : <></>}
                    {item.item_subtype === itemImage.Graphics ? <this.ImageGraphics /> : <></>}
                    {item.item_subtype === itemImage.Map ? <this.ImageMap /> : <></>}
                    {item.item_subtype === itemImage.Film_Still ? <this.ImageFilmStill /> : <></>}

                    {/* Item Audio */}
                    {item.item_subtype === itemAudio.Field_Recording ? <this.AudioFieldRecording /> : <></>}
                    {item.item_subtype === itemAudio.Sound_Art ? <this.AudioSoundArt /> : <></>}
                    {item.item_subtype === itemAudio.Music ? <this.AudioMusic /> : <></>}
                    {item.item_subtype === itemAudio.Podcast ? <this.AudioPodcast /> : <></>}
                    {item.item_subtype === itemAudio.Lecture ? <this.AudioLecture /> : <></>}
                    {(!!item.file && item.file.type === 'audio') && item.item_subtype === itemAudio.Interview ? <this.AudioInterview /> : <></>}
                    {item.item_subtype === itemAudio.Radio ? <this.AudioRadio /> : <></>}
                    {item.item_subtype === itemAudio.Performance_Poetry ? <this.AudioPerformancePoetry /> : <></>}
                    {(!!item.file && item.file.type === 'audio') && item.item_subtype === itemAudio.Other ? <this.AudioOther /> : <></>}

                    <FormGroup>
                      <Label for="license_type">License</Label>
                      <Select menuPlacement="auto" className="select license_type" classNamePrefix="select" options={licenseType} value={item.license ? {value: item.license, label: item.license} : { value: License.LOCKED, label: License.LOCKED }} onChange={e => this.changeItem('license', e.label)} isSearchable/>
                    </FormGroup>

                    <FormGroup>
                      <Label for="copyright_holder">Copyright Owner</Label>
                      <Input type="text" className="copyright_holder" defaultValue={item.copyright_holder ? item.copyright_holder : ''} onChange={e => this.changeItem('copyright_holder', e.target.value)}/>
                    </FormGroup>

                    <FormGroup>
                      <Label for="url">Original URL</Label>
                      <Input
                        type="url"
                        className="url"
                        defaultValue={item.url ? item.url : ''}
                        invalid={this.state.validate.hasOwnProperty('url') && !this.state.validate.url}
                        onChange={e => {
                          const value = e.target.value;
                          let valid = validateURL(value);
                          if (!value) { valid = true; } // set valid to true for no content
                          if (valid) { this.changeItem('url', value); } // if valid set the data in changedItem
                          if (!this._isMounted) { return; }
                          this.setState({ validate: { ...this.state.validate, url: valid } });
                        }}
                      />
                      <FormFeedback>Not a valid URL</FormFeedback>
                    </FormGroup>

                    <FormGroup>
                      <Label for="concept_tags">Concept Tag(s)</Label>
                      <Tags
                        className="concept_tags"
                        type="concept"
                        defaultValues={conceptTags}
                        callback={tags => {
                          const tagList = tags ? tags.map(tag => ({id: tag.id, tag_name: tag.label})) : [];
                          this.validateLength('concept_tags', tags ? tags.map(tag => tag.id) : []);
                          if (this._isMounted) {
                            const { originalItem, changedItem } = this.state;
                            this.setState({
                              originalItem: {...originalItem, aggregated_concept_tags: tagList},
                              changedItem: {...changedItem, aggregated_concept_tags: tagList}
                            });
                          }
                        }}
                      />
                      <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('concept_tags') && !this.state.validate.concept_tags ? 'block' : 'none') }}>This is a required field</FormFeedback>
                    </FormGroup>

                    <FormGroup>
                      <Label for="keyword_tags">Keyword Tag(s)</Label>
                      <Tags
                        className="keyword_tags"
                        type="keyword"
                        defaultValues={keywordTags}
                        loadItemRekognitionTags={!keywordTags.length ? this.state.originalItem.s3_key : ''}
                        callback={tags => {
                          const tagList = tags ? tags.map(tag => ({id: tag.id, tag_name: tag.label})) : [];
                          this.validateLength('keyword_tags', tags ? tags.map(tag => tag.id) : []);
                          if (this._isMounted) {
                            const { originalItem, changedItem } = this.state;
                            this.setState({
                              originalItem: {...originalItem, aggregated_keyword_tags: tagList},
                              changedItem: {...changedItem, aggregated_keyword_tags: tagList}
                            });
                          }
                        }}
                      />
                    </FormGroup>

                    <FormGroup>
                      <legend>Focus</legend>
                      {
                        (item.focus_arts === null || item.focus_arts === '0') &&
                        (item.focus_scitech === null || item.focus_scitech === '0') &&
                        (item.focus_action === null || item.focus_action === '0') ?
                          <FormFeedback style={{display: 'block'}}>You need to select at least one Focus area.</FormFeedback>
                          : <></>
                      }
                    </FormGroup>
                    <FormGroup row className="my-0 align-items-center">
                      <Label for={`${item.s3_key}_focus_arts`} sm="2">Art</Label>
                      <Col sm="10">
                        <CustomInput type="checkbox" id={`${item.s3_key}_focus_arts`} defaultChecked={item.focus_arts !== null && parseInt(item.focus_arts, 0) > 0} onChange={e => this.changeItem('focus_arts', e.target.checked ? '1' : '0')}/>
                      </Col>
                    </FormGroup>
                    <FormGroup row className="my-0 align-items-center">
                      <Label for={`${item.s3_key}_focus_scitech`} sm="2">Sci-Tech</Label>
                      <Col sm="10">
                        <CustomInput type="checkbox" id={`${item.s3_key}_focus_scitech`} defaultChecked={item.focus_scitech !== null && parseInt(item.focus_scitech, 0) > 0} onChange={e => this.changeItem('focus_scitech', !e.target.checked ? '0' : '1')}/>
                      </Col>
                    </FormGroup>
                    <FormGroup row className="my-0 align-items-center">
                      <Label for={`${item.s3_key}_focus_action`} sm="2">Action</Label>
                      <Col sm="10">
                        <CustomInput type="checkbox" id={`${item.s3_key}_focus_action`} defaultChecked={item.focus_action !== null && parseInt(item.focus_action, 0) > 0} onChange={e => this.changeItem('focus_action', !e.target.checked ? '0' : '1')}/>
                      </Col>
                    </FormGroup>

                  </Col>
                </Row>

              </TabPane>
            </TabContent>
          </Col>
        </Row>
      </Form>
    );
  }
}
