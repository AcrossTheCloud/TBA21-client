import * as React from 'react';
import { connect } from 'react-redux';

import { isEqual } from 'lodash';
import { fetchItem } from 'actions/items/viewItem';
import { toggle } from 'actions/modals/itemModal';
import { FaCircle, FaTimes } from 'react-icons/fa';
import { Col, Modal, ModalBody, Row } from 'reactstrap';
import { HomepageData } from '../../types/Home';
import { Item } from '../../types/Item';
import ViewItem from '../item/ViewItem';

interface Props {
  data?: HomepageData | Item;
  open: boolean;
  toggle: Function;
  fetchItem: Function;
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
  };

  async componentDidUpdate(prevProps: Readonly<Props>): Promise<void> {
    if (this._isMounted) {
      const state = {};

      if (this.props.data && !isEqual(this.props.data, prevProps.data)) {
        await this.props.fetchItem(this.props.data.id);
      }

      if (this.props.open !== prevProps.open) {
        Object.assign(state, { open: this.props.open });
      }

      if (Object.keys(state).length > 0) {
        this.setState(state);
      }
    }
  }

  render() {
    if (this.props.data) {
      const { title, creators } = this.props.data;

      return (
        <Modal
          id="homePageModal"
          className="fullwidth"
          isOpen={this.state.open}
          backdrop
          toggle={() => this.props.toggle()}
        >
          <Row className="header align-content-center">
            <div className="col-11 title-wrapper d-flex align-content-center">
              {creators && creators.length ? (
                <>
                  <div className="creators d-none d-md-block">
                    <span className="ellipsis">{creators.join(', ')}</span>
                  </div>
                  <div className="d-none d-md-block flex-grow-0 flex-shrink-0">
                    <FaCircle className="dot" />
                  </div>
                </>
              ) : (
                <></>
              )}
              <div className="title">
                <span className="ellipsis">{title}</span>
              </div>
            </div>
            <Col xs="1" className="pl-0 pr-3">
              <div className="text-right">
                <FaTimes
                  className="closeButton"
                  onClick={() => this.props.toggle(false)}
                />
              </div>
            </Col>
          </Row>

          <ModalBody>
            <ViewItem />
          </ModalBody>
        </Modal>
      );
    } else {
      return <></>;
    }
  }
}

const mapStateToProps = (state: {
  itemModal: { open: boolean; data?: HomepageData | Item };
}) => ({
  data: state.itemModal.data,
  open: state.itemModal.open
});

export default connect(
  mapStateToProps,
  { toggle, fetchItem }
)(ItemModal);
