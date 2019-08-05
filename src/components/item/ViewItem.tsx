import * as React from 'react';
import { connect } from 'react-redux';

import { fetchItem } from 'actions/items/viewItem';
import { State } from 'reducers/items/viewItem';
import { Alerts, ErrorMessage } from '../utils/alerts';

import { Item } from '../../types/Item';
import { Col, Row } from 'reactstrap';

interface Props extends Alerts {
  fetchItem: Function;
  item: Item;
}

class ViewItem extends React.Component<Props, State> {
  matchedItemId: string = '';

  constructor(props: any) { // tslint:disable-line: no-any
    super(props);

    // Get our itemId passed through from URL props
    if (props.location && props.location.pathname) {
      this.matchedItemId = props.location.pathname.replace('/view/', '');
    }
  }

  componentDidMount() {
    // If we have an id from the URL pass it through, otherwise use the one from Redux State
    if (this.matchedItemId) {
      this.props.fetchItem(this.matchedItemId);
    } else {
      this.setState({ errorMessage: 'No item with that id.' });
    }
  }

  render() {
    if (typeof this.props.item === 'undefined') {
      return 'Loading...';
    }

    const {
      title,
      description,
      license
    } = this.props.item;

    return (
      <>
        <ErrorMessage message={this.props.errorMessage} />
        <div className="container-fluid">
          <Row>
            <Col>
              IMAGE / MEDIA HERE
            </Col>
          </Row>
          <Row>
            <Col md="8">
              {title} <br />
              {description}
            </Col>
            <Col md="4">
              {license}
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

// State to props
const mapStateToProps = (state: { viewItem: State }) => { // tslint:disable-line: no-any
  return {
    errorMessage: state.viewItem.errorMessage,
    item: state.viewItem.item
  };
};

// Connect our redux store State to Props, and pass through the fetchItem function.
export default connect(mapStateToProps, { fetchItem })(ViewItem);
