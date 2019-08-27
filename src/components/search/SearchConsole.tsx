import * as React from 'react';
import { connect } from 'react-redux';
import Container from 'reactstrap/lib/Container';

import 'styles/components/search/searchConsole.scss';
import { Col, Row } from 'reactstrap';
import { SearchConsoleState } from '../../reducers/searchConsole'; // Props from Redux.

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

  render() {
    const
      { hover, isOpen } = this.state,
      isOpenClass = isOpen ? 'open' : '',
      hoveredClass = hover ? 'hover' : '';

    return (
      <div id="searchConsole">
        <Container fluid className={`console`} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover} >

          <Row className={`legend ${hoveredClass} ${isOpenClass}`}>
            <Col xs="2" className="border_right">View</Col>
            <Col xs="5" className="border_right">Conceptual Tags</Col>
            <Col xs="1" className="border_right">Search</Col>
            <Col xs="4">Focus</Col>
          </Row>

          <Row className={`options ${hoveredClass}`}>
            <Col xs="2">
              <div className={`line ${hoveredClass}`} />
              <Row>
                <Col xs="4" className="padding option">Grid</Col>
                <Col xs="4" className="padding option px-0">List</Col>
              </Row>
            </Col>

            <Col xs="5" className="padding">
              A list of concept tags.
            </Col>

            <Col xs="1" className="icon padding" onClick={this.toggleOpen}>
              <span className="simple-icon-magnifier"/>
            </Col>

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
