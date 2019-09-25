import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Col, Container, Row } from 'reactstrap';
import { debounce } from 'lodash';
import { withCookies, Cookies } from 'react-cookie';

import { AuthConsumer } from '../providers/AuthProvider';
import { logoDispatch, loadHomepage, loadMore, openModal } from 'actions/home';
import { toggle as searchOpenToggle } from 'actions/searchConsole';

import { HomepageData, HomePageState } from '../reducers/home';

import Logo from './layout/Logo';
import { FaCircle } from 'react-icons/all';
import moment from 'moment';
import AudioPreview from './layout/audio/AudioPreview';
import { FileTypes } from '../types/s3File';
import { DetailPreview, FileStaticPreview } from './utils/DetailPreview';
import { itemType } from '../types/Item';

import 'styles/components/home.scss';
import { browser } from './utils/browser';

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

  constructor(props: Props) {
    super(props);

    this._isMounted = false;

    this.scrollDebounce = debounce( async () => await this.handleScroll(), 300);
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;
    window.addEventListener('scroll',  this.scrollDebounce, false);
    window.addEventListener('scroll',  this.handleScrollMobileSearch, false);

    // If we have no items go get em.
    if (!this.props.loadedItems.length) {
      await this.props.loadHomepage();
      await this.props.loadMore(this.props.items, this.props.collections, this.props.announcements, this.props.audio, this.props.loadedItems);
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

  waitForLoad = () => {
    if (this.props.loadedMore) { // We've loaded the OA Highlights prior to this being set.
      this.loadedCount--;
      if (!this.props.logoLoaded && this.loadedCount <= 0) {
        this.props.logoDispatch(true);
      }
    }
  }

  handleScroll = async () => {
    if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
      await this.props.loadMore(this.props.items, this.props.collections, this.props.announcements, this.props.audio, this.props.loadedItems);
    }
  }
  handleScrollMobileSearch = () => {
    const { cookies } = this.props;
    const header = document.getElementById('header');

    if (!!header && !cookies.get(`searchMobileCookie`)) {
      const headerOffset = Math.round(header.offsetHeight + header.scrollTop);
      if(
        (headerOffset > document.documentElement.scrollTop) &&
        (headerOffset - 100 < document.documentElement.scrollTop)
        && (window.innerWidth < 720 || browser() === 'ios')) {
        const expiry: Date = new Date(moment().add(2, 'w').format()); // 3 Months from now.
        this.props.searchOpenToggle(true);
        this.props.cookies.set(`searchMobileCookie`, true, { path: '/', expires: expiry });
      }
    }
  }

  HighlightsItemDetails = (props: { index: number }) => {
    const { loaded_highlights } = this.props;
    const tags = loaded_highlights[props.index].concept_tags;
    const creators = !!loaded_highlights[props.index].creators ? loaded_highlights[props.index].creators : [];

    return (
      <>
        <div className="title-wrapper d-flex">
          {creators && creators.length ?
            <>
              <div className="creators d-none d-md-block">
                  <span className="ellipsis">
                    <Link to={`/view/${loaded_highlights[props.index].id}`}>
                      <span>{creators.join(', ')}</span>
                    </Link>
                  </span>
              </div>
              <div className="d-none d-md-block">
                <FaCircle className="dot"/>
              </div>
            </>
            : <></>
          }
          <div className="title">
              <span className="ellipsis">
                <Link to={`/view/${loaded_highlights[props.index].id}`}>
                  {loaded_highlights[props.index].title}
                </Link>
              </span>
          </div>
        </div>
        <div className="type">
          <Link to={`/view/${loaded_highlights[props.index].id}`}>
            {loaded_highlights[props.index].item_subtype}, {new Date(loaded_highlights[props.index].date).getFullYear()}
          </Link>
        </div>
        {!!tags && tags.length ?
          <div className="tags d-none d-md-block">
            {tags.map(t => `#${t}`).join(' ').toString()}
          </div>
          : <></>
        }
      </>
    );
  }

  DisplayLayout = (props: {data: HomepageData}): JSX.Element => {
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
      <Col md={colSize(!!file ? file.type : '')} className="pt-4">
        {item_type === itemType.Audio || file.type === FileTypes.Audio ?
          <AudioPreview onLoad={() => this.waitForLoad()} data={{title, id, url: file.url, date, creators, item_subtype, isCollection: !!count}}/>
          :
          <div onClick={() => this.props.openModal(props.data)}>
            <DetailPreview data={props.data} onLoad={() => this.waitForLoad}/>
          </div>
        }
      </Col>
    );
  };

  render() {
    const { loaded_highlights, logoLoaded, loadedItems, announcements } = this.props;

    return (
      <div id="home" className="flex-fill">
        <Container fluid id="header">
          <AuthConsumer>
            {({ isAuthenticated, logout }) => (
              isAuthenticated ?
                <></>
                :
                <Button color="link" tag={Link} to="/login"><span className="simple-icon-login login-button" />Login / Signup</Button>
            )}
          </AuthConsumer>
          <Row>
            {!!loaded_highlights[0] ?
              <Col xs="12" md={loaded_highlights.length > 1 ? 8 : 12} className="item" onClick={() => this.props.openModal(loaded_highlights[0])}>
                <div className="file">
                  {loaded_highlights[0].file ? <FileStaticPreview file={loaded_highlights[0].file} /> : <></>}
                </div>

                <div className="d-md-none overlay">
                  <this.HighlightsItemDetails index={0}/>
                </div>

              </Col>
              :
              <></>
            }
            {!!loaded_highlights[1] ?
              <Col xs="12" md="4" className="item" onClick={() => this.props.openModal(loaded_highlights[1])}>
                <Row className="d-none d-md-block">
                  <Col xs="12">
                    <div className="file">
                      {loaded_highlights[1].file ? <FileStaticPreview file={loaded_highlights[1].file} /> : <></>}
                    </div>
                    <this.HighlightsItemDetails index={1}/>
                  </Col>
                </Row>
                <div className="d-md-none py-4 py-md-0">
                  <div className="file">
                    {loaded_highlights[1].file ? <FileStaticPreview file={loaded_highlights[1].file} /> : <></>}
                    <div className="overlay">
                      <this.HighlightsItemDetails index={1}/>
                    </div>
                  </div>
                </div>
              </Col>
              :
              <></>
            }

          </Row>
          <Row>

            {!!loaded_highlights[0] ?
              <Col md="8" className="d-none d-md-block item" onClick={() => this.props.openModal(loaded_highlights[0])}>
                <this.HighlightsItemDetails index={0} />
              </Col>
              : <></>
            }

            {announcements && announcements.length ?
              <Col md="4" className="announcement">
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
              </Col>
              : <></>
            }
          </Row>
        </Container>

        <Logo loaded={logoLoaded}/>

        <Container fluid id="main">
          <Row>
            {loadedItems.map( (e: HomepageData, i: number) => (<this.DisplayLayout key={i} data={e} />))}
          </Row>
        </Container>
      </div>
    );
  }
}

const mapStateToProps = (state: { home: Props }) => ({
  logoLoaded: state.home.logoLoaded,

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
