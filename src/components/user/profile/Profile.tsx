import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  Button,
  Col,
  Container,
  CustomInput,
  Form, FormFeedback,
  FormGroup,
  Input,
  InputGroup,
  Label,
  Row,
  Spinner
} from 'reactstrap';
import { validateURL } from '../../utils/inputs/url';

import DeleteAccount from 'components/utils/user/DeleteAccount';
import ChangePassword from 'components/utils/user/ChangePassword';
import { AuthContext } from '../../../providers/AuthProvider';
import { deleteAccount, dispatchError, updateAttributes, changePassword, getCurrentUserProfile, overlayToggle } from 'actions/user/profile';
import { Alerts, ErrorMessage, SuccessMessage } from '../../utils/alerts';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import {
  countries as selectableCountries,
} from 'components/metadata/SelectOptions';

import MailChimp from '../../utils/MailChimp';
import { ProfileState } from '../../../reducers/user/profile';
import { CropperModal } from './CropperModal';
import { API } from 'aws-amplify';
import { Profile as ProfileType } from 'types/Profile';

import 'styles/components/user/profile/profile.scss';

import {OptionType} from '../../../types/SelectTypes'

interface Props extends RouteComponentProps, ProfileState {
  deleteAccount: Function;
  dispatchError: Function;
  updateAttributes: Function;
  changePassword: Function;
  getCurrentUserProfile: Function;
  overlayToggle: Function;
}

interface State extends Partial<ProfileType>, Alerts {
  email: string;
  websiteValid?: boolean;
  cropperModalOpen: boolean;
}

class Profile extends React.Component<Props, State> {
  static contextType = AuthContext;
  private _isMounted;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    this.state = {
      email: '',
      cropperModalOpen: false
    };
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;
    await this.getUserCredentials();
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  async componentDidUpdate(prevProps: Readonly<Props>): Promise<void> {
    const context: React.ContextType<typeof AuthContext> = this.context;
    if (this.props.accountDeleted) {
      try {
        await context.logout();
        this.props.history.push('/');
      } catch (e) {
        this.props.dispatchError();
      }
    }

    if (!prevProps.details && this.props.details && this._isMounted) {
      this.setState({ ...this.props.details });
    }
  }

  getUserCredentials = async (): Promise<void> => {
    const context: React.ContextType<typeof AuthContext> = this.context;
    if (!this.props.details) {
      await this.props.getCurrentUserProfile(context.uuid);
    }

    if (this._isMounted) {
      this.setState({ email: context.email, ...this.props.details });
    }
  }

  submitForm = async (): Promise<void> => {
    try {
      this.props.overlayToggle(true);
      const context: React.ContextType<typeof AuthContext> = this.context;
      const attributes = {};
      const profileAttributes = {};

      if (this._isMounted) {
        if (this.state.email !== context.email) {
          Object.assign(attributes, {'email': this.state.email});
        }

        if (Object.keys(attributes).length) {
          await this.props.updateAttributes(attributes);
        }

        [
          'social_media',
          'contributors',
          'profile_image',
          'featured_image',
          'full_name',
          'field_expertise',
          'city',
          'country',
          'biography',
          'website',
          'public_profile',
          'affiliation',
          'position',
          'contact_person',
          'contact_position',
          'contact_email'
        ].forEach( attr => {
          if (typeof this.state[attr] === 'undefined' || this.state[attr] === null) {
            return;
          } else {
            Object.assign(profileAttributes, { [attr]: this.state[attr] });
          }
        });

        if (Object.keys(profileAttributes).length) {
          await API.patch('tba21', 'profiles', {
            body: profileAttributes
          });
        }

        await this.getUserCredentials();
      }
    } catch (e) {
      if (this._isMounted) {
        this.setState({ errorMessage: 'We had an issue updating your profile.' });
      }
    } finally {
      this.props.overlayToggle(false);
    }
  }

  fieldChanged = (value: string | string[] | boolean, field: string) => {
    const state = {};
    if (
      ((typeof value === 'string' && value.length) || Array.isArray(value) || typeof value === 'boolean'
      ) && this._isMounted) {
      Object.assign(state, { [field]: value });
    }

    this.setState(state);
  }

  onChangeSocialMedia = (newValue: any, actionMeta: any) => {
    this.fieldChanged(
      (newValue && newValue.length > 0) ? newValue.filter(n => {
        let value = n.value;
        if (!(value.startsWith("http://") || value.startsWith("https://"))) {
          value = "https://"+value;
        }
        if (!validateURL(value)) {
          alert('please enter a valid web address');
          return false;
        } else {
          return true;
        }
      }).map(e => {
        let value=e.value;
        if (!(value.startsWith("http://") || value.startsWith("https://"))) {
          value = "https://"+value;
        }
        return value;
      }) : [],
      'social_media'
    );
    console.log(this.state.social_media);
  }

  render() {
    const {
      full_name,
      city,
      field_expertise,
      country,
      website,
      affiliation,
      position,
      biography,
      social_media,
      profile_type,
      profile_image,
      public_profile,
      contact_email,
      contact_person,
      contact_position,
    } = this.state;

    const context: React.ContextType<typeof AuthContext> = this.context;
    const countryList = country ? selectableCountries.find(a => a.value === country) : undefined;

    return (
      <Container id="profile">

        <ErrorMessage message={this.props.errorMessage} />
        <SuccessMessage message={this.props.successMessage} />

        <CropperModal
          imageURL={profile_image ? profile_image : undefined}
          open={this.state.cropperModalOpen}
          callback={ async (openState, updated) => {
            if (this._isMounted) {
              if (updated) {
                await this.props.getCurrentUserProfile(context.uuid);
              }
              this.setState({ cropperModalOpen: openState });
            }
          }}
        />

        {this.props.overlay ?
          <div className="overlay_fixed_middle">
            <div className="middle">
              <Spinner type="grow"/>
            </div>
          </div>
          : <></>
        }
        <Form id="user-details" onSubmit={(e) => { e.preventDefault(); this.submitForm(); }} autoComplete="off">
          <Row>
            <Col xs="12" md="4" className="pt-3">
              <div className="sticky">
                <h1>{!!full_name ? `Hey, ${full_name}` : 'Your Profile'}</h1>

                <div className="profileImage" onClick={() => {if (this._isMounted) { this.setState({ cropperModalOpen: true }); } }}>
                  {profile_image ?
                    <img src={profile_image} alt="" />
                    : <Row className="upload"><Col>Click here to upload a profile image.</Col></Row>
                  }
                </div>

                <FormGroup className="pt-4">
                  <InputGroup>
                    <CustomInput
                      type="switch"
                      id="public"
                      name="public"
                      label="Make my profile public."
                      checked={!!public_profile ? public_profile : false}
                      onChange={e => this.fieldChanged(e.target.checked, 'public_profile')}
                    />
                    <small>Untick this option if you do not wish your profile to be viewable by the general public. If you are a contributor, your uploaded content will still be visible to everyone.</small>
                  </InputGroup>
                </FormGroup>
                <Button form="user-details">Save</Button>
              </div>
            </Col>
            <Col xs="12" md="8" className="pt-3">
              <FormGroup>
                <Label for="email">Email Address</Label>
                <Input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email"
                  onChange={e => this.fieldChanged(e.target.value, 'email')}
                  defaultValue={context.email}
                />
              </FormGroup>
              <FormGroup>
                <Label for="full_name">Full Name</Label>
                <Input type="text" name="full_name" id="full_name" placeholder="Full Name" onChange={e => this.fieldChanged(e.target.value, 'full_name')} defaultValue={full_name ? full_name : ''} />
              </FormGroup>
              <FormGroup>
                <Label for="field_expertise">Field of Expertise</Label>
                <Input type="text" name="field_expertise" id="field_expertise" placeholder="Field of Expertise" onChange={e => this.fieldChanged(e.target.value, 'field_expertise')} defaultValue={field_expertise ? field_expertise : ''} />
              </FormGroup>
              <FormGroup>
                <Label for="city">City</Label>
                <Input type="text" name="city" id="city" placeholder="City" onChange={e => this.fieldChanged(e.target.value, 'city')} defaultValue={city ? city : ''} />
              </FormGroup>

              <FormGroup>
                <Label for="country">Country</Label>
                <Select
                  className="select"
                  classNamePrefix="select"
                  isSearchable
                  menuPlacement="auto"
                  placeholder="Country"
                  options={selectableCountries}
                  value={countryList ? countryList : null}
                  onChange={e => this.fieldChanged((e as OptionType).value, 'country')}
                />
              </FormGroup>

              <FormGroup>
                <Label for="biography">Biography</Label>
                <Input
                  type="textarea"
                  id="biography"
                  value={biography ? biography : ''}
                  onChange={e => this.fieldChanged(e.target.value, 'biography')}
                />
              </FormGroup>

              <FormGroup>
                <Label for="website">Website</Label>
                <Input
                  type="text"
                  name="website"
                  id="website"
                  placeholder="Website"
                  onChange={e => {
                    let value = e.target.value;
                    if (!(value.startsWith("http://") || value.startsWith("https://"))) {
                      value = "https://"+value;
                    }
                    console.log(value);
                    let valid = validateURL(value);
                    if (!value || (value && !value.length)) { valid = true; } // set valid to true for no content
                    if (valid) { this.fieldChanged(value, 'website'); } // if valid set the data in changedItem
                    if (this._isMounted) {
                      this.setState({ websiteValid: valid });
                    }
                  }}
                  invalid={!!this.state.websiteValid && !this.state.websiteValid}
                  defaultValue={website ? website : ''}
                />
                <FormFeedback>Not a valid URL</FormFeedback>
              </FormGroup>

              <FormGroup>
                <Label for="social_media">Social Media URL(s)</Label>
                <CreatableSelect
                  className="select"
                  classNamePrefix="select"
                  isMulti
                  menuPlacement="auto"
                  placeholder="Social Media"
                  onChange={this.onChangeSocialMedia}
                  value={
                    !!social_media && social_media.length > 0 ?
                      social_media.map(s => ({ value: s, label: s })) : []
                  }
                  formatCreateLabel={i => `Add new social media profile URL ${i}`}
                />
              </FormGroup>

              <FormGroup>
                <Label for="affiliation">Affiliation</Label>
                <Input type="text" name="affiliation" id="affiliation" placeholder="Affiliation" onChange={e => this.fieldChanged(e.target.value, 'affiliation')} defaultValue={affiliation ? affiliation : ''} />
              </FormGroup>

              <FormGroup>
                <Label for="position">Position</Label>
                <Input type="text" name="position" id="position" placeholder="Position" onChange={e => this.fieldChanged(e.target.value, 'position')} defaultValue={position ? position : ''} />
              </FormGroup>

              {
                ((!!profile_type && profile_type === 'Institution')) ||
                ((!!profile_type && profile_type === 'Collective')) ?
                  <>
                    <FormGroup>
                      <Label for="contact_person">Contact Person</Label>
                      <Input type="text" name="contact_person" id="contact_person" placeholder="Contact Person" onChange={e => this.fieldChanged(e.target.value, 'contact_person')} defaultValue={contact_person ? contact_person : ''} />
                    </FormGroup>
                    <FormGroup>
                      <Label for="contact_position">Contact Position</Label>
                      <Input type="text" name="contact_position" id="contact_position" placeholder="Contact Position" onChange={e => this.fieldChanged(e.target.value, 'contact_position')} defaultValue={contact_position ? contact_position : ''} />
                    </FormGroup>
                    <FormGroup>
                      <Label for="contact_email">Contact Email</Label>
                      <Input type="text" name="contact_email" id="contact_email" placeholder="Contact Email" onChange={e => this.fieldChanged(e.target.value, 'contact_email')} defaultValue={contact_email ? contact_email : ''} />
                    </FormGroup>
                  </>
                  :
                  <></>
              }

            </Col>
          </Row>
        </Form>

        <ChangePassword changePassword={this.props.changePassword} />
        <Row>
          <Col>
            <Button form="user-details">Save</Button>
          </Col>
          <Col>
            
              <DeleteAccount deleteAccountAction={this.props.deleteAccount}/>
            
          </Col>
        </Row>
        {context.email ?
          <>
            <h3>Communication Preferences</h3>
            <MailChimp email={context.email}/>
          </>
          : <></>
        }



      </Container>
    );
  }
}

const mapStateToProps = (state: { profile: Props }) => ({
  errorMessage: state.profile.errorMessage,
  successMessage: state.profile.successMessage,

  updateAttributes: state.profile.updateAttributes,
  accountDeleted: state.profile.accountDeleted,
  overlay: state.profile.overlay,

  details: state.profile.details
});

const mapDispatchToProps = {
  deleteAccount,
  dispatchError,
  updateAttributes,
  changePassword,
  getCurrentUserProfile,
  overlayToggle
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Profile));
