import * as React from 'react';
import { connect } from 'react-redux';
import { PrivacyPolicyState } from 'reducers/pages/privacyPolicy';
import { modalToggle } from 'actions/pages/privacyPolicy';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

import 'styles/components/admin/tables/modal.scss';

interface Props extends PrivacyPolicyState {
  modalToggle: Function;
}

class FreqWave extends React.Component<Props, {}> {
  render() {
    return (
      <Modal isOpen={this.props.fw_open} toggle={() => this.props.modalToggle('FW_MODAL')} className="fullwidth blue">
          <ModalHeader toggle={() => this.props.modalToggle('FW_MODAL')}>freq_wave</ModalHeader>
          <ModalBody>
            <iframe title="freq_wave" src="http://bilting.se/freq_wave/" className="freq_wave-iframe"></iframe>
          </ModalBody>
      </Modal>
    );
  }
}

const mapStateToProps = (state: { privacyPolicy: PrivacyPolicyState }) => ({
  fw_open: state.privacyPolicy.fw_open,
});

export default connect(mapStateToProps, { modalToggle })(FreqWave);
