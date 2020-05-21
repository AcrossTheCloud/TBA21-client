import * as React from 'react';
import { connect } from 'react-redux';
import { AboutState } from 'reducers/pages/about';
import { modalToggle } from 'actions/pages/about';
import { ReactComponent as DecadeLogo } from '../../images/logo/decade_logo.svg';
import { Col, Modal, ModalBody, ModalHeader } from 'reactstrap';

interface Props extends AboutState  {
  modalToggle: Function;
}

const Logo = () => {
  return (
    <DecadeLogo height='200px' width='auto' />
  );
}

class About extends React.Component<Props, {}> {
  render() {
    return (
      <Modal isOpen={this.props.open} toggle={() => this.props.modalToggle()} className="fullwidth blue">
        <ModalHeader toggle={() => this.props.modalToggle()}>ABOUT</ModalHeader>
        <ModalBody>
          <Logo />
          <Col md="8">
            <h3>Ocean Archive is a new digital organism for a living ocean.</h3>
            <p>Ocean Archive is a digital platform in the making; an archive and framework for collaborative research. It brings together a multitude of Ocean voices and stories and connects those striving to nurture and protect it.</p>
          </Col>

          <Col md={{ size: 8, offset: 4 }}>
            <h3>Ocean Archive strives to expand ocean literacy in a time of great necessity.</h3>
            <p>Designed to be a pedagogical, research and storytelling tool for a broad audience, Ocean Archive translates current knowledge about the Ocean into shared language that enables us to make better decisions for urgently needed policies.</p>
          </Col>

          <Col md="8">
            <h3>Ocean Archive supports collaboration across disciplines and knowledge systems.</h3>
            <p>The platform helps artists and scientific organisations find each other. It promotes decentralised cooperation between contributors and users and connects major international initiatives to other sources of knowledge, marginalised geographies and aesthetic approaches.</p>
          </Col>

          <Col md={{ size: 8, offset: 4 }}>
            <h3>Ocean Archive furthers the conversation — without debate.</h3>
            <p>In light of recent devastating reports (IPCC’s Special Report on Oceans and Cryosphere in a Changing Climate), it is of crucial importance to bring the ocean to our collective forefront. A global consensus has been reached about the tragic impact of human activity on climate breakdown, rendering it an undeniable and undebatable fact. The data is clear — this is the time to act.</p>
          </Col>

          <Col md="8">
            <h3>Ocean Archive catalyses collective action for a living ocean.</h3>
            <p>Created to stimulate action and policy change through collaboration and education, Ocean Archive fosters synergy among art, science and policy to make a range of perspectives visible, discoverable and understandable.</p>
          </Col>

          <Col md="12" className="text-center">
            <h3>Contact</h3>
            <p>
              <a href="mailto:info@ocean-archive.org">info@ocean-archive.org</a>
            </p>
          </Col>

          <br />
          <p>Spearheaded by <a href="http://academy.tba21.org" target="_blank" rel="noopener noreferrer">TBA21–Academy</a>, an ocean initiative for all kind, Ocean Archive is being developed in collaboration with <a href="https://acrossthecloud.net" target="_blank" rel="noopener noreferrer">Across the Cloud</a>.</p>

        </ModalBody>
      </Modal>
    );
  }
}

const mapStateToProps = (state: { about: AboutState }) => ({
  open: state.about.open,
});

export default connect(mapStateToProps, { modalToggle })(About);
