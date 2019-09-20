import * as React from 'react';
import { connect } from 'react-redux';
import AsyncSelect from 'react-select/async';
import { withCookies, Cookies } from 'react-cookie';
import $ from 'jquery';
import { API } from 'aws-amplify';
import { FaTimes } from 'react-icons/fa';
import { uniqBy } from 'lodash';
import { Col, Row, Container, Modal, ModalBody } from 'reactstrap';
import { SearchConsoleState } from '../../reducers/searchConsole'; // Props from Redux.
import { Document, Page, pdfjs } from 'react-pdf';

import {
  search as dispatchSearch,
  changeView,
  CriteriaOption,
  toggle
} from '../../actions/searchConsole'; // Props from Redux.

import ViewItem from '../item/ViewItem';
import AudioPlayer from '../layout/audio/AudioPlayer';
import { Bubble } from './Bubble';
import AudioPreview from '../layout/audio/AudioPreview';
import { fetchItem } from '../../actions/items/viewItem';
import { FileTypes } from '../../types/s3File';
import { instanceOf } from 'prop-types';

import 'styles/components/search/searchConsole.scss';
import 'styles/components/admin/tables/modal.scss';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface Props extends SearchConsoleState {
  changeView: Function;
  dispatchSearch: Function;
  fetchItem: Function;
  toggle: Function;
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

const FilePreview = (props: { data: any }) => { // tslint:disable-line: no-any
  if (props.data.file.type === FileTypes.Image) {
    let thumbnails: string = '';
    if (props.data.file.thumbnails) {
      Object.entries(props.data.file.thumbnails).forEach( ([key, value]) => {
        thumbnails = `${thumbnails}, ${value} ${key}w,`;
      } );
    }
    return (
      <img
        srcSet={thumbnails}
        src={props.data.file.url}
        alt=""
      />
    );
  } else if (props.data.file.type === FileTypes.Video) {
    return <img src={props.data.file.poster} alt={''}/>;
  } else if (props.data.file.type === FileTypes.Pdf) {
    return (
      <div className="pdf">
        <Document file={{ url: props.data.file.url }} style={{width: '100%', height: '100%'}} >
          <Page pageNumber={1}/>
        </Document>
      </div>
    );
  } else if (props.data.file.type === FileTypes.DownloadText || props.data.file.type === FileTypes.Text) {
    return <img alt="" src="https://upload.wikimedia.org/wikipedia/commons/2/22/Unscharfe_Zeitung.jpg" className="image-fluid"/>;
  } else if (props.data.file.type === FileTypes.Audio) {
    const {title, id, creators, item_subtype, date, count} = props.data;
    return <AudioPreview data={{title, id, url: props.data.file.url, date, creators, item_subtype, isCollection: !!count}} />;
  } else {
    return <></>;
  }
};

class SearchConsole extends React.Component<Props, State> {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  _isMounted;
  searchTimeout;
  searchInputRef;

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

      searchMobileCookie: !!cookies.get(`searchMobileCookie`) && (cookies.get(`searchMobileCookie`) === 'true')
    };

  }

  componentDidMount(): void {
    this._isMounted = true;
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, ): void {
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
    if (this.props.results.length && this.props.open) {
      this.animateResults(true);
    }
  }

  animateResults(open: boolean) {
    const $results = $('#searchConsole .results');

    if (open) {
      const resultsheight = $results.get(0).scrollHeight;
      $results.animate({ 'height': resultsheight }, 300, function() {
        $results.height('auto');
      });
    } else {
      $results.animate({'height': 0}, 200);
    }
  }

  toggleHover = (open?: boolean) => {
    if (!this._isMounted) { return; }
    if (!this.props.open) {
      if (window.innerWidth < 540) {
        this.toggleOpen();
      } else {
        this.setState({hover: open || !this.state.hover});
      }
    }
  }

  toggleOpen = () => {
    this.props.toggle(!this.props.open);
  }

  touchDeviceOpen = () => {
    if (!this._isMounted) { return; }
    if (!this.props.open && window.innerWidth <= 540) {
      this.props.toggle(true);
    }
  }

  searchSuggestions = (input: string) => {
    if (!this._isMounted) { clearTimeout(this.searchTimeout); return; }
    if (this.searchTimeout) { clearTimeout(this.searchTimeout); }

    return new Promise( resolve => {
      this.searchTimeout = setTimeout(async () => {
        clearTimeout(this.searchTimeout);
        if (!this._isMounted) { return; }

        let suggestions = await API.get('tba21', 'pages/search', { queryStringParameters: { query: input }});
        const keywordTags = await API.get('tba21', 'tags', { queryStringParameters: { query: input, limit: 50, type: 'keyword'} });
        const conceptTags = await API.get('tba21', 'tags', { queryStringParameters: { query: input, limit: 50, type: 'concept'} });

        suggestions = suggestions.results.map( t => createCriteriaOption(t.value, t.field) );
        suggestions = uniqBy(suggestions, (e: CriteriaOption) => e.field);
        const results = [
          ...suggestions,
          ...keywordTags.tags.map( t => createCriteriaOption(t.tag_name, 'keyword_tag') ),
          ...conceptTags.tags.map( t => createCriteriaOption(t.tag_name, 'concept_tag') )
        ];

        // Return the results to React Select
        this.setState({ criteria: results});
        resolve(results);

      }, 500);

    });

  }

  /**
   * Pulls the values from the search input ref. So we don't rely on waiting for state to update.
   * Then dispatches the redux action.
  */
  searchDispatch = () => {
    $('#searchConsole .results').animate({ 'height': 0 }, 300);
    if (this.props.open && this.state.selectedCriteria && this.state.selectedCriteria.length) {
      this.props.dispatchSearch(this.state.selectedCriteria, this.state.focus_arts, this.state.focus_action, this.state.focus_scitech);
    }
  }

  onSearchChange = (tagsList: any, actionMeta: any) => { // tslint:disable-line: no-any
    if (!this._isMounted) { return; }

    if (actionMeta.action === 'clear') {
      this.setState({ selectedCriteria: [], searchMenuOpen: false });
    }

    if (actionMeta.action === 'remove-value' || actionMeta.action === 'select-option' || actionMeta.action === 'create-option') {
      this.setState({ selectedCriteria: tagsList, searchMenuOpen: false });
    }
  }

  onSearchKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!this.state.searchMenuOpen && event.key === 'Enter') {
      this.searchDispatch();
      event.preventDefault();
    }
  }

  focusSearchInput = () => {
    if (!this._isMounted || this.props.open) { return; }
    this.props.toggle(!this.props.open);
  }

  toggleModal = () => {
    this.setState(prevState => ({
      modalOpen: !prevState.modalOpen
    }));
  }

  render() {
    const
      // { view, results } = this.props,
      { results, open } = this.props,
      { hover } = this.state,
      isOpen = open,
      isOpenClass = isOpen ? 'open' : '',
      hoveredClass = hover ? 'hover' : '';

    return (
      <div id="searchConsole" className={isOpenClass}>

        <AudioPlayer className="audioPlayerSticky" />

        <Container fluid className={`${hoveredClass} ${isOpenClass} console`} onTouchStart={this.touchDeviceOpen} >
          <Row className="options">
            <div className={`view ${isOpen ? isOpenClass : `opacity5`} ${isOpen && window.innerWidth < 540 ? 'd-none' : ''}`}>
              <div className="line" />
            </div>

            <div
              className={`mid px-0 col ${hoveredClass}`}
              onClick={this.focusSearchInput}
            >
              <Row className="align-items-center">
                <div className="inputwrapper">

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

                    components={{DropdownIndicator: null}}

                    onChange={this.onSearchChange}
                    onKeyDown={this.onSearchKeyDown}

                    onMenuOpen={() => { if (this._isMounted) { this.setState({ searchMenuOpen: true }); } }}
                    onMenuClose={() => { if (this._isMounted) { this.setState({ searchMenuOpen: false }); } }}

                    onInputChange={(s: string) => { if (this._isMounted) { this.setState({ searchInputValue: s }); } }}
                    onBlur={() => { if (this._isMounted) { this.setState({ searchMenuOpen: false }); } }}

                    formatOptionLabel={(t, o) => {
                      if (o.context === 'menu') {
                        let field = t.field.split('_').join(' ');
                        if (t.field === 'full_name') {
                          field = 'Profile';
                        }
                        return (<div className="option"><span className="value">{t.originalValue}</span> <span className="field float-right">{field}</span></div>);
                      } else {
                        return <div className="tag-option">{t.label}</div>;
                      }
                    }}
                  />
                </div>
                <div
                  className={`icon margin ${isOpen ? `${isOpenClass}` : `opacity5`}`}
                  onClick={isOpen ? () => { return; } : this.toggleOpen}
                >
                  <Row>
                    <Col onClick={isOpen ? this.searchDispatch : this.toggleOpen}>
                      <span className="simple-icon-magnifier"/>
                    </Col>
                    {/*{ Is only shown when opened fully. }*/}
                    <Col className={`closeButton ${isOpenClass}`} onClick={this.toggleOpen}>
                      <FaTimes />
                    </Col>
                  </Row>
                </div>
              </Row>
            </div>

            {/*{ Is hidden when open (max-width: 0) }*/}
            <Col sm="4" className={`d-none d-sm-block focus px-0 ${isOpenClass}`}>
              <div />
            </Col>
          </Row>

          <div className="results">
            {
              results.map((t, i) => {

                if (t.full_name) {
                  return (
                    <Row className="result" key={i}>
                      {t.profile_image ?
                        <Col xs="4">
                          <img src={t.profile_image} alt=""/>
                        </Col>
                        : ''}
                      <Col xs={t.profile_image ? '8' : '12'}>
                        {t.full_name}
                      </Col>
                    </Row>
                  );
                } else {
                  if (!!t.file && t.file.type === FileTypes.Audio) {
                    return (
                      <Row className="result" key={i}>
                        <Col xs="12">
                          <FilePreview data={t}/>
                        </Col>
                      </Row>
                    );
                  } else {
                    return (
                      <Row className="result" key={i} onClick={() => { this.props.fetchItem(t.id); this.setState({ modalOpen: true }); }}>
                        {!!t.file ?
                          <Col xs="6" sm="4" md="2">
                            <FilePreview data={t}/>
                          </Col> : <></>
                        }
                        <Col xs="6" sm="8" md="10">
                          <Row>
                            <Col xs="12">
                              {t.title}
                            </Col>
                            <Col xs="12">
                              {t.title}
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    );
                  }
                }
              })
            }
          </div>

          <Row className="bubbleRow">
            {this.props.open ?
              <Bubble callback={e => { if (this._isMounted) { this.setState(e); }}} />
            : <></>
            }
          </Row>
        </Container>

        <Modal isOpen={this.state.modalOpen} centered size="lg" scrollable className="search fullwidth blue" backdrop toggle={this.toggleModal}>
          <div className="d-flex flex-column mh-100">
            <Row className="header align-content-center">
              <Col xs="12">
                <div className="text-right">
                  <FaTimes className="closeButton" onClick={this.toggleModal}/>
                </div>
              </Col>
            </Row>

            <ModalBody>
              <ViewItem />
            </ModalBody>

          </div>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state: { searchConsole: SearchConsoleState }) => ({

  concept_tags: state.searchConsole.concept_tags,
  selected_tags: state.searchConsole.selected_tags,

  view: state.searchConsole.view,
  results: state.searchConsole.results,

  open: state.searchConsole.open

});

export default connect(mapStateToProps, { dispatchSearch, changeView, fetchItem, toggle })(withCookies(SearchConsole));
