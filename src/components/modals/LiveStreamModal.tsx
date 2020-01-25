import * as React from 'react';
import { connect } from 'react-redux';

import { fetchItem } from 'actions/items/viewItem';
import { toggle } from 'actions/modals/itemModal';
import { HomepageData } from 'reducers/home';
import { FaTimes } from 'react-icons/fa';
import { Col, Modal, ModalBody, Row } from 'reactstrap';
import { Item } from '../../types/Item';

interface Props {
  open: boolean;
  toggle: Function;
}

interface State {
  open: boolean;
}

class ItemModal extends React.Component<Props, State> {
  _isMounted;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    this.state = {
      open: false
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
        Object.assign(state, { open: this.props.open });
      }

      if (Object.keys(state).length > 0) {
        this.setState(state);
      }
    }
  }

  render() {
    return (
      <Modal id="liveStreamModal" className="fullwidth" isOpen={this.state.open} backdrop toggle={() => this.props.toggle()}>
        <Row className="header align-content-center">
          <div className="col-11 title-wrapper d-flex align-content-center">
            <div className="title">
              <span className="ellipsis">
                Test livestream
              </span>
            </div>
          </div>
          <Col xs="1" className="pl-0 pr-3">
            <div className="text-right">
              <FaTimes className="closeButton" onClick={() => this.props.toggle(false)}/>
            </div>
          </Col>
        </Row>

        <ModalBody>
          <iframe width="560" height="315" src="https://www.youtube.com/embed/a9rpv9WnEQs" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"></iframe>
        </ModalBody>

      </Modal>
    );
  }
}

const mapStateToProps = (state: { itemModal: { open: boolean, data?: HomepageData | Item } }) => ({
  data: state.itemModal.data,
  open: state.itemModal.open
});

export default connect(mapStateToProps, { toggle, fetchItem })(ItemModal);
