import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Col, Container, Row } from 'reactstrap';
import { debounce } from 'lodash';

import { AuthConsumer } from '../providers/AuthProvider';
import { logoDispatch, loadHomepage, loadMore, FileType } from 'actions/home';

import { HomePageState } from '../reducers/home';

import Logo from './layout/Logo';
import 'styles/components/home.scss';

interface Props extends HomePageState {
  logoDispatch: Function;
  loadHomepage: Function;
  loadMore: Function;
  oaHighlights: Function;
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
    if (this.props.items && !this.props.items.length) {
      await this.props.loadHomepage();
      await this.props.loadMore(this.props.items, this.props.collections, this.props.loadedItems);
    }
  }

  componentWillUnmount = () => {
    this._isMounted = false;
    window.removeEventListener('scroll', this.scrollDebounce, false);
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
              <Col xs="12" md={loaded_highlights.length > 1 ? 8 : 12}>
                <div className="file">
                  <FileType data={loaded_highlights[0]}/>
                </div>
              </Col>
              :
              <></>
            }
            {!!loaded_highlights[1] ?
              <Col xs="12" md="4">
                <Row>
                  <Col xs="12">
                    <div className="file">
                      <FileType data={loaded_highlights[1]}/>
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
              <Col md="6">
                <div className="title">
                  {loaded_highlights[0].title}
                </div>
                <div className="type">
                  {loaded_highlights[0].type}, {new Date(loaded_highlights[0].date).getFullYear()}
                </div>
                {/*{!!loaded_highlights[0].tags ?*/}
                {/*  <div className="type">*/}
                {/*    loaded_highlights[0].tags : <></>}*/}
                {/*  </div>*/}
                {/*  : <></>*/}
                {/*}*/}
              </Col>
              : <></>
            }

            {!!loaded_highlights[2] ?
              <Col md="2">
                <div className="left">
                  <FileType data={loaded_highlights[2]} />
                </div>
              </Col>
              : <></>
            }

            {!!loaded_highlights[2] ?
              <Col md="4">
                <div>
                  {loaded_highlights[2].type}
                </div>
                <div>
                  {loaded_highlights[2].title}
                </div>
                <div>
                  {loaded_highlights[0].type}, {new Date(loaded_highlights[0].date).getFullYear()}
                </div>
              </Col>
              : <></>
            }
          </Row>
        </Container>

        <Logo loaded={logoLoaded} onChange={() => this.props.logoDispatch(true)}/>

        <Container fluid>
          {loadedItems}
        </Container>

      </div>
    );
  }
}

const mapStateToProps = (state: { home: Props }) => ({
  logoLoaded: state.home.logoLoaded,

  items: state.home.items,
  collections: state.home.collections,
  oa_highlight: state.home.oa_highlight,
  loadedItems: state.home.loadedItems,
  loaded_highlights: state.home.loaded_highlights
});

export default connect(mapStateToProps, { logoDispatch, loadHomepage, loadMore })(HomePage);
