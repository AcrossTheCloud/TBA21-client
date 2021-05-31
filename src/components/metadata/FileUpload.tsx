import * as React from 'react';
import { Col, Progress, Row, Input, Form, FormFeedback, Button } from 'reactstrap';
import $ from 'jquery';
import { Auth, Storage, API } from 'aws-amplify';
import Dropzone from 'react-dropzone';
import { v1 as uuid } from 'uuid';

import { getEmbedVideoThumbnailUrl} from '../utils/FilePreview';
import { last } from 'lodash-es';
import { AuthContext } from 'providers/AuthProvider';

import 'styles/components/_dropzone.scss';
import 'styles/components/_reactTags.scss';
import { Alerts, ErrorMessage } from '../utils/alerts';

interface State extends Alerts {
  files: Files;
  rejectedFiles: Rejections;
  videoUrls: string[] | null;
  videoUrlError: boolean;
}
interface Props {
  callback: Function;
}
interface Files {
  [id: string]: File;
}
interface Rejections {
  [id: string]: Rejection;
}
interface Rejection {
  errors: any;
  file: File;
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
  _isMounted;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    this.state = {
      files: {},
      rejectedFiles: {},
      videoUrls: null,
      videoUrlError: false
    };
  }

  componentDidMount(): void {
    this._isMounted = true;
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  onDrop = async (acceptedFiles: Array<any>, fileRejections: any) => {  // tslint:disable-line:no-any
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

        if (file.type.includes('quicktime')) {
          Object.assign(fileRejections, file);
          if (!this._isMounted) { return; }
          this.setState({ errorMessage: <>
              We currently do not accept .MOV or QuickTime files, we're working to support this.<br/>
              For now we suggest converting your file to .MP4 using <a href="https://handbrake.fr/" rel="noreferrer noopener" target="_blank">HandBrake</a>
          </>});
          return;
        }

        if (file.name.toLowerCase().includes('ad-banner')) {
          Object.assign(fileRejections, file);
          if (!this._isMounted) { return; }
          this.setState({ errorMessage: <>
              We currently do not accept files with filenames that include 'ad-banner' (regardless of case) due to this being blocked by ad blocker software.
          </>});
          return;
        }

        Object.assign(files, { [file.name]: fileProps });
      }
    });

    if (Object.keys(files).length) {
      const state = {
        files: {...this.state.files, ...files},
        rejectedFiles: fileRejections
      };

      if (!this._isMounted) { return; }
      this.setState(state, async () => {
        await this.uploadToS3(files);
      });
    }
  }



  addVideoEmbed = async (): Promise<void> => {
    const newUrl = last(this.state.videoUrls);
    const response = await API.put('tba21','contributor/items/create', {body: {url: newUrl}});
    console.log(response);
    const file = {
      uuid: uuid(),
      name: last(this.state.videoUrls),
      preview: await getEmbedVideoThumbnailUrl(newUrl),
      size: 0,
      type: 'VideoEmbed',
      uploaded: true,
      s3key: response.s3_key,
      original: true
    }
    const myid = file.uuid;

    if (!this._isMounted) { return; }
    this.setState({ files: {...this.state.files, ...{[myid]: file}}});

    // Callback a single key
    this.props.callback( file.s3key );
    
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
          if (!this._isMounted) { return; }
          this.setState({ files: {...this.state.files, ...files}});

          console.log(this.state.files);

          // Callback a single key
          this.props.callback( file.s3key );
        });
      } catch (e) {
        console.log('error',e);
      }
    });
  }

  renderRejectedFiles() {
    return Object.values(this.state.rejectedFiles).map(rejection => {
      return <li key={rejection.file.name}> {rejection.file.type} file: {rejection.file.name} - {rejection.file.size} bytes </li>;
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
      <>
        <ErrorMessage message={this.state.errorMessage} />

        <div className="dropzone_wrapper container-fluid">
          <Dropzone
            onDrop={this.onDrop}
            accept="image/jpeg, image/gif, image/png, image/svg+xml, application/pdf, audio/*, text/*, video/*, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          >
            {({getRootProps, getInputProps, isDragActive, isDragReject, isDragAccept}) => (
              <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                {!isDragActive && 'Click here or drop a file to upload! Video thumbnail can be manually specified by editing the item >1hr after uploading.'}
                {isDragReject && 'File type not accepted, sorry!'}
                {isDragAccept && 'Drop!'}

                <Row className="preview">
                  {thumbs}
                </Row>
              </div>
            )}
          </Dropzone>
        </div>
        <div>
          <Form
            onSubmit={(e)=>{e.preventDefault(); this.addVideoEmbed();}}>
            <FormFeedback valid>You need to enter a valid YouTube or </FormFeedback>
            <Input
              type="url"
              className="url"
              placeholder="Or add a YouTube or Vimeo video by entering a url starting with https://"
              valid={this.state.videoUrlError}
              autoComplete="false"
              onChange={(e) => { 
                if (e.target.value.startsWith('https://youtu.be/') || e.target.value.startsWith('https://youtube.com') || e.target.value.startsWith('https://www.youtube.com/' || e.target.value.startsWith('https://vimeo.com') || e.target.value.startsWith('https://www.vimeo.com')) ) {                
                  this.setState({errorMessage: undefined})
                  this.state.videoUrls ? this.setState({videoUrls: this.state.videoUrls!.concat([e.target.value])}) : this.setState({videoUrls: [e.target.value]});
                } else {
                  this.setState({ errorMessage: <>
                    Please enter a valid a YouTube or Vimeo video by entering a url starting with https://
                </>});
                }
              }}
            />
          <Button>
              Submit
          </Button>
          </Form>

        </div>
      </>
    );
  }
}
