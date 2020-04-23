import * as React from 'react';
import { connect } from 'react-redux';
import jsonp from 'jsonp';
import { Label, Button, Col, Input, Modal, ModalBody, Row, Form, CustomInput, FormFeedback } from 'reactstrap';
import { modalToggle as aboutModalToggle } from 'actions/pages/about';
import { modalToggle } from 'actions/pages/privacyPolicy';
import { FaTimes } from 'react-icons/fa';
import { AuthContext } from '../../providers/AuthProvider';
import { validateEmail } from '../utils/inputs/email';
import { Alerts, ErrorMessage, SuccessMessage, WarningMessage } from '../utils/alerts';
import { toggleOverlay } from '../../actions/loadingOverlay';
import 'styles/layout/footer.scss';

interface Props {
  aboutModalToggle: Function;
  modalToggle: Function;
  toggleOverlay: Function;
}

interface State extends Alerts {
  mailChimpModal: boolean;
  hide: boolean;
  email: string;
  emailInvalid?: boolean;
}

class Footer extends React.Component<Props, State> {
  static contextType = AuthContext;
  _isMounted: boolean = false;

  constructor(props: Props) {
    super(props);

    this.state = {
      mailChimpModal: false,
      hide: false,
      email: ''
    };
  }

  componentDidMount(): void {
    this._isMounted = true;
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void {
    if (this.state.mailChimpModal && !prevState.mailChimpModal && this.state.errorMessage && this.state.hide) {
      if (this._isMounted) {
        this.setState({hide: false, warningMessage: undefined, errorMessage: undefined});
      }
    }
  }

  mailChimpModalToggle = () => {
    if (this._isMounted) {
      if (!this.state.mailChimpModal) {

        // Get the users email
        const context: React.ContextType<typeof AuthContext> = this.context;
        this.setState({ email: context.email || '' });
      }

      this.setState({ mailChimpModal: !this.state.mailChimpModal });
    }
  }

  emailInvalid = (email: string) => !email.length || !validateEmail(email);

  handleSubmit = async (event) => {
    event.preventDefault();

    this.props.toggleOverlay(true);

    const scrollToAlert = function() {
      if (state.warningMessage !== undefined || state.errorMessage !== undefined || state.successMessage !== undefined) {
        const alertRow = document.getElementById('mc_alerts');
        if (alertRow) {
          alertRow.scrollIntoView();
        }
      }
    };

    const state = {
      warningMessage: undefined,
      errorMessage: undefined,
      successMessage: undefined
    };

    const formData = new FormData(event.target);

    // Only a bot would fill this out ...
    const honeyBotInput = formData.get('b_8fe0e1048c67fb6cd5aa55bbf_f533c9b80d') as string;
    if (honeyBotInput && honeyBotInput.length) {
      return;
    } else {
      formData.delete('b_8fe0e1048c67fb6cd5aa55bbf_f533c9b80d');
    }

    const email = formData.get('EMAIL') as string;
    const emailInvalid = this.emailInvalid(email);

    if (emailInvalid && this._isMounted) {
      Object.assign(state, { errorMessage: 'Please enter a valid email address', emailInvalid });
      this.props.toggleOverlay(false);
      if (this._isMounted) {
        this.setState(state, function () {
          scrollToAlert();
        });
      }
    } else {
      const postData = [
        `EMAIL=${email}`
      ];

      const website = formData.get('MMERGE7');
      if (website) {
        postData.push(`MMERGE7=${website}`);
      }
      const fullname = formData.get('FULLNAME');
      if (fullname) {
        postData.push(`FULLNAME=${fullname}`);
      }
      const oceanUpdatesGroup = formData.get('group[4449][1]');
      if (oceanUpdatesGroup) {
        postData.push(`group[4449][1]=${oceanUpdatesGroup}`);
      }

      // send the request off.
      jsonp(`https://tba21.us18.list-manage.com/subscribe/post-json?u=8fe0e1048c67fb6cd5aa55bbf&id=f533c9b80d&${postData.join('&')}`, {param: 'c'}, (err, data) => {
        if (data.msg.includes('already subscribed')) {
          Object.assign(state, {warningMessage: 'Looks like you\'re already subscribed!'});
          Object.assign(state, { hide: true });
        } else if (err) {
          Object.assign(state, {errorMessage: 'We had some trouble signing you up.'});
        } else if (data.result !== 'success') {
          Object.assign(state, {errorMessage: 'We had some trouble signing you up.'});
        } else {
          Object.assign(state, {successMessage: data.msg});
        }

        Object.assign(state, { hide: true });

        this.props.toggleOverlay(false);
        if (this._isMounted) {
          this.setState(state, function () {
            scrollToAlert();
          });
        }
      });
    }
  }

  render() {
    return (
      <footer className="text-center text-lg-left">
        <Row className="mx-0">
          <Col xs="12" lg="10">
            <Row>
              <Col xs="12" lg="10" className="pt-2 py-md-0 px-lg-0">
              <Button color="link" onClick={() => this.props.modalToggle('FW_MODAL', true)}>freq_wave</Button>
                <Button color="link" onClick={() => this.props.aboutModalToggle(true)}>About</Button>
                <Button color="link" onClick={() => this.props.modalToggle('TC_MODAL', true)}>Terms Of Use</Button>
                <Button color="link" onClick={() => this.props.modalToggle('PP_MODAL', true)}>Privacy Policy</Button>
                <Button color="link" onClick={this.mailChimpModalToggle}>
                  Join Our Mailing List
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>

        <Modal id="mailChimpModal" className="blue" isOpen={this.state.mailChimpModal} backdrop scrollable centered size="lg" toggle={this.mailChimpModalToggle} >
          <Row className="header align-content-center">
            <Col xs="11" className="pl-0">Join Our Mailing List</Col>
            <Col xs={1} className="px-0">
              <div className="text-right closeIcon">
                <FaTimes className="closeButton" onClick={this.mailChimpModalToggle}/>
              </div>
            </Col>
          </Row>
          <ModalBody>
            <div id="mc_alerts">
              <ErrorMessage message={this.state.errorMessage}/>
              <SuccessMessage message={this.state.successMessage}/>
              <WarningMessage message={this.state.warningMessage}/>
            </div>
            <div id="mc_embed_signup">
              <Form id="mc_form" onSubmit={this.handleSubmit}>
                <div id="mc_embed_signup_scroll">
                  <div className="mc-field-group">
                    <Label htmlFor="mce-EMAIL">Email Address</Label>
                    <Input
                      type="email"
                      defaultValue={this.state.email}
                      name="EMAIL"
                      className="required email"
                      id="mce-EMAIL"
                      onChange={e => {
                        const emailInvalid = this.emailInvalid(e.target.value);
                        if (this._isMounted) {
                          this.setState({ emailInvalid });
                        }
                      }}
                      disabled={this.state.hide}
                    />
                    <FormFeedback style={this.state.emailInvalid || !this.state.email.length ? { display: 'block' } : { display: 'none' }}>
                      Email address is invalid.
                    </FormFeedback>
                  </div>
                  <div className="mc-field-group">
                    <Label htmlFor="mce-FULLNAME" className="pt-3">Full Name </Label>
                    <Input type="text" defaultValue="" name="FULLNAME" className="" id="mce-FULLNAME" disabled={this.state.hide} />
                  </div>
                  <div className="mc-field-group">
                    <Label htmlFor="mce-MMERGE7" className="pt-3">Website </Label>
                    <Input type="url" defaultValue="" name="MMERGE7" className=" url" id="mce-MMERGE7" disabled={this.state.hide} />
                  </div>
                  <div id="mergeRow-gdpr" className="mergeRow gdpr-mergeRow content__gdprBlock mc-field-group">
                    <div className="content__gdpr pt-3">
                      <p>Please select all the ways you would like to hear from TBA21–Academy:</p>
                      <fieldset className="mc_fieldset gdprRequired mc-field-group" name="interestgroup_field">

                        <CustomInput type="checkbox" label="Email" id="gdpr_55561" name="gdpr[55561]" className="av-checkbox" defaultValue="Y" />

                      </fieldset>
                      <p className="pt-2">You can unsubscribe at any time by clicking the link in the footer of our emails. For information about our privacy practices, please visit our website.</p>
                    </div>

                    {/*Add group*/}
                    <input type="checkbox" value="1" name="group[4449][1]" id="mce-group[4449]-4449-0" defaultChecked style={{ display: 'none' }} />

                    <div className="content__gdprLegal pt-1">
                      <p>We use Mailchimp as our marketing platform. By clicking below to subscribe, you acknowledge that your information will be transferred to Mailchimp for processing. <a href="https://mailchimp.com/legal/" target="_blank" rel="noreferrer noopener">Learn more about Mailchimp's privacy practices here.</a></p>
                    </div>
                  </div>
                  <div id="mce-responses" className="clear">
                    <div className="response" id="mce-error-response" style={{display: 'none'}} />
                    <div className="response" id="mce-success-response" style={{display: 'none'}} />
                  </div>

                  <div style={{position: 'absolute', left: '-5000px'}} aria-hidden="true">
                    <Input type="text" name="b_8fe0e1048c67fb6cd5aa55bbf_f533c9b80d" tabIndex={-1} defaultValue="" />
                  </div>
                  <div className="clear">
                    <Button type="submit" name="subscribe" id="mc-embedded-subscribe" className="button" disabled={this.state.hide}>
                      Subscribe
                    </Button>
                  </div>
                </div>

              </Form>
            </div>
          </ModalBody>
        </Modal>
      </footer>
    );
  }
}

export default connect(undefined, { aboutModalToggle, modalToggle, toggleOverlay })(Footer);
