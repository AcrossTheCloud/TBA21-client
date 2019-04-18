import * as React from 'react';
import { Button, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';

interface Props {
  isAuthenticated: boolean;
  deleteAccountAction: Function;
}

interface State {
  modalOpen: boolean;
}

export default class DeleteAccount extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      modalOpen: false
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.deleteAccount = this.deleteAccount.bind(this);
  }

  /**
   * Reactstrap Modal toggle
   */
  toggleModal(): void {
    this.setState(prevState => ({
      modalOpen: !prevState.modalOpen
    }));
  }

  /**
   * Executes the deleteAccountAction, see actions/user/profile
   */
  deleteAccount(): void {
    this.setState({modalOpen: false});

    // Dispatches the Overlay and Delete API call.
    this.props.deleteAccountAction();
  }

  render() {
    return (
      <div className="deleteAccount">
        <Button color="danger" size="sm" onClick={this.toggleModal}>Delete Account</Button>

        <Modal isOpen={this.state.modalOpen} toggle={this.toggleModal} backdrop={true}>
          <ModalHeader toggle={this.toggleModal}>Modal title</ModalHeader>
          <ModalBody>
            Are you sure you want to delete your account?
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={this.deleteAccount}>Delete Account</Button>{' '}
            <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}
