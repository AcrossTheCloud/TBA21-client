import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { AuthContext } from '../../../providers/AuthProvider';

interface Props {
  deleteAccountAction: Function;
}

interface State {
  modalOpen: boolean;
}

export default class DeleteAccount extends React.Component<Props, State> {
  static contextType = AuthContext;

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
  deleteAccount = async (): Promise<void> => {
    this.setState({modalOpen: false});

    // Dispatches the Overlay and Delete API call.
    await this.props.deleteAccountAction();
  }

  render() {
    const context: React.ContextType<typeof AuthContext> = this.context;

    return (
      <div className="deleteAccount">
        <Button color="danger" size="sm" onClick={this.toggleModal}>Delete Account</Button>

        <Modal isOpen={this.state.modalOpen} toggle={this.toggleModal} backdrop={true}>
          <ModalBody>
            <div><b>Are you sure you want to delete your account?</b></div>
            {
              context.authorisation.hasOwnProperty('contributor') || context.authorisation.hasOwnProperty('admin') ?
              <div>
                <br/>
                Please note deleting your account will also delete any items contributed by you, or any collections for which you are the sole contributor.
              </div>
                :
              <></>
            }
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
