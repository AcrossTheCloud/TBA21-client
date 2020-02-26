import * as React from 'react';
import { connect } from 'react-redux';
import { FaMapMarked } from 'react-icons/fa';
import {
  Button,
  Col, CustomInput,
  DropdownItem, DropdownMenu, DropdownToggle,
  FormFeedback,
  FormGroup, FormText,
  Input,
  InputGroup,
  Label, Modal, ModalBody, ModalFooter, Nav, NavItem, NavLink,
  Row, TabContent, TabPane, UncontrolledButtonDropdown
} from 'reactstrap';
import { API } from 'aws-amplify';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { isEqual, isArray } from 'lodash';

import Tags from './Tags';
import {
  collectionTypes,
  countries,
  oceans,
  regions as selectableRegions
} from './SelectOptions';
import { Collection, collectionTypes as Types } from '../../types/Collection';
import { Item } from '../../types/Item';
import { Alerts, ErrorMessage, SuccessMessage, WarningMessage } from '../utils/alerts';
import YearSelect from './fields/YearSelect';
import { validateURL } from '../utils/inputs/url';

import CustomSelect from './fields/CustomSelect';
import ShortPaths from '../admin/utils/ShortPaths';
import Contributors from './fields/Contributors';
import { AuthContext } from '../../providers/AuthProvider';

import { modalToggle } from '../../actions/pages/privacyPolicy';
import { getProfileDetails } from '../../actions/user/profile';
import { Profile } from '../../types/Profile';

import 'styles/components/metadata/editors.scss';
import { adminGet, getCollectionsInCollection, getItemsInCollection } from '../../REST/collections';
import { removeTopology } from '../utils/removeTopology';
import { adminGetItems, contributorGetByPerson } from '../../REST/items';
import DraggableMap from '../admin/utils/DraggableMap';
import { GeoJsonObject } from 'geojson';
import { RouteComponentProps, withRouter } from 'react-router';
import { ActionMeta } from 'react-select/src/types';
import { Items } from './Items';
import { withCollapse } from './withCollapse';

interface Props extends RouteComponentProps {
  collection?: Collection;
  editMode: boolean;
  onChange?: Function;
  isAdmin: boolean;

  // From Redux
  modalToggle: Function;
  getProfileDetails: Function;
  profileDetails: Profile;
}

interface State extends Alerts {
  topojson?: GeoJsonObject;
  itemTopoJSON?: GeoJsonObject;

  originalCollection: Collection;
  collection: Collection;
  changedFields: {
    __typename: 'collection',
    [key: string]: string
  };
  acceptedLicense?: boolean;

  validate: {
    [key: string]: boolean
  };

  userUUID: string;

  hasShortPath: boolean;
  editMode: boolean;
  activeTab: string;
  isDifferent: boolean;

  // uUsed for adding items to the collection
  selectItemQuery: string;
  loadedItems: Item[];
  loadingItems: boolean;

  // Used for selecting collections to add to the collection
  selectCollectionQuery: string;
  loadedCollections: Collection[];
  loadingCollections: boolean;

  mapModalOpen: boolean;
}

const defaultRequiredFields = (collection: Collection) => {
  const {
    title,
    description,
    concept_tags,
    aggregated_concept_tags,
    contributors,
    type,
  } = collection;

  let conceptTags: boolean = false;
  if (!!aggregated_concept_tags && aggregated_concept_tags.length > 0) {
    conceptTags = true;
  }
  if (concept_tags) {
    conceptTags = true;
  }

  return {
    'title': (!!title && !!title.length),
    'description': (!!description && !!description.length),
    'concept_tags': conceptTags,
    'contributors': (!!contributors && !!contributors.toString().length),
    'type': (!!type && !!type.length)
  };
};

class CollectionEditorClass extends React.Component<Props, State> {
  static contextType = AuthContext;

  _isMounted;
  isContributorPath: boolean = true;
  isAdmin: boolean = false;
  queryMetaDataObjectsTimeout;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;

    const collection: Collection = props.collection || { __typename: 'collection' };

    this.state = {
      originalCollection: collection,
      collection: {...collection},
      changedFields: {
        __typename: 'collection'
      },

      userUUID: '',

      editMode: this.props.editMode ? this.props.editMode : false,
      hasShortPath: false,

      isDifferent: false,
      validate: defaultRequiredFields(collection),
      activeTab: '1',

      selectItemQuery: '',
      loadedItems: [],
      loadingItems: !!props.collection,

      loadedCollections: [],
      loadingCollections: !!props.collection,
      selectCollectionQuery: '',

      mapModalOpen: false
    };
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;
    const context: React.ContextType<typeof AuthContext> = this.context;

    if (context && (context.uuid && context.uuid.length)) {
      if (!this._isMounted) { return; }
      this.setState({ userUUID: context.uuid });
    }

    this.isAdmin = context.authorisation.hasOwnProperty('admin');
    this.isContributorPath = (this.props.location.pathname.match(/contributor/i));

    if (this.props.collection) {
      const state = {};

      // Get the collection and push the topoJSON into state.
      const topojson = await adminGet(this.isAdmin, { id: this.props.collection.id });
      Object.assign(state, { topojson });

      // Get all the items in our collection.
      const getAllItemsInCollection = async (id) => {

        const results = await getItemsInCollection({ id, limit: 1000 });
        const items = removeTopology(results) as Item[];
        const mappedItems: string[] = items.length ? items.map( i => i.s3_key) : [];

        if (results && items && items.length) {
          Object.assign(state,
                        {
                          itemTopoJSON: results,
                          collection: {...this.state.collection, items: mappedItems},
                          originalCollection: {...this.state.collection, items: mappedItems},
                          loadedItems: items,
                          loadingItems: false
                        }
          );
        } else {
          Object.assign(state, { loadedItems: [], loadingItems: false });
        }

        if (this._isMounted) {
          this.setState(state);
        }
      };
      // don't wait for these.
      getAllItemsInCollection(this.props.collection.id);

      // Get all the collections in our collection.
      const getAllCollectionsInCollection = async (id) => {

        const results = await getCollectionsInCollection({ id, limit: 1000 });
        const collections = removeTopology(results) as Collection[];

        if (collections && collections.length) {
          const mappedCollections = collections.map( i => i.id ).filter(a => !!a);

          Object.assign(state,
            {
              collection: {...this.state.collection, collections: mappedCollections},
              originalCollection: {...this.state.collection, collections: mappedCollections},
              loadedCollections: collections,
              loadingCollections: false
            }
          );
        } else {
          Object.assign(state, { loadingCollections: false, loadedCollections: [] });
        }

        if (this._isMounted) {
          this.setState(state);
        }
      };
      // don't wait for these.
      getAllCollectionsInCollection(this.props.collection.id);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  putCollection = async () =>  {
    if (!this._isMounted) { return; }

    if (!this.props.profileDetails.accepted_license && !this.state.acceptedLicense) {
      this.setState({ errorMessage: 'You need to agree to our terms of use.' });
      return;
    } else if (!this.props.profileDetails.accepted_license && this.state.acceptedLicense) {
      await API.patch('tba21', 'profiles', {
        body: {
          accepted_license: true
        }
      });
      // Refresh the Profile Details.
      this.props.getProfileDetails(this.props.profileDetails.cognito_uuid);
    }

    this.setState(
      {
        errorMessage: undefined,
        successMessage: undefined,
        warningMessage: undefined
      }
    );

    const state = {};

    const invalidFields = Object.entries(this.state.validate).filter(v => v[1] === false).map(([key, val]) => key);
    if (invalidFields.length > 0) {
      const message: JSX.Element = (
        <>
          Missing required field(s) <br/>
          {invalidFields.map( (f, i) => ( <div key={i} style={{ textTransform: 'capitalize' }}>{
            f.toLowerCase() === 'type' ?
              'Collection Category' :
              f.replace(/_/g, ' ')
          }<br/></div> ) )}
        </>
      );

      Object.assign(state, { errorMessage: message });
      if (!this._isMounted) { return; }
      this.setState(state);
      return;
    }

    if (
      // If no Focus has been checked
      (typeof this.state.collection.focus_arts === 'undefined' || this.state.collection.focus_arts === '0') &&
      (typeof this.state.collection.focus_scitech === 'undefined' || this.state.collection.focus_scitech === '0') &&
      (typeof this.state.collection.focus_action === 'undefined' || this.state.collection.focus_action === '0')
    ) {
      Object.assign(state, { errorMessage: <>You need to select at least one Focus area.</> });
      if (!this._isMounted) { return; }
      this.setState(state);
      return;
    }

    try {
      const collectionProperties = {};

      let
        fields: Collection = this.state.collection,
        editMode: boolean = this.state.editMode;

      // if we're in edit more add the id to props
      if (editMode) {
        fields = this.state.changedFields;
        Object.assign(collectionProperties, { id: this.state.originalCollection.id });
      }

      // Put the items into the props
      if (this.state.collection.items) {
        Object.assign(collectionProperties, { items: this.state.collection.items });
      }

      // Put the collections in collection into the props
      if (this.state.collection.collections) {
        Object.assign(collectionProperties, { collections: this.state.collection.collections.map(c => parseInt(c, 0)) });
      }

      Object.assign(fields, {
        focus_arts: this.state.collection.focus_arts === '1' ? '1' : '0',
        focus_scitech: this.state.collection.focus_scitech === '1' ? '1' : '0',
        focus_action: this.state.collection.focus_action === '1' ? '1' : '0'
      });

      // We filter out specific values here as the API doesn't accept them, but returns them in the Item object.
      Object.entries(fields)
        .filter( ([key, value]) => {
          return !(
            value === null ||
            key === 'aggregated_concept_tags' ||
            key === 'aggregated_keyword_tags' ||
            key === '__typename'
            // || key === 'id' // use this to exclude things, you shouldn't need to (eg don't put them in changedFields...
          );
        })
        .forEach( field => {
          Object.assign(collectionProperties, { [field[0]]: field[1] });
        });

      // If no license assign OA
      if (!collectionProperties.hasOwnProperty('license')) {
        Object.assign(collectionProperties, { 'license': 'CC BY-NC' });
      }

      const result = await API.put('tba21', `admin/collections/${editMode ? 'update' : 'create'}`, {
        body: {
          ...collectionProperties
        }
      });

      if (!result.success && result.message && result.message.length > 1) {
        // If we've failed set collection back to the original
        Object.assign(state, { errorMessage: result.message, collection: {...this.state.originalCollection}, changedFields: {__typename: 'collection'}, status: false, isDifferent: false });
      } else if (result.success) {
        const
          modeMessage = editMode ? 'Updated collection!' : 'Created collection!',
          id = result.id || this.state.collection.id || this.state.originalCollection.id,
          originalCollection = {...this.state.collection, id: id},
          collection = {...this.state.collection, id: id};
        // We're in create mode, once we've created add the ID to the original collection and change the form to update
        if (!editMode) {
          editMode = true;
        }
        Object.assign(state, { editMode: editMode, successMessage: modeMessage, changedFields: {__typename: 'collection'}, originalCollection: originalCollection, collection: collection, isDifferent: false });
      } else {
        Object.assign(state, { warningMessage: result });
      }

    } catch (e) {
      console.log('error', e);
      Object.assign(state, { errorMessage: 'We had an issue updating this collection.' });
    } finally {
      if (!this._isMounted) { return; }
      this.setState(state, () => {
        if (this.props.onChange && typeof this.props.onChange === 'function') {
          this.props.onChange(this.state.originalCollection);
        }
      });
    }
  }

  itemsCallback = (s3key: string, removeItem?: boolean): void => {
    const
      s3keyIndex = !!this.state.collection.items ? this.state.collection.items.indexOf(s3key) : -1,
      itemsList = this.state.collection.items || [];

    if (itemsList.indexOf(s3key) === -1) {
      const items: string[] = [...itemsList, s3key];
      if (!this._isMounted) { return; }
      this.setState({ collection: {...this.state.collection, items: items}, isDifferent: true });
    } else if (!!removeItem && itemsList.length) {

      // Remove the item if it exists and removeItem is true
      itemsList.splice(s3keyIndex, 1);

      // Remove the loaded item if it exists
      const loadedItems = this.state.loadedItems;
      if (loadedItems[s3key]) {
        delete loadedItems[s3key];
      }
      if (!this._isMounted) { return; }
      this.setState({ collection: {...this.state.collection, items: itemsList}, loadedItems: loadedItems, isDifferent: true });
    }
  }
  collectionsCallback = (id: string, removeItem?: boolean): void => {
    const
      idIndex = !!this.state.collection.collections ? this.state.collection.collections.indexOf(id) : -1,
      collectionsList = this.state.collection.collections || [];

    if (collectionsList.indexOf(id) === -1) {
      const collections: string[] = [...collectionsList, id];
      if (!this._isMounted) { return; }
      this.setState({ collection: {...this.state.collection, collections: collections}, isDifferent: true });
    } else if (!!removeItem && collectionsList.length) {

      // Remove the item if it exists and removeItem is true
      collectionsList.splice(idIndex, 1);

      // Remove the loaded item if it exists
      const loadedCollections = this.state.loadedCollections;
      const indexOfCollection = this.state.loadedCollections.findIndex(a => a.id === id);
      if (indexOfCollection > -1) {
        loadedCollections.splice(indexOfCollection, 1);
      }

      if (!this._isMounted) { return; }

      this.setState({ collection: {...this.state.collection, collections: collectionsList}, loadedCollections, isDifferent: true });
    }
  }

  /**
   *
   * Adds changed values to collection and changedFields
   * Compares props.item to collection and enables/disabled Update button
   *
   * @param key { string }
   * @param value { any }
   */
  changeCollection = (key: string, value: any, callback?: Function) => { // tslint:disable-line: no-any
    const { collection, changedFields } = this.state;

    Object.assign(changedFields, { [key]: value });
    Object.assign(collection, { [key]: value });

    if (!this._isMounted) { return; }
    this.setState(
      {
        changedFields: changedFields,
        collection: collection,
        isDifferent: !isEqual(this.state.originalCollection, collection)
      },
      () => {
        if (callback && typeof callback === 'function') {
          callback();
        }
      });
  }

  typeOnChange = (subType: string) => {
    const {
      institution,
      venues,
      start_date,
      editor,
      year_produced,
      end_date,
      expedition_leader,
      expedition_route,
      city_of_publication,
      media_type,
    } = this.state.collection;

    const state = {
      ...defaultRequiredFields(this.state.collection),
      type: true,
    };

    const
      TypeFields = {
        'Event' : {
          'institution': (institution || false),
          'start_date': (start_date || false)
        },
        'Event Series' : {
          'venues': (venues || false),
          'start_date': (start_date || false)
        },
        'Edited Volume' : {
          'editor': (editor || false),
          'year_produced': (year_produced || false),
          'city_of_publication': (city_of_publication || false)
        },
        'Expedition' : {
          'start_date': (start_date || false),
          'end_date': (end_date || false),
          'expedition_leader': (expedition_leader || false),
          'institution': (institution || false),
          'expedition_route': (expedition_route || false)
        },
        'Exhibition' : {
          'institution': (institution || false),
          'start_date': (start_date || false)
        },
        'Collection' : {
          'institution': (institution || false),
          'media_type': (media_type || false)
        },
        'Convening' : {
          'venues': (venues || false),
          'start_date': (start_date || false)
        },
        'Performance' : {
          'venues': (venues || false)
        },
        'Installation' : {
          'start_date': (start_date || false)
        },
        'Series' : {
          'start_date': (start_date || false)
        }
      };

    Object.assign(state, TypeFields[subType]);
    if (!this._isMounted) { return; }
    this.setState({ validate: state });
  }

  validateLength = (field: string, inputValue: string | string[] | number | number[]): void => {
    let valid = false;
    this.changeCollection(field, inputValue);
    if (inputValue && inputValue.toString().length > 0) {
      valid = true;
    }
    if (!this._isMounted) { return; }
    this.setState({ validate: { ...this.state.validate, [field]: valid } }, () => {
      if (!isArray(inputValue) && field === 'type') {
        this.typeOnChange(inputValue.toString());
      }
    });
  }

  Series = (): JSX.Element => {
    const collection = this.state.collection;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="start_date">Start Date</Label>
            <Input
              type="date"
              className="start_date"
              defaultValue={collection.start_date ? new Date(collection.start_date).toISOString().substr(0, 10) : ''}
              invalid={this.state.validate.hasOwnProperty('start_date') && !this.state.validate.start_date}
              onChange={e => this.validateLength('start_date', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="end_date">End Date</Label>
            <Input
              type="date"
              className="end_date"
              defaultValue={collection.end_date ? new Date(collection.end_date).toISOString().substr(0, 10) : ''}
              onChange={e => this.changeCollection('end_date', e.target.value)}
            />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  Event = (): JSX.Element => {
    const
      collection = this.state.collection,
      eventTypes = [
        {label: 'Screening', value: 'Screening'},
        {label: 'Concert', value: 'Concert'},
        {label: 'Performance', value: 'Performance'},
        {label: 'Panel Discussion', value: 'Panel Discussion'},
        {label: 'Convening', value: 'Convening'},
        {label: 'Workshop', value: 'Workshop'},
        {label: 'Seminar', value: 'Seminar'},
        {label: 'Other', value: 'Other'}
      ],
      eventType = collection.event_type ? eventTypes.find( c => c.value === collection.event_type ) : null;

    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="institution">Institution</Label>
            <Input
              type="text"
              className="institution"
              defaultValue={collection.institution ? collection.institution : ''}
              required
              invalid={this.state.validate.hasOwnProperty('institution') && !this.state.validate.institution}
              onChange={e => this.validateLength('institution', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="start_date">Start Date</Label>
            <Input
              type="date"
              className="start_date"
              defaultValue={collection.start_date ? new Date(collection.start_date).toISOString().substr(0, 10) : ''}
              invalid={this.state.validate.hasOwnProperty('start_date') && !this.state.validate.start_date}
              onChange={e => this.validateLength('start_date', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="end_date">End Date</Label>
            <Input
              type="date"
              className="end_date"
              defaultValue={collection.end_date ? new Date(collection.end_date).toISOString().substr(0, 10) : ''}
              onChange={e => this.changeCollection('end_date', e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="curator">Curated By</Label>
            <Input
              type="text"
              className="curator"
              defaultValue={collection.curator ? collection.curator : ''}
              required
              invalid={this.state.validate.hasOwnProperty('curator') && !this.state.validate.curator}
              onChange={e => this.validateLength('curator', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="event_type">Type Of Event</Label>
            <Select
              className="select"
              classNamePrefix="select"
              menuPlacement="auto"
              id="event_type"
              options={eventTypes}
              value={[eventType]}
              onChange={e => this.changeCollection('event_type', e.value)}
              isSearchable
            />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  EventSeries = (): JSX.Element => {
    const collection = this.state.collection;

    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="venues">Venue</Label>
            <Input
              type="text"
              className="venues"
              defaultValue={(collection.venues && collection.venues.length) ? collection.venues[0] : ''}
              invalid={this.state.validate.hasOwnProperty('venues') && !this.state.validate.venues}
              onChange={e => this.validateLength('venues', [e.target.value])}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="hosted_by">Hosted By</Label>
            <CustomSelect values={!!collection.hosted_by ? collection.hosted_by : null} callback={values => this.changeCollection('hosted_by', values)} />
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="start_date">Start Date</Label>
            <Input
              type="date"
              className="start_date"
              defaultValue={collection.start_date ? new Date(collection.start_date).toISOString().substr(0, 10) : ''}
              invalid={this.state.validate.hasOwnProperty('start_date') && !this.state.validate.start_date}
              onChange={e => this.validateLength('start_date', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="end_date">End Date</Label>
            <Input
              type="date"
              className="end_date"
              defaultValue={collection.end_date ? new Date(collection.end_date).toISOString().substr(0, 10) : ''}
              onChange={e => this.changeCollection('end_date', e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="curator">Curated By</Label>
            <Input
              type="text"
              className="curator"
              defaultValue={collection.curator ? collection.curator : ''}
              required
              invalid={this.state.validate.hasOwnProperty('curator') && !this.state.validate.curator}
              onChange={e => this.validateLength('curator', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  EditedVolume = (): JSX.Element => {
    const collection = this.state.collection;

    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="editor">Editor</Label>
            <Input
              type="text"
              className="editor"
              defaultValue={collection.editor ? collection.editor : ''}
              required
              invalid={this.state.validate.hasOwnProperty('editor') && !this.state.validate.editor}
              onChange={e => this.validateLength('editor', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="publisher">Publisher</Label>
            <CustomSelect values={!!collection.publisher ? [collection.publisher] : []} callback={values => this.changeCollection('publisher', values)} />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="year_produced">Year</Label>
            <YearSelect value={collection.year_produced ? collection.year_produced : ''} callback={e => this.validateLength('year_produced', e)}/>
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('year_produced') && !this.state.validate.year_produced ? 'block' : 'none') }}>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="city_of_publication">City</Label>
            <Input
              type="text"
              className="city_of_publication"
              defaultValue={collection.city_of_publication ? collection.city_of_publication : ''}
              invalid={this.state.validate.hasOwnProperty('city_of_publication') && !this.state.validate.city_of_publication}
              onChange={e => this.validateLength('city_of_publication', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="edition">Edition</Label>
            <Input
              type="text"
              className="edition"
              defaultValue={collection.edition ? collection.edition : ''}
              onChange={e => this.changeCollection('edition', e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="series_name">Series Name</Label>
            <Input
              type="text"
              className="series_name"
              defaultValue={collection.series_name ? collection.series_name : ''}
              onChange={e => this.changeCollection('series_name', e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="volume_in_series">Volume in Series</Label>
            <Input
              type="number"
              className="volume_in_series"
              defaultValue={collection.volume_in_series ? collection.volume_in_series.toString() : ''}
              onChange={e => this.changeCollection('volume_in_series', e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="journal">Journal</Label>
            <Input
              type="text"
              className="journal"
              defaultValue={collection.journal ? collection.journal : ''}
              onChange={e => this.changeCollection('journal', e.target.value)}
            />
          </FormGroup>
        </Col>
        {/*<Col md="6">*/}
        {/*  <FormGroup>*/}
        {/*    <Label for="volume">Volume #</Label>*/}
        {/*    <Input type="number" className="volume" defaultValue={collection.volume ? collection.volume.toString() : ''} onChange={e => this.changeCollection('volume', e.target.value)}/>*/}
        {/*  </FormGroup>*/}
        {/*</Col>*/}
        {/*<Col md="6">*/}
        {/*  <FormGroup>*/}
        {/*    <Label for="number">Number</Label>*/}
        {/*    <Input type="number" className="number" defaultValue={collection.number ? collection.number.toString() : ''} onChange={e => this.changeCollection('number', e.target.value)}/>*/}
        {/*  </FormGroup>*/}
        {/*</Col>*/}
        <Col md="6">
          <FormGroup>
            <Label for="isbn">ISBN</Label>
            <Input type="number" className="isbn" defaultValue={collection.isbn ? collection.isbn.toString() : ''} onChange={e => this.changeCollection('isbn', e.target.value)}/>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="pages">Pages (Count)</Label>
            <Input
              type="number"
              className="pages"
              defaultValue={collection.pages ? collection.pages.toString() : ''}
              onChange={e => this.changeCollection('pages', e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="disciplinary_field">Disciplinary Field</Label>
            <Input
              type="text"
              className="disciplinary_field"
              defaultValue={collection.disciplinary_field ? collection.disciplinary_field : ''}
              onChange={e => this.changeCollection('disciplinary_field', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  Expedition = (): JSX.Element => {
    const collection = this.state.collection;

    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="start_date">Start Date</Label>
            <Input
              type="date"
              className="start_date"
              defaultValue={collection.start_date ? new Date(collection.start_date).toISOString().substr(0, 10) : ''}
              invalid={this.state.validate.hasOwnProperty('start_date') && !this.state.validate.start_date}
              onChange={e => this.validateLength('start_date', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="end_date">End Date</Label>
            <Input
              type="date"
              className="end_date"
              defaultValue={collection.end_date ? new Date(collection.end_date).toISOString().substr(0, 10) : ''}
              invalid={this.state.validate.hasOwnProperty('end_date') && !this.state.validate.end_date}
              onChange={e => this.validateLength('end_date', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="expedition_leader">Expedition Leader</Label>
            <Input
              type="text"
              className="expedition_leader"
              defaultValue={collection.expedition_leader ? collection.expedition_leader : ''}
              invalid={this.state.validate.hasOwnProperty('expedition_leader') && !this.state.validate.expedition_leader}
              onChange={e => this.validateLength('expedition_leader', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="institution">Institution</Label>
            <Input
              type="text"
              className="institution"
              defaultValue={collection.institution ? collection.institution : ''}
              invalid={this.state.validate.hasOwnProperty('institution') && !this.state.validate.institution}
              onChange={e => this.validateLength('institution', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="expedition_vessel">Vessel (if on boat)</Label>
            <Input
              type="text"
              className="expedition_vessel"
              defaultValue={collection.expedition_vessel ? collection.expedition_vessel : ''}
              onChange={e => this.changeCollection('expedition_vessel', e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="expedition_route">Expedition Route</Label>
            <Input
              type="text"
              className="expedition_route"
              defaultValue={collection.expedition_route ? collection.expedition_route : ''}
              invalid={this.state.validate.hasOwnProperty('expedition_route') && !this.state.validate.expedition_route}
              onChange={e => this.validateLength('expedition_route', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="url">Original URL</Label>
            <Input
              type="url"
              id="url"
              defaultValue={collection.url ? collection.url : ''}
              invalid={this.state.validate.hasOwnProperty('url') && !this.state.validate.url}
              onChange={e => {
                const value = e.target.value;
                let valid = validateURL(value);
                if (!value) { valid = true; } // set valid to true for no content
                if (valid) { this.changeCollection('url', value); } // if valid set the data in changedItem
                if (!this._isMounted) { return; }
                this.setState({ validate: { ...this.state.validate, url: valid } });
              }}
            />
            <FormFeedback>Not a valid URL</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="participants">Participant(s)</Label>
            <CustomSelect values={collection.participants} callback={values => this.validateLength('participants', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('participants') && !this.state.validate.participants ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a new Participant.</FormText>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  Exhibition = (): JSX.Element => {
    const collection = this.state.collection;
    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="institution">Institution</Label>
            <Input
              type="text"
              className="institution"
              defaultValue={collection.institution ? collection.institution : ''}
              required
              invalid={this.state.validate.hasOwnProperty('institution') && !this.state.validate.institution}
              onChange={e => this.validateLength('institution', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="start_date">Start Date</Label>
            <Input
              type="date"
              className="start_date"
              defaultValue={collection.start_date ? new Date(collection.start_date).toISOString().substr(0, 10) : ''}
              invalid={this.state.validate.hasOwnProperty('start_date') && !this.state.validate.start_date}
              onChange={e => this.validateLength('start_date', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="end_date">End Date</Label>
            <Input
              type="date"
              className="end_date"
              defaultValue={collection.end_date ? new Date(collection.end_date).toISOString().substr(0, 10) : ''}
              onChange={e => this.changeCollection('end_date', e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="curator">Curated By</Label>
            <Input
              type="text"
              className="curator"
              defaultValue={collection.curator ? collection.curator : ''}
              onChange={e => this.changeCollection('curator', e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="related_material">Related Material</Label>
            <CustomSelect values={collection.related_material} callback={values => this.changeCollection('related_material', values)} />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  Collection = (): JSX.Element => {
    const collection = this.state.collection;

    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="institution">Institution</Label>
            <Input
              type="text"
              className="institution"
              defaultValue={collection.institution ? collection.institution : ''}
              required
              invalid={this.state.validate.hasOwnProperty('institution') && !this.state.validate.institution}
              onChange={e => this.validateLength('institution', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <InputGroup>
            <CustomInput type="switch" id="digital_only" name="digital_only" label="Digital Collection Only?" checked={this.state.collection.digital_only || false} onChange={e => this.changeCollection('digital_only', e.target.checked)} />
          </InputGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="department">Department</Label>
            <Input
              type="text"
              className="department"
              defaultValue={collection.department ? collection.department : ''}
              onChange={e => this.changeCollection('department', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="directors">Director</Label>
            <CustomSelect values={collection.directors} callback={values => this.validateLength('directors', values)} />
            <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('directors') && !this.state.validate.directors ? 'block' : 'none') }}>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a Director.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="media_type">Media Type</Label>
            <Input
              type="text"
              className="media_type"
              defaultValue={collection.media_type ? collection.media_type : ''}
              required
              invalid={this.state.validate.hasOwnProperty('media_type') && !this.state.validate.media_type}
              onChange={e => this.validateLength('media_type', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
      </Row>
    );
  }
  Convening = (): JSX.Element => {
    const collection = this.state.collection;

    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="curator">Curated By</Label>
            <Input
              type="text"
              className="curator"
              defaultValue={collection.curator ? collection.curator : ''}
              onChange={e => this.changeCollection('curator', e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="venues">Venue</Label>
            <Input
              type="text"
              className="venues"
              defaultValue={(collection.venues && collection.venues.length) ? collection.venues[0] : ''}
              invalid={this.state.validate.hasOwnProperty('venues') && !this.state.validate.venues}
              onChange={e => this.validateLength('venues', [e.target.value])}
            />
            <FormFeedback>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a Venue.</FormText>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="host_organisation">Host Organization</Label>
            <CustomSelect values={collection.host_organisation} callback={values => this.changeCollection('host_organisation', values)} />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="start_date">Start Date</Label>
            <Input
              type="date"
              className="start_date"
              defaultValue={collection.start_date ? new Date(collection.start_date).toISOString().substr(0, 10) : ''}
              invalid={this.state.validate.hasOwnProperty('start_date') && !this.state.validate.start_date}
              onChange={e => this.validateLength('start_date', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="end_date">End Date</Label>
            <Input
              type="date"
              className="end_date"
              defaultValue={collection.end_date ? new Date(collection.end_date).toISOString().substr(0, 10) : ''}
              onChange={e => this.changeCollection('end_date', e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="participants">Participant(s)</Label>
            <CustomSelect values={collection.participants} callback={values => this.changeCollection('participants', values)} />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  Performance = (): JSX.Element => {
    const collection = this.state.collection;

    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="venues">Venue</Label>
            <Input
              type="text"
              className="venues"
              defaultValue={(collection.venues && collection.venues.length) ? collection.venues[0] : ''}
              invalid={this.state.validate.hasOwnProperty('venues') && !this.state.validate.venues}
              onChange={e => this.validateLength('venues', [e.target.value])}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="collaborators">Collaborators</Label>
            <CustomSelect values={!!collection.collaborators ? collection.collaborators : null} callback={values => this.changeCollection('collaborators', values)} />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="host_organisation">Host Organization</Label>
            <CustomSelect values={collection.host_organisation} callback={values => this.changeCollection('host_organisation', values)} />
          </FormGroup>
        </Col>
      </Row>
    );
  }
  Installation = (): JSX.Element => {
    const collection = this.state.collection;

    return (
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="installation_name">Installation Name</Label>
            <Input
              type="text"
              className="installation_name"
              defaultValue={collection.installation_name ? collection.installation_name : ''}
              onChange={e => this.changeCollection('installation_name', e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="venues">Venue</Label>
            <Input
              type="text"
              className="venues"
              defaultValue={(collection.venues && collection.venues.length) ? collection.venues[0] : ''}
              invalid={this.state.validate.hasOwnProperty('venues') && !this.state.validate.venues}
              onChange={e => this.validateLength('venues', [e.target.value])}
            />
            <FormFeedback>This is a required field</FormFeedback>
            <FormText>Use tab or enter to add a Venue.</FormText>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="start_date">Start Date</Label>
            <Input
              type="date"
              className="start_date"
              defaultValue={collection.start_date ? new Date(collection.start_date).toISOString().substr(0, 10) : ''}
              invalid={this.state.validate.hasOwnProperty('start_date') && !this.state.validate.start_date}
              onChange={e => this.validateLength('start_date', e.target.value)}
            />
            <FormFeedback>This is a required field</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="end_date">End Date</Label>
            <Input
              type="date"
              className="end_date"
              defaultValue={collection.end_date ? new Date(collection.end_date).toISOString().substr(0, 10) : ''}
              onChange={e => this.changeCollection('end_date', e.target.value)}
            />
          </FormGroup>
        </Col>
      </Row>
    );
  }

  /**
   *
   * Load items or collections that match the given string
   *
   * Timeout for the user keyboard presses, clear the timeout if they've pressed another key within 500ms and start again,
   * This avoids multiple calls before the user has finished typing.
   *
   * @param inputValue { string }
   * @param type { 'item' | 'collection' }
   */
  queryMetaDataObjects = async (inputValue: string, type: 'item' | 'collection' = 'item') => {
    if (inputValue && inputValue.length <= 1) { clearTimeout(this.queryMetaDataObjectsTimeout); return; }

    if (this.queryMetaDataObjectsTimeout) { clearTimeout(this.queryMetaDataObjectsTimeout); }

    return new Promise( resolve => {
      this.queryMetaDataObjectsTimeout = setTimeout(async () => {
        clearTimeout(this.queryMetaDataObjectsTimeout);

        const
          queryStringParameters = (
            inputValue ? { inputQuery: inputValue, limit: 100 } : {}
          ),
          isAdmin: boolean = !this.isContributorPath && !this.isAdmin,
          response = type === 'item' ? (isAdmin ? await contributorGetByPerson(queryStringParameters) : await adminGetItems(queryStringParameters)) : await adminGet(isAdmin, queryStringParameters),
          data = removeTopology(response);

        if (data && data.length) {
          if (type === 'collection') {
            const metaDataObject = data as Collection[];
            resolve(metaDataObject.map(collection => ({label: collection.title || 'No title', id: collection.id, data: collection})));
          } else {
            const metaDataObject = data as Item[];
            resolve(metaDataObject.map(item => ({label: item.title || 'No title', id: item.s3_key, data: item})));
          }
        } else {
          resolve([]);
        }
      }, 500);
    });
  }

  addMetaObjects = (input: any, actionMeta, type: 'item' | 'collection' = 'item') => { // tslint:disable-line: no-any
    if (actionMeta.action === 'select-option') {
      const existingData: string[] | null | undefined = (type === 'item') ? this.state.collection.items : this.state.collection.collections;
      // Item is already attached to the collection.
      if (!!existingData && this._isMounted) {
        if (type === 'item' && existingData.indexOf(input.data.s3_key) > -1) {
          this.setState({ warningMessage: 'Item is already attached to Collection.', selectItemQuery: '' });
          return;
        } else if (type === 'collection' && existingData.indexOf(input.data.id) > -1) {
          this.setState({warningMessage: 'Collection is already attached to Collection.', selectItemQuery: ''});
          return;
        }
      }

      const
        data: Item | Collection = input.data,
        list: string[] = !!existingData ? existingData : [];

      if (type === 'item' && data.s3_key) {
        const item: Item = data as Item;
        list.push(item.s3_key);
      } else if (type === 'collection' && data.id) {
        list.push(data.id);
      }

      const state = { isDifferent: true };

      if (type === 'item') {
        Object.assign(state, {
          selectItemQuery: '',
          loadedItems: [...this.state.loadedItems, data],
          collection: {...this.state.collection, items: list}
        });
      } else {
        Object.assign(state, {
          selectCollectionQuery: '',
          loadedCollections: [...this.state.loadedCollections, data],
          collection: {...this.state.collection, collections: list}
        });
      }

      if (!this._isMounted) { return; }
      this.setState(state);
    }
  }

  toggleMapModal = () => {
    if (this._isMounted) {
      this.setState({ mapModalOpen: !this.state.mapModalOpen });
    }
  }

  render() {
    const {
      id,
      title,
      description,
      subtitle,
      url,
      copyright_holder,

      regions,

      focus_arts,
      focus_scitech,
      focus_action,

      aggregated_keyword_tags,
      aggregated_concept_tags,

      contributors,

      type

    } = this.state.collection;

    const
      conceptTags = aggregated_concept_tags ? aggregated_concept_tags.map( t => ({ id: t.id, value: t.id, label: t.tag_name }) ) : [],
      keywordTags = aggregated_keyword_tags ? aggregated_keyword_tags.map( t => ({ id: t.id, value: t.id, label: t.tag_name }) ) : [],
      selectedRegions = !!regions ? selectableRegions.filter(s => !!regions ? regions.find(a => a === s.value) : false) : [];

    return (
      <div className="container-fluid collectionEditor">
        <Row>
          <Col xs="12">
            <WarningMessage message={this.state.warningMessage} />
            <ErrorMessage message={this.state.errorMessage} />
            <SuccessMessage message={this.state.successMessage} />
          </Col>
        </Row>

        <Row>
          <Col md="12">
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
                  Items
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={this.state.activeTab === '3' ? 'active' : ''}
                  onClick={() => { if (this._isMounted) { this.setState({ activeTab: '3' }); }}}
                >
                  Collections
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="1">
                <Row>
                  <Col className="py-4">
                    <UncontrolledButtonDropdown className="float-right">
                      {this.state.originalCollection.status === true ?
                        <Button className="caret" onClick={this.putCollection} disabled={!this.state.isDifferent}>Save</Button>
                        :
                        <Button className="caret" onClick={() => { this.changeCollection('status', true, () => this.putCollection() ); }}>Publish</Button>
                      }
                      <DropdownToggle caret />
                      <DropdownMenu>
                        {this.state.originalCollection.status === true ?
                          <DropdownItem onClick={() => { this.changeCollection('status', false, () => this.putCollection() ); }}>Unpublish</DropdownItem>
                          :
                          <DropdownItem onClick={() => { this.changeCollection('status', false, () => this.putCollection() ); }}>Save Draft</DropdownItem>
                        }
                      </DropdownMenu>
                    </UncontrolledButtonDropdown>

                    <Button onClick={this.toggleMapModal} className="location">Add Location(s) <FaMapMarked size={20}/></Button>

                  </Col>

                  {this.props.profileDetails && !this.props.profileDetails.accepted_license ?
                    <Col md={{size: 3, offset: 9}}>
                      By checking this box you agree to the Ocean Archive's <Button color="link" onClick={e => {e.preventDefault(); this.props.modalToggle('TC_MODAL', true); }}>Terms Of Use</Button>
                      <FormGroup check>
                        <Label check>
                          <Input type="checkbox" checked={this.state.acceptedLicense ? this.state.acceptedLicense : false} onChange={e => { if (this._isMounted) { this.setState({ acceptedLicense: e.target.checked }); } }}/>{' '}
                          I agree
                        </Label>
                      </FormGroup>
                    </Col>
                    : <></>
                  }
                  <Col xs="12">
                    <FormGroup>
                      <Label for="title">Title</Label>
                      <Input
                        id="title"
                        defaultValue={title ? title : ''}
                        placeholder="Please Enter A Title"
                        onChange={e => this.validateLength('title', e.target.value)}
                        required
                        invalid={this.state.validate.hasOwnProperty('title') && !this.state.validate.title}
                      />
                      <FormFeedback>This is a required field</FormFeedback>
                      <ShortPaths
                        type="Item"
                        id={id ? id : undefined}
                        onChange={s => { if (this._isMounted) { this.setState({ hasShortPath: !!s.length }); }}}
                      />
                      {
                        this.state.editMode ?
                          <></>
                          :
                          <FormFeedback style={{ display: !this.state.hasShortPath ? 'block' : 'none' }}>You need to save or publish your collection first before adding a URL slug (short path).</FormFeedback>
                      }
                    </FormGroup>

                    <FormGroup>
                      <Label for="subtitle">Subtitle</Label>
                      <Input
                        type="text"
                        className="subtitle"
                        defaultValue={subtitle ? subtitle : ''}
                        maxLength={256}
                        onChange={e => this.changeCollection('subtitle', e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for="description">Description</Label>
                      <Input
                        type="textarea"
                        id="description"
                        defaultValue={description ? description : ''}
                        onChange={e => this.validateLength('description', e.target.value)}
                        invalid={this.state.validate.hasOwnProperty('description') && !this.state.validate.description}
                        maxLength={4096}
                      />
                      <FormFeedback>This is a required field</FormFeedback>
                    </FormGroup>

                    <FormGroup>
                      <Label for="contributors">Contributor(s)</Label>
                      { !this.state.userUUID ? <><br/>Loading..</> :
                        <>
                          <Contributors callback={e => this.validateLength('contributors', e)} defaultValues={this.state.originalCollection.contributors ? this.state.originalCollection.contributors : ( this.state.userUUID && !this.props.editMode ? [this.state.userUUID] : [] )} />
                          <FormFeedback style={{ display: !contributors || !contributors.length ? 'block' : 'none' }}>A collection needs a contributor, select yourself or another user.</FormFeedback>
                        </>
                      }
                    </FormGroup>

                    <FormGroup>
                      <Label for="regions">Region(s) (Country/Ocean)</Label>
                      <Select className="select" classNamePrefix="select" isMulti isSearchable menuPlacement="auto" options={[ { label: 'Oceans', options: oceans }, { label: 'Countries', options: countries } ]} defaultValue={selectedRegions} onChange={e => this.validateLength('regions', !!e && e.length ? e.map(r => r.value) : [])} />
                    </FormGroup>

                    <FormGroup>
                      <Label for="type">Collection Category</Label>
                      <Select className="select" classNamePrefix="select" menuPlacement="auto" id="type" options={collectionTypes} value={[collectionTypes.find( o => o.value === type)]} onChange={e => this.validateLength('type', e.value)} isSearchable/>
                      <FormFeedback style={{ display: (this.state.validate.hasOwnProperty('type') && !this.state.validate.type ? 'block' : 'none') }}>This is a required field</FormFeedback>
                    </FormGroup>

                    {type === Types.Series ? <this.Series /> : <></>}
                    {type === Types.Area_of_Research ? <></> : <></>}
                    {type === Types.Event ? <this.Event /> : <></>}
                    {type === Types.Event_Series ? <this.EventSeries /> : <></>}
                    {type === Types.Edited_Volume ? <this.EditedVolume /> : <></>}
                    {type === Types.Expedition ? <this.Expedition /> : <></>}
                    {type === Types.Collection ? <this.Collection /> : <></>}
                    {type === Types.Convening ? <this.Convening /> : <></>}
                    {type === Types.Performance ? <this.Performance /> : <></>}
                    {type === Types.Installation ? <this.Installation /> : <></>}

                    <FormGroup>
                      <Label for="copyright_holder">Copyright Holder</Label>
                      <Input type="text" id="copyright_holder" defaultValue={copyright_holder ? copyright_holder : ''} onChange={e => this.changeCollection('copyright_holder', e.target.value)}/>
                    </FormGroup>

                    <FormGroup>
                      <Label for="url">Original URL</Label>
                      <Input
                        type="url"
                        id="url"
                        defaultValue={url ? url : ''}
                        invalid={this.state.validate.hasOwnProperty('url') && !this.state.validate.url}
                        onChange={e => {
                          const value = e.target.value;
                          let valid = validateURL(value);
                          if (!value) { valid = true; } // set valid to true for no content
                          if (valid) { this.changeCollection('url', value); } // if valid set the data in collection
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
                            const { originalCollection, collection } = this.state;
                            this.setState({
                                            originalCollection: {...originalCollection, aggregated_concept_tags: tagList},
                                            collection: {...collection, aggregated_concept_tags: tagList}
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
                        callback={tags => {
                          const tagList = tags ? tags.map(tag => ({id: tag.id, tag_name: tag.label})) : [];
                          this.changeCollection('keyword_tags', tags ? tags.map(tag => tag.id) : []);
                          if (this._isMounted) {
                            const { originalCollection, collection } = this.state;
                            this.setState({
                                            originalCollection: {...originalCollection, aggregated_keyword_tags: tagList},
                                            collection: {...collection, aggregated_keyword_tags: tagList}
                                          });
                          }
                        }}
                      />
                    </FormGroup>

                    <FormGroup>
                      <legend>Focus</legend>
                      {
                        (typeof focus_arts === 'undefined' || focus_arts === '0') &&
                        (typeof focus_scitech === 'undefined' || focus_scitech === '0') &&
                        (typeof focus_action === 'undefined' || focus_action === '0') ?
                          <FormFeedback style={{display: 'block'}}>You need to select at least one Focus area.</FormFeedback>
                          : <></>
                      }
                    </FormGroup>
                    <div className="focusSelect">
                      <FormGroup row className="my-0 align-items-center">
                        <Label for={`${id}_focus_arts`} sm="2">Art</Label>
                        <Col sm="10">
                          <CustomInput type="checkbox" id={`${id}_focus_arts`} defaultChecked={(typeof focus_arts !== 'undefined' && focus_arts !== null) && parseInt(focus_arts, 0) > 0} onChange={e => this.changeCollection('focus_arts', e.target.checked ? '1' : '0')}/>
                        </Col>
                      </FormGroup>
                      <FormGroup row className="my-0 align-items-center">
                        <Label for={`${id}_focus_scitech`} sm="2">Sci-Tech</Label>
                        <Col sm="10">
                          <CustomInput type="checkbox" id={`${id}_focus_scitech`} defaultChecked={(typeof focus_scitech !== 'undefined' && focus_scitech !== null) && parseInt(focus_scitech, 0) > 0} onChange={e => this.changeCollection('focus_scitech', e.target.checked ? '1' : '0')}/>
                        </Col>
                      </FormGroup>
                      <FormGroup row className="my-0 align-items-center">
                        <Label for={`${id}_focus_action`} sm="2">Action</Label>
                        <Col sm="10">
                          <CustomInput type="checkbox" id={`${id}_focus_action`} defaultChecked={(typeof focus_action !== 'undefined' && focus_action !== null) && parseInt(focus_action, 0) > 0} onChange={e => this.changeCollection('focus_action', e.target.checked ? '1' : '0')}/>
                        </Col>
                      </FormGroup>
                    </div>

                  </Col>
                </Row>

              </TabPane>
              <TabPane tabId="2">
                <Row>
                  <h5>Add existing items</h5>
                  <Col xs="12">
                    <AsyncSelect
                      cacheOptions
                      className="select"
                      classNamePrefix="select"
                      isClearable
                      loadOptions={v => this.queryMetaDataObjects(v)}
                      placeholder="Start typing the item title then select..."
                      onChange={this.addMetaObjects}
                      onInputChange={v => { if (this._isMounted) { this.setState({ selectItemQuery: v }); } }}
                      inputValue={this.state.selectItemQuery}
                      value={[this.state.selectItemQuery]}
                    />
                  </Col>
                </Row>

                {
                  this.state.loadingItems ?
                    <Row><Col>Loading</Col></Row>
                    :
                    this.state.loadedItems && this.state.loadedItems.length ?
                      <Items isAdmin={this.props.isAdmin} callback={this.itemsCallback} items={this.state.loadedItems} allowRemoveItem/>
                      : <>No items in this collection</>
                }

              </TabPane>
              <TabPane tabId="3">
                <Row>
                  <h5>Add existing collections</h5>
                  <Col xs="12">
                    <AsyncSelect
                      cacheOptions
                      className="select"
                      classNamePrefix="select"
                      isClearable
                      loadOptions={v => this.queryMetaDataObjects(v, 'collection')}
                      placeholder="Start typing the collection title then select..."
                      onChange={(v, m: ActionMeta) => this.addMetaObjects(v, m, 'collection')}
                      onInputChange={v => { if (this._isMounted) { this.setState({ selectCollectionQuery: v }); } }}
                      inputValue={this.state.selectCollectionQuery}
                      value={[this.state.selectCollectionQuery]}
                    />
                  </Col>
                </Row>

                {
                  this.state.loadingCollections ?
                    <Row><Col>Loading</Col></Row>
                    :
                    this.state.loadedCollections && this.state.loadedCollections.length ?
                      this.state.loadedCollections.map( c => {
                        if (c && c.id) {
                          return (
                            <div key={c.id}>
                              <CollectionEditorWithCollapse
                                data={c}
                                isOpen={false}
                                isAdmin={!this.isContributorPath}
                              >
                                <Button color="danger" onClick={() => { if (c.id) { this.collectionsCallback(c.id, true); }}}>Remove</Button>
                              </CollectionEditorWithCollapse>
                            </div>
                          );
                        } else {
                          return <></>;
                        }
                      })
                      : <>No collections in this collection</>
                }

              </TabPane>
            </TabContent>
          </Col>
        </Row>

        <Modal autoFocus={false} isOpen={this.state.mapModalOpen} toggle={this.toggleMapModal} centered size="lg" className="fullwidth showscroll" backdrop>
          <ModalBody>
            <DraggableMap
              topoJSON={this.state.topojson}
              collectionItems={this.state.itemTopoJSON}
              onChange={ geojson => {
                if (this._isMounted) {
                  this.setState(
                    { collection: {...this.state.collection, geojson},
                      changedFields: {...this.state.changedFields, geojson},
                      isDifferent: !isEqual(this.state.originalCollection, this.state.collection)
                    }
                  );
                }
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.toggleMapModal}>Close</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state: { profile: { details: Profile} }) => ({
  profileDetails: state.profile.details,
});

export const CollectionEditor = withRouter(connect(mapStateToProps, { modalToggle, getProfileDetails })(CollectionEditorClass));

export const CollectionEditorWithCollapse = withRouter(connect(mapStateToProps, { modalToggle, getProfileDetails })(withCollapse(CollectionEditorClass)) as React.ComponentType<any>); // tslint:disable-line no-any
