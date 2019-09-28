import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Col, Row } from 'reactstrap';
import tbaLogo from 'images/logo/tba21-logo.svg';
import { modalToggle as aboutModalToggle } from 'actions/pages/about';
import { modalToggle } from 'actions/pages/privacyPolicy';

import 'styles/layout/footer.scss';

interface Props {
  aboutModalToggle: Function;
  modalToggle: Function;
}

class Footer extends React.Component<Props, {}> {
  render() {
    return (
      <footer className="row text-center text-lg-left">
        <Col xs="12" lg="10">
          <Row>
            <Col xs="12" lg="4" className="pt-2 py-md-0 pr-lg-0"><a href="mailto:info@ocean-archive.org">info@ocean-archive.org</a></Col>
            <Col xs="12" lg="8" className="pt-2 py-md-0 px-lg-0">
              <Button color="link" onClick={() => this.props.aboutModalToggle(true)}>About</Button>
              <Button color="link" onClick={() => this.props.modalToggle('TC_MODAL', true)}>Terms Of Use</Button>
              <Button color="link" onClick={() => this.props.modalToggle('PP_MODAL', true)}>Privacy Policy</Button>
            </Col>
          </Row>
        </Col>
        <Col xs="12" lg="2">
          <a href="https://www.tba21-academy.org" target="_blank" rel="noreferrer noopener"><img src={tbaLogo} alt=""/></a>
        </Col>
      </footer>
    );
  }
}

export default connect(undefined, { aboutModalToggle, modalToggle })(Footer);
