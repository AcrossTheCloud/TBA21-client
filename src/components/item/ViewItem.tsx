import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Col, Row } from 'reactstrap';
import { fetchItem } from 'actions/items/viewItem';
import { ViewItemState } from 'reducers/items/viewItem';
import { Alerts, ErrorMessage } from '../utils/alerts';
import { Item, itemType, Regions } from '../../types/Item';
import { FilePreview } from '../utils/filePreview';
import { Languages } from '../../types/Languages';
import { browser } from '../utils/browser';
import { RouteComponentProps, withRouter } from 'react-router';
import 'styles/components/pages/viewItem.scss';
import Share from '../utils/Share';
import moment from 'moment';
import { FileTypes } from '../../types/s3File';
import AudioPreview from '../layout/audio/AudioPreview';
import { dateFromTimeYearProduced } from '../../actions/home';
import { pushEntity as pushUserHistoryEntity } from '../../actions/user-history';
import { search as dispatchSearch, toggle as searchOpenToggle } from '../../actions/searchConsole';
import { createCriteriaOption } from '../search/SearchConsole';
import { toggle as collectionModalToggle } from 'actions/modals/collectionModal';
import { toggle as itemModalToggle } from 'actions/modals/itemModal';
import { UserHistoryState } from '../../reducers/user-history';
import { HomepageData } from '../../reducers/home';

type MatchParams = {
  id: string;
};

interface Props extends RouteComponentProps<MatchParams>, Alerts {
  fetchItem: Function;
  collectionModalToggle: Function;
  itemModalToggle: Function;
  searchOpenToggle: Function;
  dispatchSearch: Function;
  pushUserHistoryEntity: Function;
  item: Item;
  userHistory?: UserHistoryState;
}

interface State {
  errorMessage: string | undefined;
  item: HomepageData | Item | undefined;
}

class ViewItem extends React.Component<Props, State> {
  browser: string;

  constructor(props: any) { // tslint:disable-line: no-any
    super(props);

    this.browser = browser();

    this.state = {
      errorMessage: undefined,
      item: undefined
    };
  }

  componentDidMount() {
    this.pushItemToHistory();

    const { match } = this.props;
    let matchedItemId: string | null = null;

    // Get our itemId passed through from URL props
    if (match.params.id) {
      matchedItemId = match.params.id;
    }

    // If we have an id from the URL pass it through, otherwise use the one from Redux State
    if (matchedItemId) {
      this.props.fetchItem(matchedItemId);
    } else {
      this.setState({ errorMessage: 'No item with that id.' });
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>): void {
    this.pushItemToHistory(prevProps.item);
  }

  pushItemToHistory(prevItem?: Item) {
    if (this.props.item !== undefined) {
      if (prevItem !== undefined) {
        if (JSON.stringify(this.props.item) !== JSON.stringify(prevItem)) {
          const userHistoryEntity = this.createHistoryEntity();
          this.props.pushUserHistoryEntity(userHistoryEntity);
        }
      } else {
        const userHistoryEntity = this.createHistoryEntity();
        this.props.pushUserHistoryEntity(userHistoryEntity);
      }
    }
  }

  createHistoryEntity(): Item {
    return {...this.props.item, __typename: 'item'};
  }

  // @todo should be a util / dispatch
  onTagClick = (label: string, field: string) => {
    setTimeout(() => {
      this.props.collectionModalToggle(false);
      this.props.itemModalToggle(false);
      this.props.searchOpenToggle(true);
      this.props.dispatchSearch([createCriteriaOption(label, field)]);
    });
  }

  render() {
    if (typeof this.props.item === 'undefined') {
      return <ErrorMessage message={this.props.errorMessage} />;
    }

    const {
      id,
      file,
      creators,
      title,
      description,
      item_subtype,
      regions,
      language,
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
      copyright_holder,
      url,
      medium,
      item_type,
      directors,
      collaborators
    } = this.props.item;

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

    const ItemDetails = (props: { label: string, value: string | JSX.Element }): JSX.Element => (
      <Row className="border-bottom subline details">
        <Col xs="12" md="6">{props.label}</Col>
        <Col xs="12" md="6">{props.value}</Col>
      </Row>
    );

    const isAudio = (!!file && item_type === itemType.Audio) || (!!file && file.type === FileTypes.Audio);

    if (this.props.userHistory && this.props.userHistory.loading) {
      return (<></>);
    }

    return (
      <div id="item" className="container-fluid">
        <ErrorMessage message={this.props.errorMessage} />
        {file && file.url ?
          (
            <Row className="file">
              {
                isAudio ?
                    (
                      <div className="w-100">
                        <AudioPreview
                          data={{
                            id: `${id}_slider`,
                            title: title ? title : '',
                            url: file.url,
                            isCollection: false,
                            date: dateFromTimeYearProduced(time_produced, year_produced)
                          }}
                        />
                      </div>
                    )
                  : <FilePreview file={file}/>
              }
            </Row>
          )
          : <></>
        }
        <Row>
          <Col xs="12" md="8" className="left border-right">
            <Row>
              <Col xs={{ size: 12, order: 2 }} md={{ size: 8, order: 1 }} className="creators">
                {creators ? creators.join(', ') : <></>}
              </Col>
              <Col xs={{ size: 12, order: 1 }} md={{ size: 4, order: 2 }} className="subline text-right">
                {item_subtype}
              </Col>
            </Row>
            <Row>
              <Col>
                <h1>{title}</h1>
              </Col>
            </Row>

            <Row>
              { file && file.type === FileTypes.DownloadText && file.url ?
                  (
                      <Col xs="12" className="download pb-2">
                        <a href={file.url} target="_blank" rel="noopener noreferrer">Click here to download this file.</a>
                      </Col>
                  )
                :
                ''
              }
              <Col className="description">
                {
                  description ?
                    this.browser === 'ie6-11' ? description.split('\n').map((d, i) => <p key={i}>{d}</p>) : description
                  : <></>
                }
              </Col>
            </Row>

            {!!id ?
                (
                    <Row>
                      <Col className="text-right">
                        <Share suffix={`view/${id}`}/>
                      </Col>
                    </Row>
                )
              : <></>
            }

          </Col>
          <Col xs="12" md="4" className="right">
            {!!time_produced ?
              <ItemDetails label="Date Produced" value={moment(time_produced).format('Do MMMM YYYY')} />
              : year_produced ? <ItemDetails label="Year Produced" value={year_produced} /> : <></>
            }
            {!!venues && venues.length ?
              <ItemDetails label={venues.length > 1 ? 'Publication Venue' : 'Publication Venues'} value={`${venues.join(', ')}`} />
              : <></>
            }
            {!!exhibited_at && exhibited_at.length ?
              <ItemDetails label="Exhibited At" value={`${exhibited_at.join(', ')}`} />
              : <></>
            }
            {!!regions && regions.length ?
              <ItemDetails label={regions.length > 1 ? 'Regions' : 'Region'} value={regions.map((region) => (Regions[region])).join(', ')} />
            :
              ''
            }
            {directors && directors.length ? <ItemDetails label={directors.length > 1 ? 'Directors' : 'Director'} value={directors.join(', ')} /> : <></>}
            {collaborators && collaborators.length ? <ItemDetails label={collaborators.length > 1 ? 'Collaborators' : 'Collaborator'} value={collaborators.join(', ')} /> : <></>}

            {!!language ? <ItemDetails label="Language" value={Languages[language]} /> : ''}
            {!!license ? <ItemDetails label="License" value={license} /> : ''}
            {!!copyright_holder ? <ItemDetails label="Copyright Owner" value={copyright_holder} /> : ''}
            {!!medium ? <ItemDetails label="Medium" value={medium} /> : ''}
            {!!url ? <ItemDetails label="Link" value={<a href={url} target="_blank" rel="noreferrer noopener">Click here to view</a>} /> : ''}

            {!!aggregated_concept_tags && aggregated_concept_tags.length ?
                (
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
                )
            : ''}
            {!!aggregated_keyword_tags && aggregated_keyword_tags.length ?
                (
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
                )
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
const mapStateToProps = (state: { viewItem: ViewItemState, userHistory: UserHistoryState }) => ({
  errorMessage: state.viewItem.errorMessage,
  item: state.viewItem.item,
  userHistoryLoading: state.userHistory.loading
});

// Connect our redux store State to Props, and pass through the fetchItem function.
export default withRouter(connect(mapStateToProps, {
  fetchItem,
  collectionModalToggle,
  itemModalToggle,
  searchOpenToggle,
  dispatchSearch,
  pushUserHistoryEntity
})(ViewItem));
