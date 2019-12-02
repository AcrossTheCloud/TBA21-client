import React, { Component } from 'react';
import $ from 'jquery';

import logo from 'images/logo/oa_web_white.svg';
import 'styles/components/homeVideo.scss';
import { Col, Container, Row } from 'reactstrap';

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
    console.log('Yo')
    $('#video .content').fadeIn();
  }

  render() {
    if (this.state.finallyLoaded) { return <></>; } // remove the content so the video isn't in the DOM

    return (
      <div id="video">
        <Container fluid className="content" style={{ display: 'none' }}>
          <Row>
            <Col xs="12">
              <h1>Take a swim in the digital ocean.</h1>
              <p>
                This is a test dive<br />
                into a new online platform in the making,<br />
                created to support a thriving sea.
              </p>
            </Col>
          </Row>
          <Row className="bottom align-items-end">
            <Col xs="12" md="6" className="left">
              <p>
                Create,<br />
                contribute,<br />
                share,<br />
                participate.
              </p>
            </Col>
            <Col xs="12" md="6" className="right pt-3 pt-md-0">
              <div className="logo d-flex align-items-baseline">
                <img src={logo} alt="Ocean Archive" />
              </div>
            </Col>
          </Row>
        </Container>
        <video onPlay={() => this.onVideoPlay()} src="https://video-streaming.ocean-archive.org/loading_video.mp4" muted={true} autoPlay={true} controls={false} loop={true}/>
      </div>
    );
  }
}
