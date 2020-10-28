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

const urls = [
  {
    "video": "https://video-streaming.ocean-archive.org/LandingPage_OU.mp4",
    "thumbnail": "https://video-streaming.ocean-archive.org/LandingPage_OU_thumb.jpg",
    "nologo": true
  },
  {
    "video": "https://video-streaming.ocean-archive.org/NEW_LandingPage_HR.mp4",
    "thumbnail": "https://video-streaming.ocean-archive.org/NEW_LandingPage_HR_thumb.jpg",
    "nologo": true
  }
];

interface State {
  // We keep the final loaded prop in state, this is so we can set the class on the #logo div
  finallyLoaded: boolean;
  elem: any;
}

export default class HomepageVideo extends Component<Props, State> {
  _isMounted;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    this.state = {
      finallyLoaded: false,
      elem: sample(urls)
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
        }, this.state.elem.time ? this.state.elem.time : 2000);

      }, 2800);
    }
  }

  onVideoPlay = () => {
    $('#video .content').fadeIn();
  }

  isPortrait = () => (window.innerHeight > window.innerWidth);

  render() {

    if (this.state.finallyLoaded) { return <></>; } // remove the content so the video isn't in the DOM
    return (
      <div id="video">
        <Container fluid className="content" style={{ display: 'none' }}>
          <Row>
            <Col xs="12">
              <h4>Get ready for the dive <span className="blink_me">...</span></h4>
            </Col>
          </Row>
          <Row className="bottom align-items-end">
            <Col xs="12" md="6" className="left">
            </Col>
            <Col xs="12" md="6" className="right pt-3 pt-md-0">
              <div className="logo d-flex align-items-baseline">
                { (this.state.elem as any).nologo ? <></> :
                  (<img src={logo} alt="Ocean Archive" />)
                }
              </div>
            </Col>
          </Row>
        </Container>
        {!this.isPortrait() && (this.state.elem as any).video? 
          (<video
            poster={(this.state.elem as any).thumbnail}
            onLoadedData={() => this.onVideoPlay()}
            muted
            autoPlay
            controls={false}
            loop={(this.state.elem as any).loop && (this.state.elem as any).loop === 'false' ? false : true}
            playsInline
          >
            <source src={(this.state.elem as any).video} type="video/mp4"/>
          </video>) : 
          (<img 
            className="img-only"
            src={this.isPortrait() && (this.state.elem as any).portrait ? (this.state.elem as any).portrait : (this.state.elem as any).thumbnail} 
            alt="page loading placeholder" 
            onLoad={() => this.onVideoPlay()}
          />)
        }
      </div>
    );
  }
}
