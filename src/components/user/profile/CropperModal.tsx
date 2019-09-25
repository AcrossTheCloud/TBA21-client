import * as React from 'react';
import Cropper from 'cropperjs';
import { Button, Input, Modal, ModalBody, ModalFooter, Spinner } from 'reactstrap';

import { API, Storage } from 'aws-amplify';
import config from '../../../config';
import { Alerts, ErrorMessage } from '../../utils/alerts';
import { AuthContext } from '../../../providers/AuthProvider';
import { v1 as uuid } from 'uuid';

import 'cropperjs/dist/cropper.css';
import 'styles/components/cropperModal.scss';

interface Props {
  imageURL?: string;
  open: boolean;
  callback?: Function;
}

interface State extends Alerts {
  imageBlob: string;
  modal: boolean;
  loading: boolean;
}

export class CropperModal extends React.Component<Props, State> {
  static contextType = AuthContext;
  _isMounted;
  cropper;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    this.state = {
      imageBlob: '',
      modal: this.props.open,
      loading: false
    };
  }

  componentWillUnmount(): void {
    this._isMounted = true;
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (this.props.open !== prevProps.open) {
      this.setState({ modal: this.props.open });
    }
  }

  initialiseCropperJS = () => {
    const image: HTMLCanvasElement = document.getElementById('cropperCanvas') as HTMLCanvasElement;
    if (image) {
      this.cropper = new Cropper(image, {
        rotatable: false,
        dragMode: 'move',
        aspectRatio: 200 / 200,
        cropBoxResizable: false
      });

      if (this.props.imageURL) {
        fetch(this.props.imageURL, {
          mode: 'cors',
          method: 'GET'
        }).then( async res => {
          const blobURL = URL.createObjectURL(await res.blob());
          this.cropper.reset().replace(blobURL);
        });
      }
    }
  }

  fileUploadHandler = (event) => {
    const { files } = event.target;
    if (files && files[0]) {
      if (/^image\/\w+$/.test(files[0].type)) {
        const blobURL = URL.createObjectURL(files[0]);
        this.cropper.reset().replace(blobURL);
      }
    }
  }

  toggle = () => {
    this.setState(prevState => ({
      modal: !prevState.modal
    }), () => {
      if (this.props.callback) {
        this.props.callback(this.state.modal, false);
      }
    });
  }

  save = async () => {
    const context: React.ContextType<typeof AuthContext> = this.context;

    this.setState({ loading: true } );

    const state = {
      loading: false
    };

    try {
      const blob = (): Promise<Blob> => new Promise( (resolve, reject) => {
        this.cropper.getCroppedCanvas(
          {
            width: 200,
            height: 200,
          }
        ).toBlob(theBlob => {
          if (!theBlob) {
            reject(`We've had some trouble converting the image you uploaded, try another.`);
          } else {
            resolve(theBlob);
          }
        });
      });

      const
        blobResult: Blob = await blob(),
        fileLocation = `${context.uuid}/${uuid()}.${blobResult.type.split('/')[1]}`;

      await Storage.put(fileLocation, blobResult, {
        contentType: blobResult.type,
        level: 'public-read',
        bucket: config.s3.PROFILE_PIC_BUCKET
      });

      await API.patch('tba21', 'profiles', { body: {profile_image: `${config.other.PROFILE_URL}public/${fileLocation}`} });

      if (this.props.callback) {
        this.props.callback(false, true);
      }

    } catch (e) {
      Object.assign(state, { errorMessage: 'Looks like we had trouble with your image.'});
    } finally {
      this.setState(state);
    }
  }

  render() {
    return (
      <Modal isOpen={this.state.modal} size="lg" className="blue" toggle={this.toggle} backdrop onOpened={() => this.initialiseCropperJS()}>

        <div className="overlay_fixed_middle" style={this.state.loading ? {} : {display: 'none'}}>
          <div className="middle">
            <Spinner type="grow"/>
          </div>
        </div>

        <ModalBody>
          <ErrorMessage message={this.state.errorMessage}/>

          <div className="dropzone_wrapper">
            <Input type="file" onChange={this.fileUploadHandler}/>
          </div>

          <canvas id="cropperCanvas" title="Your profile image.`" width="100%"/>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.save}>Save</Button>
          <Button color="secondary" onClick={this.toggle}>Cancel</Button>
        </ModalFooter>
      </Modal>
    );
  }
}
