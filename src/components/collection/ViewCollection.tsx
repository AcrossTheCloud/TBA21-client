import * as React from 'react';
import { connect } from 'react-redux';
import {
  fetchCollection,
  fetchContributedItemsForProfile
} from 'actions/collections/viewCollection';
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
  uuid?: string | null;
  fetchCollection: Function;
  fetchContributedItemsForProfile: Function;
}

class ViewCollection extends React.Component<Props, {}> {
  componentDidMount() {
    const { match, uuid } = this.props;
    let matchId: string | null = null;

    // Get our collectionId passed through from URL props
    if (match.params.id) {
      matchId = match.params.id;
    }
    // If we have an id from the URL pass it through, otherwise use the one from Redux State
    if (matchId) {
      this.props.fetchCollection(matchId);
    } else if (uuid) {
      this.props.fetchContributedItemsForProfile(uuid);
    } else {
      this.setState({ errorMessage: 'No collection with that id.' });
    }
  }

  render() {
    const { errorMessage, collection, uuid } = this.props;

    if (typeof collection === 'undefined') {
      return <ErrorMessage message={errorMessage} />;
    }
    return (
      <div id="item" className="container-fluid">
        <ErrorMessage message={errorMessage} />
        <CollectionSlider />
        {!uuid ? <CollectionDetails collection={collection} /> : <></>}
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
    { fetchCollection, fetchContributedItemsForProfile }
  )(ViewCollection)
);
