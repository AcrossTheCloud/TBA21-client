import * as React from 'react';
import { FormGroup, Container } from 'reactstrap';

import { API, Storage } from 'aws-amplify';
import Dropzone from 'react-dropzone';
import { v1 as uuid } from 'uuid';

import Tags, { Tag } from './Tags';
import config from 'config.js';

import 'styles/components/_dropzone.scss';
import 'styles/components/_reactTags.scss';

interface State {
  tags: Tag[];
  files: NewFile[];
  rejectedFiles: NewFile[];
  urls: string[];
}
interface NewFile {
  name: string;
  preview: string;
  size: number;
  type: string;
}

const humanFileSize = (bytes: number, si: boolean) => {
  var thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
  var units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  var u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + ' ' + units[u];
};

export class FileUpload extends React.Component<{}, State> {
  constructor(props: any) { // tslint:disable-line: no-any
    super(props);

    this.state = {
      tags: [],
      urls: [],
      files: Array<NewFile>(),
      rejectedFiles: Array<NewFile>()
    };

    this.onDrop = this.onDrop.bind(this);
  }

  whatType(item: string) {
    return item.indexOf('image') > -1 ? 'image' : item;
  }

  onDrop = async (acceptedFiles: Array<any>, rejectedFiles: any) => {  // tslint:disable-line:no-any
    console.log('on dropped --- ', acceptedFiles, );  // tslint:disable-line:no-console
    let newUrls: string[] = this.state.urls;
    for (const file of acceptedFiles) {  // tslint:disable-line:no-any
      console.log('acceptedFiles.forEach --- ', file);  // tslint:disable-line:no-console
      const newUrl = await this.handleFileUpload(file);
      console.log(newUrl); // tslint:disable-line:no-console
      newUrls.push(newUrl);

      const reader = new FileReader();
      reader.onload = () => {
        const fileAsBinaryString = reader.result;
        console.log(' reader loaded ', fileAsBinaryString); // tslint:disable-line:no-console
        // show preview or something
      };
      reader.onabort = () => console.log('file reading was aborted'); // tslint:disable-line:no-console
      reader.onerror = () => console.log('file reading has failed'); // tslint:disable-line:no-console
      // reader.readAsBinaryString(file); /// uncomment to read file
    }
    console.log(newUrls); // tslint:disable-line:no-console

    this.setState({
      urls: newUrls,
      files: acceptedFiles,
      rejectedFiles: rejectedFiles
    });
  }

  getImageTags = (key: string) => () => {
    API.get('tba21', 'imageTags', {'queryStringParameters': {'key': 'public/' + key}})
      .then((data: any) => { // tslint:disable-line: no-any
        // tslint:disable-next-line: no-any
        console.log(data.Item.labels.map((item: any) => ({id: item.Name, text: item.Name}))); // tslint:disable-line:no-console tslint:disable-line:no-any
        this.setState({
          tags: this.state.tags.concat(data.Item.labels.map((item: any) => ({id: item.Name.toLowerCase(), text: item.Name.toLowerCase()}))) // tslint:disable-line: no-any
        });
      }).catch((e: any ) => { // tslint:disable-line: no-any
    });
  }

  handleFileUpload = async (file: any) => { // tslint:disable-line:no-any
    let filename = uuid() + `-${file.name}`;

    let stored = file ? await Storage.put(filename, file, {
      contentType: file.type
    }) : null;

    if (stored) {
      console.log(stored); // tslint:disable-line: no-console
      if  (file.type.includes('image')) {
        setTimeout(this.getImageTags(stored['key']), 4500); // tslint:disable-line: no-string-literal
      }
      return config.other.BASE_CONTENT_URL + 'public/' + stored['key']; // tslint:disable-line: no-string-literal
    } else {
      return '';
    }
  }
  previewItems() {
    return this.state.files.map(f => {
      var itemDisplay;
      let fileType = this.whatType(f.type);
      switch (fileType) {
        case 'application/pdf':
          itemDisplay = <object data={f.preview} aria-label="preview"/>;
          break;
        case 'image':
          itemDisplay = <img src={f.preview} alt="preview"/>;
          break;
        default:
          break;
      }

      return <li key={f.name}> {itemDisplay} <label> {f.name} <span>{humanFileSize(f.size, true)} </span> </label></li>;
    });
  }
  renderRejectedFiles() {
    var tmpList = this.state.rejectedFiles.map(f => {
      return <li key={f.name}> {f.type} file: {f.name} - {f.size} bytes </li>;
    });
    return <aside> <h2> Rejected Files </h2> <ul> {tmpList} </ul> </aside>;
  }

  render(): React.ReactNode {
    return (
      <Container>
        <Dropzone accept="image/jpeg, image/png, image/svg+xml, application/pdf, audio/*, text/*, video/*" onDrop={(accepted, rejected) => {this.onDrop(accepted, rejected); }}>
          Try dropping some files here, or click to select files to upload
        </Dropzone>
        <aside>
          <h2> Dropped files </h2>
          <ul className="previewItems">
            {this.state.files.length > 0 ? this.previewItems() : 'No files yet'}
          </ul>
        </aside>
        {this.state.rejectedFiles.length > 0 ? this.renderRejectedFiles() : 'All files are accepted'}
        <FormGroup>
          <Tags tags={this.state.tags} />
        </FormGroup>
      </Container>
    );
  }
}
