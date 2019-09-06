import * as React from 'react';
import { connect } from 'react-redux';
import AsyncSelect from 'react-select/async';
import $ from 'jquery';
import { API } from 'aws-amplify';
import { FaTimes } from 'react-icons/fa';
import { Col, Row, Container } from 'reactstrap';
import { SearchConsoleState } from '../../reducers/searchConsole'; // Props from Redux.
import {
  search as dispatchSearch,
  changeView,
  CriteriaOption
} from '../../actions/searchConsole'; // Props from Redux.

import AudioPlayer from '../layout/audio/AudioPlayer';
import { Bubble } from './Bubble';

import 'styles/components/search/searchConsole.scss';

interface Props extends SearchConsoleState {
  changeView: Function;
  dispatchSearch: Function;
}

interface State {
  hover: boolean;
  isOpen: boolean;
  searchMenuOpen: boolean;
  searchInputValue: string;
  criteria: CriteriaOption[];
  selectedCriteria: CriteriaOption[];
}

const createCriteriaOption = (label: string, field: string, displayField?: string): CriteriaOption => {
  return {
    label: `${label} - (${displayField || field})`,
    value: `${label} - (${displayField || field})`,
    originalValue: label,
    field,
    displayField: displayField || field
  };
};

class SearchConsole extends React.Component<Props, State> {
  _isMounted;
  searchTimeout;
  searchInputRef;

  constructor(props: Props) {
    super(props);

    this.searchInputRef = React.createRef();
    this._isMounted = false;

    this.state = {
      hover: false,
      isOpen: false,
      searchMenuOpen: false,
      searchInputValue: '',
      criteria: [],
      selectedCriteria: []
    };

  }

  componentDidMount(): void {
    this._isMounted = true;
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, ): void {
    if (this.state.isOpen !== prevState.isOpen) {
      if (this.state.isOpen) {
        $('#body').addClass('searchOpen');
      } else {
        $('#body').removeClass('searchOpen');
      }
    }
  }

  toggleHover = (open?: boolean) => {
    if (!this._isMounted) { return; }
    if (!this.state.isOpen) {
      if (window.innerWidth < 540) {
        this.toggleOpen();
      } else {
        this.setState({hover: open || !this.state.hover});
      }
    }
  }

  toggleOpen = () => {
    if (!this._isMounted) { return; }
    this.setState({isOpen: !this.state.isOpen, hover: false});
  }

  touchDeviceOpen = () => {
    if (!this._isMounted) { return; }
    if (!this.state.isOpen && window.innerWidth <= 540) {
      this.setState({isOpen: true, hover: false});
    }
  }

  searchSuggestions = (input: string) => {
    if (!this._isMounted) { clearTimeout(this.searchTimeout); return; }
    if (this.searchTimeout) { clearTimeout(this.searchTimeout); }

    return new Promise( resolve => {
      this.searchTimeout = setTimeout(async () => {
        clearTimeout(this.searchTimeout);
        if (!this._isMounted) { return; }

        const suggestions = await API.get('tba21', 'pages/search', { queryStringParameters: { query: input }});
        const keywordTags = await API.get('tba21', 'tags', { queryStringParameters: { query: input, limit: 50, type: 'keyword'} });
        const conceptTags = await API.get('tba21', 'tags', { queryStringParameters: { query: input, limit: 50, type: 'concept'} });

        const results = [
          ...suggestions.results.map( t => createCriteriaOption(t.value, t.field) ),
          ...keywordTags.tags.map( t => createCriteriaOption(t.tag_name, 'keyword_tag', 'Keyword Tag') ),
          ...conceptTags.tags.map( t => createCriteriaOption(t.tag_name, 'concept_tag', 'Concept Tag') )
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
    if (this.state.selectedCriteria && this.state.selectedCriteria.length) {
      this.props.dispatchSearch(this.state.selectedCriteria);
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
      event.preventDefault();
      this.searchDispatch();
    }
  }

  focusSearchInput = () => {
    if (!this._isMounted || this.state.isOpen) { return; }
    this.setState({isOpen: !this.state.isOpen}, () => this.searchInputRef.current.select.select.focus());
  }

  render() {
    const
      { view, results } = this.props,
      { hover, isOpen } = this.state,
      isOpenClass = isOpen ? 'open' : '',
      hoveredClass = hover ? 'hover' : '';

    return (
      <div id="searchConsole" className={isOpenClass}>

        <AudioPlayer className="audioPlayerSticky" />

        <Container fluid className={`${hoveredClass} ${isOpenClass} console`} onMouseEnter={() => this.toggleHover(true)} onMouseLeave={() => this.toggleHover(false)} onTouchStart={this.touchDeviceOpen} >

          <Row className="legend">
            <Col xs="2" className="border_right">View</Col>
            <Col xs="6" className="border_right">Search</Col>
            <Col xs="4">Focus</Col>
          </Row>

          <Row className="options">

            <div className={`view col-2 ${isOpen ? isOpenClass : `opacity5`} ${isOpen && window.innerWidth < 540 ? 'd-none' : ''}`}>
              <div className="line" />
              <Row>
                <Col
                  xs="6"
                  className={`padding option ${isOpen && view === 'grid' ? 'active' : ''}`}
                  onClick={() => {
                    if (isOpen) {
                      this.props.changeView('grid');
                    } else {
                      this.toggleOpen();
                    }
                  }}
                >
                  Grid
                </Col>
                <Col
                  xs="6"
                  className={`padding option px-0 ${isOpen && view === 'list' ? 'active' : ''}`}
                  onClick={() => {
                    if (isOpen) {
                      this.props.changeView('list');
                    } else {
                      this.toggleOpen();
                    }
                  }}
                >
                  List
                </Col>
              </Row>
            </div>

            <div
              className={`mid px-0 col ${hoveredClass}`}
              onClick={this.focusSearchInput}
            >
              <Row className="align-items-center">
                <div className={`inputwrapper ${isOpen ? 'flex-grow-1' : ''}`}>

                  <AsyncSelect
                    className="searchInput"
                    classNamePrefix="search"
                    placeholder="Search ..."
                    noOptionsMessage={() => 'No Search Results'}
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
                        return (<div className="option"><span className="value">{t.originalValue}</span> <span className="field float-right">{t.displayField}</span></div>);
                      } else {
                        return <div className="tag-option">{t.label}</div>;
                      }
                    }}
                  />
                </div>
                <div
                  className={`icon margin ${isOpen ? `${isOpenClass}` : `opacity5`}`}
                  onClick={ isOpen ?
                    () => { this.searchDispatch(); }
                    : this.toggleOpen}
                >
                  <Row>
                    <Col>
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

          <Row className="bubbleRow">
            {this.state.isOpen ?
              <Bubble callback={e => { if (this._isMounted) { this.setState(e); }}} />
            : <></>
            }
          </Row>

        </Container>

        {isOpen && view === 'list' ?
          <Container fluid className="results">
            {results.map((t, i) => <div key={i}> {t.toString()} </div>)}
          </Container>
          : <></>
        }

      </div>
    );
  }
}

const mapStateToProps = (state: { searchConsole: SearchConsoleState }) => ({

  concept_tags: state.searchConsole.concept_tags,
  selected_tags: state.searchConsole.selected_tags,

  view: state.searchConsole.view,
  results: state.searchConsole.results,

});

export default connect(mapStateToProps, { dispatchSearch, changeView })(SearchConsole);
