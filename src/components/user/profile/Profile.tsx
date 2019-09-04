import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Button, Col, Container, Form, FormGroup, Input, Label, Row, Spinner } from 'reactstrap';
import { validateURL } from '../../utils/inputs/url';

import DeleteAccount from 'components/utils/user/DeleteAccount';
import ChangePassword from 'components/utils/user/ChangePassword';
import { AuthContext } from '../../../providers/AuthProvider';
import { deleteAccount, dispatchError, updateAttributes, changePassword, getProfileDetails } from 'actions/user/profile';
import { ErrorMessage, SuccessMessage } from '../../utils/alerts';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import {
  countries as selectableCountries,
} from 'components/metadata/SelectOptions';

import MailChimp from '../../utils/MailChimp';
import { ProfileState } from '../../../reducers/user/profile';

import 'styles/components/user/profile/profile.scss';
import { CropperModal } from './CropperModal';
import { API } from 'aws-amplify';

interface Props extends RouteComponentProps, ProfileState {
  deleteAccount: Function;
  dispatchError: Function;
  updateAttributes: Function;
  changePassword: Function;
  getProfileDetails: Function;
}

interface State {
  email: string;
  social_media?: string[];
  contributors?: string[];
  profile_image?: string;
  featured_image?: string;
  full_name?: string;
  field_expertise?: string;
  city?: string;
  country?: string;
  biography?: string;
  website?: string;
  public_profile?: boolean;
  affiliation?: string;
  position?: string;
  contact_person?: string;
  contact_position?: string;
  contact_email?: string;

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
  }

  getUserCredentials = async (): Promise<void> => {
    const context: React.ContextType<typeof AuthContext> = this.context;

    if (!this.props.details) {
      await this.props.getProfileDetails(context.uuid);
    }

    if (this._isMounted) {
      this.setState({
        email: context.email
      });
    }
  }

  submitForm = async (): Promise<void> => {
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
        if (!!this.state[attr]) {
          Object.assign(profileAttributes, { [attr]: this.state[attr] });
        }
      });

      if (profileAttributes) {
        await API.patch('tba21', 'profiles', {
          body: profileAttributes
        });
      }

      await this.getUserCredentials();

    }
  }

  fieldChanged = (value: string | string[], field: string) => {
    const state = {};
    if (value.length && this._isMounted) {
      Object.assign(state, { [field]: value });
    }

    this.setState(state);

  }

  onChangeSocialMedia = (newValue: any, actionMeta: any) => { // tslint:disable-line: no-any
    this.fieldChanged(
      newValue.length ? newValue.filter(n => validateURL(n.value)).map(e => e.value) : [],
      'social_media'
    );
  }

  render() {
    const context: React.ContextType<typeof AuthContext> = this.context;
    const { details } = this.props;
    const country = (!!details && !!details.country) ? selectableCountries.find(a => a.value === details.country) : '';

    return(
      <Container id="profile">

        <ErrorMessage message={this.props.errorMessage} />
        <SuccessMessage message={this.props.successMessage} />

        <CropperModal
          imageURL={!!details && details.profile_image ? details.profile_image : undefined}
          open={this.state.cropperModalOpen}
          callback={ async (openState, updated) => {
            if (this._isMounted) {
              console.log('context.uuid', context.uuid);
              if (updated) {
                await this.props.getProfileDetails(context.uuid);
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
        <h1>{details ? `Hey, ${details.full_name}` : 'Your Profile'}</h1>

        <Form onSubmit={(e) => { e.preventDefault(); this.submitForm(); }} autoComplete="off">
          <Row>
            <Col xs="12" md="4">
              <div className="sticky">

                <div className="profileImage" onClick={() => {if (this._isMounted) { this.setState({ cropperModalOpen: true }); } }}>
                  {!!details && details.profile_image ?
                    <img src={details.profile_image} alt="" />
                    : <>Click here to upload a profile image.</>
                  }
                </div>

                <Button>Save</Button>
              </div>
            </Col>
            <Col xs="12" md="8">
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
                <Input type="text" name="full_name" id="full_name" placeholder="Full Name" onChange={e => this.fieldChanged(e.target.value, 'full_name')} defaultValue={!!details && !!details.full_name ? details.full_name : ''} />
              </FormGroup>
              <FormGroup>
                <Label for="field_expertise">Field of Expertise</Label>
                <Input type="text" name="field_expertise" id="field_expertise" placeholder="Field of Expertise" onChange={e => this.fieldChanged(e.target.value, 'field_expertise')} defaultValue={!!details && !!details.field_expertise ? details.field_expertise : ''} />
              </FormGroup>
              <FormGroup>
                <Label for="city">City</Label>
                <Input type="text" name="city" id="city" placeholder="City" onChange={e => this.fieldChanged(e.target.value, 'city')} defaultValue={!!details && !!details.city ? details.city : ''} />
              </FormGroup>

              <FormGroup>
                <Label for="country">Country</Label>
                <Select className="select" classNamePrefix="select" isSearchable menuPlacement="auto" placeholder="Country" options={selectableCountries} defaultValue={country ? country : null} onChange={e => this.fieldChanged('country', e)} />
              </FormGroup>

              <FormGroup>
                <Label for="biography">Biography</Label>
                <Input
                  type="textarea"
                  id="biography"
                  defaultValue={!!details && !!details.biography ? details.biography : ''}
                  onChange={e => this.fieldChanged(e.target.value, 'biography')}
                />
              </FormGroup>

              <FormGroup>
                <Label for="website">Website</Label>
                <Input type="text" name="website" id="website" placeholder="Website" onChange={e => this.fieldChanged(e.target.value, 'website')} defaultValue={!!details && !!details.website ? details.website : ''} />
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
                    (!!this.state.social_media && this.state.social_media.length) ?
                      this.state.social_media.map(s => ({ value: s, label: s }))
                      : (!!details && !!details.social_media ) ? details.social_media.map(s => ({ value: s, label: s }))  : null}
                  formatCreateLabel={i => `Add new URL ${i}`}
                />
              </FormGroup>

              <FormGroup>
                <Label for="affiliation">Affiliation</Label>
                <Input type="text" name="affiliation" id="affiliation" placeholder="Affiliation" onChange={e => this.fieldChanged(e.target.value, 'affiliation')} defaultValue={!!details && !!details.affiliation ? details.affiliation : ''} />
              </FormGroup>

              <FormGroup>
                <Label for="position">Position</Label>
                <Input type="text" name="position" id="position" placeholder="Position" onChange={e => this.fieldChanged(e.target.value, 'position')} defaultValue={!!details && !!details.position ? details.position : ''} />
              </FormGroup>

              {
                (!!details && (!!details.profile_type && details.profile_type === 'Institution')) ||
                (!!details && (!!details.profile_type && details.profile_type === 'Collective')) ?
                  <>
                    <FormGroup>
                      <Label for="contact_person">Contact Person</Label>
                      <Input type="text" name="contact_person" id="contact_person" placeholder="Contact Person" onChange={e => this.fieldChanged(e.target.value, 'contact_person')} defaultValue={!!details && !!details.contact_person ? details.contact_person : ''} />
                    </FormGroup>
                    <FormGroup>
                      <Label for="contact_position">Contact Position</Label>
                      <Input type="text" name="contact_position" id="contact_position" placeholder="Contact Position" onChange={e => this.fieldChanged(e.target.value, 'contact_position')} defaultValue={!!details && !!details.contact_position ? details.contact_position : ''} />
                    </FormGroup>
                    <FormGroup>
                      <Label for="contact_email">Contact Email</Label>
                      <Input type="text" name="contact_email" id="contact_email" placeholder="Contact Email" onChange={e => this.fieldChanged(e.target.value, 'contact_email')} defaultValue={!!details && !!details.contact_email ? details.contact_email : ''} />
                    </FormGroup>
                  </>
                  :
                  <></>
              }

            </Col>
          </Row>
        </Form>

        <ChangePassword changePassword={this.props.changePassword} />

        {context.email ?
          <>
            <h3>Communication Preferences</h3>
            <MailChimp email={context.email}/>
          </>
          : <></>
        }

        <DeleteAccount deleteAccountAction={this.props.deleteAccount}/>

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
  getProfileDetails
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Profile));
