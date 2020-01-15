import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { ErrorMessage } from '../../utils/alerts';
import { API } from 'aws-amplify';
import { adminDel } from '../../../REST/collections';

interface Props {
    index?: number;
    path: string | undefined;
    isContributorPath: boolean;
    identifier: string;
    callback: Function;
}
interface State {
    deleteErrorMessage: string | JSX.Element | undefined;
    deleteModalOpen: boolean;
}

export default class Delete extends React.Component<Props, State> {
    _isMounted;

    constructor (props: Props) {
        super(props);
        this._isMounted = false;

        this.state = {
            deleteErrorMessage: undefined,
            deleteModalOpen: false
        };
    }
    async componentDidMount() {
        this._isMounted = true;
    }

    onDeleteButtonClick = () => {
        if (!this._isMounted) { return; }
        this.setState(
            {
                deleteModalOpen: true
            }
        );
    }

    deleteModalToggle = () => {
        if (!this._isMounted) { return; }
        this.setState( prevState => ({
                           ...prevState,
                           deleteModalOpen: !prevState.deleteModalOpen,
                           deleteErrorMessage: undefined
                       })
        );
    }

    deleteItem = async () => {
        const state = {
            deleteErrorMessage: undefined
        };
        try {
            const itemIndex: number | undefined = this.props.index;
            if (typeof itemIndex !== 'undefined' && itemIndex > -1) {
                if (this.props.path === 'items') {
                    await API.del('tba21', (this.props.isContributorPath ? 'contributor/items' :  'admin/items'), {
                        queryStringParameters: {
                            s3Key: this.props.identifier
                        }
                    });
                    await this.props.callback();
                    Object.assign(state, {
                        deleteModalOpen: false,
                    });
                }
                if (this.props.path === 'collections') {
                    await adminDel(this.props.identifier);
                    await this.props.callback()
                }
                if (this.props.path === 'announcements') {
                    await API.del('tba21', `${this.props.isContributorPath ? 'contributor' : 'admin'}/announcements`, {
                        queryStringParameters: {
                            id: this.props.identifier
                        }
                    });
                    await this.props.callback();
                    Object.assign(state, {
                        deleteModalOpen: false,
                    });
                }

                Object.assign(state, {
                    deleteModalOpen: false
                });
            } else {
                Object.assign(state, {
                    deleteErrorMessage: 'This item may have already been deleted.'
                });
            }
        } catch (e) {
            Object.assign(state, {
                deleteErrorMessage: 'We had some trouble deleting this item. Please try again later.'
            });
        } finally {
            this.setState(state);
        }
    }

    render() {
        return (
            <>
                <Button color="danger" size="sm" onClick={() => this.onDeleteButtonClick()}>Delete</Button>

                <Modal isOpen={this.state.deleteModalOpen} className="tableModal">
                    <ErrorMessage message={this.state.deleteErrorMessage}/>
                    <ModalHeader>Delete Item?</ModalHeader>
                    <ModalBody>Are you 100% sure you want to delete this item?</ModalBody>
                    <ModalFooter>
                        <Button color="danger" className="mr-auto" onClick={() => this.deleteItem()}>I'm Sure</Button>{' '}
                        <Button color="secondary" onClick={() => this.deleteModalToggle()}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </>
        );
    }
}
