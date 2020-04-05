import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Col, Row } from 'reactstrap';
import { dispatchLoadMore, fetchCollection, loadMore } from 'actions/collections/viewCollection';
import { ViewCollectionState } from 'reducers/collections/viewCollection';
import { toggle as itemModalToggle } from 'actions/modals/itemModal';
import { ErrorMessage } from '../utils/alerts';
import { browser } from '../utils/browser';
import { RouteComponentProps, withRouter } from 'react-router';
import Share from '../utils/Share';
import moment from 'moment';
import 'styles/components/pages/viewItem.scss';
import { Item, itemType, Regions } from '../../types/Item';
import { Collection } from '../../types/Collection';
import { DetailPreview } from '../utils/DetailPreview';
import { FileTypes } from '../../types/s3File';
import AudioPreview from '../layout/audio/AudioPreview';
import { dateFromTimeYearProduced } from '../../actions/home';
import CollectionModal from '../modals/CollectionModal';
import { debounce, isEqual } from 'lodash';
import { getCollectionsInCollection, getItemsInCollection } from '../../REST/collections';
import { removeTopology } from '../utils/removeTopology';
import { createCriteriaOption } from '../search/SearchConsole';
import { toggle as collectionModalToggle } from '../../actions/modals/collectionModal';
import { pushEntity as pushHistoryEntity } from '../../actions/history';
import { search as dispatchSearch, toggle as searchOpenToggle } from '../../actions/searchConsole';

type MatchParams = {
  id: string;
};

interface Props extends RouteComponentProps<MatchParams>, ViewCollectionState {
  fetchCollection?: Function;
  dispatchLoadMore?: Function;
  parentReference?: Function;
  itemModalToggle: Function;
  collectionModalToggle: Function;
  searchOpenToggle: Function;
  dispatchSearch: Function;
  pushHistoryEntity: Function;

  // ID string passed from the Parent that gives you the modal's body.
  modalBodyID?: string;
}

interface State {
  data: (Item | Collection)[];
  firstItem?: Item;
  offset: number;
  errorMessage?: string;
  collection?: Collection;
  collectionModalToggled: boolean;
  collectionModalData?: Collection;
  dataRowID?: string;
  noMoreData: boolean;
  loading: boolean;
}

const DataLayout = (props: { data: Item | Collection, itemModalToggle?: Function, collectionModalToggle?: Function }): JSX.Element => {
  let response: JSX.Element = <></>;

  if (props.data) {
    if (props.data.__typename === 'item') {
      const data = props.data as Item;

      if (data.item_type === itemType.Audio || data.file.type === FileTypes.Audio) {
        const date = dateFromTimeYearProduced(data.time_produced, data.year_produced);
        response = (
            <AudioPreview
                data={{
                  id: data.id,
                  url: data.file.url,
                  title: data.title ? data.title : '',
                  creators: data.creators ? data.creators : undefined,
                  item_subtype: data.item_subtype ? data.item_subtype : undefined,
                  date: date,
                  isCollection: data.__typename !== 'item'
                }}
                noClick={data.__typename !== 'item'}
            />
        );
      } else {
        response = (
            <DetailPreview
              data={data}
              modalToggle={typeof props.itemModalToggle === 'function' ? props.itemModalToggle : undefined}
            />
        );
      }
    } else if (props.data.__typename === 'collection') {
      const data = props.data as Collection;

      if (data.file && data.id) {
        getCollectionsInCollection({id: data.id, limit: 1000, offset: 0}).then(collectionResponse => {
          const collections = [...removeTopology(collectionResponse, 'collection')] as Collection[];
          data.collections = collections.map((collectionItem) => collectionItem.id) as string[];
        });
        getItemsInCollection({id: data.id, limit: 1000, offset: 0}).then(itemResponses => {
          const items = [...removeTopology(itemResponses, 'item')] as Item[];
          data.items = items.map((itemItem) => itemItem.id) as string[];
        });

        response = (
            <DetailPreview
                modalToggle={() => typeof props.collectionModalToggle === 'function' ? props.collectionModalToggle(data) : undefined}
                data={{
                  file: data.file,
                  id: data.id,
                  title: data.title ? data.title : '',
                  s3_key: '',
                  year_produced: data.year_produced ? data.year_produced : '',
                  time_produced: data.time_produced ? data.time_produced : '',
                  creators: data.creators ? data.creators : [],
                  regions: data.regions ? data.regions : [],
                  created_at: data.created_at ? data.created_at : null,
                  items: data.items as any || [],
                  collections: data.collections as any || [],
                  // Collection specific
                  count: data.count ? data.count : 0,
                  type: data.type ? data.type : undefined,
                  concept_tags: [],
                  keyword_tags: []
                }}
            />
        );
      }
    }
  }

  return (
    <Col
        md={!!props.data && !!props.data.file && props.data.file.type === 'Audio' ? '8' : '4'}
        className="pt-4"
    >
      {response}
    </Col>
  );
};

class ViewCollection extends React.Component<Props, State> {
  browser: string;
  _isMounted: boolean;
  scrollDebounce;
  modalBodyDiv;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;
    const state = {
      data: [],
      offset: 0,
      loading: false,
      noMoreData: false,
      collectionModalToggled: false
    };

    const { match } = this.props;
    if (!this.props.noRedux && match && match.params.id) {
      if (!this.props.collection && typeof this.props.fetchCollection !== 'undefined') {
        Object.assign(state, { loading: true });
        this.props.fetchCollection(match.params.id);
      }
    }

    this.state = state;

    this.browser = browser();

    this.scrollDebounce = debounce( async () => await this.handleScroll(), 300);
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;

    await this.pushCollectionToHistory();

    const { modalBodyID, collection } = this.props;

    if (modalBodyID) {
      this.modalBodyDiv = document.getElementById(modalBodyID);
      this.modalBodyDiv.addEventListener('scroll',  this.scrollDebounce, true);
      await this.loadData();
    } else {
      if (collection && this._isMounted) {
        this.setState({ collection, dataRowID: `dataRow_${collection.id}_${Date.now()}`} , async () => await this.loadData());
      }
      window.addEventListener('scroll',  this.scrollDebounce, true);
    }
  }

  componentWillUnmount(): void {
    if (this.modalBodyDiv) {
      this.modalBodyDiv.removeEventListener('scroll', this.scrollDebounce, false);
    } else {
      window.removeEventListener('scroll',  this.scrollDebounce, true);
    }

    this._isMounted = false;
  }

  async componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>): Promise<void> {
    if (!this._isMounted) { return; }

    const state = {};

    await this.pushCollectionToHistory(prevProps.collection);

    if (!this.props.noRedux) {
      if (typeof prevProps.collection === 'undefined' && !!this.props.collection) {
        // We've just loaded our collection via fetchCollection
        this.setState({ collection: this.props.collection, dataRowID: `dataRow_${this.props.collection.id}_${Date.now()}` }, async () => await this.loadData());
        return;
      }

      if (!!this.props.collection && !isEqual(this.props.collection, this.state.collection)) {
        Object.assign(state, {collection: this.props.collection, dataRowID: `dataRow_${this.props.collection.id}_${Date.now()}`});
      }

      if (!isEqual(this.props.data, this.state.data)) {
        Object.assign(state, {
          data: this.props.data,
          firstItem: this.state.data ?
              this.state.data
                  .filter((data: Item | Collection) => {
                    return data.__typename === 'item';
                  })[0]
              : undefined
        });
      }

      if (this.props.noMoreData !== prevProps.noMoreData && this.props.noMoreData) {
        Object.assign(state, { noMoreData: true });
      }

      if (Object.keys(state).length && this._isMounted) {
        this.setState(state);
      }
    }
  }

  async pushCollectionToHistory(prevCollection?: Collection): Promise<void> {
    if (this.props.collection !== undefined) {
      if (prevCollection !== undefined) {
        if (JSON.stringify(this.props.collection) !== JSON.stringify(prevCollection)) {
          const historyEntity = await this.createHistoryEntity();
          this.props.pushHistoryEntity(historyEntity);
        }
      } else {
        const historyEntity = await this.createHistoryEntity();
        this.props.pushHistoryEntity(historyEntity);
      }
    }
  }

  async createHistoryEntity(): Promise<Collection> {
    return {...this.props.collection, __typename: 'collection'};
  }

  loadData = async () => {
    if (!this._isMounted || this.state.noMoreData) { return; }

    this.setState({ loading: true });
    // If we have an id from the URL pass it through, otherwise use the one from Redux State
    if (this.state.collection && this.state.collection.id) {
      if (this.props.noRedux) {
        try {
          await loadMore(this.state.collection.id, this.state.offset, (datum) => {
            if (!this._isMounted) { return; }
            if (datum) {
              this.setState({data: [...this.state.data, datum], offset: this.state.offset + 10});
            } else {
              this.setState({ noMoreData: true });
            }
          });
        } catch (e) {
          this.setState({ errorMessage: 'Something went wrong loading the data for this collection, sorry!' });
        }
      } else {
        if (this.props.collection && typeof this.props.dispatchLoadMore === 'function') {
          await this.props.dispatchLoadMore(this.props.collection.id, this.props.offset);
        }
      }

      if (this._isMounted) {
        this.setState({loading: false}, () => {
          if (this.scrollCheck()) {
            this.loadData();
          }
        });
      }
    }
  }

  collectionModalToggle = (collectionModalData: Collection) => {
    if (!this._isMounted) { return; }
    this.setState({ collectionModalData, collectionModalToggled: !this.state.collectionModalToggled });
  }

  /**
   * returns true for the bottom of the page or false for anywhere above the bottom
   */
  scrollCheck = (): boolean => {
    if (this.modalBodyDiv) {
      return ( this.modalBodyDiv.scrollTop >= ((this.modalBodyDiv.scrollHeight - this.modalBodyDiv.offsetHeight) / 1.7) );
    } else {
      if (this.state.dataRowID) {
        const dataRowElement = document.getElementById(this.state.dataRowID);
        if (dataRowElement) {
          return (document.documentElement.scrollTop >= (document.body.offsetHeight - dataRowElement.offsetHeight) / 1.7);
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  handleScroll = async () => {
    if (this.state.noMoreData) { return; }

    if (!this.state.loading && this.scrollCheck()) {
      await this.loadData();
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
    if (typeof this.state.collection === 'undefined') {
      return <ErrorMessage message={this.props.errorMessage} />;
    }

    const {
      id,
      creators,
      title,
      description,
      created_at,
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
    } = this.state.collection;

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

    const CollectionDetails = (props: { label: string, value: string | JSX.Element }): JSX.Element => (
      <Row className="border-bottom subline details">
        <Col xs="12" md="6">{props.label}</Col>
        <Col xs="12" md="6">{props.value}</Col>
      </Row>
    );

    return (
      <div id="item" className="container-fluid">
        <ErrorMessage message={this.props.errorMessage} />

        <Row>
          {
            this.state.firstItem ?
                (
                    <DataLayout
                        data={this.state.firstItem}
                        key={this.state.firstItem.id}
                        itemModalToggle={this.props.itemModalToggle}
                        collectionModalToggle={this.collectionModalToggle}
                    />
                )
                : <></>
          }
        </Row>

        {this.state.collectionModalData ?
            (
                <CollectionModal
                    collection={this.state.collectionModalData}
                    open={this.state.collectionModalToggled}
                    toggle={this.collectionModalToggle}
                />
            )
            : <></>
        }

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
              (
                <Row>
                  <Col className="text-right">
                    <Share suffix={`collection/${id}`}/>
                  </Col>
                </Row>
              )
              : <></>
            }

            <Row id={this.state.dataRowID}>
              {
                this.state.data ?
                    this.state.data
                        .filter((data: Item | Collection) => {
                          return this.state.firstItem && data.id !== this.state.firstItem.id;
                        })
                        .map((data: Item | Collection, i) => (
                        <DataLayout
                            data={data}
                            key={i}
                            itemModalToggle={this.props.itemModalToggle}
                            collectionModalToggle={this.collectionModalToggle}
                        />
                        ))
                    : <></>
              }
            </Row>
          </Col>

          <Col xs="12" md="4" className="right">
            {!!title ?
                <CollectionDetails label="Title" value={title} /> : <></>
            }
            {!!created_at ?
                <CollectionDetails label="Date created" value={moment(created_at).format('Do MMMM YYYY')} /> : <></>
            }
            {!!creators ?
                <CollectionDetails label="Creators" value={creators.join(', ')} /> : <></>
            }
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
            {!!url ? <CollectionDetails label="Link" value={<a href={url} target="_blank" rel="noreferrer noopener">Click here to view</a>} /> : ''}

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
const mapStateToProps = (state: { viewCollection: ViewCollectionState }, props: { modalBodyID?: string, collection?: Collection, noRedux?: boolean, history: History }) => {
  return {
    errorMessage: state.viewCollection.errorMessage,
    collection: props.collection || state.viewCollection.collection,
    data: state.viewCollection.data,
    firstItem: state.viewCollection.firstItem,
    offset: state.viewCollection.offset,
    noMoreData: state.viewCollection.noMoreData,
    noRedux: !!props.noRedux || false,
    modalBodyID: props.modalBodyID,
  };
};

// Connect our redux store State to Props, and pass through the fetchCollection function.
export default withRouter(connect(mapStateToProps, {
  fetchCollection,
  dispatchLoadMore,
  collectionModalToggle,
  itemModalToggle,
  pushHistoryEntity,
  searchOpenToggle,
  dispatchSearch
})(ViewCollection));
