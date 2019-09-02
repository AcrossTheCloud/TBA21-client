import * as React from 'react';
import { connect } from 'react-redux';
import AsyncSelect from 'react-select/async';

import { Col, Row, Container } from 'reactstrap';
import { SearchConsoleState } from '../../reducers/searchConsole'; // Props from Redux.
import {
  search as dispatchSearch,
  changeView,
  CriteriaOption
} from '../../actions/searchConsole'; // Props from Redux.
import { FaTimes } from 'react-icons/fa';

import 'styles/components/search/searchConsole.scss';
import AudioPlayer from '../layout/audio/AudioPlayer';
import { API } from 'aws-amplify';

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

const createCriteriaOption = (label: string, field: string): CriteriaOption => ({
  label,
  value: label,
  field
});

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

  toggleHover = () => {
    if (!this._isMounted) { return; }
    if (!this.state.isOpen) {
      this.setState({hover: !this.state.hover});
    }
  }

  toggleOpen = () => {
    if (!this._isMounted) { return; }
    this.setState({isOpen: !this.state.isOpen});
  }

  searchSuggestions = (input: string) => {
    if (!this._isMounted) { clearTimeout(this.searchTimeout); return; }
    if (this.searchTimeout) { clearTimeout(this.searchTimeout); }

    return new Promise( resolve => {
      this.searchTimeout = setTimeout(async () => {
        if (!this._isMounted) { clearTimeout(this.searchTimeout); return; }

        let results = await API.get('tba21', 'pages/search', { queryStringParameters: { query: input }});
        results = results.map(t => createCriteriaOption(t.value, t.field));

        this.setState({ criteria: results, searchMenuOpen: true });
        resolve(results);
        // Return the results to React Select
      }, 500);

    });

  }

  /**
   * Pulls the values from the search input ref. So we don't rely on waiting for state to update.
   * Then dispatches the redux action.
  */
  searchDispatch = () => {
    const selectRefState = this.searchInputRef.current.select.state;
    if (selectRefState.value && selectRefState.value.length) {
      this.props.dispatchSearch(selectRefState.value);
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

        <Container fluid className="console" onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover} >

          <Row className={`legend ${hoveredClass} ${isOpenClass}`}>
            <Col xs="2" className="border_right">View</Col>
            <Col xs="6" className="border_right">Search</Col>
            <Col xs="4">Focus</Col>
          </Row>

          <Row className={`options ${hoveredClass} ${isOpenClass}`}>

            <Col className={`view col-2 ${isOpen ? isOpenClass : `opacity5`}`}>
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
            </Col>

            <div
              className={`mid px-0 col ${hoveredClass}`}
              onClick={this.focusSearchInput}
            >
              <Row className="align-items-center">
                <div className={`inputwrapper ${isOpen ? 'flex-grow-1' : ''} h-100`}>

                  <AsyncSelect
                    className="searchInput"
                    classNamePrefix="search"
                    placeholder="Search ..."
                    noOptionsMessage={() => 'No Search Results'}
                    menuIsOpen={this.state.searchMenuOpen}
                    isDisabled={!isOpen}
                    ref={this.searchInputRef}

                    isMulti
                    cacheOptions
                    loadOptions={this.searchSuggestions}
                    options={this.state.criteria}

                    components={{DropdownIndicator: null}}

                    onChange={this.onSearchChange}
                    onKeyDown={this.onSearchKeyDown}

                    onInputChange={(s: string) => { if (this._isMounted) { this.setState({ searchInputValue: s }); } }}
                    onBlur={() => { if (this._isMounted) { this.setState({ searchMenuOpen: false }); } }}

                    formatOptionLabel={(t, o) => {
                      if (o.context === 'menu') {
                        return (<><>{t.value}</> <div className="float-right">{t.field}</div></>);
                      } else {
                        return <>{t.value}</>;
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
