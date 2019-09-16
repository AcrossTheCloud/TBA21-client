import * as React from 'react';
import { withCookies, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';
import { Button, Col, Container, Row } from 'reactstrap';

import 'styles/layout/privacyPolicyPopUp.scss';
import moment from 'moment';

interface Props {
  cookies: Cookies;
}

class PrivacyPolicyPopUp extends React.Component<Props, {isPrivacyPolicyAccepted: boolean}> {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  cookieVersionNumber = '_16092019'; // Change this when the PP or T&C's change.
  _isMounted;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    const { cookies } = props;

    this.state = {
      isPrivacyPolicyAccepted: !!cookies.get(`isPrivacyPolicyAccepted${this.cookieVersionNumber}`) && (cookies.get(`isPrivacyPolicyAccepted${this.cookieVersionNumber}`) === 'true')
    };
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  }

  onAcceptClick = () => {
    const expiry: Date = new Date(moment().add(3, 'M').format()); // 3 Months from now.
    this.props.cookies.set(`isPrivacyPolicyAccepted${this.cookieVersionNumber}`, true, { path: '/', expires: expiry });
    if (this._isMounted) {
      this.setState({ isPrivacyPolicyAccepted: true });
    }
  }

  render() {
    return (
      <Container fluid id="privacyPolicyPopUp" className={!this.state.isPrivacyPolicyAccepted ? 'show' : ''}>
        <Row className="align-items-center">
          <Col xs="12" lg="8">
            <p>Cookies on our website allow us to deliver better content to you, by enhancing our understanding of what content people are engaging with. We do this through Google Analytics.</p>
            <p>Read our privacy policy & terms and conditions for more information.</p>
          </Col>
          <Col xs="12" lg="4">
            <Row>
              <Col>
                <Button className="decline" block onClick={() => window.location.assign('https://www.tba21.org/')}>No, Thanks</Button>
              </Col>
              <Col>
                <Button block onClick={this.onAcceptClick}>I Agree</Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default withCookies(PrivacyPolicyPopUp);
