import * as React from 'react';
import { connect } from 'react-redux';
import { fetchCollection } from 'actions/collections/viewCollection';
import { ViewCollectionState } from 'reducers/collections/viewCollection';
import { ErrorMessage } from '../utils/alerts';

import { RouteComponentProps, withRouter } from 'react-router';

import CollectionSlider from './CollectionSlider';
import CollectionDetails from './CollectionDetails';

import 'styles/components/pages/viewItem.scss';

type MatchParams = {
  id: string;
};

interface Props extends RouteComponentProps<MatchParams>, ViewCollectionState {
  userId?: string;
  fetchCollection: Function;
}

class ViewCollection extends React.Component<Props, {}> {
  componentDidMount() {
    const { match, userId } = this.props;
    let matchId: string | null = null;

    // Get our collectionId passed through from URL props
    if (match.params.id) {
      matchId = match.params.id;
    }

    // If we have an id from the URL pass it through, otherwise use the one from Redux State
    if (matchId) {
      this.props.fetchCollection(matchId);
    } else if (userId) {
      // this.props.fetchCollection(userId); // TODO: allow fetchCollection to queries
      this.props.fetchCollection(null, userId);
    } else {
      this.setState({ errorMessage: 'No collection with that id.' });
    }
  }

  render() {
    const { errorMessage, collection, userId } = this.props;

    if (typeof collection === 'undefined') {
      return <ErrorMessage message={errorMessage} />;
    }

    return (
      <div id="item" className="container-fluid">
        <ErrorMessage message={errorMessage} />
        <CollectionSlider />
        {!userId ? <CollectionDetails collection={collection} /> : <></>}
      </div>
    );
  }
}

// State to props
const mapStateToProps = (state: { viewCollection: ViewCollectionState }) => {
  // tslint:disable-line: no-any
  return {
    errorMessage: state.viewCollection.errorMessage,
    collection: state.viewCollection.collection,
    items: state.viewCollection.items,
    offset: state.viewCollection.offset
  };
};

// Connect our redux store State to Props, and pass through the fetchCollection function.
export default withRouter(
  connect(
    mapStateToProps,
    { fetchCollection }
  )(ViewCollection)
);
