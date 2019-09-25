import * as React from 'react';
import { connect } from 'react-redux';

import { Carousel, CarouselControl, CarouselItem, Col, Row } from 'reactstrap';
import { itemType } from '../../types/Item';
import { checkTypeIsItem, DetailPreview, ItemOrHomePageData } from '../utils/DetailPreview';
import { FileTypes } from '../../types/s3File';
import AudioPreview from '../layout/audio/AudioPreview';
import { ErrorMessage } from '../utils/alerts';
import { toggle } from 'actions/modals/itemModal';
import { loadMoreDispatch } from 'actions/collections/viewCollection';
import { ViewCollectionState } from '../../reducers/collections/viewCollection';

interface Props extends ViewCollectionState {
  toggle: Function;
  loadMoreDispatch: Function;
}
interface State {
  activeIndex: number;
  slides: JSX.Element[];
}

class CollectionSlider extends React.Component<Props, State> {
  animating: boolean = false;

  constructor(props: Props) {
    super(props);

    this.state = {
      activeIndex: 0,
      slides: []
    };
  }

  componentDidMount(): void {
    const slides = this.props.items ? this.slides([...this.props.items]) : [];
    this.setState({ slides });
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const currentCollectionID = this.props.collection ? this.props.collection.id : 0;
    const prevCollectionID = prevProps.collection ? prevProps.collection.id : 0;
    if (currentCollectionID !== prevCollectionID || this.props.offset !== prevProps.offset) {
      const slides = this.props.items ? this.slides(this.props.items) : [];
      this.setState({ slides: slides });
    }
  }

  slides = (slides: ItemOrHomePageData[]): JSX.Element[] => {
    if (!slides) { return [<ErrorMessage key={1} message={'This collection has no items.'} />]; }

    let itemAmount: number = 1;
    if (window.innerWidth >= 540) {
      itemAmount = 2;
    }
    if (window.innerWidth >= 1000) {
      itemAmount = 4;
    }
    if (window.innerWidth >= 1500) {
      itemAmount = 8;
    }

    return slides.reduce( (accumulator: ItemOrHomePageData[][], currentValue: ItemOrHomePageData, currentIndex, array: ItemOrHomePageData[]) => { // tslint:disable-line: no-any
      if (currentIndex % itemAmount === 0) {
        let arr = array.slice(currentIndex, currentIndex + itemAmount);
        const audioAtTheEnd = arr.filter(x => x.item_type !== itemType.Audio).concat(arr.filter(x => x.item_type === itemType.Audio));
        accumulator.push(audioAtTheEnd);
      }
      return accumulator;
    }, []).map((items: ItemOrHomePageData[], index) => (
      <CarouselItem
        interval={false}
        onExiting={this.onExiting}
        onExited={this.onExited}
        key={index}
      >
        <Row className="mx-0">
          {
            items.map( (item: ItemOrHomePageData, idx: number) => {
              const isAudio = (!!item.file && item.item_type === itemType.Audio) || (!!item.file && item.file.type === FileTypes.Audio);
              const xs = 12;
              const sm = isAudio ? 12 : 6;
              const md = isAudio ? 12 : 4;
              const lg = isAudio ? 12 : 3;
              return (
                <Col xs={xs} sm={sm} md={md} lg={lg} key={idx} id={item.id} className="px-0">
                  {
                    isAudio ?
                    <AudioPreview
                      data={{
                        id: `${item.id}_slider`,
                        title: item.title ? item.title : '',
                        url: item.file.url,
                        isCollection: false,
                        date: checkTypeIsItem(item) ? (!!item.created_at ? item.created_at : '') : (!!item.date ? item.date : '')
                      }}
                    />
                    : <DetailPreview data={item} modalToggle={() => this.props.toggle(true, item)} />
                  }
                </Col>
              );
            })
          }

        </Row>
      </CarouselItem>
    ));
  }

  onExiting = () => {
    this.animating = true;
  }

  onExited = () => {
    this.animating = false;
  }

  windowForceResizeEvent() {
    // If we have Audio previews in the slides, we must force a resize event for the display to show (unfortunately)
    window.dispatchEvent(new Event('resize'));
  }

  next = async () => {
    if (this.animating) {
      return;
    }
    const nextIndex = this.state.activeIndex === this.state.slides.length - 1 ? 0 : this.state.activeIndex + 1;
    await this.props.loadMoreDispatch(nextIndex);
    this.setState({activeIndex: nextIndex});
    this.windowForceResizeEvent();
  }

  previous = async () => {
    if (this.animating) {
      return;
    }
    const prevIndex = this.state.activeIndex === 0 ? this.state.slides.length - 1 : this.state.activeIndex - 1;
    await this.props.loadMoreDispatch(false);
    this.setState({activeIndex: prevIndex});
    this.windowForceResizeEvent();
  }

  goToIndex = async (newIndex: number) => {
    if (this.animating) {
      return;
    }
    await this.props.loadMoreDispatch(newIndex);
    this.setState({activeIndex: newIndex});
    this.windowForceResizeEvent();
  }

  render() {
    const { activeIndex, slides } = this.state;
    if (!this.props.items || !this.props.items.length) {
      return <></>;
    }

    return (
      <>
        <Carousel
          activeIndex={activeIndex}
          next={this.next}
          interval={false}
          previous={this.previous}
        >
          {slides}
          {this.state.slides.length > 1 ?
            <>
              <CarouselControl direction="prev" directionText="Previous" onClickHandler={this.previous}/>
              <CarouselControl direction="next" directionText="Next" onClickHandler={this.next}/>
            </>
            : <></>
          }
        </Carousel>
      </>

    );
  }
}

// State to props
const mapStateToProps = (state: { viewCollection: ViewCollectionState }) => { // tslint:disable-line: no-any
  return {
    items: state.viewCollection.items,
    collection: state.viewCollection.collection,
    offset: state.viewCollection.offset
  };
};

export default connect(mapStateToProps, { toggle, loadMoreDispatch })(CollectionSlider);
