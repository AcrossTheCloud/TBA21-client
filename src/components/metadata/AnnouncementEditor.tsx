import * as React from 'react';
import {
  Button,
  Col,
  DropdownItem, DropdownMenu, DropdownToggle,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row, UncontrolledButtonDropdown
} from 'reactstrap';
import { API } from 'aws-amplify';
import { isEqual } from 'lodash';

import { Alerts, ErrorMessage, SuccessMessage, WarningMessage } from '../utils/alerts';
import { validateURL } from '../utils/inputs/url';
import { AuthContext } from 'providers/AuthProvider';
import { Announcement } from '../../types/Announcement';
import 'styles/components/metadata/editors.scss';

interface Props {
  announcement?: Announcement;
  editMode: boolean;
  onChange?: Function;
  path: string;
}

interface State extends Alerts {
  originalAnnouncement: Announcement;
  announcement: Announcement;
  changedFields: {
    [key: string]: string
  };

  validate: {
    [key: string]: boolean
  };

  editMode: boolean;
  // If we're editing the announcement, we'll do an API call to get the items and push them to <Items />
  isDifferent: boolean;
}

const defaultRequiredFields = (announcement: Announcement) => {
  const {
    title,
    description,
  } = announcement;

  return {
    'title': (!!title && !!title.length),
    'description': (!!description && !!description.length),
  };
};

export class AnnouncementEditor extends React.Component<Props, State> {
  static contextType = AuthContext;
  isContributorPath;
  _isMounted;

  constructor(props: Props) {
    super(props);

    const emptyAnnouncment = {
      title: '',
      description: '',
      status: false
    };

    this._isMounted = false;

    const announcement = props.announcement || emptyAnnouncment;

    this.state = {
      originalAnnouncement: props.announcement ? props.announcement : emptyAnnouncment,
      announcement: {...announcement},
      changedFields: {},

      editMode: this.props.editMode ? this.props.editMode : false,

      isDifferent: false,
      validate: defaultRequiredFields(announcement),
    };
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;

    const context: React.ContextType<typeof AuthContext> = this.context;
    if (!context.authorisation.hasOwnProperty('admin')) {
      this.isContributorPath = (this.props.path.match(/contributor/i));
    } else {
      this.isContributorPath = false;
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  putAnnouncement = async () =>  {
    if (!this._isMounted) { return; }
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
          {invalidFields.map( (f, i) => ( <div key={i} style={{ textTransform: 'capitalize' }}>{f.replace(/_/g, ' ')}<br/></div> ) )}
        </>
      );

      Object.assign(state, { errorMessage: message });
      if (!this._isMounted) { return; }
      this.setState(state);
      return;
    }

    try {
      const announcementProperties = {};

      let
        fields: { [p: string]: string } | Announcement = this.state.announcement,
        editMode = this.state.editMode;

      // if we're in edit more add the id to props
      if (editMode) {
        fields = this.state.changedFields;
        Object.assign(announcementProperties, { id: this.state.originalAnnouncement.id });
      }

      // We filter out specific values here as the API doesn't accept them, but returns them in the Item object.
      Object.entries(fields)
        .filter( ([key, value]) => {
          return !(
            value === null
            // || key === 'id' // use this to exclude things, you shouldn't need to (eg don't put them in changedFields...
          );
        })
        .forEach( field => {
          Object.assign(announcementProperties, { [field[0]]: field[1] });
        });

      let result: any = null; // tslint:disable-line: no-any
      if (editMode) {
        result = await API.patch('tba21', `${this.isContributorPath ? 'contributor' : 'admin'}/announcements`, {
          body: {
            ...announcementProperties
          }
        });
      } else {
        result = await API.put('tba21', `${this.isContributorPath ? 'contributor' : 'admin'}/announcements`, {
          body: {
            ...announcementProperties
          }
        });
      }

      if (!result.success && result.message && result.message.length > 1) {
        // If we've failed set announcement back to the original
        Object.assign(state, { errorMessage: result.message, announcement: {...this.state.originalAnnouncement}, changedFields: {}, status: false, isDifferent: false });
      } else if (result.success) {
        const
          modeMessage = editMode ? 'Updated announcement!' : 'Created announcement!',
          id = result.id || this.state.announcement.id || this.state.originalAnnouncement.id,
          originalAnnouncement = {...this.state.announcement, id: id},
          announcement = {...this.state.announcement, id: id};
        // We're in create mode, once we've created add the ID to the original announcement and change the form to update
        if (!editMode) {
          editMode = true;
        }
        Object.assign(state, { editMode: editMode, successMessage: modeMessage, changedFields: {}, originalAnnouncement: originalAnnouncement, announcement: announcement, isDifferent: false });
      } else {
        Object.assign(state, { warningMessage: result });
      }

    } catch (e) {
      console.log('error', e);
      Object.assign(state, { errorMessage: `${this.props.editMode ? 'We had an issue updating this announcement.' : 'We had a problem creating this announcement'}` });
    } finally {
      if (!this._isMounted) { return; }
      this.setState(state, () => {
        if (this.props.onChange && typeof this.props.onChange === 'function') {
          this.props.onChange(this.state.originalAnnouncement);
        }
      });
    }
  }

  /**
   *
   * Adds changed values to announcement and changedFields
   * Compares props.item to announcement and enables/disabled Update button
   *
   * @param key { string }
   * @param value { any }
   */
  changeAnnouncement = (key: string, value: any, callback?: Function) => { // tslint:disable-line: no-any
    const { announcement, changedFields } = this.state;

    if (value.toString().length) {
      Object.assign(changedFields, { [key]: value });
      Object.assign(announcement, { [key]: value });
    } else {
      if (changedFields[key]) {
        delete changedFields[key];
        // Reset back to original item key value
        Object.assign(announcement, { [key]: this.state.originalAnnouncement[key] });
      }
    }
    if (!this._isMounted) { return; }

    this.setState(
      {
        changedFields: changedFields,
        announcement: announcement,
        isDifferent: !isEqual(this.state.originalAnnouncement, announcement)
      },
      () => {
        if (callback && typeof callback === 'function') {
          callback();
        }
      });
  }

  validateLength = (field: string, inputValue: string | string[] | number | number[]): void => {
    let valid = false;
    this.changeAnnouncement(field, inputValue);
    if (inputValue && inputValue.toString().length > 0) {
      valid = true;
    }
    if (!this._isMounted) { return; }
    this.setState({ validate: { ...this.state.validate, [field]: valid } });
  }

  render() {
    const {
      title,
      description,
      url
    } = this.state.announcement;

    return (
      <div className="container-fluid announcementEditor">
        <Row>
          <Col xs="12">
            <WarningMessage message={this.state.warningMessage} />
            <ErrorMessage message={this.state.errorMessage} />
            <SuccessMessage message={this.state.successMessage} />
          </Col>
        </Row>

        <Row>
          <Col md="12">
            <UncontrolledButtonDropdown className="float-right">
              <Button className="caret" onClick={this.putAnnouncement} disabled={!this.state.isDifferent}>
                {
                  this.isContributorPath && !this.state.announcement.status ? 'Submit' : 'Save'
                }
              </Button>
              {
                !this.isContributorPath || this.state.originalAnnouncement.status ?
                  <>
                    <DropdownToggle caret />
                    <DropdownMenu>
                      {this.state.originalAnnouncement.status ?
                        <DropdownItem onClick={() => { this.changeAnnouncement('status', false, () => this.putAnnouncement() ); }}>Unpublish</DropdownItem>
                      :
                        !this.isContributorPath ?
                          <DropdownItem onClick={() => { this.changeAnnouncement('status', true, () => this.putAnnouncement() ); }}>Publish</DropdownItem>
                        : <></>
                      }
                    </DropdownMenu>
                  </>
                : <></>
              }
            </UncontrolledButtonDropdown>
          </Col>
          <Col>
            <FormGroup>
              <Label for="title">Title</Label>
              <Input
                id="title"
                defaultValue={title ? title : ''}
                placeholder="Please Enter A Title"
                maxLength={60}
                onChange={e => this.validateLength('title', e.target.value)}
                required
                invalid={this.state.validate.hasOwnProperty('title') && !this.state.validate.title}
              />
              <FormFeedback>This is a required field</FormFeedback>
            </FormGroup>

            <FormGroup>
              <Label for="description">Description</Label>
              <Input
                type="textarea"
                id="description"
                maxLength={276}
                defaultValue={description ? description : ''}
                onChange={e => this.validateLength('description', e.target.value)}
                invalid={this.state.validate.hasOwnProperty('description') && !this.state.validate.description}
              />
              <FormFeedback>This is a required field</FormFeedback>
            </FormGroup>

            <FormGroup>
              <Label for="url">URL</Label>
              <Input
                type="url"
                id="url"
                maxLength={2048}
                defaultValue={url ? url : ''}
                invalid={this.state.validate.hasOwnProperty('url') && !this.state.validate.url}
                onChange={e => {
                  const value = e.target.value;
                  let valid = validateURL(value);
                  if (!value) { valid = true; } // set valid to true for no content
                  if (valid) { this.changeAnnouncement('url', value); } // if valid set the data in announcement
                  if (!this._isMounted) { return; }
                  this.setState({ validate: { ...this.state.validate, url: valid } });
                }}
              />
              <FormFeedback>Not a valid URL</FormFeedback>
            </FormGroup>
          </Col>
        </Row>
      </div>
    );
  }
}
