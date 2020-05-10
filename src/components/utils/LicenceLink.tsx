import * as React from 'react';
import { connect } from 'react-redux';

import { Col, Row, Button } from 'reactstrap';

import { modalToggle } from 'actions/pages/privacyPolicy';

interface LicenceLinkProps {
  licence: string;
  modalToggle: Function;
}

const Details = (props: { label: string, value: string | JSX.Element }): JSX.Element => (
  <Row className="border-bottom subline details">
    <Col xs="12" md="6">{props.label}</Col>
    <Col xs="12" md="6">{props.value}</Col>
  </Row>
);

export class LicenceLink extends React.Component<LicenceLinkProps, {}> {

  render () {
    let element: JSX.Element;

    switch(this.props.licence) {
      case 'CC BY':
        element = (<Details label="License" value={<a href="https://creativecommons.org/licenses/by/4.0/legalcode" target="_blank" rel="noopener noreferrer">CC BY</a>} />);
        break;
      case 'CC BY-SA':
        element = (<Details label="License" value={<a href="https://creativecommons.org/licenses/by-sa/4.0/legalcode" target="_blank" rel="noopener noreferrer">CC BY-SA</a>} />);
        break;
      case 'CC BY-ND':
        element = (<Details label="License" value={<a href="https://creativecommons.org/licenses/by-nd/4.0/legalcode" target="_blank" rel="noopener noreferrer">CC BY-ND</a>} />);
        break;
      case 'CC BY-NC':
        element = (<Details label="License" value={<a href="https://creativecommons.org/licenses/by-nc/4.0/legalcode" target="_blank" rel="noopener noreferrer">CC BY-NC</a>} />);
        break;
      case 'CC BY-NC-SA':
        element = (<Details label="License" value={<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode" target="_blank" rel="noopener noreferrer">CC BY-NC-SA</a>} />);
        break;
      case 'CC BY-NC-ND':
        element = (<Details label="License" value={<a href="https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode" target="_blank" rel="noopener noreferrer">CC BY-NC-ND</a>} />);
        break;
      default:
        element = (<Details label="License" value={<Button style={{padding: "0px"}} size="sm" color="link" onClick={() => this.props.modalToggle('RL_MODAL', true)}>Ocean Archive</Button>} />);
    }

    return (
      element
    );
  }

}

export default connect(undefined, { modalToggle })(LicenceLink);


