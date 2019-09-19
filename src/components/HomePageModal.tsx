import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import {
  Col,
  Modal,
  Row
} from 'reactstrap';
import { isEqual } from 'lodash';

import { addFilesToData, closeModal } from 'actions/home';
import { HomepageData } from '../reducers/home';
import { FaCircle, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import { Regions } from '../types/Item';

import { FilePreview } from './utils/FilePreview';
import 'styles/components/home.scss';

interface Props {
  data: HomepageData | undefined;
  backData?: HomepageData;
  open: boolean;
  closeModal: Function;
}

interface State {
  isOpen: boolean;
  carouselActiveIndex: number;
}

class HomePageModal extends React.Component<Props, State> {
  _isMounted;
  carouselAnimating;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;
    this.carouselAnimating = false;

    this.state = {
      isOpen: false,
      carouselActiveIndex: 1
    };
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  }

  async componentDidUpdate(prevProps: Readonly<Props>): Promise<void> {
    if (this._isMounted) {
      const state = {};

      if (this.props.open !== prevProps.open) {
        Object.assign(state, { isOpen: this.props.open });
      }

      if (!!this.props.data && !isEqual(this.props.data, prevProps.data)) {
        const { data } = this.props;

        // Add the file to all under items;
        if (data.items) {
          Object.assign(data, {
            items: await addFilesToData(data.items)
          });
        }

        Object.assign(state, data);
      }

      if (Object.keys(state).length > 0) {
        this.setState(state);
      }
    }
  }

  carouselOnExiting = () => {
    this.carouselAnimating = true;
  }

  carouselOnExited = () => {
    this.carouselAnimating = false;
  }

  carouselNext = () => {
    if (this.carouselAnimating || !this.props.data) { return; }
    if (this.props.data.count) {
      const count = parseInt(this.props.data.count, 0) / 5;
      const nextIndex = this.state.carouselActiveIndex === count ? 0 : this.state.carouselActiveIndex + 1;
      this.setState({carouselActiveIndex: nextIndex});
    }
  }

  carouselPrevious = () => {
    if (this.carouselAnimating || !this.props.data) { return; }
    if (this.props.data.count) {
      const count = parseInt(this.props.data.count, 0) / 5;
      const nextIndex = this.state.carouselActiveIndex === 0 ? count : this.state.carouselActiveIndex - 1;
      this.setState({carouselActiveIndex: nextIndex});
    }
  }

  carouselGoToIndex(newIndex: number) {
    if (this.carouselAnimating) { return; }
    this.setState({ carouselActiveIndex: newIndex });
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

      const masonry = (): JSX.Element[] => {
        const html: JSX.Element[] = [];
        if (items) {
          for (let i = 0; i < items.length; i++) {
            html.push(
              <Col key={i} xs="12" sm="6" md="3" className="px-0">
                {!!items[i].file ? <FilePreview file={items[i].file} /> : <></>}
              </Col>
            );
          }
          return html;
        } else { return [<></>]; }
      };

      return (
        <Modal id="homePageModal" className="fullwidth" isOpen={this.props.open} backdrop toggle={() => this.props.closeModal()}>
          <div className="d-flex flex-column mh-100">
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
                  <Row className="masonry">
                    {masonry()}
                  </Row>
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

export default connect(null, { closeModal })(HomePageModal);
