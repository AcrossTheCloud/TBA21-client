import * as React from 'react';
import { Alert, Container } from 'reactstrap';

import { API } from 'aws-amplify';

import { OceanObject } from './TableRow';

import Slider from 'react-slick';
import { MultiMedia } from 'src/components/utils/MultiMedia';
import { cancelablePromise, appendPendingPromise, removePendingPromise } from 'src/components/utils/CancelablePromise';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'styles/pages/ViewItems.scss';

interface ViewItemsState {
  Items: Array<OceanObject>;
  sliderInitialized: boolean;
  sliderError: boolean;
}

// Settings for the slider
const sliderSettings = {
  centerMode: true,
  centerPadding: '10px',
  dots: false,
  arrows: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
      }
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
      }
    }
    // You can unslick at a given breakpoint now by adding:
    // settings: "unslick"
    // instead of a settings object
  ]
};

/**
 *
 *
 *
 * @param {object} props Items {Array<ObjectOcean>} Array of OceanObject
 * @param {object} props sliderInitialized {boolean} If the slider has been initialized or not
 * @param {object} props sliderError {boolean} If the slider is in error state
 * @constructor
 */
const SlickSlider: any = (props: ViewItemsState): JSX.Element => { // tslint:disable-line: no-any

  // Loading icon / content
  if (!props.sliderInitialized && !props.sliderError) {
    return <React.Fragment>Loading...</React.Fragment>; // todo Replace with Bootstrap spinner
  }

  // Error message
  if (props.sliderError) {
    return <Alert color="danger">Error loading items.</Alert>;
  }

  if (!props || props.Items && !props.Items.length) {
    // No content message if the list is empty.
    return <React.Fragment><Alert color="danger">No items in this section</Alert></React.Fragment>;
  } else {
    // Map results, with HTML structure.
    let results = props.Items.map((item, index) => {
      const multiMedia = (item.urls && item.urls[0]) ? <div className="image"><MultiMedia url={item.urls[0]} key={index + '_mm'} /></div> : '';

      return (
        <div className="item" key={index}>
          {multiMedia}
          <div className="description">{item.description}</div>
        </div>
      );
    });

    // The slider and it's results
    const theSlider: JSX.Element = (
      <Slider {...sliderSettings}>
        {results}
      </Slider>
    );

    // If we don't have any results for some reason, show an error message.
    // Otherwise show the slider.
    return results.length ? theSlider : <Alert color="danger">There are no results.</Alert>;
  }
};

/**
 *
 * Show items from the Items API call in a slider type view
 *
 */
export default class ViewItems extends React.Component<{}, ViewItemsState> {
  pendingPromises: any = []; // tslint:disable-line: no-any

  state: ViewItemsState = {
    Items: [],
    sliderInitialized: false,
    sliderError: false
  };

  /**
   * API call on did mount.
   * Wrapping the API call in our CancelablePromise method to avoid updates to the DOM if you're no longer on the page.
   */
  componentDidMount() {
    const wrappedPromise = cancelablePromise(API.get('tba21', 'items', {}));
    appendPendingPromise(this, wrappedPromise);

    // Wrap the promise.
    wrappedPromise.promise
      .then((data: any) => { // tslint:disable-line: no-any
        if (data === null) { return this.setState({sliderError: true}); }

        this.setState({Items : data.Items, sliderInitialized: true, sliderError: false});
      })
      .then(() => {
        removePendingPromise(this, wrappedPromise);
      })
      .catch((e: any) => { // tslint:disable-line: no-any
        removePendingPromise(this, wrappedPromise);
        this.setState({sliderError: true});
      });
  }

  componentWillUnmount(): void {
    // Cancel all pending promises on this class.
    this.pendingPromises.map(p => p.cancel());
  }

  render() {
    return (
      <Container>
        <SlickSlider Items={this.state.Items} sliderInitialized={this.state.sliderInitialized} sliderError={this.state.sliderError}/>
      </Container>
    );
  }
}
