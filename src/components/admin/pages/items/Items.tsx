import * as React from 'react';
import ItemsTable from '../../tables/ItemsTable';
import { Button, Container, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { FaPlus } from 'react-icons/fa';
import { FileUpload } from '../../tables/FileUpload';

interface State {
  fileUploadModal: boolean;
}

export default class Items extends React.Component<{}, State> {

  constructor(props: {}) {
    super(props);

    this.state = {
      fileUploadModal: false
    };
  }

  toggleFileUploadModal = () => {
    this.setState(prevState => ({
      fileUploadModal: !prevState.fileUploadModal
    }));
  }

  render() {
    return (
      <Container id="itemsTable">
        <Button  color="primary" size="lg" block onClick={() => this.setState({ fileUploadModal: true })}>
          Add Items &nbsp; <FaPlus />
        </Button>
        <ItemsTable />

        <Modal isOpen={this.state.fileUploadModal} toggle={this.toggleFileUploadModal} className="fileUploadModal">
          <ModalHeader toggle={this.toggleFileUploadModal}>Upload Items</ModalHeader>
          <ModalBody>
            <FileUpload />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.toggleFileUploadModal}>Close</Button>{' '}
          </ModalFooter>
        </Modal>
      </Container>
    );
  }
}
