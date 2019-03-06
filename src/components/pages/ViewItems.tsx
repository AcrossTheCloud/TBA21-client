import * as React from 'react';
import { Container } from 'reactstrap';

import { API } from 'aws-amplify';

import { OceanObject } from './TableRow';
import Slider from 'react-slick';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import 'styles/pages/ViewItems.scss';
import { MultiMedia } from 'src/components/utils/MultiMedia';

interface OceanObjectResults {
    Items: Array<OceanObject>;
}

const Slides = (props) => {
    const settings = {
        centerMode: true,
        centerPadding: '60px',
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

    let results = props.items;

    if (results.length) {
        results.forEach( (item, index) => {

            console.log('item', item); // todo remove

            const multiMedia = <MultiMedia url={item.urls[0]} key={index + '_mm'} />;

            return results[index] = (
                <div className="Item" key={index}>
                    <div className="image">{multiMedia}</div>
                    <div className="description">{item.description}</div>
                </div>
            );
        });

        return (
            <Slider {...settings}>
                {results}
            </Slider>
        );
    } else {
        return <React.Fragment/>;
    }
};

export default class ViewItems extends React.Component<{}, OceanObjectResults> {

  state: OceanObjectResults = {
      Items: [{
          ocean: '',
          timestamp: 1,
          itemId: '',
          position: [0, 0],
          description: '',
          urls: [''],
          people: [{personId: '', personName: '', roles: ['']}],
          tags: []
      }],
  };

  componentDidMount() {
      API.get('tba21', 'items', {})
          .then((data: any) => { // tslint:disable-line: no-any
              this.setState(data);
              console.log(data);
          }).catch((e: any) => { // tslint:disable-line: no-any
      });
  }

  render() {
      return (
          <Container>
              <Slides items={this.state.Items}/>
          </Container>
      );
  }
}
