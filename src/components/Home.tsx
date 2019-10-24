import * as React from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';
import { Col, Container, Row, Spinner } from 'reactstrap';
import { debounce } from 'lodash';
import { Cookies, withCookies } from 'react-cookie';

import { loadHomepage, loadMore, logoDispatch } from 'actions/home';
import { toggle as searchOpenToggle } from 'actions/searchConsole';

import { HomePageState } from '../reducers/home';
import { openModal } from '../reducers/utils/modal';

import Logo from './layout/Logo';
import moment from 'moment';

import { browser } from './utils/browser';
import Footer from './layout/Footer';
import FeedItem from './feed/FeedItem';
import AnnouncementView from './highlight/AnnouncementView';
import HighlightItem from './highlight/HighlightItem';

import 'styles/components/home.scss';

interface Props extends HomePageState {
  logoDispatch: Function;
  loadHomepage: Function;
  loadMore: Function;
  oaHighlights: Function;
  openModal: Function;
  searchOpenToggle: Function;
  cookies: Cookies;
}

interface State {
  loadCount: number;
}

class HomePage extends React.Component<Props, State> {
  _isMounted;
  scrollDebounce;
  windowHeightTimeout;
  onLoadDebounce;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;

    this.scrollDebounce = debounce(async () => await this.handleScroll(), 100);
    this.state = {
      loadCount: 0
    };
    // this.onLoad = this.onLoad.bind(this);
    this.onLoadDebounce = debounce(count => this.handleLoad(count), 100);
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;
    window.addEventListener('scroll', this.scrollDebounce, false);
    window.addEventListener('scroll', this.handleScrollMobileSearch, false);

    const { loadedCount, loadedItems, loadHomepage, loadMore } = this.props;
    this.setState({ loadCount: loadedCount });

    // If we have no items go get em.
    if (!loadedItems.length) {
      await loadHomepage();
      await loadMore();
    }
  }

  componentWillUnmount = () => {
    this._isMounted = false;
    window.removeEventListener('scroll', this.scrollDebounce, false);
    window.removeEventListener('scroll', this.handleScrollMobileSearch, false);
  };

  handleLoad(count) {
    this.setState({ loadCount: count });
  }

  async componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>
  ): Promise<void> {
    if (
      this.state.loadCount < 0 &&
      this.props.loadedMore &&
      !this.props.logoLoaded
    ) {
      this.props.logoDispatch(true);
      await this.windowHeightCheck();
    }
  }

  windowHeightCheck = async () => {
    // if the page is higher than the items and we have no scroll bar we need to get more items.
    clearTimeout(this.windowHeightTimeout);
    this.windowHeightTimeout = setTimeout(async () => {
      if (
        this.props.loadedMore &&
        (this.props.items.length ||
          this.props.collections.length ||
          this.props.audio.length) &&
        window.innerHeight + document.documentElement.scrollTop ===
          document.documentElement.offsetHeight
      ) {
        await this.props.loadMore();
        // Run again just in case
        this.windowHeightCheck();
      } else {
        clearTimeout(this.windowHeightTimeout);
      }
    }, 3000);
  };

  handleScroll = async () => {
    if (this.props.loading) {
      return;
    }
    if (
      this.props.loadedMore &&
      (!this.props.items.length &&
        !this.props.collections.length &&
        !this.props.audio.length)
    ) {
      window.removeEventListener('scroll', this.scrollDebounce, false);
      return;
    }

    const height = $(document).height() as number;
    const scrollTop = $(document).scrollTop() as number;

    if (height >= scrollTop - 200) {
      await this.props.loadMore();
    }
  };

  handleScrollMobileSearch = () => {
    const { cookies } = this.props;
    const $header = $('#header');

    if ($header && !cookies.get(`searchMobileCookie`)) {
      const headerOffset: undefined | JQuery.Coordinates = $header.offset();
      const scrollTop = $(document).scrollTop() as number;

      if (!headerOffset) {
        return;
      }
      if (
        headerOffset.top >= scrollTop &&
        headerOffset.top - 100 < scrollTop &&
        (window.innerWidth < 720 || browser() === 'ios')
      ) {
        const expiry: Date = new Date(
          moment()
            .add(2, 'w')
            .format()
        ); // 3 Months from now.
        this.props.searchOpenToggle(true);
        this.props.cookies.set(`searchMobileCookie`, true, {
          path: '/',
          expires: expiry
        });
        window.removeEventListener(
          'scroll',
          this.handleScrollMobileSearch,
          false
        );
      } else {
        window.removeEventListener(
          'scroll',
          this.handleScrollMobileSearch,
          false
        );
      }
    }
  };

  render() {
    const {
      announcements,
      highlights,
      logoLoaded,
      loadedItems,
      items,
      collections,
      audio,
      openModal
    } = this.props;
    return (
      <div id="home" className="flex-fill">
        <Container fluid id="header">
          <Row className="highlights">
            {highlights &&
              highlights.length &&
              highlights.map((ea, index) => (
                <HighlightItem
                  highlight={ea}
                  key={ea.id}
                  index={index}
                  hasMultiple={highlights.length > 1}
                  onOpenModal={openModal}
                />
              ))}
            {announcements && announcements.length && (
              <AnnouncementView announcements={announcements} />
            )}
          </Row>
        </Container>

        <Logo loaded={logoLoaded} />

        <Container fluid id="main" className="pb">
          <Row>
            {loadedItems.map((item, i) => (
              <FeedItem
                item={item}
                key={i}
                loadCount={this.state.loadCount}
                onLoad={this.onLoadDebounce}
                onOpenModal={openModal}
              />
            ))}
          </Row>
          <Row>
            {this.props.loading ? (
              <Col className="text-center pb-5">
                <Spinner
                  type="grow"
                  style={{ color: '#50E3C2', fontSize: '20px' }}
                />
              </Col>
            ) : (
              <></>
            )}
          </Row>

          {!items.length && !collections.length && !audio.length ? (
            <></>
          ) : (
            <div style={{ paddingTop: '100px' }} />
          )}
        </Container>
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = (state: { home: Props }) => ({
  logoLoaded: state.home.logoLoaded,
  loading: state.home.loading,

  items: state.home.items ? state.home.items : [],
  collections: state.home.collections ? state.home.collections : [],
  audio: state.home.audio ? state.home.audio : [],
  announcements: state.home.announcements ? state.home.announcements : [],

  oa_highlight: state.home.oa_highlight ? state.home.oa_highlight : [],
  loadedItems: state.home.loadedItems,
  loadedMore: state.home.loadedMore,
  loadedCount: state.home.loadedCount,
  highlights: state.home.highlights
});

export default connect(
  mapStateToProps,
  { logoDispatch, loadHomepage, loadMore, openModal, searchOpenToggle }
)(withCookies(HomePage));
