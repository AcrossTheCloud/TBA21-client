import * as React from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'reactstrap';
import { connect } from 'react-redux';

import Slider from 'react-slick';
import { MultiMedia } from 'components/utils/MultiMedia';

import { fetchItems } from '../../actions/items/viewItems';
import { State } from '../../reducers/items/viewItems';

import { OceanObject } from '../TableRow';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'styles/components/ViewItems.scss';
import { ErrorMessage, WarningMessage } from '../utils/alerts';

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
const SlickSlider: any = (props: State): JSX.Element => { // tslint:disable-line: no-any

  // Loading icon / content
  if (!props.sliderInitialized && !props.sliderError) {
    return <React.Fragment>Loading...</React.Fragment>; // todo Replace with Bootstrap spinner
  }

  // Error message
  if (props.sliderError) {
    return <ErrorMessage message="Error loading items."/>;
  }

  if (!props || (props.items && !props.items.length)) {
    // No content message if the list is empty.
    return <ErrorMessage message="No items in this section."/>;
  } else {
    // Map results, with HTML structure.
    let results = props.items.map((item, index) => {
      const multiMedia = (item.urls && item.urls[0]) ? <div className="image"><MultiMedia url={item.urls[0]} key={index + '_mm'} /></div> : '';

      return (
        <Link
          to={`/view/${item.itemId}`}
          className="item"
          key={index}
        >
          <>
            {multiMedia}
            <div className="description">{item.description}</div>
          </>
        </Link>
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
    return results.length ? theSlider : <WarningMessage message="There are no results."/>;
  }
};

interface Props {
  fetchItems: Function;
  items: OceanObject[];
  sliderInitialized: boolean;
  sliderError: boolean;
}

/**
 *
 * Show items from the Items API call in a slider type view
 *
 */
class ViewItems extends React.Component<Props, {}> { // tslint:disable-line: no-any

  componentDidMount(): void {
    if (!this.props.items.length) {
      this.props.fetchItems();
    }
  }

  render() {
    return (
      <Container id="viewItems">
        <SlickSlider items={this.props.items} sliderInitialized={this.props.sliderInitialized} sliderError={this.props.sliderError}/>
      </Container>
    );
  }
}

const mapStateToProps = (state: { viewItems: State }) => ({ // tslint:disable-line: no-any
  items: state.viewItems.items,
  sliderInitialized: state.viewItems.sliderInitialized,
  sliderError: state.viewItems.sliderError
});

export default connect(mapStateToProps, { fetchItems })(ViewItems);
