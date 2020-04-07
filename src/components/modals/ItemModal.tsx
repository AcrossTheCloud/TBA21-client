import * as React from 'react';
import { connect } from 'react-redux';

import { isEqual } from 'lodash';
import { fetchItem } from 'actions/items/viewItem';
import { toggle } from 'actions/modals/itemModal';
import { HomepageData } from 'reducers/home';
import { FaCircle, FaTimes } from 'react-icons/fa';
import { Col, Modal, ModalBody, Row } from 'reactstrap';
import { Item } from '../../types/Item';
import ViewItem from '../item/ViewItem';
import UserHistoryComponent from '../user-history/UserHistoryComponent';
import { popEntity as popUserHistoryEntity } from '../../actions/user-history';

interface Props {
  data?: HomepageData | Item;
  open: boolean;
  toggle: Function;
  fetchItem: Function;
  popUserHistoryEntity: Function;
}

interface State {
  data: HomepageData | Item | undefined;
  open: boolean;
}

class ItemModal extends React.Component<Props, State> {
  _isMounted;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    this.state = {
      data: undefined,
      open: false
    };
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;

    document.addEventListener('keydown', this.onKeyPressed.bind(this));
  }

  componentWillUnmount = () => {
    this._isMounted = false;

    document.removeEventListener('keydown', this.onKeyPressed.bind(this));
  }

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

  onKeyPressed(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.props.popUserHistoryEntity(this.props.data);
    }
  }

  render() {
    if (this.props.data) {
      const {
        title,
        creators,
      } = this.props.data;

      return (
        <Modal id="homePageModal" className="fullwidth" isOpen={this.state.open} backdrop toggle={() => this.props.toggle()}>
          <Row className="header align-content-center">
            <div className="col-11 title-wrapper d-flex align-content-center">
              {creators && creators.length ?
                  (
                      <>
                        <div className="creators d-none d-md-block">
                          <span className="ellipsis">{creators.join(', ')}</span>
                        </div>
                        <div className="d-none d-md-block flex-grow-0 flex-shrink-0">
                          <FaCircle className="dot"/>
                        </div>
                      </>
                )
                : <></>
              }
              <div className="title">
                <span className="ellipsis">
                  {title}
                </span>
              </div>
            </div>
            <Col xs="1" className="pl-0 pr-3">
              <div className="text-right">
                <FaTimes
                    className="closeButton"
                    onClick={() => {
                      this.props.popUserHistoryEntity(this.props.data);
                      this.props.toggle(false);
                    }}
                />
              </div>
            </Col>
          </Row>

          <ModalBody>
            <Row>
              <Col>
                <UserHistoryComponent />
              </Col>
            </Row>
            <ViewItem />
          </ModalBody>

        </Modal>
      );
    } else {
      return <></>;
    }
  }
}

const mapStateToProps = (state: { itemModal: { open: boolean, data?: HomepageData | Item } }) => ({
  data: state.itemModal.data,
  open: state.itemModal.open
});

export default connect(mapStateToProps, { toggle, fetchItem, popUserHistoryEntity })(ItemModal);
