import * as React from 'react';
import { connect } from 'react-redux';
import { Label, Button, Col, Input, Modal, ModalBody, Row, Form, CustomInput } from 'reactstrap';
import tbaLogo from 'images/logo/tba21-logo.svg';
import { modalToggle as aboutModalToggle } from 'actions/pages/about';
import { modalToggle } from 'actions/pages/privacyPolicy';
import { AuthContext } from '../../providers/AuthProvider';

import 'styles/layout/footer.scss';

interface Props {
  aboutModalToggle: Function;
  modalToggle: Function;
}

interface State {
  mailChimpModal: boolean;
  email: string;
}

class Footer extends React.Component<Props, State> {
  static contextType = AuthContext;
  _isMounted: boolean = false;

  constructor(props: Props) {
    super(props);

    this.state = {
      mailChimpModal: false,
      email: ''
    };
  }

  componentDidMount(): void {
    this._isMounted = true;
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  mailChimpScripts() {
    const mcValidate = document.getElementById('mcValidate');
    if (!mcValidate) {
      const mcValidateScript = document.createElement('script');
      mcValidateScript.src = 'https://s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js';
      mcValidateScript.async = true;
      mcValidateScript.id = 'mcValidate';
      document.body.appendChild(mcValidateScript);

      mcValidateScript.onload = () => {
        const mcInline = document.getElementById('mcInline');
        if (!mcInline) {
          const mcInlineScript = document.createElement('script');
          mcInlineScript.type = 'text/javascript';
          mcInlineScript.async = true;
          mcInlineScript.id = 'mcInline';
          mcInlineScript.innerHTML = `(function($) {window.fnames = new Array(); window.ftypes = new Array();fnames[0]='EMAIL';ftypes[0]='email';fnames[1]='FNAME';ftypes[1]='text';fnames[2]='LNAME';ftypes[2]='text';fnames[3]='ADDRESS';ftypes[3]='address';fnames[4]='PHONE';ftypes[4]='phone';fnames[5]='FULLNAME';ftypes[5]='text';fnames[6]='MMERGE6';ftypes[6]='text';fnames[7]='MMERGE7';ftypes[7]='url';fnames[8]='MMERGE8';ftypes[8]='text';}(jQuery)); var $mcj = jQuery.noConflict(true);`;
          document.body.appendChild(mcInlineScript);
        }

      };
    }
  }

  mailChimpModalToggle = () => {
    if (this._isMounted) {
      if (!this.state.mailChimpModal) {
        this.mailChimpScripts();

        // Get the users email
        const context: React.ContextType<typeof AuthContext> = this.context;
        this.setState({ email: context.email || '' });
      }
      this.setState({ mailChimpModal: !this.state.mailChimpModal });
    }
  }

  render() {
    return (
      <footer className="text-center text-lg-left">
        <Row className="mx-0">
          <Col xs="12" lg="10">
            <Row>
              <Col xs="12" lg="4" className="pt-2 py-md-0 pr-lg-0"><a href="mailto:info@ocean-archive.org">info@ocean-archive.org</a></Col>
              <Col xs="12" lg="8" className="pt-2 py-md-0 px-lg-0">
                <Button color="link" onClick={() => this.props.aboutModalToggle(true)}>About</Button>
                <Button color="link" onClick={() => this.props.modalToggle('TC_MODAL', true)}>Terms Of Use</Button>
                <Button color="link" onClick={() => this.props.modalToggle('PP_MODAL', true)}>Privacy Policy</Button>
                <Button color="link" onClick={this.mailChimpModalToggle}>
                  Join Our Mailing List
                </Button>
              </Col>
            </Row>
          </Col>
          <Col xs="12" lg="2">
            <a href="https://www.tba21-academy.org" target="_blank" rel="noreferrer noopener"><img src={tbaLogo} alt=""/></a>
          </Col>
        </Row>

        <Modal isOpen={this.state.mailChimpModal} backdrop scrollable centered size="lg" toggle={this.mailChimpModalToggle} >
          <ModalBody>
            <div id="mc_embed_signup">
              <Form
                action="https://tba21.us18.list-manage.com/subscribe/post?u=8fe0e1048c67fb6cd5aa55bbf&amp;id=f533c9b80d"
                method="post"
                id="mc-embedded-subscribe-form"
                name="mc-embedded-subscribe-form"
                className="validate"
                noValidate
              >
                <div id="mc_embed_signup_scroll">
                  <div className="indicates-required"><span className="asterisk">*</span> indicates required</div>
                  <div className="mc-field-group">
                    <Label htmlFor="mce-EMAIL">Email Address <span className="asterisk">*</span></Label>
                    <Input type="email" defaultValue={this.state.email} name="EMAIL" className="required email" id="mce-EMAIL" />
                  </div>
                  <div className="mc-field-group">
                    <Label htmlFor="mce-FULLNAME">Full Name </Label>
                    <Input type="text" defaultValue="" name="FULLNAME" className="" id="mce-FULLNAME" />
                  </div>
                  <div className="mc-field-group">
                    <Label htmlFor="mce-MMERGE7">Website </Label>
                    <Input type="url" defaultValue="" name="MMERGE7" className=" url" id="mce-MMERGE7" />
                  </div>
                  <div id="mergeRow-gdpr" className="mergeRow gdpr-mergeRow content__gdprBlock mc-field-group">
                    <div className="content__gdpr">
                      <Label>Marketing Permissions</Label>
                      <p>Please select all the ways you would like to hear from TBA21–Academy:</p>
                      <fieldset className="mc_fieldset gdprRequired mc-field-group" name="interestgroup_field">

                        <CustomInput type="checkbox" label="Email" id="gdpr_55561" name="gdpr[55561]" className="av-checkbox" defaultValue="Y" />

                        <CustomInput type="checkbox" label="Direct Mail" id="gdpr_55565" name="gdpr[55565]" className="av-checkbox" defaultValue="Y" />

                        <CustomInput type="checkbox" label="Customized Online Advertising" id="gdpr_55569" name="gdpr[55569]" className="av-checkbox" defaultValue="Y" />

                      </fieldset>
                      <p className="pt-2">You can unsubscribe at any time by clicking the link in the footer of our emails. For information about our privacy practices, please visit our website.</p>
                    </div>

                    {/*Tag insert*/}
                    <input type="checkbox" value="8" name="group[127205][40721]" checked />

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
                    <Button type="submit" name="subscribe" id="mc-embedded-subscribe" className="button">
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

export default connect(undefined, { aboutModalToggle, modalToggle })(Footer);
