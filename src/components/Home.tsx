import * as React from 'react';
import $ from 'jquery';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Col, Container, Row, Spinner } from 'reactstrap';
import { debounce } from 'lodash';
import { Cookies, withCookies } from 'react-cookie';

import { loadHomepage, loadMore, logoDispatch, openModal } from 'actions/home';
import { toggle as searchOpenToggle } from 'actions/searchConsole';

import { HomepageData, HomePageState } from '../reducers/home';

import Logo from './layout/Logo';
import { FaCircle, FaPlay } from 'react-icons/all';
import moment from 'moment';
import AudioPreview from './layout/audio/AudioPreview';
import { FileTypes } from '../types/s3File';
import { DetailPreview, FileStaticPreview } from './utils/DetailPreview';
import { itemType } from '../types/Item';

import { browser } from './utils/browser';
import Footer from './layout/Footer';

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

class HomePage extends React.Component<Props, {}> {
  _isMounted;
  loadedCount: number = 0;
  scrollDebounce;
  windowHeightTimeout;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;

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
      this.loadedCount = this.props.loadedItems.filter(t => (t.item_type === itemType.PDF || t.item_type === itemType.Text || t.item_type === itemType.DownloadText)).length;
    }
  }

  componentWillUnmount = () => {
    this._isMounted = false;
    window.removeEventListener('scroll', this.scrollDebounce, false);
    window.removeEventListener('scroll', this.handleScrollMobileSearch, false);
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void {
    if (this.loadedCount === 0 && this.props.loadedMore) {
      this.loadedCount = this.props.loadedItems.length;
    }
  }

  waitForLoad = async () => {
    if (this.props.loadedMore) { // We've loaded the OA Highlights prior to this being set.
      this.loadedCount--;
      if (!this.props.logoLoaded && this.loadedCount <= 0) {
        this.props.logoDispatch(true);
        await this.windowHeightCheck();
      }
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
      if(
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

  HighlightsItemDetails = (props: { index: number }) => {
    const { loaded_highlights } = this.props;
    const tags = loaded_highlights[props.index].concept_tags;
    const creators = !!loaded_highlights[props.index].creators ? loaded_highlights[props.index].creators : [];

    return (
      <>
        <div className="title-wrapper d-flex" onClick={() => this.props.openModal(loaded_highlights[props.index])}>
          {creators && creators.length ?
            <div className="creators">
              {creators[0]}{creators.length > 1 ? <em>, et al.</em> : <></>}
            </div>
            : <></>
          }
          {creators && creators.length ?
            <div className="d-none d-md-block dotwrap">
              <FaCircle className="dot"/>
            </div>
            : <></>
          }
          <div className="title" onClick={() => this.props.openModal(loaded_highlights[props.index])}>
            {loaded_highlights[props.index].title}
          </div>
        </div>
        <div className="type" onClick={() => this.props.openModal(loaded_highlights[props.index])}>
          {loaded_highlights[props.index].item_subtype}, {new Date(loaded_highlights[props.index].date).getFullYear()}
        </div>
        {!!tags && tags.length ?
          <div className="tags d-none d-lg-block">
            {tags.map(t => `#${t}`).join(' ').toString()}
          </div>
          : <></>
        }
      </>
    );
  }

  DisplayLayout = (props: {data: HomepageData}): JSX.Element => {
    const {
      file,
      item_type
    } = props.data;

    if (!file) { return <></>; }

    const colSize = (fileType: string): number => {
      switch (fileType) {
        case 'Audio':
          return 12;

        case 'Video':
          return 8;

        default:
          return 4;
      }
    };

    return (
      <Col lg={colSize(!!file ? file.type : '')} className="pt-4">
        {item_type === itemType.Audio || file.type === FileTypes.Audio ?
            <this.audioPreview data={props.data} />
          :
          <div onClick={() => this.props.openModal(props.data)}>
            <DetailPreview data={props.data} onLoad={() => this.waitForLoad}/>
          </div>
        }
      </Col>
    );
  };

  audioPreview = (props: { data: HomepageData }) => {
    const {
      id,
      count,
      item_subtype,
      item_type,
      title,
      file,
      creators,
      date
    } = props.data;

    return (
      <>
        {item_type === itemType.Audio || (!!file && file.type === FileTypes.Audio) ?
          !!count && count > 0 ?
            <div onClick={() => this.props.openModal(props.data)}>
              <AudioPreview noClick data={{title, id, url: file.url, date, creators, item_subtype, isCollection: !!count}}/>
            </div> :
            <AudioPreview data={{title, id, url: file.url, date, creators, item_subtype, isCollection: !!count}}/>
          : <></>
        }
      </>
    );
  }

  render() {
    const {
      loaded_highlights,
      logoLoaded,
      loadedItems,
      announcements,
      items,
      collections,
      audio
    } = this.props;

    return (
      <div id="home" className="flex-fill">
        <Container fluid id="header">
          <Row className="highlights">
            {!!loaded_highlights[0] ?
              <Col xs="12" lg={loaded_highlights.length > 1 ? 8 : 12} className="item" onClick={() => { if (loaded_highlights[0].item_type !== itemType.Audio || (loaded_highlights[0].file && loaded_highlights[0].file.type) !== FileTypes.Audio) { this.props.openModal(loaded_highlights[0]); }}}>
                <div className="file">
                  {
                    loaded_highlights[0].file ?
                      loaded_highlights[0].item_type === itemType.Audio || loaded_highlights[0].file.type === FileTypes.Audio ?
                        <this.audioPreview data={loaded_highlights[0]} />
                        :
                        <FileStaticPreview file={loaded_highlights[0].file} />
                      : <></>
                  }
                  {loaded_highlights[0].file.type === FileTypes.Video ?
                    <div className="middle">
                      <FaPlay/>
                    </div>
                    : <></>}
                </div>

                <div className="overlay">
                  <this.HighlightsItemDetails index={0}/>
                </div>

              </Col>
              :
              <></>
            }
            {!!loaded_highlights[1] ?
              <Col xs="12" lg="4" className="item" onClick={() => { if (loaded_highlights[1].item_type !== itemType.Audio || (loaded_highlights[1].file && loaded_highlights[1].file.type) !== FileTypes.Audio) { this.props.openModal(loaded_highlights[1]); }}}>
                <Row className="d-none d-lg-block">
                  <Col xs="12">
                    <div className="file">
                      {
                        loaded_highlights[1].file ?
                          loaded_highlights[1].item_type === itemType.Audio || loaded_highlights[1].file.type === FileTypes.Audio ?
                            <this.audioPreview data={loaded_highlights[1]} />
                            :
                            <FileStaticPreview file={loaded_highlights[1].file} />
                          : <></>
                      }
                      {loaded_highlights[1].file.type === FileTypes.Video ?
                        <div className="middle">
                          <FaPlay/>
                        </div>
                        : <></>}

                    </div>
                    <this.HighlightsItemDetails index={1}/>
                  </Col>
                </Row>
                <div className="d-lg-none py-4 py-lg-0">
                  <div className="file">
                    {
                      loaded_highlights[1].file ?
                        loaded_highlights[1].item_type === itemType.Audio || loaded_highlights[1].file.type === FileTypes.Audio ?
                          <this.audioPreview data={loaded_highlights[1]} />
                          :
                          <FileStaticPreview file={loaded_highlights[1].file} />
                        : <></>
                    }
                    {loaded_highlights[1].file.type === FileTypes.Video ?
                      <div className="middle">
                        <FaPlay/>
                      </div>
                      : <></>}
                    <div className="overlay">
                      <this.HighlightsItemDetails index={1}/>
                    </div>
                  </div>
                </div>

                {announcements && announcements.length ?
                  <div className="announcement pt-4 pt-lg-5">
                    <div className="type">
                      Announcement
                    </div>
                    <div className="title">
                      {announcements[0].title}
                    </div>
                    <div className="description">
                      {announcements[0].description}
                    </div>
                    {!!announcements[0].url ?
                      <div>
                        <a href={announcements[0].url} target="_blank" rel="noopener noreferrer">
                          View
                          <svg width="21px" height="17px" viewBox="0 0 21 17" version="1.1" xmlns={"http://www.w3.org/2000/svg"} xmlnsXlink="http://www.w3.org/1999/xlink">
                            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                              <g transform="translate(-1114.000000, -760.000000)">
                                <g transform="translate(1.000000, 0.000000)">
                                  <g transform="translate(1113.000000, 760.000000)">
                                    <path d="M14.3596565,16.9833984 C14.277748,16.9833984 14.198766,16.9695639 14.1227082,16.9418945 C14.0466503,16.9142251 13.9793693,16.8727216 13.9208632,16.8173828 C13.8038511,16.7067052 13.7453459,16.573894 13.7453459,16.4189453 C13.7453459,16.2639966 13.8038511,16.1311854 13.9208632,16.0205078 L19.5456081,9.56692708 L14.0437254,3.24615885 C13.9267132,3.13548122 13.8682081,2.99990315 13.8682081,2.83942057 C13.8682081,2.678938 13.9267132,2.54335993 14.0437254,2.43268229 C14.1607375,2.32200465 14.3040752,2.26666667 14.4737428,2.26666667 C14.6434104,2.26666667 14.7867481,2.32200465 14.9037602,2.43268229 L20.8093328,9.16848958 C20.9263449,9.27916722 20.9848501,9.41197839 20.9848501,9.56692708 C20.9848501,9.72187577 20.9263449,9.85468695 20.8093328,9.96536458 L14.7808981,16.8173828 C14.722392,16.8727216 14.6551111,16.9142251 14.5790532,16.9418945 C14.5029953,16.9695639 14.4298638,16.9833984 14.3596565,16.9833984 Z" fill="#FFFFFF" fillRule="nonzero"></path>
                                    <path d="M1.38568046,9.70416667 L19.3586534,9.70416667" stroke="#FFFFFF" strokeWidth="1.14932327" strokeLinecap="round"></path>
                                    <path d="M1.38568046,0.6375 L1.38568046,9.70416667" stroke="#FFFFFF" strokeWidth="1.14932327" strokeLinecap="round"></path>
                                  </g>
                                </g>
                              </g>
                            </g>
                          </svg>
                        </a>
                      </div>
                      : <></>
                    }
                  </div>
                  : <></>
                }
              </Col>
              :
              <></>
            }

          </Row>
        </Container>

        <Logo loaded={logoLoaded}/>

        <Container fluid id="main">
          <Row>
            {loadedItems.map( (e: HomepageData, i: number) => (<this.DisplayLayout key={i} data={e} />))}
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
              <Footer />
            : <div style={{paddingTop: '100px'}}></div>
          }
        </Container>
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
  loaded_highlights: state.home.loaded_highlights
});

export default connect(mapStateToProps, { logoDispatch, loadHomepage, loadMore, openModal, searchOpenToggle })(withCookies(HomePage));
