import * as React from 'react';
import { connect } from 'react-redux';

import { toggle } from 'actions/modals/liveStreamModal';
import { FaTimes } from 'react-icons/fa';
import { Col, Modal, Row } from 'reactstrap';

import 'styles/components/liveStreamModal.scss';

interface Props {
  open: boolean;
  stream: string;
  toggle: Function;
}

interface State {
  open: boolean;
  stream: string;
}

class LiveStreamModal extends React.Component<Props, State> {
  _isMounted;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    this.state = {
      open: false,
      stream: ''
    };

  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  }

  async componentDidUpdate(prevProps: Readonly<Props>): Promise<void> {
    if (this._isMounted) {
      const state = {};

      if (this.props.open !== prevProps.open) {
        Object.assign(state, { open: this.props.open, stream: this.props.stream });
      }

      if (Object.keys(state).length > 0) {
        this.setState(state);
      }
    }
  }

  render() {
    return (
      <Modal id="liveStreamModal" isOpen={this.state.open} backdrop toggle={() => this.props.toggle()} scrollable={false} centered>
        <Row className="header align-content-center" style={{background: 'transparent'}}>
          <Col xs="12" className="pl-0 pr-3">
            <div className="text-right">
              <FaTimes className="closeButton" onClick={() => this.props.toggle(false)}/>
            </div>
          </Col>
        </Row>

        <div className="embed-responsive embed-responsive-16by9">
          <iframe className="embed-responsive-item" title="youtube test" src={'https://www.youtube.com/'+this.state.stream} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"/>
        </div>

      </Modal>
    );
  }
}

const mapStateToProps = (state: { liveStreamModal: { open: boolean, stream: string } }) => ({
  open: state.liveStreamModal.open,
  stream: state.liveStreamModal.stream
});

export default connect(mapStateToProps, { toggle })(LiveStreamModal);
