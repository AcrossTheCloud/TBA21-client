import * as React from 'react';
import { connect } from 'react-redux';
import Container from 'reactstrap/lib/Container';

import 'styles/components/search/searchConsole.scss';
import { Col, Row } from 'reactstrap';

interface State {
  hover: boolean;
}

class SearchConsole extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    this.state = {
      hover: false
    };
  }

  toggleHover = () => {
    this.setState({hover: !this.state.hover});
  }

  render() {
    const
      { hover } = this.state,
      hoveredClass = hover ? 'hover' : '';

    return (
      <div id="searchConsole">
        <Container fluid className={`console`} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover} >

          <Row className={`legend ${hoveredClass}`}>
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

            <Col xs="1" className="icon padding">
              <span className="simple-icon-magnifier"/>
            </Col>

            <Col xs="hidden" sm="4" className="focus px-0">
              <div />
            </Col>
          </Row>

        </Container>
      </div>
    );
  }
}

const mapStateToProps = (state: { search: {} }) => ({

});

export default connect(mapStateToProps, { })(SearchConsole);
