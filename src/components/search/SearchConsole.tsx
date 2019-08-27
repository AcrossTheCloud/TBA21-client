import * as React from 'react';
import { connect } from 'react-redux';
import Container from 'reactstrap/lib/Container';

import { Col, Row } from 'reactstrap';
import { SearchConsoleState } from '../../reducers/searchConsole'; // Props from Redux.
import { search as dispatchSearch, changeView } from '../../actions/searchConsole'; // Props from Redux.
import { FaTimes } from 'react-icons/fa';

import 'styles/components/search/searchConsole.scss';

interface Props extends SearchConsoleState {
  changeView: Function;
  dispatchSearch: Function;
}

interface State {
  hover: boolean;
  isOpen: boolean;
}

class SearchConsole extends React.Component<Props, State> {
  _isMounted;
  searchTimeout;
  searchInputRef;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;

    this.state = {
      hover: false,
      isOpen: false
    };

    this.searchInputRef = React.createRef();
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

  search = (input: string) => {
    // If the input and the previous search are the same, just switch to the list view.
    if (input === this.props.search_query) {
      this.props.changeView('list');
      return;
    }

    if (input && input.length <= 1) { clearTimeout(this.searchTimeout); return; }

    if (this.searchTimeout) { clearTimeout(this.searchTimeout); }

    this.searchTimeout = setTimeout(async () => {

      await this.props.dispatchSearch(input);

      if (!this._isMounted) { clearTimeout(this.searchTimeout); return; }

      // Return the tags to React Select
    }, 500);

  }

  onSearchIconClick = () => {
    this.search(this.searchInputRef.current.value);
  }

  onSearchKeyDown = (e: string) => {
    if (e === 'Enter') {
      this.search(this.searchInputRef.current.value);
    }
  }

  render() {
    const
      { view, results } = this.props,
      { hover, isOpen } = this.state,
      isOpenClass = isOpen ? 'open' : '',
      hoveredClass = hover ? 'hover' : '';

    return (
      <div id="searchConsole" className={isOpenClass}>
        <Container fluid className="console" onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover} >

          <Row className={`legend ${hoveredClass} ${isOpenClass}`}>
            <Col xs="2" className="border_right">View</Col>
            <Col xs="5" className="border_right">Conceptual Tags</Col>
            <Col xs="1" className="border_right">Search</Col>
            <Col xs="4">Focus</Col>
          </Row>

          <Row className={`options ${hoveredClass} ${isOpenClass}`}>

            <Col className={`view ${isOpen ? `${isOpenClass} col` : `col-2 opacity5`}`}>
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

            <Col className={`mid ${hoveredClass} ${isOpen ? 'px-0 col-9' : 'padding col-5'}`}>
              {isOpen ?
                <input
                  type="text"
                  className="searchInput"
                  ref={this.searchInputRef}
                  defaultValue={this.props.search_query}
                  onKeyDown={e => this.onSearchKeyDown(e.key)}
                  onChange={e => this.search(e.target.value)
                  }
                />
                :
                <div className="opacity5">A list of concept tags.</div>
              }
            </Col>

            <Col
              className={`icon padding ${isOpen ? `${isOpenClass} col` : `col-1 opacity5`}`}
              onClick={ isOpen ?
                () => { this.onSearchIconClick(); }
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
            </Col>

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

  search_query: state.searchConsole.search_query,
  concept_tags: state.searchConsole.concept_tags,
  selected_tags: state.searchConsole.selected_tags,
  view: state.searchConsole.view,
  results: state.searchConsole.results,

});

export default connect(mapStateToProps, { dispatchSearch, changeView })(SearchConsole);
