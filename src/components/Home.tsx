import * as React from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';
import { Carousel, CarouselItem, Col, Container, Row, Spinner } from 'reactstrap';
import { debounce, isEqual } from 'lodash';
import { Cookies, withCookies } from 'react-cookie';

import { loadHomepage, loadMore, logoDispatch, openModal } from 'actions/home';
import { toggle as searchOpenToggle } from 'actions/searchConsole';
import { Announcement } from '../types/Announcement';

import { HomePageState } from '../reducers/home';

import Logo from './layout/Logo';
import moment from 'moment';

import { browser } from './utils/browser';
import Footer from './layout/Footer';
import HomepageVideo from './layout/HomepageVideo';

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
  announcements: Announcement[];
  announcementsActiveIndex: number;
}

class HomePage extends React.Component<Props, State> {
  _isMounted;
  scrollDebounce;
  windowHeightTimeout;
  announcementsSlidesHeight: number = 0;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;

    this.state = {
      announcements: [],
      announcementsActiveIndex: 0
    };

    this.scrollDebounce = debounce( async () => await this.handleScroll(), 100);
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;
    window.addEventListener('scroll',  this.scrollDebounce, false);
    window.addEventListener('scroll',  this.handleScrollMobileSearch, false);

    // If we have no items go get em.
    if (!this.props.loadedItems.length) {
      await this.props.loadHomepage();
      await this.props.loadMore();
    }

    $(window).on('load resize orientationchange', this.normalizeSlideHeights);
  }

  componentWillUnmount = () => {
    this._isMounted = false;
    window.removeEventListener('scroll', this.scrollDebounce, false);
    window.removeEventListener('scroll', this.handleScrollMobileSearch, false);
  }

  async componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>): Promise<void> {
    if (this.props.loadedCount < 0 && this.props.loadedMore && !this.props.logoLoaded) {
      this.props.logoDispatch(true);
      await this.windowHeightCheck();
    }

    if (!isEqual(this.state.announcements, this.props.announcements)) {
      this.setState({ announcements: this.props.announcements }, () => this.normalizeSlideHeights());
    }
  }

  windowHeightCheck = async () => {
    // if the page is higher than the items and we have no scroll bar we need to get more items.
    clearTimeout(this.windowHeightTimeout);
    this.windowHeightTimeout = setTimeout( async () => {
      if (this.props.loadedMore && (this.props.items.length || this.props.collections.length || this.props.audio.length) && window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
        await this.props.loadMore();
        // Run again just in case
        this.windowHeightCheck();
      } else {
        clearTimeout(this.windowHeightTimeout);
      }
    }, 3000);
  }

  handleScroll = async () => {
    if (this.props.loading) { return; }
    if (this.props.loadedMore && (!this.props.items.length && !this.props.collections.length && !this.props.audio.length)) {
      window.removeEventListener('scroll', this.scrollDebounce, false);
      return;
    }

    const height = $(document).height() as number;
    const scrollTop = $(document).scrollTop() as number;

    if (height >= (scrollTop - 200)) {
      await this.props.loadMore();
    }
  }

  handleScrollMobileSearch = () => {
    const { cookies } = this.props;
    const $header = $('#header');

    if ($header && !cookies.get(`searchMobileCookie`)) {
      const headerOffset: undefined | JQuery.Coordinates = $header.offset();
      const scrollTop = $(document).scrollTop() as number;

      if (!headerOffset) { return; }
      if (
        (headerOffset.top >= scrollTop) &&
        (headerOffset.top - 100 < scrollTop)
        && (window.innerWidth < 720 || browser() === 'ios')) {
        const expiry: Date = new Date(moment().add(2, 'w').format()); // 3 Months from now.
        this.props.searchOpenToggle(true);
        this.props.cookies.set(`searchMobileCookie`, true, { path: '/', expires: expiry });
        window.removeEventListener('scroll', this.handleScrollMobileSearch, false);
      } else {
        window.removeEventListener('scroll', this.handleScrollMobileSearch, false);
      }
    }
  }

  normalizeSlideHeights = () => {
    const _self = this;
    $('.carousel').each(function() {
      const items = $('.carousel-item', this);
      // set the height
      if (!_self.announcementsSlidesHeight) {
        _self.announcementsSlidesHeight = Math.max.apply(null, items.map(function () {
          return $(this).outerHeight();
        }).get());
      }

      items.css('min-height', _self.announcementsSlidesHeight + 'px');
    });
  }

  announcementsAmountToShow (): number {
    let amountToShow: number = 1;
    if (window.innerWidth >= 540) {
      amountToShow = 2;
    }
    if (window.innerWidth >= 1000) {
      amountToShow = 3;
    }

    return amountToShow;
  }

  announcementsCarouselSlides = (): JSX.Element[] => {
    let amountToShow: number = this.announcementsAmountToShow();

    return this.state.announcements.reduce( (accumulator: Announcement[][], currentValue: Announcement, currentIndex, array: Announcement[]) => {
      if (currentIndex % amountToShow === 0) {
        accumulator.push(array.slice(currentIndex, currentIndex + amountToShow));
      }
      return accumulator;
    }, []).map((a: Announcement[], index) => (
      <CarouselItem key={`CarouselItem_${index}`}>
        <Row>
          {
            a.map((announcement: Announcement, i) => (
              <Col xs="12" sm="6" md="4" key={i} className="announcement">
                <div className="title">
                  {announcement.title}
                </div>
                <div className="description">
                  {announcement.description}
                </div>
                {!!announcement.url ?
                  <div>
                    <a href={announcement.url} target="_blank" rel="noopener noreferrer">
                      View
                      <svg width="21px" height="17px" viewBox="0 0 21 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                          <g transform="translate(-1114.000000, -760.000000)">
                            <g transform="translate(1.000000, 0.000000)">
                              <g transform="translate(1113.000000, 760.000000)">
                                <path d="M14.3596565,16.9833984 C14.277748,16.9833984 14.198766,16.9695639 14.1227082,16.9418945 C14.0466503,16.9142251 13.9793693,16.8727216 13.9208632,16.8173828 C13.8038511,16.7067052 13.7453459,16.573894 13.7453459,16.4189453 C13.7453459,16.2639966 13.8038511,16.1311854 13.9208632,16.0205078 L19.5456081,9.56692708 L14.0437254,3.24615885 C13.9267132,3.13548122 13.8682081,2.99990315 13.8682081,2.83942057 C13.8682081,2.678938 13.9267132,2.54335993 14.0437254,2.43268229 C14.1607375,2.32200465 14.3040752,2.26666667 14.4737428,2.26666667 C14.6434104,2.26666667 14.7867481,2.32200465 14.9037602,2.43268229 L20.8093328,9.16848958 C20.9263449,9.27916722 20.9848501,9.41197839 20.9848501,9.56692708 C20.9848501,9.72187577 20.9263449,9.85468695 20.8093328,9.96536458 L14.7808981,16.8173828 C14.722392,16.8727216 14.6551111,16.9142251 14.5790532,16.9418945 C14.5029953,16.9695639 14.4298638,16.9833984 14.3596565,16.9833984 Z" fill="#000" fillRule="nonzero"></path>
                                <path d="M1.38568046,9.70416667 L19.3586534,9.70416667" stroke="#000" strokeWidth="1.14932327" strokeLinecap="round"></path>
                                <path d="M1.38568046,0.6375 L1.38568046,9.70416667" stroke="#000" strokeWidth="1.14932327" strokeLinecap="round"></path>
                              </g>
                            </g>
                          </g>
                        </g>
                      </svg>
                    </a>
                  </div>
                  : <></>
                }
              </Col>
            ))
          }
        </Row>
      </CarouselItem>
    ));
  }

  announcementsCarouselNext = () => {
    if (this._isMounted) {
      const amountShown: number = this.announcementsAmountToShow();
      const total = Math.round(this.state.announcements.length / amountShown) - 1;
      const indexInt = this.state.announcementsActiveIndex + 1;

      const nextIndex = this.state.announcementsActiveIndex >= total ? 0 : indexInt;

      this.setState({announcementsActiveIndex: nextIndex});
    }
  }

  announcementsCarouselPrevious = () => {
    if (this._isMounted) {
      const amountShown: number = this.announcementsAmountToShow();
      const total = Math.round(this.state.announcements.length / amountShown) - 1;
      const indexInt = this.state.announcementsActiveIndex - 1;

      const nextIndex = this.state.announcementsActiveIndex >= total ? 0 : indexInt;

      this.setState({announcementsActiveIndex: nextIndex});
    }
  }

  render() {
    const {
      loaded_highlights,
      logoLoaded,
      loadedItems,
      items,
      collections,
      audio
    } = this.props;

    return (
      <div id="home" className="flex-fill">
        <Container fluid id="header">
          <Row className="highlights">
            {loaded_highlights}
          </Row>
        </Container>

        <HomepageVideo loaded={logoLoaded} />
        <Logo loaded={true}/>

        <Container fluid id="main" className="pb">

          <Row className="announcements">
            {this.props.announcements && this.props.announcements.length ?
              <Col>
                <h3>Announcements</h3>
                <Carousel
                  className="announcementsCarousel"
                  autoPlay
                  next={this.announcementsCarouselNext}
                  previous={this.announcementsCarouselPrevious}
                  activeIndex={this.state.announcementsActiveIndex}
                >
                  {this.announcementsCarouselSlides()}
                </Carousel>
              </Col>
              : <></>
            }
          </Row>

          <Row>
            {loadedItems}
          </Row>
          <Row>
            { this.props.loading ?
              <Col className="text-center pb-5">
                <Spinner type="grow" style={{ color: '#50E3C2', fontSize: '20px'}}/>
              </Col>
              : <></>
            }
          </Row>

          { !items.length && !collections.length && !audio.length ?
              <></>
            : <div style={{paddingTop: '100px'}} />
          }
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
  loaded_highlights: state.home.loaded_highlights
});

export default connect(mapStateToProps, { logoDispatch, loadHomepage, loadMore, openModal, searchOpenToggle })(withCookies(HomePage));
