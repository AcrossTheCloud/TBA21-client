import React, { Component } from 'react';
import $ from 'jquery';
import { LoadingOverlayState } from '../reducers/loadingOverlay';
import { toggleOverlay } from '../actions/loadingOverlay';
import { Spinner } from 'reactstrap';
import { connect } from 'react-redux';

interface Props extends LoadingOverlayState {
  Overlay?: Function;
}

class LoadingOverlay extends Component<Props> {
  _isMounted;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;
  }

  componentDidMount(): void {
    this._isMounted = true;
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  render() {
    const dontShowOnload = typeof this.props.on === 'undefined';

    if (!dontShowOnload) {
      const $overlay = $('#loadingOverlay');
      if ($overlay) {
        if (this.props.on) {
          $overlay.fadeIn();
        } else {
          $overlay.fadeOut();
        }
      }
    }
    return (
      <div id="loadingOverlay" className="overlay_fixed_middle" style={dontShowOnload ? {display: 'none'} : {}}>
        <div className="middle">
          <Spinner type="grow"/>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: { loadingOverlay: LoadingOverlayState }) => ({
  on: state.loadingOverlay.on
});

export default connect(mapStateToProps, { toggleOverlay })(LoadingOverlay);
