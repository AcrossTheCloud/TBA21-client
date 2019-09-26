import * as React from 'react';
import { Button, Col, Row } from 'reactstrap';
import tbaLogo from 'images/logo/tba21-logo.svg';
import { AuthConsumer } from 'providers/AuthProvider';
import { Link } from 'react-router-dom';

import 'styles/layout/footer.scss';

export default class Footer extends React.Component {
  render() {
    return (
      <footer className="row text-center text-lg-left">
        <Col xs="12" md="6">
          <Row>
            <AuthConsumer>
              {({ isAuthenticated }) => (
                isAuthenticated ?
                  <></>
                  :
                  <Button color="link" tag={Link} to="/login" className="loginButton"><span className="simple-icon-login" />Login / Signup</Button>
              )}
            </AuthConsumer>
            <Col className="pt-2 py-md-0"><a href="mailto:info@ocean-archive.org">info@ocean-archive.org</a></Col>
          </Row>
        </Col>
        <Col xs="12" md="6">
          <Row>
            <Col xs="12" lg="8" className="py-md-0" />
            <Col xs="12" lg="4" className="py-2 py-md-0">
              <a href="https://www.tba21-academy.org" target="_blank" rel="noreferrer noopener"><img src={tbaLogo} alt=""/></a>
            </Col>
          </Row>
        </Col>
      </footer>
    );
  }
}
