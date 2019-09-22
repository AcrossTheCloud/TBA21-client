import * as React from 'react';
import { isEqual } from 'lodash';

import { Carousel, CarouselControl, CarouselIndicators, CarouselItem, Col, Row } from 'reactstrap';
import { itemType } from '../../types/Item';
import { checkTypeIsItem, DetailPreview, ItemOrHomePageData } from '../utils/DetailPreview';
import { FileTypes } from '../../types/s3File';
import AudioPreview from '../layout/audio/AudioPreview';
import { ErrorMessage } from '../utils/alerts';

interface Props {
  items: ItemOrHomePageData[] | undefined;
}
interface State {
  activeIndex: number;
  items: ItemOrHomePageData[];
  slides: JSX.Element[];
  modalOpen: boolean;
}

export class CollectionSlider extends React.Component<Props, State> {
  animating: boolean = false;

  constructor(props: Props) {
    super(props);

    this.state = {
      activeIndex: 0,
      items: this.props.items || [],
      slides: [],
      modalOpen: false
    };
  }

  componentDidMount(): void {
    const slides = this.props.items ? this.slides([...this.props.items]) : [];
    this.setState({ slides });
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void {
    if (this.props.items && !isEqual(this.props.items, prevState.items)) {
      const slides = this.props.items ? this.slides(this.props.items) : [];
      this.setState({ items: this.props.items, slides: slides });
    }
  }

  slides = (slides: ItemOrHomePageData[]): JSX.Element[] => {
    if (!slides) { return [<ErrorMessage key={1} message={'This collection has no items.'} />]; }

    let itemAmount: number = 8;
    if (window.innerWidth < 540) {
      itemAmount = 4;
    } else if (window.innerWidth < 720) {
      itemAmount = 6;
    }

    return slides.reduce( (accumulator: ItemOrHomePageData[][], currentValue: ItemOrHomePageData, currentIndex, array: ItemOrHomePageData[]) => { // tslint:disable-line: no-any
      if (currentIndex % itemAmount === 0) {
        accumulator.push(array.slice(currentIndex, currentIndex + itemAmount));
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
              const isAudio = (!!item.file && item.file.type === FileTypes.Audio) || (!!item.file && item.item_type === itemType.Audio);
              const xs = isAudio ? 12 : 6;
              const sm = isAudio ? 12 : 4;
              const md = isAudio ? 12 : 3;
              return (
                <Col xs={xs} sm={sm} md={md} key={idx} className="px-0">
                  {
                    isAudio ?
                    <AudioPreview
                      data={{
                        id: item.id,
                        title: item.title ? item.title : '',
                        url: item.file.url,
                        isCollection: false,
                        date: checkTypeIsItem(item) ? (!!item.created_at ? item.created_at : '') : (!!item.date ? item.date : '')
                      }}
                    />
                    : <DetailPreview data={item} modalToggle={this.toggleModal}/>
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

  next = () => {
    if (this.animating) {
      return;
    }
    const nextIndex = this.state.activeIndex === this.state.slides.length - 1 ? 0 : this.state.activeIndex + 1;
    this.setState({activeIndex: nextIndex});
  }

  previous = () => {
    if (this.animating) {
      return;
    }
    const nextIndex = this.state.activeIndex === 0 ? this.state.slides.length - 1 : this.state.activeIndex - 1;
    this.setState({activeIndex: nextIndex});
  }

  goToIndex = (newIndex: number) => {
    if (this.animating) {
      return;
    }
    this.setState({activeIndex: newIndex});
  }

  toggleModal = () => {
    this.setState(prevState => ({
      modalOpen: !prevState.modalOpen
    }));
  }

  render() {
    const { activeIndex, items, slides } = this.state;
    if (!items || !items.length) {
      return <></>;
    }

    return (
      <>
        <Carousel
          activeIndex={activeIndex}
          next={this.next}
          previous={this.previous}
        >
          {this.state.slides.length > 1 ?
            <CarouselIndicators items={slides} activeIndex={activeIndex} onClickHandler={this.goToIndex}/>
            : <></>
          }
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
