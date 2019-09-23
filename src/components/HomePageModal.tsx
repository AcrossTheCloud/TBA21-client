import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import {
  Col,
  Modal,
  Row
} from 'reactstrap';
import { isEqual } from 'lodash';

import { closeModal } from 'actions/home';
import { HomepageData } from '../reducers/home';
import { FaCircle, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import { Regions } from '../types/Item';

import { FilePreview } from './utils/filePreview';
import { CollectionSlider } from './collection/CollectionSlider';
import 'styles/components/home.scss';

interface Props {
  data: HomepageData | undefined;
  backData?: HomepageData;
  open: boolean;
  closeModal: Function;
}

interface State {
  isOpen: boolean;
  originalData?: HomepageData | undefined;
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

  async componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): Promise<void> {
    if (this._isMounted) {
      const state = {};

      if (this.props.open !== prevProps.open) {
        Object.assign(state, { isOpen: this.props.open });
      }

      if (!!this.props.data && !isEqual(this.props.data, prevState.originalData)) {
        Object.assign(state, { originalData : {...this.props.data} });
        const { data } = this.props;

        Object.assign(state, data);
      }

      if (Object.keys(state).length > 0) {
        this.setState(state);
      }
    }
  }

  render() {
    if (this.props.data) {
      const {
        count,
        id,
        title,
        creators,
        item_subtype,
        regions,
        keyword_tags,
        concept_tags,
        file,
        date,
        items
      } = this.props.data;

      let counter: number = !!count ? parseInt(count, 0) : 0;

      return (
        <Modal id="homePageModal" className="fullwidth" isOpen={this.props.open} backdrop toggle={() => this.props.closeModal()}>
          <div className="d-flex flex-column flex-fill mh-100">
            <Row className="header align-content-center">
              <div className="col-10 col-sm-11 title-wrapper d-flex align-content-center">
                <Link to={`/${counter ? 'collection' : 'view'}/${id}`} className="gray openButton flex-grow-0 flex-shrink-0"><FaExternalLinkAlt className="white" /></Link>
                {creators && creators.length ?
                  <>
                    <div className="creators d-none d-md-block">
                      <span className="ellipsis">{creators.join(', ')}</span>
                    </div>
                    <div className="d-none d-md-block flex-grow-0 flex-shrink-0">
                      <FaCircle className="dot"/>
                    </div>
                  </>
                  : <></>
                }
                <div className="title">
                  <span className="ellipsis">
                    {title}
                  </span>
                </div>
              </div>
              <Col xs="1">
                <div className="text-right">
                  <FaTimes className="closeButton" onClick={() => this.props.closeModal()}/>
                </div>
              </Col>
            </Row>

            <div className="info d-flex flex-column">
              {!counter ?
                <Row className="file">
                  {!!file ?
                    <FilePreview file={file}/>
                    : <></>
                  }
                </Row>
                :
                items ?
                  <CollectionSlider items={items} />
                  : <></>
              }

              <Row>
                <div className="body">
                  <div>
                    {!!item_subtype ? item_subtype : ''}
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

const mapStateToProps = (state: { home: { isModalOpen: boolean, modalData?: HomepageData } }) => ({
  data: state.home.modalData,
  open: state.home.isModalOpen
});

export default connect(mapStateToProps, { closeModal })(HomePageModal);
