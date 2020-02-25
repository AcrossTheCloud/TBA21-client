import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Col, Row } from 'reactstrap';
import { fetchCollection } from 'actions/collections/viewCollection';
import { ViewCollectionState } from 'reducers/collections/viewCollection';
import { ErrorMessage } from '../utils/alerts';

import { browser } from '../utils/browser';
import { RouteComponentProps, withRouter } from 'react-router';

import CollectionSlider from './CollectionSlider';
import Share from '../utils/Share';
import moment from 'moment';
import 'styles/components/pages/viewItem.scss';
import { Regions } from '../../types/Item';
import { search as dispatchSearch, toggle as searchOpenToggle } from '../../actions/searchConsole';
import { createCriteriaOption } from '../search/SearchConsole';
import { toggle as collectionModalToggle } from 'actions/modals/collectionModal';
import { toggle as itemModalToggle } from 'actions/modals/itemModal';

type MatchParams = {
  id: string;
};

interface Props extends RouteComponentProps<MatchParams>, ViewCollectionState {
  fetchCollection: Function;
  collectionModalToggle: Function;
  itemModalToggle: Function;
  searchOpenToggle: Function;
  dispatchSearch: Function;
}

class ViewCollection extends React.Component<Props, {}> {
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

  // @todo should be a util / dispatch
  onTagClick = (label: string, field: string) => {
    setTimeout(() => {
      this.props.itemModalToggle(false);
      this.props.collectionModalToggle(false);
      this.props.searchOpenToggle(true);
      this.props.dispatchSearch([createCriteriaOption(label, field)]);
    });
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
      time_produced,
      year_produced,
      venues,
      exhibited_at,
      url,
      regions,
      copyright_holder
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
      <div id="item" className="container-fluid">
        <ErrorMessage message={this.props.errorMessage} />
        <CollectionSlider />
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
            {!!time_produced ?
              <CollectionDetails label="Date Produced" value={moment(time_produced).format('Do MMMM YYYY')} />
              : year_produced ? <CollectionDetails label="Year Produced" value={year_produced} /> : <></>
            }
            {!!venues && venues.length ?
              <CollectionDetails label="Publication Venue(s)" value={`${venues.join(', ')}`} />
              : <></>
            }
            {!!exhibited_at && exhibited_at.length ?
              <CollectionDetails label="Exhibited At" value={`${exhibited_at.join(', ')}`} />
              : <></>
            }
            {!!regions && regions.length ?
              <CollectionDetails label="Region" value={regions.map((region) => (Regions[region])).join(', ')} />
              :
              ''
            }
            {!!license ? <CollectionDetails label="License" value={license} /> : ''}
            {!!copyright_holder ? <CollectionDetails label="Copyright Owner" value={copyright_holder} /> : ''}
            {!!url ? <CollectionDetails label="Link" value={url} /> : ''}

            {!!aggregated_concept_tags && aggregated_concept_tags.length ?
              <Row className="border-bottom subline details">
                <Col xs="12">Concept Tags</Col>
                <Col xs="12">
                  {
                    aggregated_concept_tags.map(t => {
                      return (
                          <Button
                              className="page-link"
                              style={{padding: 0, background: 'none'}}
                              key={t.tag_name}
                              onClick={() => this.onTagClick(t.tag_name, 'concept_tag')}
                          >
                            #{t.tag_name}
                          </Button>
                      );
                    })
                  }
                </Col>
              </Row>
            : ''}
            {!!aggregated_keyword_tags && aggregated_keyword_tags.length ?
              <Row className="subline details">
                <Col xs="12">Keyword Tags</Col>
                <Col xs="12">
                  {
                    aggregated_keyword_tags.map(t => {
                      return (
                          <Button
                              className="page-link"
                              style={{padding: 0, background: 'none'}}
                              key={t.tag_name}
                              onClick={() => this.onTagClick(t.tag_name, 'keyword_tag')}
                          >
                            #{t.tag_name}
                          </Button>
                      );
                    })
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
const mapStateToProps = (state: { viewCollection: ViewCollectionState }) => { // tslint:disable-line: no-any
  return {
    errorMessage: state.viewCollection.errorMessage,
    collection: state.viewCollection.collection,
    items: state.viewCollection.items,
    offset: state.viewCollection.offset
  };
};

// Connect our redux store State to Props, and pass through the fetchCollection function.
export default withRouter(connect(mapStateToProps, {
  fetchCollection,
  collectionModalToggle,
  itemModalToggle,
  searchOpenToggle,
  dispatchSearch
})(ViewCollection));
