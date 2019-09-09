import * as React from 'react';
import { Col, Progress, Row } from 'reactstrap';
import $ from 'jquery';
import { Auth, Storage } from 'aws-amplify';
import Dropzone from 'react-dropzone';
import { v1 as uuid } from 'uuid';

import { AuthContext } from 'providers/AuthProvider';

import 'styles/components/_dropzone.scss';
import 'styles/components/_reactTags.scss';

interface State {
  files: Files;
  rejectedFiles: Files;
}
interface Props {
  callback: Function;
}
interface Files {
  [id: string]: File;
}
interface File {
  uuid: string;
  name: string;
  preview: string;
  size: number;
  type: string;
  uploaded: boolean;
  s3key: string;
  original: any; // tslint:disable-line:no-any
}

// const humanFileSize = (bytes: number, si: boolean) => {
//   var thresh = si ? 1000 : 1024;
//   if (Math.abs(bytes) < thresh) {
//     return bytes + ' B';
//   }
//   var units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
//   var u = -1;
//   do {
//     bytes /= thresh;
//     ++u;
//   } while (Math.abs(bytes) >= thresh && u < units.length - 1);
//   return bytes.toFixed(1) + ' ' + units[u];
// };

export class FileUpload extends React.Component<Props, State> {
  static contextType = AuthContext;

  constructor(props: Props) {
    super(props);

    this.state = {
      files: {},
      rejectedFiles: {}
    };
  }

  onDrop = async (acceptedFiles: Array<any>, rejectedFiles: any) => {  // tslint:disable-line:no-any
    const files: Files = {};

    acceptedFiles.forEach( file => {
      if (file && !this.state.files.hasOwnProperty(file.name)) {
        const
          fileUUID = uuid(),
          fileProps = {
            uuid: fileUUID,
            name: file.name,
            size: file.size,
            type: file.type,
            uploaded: false,
            original: file,
          };

        // Create the thumb/preview if it's an image.
        if (file.type.includes('image')) {
          Object.assign(fileProps, { preview: URL.createObjectURL(file) });
        }

        Object.assign(files, { [file.name]: fileProps });
      }
    });

    if (Object.keys(files).length) {
      const state = {
        files: {...this.state.files, ...files},
        rejectedFiles: rejectedFiles
      };

      this.setState(state, async () => {
        await this.uploadToS3(files);
      });
    }
  }

  uploadToS3 = async (files: Files): Promise<void> => {
    Object.values(files).forEach( async (file: File) => {
      const
        context: React.ContextType<typeof AuthContext> = this.context,
        filename = `${context.uuid}/${file.uuid}-${file.name}`,
        userCredentials = await Auth.currentCredentials();

      try {
        const result: any = await Storage.put(filename, file.original, {// tslint:disable-line: no-any
          level: 'private',
          contentType: file.type,
          progressCallback(progress: { loaded: number, total: number}) {
            $(`#${file.uuid} .progress-bar`).width(`${progress.loaded / progress.total * 100}%`);
          }
        });
        file.uploaded = true;
        // Add private/UUID to the s3key as we only get the files key back
        // We store the s3key as private/uuid in the database.
        file.s3key = `private/${userCredentials.identityId}/${result.key}`;

        $(`#${file.uuid}`).fadeOut(async () => {
          this.setState({ files: {...this.state.files, ...files}});

          // Callback a single key
          this.props.callback( file.s3key );
        });
      } catch (e) {
        console.log(e);
      }
    });
  }

  renderRejectedFiles() {
    return Object.values(this.state.rejectedFiles).map(file => {
      return <li key={file.name}> {file.type} file: {file.name} - {file.size} bytes </li>;
    });
  }

  render(): React.ReactNode {
    const thumbs = Object.values(this.state.files).map(file => {
      const uploaded = file.uploaded ? 'uploaded' : 'pending';
      return (
        <Col xs="12" md="6" lg="2" key={file.name}>
          <div className={uploaded}>
            {file.preview ? <img alt={file.name} className="img-fluid" src={file.preview} /> : <>{file.name}</>}
            <Progress id={file.uuid} value={0} max={file.size} />
          </div>
        </Col>
      );
    });

    return (
      <div className="dropzone_wrapper container-fluid">

        <Dropzone
          onDrop={this.onDrop}
          accept="image/jpeg, image/png, image/svg+xml, application/pdf, audio/*, text/*, video/*"
        >
          {({getRootProps, getInputProps, isDragActive, isDragReject, isDragAccept}) => (
            <div {...getRootProps()} className="dropzone">
              <input {...getInputProps()} />
              {!isDragActive && 'Click here or drop a file to upload!'}
              {isDragReject && 'File type not accepted, sorry!'}
              {isDragAccept && 'Drop!'}

              <Row className="preview">
                {thumbs}
              </Row>
            </div>
          )}
        </Dropzone>
      </div>
    );
  }
}
