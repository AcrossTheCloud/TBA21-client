import * as React from 'react';
import { connect } from 'react-redux';
import { PrivacyPolicyState } from 'reducers/pages/privacyPolicy';
import { modalToggle } from 'actions/pages/privacyPolicy';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

import 'styles/components/admin/tables/modal.scss';

interface Props extends PrivacyPolicyState {
  modalToggle: Function;
}

class RestrictiveLicence extends React.Component<Props, {}> {
  render() {
    return (
      <Modal isOpen={this.props.rl_open} toggle={() => this.props.modalToggle('RL_MODAL')} className="fullwidth blue">
          <ModalHeader toggle={() => this.props.modalToggle('RL_MODAL')}>Ocean Archive Restrictive Licence</ModalHeader>
          <ModalBody>
              <p>
                Ocean Archive Restrictive License: This license is the most restrictive license option the Ocean Archive offers. It only allows users to view the respective works on the Ocean Archive. Any other use is not permitted.
              </p>
          </ModalBody>
      </Modal>
    );
  }
}

const mapStateToProps = (state: { privacyPolicy: PrivacyPolicyState }) => ({
  rl_open: state.privacyPolicy.rl_open,
});

export default connect(mapStateToProps, { modalToggle })(RestrictiveLicence);
