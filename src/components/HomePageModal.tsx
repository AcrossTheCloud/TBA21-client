import * as React from 'react';
import { connect } from 'react-redux';
import { Col, Container, Modal, Row } from 'reactstrap';
import { isEqual } from 'lodash';

import { closeModal, FilePreview } from 'actions/home';

import { HomepageData } from '../reducers/home';
import 'styles/components/home.scss';
import { FaCircle, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import { Regions } from '../types/Item';
import { Link } from 'react-router-dom';

interface Props {
  data: HomepageData | undefined;
  open: boolean;
  closeModal: Function;
}

interface State {
  data?: HomepageData;
  isOpen: boolean;
}

class HomePageModal extends React.Component<Props, State> {
  _isMounted;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    this.state = {
      isOpen: false
    };
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    console.log('UPDATED');
    if (this._isMounted) {
      const state = {};

      if (this.props.open !== prevProps.open) {
        Object.assign(state, { isOpen: this.props.open });
      }

      if (!!this.props.data && !isEqual(this.props.data, prevProps.data)) {
        Object.assign(state, { data: this.props.data });
      }

      if (Object.keys(state).length > 0) {
        this.setState(state);
      }
    }
  }

  render() {
    if (this.state.data) {
      const {
        id,
        title,
        creators,
        type,
        regions,
        keyword_tags,
        concept_tags
      } = this.state.data;
      return (
        <Modal id="homePageModal" isOpen={this.props.open} backdrop toggle={() => this.props.closeModal()}>
          <Container>
            <Row className="header">

              <Col xs="9" className="openButton">
                  <Link to={`view/${id}`}>Open</Link> <FaExternalLinkAlt /> {creators} <FaCircle/> {title}
              </Col>
              <Col xs="3">
                <div className="text-right">
                  <FaTimes className="closeButton" onClick={() => this.props.closeModal()}/>
                </div>
              </Col>

            </Row>

            <Row>
              {!!this.state.data ? <FilePreview data={this.state.data} /> : <></>}
            </Row>

            <Row>
              <div className="body">
                {
                  [type, regions.map(r => Regions[r])].toString()
                }
                {!!keyword_tags ? keyword_tags.toString() : <></>}
                {!!concept_tags ? concept_tags.toString() : <></>}
              </div>
            </Row>
          </Container>
        </Modal>
      );
    } else {
      return <></>;
    }
  }
}

export default connect(null, { closeModal })(HomePageModal);
