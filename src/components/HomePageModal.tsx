import * as React from 'react';
import { connect } from 'react-redux';
import { Col, Modal, Row } from 'reactstrap';
import { isEqual } from 'lodash';

import { closeModal } from 'actions/home';

import { HomepageData } from '../reducers/home';
import { FaCircle, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import { Regions } from '../types/Item';
import { Link } from 'react-router-dom';
import { S3File } from '../types/s3File';

import 'styles/components/home.scss';
import ReactPlayer from 'react-player';

interface Props {
  data: HomepageData | undefined;
  open: boolean;
  closeModal: Function;
}

interface State {
  data?: HomepageData;
  isOpen: boolean;
}

const FilePreview = (props: { file: S3File }): JSX.Element => {
  switch (props.file.type) {
    case 'image':
      let thumbnail: string | undefined = props.file.url;
      if (props.file.thumbnails) {
        thumbnail = props.file.thumbnails['1140'] || props.file.thumbnails['960'] || props.file.thumbnails['720'] || props.file.thumbnails['540'];
      }

      const style = {
        background: `url(${thumbnail})`,
      };

      return (
        <>
          <Col md="12" className="px-0 image text-center h-100">
            <img src={thumbnail} alt="" />
            <div className="background" style={style} />
          </Col>
        </>
      );
    case 'video':
      return (
        <div className="embed-responsive embed-responsive-16by9">
          <ReactPlayer
            controls
            className="embed-responsive-item"
            url={props.file.playlist || props.file.url}
            height="auto"
            width="100%"
            vertical-align="top"
          />
        </div>
      );
    case 'pdf':
      return (
        <div className="embed-responsive embed-responsive-4by3">
          <iframe title={props.file.url} className="embed-responsive-item" src={props.file.url} />
        </div>
      );
    default:
      return <></>;
  }
};

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
              <Col xs="9">
                <FaExternalLinkAlt className="openButton white" /> <Link to={`view/${id}`} className="gray">Open</Link> {creators} <FaCircle className="dot"/> {title}
              </Col>
              <Col xs="3">
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
                    {
                      [
                        type,
                        (new Date(date).getFullYear()),
                        regions.map(r => Regions[r])
                      ].toString()
                    }
                  </div>
                  <div className="tags">
                    {!!keyword_tags ? keyword_tags.map(t => `#${t.tag_name}`).join(', ').toString() : <></>}
                    {!!concept_tags ? concept_tags.map(t => `#${t.tag_name}`).join(', ').toString() : <></>}
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
