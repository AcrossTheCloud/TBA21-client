import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Col, Row } from 'reactstrap';
import { dispatchLoadMore, fetchCollection, loadMore } from 'actions/collections/viewCollection';
import { ViewCollectionState } from 'reducers/collections/viewCollection';
import { ErrorMessage } from '../utils/alerts';
import { browser } from '../utils/browser';
import LicenceLink from '../utils/LicenceLink'
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
import { debounce, isEqual } from 'lodash';
import { getCollectionsInCollection, getItemsInCollection } from '../../REST/collections';
import { removeTopology } from '../utils/removeTopology';
import { createCriteriaOption } from '../search/SearchConsole';
import { toggle as collectionModalToggle } from '../../actions/modals/collectionModal';
import { toggle as itemModalToggle } from 'actions/modals/itemModal';
import { pushEntity as pushUserHistoryEntity } from '../../actions/user-history';
import { search as dispatchSearch, toggle as searchOpenToggle } from '../../actions/searchConsole';
import { UserHistoryState } from '../../reducers/user-history';
import HtmlDescription from '../utils/HtmlDescription';
import _ from 'lodash';

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
  pushUserHistoryEntity: Function;

  // ID string passed from the Parent that gives you the modal's body.
  modalBodyID?: string;
  userHistory?: UserHistoryState;
}

interface State {
  data: (Item | Collection)[] | undefined;
  firstItem: Item | undefined;
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

      if (data.item_type === itemType.Audio || (data.file && data.file.type === FileTypes.Audio)) {
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
              isBanner={true}
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
                  // tslint:disable-next-line:no-any
                  items: data.items as any || [],
                  // tslint:disable-next-line:no-any
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
        md={!!props.data && !!props.data.file && props.data.file.type === 'Audio' ? '12' : '4'}
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
      data: undefined,
      firstItem: undefined,
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

    await this.pushCollectionToHistory(prevProps.collection);

    if (this.props.noMoreData !== prevProps.noMoreData && this.props.noMoreData) {
      this.setState( { noMoreData: true });
    }

    if (!this.props.noRedux) {
      if ((typeof prevProps.collection === 'undefined' && !!this.props.collection) || (!!this.props.collection && !!this.state.collection && this.props.collection.id !== this.state.collection.id)) {
        // We've just loaded our collection via fetchCollection
        this.setState(
            {
              noMoreData: false,
              loading: false,
              collection: this.props.collection,
              dataRowID: `dataRow_${this.props.collection.id}_${Date.now()}`
            },
            async () => await this.loadData()
        );
        return;
      }

      if (!isEqual(this.props.data, this.state.data)) {
        const items = this.props.data ? this.props.data
            .filter((data: Item | Collection) => {
              return data.__typename === 'item';
              // tslint:disable-next-line:no-any
            }) as any : [];

        const collections = this.props.data ? this.props.data
            .filter((data: Item | Collection) => {
              return data.__typename === 'collection';
              // tslint:disable-next-line:no-any
            }) as any : [];

        this.setState({
          data: this.props.data || [],
          collection: {
            ...this.state.collection,
            items: [...items],
            collections: [...collections]
          } as Collection,
          firstItem: this.props.data ?
              this.props.data
                  .filter((data: Item | Collection) => {
                    return data.__typename === 'item';
                  })
                  .filter((data: Item) => {
                    return (data.item_type === 'Image' || data.item_type === 'Video')
                  })[0] as Item
              : undefined
        });
      }
    }
  }

  async pushCollectionToHistory(prevCollection?: Collection): Promise<void> {
    if (this.props.collection !== undefined) {
      if (prevCollection !== undefined) {
        if (!_.isEqual(this.props.collection,prevCollection)) {
          const userHistoryEntity = await this.createHistoryEntity();
          this.props.pushUserHistoryEntity(userHistoryEntity);
        }
      } else {
        const userHistoryEntity = await this.createHistoryEntity();
        this.props.pushUserHistoryEntity(userHistoryEntity);
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
              this.setState({data: [...this.state.data as [], datum], offset: this.state.offset + 10});
            } else {
              this.setState({ noMoreData: true });
            }
          });
        } catch (e) {
          this.setState({ errorMessage: 'Something went wrong loading the data for this collection, sorry!' });
        }
      } else {
        if (typeof this.props.dispatchLoadMore === 'function') {
          await this.props.dispatchLoadMore(this.state.collection.id, this.props.offset);
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
    if (typeof this.props.fetchCollection !== 'undefined') {
      this.props.collectionModalToggle(true, collectionModalData)
    }
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

    if (this.props.userHistory && this.props.userHistory.loading) {
      return (<></>);
    }

    return (
      <div id="item" className="container-fluid">
        <ErrorMessage message={this.props.errorMessage} />

        <Row>
          {
            this.state.firstItem ?
                (
                    <DataLayout
                        data={this.state.firstItem}
                        key={`firstItem_${this.state.firstItem.id}`}
                        itemModalToggle={this.props.itemModalToggle}
                        collectionModalToggle={this.collectionModalToggle}
                    />
                )
                : <></>
          }
        </Row>

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
                    <HtmlDescription description={description} />
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
                this.state.collection.collections && this.state.collection.collections.length ?
                    // tslint:disable-next-line:no-any
                    (this.state.collection.collections as any[])
                        .map((collection: Collection, i) => (
                            <DataLayout
                                data={collection}
                                key={`collection_${collection.id}`}
                                itemModalToggle={this.props.itemModalToggle}
                                collectionModalToggle={this.collectionModalToggle}
                            />
                          ))
                    : <></>
              }
              {
                this.state.collection.items && this.state.collection.items.length ?
                    // tslint:disable-next-line:no-any
                    (this.state.collection.items as any[])
                        .filter((item: Item) => {
                          return this.state.firstItem && item.id !== this.state.firstItem.id;
                        })
                        .map((item: Item, i) => (
                            <DataLayout
                                data={item}
                                key={`item_${item.id}`}
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
            {!!license ? <LicenceLink licence={license} /> : ''}
            {!!copyright_holder ? <CollectionDetails label="Copyright Owner" value={copyright_holder} /> : ''}
            {!!url ? <CollectionDetails label="Relation" value={<a href={url} target="_blank" rel="noreferrer noopener">Click here to view</a>} /> : ''}

            {!!aggregated_concept_tags && aggregated_concept_tags.length ?
              (
                <Row className="border-bottom subline details">
                  <Col xs="12" className="mb-2">Concept Tags</Col>
                  <Col xs="12">
                    <div className="tagWrapper">
                    {
                      aggregated_concept_tags.map(t => {
                        return (
                            <Button
                                className="page-link tag d-inline-block"
                                style={{padding: 0, marginBottom: 10, background: 'none'}}
                                key={t.tag_name}
                                onClick={() => this.onTagClick(t.tag_name, 'concept_tag')}
                            >
                              #{t.tag_name}
                            </Button>
                        );
                      })
                    }
                    </div>
                  </Col>
                </Row>
              )
            : ''}
            {!!aggregated_keyword_tags && aggregated_keyword_tags.length ?
              (
                <Row className="subline details">
                  <Col xs="12" >Keyword Tags</Col>
                  <Col xs="12">
                    <div className="tagWrapper">
                    {
                      aggregated_keyword_tags.map(t => {
                        return (
                            <Button
                                className="ml-1 tag d-inline-block"
                                style={{padding: 0, paddingRight: 15, paddingLeft: 0, margin: 0, background: 'none'}}
                                key={t.tag_name}
                                onClick={() => this.onTagClick(t.tag_name, 'keyword_tag')}
                            >
                              #{t.tag_name}
                            </Button>
                        );
                      })
                    }
                    </div>
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
const mapStateToProps = (state: { viewCollection: ViewCollectionState, userHistory: UserHistoryState }, props: { modalBodyID?: string, collection?: Collection, noRedux?: boolean}) => {
  return {
    errorMessage: state.viewCollection.errorMessage,
    collection: props.collection || state.viewCollection.collection,
    data: state.viewCollection.data,
    firstItem: state.viewCollection.firstItem,
    offset: state.viewCollection.offset,
    noMoreData: state.viewCollection.noMoreData,
    noRedux: !!props.noRedux || false,
    modalBodyID: props.modalBodyID,
    userHistory: state.userHistory
  };
};

// Connect our redux store State to Props, and pass through the fetchCollection function.
export default withRouter(connect(mapStateToProps, {
  fetchCollection,
  dispatchLoadMore,
  collectionModalToggle,
  itemModalToggle,
  pushUserHistoryEntity,
  searchOpenToggle,
  dispatchSearch
})(ViewCollection));
