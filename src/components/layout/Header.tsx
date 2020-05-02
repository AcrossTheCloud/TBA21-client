import * as React from 'react';
import { NavLink as ReactLink, RouteComponentProps, withRouter } from 'react-router-dom';
import {
  Collapse,
  Button,
  Modal, ModalBody,
  Form, FormFeedback, Input, Label, CustomInput,
  Row, Col,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import { FaTimes } from 'react-icons/fa';
import { Alerts, ErrorMessage, SuccessMessage, WarningMessage } from '../utils/alerts';
import { AuthContext } from '../../providers/AuthProvider';
import { modalToggle as aboutModalToggle } from 'actions/pages/about';
import { modalToggle } from 'actions/pages/privacyPolicy';
import { connect } from 'react-redux';
import { validateEmail } from '../utils/inputs/email';
import { toggleOverlay } from '../../actions/loadingOverlay';
import { has } from 'lodash'; 
import jsonp from 'jsonp';

import { AuthConsumer } from '../../providers/AuthProvider';

import 'styles/layout/_navigation.scss';
import history from '../../history';

interface State extends Alerts {
  isOpen: boolean;
  mailChimpModal: boolean;
  hideMailChimp: boolean;
  email: string;
  emailInvalid?: boolean;
}

interface Props extends RouteComponentProps<{}> { 
  aboutModalToggle: Function;
  modalToggle: Function;
  toggleOverlay: Function;
}

class HeaderClass extends React.Component<Props, State> { // tslint:disable-line: no-any
  _isMounted: boolean = false;

  constructor(props: Props) { // tslint:disable-line: no-any
    super(props);

    this.state = {
      isOpen: false,
      mailChimpModal: false,
      hideMailChimp: false,
      email: ''
    };

    this.toggle = this.toggle.bind(this);
  }

  componentDidMount(): void {
    this._isMounted = true;
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  AdminRoutes(): JSX.Element {
    return (
      <UncontrolledDropdown inNavbar nav>
        <DropdownToggle nav caret>
          Admin
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem>
            <NavItem>
              <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/admin/Collections/">Collections</NavLink>
            </NavItem>
          </DropdownItem>
          <DropdownItem>
            <NavItem>
              <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/admin/Items">Items</NavLink>
            </NavItem>
          </DropdownItem>
          <DropdownItem>
            <NavItem>
              <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/admin/announcements">Announcements</NavLink>
            </NavItem>
          </DropdownItem>

          <DropdownItem divider />

          <DropdownItem>
            <NavItem>
              <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/admin/ManageUsers">Manage Users</NavLink>
            </NavItem>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  ContributorRoutes(): JSX.Element {
    return (
      <>
        <UncontrolledDropdown inNavbar nav>
          <DropdownToggle nav caret>
            Contribute
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem>
              <NavItem>
                <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/contributor/items">My Items</NavLink>
              </NavItem>
            </DropdownItem>
            <DropdownItem>
              <NavItem>
                <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/contributor/collections">My Collections</NavLink>
              </NavItem>
            </DropdownItem>
            <DropdownItem>
              <NavItem>
                <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/contributor/announcements">My Announcements</NavLink>
              </NavItem>
            </DropdownItem>

            <DropdownItem divider />

            <DropdownItem>
              <NavItem>
                <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/contributor/items/add">Add Items</NavLink>
              </NavItem>
            </DropdownItem>
            <DropdownItem>
              <NavItem>
                <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/contributor/collections/add">Add Collection</NavLink>
              </NavItem>
            </DropdownItem>
            <DropdownItem>
              <NavItem>
                <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/contributor/announcements/add">Add Announcement</NavLink>
              </NavItem>
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </>
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void {
    if (this.state.mailChimpModal && !prevState.mailChimpModal && this.state.errorMessage && this.state.hideMailChimp) {
      if (this._isMounted) {
        this.setState({hideMailChimp: false, warningMessage: undefined, errorMessage: undefined});
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
      <AuthConsumer>
        {({ isAuthenticated, authorisation, logout }) => {
          const isAdmin = (authorisation && Object.keys(authorisation).length &&  authorisation.hasOwnProperty('admin'));
          return (
            <div id="navigation">
              <Navbar dark expand="md">
                <NavbarToggler onClick={this.toggle}/>
                <Collapse isOpen={this.state.isOpen} navbar>
                  <Nav className="ml-auto" navbar>
                    <NavItem>
                      <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/">Home</NavLink>
                    </NavItem>
                    <NavItem>
                      <Button size="sm" className="nav-link btn" onClick={() => this.props.aboutModalToggle(true)}>About</Button>
                    </NavItem>
                    <NavItem>
                      <Button size="sm" className="nav-link btn" onClick={() => this.props.modalToggle('TC_MODAL', true)}>Terms of Use</Button>
                    </NavItem>
                    <NavItem>
                      <Button size="sm" className="nav-link btn" onClick={() => this.props.modalToggle('PP_MODAL', true)}>Privacy Policy</Button>
                    </NavItem>
                    <NavItem>
                      <Button size="sm" className="nav-link btn" onClick={() => this.mailChimpModalToggle}>Join Our Mailing List</Button>
                    </NavItem>

                    {isAuthenticated && isAdmin ?
                      <this.AdminRoutes />
                      : <></>
                    }

                    {isAuthenticated && (has(authorisation, 'contributor') || has(authorisation, 'admin')) ?
                      <this.ContributorRoutes />
                      : <></>
                    }

                    <NavItem>
                      <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/map">Map</NavLink>
                    </NavItem>

                    {isAuthenticated ?
                      <>
                        <NavItem>
                            <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/Profile">Profile</NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink exact tag={ReactLink} className="nav-link" activeClassName="no" to="/" onClick={logout}>
                            Logout
                          </NavLink>
                        </NavItem>
                      </>
                      :
                      history.location.pathname.match(/^\/$/i)
                      ||
                      history.location.pathname.match(/^\/view/i)
                      ||
                      history.location.pathname.match(/^\/collection/i)
                      ||
                      history.location.pathname.match(/^\/map$/i) ? <></> : (
                        <NavItem>
                          <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/login">Login</NavLink>
                        </NavItem>
                      )
                    }
                  </Nav>
                </Collapse>
              </Navbar>
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
                            disabled={this.state.hideMailChimp}
                          />
                          <FormFeedback style={this.state.emailInvalid || !this.state.email.length ? { display: 'block' } : { display: 'none' }}>
                            Email address is invalid.
                          </FormFeedback>
                        </div>
                        <div className="mc-field-group">
                          <Label htmlFor="mce-FULLNAME" className="pt-3">Full Name </Label>
                          <Input type="text" defaultValue="" name="FULLNAME" className="" id="mce-FULLNAME" disabled={this.state.hideMailChimp} />
                        </div>
                        <div className="mc-field-group">
                          <Label htmlFor="mce-MMERGE7" className="pt-3">Website </Label>
                          <Input type="url" defaultValue="" name="MMERGE7" className=" url" id="mce-MMERGE7" disabled={this.state.hideMailChimp} />
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
                          <Button type="submit" name="subscribe" id="mc-embedded-subscribe" className="button" disabled={this.state.hideMailChimp}>
                            Subscribe
                          </Button>
                        </div>
                      </div>

                    </Form>
                  </div>
                </ModalBody>
              </Modal>
            </div>
          );
        }}
      </AuthConsumer>
    );
  }
}

export default connect(undefined, { aboutModalToggle, modalToggle, toggleOverlay})(withRouter(HeaderClass));

