import * as React from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { fetchCollection } from 'actions/collections/viewCollection';
import { State } from 'reducers/collections/viewCollection';
import { ErrorMessage } from '../utils/alerts';

import { browser } from '../utils/browser';
import { RouteComponentProps, withRouter } from 'react-router';

import CollectionSlider from './CollectionSlider';
import 'styles/components/pages/viewItem.scss';
import Share from '../utils/Share';
import moment from 'moment';

type MatchParams = {
  id: string;
};

interface Props extends RouteComponentProps<MatchParams>, State {
  fetchCollection: Function;
}

class ViewCollection extends React.Component<Props, State> {
  browser: string;

  constructor(props: any) { // tslint:disable-line: no-any
    super(props);

    this.browser = browser();
  }

  componentDidMount() {
    const { match } = this.props;
    let matchId: string | null = null;

    // Get our collectionId passed through from URL props
    if (match.params.id) {
      matchId = match.params.id;
    }

    // If we have an id from the URL pass it through, otherwise use the one from Redux State
    if (matchId) {
      this.props.fetchCollection(matchId);
    } else {
      this.setState({ errorMessage: 'No collection with that id.' });
    }
  }

  render() {
    if (typeof this.props.collection === 'undefined') {
      return <ErrorMessage message={this.props.errorMessage} />;
    }

    const {
      id,
      creators,
      title,
      description,
      license,
      aggregated_concept_tags,
      aggregated_keyword_tags,

      focus_action,
      focus_arts,
      focus_scitech,
      created_at
    } = this.props.collection;

    let focusTotal = 0;
    if (!!focus_action && !!focus_arts && !!focus_scitech) {
      focusTotal = parseInt(focus_action, 0) + parseInt(focus_arts, 0) + parseInt(focus_scitech, 0);
    }

    const focusPercentage = (level: number | string | undefined | null): string => {
      if (typeof level === 'undefined' || level === null) { return '0'; }
      if (typeof level === 'string') {
        level = parseInt(level, 0);
      }
      return `${ (level / focusTotal) * 100 }`;
    };

    const CollectionDetails = (props: { label: string, value: string }): JSX.Element => (
      <Row className="border-bottom subline details">
        <Col xs="12" md="6">{props.label}</Col>
        <Col xs="12" md="6">{props.value}</Col>
      </Row>
    );

    return (
      <div id="item">
        <ErrorMessage message={this.props.errorMessage} />
        <CollectionSlider items={this.props.items}/>
        <Row>
          <Col xs="12" md="8" className="left border-right">
            <Row>
              <Col xs={{ size: 12, order: 2 }} md={{ size: 8, order: 1 }} className="creators">
                {creators ? creators.join(', ') : <></>}
              </Col>
            </Row>
            <Row>
              <Col>
                <h1>{title}</h1>
              </Col>
            </Row>

            <Row>
              <Col className="description">
                {
                  description ?
                    this.browser === 'ie6-11' ? description.split('\n').map((d, i) => <p key={i}>{d}</p>) : description
                  : <></>
                }
              </Col>
            </Row>

            {!!id ?
              <Row>
                <Col className="text-right">
                  <Share suffix={`collection/${id}`}/>
                </Col>
              </Row>
              : <></>
            }
          </Col>
          <Col xs="12" md="4" className="right">
            {!!created_at ?
              <CollectionDetails label="Date" value={moment(created_at).format('Do MMMM YYYY')} />
              : <></>
            }

            {!!license ? <CollectionDetails label="License" value={license} /> : ''}

            {!!aggregated_concept_tags && aggregated_concept_tags.length ?
              <Row className="border-bottom subline details">
                <Col xs="12">Concept Tags</Col>
                <Col xs="12">
                  {
                    aggregated_concept_tags.map(t => `#${t.tag_name} `)
                  }
                </Col>
              </Row>
            : ''}
            {!!aggregated_keyword_tags && aggregated_keyword_tags.length ?
              <Row className="subline details">
                <Col xs="12">Keyword Tags</Col>
                <Col xs="12">
                  {
                    aggregated_keyword_tags.map(t => `#${t.tag_name} `)
                  }
                </Col>
              </Row>
            : ''}
            <Row>
              <Col className="px-0">
                <div style={{ height: '15px', background: `linear-gradient(to right, #0076FF ${focusPercentage(focus_arts)}%, #9013FE ${focusPercentage(focus_scitech)}%, #50E3C2 ${focusPercentage(focus_action)}%)` }} />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

// State to props
const mapStateToProps = (state: { viewCollection: State }) => { // tslint:disable-line: no-any
  return {
    errorMessage: state.viewCollection.errorMessage,
    collection: state.viewCollection.collection,
    items: state.viewCollection.items
  };
};

// Connect our redux store State to Props, and pass through the fetchCollection function.
export default withRouter(connect(mapStateToProps, { fetchCollection })(ViewCollection));
