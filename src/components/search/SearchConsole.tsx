import * as React from 'react';
import { connect } from 'react-redux';
import Container from 'reactstrap/lib/Container';

import 'styles/components/search/searchConsole.scss';
import { Col, Row } from 'reactstrap';
import { SearchConsoleState } from '../../reducers/searchConsole'; // Props from Redux.
import { FaTimes } from 'react-icons/fa';

interface State {
  hover: boolean;
  isOpen: boolean;
}

class SearchConsole extends React.Component<SearchConsoleState, State> {
  constructor(props: SearchConsoleState) {
    super(props);

    this.state = {
      hover: false,
      isOpen: false
    };
  }

  toggleHover = () => {
    if (!this.state.isOpen) {
      this.setState({hover: !this.state.hover});
    }
  }

  toggleOpen = () => {
    this.setState({isOpen: !this.state.isOpen});
  }

  search = () => {

  }

  render() {
    const
      { hover, isOpen } = this.state,
      isOpenClass = isOpen ? 'open' : '',
      hoveredClass = hover ? 'hover' : '';

    return (
      <div id="searchConsole" className={isOpenClass}>
        <Container fluid className={`console`} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover} >

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
                <Col xs="6" className="padding option">Grid</Col>
                <Col xs="6" className="padding option px-0">List</Col>
              </Row>
            </Col>

            <Col className={`mid ${hoveredClass} ${isOpen ? 'px-0 col-9' : 'padding col-5'}`}>
              {isOpen ?
                <input type="text" className="searchInput"/>
                :
                <div className="opacity5">A list of concept tags.</div>
              }
            </Col>

            <Col className={`icon padding ${isOpen ? `${isOpenClass} col` : `col-1 opacity5`}`} onClick={isOpen ? this.search : this.toggleOpen}>
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

export default connect(mapStateToProps, { })(SearchConsole);
