import * as React from 'react';
import { connect } from 'react-redux';
import AsyncSelect from 'react-select/async';
import { withCookies, Cookies } from 'react-cookie';
import $ from 'jquery';
import { debounce } from 'lodash';
import { API } from 'aws-amplify';
import { FaTimes } from 'react-icons/fa';
import { uniqBy } from 'lodash';
import { Col, Row, Container, Modal, ModalBody, Spinner } from 'reactstrap';
import { SearchConsoleState } from '../../reducers/searchConsole'; // Props from Redux.

import {
  search as dispatchSearch,
  loadMoreResults,
  changeView,
  CriteriaOption,
  toggle,
  getConceptTags
} from '../../actions/searchConsole'; // Props from Redux.

import { find } from 'lodash';
import ViewItem from '../item/ViewItem';
import AudioPlayer from '../layout/audio/AudioPlayer';
import { Bubble } from './Bubble';
import AudioPreview from '../layout/audio/AudioPreview';
import { fetchItem } from '../../actions/items/viewItem';
import { fetchCollection } from 'actions/collections/viewCollection';
import { FileTypes } from '../../types/s3File';
import { instanceOf } from 'prop-types';
import { FileStaticPreview } from '../utils/DetailPreview';

import { Item } from '../../types/Item';
import { Collection } from '../../types/Collection';
import { Profile } from '../../types/Profile';
import ViewCollection from '../collection/ViewCollection';
import ViewProfile from '../user/profile/ViewProfile';
import { fetchProfile } from '../../actions/user/viewProfile';
import { browser } from '../utils/browser';
import { dateFromTimeYearProduced } from '../../actions/home';
import { APITag } from '../metadata/Tags';

import 'styles/components/search/searchConsole.scss';
import 'styles/components/admin/tables/modal.scss';

import dateFromTimeYearProduced from '../utils/date-from-time-year-produced';


interface Props extends SearchConsoleState {
  changeView: Function;
  dispatchSearch: Function;
  loadMoreResults: Function;
  fetchItem: Function;
  fetchCollection: Function;
  fetchProfile: Function;
  toggle: Function;
  getConceptTags: Function;
  cookies: Cookies;
}

interface State {
  hover: boolean;
  searchMenuOpen: boolean;
  searchInputValue: string;
  criteria: CriteriaOption[];
  selectedCriteria: CriteriaOption[];
  focus_arts: boolean;
  focus_action: boolean;
  focus_scitech: boolean;
  modalOpen: boolean;
  loading: boolean;
  modalType?: 'Item' | 'Collection' | 'Profile';
  searchMobileCookie: boolean;
}

const createCriteriaOption = (label: string, field: string): CriteriaOption => {
  let displayField = field.split('_').join(' ');
  if (field === 'full_name') {
    displayField = 'Profile';
  }
  return {
    label: `${label} (${displayField})`,
    originalValue: label,
    value: `${label} (${displayField})`,
    field
  };
};

const FilePreview = (props: { data: any }) => {
  // tslint:disable-line: no-any
  if (props.data.file.type === FileTypes.Audio) {
    const {
      id,
      count,
      item_subtype,
      title,
      file,
      creators,
      year_produced,
      time_produced
    } = props.data;

    const date = dateFromTimeYearProduced(time_produced, year_produced);
    return (
      <AudioPreview
        data={{
          title,
          id,
          url: file.url,
          date,
          creators,
          item_subtype,
          isCollection: !!count
        }}
      />
    );
  } else {
    return <FileStaticPreview file={props.data.file} />;
  }
};

class SearchConsole extends React.Component<Props, State> {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  scrollDebounce;
  _isMounted;
  searchTimeout;
  searchInputRef;
  resultsHeightTimeout;
  tagClickedTimeout;

  constructor(props: Props) {
    super(props);

    const { cookies } = this.props;

    this.searchInputRef = React.createRef();
    this._isMounted = false;

    this.state = {
      hover: true,
      searchMenuOpen: false,
      searchInputValue: '',
      criteria: [],
      selectedCriteria: [],

      focus_arts: false,
      focus_action: false,
      focus_scitech: false,

      modalOpen: false,
      loading: false,

      searchMobileCookie:
        !!cookies.get(`searchMobileCookie`) &&
        cookies.get(`searchMobileCookie`) === 'true'
    };

    this.scrollDebounce = debounce(
      async () => await this.handleResultsScroll(),
      100
    );
  }

  componentDidMount(): void {
    this._isMounted = true;
    this.props.getConceptTags();
    const searchConsoleBody = document.getElementById('searchConsole');
    if (searchConsoleBody) {
      searchConsoleBody.addEventListener('scroll', this.scrollDebounce, true);
    }
  }

  componentWillUnmount(): void {
    this._isMounted = false;
    const searchConsoleBody = document.getElementById('searchConsole');
    if (searchConsoleBody) {
      searchConsoleBody.removeEventListener(
        'scroll',
        this.scrollDebounce,
        false
      );
    }
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>
  ): void {
    if (this.props.open !== prevProps.open) {
      if (this.props.open) {
        $('body').addClass('searchOpen');
        this.searchInputRef.current.select.select.focus();
      } else {
        // Remove the height from the results on closed.
        this.animateResults(false);
        $('body').removeClass('searchOpen');
      }
    }

    // If we have results open it up
    if (this.props.loadedResults.length && this.props.open) {
      this.animateResults(true);
      this.windowHeightCheck();
    }
  }

  windowHeightCheck = async () => {
    // if the page is higher than the items and we have no scroll bar we need to get more items.
    clearTimeout(this.resultsHeightTimeout);
    this.resultsHeightTimeout = setTimeout(async () => {
      const $results = $('#searchConsole .results');
      const height = $results.height();
      const windowHeight = $(window).height();

      if (this.props.loadedResults.length < this.props.results.length) {
        if (windowHeight && height && height < windowHeight) {
          await this.props.loadMoreResults();
          // Run again just in case
          this.windowHeightCheck();
        }
      } else {
        clearTimeout(this.resultsHeightTimeout);
      }
    }, 3000);
  };

  animateResults = (open: boolean) => {
    const $results = $('#searchConsole .results');

    if (open) {
      const resultsHeight = $results.get(0).scrollHeight;
      if (!$results.hasClass('animated')) {
        $results
          .stop(true)
          .animate(
            { height: resultsHeight > 500 ? 500 : resultsHeight },
            1000,
            () => {
              $results
                .stop(true)
                .height('auto')
                .addClass('animated');
            }
          );
      }
    } else {
      if (this.props.loadedResults.length) {
        $results.stop(true).height(500);
      }
      $results
        .stop(true)
        .animate({ height: 0 }, 1000)
        .removeClass('animated');
    }
  };

  handleResultsScroll = async () => {
    const $results = $('#searchConsole .results');
    const height = $results.outerHeight();
    const scrollTopOffset: undefined | JQuery.Coordinates = $results.offset();

    if (!scrollTopOffset || !height) {
      return;
    }

    if (this.props.loadedResults.length < this.props.results.length) {
      let calcOffset = Math.abs(scrollTopOffset.top + scrollTopOffset.top);
      if (this.props.offset <= 10) {
        calcOffset = calcOffset + 500;
      }

      if (height && calcOffset > height && !this.props.searchResultsLoading) {
        try {
          await this.props.loadMoreResults();
        } catch (e) {
          return;
        }
      }
    }
  };

  toggleHover = (open?: boolean) => {
    if (!this._isMounted) {
      return;
    }
    if (!this.props.open) {
      if (window.innerWidth < 540) {
        this.toggleOpen();
      } else {
        this.setState({ hover: open || !this.state.hover });
      }
    }
  };

  toggleOpen = () => {
    this.props.toggle(!this.props.open);
  };

  touchDeviceOpen = () => {
    if (!this._isMounted) {
      return;
    }
    if (!this.props.open && window.innerWidth <= 540) {
      this.props.toggle(true);
    }
  };

  searchSuggestions = (input: string) => {
    if (!this._isMounted) {
      clearTimeout(this.searchTimeout);
      return;
    }
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    return new Promise(resolve => {
      this.searchTimeout = setTimeout(async () => {
        clearTimeout(this.searchTimeout);
        if (!this._isMounted) {
          return;
        }

        let suggestions = await API.get('tba21', 'pages/search', {
          queryStringParameters: { query: input }
        });
        const keywordTags = await API.get('tba21', 'tags', {
          queryStringParameters: { query: input, limit: 50, type: 'keyword' }
        });
        const conceptTags = await API.get('tba21', 'tags', {
          queryStringParameters: { query: input, limit: 1000, type: 'concept' }
        });

        suggestions = suggestions.results.map(t =>
          createCriteriaOption(t.value, t.field)
        );
        suggestions = uniqBy(suggestions, (e: CriteriaOption) => e.field);
        const results = [
          ...suggestions,
          ...keywordTags.tags.map(t =>
            createCriteriaOption(t.tag_name, 'keyword_tag')
          ),
          ...conceptTags.tags.map(t =>
            createCriteriaOption(t.tag_name, 'concept_tag')
          )
        ];

        // Return the results to React Select
        this.setState({ criteria: results });
        resolve(results);
      }, 500);
    });
  };

  /**
   * Pulls the values from the search input ref. So we don't rely on waiting for state to update.
   * Then dispatches the redux action.
   */
  searchDispatch = () => {
    this.animateResults(false);
    if (
      this.props.open &&
      this.state.selectedCriteria &&
      this.state.selectedCriteria.length
    ) {
      this.props.dispatchSearch(
        this.state.selectedCriteria,
        this.state.focus_arts,
        this.state.focus_action,
        this.state.focus_scitech
      );
    }
  };

  onSearchChange = (tagsList: any, actionMeta: any) => {
    // tslint:disable-line: no-any
    if (!this._isMounted) {
      return;
    }

    if (actionMeta.action === 'clear') {
      this.setState({ selectedCriteria: [], searchMenuOpen: false });
    }

    if (
      actionMeta.action === 'remove-value' ||
      actionMeta.action === 'select-option' ||
      actionMeta.action === 'create-option'
    ) {
      this.setState({ selectedCriteria: tagsList, searchMenuOpen: false });
    }
  };

  onTagClick = (tag: APITag) => {
    clearTimeout(this.tagClickedTimeout);

    const tagList = [
      ...this.state.selectedCriteria,
      createCriteriaOption(tag.tag_name, 'concept_tag')
    ];

    if (this._isMounted) {
      this.setState({selectedCriteria: tagList, searchMenuOpen: false});
    }

    this.tagClickedTimeout = setTimeout(this.searchDispatch, 2000);
  }

  onSearchKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!this.state.searchMenuOpen && event.key === 'Enter') {
      this.searchDispatch();
      event.preventDefault();
    }
  };

  focusSearchInput = () => {
    if (!this._isMounted || this.props.open) {
      return;
    }
    this.props.toggle(!this.props.open);
  };

  toggleModal = () => {
    this.setState(prevState => ({
      modalOpen: !prevState.modalOpen
    }));
  };

  openResult = (type: Item | Collection | Profile) => {
    let metaType: 'Item' | 'Collection' | 'Profile' = 'Item';
    if (type.hasOwnProperty('full_name')) {
      // profile
      this.props.fetchProfile(type.id);
      metaType = 'Profile';
    } else if (type.hasOwnProperty('collection')) {
      this.props.fetchCollection(type.id);
      metaType = 'Collection';
    } else {
      this.props.fetchItem(type.id);
    }

    this.setState({ modalOpen: true, modalType: metaType });
  };

  render() {
    const // { view, results } = this.props,
      { loadedResults, open } = this.props,
      { hover } = this.state,
      isOpen = open,
      isOpenClass = isOpen ? 'open' : '',
      hoveredClass = hover ? 'hover' : '';

    return (
      <div id="searchConsole" className={isOpenClass}>
        <AudioPlayer className="audioPlayerSticky" />

        <Container
          fluid
          className={`${hoveredClass} ${isOpenClass} console`}
          onTouchStart={this.touchDeviceOpen}
        >
          <Row className="options">
            <div
              className={`view ${isOpen ? isOpenClass : `opacity5`} ${
                isOpen && window.innerWidth < 540 ? 'd-none' : ''
              }`}
            >
              <div className="line" />
            </div>

            <div
              className={`mid px-0 col ${hoveredClass}`}
              onClick={this.focusSearchInput}
            >
              <div className="align-items-center d-flex">
                <div className={`inputwrapper ${browser()}`}>
                  <AsyncSelect
                    className="searchInput"
                    classNamePrefix="search"
                    placeholder="Search ..."
                    noOptionsMessage={() => 'Search Suggestions'}
                    menuIsOpen={this.state.searchMenuOpen}
                    isDisabled={!isOpen}
                    ref={this.searchInputRef}
                    isMulti
                    loadOptions={this.searchSuggestions}
                    options={this.state.criteria}
                    value={this.state.selectedCriteria}
                    components={{ DropdownIndicator: null }}
                    onChange={this.onSearchChange}
                    onKeyDown={this.onSearchKeyDown}
                    onMenuOpen={() => {
                      if (this._isMounted) {
                        this.setState({ searchMenuOpen: true });
                      }
                    }}
                    onMenuClose={() => {
                      if (this._isMounted) {
                        this.setState({ searchMenuOpen: false });
                      }
                    }}
                    onInputChange={(s: string) => {
                      if (this._isMounted) {
                        this.setState({ searchInputValue: s });
                      }
                    }}
                    onBlur={() => {
                      if (this._isMounted) {
                        this.setState({ searchMenuOpen: false });
                      }
                    }}
                    formatOptionLabel={(t, o) => {
                      if (o.context === 'menu') {
                        let field = t.field.split('_').join(' ');
                        if (t.field === 'full_name') {
                          field = 'Profile';
                        }
                        return (
                          <div className="option">
                            <span className="value">{t.originalValue}</span>{' '}
                            <span className="field float-right">{field}</span>
                          </div>
                        );
                      } else {
                        return <div className="tag-option">{t.label}</div>;
                      }
                    }}
                  />
                </div>

                <div
                  className={`icon margin ${
                    isOpen ? `${isOpenClass}` : `opacity5`
                  }`}
                  onClick={
                    isOpen
                      ? () => {
                          return;
                        }
                      : this.toggleOpen
                  }
                >
                  <Row>
                    <Col
                      className="px-0"
                      onClick={isOpen ? this.searchDispatch : this.toggleOpen}
                    >
                      <span className="simple-icon-magnifier" />
                    </Col>
                    {/*{ Is only shown when opened fully. }*/}
                    <Col
                      className={`px-0 closeButton ${isOpenClass}`}
                      onClick={this.toggleOpen}
                    >
                      <FaTimes />
                    </Col>
                  </Row>
                </div>
              </div>
            </div>

            {/*{ Is hidden when open (max-width: 0) }*/}
            <Col
              sm="4"
              className={`d-none d-sm-block focus px-0 ${isOpenClass}`}
            >
              <div />
            </Col>
          </Row>

          <Row>
            <div className="tags">
              {
                !!this.props.concept_tags ?
                  <div className={`list ${browser()}`}>
                    {this.props.concept_tags
                      .filter(a => !find(this.state.selectedCriteria, {'originalValue': a.tag_name}))
                      .map((t: APITag, i) =>
                         <span key={i} onClick={() => this.onTagClick(t)}>#{t.tag_name}</span>
                      )
                    }
                  </div>
                  : <></>
              }
            </div>
          </Row>

          <div className="results">
            {loadedResults && loadedResults.length ? (
              loadedResults.map((t, i) => {
                if (t.hasOwnProperty('full_name')) {
                  const profile = t as Profile;
                  return (
                    <Row
                      className="result"
                      key={i}
                      onClick={() => this.openResult(t)}
                    >
                      {profile.profile_image ? (
                        <Col xs="4">
                          <img src={profile.profile_image} alt="" />
                        </Col>
                      ) : (
                        ''
                      )}
                      <Col xs={profile.profile_image ? '8' : '12'}>
                        {profile.full_name}
                      </Col>
                    </Row>
                  );
                } else {
                  const itemOrCollection = t as Item | Collection;
                  if (
                    !!itemOrCollection.file &&
                    itemOrCollection.file.type === FileTypes.Audio
                  ) {
                    return (
                      <Row className="result" key={i}>
                        <Col xs="12">
                          <FilePreview data={itemOrCollection} />
                        </Col>
                      </Row>
                    );
                  } else {
                    return (
                      <Row
                        className="result"
                        key={i}
                        onClick={() => this.openResult(itemOrCollection)}
                      >
                        {!!itemOrCollection.file ? (
                          <Col xs="6" sm="4" md="2">
                            <FilePreview data={t} />
                          </Col>
                        ) : (
                          <div className="py-5" />
                        )}
                        <Col xs="6" sm="8" md="10">
                          <Row>
                            <Col xs="12">{itemOrCollection.title}</Col>

                            {itemOrCollection.creators &&
                            itemOrCollection.creators.length ? (
                              <Col xs="12">
                                <div className="creators d-none d-md-block">
                                  {itemOrCollection.creators[0]}
                                  {itemOrCollection.creators.length > 1 ? (
                                    <em>, et al.</em>
                                  ) : (
                                    <></>
                                  )}
                                </div>
                              </Col>
                            ) : (
                              <></>
                            )}
                          </Row>
                        </Col>
                      </Row>
                    );
                  }
                }
              })
            ) : (
              <>No Results.</>
            )}
          </div>

          {this.props.searchResultsLoading ? (
            <Row>
              <Col className="text-center pb-5">
                <Spinner
                  type="grow"
                  style={{ color: '#50E3C2', fontSize: '20px' }}
                />
              </Col>
            </Row>
          ) : (
            <></>
          )}

          <Row className="bubbleRow">
            {this.props.open ? (
              <Bubble
                callback={e => {
                  if (this._isMounted) {
                    this.setState(e);
                  }
                }}
              />
            ) : (
              <></>
            )}
          </Row>
        </Container>

        <Modal
          isOpen={this.state.modalOpen}
          centered
          size="lg"
          scrollable
          className="search fullwidth blue"
          backdrop
          toggle={this.toggleModal}
        >
          <div className="d-flex flex-column flex-fill mh-100">
            <Row className="header align-content-center">
              <Col xs="12">
                <div className="text-right">
                  <FaTimes className="closeButton" onClick={this.toggleModal} />
                </div>
              </Col>
            </Row>

            <ModalBody>
              {this.state.modalType && this.state.modalType === 'Item' ? (
                <ViewItem />
              ) : (
                <></>
              )}
              {this.state.modalType && this.state.modalType === 'Collection' ? (
                <ViewCollection />
              ) : (
                <></>
              )}
              {this.state.modalType && this.state.modalType === 'Profile' ? (
                <ViewProfile />
              ) : (
                <></>
              )}
            </ModalBody>
          </div>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state: { searchConsole: SearchConsoleState }) => ({
  concept_tags: state.searchConsole.concept_tags,

  view: state.searchConsole.view,
  results: state.searchConsole.results,
  loadedResults: state.searchConsole.loadedResults,
  searchResultsLoading: state.searchConsole.searchResultsLoading,
  offset: state.searchConsole.offset,

  open: state.searchConsole.open
});

export default connect(
  mapStateToProps,
  {
    dispatchSearch,
    loadMoreResults,
    changeView,
    fetchItem,
    fetchCollection,
    fetchProfile,
    toggle,
    getConceptTags
  }
)(withCookies(SearchConsole));
