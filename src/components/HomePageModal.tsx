import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Col, Modal, Row } from 'reactstrap';

import { isEqual } from 'lodash';

import { closeModal } from 'actions/home';
import { HomepageData } from '../reducers/home';
import { FaCircle, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import { Regions } from '../types/Item';

import { FilePreview } from './utils/FilePreview';
import 'styles/components/home.scss';

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
        concept_tags,
        file,
        date
      } = this.state.data;

      return (
        <Modal id="homePageModal" className="fullwidth" isOpen={this.props.open} backdrop toggle={() => this.props.closeModal()}>
          <div className="d-flex flex-column mh-100">
            <Row className="header align-content-center">
              <div className="col-10 col-sm-11 title-wrapper d-flex align-content-center">
                <Link to={`view/${id}`} className="gray openButton"><FaExternalLinkAlt className="white" /></Link>
                {creators && creators.length ?
                  <>
                    <div className="creators d-none d-md-block">
                      <span>{creators.join(', ')}</span>
                    </div>
                    <div className="d-none d-md-block">
                      <FaCircle className="dot"/>
                    </div>
                  </>
                  : <></>
                }
                <div className="title">
                  {title}
                </div>
              </div>
              <Col xs="1">
                <div className="text-right">
                  <FaTimes className="closeButton" onClick={() => this.props.closeModal()}/>
                </div>
              </Col>
            </Row>

            <div className="info d-flex flex-column">
              <Row className="file">
                { !!file ?
                  <FilePreview file={file}/>
                  : <></>
                }
              </Row>
              <Row>
                <div className="body">
                  <div>
                    {!!type ? type : ''}
                    {`, ${new Date(date).getFullYear()}`}
                    {
                      !!regions ? `, ${regions.map(r => Regions[r]).join(', ')}` : ''
                    }
                  </div>
                  <div className="tags">
                    {!!keyword_tags ? keyword_tags.map(t => `#${t}`).join(' ').toString() : <></>}{' '}
                    {!!concept_tags ? concept_tags.map(t => `#${t}`).join(' ').toString() : <></>}
                  </div>
                </div>
              </Row>
            </div>
          </div>
        </Modal>
      );
    } else {
      return <></>;
    }
  }
}

export default connect(null, { closeModal })(HomePageModal);
