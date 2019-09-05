import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Col, Container, Row } from 'reactstrap';
import { debounce } from 'lodash';

import { AuthConsumer } from '../providers/AuthProvider';
import { logoDispatch, loadHomepage, loadMore, FilePreviewHome, openModal, closeModal } from 'actions/home';

import { HomePageState } from '../reducers/home';
import HomePageModal from './HomePageModal';

import Logo from './layout/Logo';
import 'styles/components/home.scss';
import { FaCircle } from 'react-icons/all';

interface Props extends HomePageState {
  logoDispatch: Function;
  loadHomepage: Function;
  loadMore: Function;
  oaHighlights: Function;
  openModal: Function;
  closeModal: Function;
}

class HomePage extends React.Component<Props, {}> {
  _isMounted;
  scrollDebounce;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    this.scrollDebounce = debounce( async () => await this.handleScroll(), 300);
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;
    window.addEventListener('scroll', this.scrollDebounce, false);

    // If we have no items go get em.
    if (!this.props.loadedItems.length) {
      await this.props.loadHomepage();
      await this.props.loadMore(this.props.items, this.props.collections, this.props.loadedItems);
    }
  }

  componentWillUnmount = () => {
    this._isMounted = false;
    window.removeEventListener('scroll', this.scrollDebounce, false);
    this.props.closeModal();
  }

  handleScroll = async () => {
    if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
      await this.props.loadMore(this.props.items, this.props.collections, this.props.loadedItems);
    }
  }

  render() {
    const { loaded_highlights, logoLoaded, loadedItems } = this.props;

    const HighlightsItemDetails = (props: { index: number }) => {
      const tags = loaded_highlights[props.index].concept_tags;
      const creators = !!loaded_highlights[props.index].creators ? loaded_highlights[props.index].creators : [];

      return (
        <>
          <div className="title-wrapper d-flex">
            {creators && creators.length ?
              <>
                <div className="creators d-none d-md-block">
                  <Link to={`/view/${loaded_highlights[props.index].s3_key}`}>
                    <span>{creators.join(', ')}</span>
                  </Link>
                </div>
                <div className="d-none d-md-block">
                  <FaCircle className="dot"/>
                </div>
              </>
              : <></>
            }
            <div className="title">
              <Link to={`/view/${loaded_highlights[props.index].s3_key}`}>
                {loaded_highlights[props.index].title}
              </Link>
            </div>
          </div>
          <div className="type">
            <Link to={`/view/${loaded_highlights[props.index].s3_key}`}>
              {loaded_highlights[props.index].type}, {new Date(loaded_highlights[props.index].date).getFullYear()}
            </Link>
          </div>
          {!!tags && tags.length ?
            <div className="tags d-none d-sm-block">
              {tags.map(t => `#${t}`).join(' ').toString()}
            </div>
            : <></>
          }
        </>
      );
    }

    return (
      <div id="home" className="flex-fill">
        <Container fluid id="header">
          <AuthConsumer>
            {({ isAuthenticated, logout }) => (
              isAuthenticated ?
                <></>
                :
                <Button color="link" tag={Link} to="/login"><span className="simple-icon-login"/> Login</Button>
            )}
          </AuthConsumer>

          <Row>
            {!!loaded_highlights[0] ?
              <Col xs="12" md={loaded_highlights.length > 1 ? 8 : 12} className="item" onClick={() => this.props.openModal(loaded_highlights[0])}>
                <div className="file">
                  <FilePreviewHome data={loaded_highlights[0]}/>
                </div>

                <div className="d-sm-none overlay">
                  <HighlightsItemDetails index={0}/>
                </div>

              </Col>
              :
              <></>
            }
            {!!loaded_highlights[1] ?
              <Col xs="12" md="4" className="item" onClick={() => this.props.openModal(loaded_highlights[1])}>
                <Row className="d-none d-sm-block">
                  <Col xs="12">
                    <div className="file">
                      <FilePreviewHome data={loaded_highlights[1]}/>
                    </div>
                    <HighlightsItemDetails index={1}/>
                  </Col>
                </Row>
                <div className="d-sm-none">
                  <div className="file">
                    <FilePreviewHome data={loaded_highlights[1]}/>
                  </div>
                  <div className="overlay">
                    <HighlightsItemDetails index={1}/>
                  </div>
                </div>
              </Col>
              :
              <></>
            }

          </Row>
          <Row>
            {!!loaded_highlights[0] ?
              <Col md="6" className="d-none d-sm-block item" onClick={() => this.props.openModal(loaded_highlights[0])}>
                <HighlightsItemDetails index={0} />
              </Col>
              : <></>
            }

            {!!loaded_highlights[2] ?
              <Col md="2" className="item" onClick={() => this.props.openModal(loaded_highlights[2])}>
                <div className="left">
                  <FilePreviewHome data={loaded_highlights[2]}/>
                </div>
              </Col>
              : <></>
            }

            {!!loaded_highlights[2] ?
              <Col md="4" className="item">
                <div onClick={() => this.props.openModal(loaded_highlights[2])}>
                  {loaded_highlights[2].type}
                </div>
                <div onClick={() => this.props.openModal(loaded_highlights[2])}>
                  {loaded_highlights[2].title}
                </div>
                <div onClick={() => this.props.openModal(loaded_highlights[0])}>
                  {loaded_highlights[0].type}, {new Date(loaded_highlights[0].date).getFullYear()}
                </div>
              </Col>
              : <></>
            }
          </Row>
        </Container>

        <Logo loaded={logoLoaded} onChange={() => this.props.logoDispatch(true)}/>

        <Container fluid id="main">
          <Row>
            {loadedItems}
          </Row>
        </Container>

        <HomePageModal data={this.props.modalData} open={this.props.isModalOpen} />
      </div>
    );
  }
}

const mapStateToProps = (state: { home: Props }) => ({
  logoLoaded: state.home.logoLoaded,

  items: state.home.items ? state.home.items : [],
  collections: state.home.collections ? state.home.collections : [],
  oa_highlight: state.home.oa_highlight ? state.home.oa_highlight : [],
  loadedItems: state.home.loadedItems,
  loaded_highlights: state.home.loaded_highlights,

  modalData: state.home.modalData,
  isModalOpen: state.home.isModalOpen
});

export default connect(mapStateToProps, { logoDispatch, loadHomepage, loadMore, openModal, closeModal })(HomePage);
