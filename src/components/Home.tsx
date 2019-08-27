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

    console.log(this.props.items);
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

    return (
      <div id="home" className="flex-fill">
        <Container fluid id="header">
          <AuthConsumer>
            {({ isAuthenticated, logout }) => (
              isAuthenticated ?
                <Button color="link" onClick={() => logout()}><span className="simple-icon-logout"/> Logout</Button>
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
              </Col>
              :
              <></>
            }
            {!!loaded_highlights[1] ?
              <Col xs="12" md="4" className="item" onClick={() => this.props.openModal(loaded_highlights[1])}>
                <Row>
                  <Col xs="12">
                    <div className="file">
                      <FilePreviewHome data={loaded_highlights[1]}/>
                    </div>
                    <div className="title">
                      {loaded_highlights[1].title}
                    </div>
                  </Col>
                </Row>
              </Col>
              :
              <></>
            }

          </Row>
          <Row>
            {!!loaded_highlights[0] ?
              <Col md="6" className="item" onClick={() => this.props.openModal(loaded_highlights[0])}>
                <div className="title">
                  <Link to={`/view/${loaded_highlights[0].s3_key}`}>
                    {loaded_highlights[0].title}
                  </Link>
                </div>
                <div className="type">
                  <Link to={`/view/${loaded_highlights[0].s3_key}`}>
                    {loaded_highlights[0].type}, {new Date(loaded_highlights[0].date).getFullYear()}
                  </Link>
                </div>
                {!!loaded_highlights[0].concept_tags ?
                  <div className="tags">
                    {loaded_highlights[0].concept_tags.map(t => t.tag_name).join(', ').toString()}
                  </div>
                  : <></>
                }
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
