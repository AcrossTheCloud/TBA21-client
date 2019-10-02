import * as React from 'react';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';

import { fetchCollection } from 'actions/collections/viewCollection';
import { toggle } from 'actions/modals/collectionModal';
import { HomepageData } from 'reducers/home';
import { FaTimes } from 'react-icons/fa';
import { Col, Modal, ModalBody, Row } from 'reactstrap';
import ViewCollection from '../collection/ViewCollection';
import { Collection } from '../../types/Collection';

interface Props {
  data?: HomepageData | Collection;
  open: boolean;
  toggle: Function;
  fetchCollection: Function;
}

interface State {
  open: boolean;
}

class CollectionModal extends React.Component<Props, State> {
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

      if (this.props.data && !isEqual(this.props.data, prevProps.data)) {
        await this.props.fetchCollection(this.props.data.id);
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
      const {
        title
      } = this.props.data;

      return (
        <Modal id="homePageModal" scrollable className="fullwidth" isOpen={this.state.open} backdrop toggle={() => this.props.toggle()}>
          <Row className="header align-content-center">
            <div className="col-11 title-wrapper d-flex align-content-center">
              <div className="title">
                <span className="ellipsis">
                  {title}
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
            <ViewCollection />
          </ModalBody>

        </Modal>
      );
    } else {
      return <></>;
    }
  }
}

const mapStateToProps = (state: { collectionModal: { open: boolean, data?: HomepageData | Collection } }) => ({
  data: state.collectionModal.data,
  open: state.collectionModal.open
});

export default connect(mapStateToProps, { toggle, fetchCollection })(CollectionModal);
