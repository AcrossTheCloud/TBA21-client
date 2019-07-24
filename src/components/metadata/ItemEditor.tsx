import * as React from 'react';
import $ from 'jquery';
import {
  Button,
  Col,
  CustomInput,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormFeedback,
  FormGroup, FormText,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  UncontrolledButtonDropdown
} from 'reactstrap';

import '../../../node_modules/react-datepicker/dist/react-datepicker.min.css';

import { API } from 'aws-amplify';
import Select from 'react-select';
import { isEqual } from 'lodash';

import {
  Item,
  itemAudio,
  itemImage,
  itemText,
  itemVideo
} from '../../types/Item';
import {
  countries,
  itemAudioSubTypes,
  itemImageSubTypes,
  itemTextSubTypes,
  itemVideoSubTypes,
  licenseType,
  oceans
} from './SelectOptions';

import Tags from './Tags';
import { sdkGetObject } from '../utils/s3File';
import { Alerts, ErrorMessage, SuccessMessage, WarningMessage } from '../utils/alerts';
import { AudioPlayer } from '../utils/AudioPlayer';

import pencil from 'images/svgs/pencil.svg';
import 'styles/components/metadata/itemEditor.scss';

interface Props {
  item: Item;
}

interface State extends Alerts {
  item: Item;
  filePreview?: JSX.Element;
  isLoading: boolean;
  hideForm: boolean;

  activeTab: string;

  validate: {
    [key: string]: boolean
  };
}

interface UIEditing {
  editingTitle?: boolean;
}

export class ItemEditor extends React.Component<Props, State> {
  _isMounted;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;

    this.state = {
      originalItem: props.item,
      changedItem: {...props.item},
      changedItemFields: {},
      isDifferent: false,
      isLoading: true,
      hideForm: false,
      activeTab: '1',
      validate: {}
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
      const response = await API.get('tba21', 'admin/items/getByS3Key', {
        queryStringParameters : {
          s3Key: this.props.item.s3_key
        }
      });

      if (response.item && Object.keys(response.item).length) {
        const getFileResult = await sdkGetObject(this.state.originalItem.s3_key);
        const data = {
          originalItem: { ...response.item, file: getFileResult },
          changedItem: { ...response.item, file: getFileResult, item_type: (getFileResult && getFileResult.item_type) ? getFileResult.item_type.substr(0, 1).toUpperCase() : null }
        }
        Object.assign(state, data);
      } else {
        Object.assign(state, { errorMessage: 'No item by that name.', hideForm: true });
      }
    } catch (e) {
      Object.assign(state, { errorMessage: `${e}` });
    } finally {
      this.setState(state);
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
        { file, title, s3_key, image_hash } = this.state.originalItem,
        warning = <WarningMessage message={'Unable to load file.'}/>;
      if (file && file.url) {
        if (file.type === 'image') {
          return <img className="img-fluid" src={file.url} alt={title ? title : s3_key}/>;
        } else if (file.type === 'audio') {
          return <AudioPlayer id={image_hash || s3_key} url={file.url} />;
        } else {
          return warning;
        }
        // Handle other file types here.
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
      };

    try {
      const itemsProperties = {};

      // We filter out specific values here as the API doesn't accept them, but returns them in the Item object.
      Object.entries(this.state.changedItemFields)
        .filter( ([key, value]) => {
          return !(
            value === null
            // || key === 'id' // use this to exclude things, you shouldn't need to (eg don't put them in changedItemFields...
          );
        })
        .forEach( tag => {
          Object.assign(itemsProperties, { [tag[0]]: tag[1] });
        });

      // Assign s3_key
      Object.assign(itemsProperties, { 's3_key': this.state.originalItem.s3_key });

      const result = await API.put('tba21', 'admin/items/update', {
        body: {
          ...itemsProperties
        }
      });

      if (!result.success && result.message && result.message.length > 1) {
        // If we've failed set ChangedItem back to the original
        Object.assign(state, { errorMessage: result.message, changedItem: {...this.state.originalItem}, changedItemFields: {}, status: false, isDifferent: false });
      } else if (result.success) {
        Object.assign(state, { successMessage: 'Updated item!', changedItemFields: {}, originalItem: {...this.state.changedItem}, isDifferent: false });
      } else {
        Object.assign(state, { warningMessage: result });
      }

    } catch (e) {
      console.log(e);
      Object.assign(state, { errorMessage: 'We had an issue updating this item.' });
    } finally {
      this.setState(state);
    }
  }

  /**
   *
   * Adds changed values to ChangedItem and ChangedItemFields
   * Compares props.item to changedItem and enables/disabled Update button
   *
   * @param key { string }
   * @param value { any }
   */
  changeItem = (key: string, value: any) => { // tslint:disable-line: no-any
    const { changedItem, changedItemFields } = this.state;

    if (value) {
      Object.assign(changedItemFields, { [key]: value });
      Object.assign(changedItem, { [key]: value });
    } else {
      if (changedItemFields[key]) {
        delete changedItemFields[key];
        // Reset back to original item key value
        Object.assign(changedItem, { [key]: this.state.originalItem[key] });
      }
    }
    this.setState(
      {
        changedItemFields: changedItemFields,
        changedItem: changedItem,
        isDifferent: !isEqual(this.state.originalItem, changedItem)
      }
    );
  }

  SubType = (): JSX.Element => {
    let options: {[value: string]: string}[] = [];

    // If we can't get the file at all, for whatever reason, show all types.
    if (!this.state.originalItem.file) {
      options.push(...itemTextSubTypes, ...itemVideoSubTypes, ...itemImageSubTypes, ...itemAudioSubTypes);
    } else if (this.state.originalItem.file.type === 'text') {
      options = itemTextSubTypes;
    } else if (this.state.originalItem.file.type === 'video') {
      options = itemVideoSubTypes;
    } else if (this.state.originalItem.file.type === 'audio') {
      options = itemAudioSubTypes;
    } else if (this.state.originalItem.file.type === 'image') {
      options = itemImageSubTypes;
    }

    return <Select id="item_subtype" options={options} value={[options.find( o => o.label === this.state.changedItem.item_subtype)]} onChange={e => this.changeItem('item_subtype', e.value)} isSearchable/>;
  }

  validateURL = (url: string): boolean => {
    return /^(?:(http|ftp|sftp)(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/.test(url);
  }

  // ITEM TEXT
  TextAcademicPublication = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <Input
              type="text"
              className="authors"
              required={true}
              defaultValue={item.authors ? item.authors : ''}
              invalid={this.state.validate.hasOwnProperty('authors') && !this.state.validate.authors}
              onChange={e => {
                const value = e.target.value.split(',').filter(i => i.length).map(i => i.trim()); // split on , and filter out any array items without a length and trim
                let valid = value.length > 0;
                if (!value) { valid = false; }
                if (valid) { this.changeItem('authors', value); } // if valid set the data in changedItem
                this.setState({ validate: { ...this.state.validate, authors: valid } });
              }}
            />
            <FormFeedback>This is a required field</FormFeedback>
            <FormText>Use , (comma) as a delimiter per author.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="subtitle">Subtitle</Label>
            <Input
              type="text"
              className="subtitle"
              required={true}
              defaultValue={item.subtitle ? item.subtitle : ''}
              onChange={e => this.changeItem('subtitle', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col>
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

        <Col md="4">
          <FormGroup>
            <Label for="volume">Volume #</Label>
            <Input type="number" className="volume" defaultValue={this.state.changedItem.volume ? this.state.changedItem.volume.toString() : ''} onChange={e => this.changeItem('volume', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="4">
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

        <Col md="4">
          <FormGroup>
            <Label for="edition">Edition #</Label>
            <Input
              type="number"
              className="edition"
              defaultValue={this.state.changedItem.edition ? this.state.changedItem.edition.toString() : ''}
              onChange={e => this.changeItem('edition', e.target.value)}
              required={false}
            />
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="pages">Pages Count</Label>
            <Input
              type="number"
              className="pages"
              defaultValue={item.pages ? item.pages.toString() : ''}
              onChange={e => this.changeItem('pages', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="pages">DOI</Label>
            <Input
              type="url"
              id="url"
              defaultValue={item.url ? item.url : ''}
              invalid={this.state.validate.hasOwnProperty('url') && !this.state.validate.url}
              onChange={e => {
                const value = e.target.value;
                let valid = /^10.\d{4,9}\/[-._;()/:a-zA-Z0-9]+$/.test(value);
                if (!value) {
                  valid = true;
                } // set valid to true for no content
                if (valid) {
                  this.changeItem('doi', value);
                } // if valid set the data in changedItem
                this.setState({validate: {...this.state.validate, doi: valid}});
              }}
            />
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="isbn">ISBN</Label>
            <Input type="number" className="isbn" defaultValue={this.state.changedItem.isbn ? this.state.changedItem.isbn.toString() : ''} onChange={e => this.changeItem('isbn', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  TextArticle  = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <Input
              type="text"
              className="authors"
              required={true}
              defaultValue={item.authors ? item.authors : ''}
              onChange={e => this.changeItem('authors', e.target.value)}
            />
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
  TextNews = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <Input
              type="text"
              className="authors"
              required={true}
              defaultValue={item.authors ? item.authors : ''}
              onChange={e => this.changeItem('authors', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="subtitle">Subtitle</Label>
            <Input
              type="text"
              className="subtitle"
              required={true}
              defaultValue={item.subtitle ? item.subtitle : ''}
              onChange={e => this.changeItem('subtitle', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col>
          <FormGroup>
            <Label for="news_outlet">News Outlet</Label>
            <Input
              type="text"
              className="news_outlet"
              defaultValue={item.news_outlet ? item.news_outlet : ''}
              onChange={e => this.changeItem('news_outlet', e.target.value)}
            />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  TextPolicyPaperReport = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <Input
              type="text"
              className="authors"
              required={true}
              defaultValue={item.authors ? item.authors : ''}
              onChange={e => this.changeItem('authors', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="host_organization">Organization</Label>
            <Input
              type="text"
              className="host_organization"
              required={true}
              defaultValue={item.host_organization ? item.host_organization : ''}
              onChange={e => this.changeItem('host_organization', e.target.value)}
            />
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
  TextBook = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <Input
              type="text"
              className="authors"
              required={true}
              defaultValue={item.authors ? item.authors : ''}
              onChange={e => this.changeItem('authors', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="subtitle">Subtitle</Label>
            <Input
              type="text"
              className="subtitle"
              required={true}
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

        <Col>
          <FormGroup>
            <Label for="publisher">Publisher</Label>
            <Input
              type="text"
              className="publisher"
              defaultValue={item.publisher ? item.publisher : ''}
              onChange={e => this.changeItem('publisher', e.target.value)}
              required={true}
            />
          </FormGroup>
        </Col>

        <Col>
          <FormGroup>
            <Label for="city_of_publication">City</Label>
            <Input
              type="text"
              className="city_of_publication"
              defaultValue={item.city_of_publication ? item.city_of_publication : ''}
              onChange={e => this.changeItem('city_of_publication', e.target.value)}
              required={true}
            />
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="volume">Volume In Series</Label>
            <Input type="number" className="volume" defaultValue={this.state.changedItem.volume ? this.state.changedItem.volume.toString() : ''} onChange={e => this.changeItem('volume', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="edition">Edition #</Label>
            <Input
              type="number"
              className="edition"
              defaultValue={this.state.changedItem.edition ? this.state.changedItem.edition.toString() : ''}
              onChange={e => this.changeItem('edition', e.target.value)}
              required={true}
            />
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="translated_from">Translated From</Label>
            <Select id="translated_from" options={[]} value={[]} onChange={e => this.changeItem('translated_from', e.value)} isSearchable/>
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="pages">Pages Count</Label>
            <Input
              type="number"
              className="pages"
              defaultValue={item.pages ? item.pages.toString() : ''}
              onChange={e => this.changeItem('pages', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="isbn">ISBN</Label>
            <Input type="number" className="isbn" defaultValue={this.state.changedItem.isbn ? this.state.changedItem.isbn.toString() : ''} onChange={e => this.changeItem('isbn', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="related_isbn">Related ISBN</Label>
            <Input type="number" className="related_isbn" defaultValue={this.state.changedItem.related_isbn ? this.state.changedItem.related_isbn.toString() : ''} onChange={e => this.changeItem('related_isbn', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  TextEssay = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <Input
              type="text"
              className="authors"
              required={true}
              defaultValue={item.authors ? item.authors : ''}
              onChange={e => this.changeItem('authors', e.target.value)}
            />
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
            <Label for="publication_venue">Publication Venue</Label>
            <Input
              type="text"
              className="venues"
              required={true}
              defaultValue={item.venues ? item.venues : ''}
              onChange={e => this.changeItem('venues', [e.target.value])}
            />
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
  TextHistoricalText = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <Input
              type="text"
              className="authors"
              required={true}
              defaultValue={item.authors ? item.authors : ''}
              onChange={e => this.changeItem('authors', e.target.value)}
            />
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
            <Input type="date" id="birth_date" defaultValue={item.birth_date ? item.birth_date : new Date().toISOString().substr(0, 10)} />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="death_date">Day Of Death</Label>
            <Input type="date" id="death_date" defaultValue={item.death_date ? item.death_date : new Date().toISOString().substr(0, 10)} />
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

        <Col md="4">
          <FormGroup>
            <Label for="volume">Volume In Series</Label>
            <Input type="number" className="volume" defaultValue={this.state.changedItem.volume ? this.state.changedItem.volume.toString() : ''} onChange={e => this.changeItem('volume', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col>
          <FormGroup>
            <Label for="publisher">Publisher</Label>
            <Input
              type="text"
              className="publisher"
              defaultValue={item.publisher ? item.publisher : ''}
              onChange={e => this.changeItem('publisher', e.target.value)}
              required={true}
            />
          </FormGroup>
        </Col>

        <Col>
          <FormGroup>
            <Label for="city_of_publication">City</Label>
            <Input
              type="text"
              className="city_of_publication"
              defaultValue={item.city_of_publication ? item.city_of_publication : ''}
              onChange={e => this.changeItem('city_of_publication', e.target.value)}
            />
          </FormGroup>
        </Col>

        <FormGroup>
          <Label for="edition">First Edition</Label>
          <Input
            type="number"
            className="edition"
            defaultValue={item.edition ? item.edition.toString() : ''}
            onChange={e => this.changeItem('edition', e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label for="edition_uploaded">Edition Uploaded</Label>
          <Input
            type="number"
            className="edition_uploaded"
            defaultValue={item.edition_uploaded ? item.edition_uploaded.toString() : ''}
            onChange={e => this.changeItem('edition_uploaded', e.target.value)}
          />
        </FormGroup>

        <Col md="4">
          <FormGroup>
            <Label for="translated_from">Translated From</Label>
            <Select id="translated_from" options={[]} value={[]} onChange={e => this.changeItem('translated_from', e.value)} isSearchable/>
          </FormGroup>
        </Col>

        <Col md="4">
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

        <Col md="4">
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

        <Col md="4">
          <FormGroup>
            <Label for="isbn">ISBN</Label>
            <Input type="number" className="isbn" defaultValue={this.state.changedItem.isbn ? this.state.changedItem.isbn.toString() : ''} onChange={e => this.changeItem('isbn', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="related_isbn">Related ISBN</Label>
            <Input type="number" className="related_isbn" defaultValue={this.state.changedItem.related_isbn ? this.state.changedItem.related_isbn.toString() : ''} onChange={e => this.changeItem('related_isbn', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  TextEventPress = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <Input
              type="text"
              className="authors"
              required={true}
              defaultValue={item.authors ? item.authors : ''}
              onChange={e => this.changeItem('authors', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="curator">Host/Artist/Curator Of Event</Label>
            <Input
              type="text"
              className="curator"
              defaultValue={item.curator ? item.curator : ''}
              onChange={e => this.changeItem('curator', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="institution">Institution</Label>
            <Input
              type="text"
              className="institution"
              required={true}
              defaultValue={item.institution ? item.institution : ''}
              onChange={e => this.changeItem('institution', [e.target.value])}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="related_event">Related Event</Label>
            <Input
              type="text"
              className="related_event"
              required={true}
              defaultValue={item.related_event ? item.related_event : ''}
              onChange={e => this.changeItem('related_event', [e.target.value])}
            />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  TextToolkit = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <Input
              type="text"
              className="authors"
              required={true}
              defaultValue={item.authors ? item.authors : ''}
              onChange={e => this.changeItem('authors', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="curator">Host/Artist/Curator Of Event</Label>
            <Input
              type="text"
              className="curator"
              defaultValue={item.curator ? item.curator : ''}
              onChange={e => this.changeItem('curator', e.target.value)}
            />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="organisation">Organisation</Label>
            <Input
              type="text"
              className="organisation"
              required={true}
              defaultValue={item.organisation ? item.organisation : ''}
              onChange={e => this.changeItem('organisation', [e.target.value])}
            />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  TextOther = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <Input
              type="text"
              className="collaborators"
              required={false}
              defaultValue={item.collaborators ? item.collaborators : ''}
              onChange={e => this.changeItem('collaborators', [e.target.value])}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="organisation">Organisation</Label>
            <Input
              type="text"
              className="organisation"
              required={true}
              defaultValue={item.organisation ? item.organisation : ''}
              onChange={e => this.changeItem('organisation', [e.target.value])}
            />
          </FormGroup>
        </Col>
      </Row>
    );
  }

  // ITEM VIDEO
  VideoMovieTrailer = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="4">
          <FormGroup>
            <Label for="directors">Director</Label>
            <Input type="text" id="directors" defaultValue={item.directors ? item.directors : ''} onChange={e => this.changeItem('directors', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <Input type="text" id="collaborators" defaultValue={item.collaborators ? item.collaborators : ''} onChange={e => this.changeItem('collaborators', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="writers">Writer</Label>
            <Input type="text" id="writers" defaultValue={item.writers ? item.writers : ''} onChange={e => this.changeItem('writers', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="cast_">Cast</Label>
            <Input type="text" id="cast_" defaultValue={item.cast_ ? item.cast_ : ''} onChange={e => this.changeItem('cast_', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="screened_at">Screened At</Label>
            <Input type="text" id="screened_at" defaultValue={item.screened_at ? item.screened_at : ''} onChange={e => this.changeItem('screened_at', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="genre">Genre</Label>
            <Input type="text" id="genre" defaultValue={item.genre ? item.genre : ''} onChange={e => this.changeItem('genre', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  VideoDocumentaryArt = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="4">
          <FormGroup>
            <Label for="directors">Director</Label>
            <Input type="text" id="directors" defaultValue={item.directors ? item.directors : ''} onChange={e => this.changeItem('directors', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <Input type="text" id="collaborators" defaultValue={item.collaborators ? item.collaborators : ''} onChange={e => this.changeItem('collaborators', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label for="cast_">Cast</Label>
            <Input type="text" id="cast_" defaultValue={item.cast_ ? item.cast_ : ''} onChange={e => this.changeItem('cast_', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label for="screened_at">Screened At</Label>
            <Input type="text" id="screened_at" defaultValue={item.screened_at ? item.screened_at : ''} onChange={e => this.changeItem('screened_at', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  VideoResearch = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="4">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <Input type="text" id="collaborators" defaultValue={item.collaborators ? item.collaborators : ''} onChange={e => this.changeItem('collaborators', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  VideoInterview = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="4">
          <FormGroup>
            <Label for="interviewers">Interviewer</Label>
            <Input type="text" id="interviewers" defaultValue={item.interviewers ? item.interviewers : ''} onChange={e => this.changeItem('interviewers', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label for="interviewees">Interviewee(s)</Label>
            <Input type="text" id="interviewees" defaultValue={item.interviewees ? item.interviewees : ''} onChange={e => this.changeItem('interviewees', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  VideoNewsJournalism = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="4">
          <FormGroup>
            <Label for="news_outlet">News Outlet</Label>
            <Input type="text" id="news_outlet" defaultValue={item.news_outlet ? item.news_outlet : ''} onChange={e => this.changeItem('news_outlet', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label for="authors">Author</Label>
            <Input type="text" id="authors" defaultValue={item.authors ? item.authors : ''} onChange={e => this.changeItem('authors', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  VideoEventRecording = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="4">
          <FormGroup>
            <Label for="event_title">Event Title</Label>
            <Input type="text" id="event_title" defaultValue={item.event_title ? item.event_title : ''} onChange={e => this.changeItem('event_title', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  } // todo missing schema fields, see spreadsheet
  VideoInformationalVideo = () => { // todo missing schema fields, see spreadsheet
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="4">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <Input type="text" id="collaborators" defaultValue={item.collaborators ? item.collaborators : ''} onChange={e => this.changeItem('collaborators', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  VideoArtworkDocumentation = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="4">
          <FormGroup>
            <Label for="exhibited_at">Exhibited At</Label>
            <Input type="text" id="exhibited_at" defaultValue={item.exhibited_at ? item.exhibited_at : ''} onChange={e => this.changeItem('exhibited_at', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="4">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  VideoRawFootage = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="12">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  VideoOther = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <Input
              type="text"
              className="authors"
              required={true}
              defaultValue={item.authors ? item.authors : ''}
              onChange={e => this.changeItem('authors', e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <Input type="text" id="collaborators" defaultValue={item.collaborators ? item.collaborators : ''} onChange={e => this.changeItem('collaborators', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="organisation">Organisation(s)</Label>
            <Input
              type="text"
              className="organisation"
              required={true}
              defaultValue={item.organisation ? item.organisation : ''}
              onChange={e => this.changeItem('organisation', [e.target.value])}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }

  // ITEM IMAGE
  ItemImage = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="medium">Medium</Label>
            <Input type="text" id="medium" defaultValue={item.medium ? item.medium : ''} onChange={e => this.changeItem('medium', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="dimensions">Dimensions</Label>
            <Input type="text" id="dimensions" defaultValue={item.dimensions ? item.dimensions : ''} onChange={e => this.changeItem('dimensions', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="exhibited_at">Exhibited At</Label>
            <Input type="text" id="exhibited_at" defaultValue={item.exhibited_at ? item.exhibited_at : ''} onChange={e => this.changeItem('exhibited_at', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  ImageResearch = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="medium">Medium</Label>
            <Input type="text" id="medium" defaultValue={item.medium ? item.medium : ''} onChange={e => this.changeItem('medium', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="dimensions">Dimensions</Label>
            <Input type="text" id="dimensions" defaultValue={item.dimensions ? item.dimensions : ''} onChange={e => this.changeItem('dimensions', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <Input
              type="text"
              className="collaborators"
              required={false}
              defaultValue={item.collaborators ? item.collaborators : ''}
              onChange={e => this.changeItem('collaborators', [e.target.value])}
            />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  ImageGraphics = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="medium">Medium</Label>
            <Input type="text" id="medium" defaultValue={item.medium ? item.medium : ''} onChange={e => this.changeItem('medium', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="dimensions">Dimensions</Label>
            <Input type="text" id="dimensions" defaultValue={item.dimensions ? item.dimensions : ''} onChange={e => this.changeItem('dimensions', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="exhibited_at">Exhibited At</Label>
            <Input type="text" id="exhibited_at" defaultValue={item.exhibited_at ? item.exhibited_at : ''} onChange={e => this.changeItem('exhibited_at', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="created_for">Created For</Label>
            <Input type="text" id="created_for" defaultValue={item.created_for ? item.created_for : ''} onChange={e => this.changeItem('created_for', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  ImageMap = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="medium">Medium</Label>
            <Input type="text" id="medium" defaultValue={item.medium ? item.medium : ''} onChange={e => this.changeItem('medium', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="projection">Projection</Label>
            <Input type="text" id="projection" defaultValue={item.projection ? item.projection : ''} onChange={e => this.changeItem('projection', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="location">Coordinates (Lat, Lng)</Label>
            <Input type="text" id="location" defaultValue={item.location ? item.location : ''} onChange={e => this.changeItem('location', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="exhibited_at">Exhibited At</Label>
            <Input type="text" id="exhibited_at" defaultValue={item.exhibited_at ? item.exhibited_at : ''} onChange={e => this.changeItem('exhibited_at', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  ImageFilmStill = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="directors">Director</Label>
            <Input type="text" id="directors" defaultValue={item.directors ? item.directors : ''} onChange={e => this.changeItem('directors', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="writers">Writer</Label>
            <Input type="text" id="writers" defaultValue={item.writers ? item.writers : ''} onChange={e => this.changeItem('writers', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <Input type="text" id="collaborators" defaultValue={item.collaborators ? item.collaborators : ''} onChange={e => this.changeItem('collaborators', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="genre">Genre</Label>
            <Input type="text" id="genre" defaultValue={item.genre ? item.genre : ''} onChange={e => this.changeItem('genre', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="cast_">Cast</Label>
            <Input type="text" id="cast_" defaultValue={item.cast_ ? item.cast_ : ''} onChange={e => this.changeItem('cast_', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="minute_second">Minute : Second</Label>
            <Input type="text" defaultValue={item.minute_second ? item.minute_second : ''} onChange={e => this.changeItem('minute_second', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="screened_at">Screened At</Label>
            <Input type="text" id="screened_at" defaultValue={item.screened_at ? item.screened_at : ''} onChange={e => this.changeItem('screened_at', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }

  // ITEM AUDIO
  AudioFieldRecording = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="recording_technique">Recording Technique</Label>
            <Input type="text" id="recording_technique" defaultValue={item.recording_technique ? item.recording_technique : ''} onChange={e => this.changeItem('recording_technique', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="exhibited_at">Exhibited At</Label>
            <Input type="text" id="exhibited_at" defaultValue={item.exhibited_at ? item.exhibited_at : ''} onChange={e => this.changeItem('exhibited_at', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  AudioSoundArt = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="performers">Performer(s)</Label>
            <Input type="text" id="performers" defaultValue={item.performers ? item.performers : ''} onChange={e => this.changeItem('performers', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="original_sound_credit">Original Sounds Credit</Label>
            <Input type="text" id="original_sound_credit" defaultValue={item.original_sound_credit ? item.original_sound_credit : ''} onChange={e => this.changeItem('original_sound_credit', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="exhibited_at">Exhibited At</Label>
            <Input type="text" id="exhibited_at" defaultValue={item.exhibited_at ? item.exhibited_at : ''} onChange={e => this.changeItem('exhibited_at', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  AudioMusic = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="performers">Performer(s)</Label>
            <Input type="text" id="performers" defaultValue={item.performers ? item.performers : ''} onChange={e => this.changeItem('performers', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="record_label">Recording Studio</Label>
            <Input type="text" id="record_label" defaultValue={item.record_label ? item.record_label : ''} onChange={e => this.changeItem('record_label', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="recording_studio">Recording Label</Label>
            <Input type="text" id="recording_studio" defaultValue={item.recording_studio ? item.recording_studio : ''} onChange={e => this.changeItem('recording_studio', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  AudioPodcast = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="series_name">Series Name</Label>
            <Input type="text" id="series_name" defaultValue={item.series_name ? item.series_name : ''} onChange={e => this.changeItem('series_name', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="episode_name">Episode Name</Label>
            <Input type="text" id="episode_name" defaultValue={item.episode_name ? item.episode_name : ''} onChange={e => this.changeItem('episode_name', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="episode_number">Episode Number</Label>
            <Input type="text" id="episode_number" defaultValue={item.episode_number ? item.episode_number.toString() : ''} onChange={e => this.changeItem('episode_number', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="speakers">Speakers</Label>
            <Input type="text" id="speakers" defaultValue={item.speakers ? item.speakers.join(',') : ''} onChange={e => this.changeItem('speakers', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  AudioLecture = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="lecturer">Lecturer</Label>
            <Input type="text" id="lecturer" defaultValue={item.lecturer ? item.lecturer : ''} onChange={e => this.changeItem('lecturer', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="host_organization">Host Organization</Label>
            <Input type="text" id="host_organization" defaultValue={item.host_organization ? item.host_organization : ''} onChange={e => this.changeItem('host_organization', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  AudioInterview = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="interviewers">Interviewer</Label>
            <Input type="text" id="interviewers" defaultValue={item.interviewers ? item.interviewers : ''} onChange={e => this.changeItem('interviewers', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="interviewees">Interviewee(s)</Label>
            <Input type="text" id="interviewees" defaultValue={item.interviewees ? item.interviewees : ''} onChange={e => this.changeItem('interviewees', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  AudioRadio = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="series_name">Series Name</Label>
            <Input type="text" id="series_name" defaultValue={item.series_name ? item.series_name : ''} onChange={e => this.changeItem('series_name', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="recording_name">Recording Name</Label>
            <Input type="text" id="recording_name" defaultValue={item.recording_name ? item.recording_name : ''} onChange={e => this.changeItem('recording_name', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="episode_number">Episode Number</Label>
            <Input type="text" id="episode_number" defaultValue={item.episode_number ? item.episode_number.toString() : ''} onChange={e => this.changeItem('episode_number', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="speakers">Speakers</Label>
            <Input type="text" id="speakers" defaultValue={item.speakers ? item.speakers.join(',') : ''} onChange={e => this.changeItem('speakers', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="radio_station">Radio Station</Label>
            <Input type="text" id="radio_station" defaultValue={item.radio_station ? item.radio_station.join(',') : ''} onChange={e => this.changeItem('radio_station', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  AudioPerformancePoetry  = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="performers">Performer</Label>
            <Input type="text" id="performers" defaultValue={item.performers ? item.performers : ''} onChange={e => this.changeItem('performers', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="original_text_credit">Original Text Credit</Label>
            <Input type="text" id="original_text_credit" defaultValue={item.original_text_credit ? item.original_text_credit : ''} onChange={e => this.changeItem('original_text_credit', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="host_organization">Host Organization</Label>
            <Input type="text" id="host_organization" defaultValue={item.host_organization ? item.host_organization : ''} onChange={e => this.changeItem('host_organization', e.target.value)}/>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  AudioOther  = () => {
    const item = this.state.changedItem;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="authors">Author(s)</Label>
            <Input type="text" id="authors" defaultValue={item.authors ? item.authors : ''} onChange={e => this.changeItem('authors', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <Input type="text" id="collaborators" defaultValue={item.collaborators ? item.collaborators : ''} onChange={e => this.changeItem('collaborators', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="organisation">Organisation(s)</Label>
            <Input type="text" id="organisation" defaultValue={item.organisation ? item.organisation : ''} onChange={e => this.changeItem('organisation', e.target.value)}/>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="other_metadata">Other</Label>
            <Input type="text" id="other_metadata" defaultValue={item.other_metadata ? item.other_metadata : ''} onChange={e => this.changeItem('other_metadata', e.target.value)}/>
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
      countryOrOcean = item.country_or_ocean ? countries.find( c => c.value === item.country_or_ocean ) || oceans.find( c => c.value === item.country_or_ocean ) : null;

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
          <Col md="4">
            <Row>
              <Col xs="12">
                <InputGroup>
                  <Input
                    className="border-0 bg-white"
                    id="title"
                    defaultValue={item.title ? item.title : ''}
                    placeholder="Please Enter A Title"
                    onChange={e => this.changeItem('title', e.target.value)}
                    disabled
                  />
                  <InputGroupAddon addonType="append">
                    <InputGroupText className="border-0 bg-white">
                      <img
                        src={pencil}
                        alt="Edit Item"
                        onClick={() => $('#title').removeAttr('disabled').removeClass('border-0')}
                      />
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Col>
            </Row>
            <Row>
              <Col xs="12" className="text-center">
                <this.filePreview />
              </Col>
            </Row>

            <Row>
              <Col xs="8">
                <InputGroup>
                  <CustomInput type="switch" id="oa_highlight" name="OA_highlight" label="OA Highlight Switch" checked={this.state.changedItem.oa_highlight || false} onChange={e => this.changeItem('oa_highlight', e.target.checked)} />
                </InputGroup>
                <InputGroup>
                  <CustomInput type="switch" id="oa_original" name="OA_original" label="OA Original Switch" checked={this.state.changedItem.oa_original || false} onChange={e => this.changeItem('oa_original', e.target.checked)} />
                </InputGroup>
                <InputGroup>
                  <CustomInput type="switch" id="tba21_material" name="TBA21_material" label="TBA21 Material Switch" checked={this.state.changedItem.tba21_material || false} onChange={e => this.changeItem('tba21_material', e.target.checked)} />
                </InputGroup>
              </Col>
              <Col xs="4">
                <UncontrolledButtonDropdown className="float-right">
                  <Button id="caret" onClick={this.updateItem} disabled={!this.state.isDifferent}>Save</Button>
                  <DropdownToggle caret />
                  <DropdownMenu>
                    <DropdownItem onClick={() => { this.changeItem('status', false); this.updateItem(); }}>Unpublish</DropdownItem>
                    <DropdownItem onClick={() => { this.changeItem('status', true); this.updateItem(); }}>Publish</DropdownItem>
                  </DropdownMenu>
                </UncontrolledButtonDropdown>
              </Col>
            </Row>
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
              <NavItem>
                <NavLink
                  className={this.state.activeTab === '2' ? 'active' : ''}
                  onClick={() => { if (this._isMounted) { this.setState({ activeTab: '2' }); }}}
                >
                  Taxonomy
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="1">
                <Row>
                  <Col>
                    <FormGroup>
                      <Label for="description">Description</Label>
                      <Input type="textarea" id="description" defaultValue={item.description ? item.description : ''} onChange={e => this.changeItem('description', e.target.value)}/>
                    </FormGroup>

                    <FormGroup>
                      <Label for="year_produced">Year Produced</Label>
                    </FormGroup>

                    <FormGroup>
                      <Label for="time_produced">Date Produced</Label>
                      <Input type="date" id="time_produced" defaultValue={item.time_produced ? item.time_produced : new Date().toISOString().substr(0, 10)} />
                    </FormGroup>

                    <FormGroup>
                      <Label for="country_or_ocean">Region (Country/Ocean)</Label>
                      <Select id="country_or_ocean" options={[ { label: 'Oceans', options: oceans }, { label: 'Countries', options: countries }]} value={[countryOrOcean]} onChange={e => this.changeItem('country_or_ocean', e.value)} isSearchable/>
                    </FormGroup>

                    <FormGroup>
                      <Label for="language">Language</Label>
                      <Select id="language" options={[]} value={[]} onChange={e => this.changeItem('language', e.value)} isSearchable/>
                    </FormGroup>

                    <FormGroup>
                      <Label for="sub_type">Sub Type</Label>
                      <this.SubType />
                    </FormGroup>

                    <FormGroup>
                      <Label for="license_type">License</Label>
                      <Select id="license_type" options={licenseType} value={item.license ? {value: item.license, label: item.license} : []} onChange={e => this.changeItem('license', e.label)} isSearchable/>
                    </FormGroup>

                    <FormGroup>
                      <Label for="credit">Credit</Label>
                      <Input type="text" id="credit" defaultValue={item.credit ? item.credit : ''} onChange={e => this.changeItem('credit', e.target.value)}/>
                    </FormGroup>

                    <FormGroup>
                      <Label for="copyright_holder">Copyright Owner</Label>
                      <Input type="text" id="copyright_holder" defaultValue={item.copyright_holder ? item.copyright_holder : ''} onChange={e => this.changeItem('copyright_holder', e.target.value)}/>
                    </FormGroup>

                    <FormGroup>
                      <Label for="copyright_country">Copyright Country</Label>
                      <Select id="copyright_country" options={countries} value={[item.copyright_country ? countries.find(c => c.value === item.copyright_country) : null]} onChange={e => this.changeItem('copyright_country', e.value)} isSearchable/>
                    </FormGroup>

                    <FormGroup>
                      <Label for="url">Original URL</Label>
                      <Input
                        type="url"
                        id="url"
                        defaultValue={item.url ? item.url : ''}
                        invalid={this.state.validate.hasOwnProperty('url') && !this.state.validate.url}
                        onChange={e => {
                          const value = e.target.value;
                          let valid = this.validateURL(value);
                          if (!value) { valid = true; } // set valid to true for no content
                          if (valid) { this.changeItem('url', value); } // if valid set the data in changedItem
                          this.setState({ validate: { ...this.state.validate, url: valid } });
                        }}
                      />
                      <FormFeedback>Not a valid URL</FormFeedback>
                    </FormGroup>

                  </Col>
                </Row>

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
                {item.item_subtype === itemText.Other ? <this.TextOther /> : <></>}

                {/* Item Video */}
                {item.item_subtype === itemVideo.Movie ? <this.VideoMovieTrailer /> : <></>}
                {item.item_subtype === itemVideo.Documentary ? <this.VideoDocumentaryArt /> : <></>}
                {item.item_subtype === itemVideo.Research ? <this.VideoResearch /> : <></>}
                {item.item_subtype === itemVideo.Interview ? <this.VideoInterview /> : <></>}
                {item.item_subtype === itemVideo.Art ? <this.VideoDocumentaryArt /> : <></>}
                {item.item_subtype === itemVideo.News_Journalism ? <this.VideoNewsJournalism /> : <></>}
                {item.item_subtype === itemVideo.Event_Recording ? <this.VideoEventRecording /> : <></>}
                {item.item_subtype === itemVideo.Informational_Video ? <this.VideoInformationalVideo /> : <></>}
                {item.item_subtype === itemVideo.Trailer ? <this.VideoMovieTrailer /> : <></>}
                {item.item_subtype === itemVideo.Artwork_Documentation ? <this.VideoArtworkDocumentation /> : <></>}
                {item.item_subtype === itemVideo.Raw_Footage ? <this.VideoRawFootage /> : <></>}
                {item.item_subtype === itemVideo.Other ? <this.VideoOther /> : <></>}

                { // Item Image
                  item.item_subtype === itemImage.Photograph ||
                  item.item_subtype === itemImage.Digital_Art ||
                  item.item_subtype === itemImage.Sculpture ||
                  item.item_subtype === itemImage.Painting ||
                  item.item_subtype === itemImage.Illustration ||
                  item.item_subtype === itemImage.Artwork_Documentation ||
                  item.item_subtype === itemImage.Other ? <this.ItemImage /> : <></>
                }
                {item.item_subtype === itemImage.Research ? <this.ImageResearch /> : <></>}
                {item.item_subtype === itemImage.Graphics ? <this.ImageGraphics /> : <></>}
                {item.item_subtype === itemImage.Map ? <this.ImageMap /> : <></>}
                {item.item_subtype === itemImage.Film_Still ? <this.ImageFilmStill /> : <></>}

                {/* Item Audio */}
                {item.item_subtype === itemAudio.Field_Recording ? <this.AudioFieldRecording /> : <></>}
                {item.item_subtype === itemAudio.Sound_Art ? <this.AudioSoundArt /> : <></>}
                {item.item_subtype === itemAudio.Music ? <this.AudioMusic /> : <></>}
                {item.item_subtype === itemAudio.Podcast ? <this.AudioPodcast /> : <></>}
                {item.item_subtype === itemAudio.Lecture ? <this.AudioLecture /> : <></>}
                {item.item_subtype === itemAudio.Interview ? <this.AudioInterview /> : <></>}
                {item.item_subtype === itemAudio.Radio ? <this.AudioRadio /> : <></>}
                {item.item_subtype === itemAudio.Performance_Poetry ? <this.AudioPerformancePoetry /> : <></>}
                {item.item_subtype === itemAudio.Other ? <this.AudioOther /> : <></>}

              </TabPane>
              <TabPane tabId="2">
                <Row>
                  <Col>
                    <FormGroup>
                      <Label for="concept_tags">Concept Tags</Label>
                      <Tags
                        className="concept_tags"
                        type="concept"
                        defaultValues={conceptTags}
                        callback={tagIds => this.changeItem('concept_tags', tagIds ? tagIds : [])}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label for="keyword_tags">Keyword Tags</Label>
                      <Tags
                        className="keyword_tags"
                        type="keyword"
                        defaultValues={keywordTags}
                        loadItemRekognitionTags={!keywordTags.length ? this.state.originalItem.s3_key : ''}
                        callback={tagIds => this.changeItem('keyword_tags', tagIds ? tagIds : [])}
                      />
                    </FormGroup>

                    <FormGroup>
                      <legend>Focus</legend>
                      <Label for="art">Art</Label>
                      <Input className="art" type="range" step="1" min="0" max="3"/>
                      <Label for="scitech">Sci Tech</Label>
                      <Input className="scitech" type="range" step="1" min="0" max="3"/>
                      <Label for="action">Action</Label>
                      <Input className="action" type="range" step="1" min="0" max="3"/>
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
