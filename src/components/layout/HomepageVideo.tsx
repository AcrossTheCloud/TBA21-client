import React, { Component } from 'react';
import $ from 'jquery';

import logo from 'images/logo/oa_web_white.svg';
import 'styles/components/homeVideo.scss';
import { Col, Container, Row } from 'reactstrap';
import { sample } from 'lodash';

interface Props {
  onChange?: Function;
  loaded: boolean;
}

interface State {
  // We keep the final loaded prop in state, this is so we can set the class on the #logo div
  finallyLoaded: boolean;
}

export default class HomepageVideo extends Component<Props, State> {
  _isMounted;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    this.state = {
      finallyLoaded: false
    };
  }

  componentDidMount(): void {
    this._isMounted = true;

    // If the logo hasn't loaded ever add this class to Body
    if (!this.props.loaded) {
      $('#body').addClass('fixed');
    } else {
      $('#body').removeClass('fixed').addClass('logoLoaded');
      $('#body #video').addClass('loaded');
    }
  }

  componentWillUnmount(): void {
    this._isMounted = false;
    $('#body').removeClass('fixed');
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (this.props.loaded !== prevProps.loaded && this.props.loaded) {
      setTimeout(() => {
        $('#body').addClass('logoLoaded');
      }, 2000);

      setTimeout(() => {
        $('#body #video').addClass('loaded');
        $('#body').removeClass('fixed');

        setTimeout( () => {
          if (this._isMounted) {
            this.setState({ finallyLoaded: true });
          }
        }, 2000);

      }, 2800);
    }
  }

  onVideoPlay = () => {
    $('#video .content').fadeIn();
  }

  render() {
    if (this.state.finallyLoaded) { return <></>; } // remove the content so the video isn't in the DOM
    const urls = [
      {
        "video": "https://video-streaming.ocean-archive.org/loading_video2.mp4",
        "thumbnail": "https://video-streaming.ocean-archive.org/loading_video2_first_frame.jpg"
      },
      {
        "video": "https://video-streaming.ocean-archive.org/loading_video3.mp4",
        "thumnail": "https://video-streaming.ocean-archive.org/loading_video3_first_frame.jpg"
      }
    ];
    const elem = sample(urls);
    return (
      <div id="video">
        <Container fluid className="content" style={{ display: 'none' }}>
          <Row>
            <Col xs="12">
              <h1>Get ready for the dive</h1>
              <p><span className="blink_me">Loading...</span></p>
            </Col>
          </Row>
          <Row className="bottom align-items-end">
            <Col xs="12" md="6" className="left">
            </Col>
            <Col xs="12" md="6" className="right pt-3 pt-md-0">
              <div className="logo d-flex align-items-baseline">
                <img src={logo} alt="Ocean Archive" />
              </div>
            </Col>
          </Row>
        </Container>
        <video
          poster={(elem as any).thumbnail}
          onLoadedData={() => this.onVideoPlay()}
          muted
          autoPlay
          controls={false}
          loop
          playsInline
        >
          <source src={(elem as any).video} type="video/mp4"/>
        </video>
      </div>
    );
  }
}
