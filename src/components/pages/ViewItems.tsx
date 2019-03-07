import * as React from 'react';
import { Container } from 'reactstrap';

import { API } from 'aws-amplify';

import { OceanObject } from './TableRow';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import 'styles/pages/ViewItems.scss';
import { MultiMedia } from 'src/components/utils/MultiMedia';

import { cancelablePromise, appendPendingPromise, removePendingPromise } from 'src/components/utils/cancelablePromise';

interface OceanObjectResults {
  Items: Array<OceanObject>;
  sliderInitialized: boolean;
}

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

const SlickSlider: any = (props: {items: Array<OceanObject>}) => { // tslint:disable-line: no-any
  if (props && props.items && props.items.length) {
    let results = props.items.map((item, index) => {
      const multiMedia = (item.urls && item.urls[0]) ? <div className="image"><MultiMedia url={item.urls[0]} key={index + '_mm'} /></div> : '';

      return (
        <div className="item" key={index}>
          {multiMedia}
          <div className="description">{item.description}</div>
        </div>
      );
    });

    const theSlider = (
      <Slider {...sliderSettings}>
        {results}
      </Slider>
    );

    return results.length ? theSlider : 'There are no results.';
  } else {
    return <React.Fragment/>;
  }
};

export default class ViewItems extends React.Component<{}, OceanObjectResults> {
  pendingPromises: any = []; // tslint:disable-line: no-any

  state: OceanObjectResults = {
    Items: [],
    sliderInitialized: false
  };

  componentDidMount() {
    const wrappedPromise = cancelablePromise(API.get('tba21', 'items', {}));

    appendPendingPromise(this, wrappedPromise);

    wrappedPromise.promise
      .then((data: any) => { // tslint:disable-line: no-any
        this.setState({Items : data.Items, sliderInitialized: true});
      })
      .then(() => {
        removePendingPromise(this, wrappedPromise);
      })
      .catch((e: any) => { // tslint:disable-line: no-any
        removePendingPromise(this, wrappedPromise);
      });
  }

  componentWillUnmount(): void {
    this.pendingPromises.map(p => p.cancel());
  }

  // todo replace Loading with Bootstrap spinner
  render() {
    return (
      <Container>
        {this.state.sliderInitialized ? (
          <SlickSlider items={this.state.Items}/>
        ) : <div>Loading...</div> }

      </Container>
    );
  }
}
