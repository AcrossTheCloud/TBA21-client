import * as React from 'react';
import { observer } from 'mobx-react';
import { FormState, FieldState } from 'formstate';
import { Form, FormGroup, Label, Input, Button, Container } from 'reactstrap';
import Dropzone from 'react-dropzone';
// import FileReader from 'filereader';
import { Viewport, InteractiveMap, MapEvent } from 'react-map-gl';
import * as MapboxGL from 'mapbox-gl';
import { Async } from 'react-select';
import { WithContext as ReactTags } from 'react-tag-input';
import { API } from 'aws-amplify';
import config from '../config.js';

import 'react-select/dist/react-select.css';
import './ItemEntryForm.css';

import { Storage } from 'aws-amplify';
import { v1 as uuid } from 'uuid';

Storage.configure({ level: 'public' });

// set up delimiters for tag entry
const KeyCodes = {
  comma: 188,
  enter: 13,
};
const delimiters = [KeyCodes.comma, KeyCodes.enter];

const getPersonOptions = (input: string) => {
  return API.get('tba21', 'people', { queryStringParameters: { name: input}})
    .then((response: any) => { // tslint:disable-line: no-any
      return { options: response.Items.map( (x: any) => { return {value: x.personId, label: x.name}; } ) }; // tslint:disable-line: no-any
    }).catch((e: any ) => { // tslint:disable-line: no-any
    });
};

interface MyMapState {
  viewport: Viewport;
}

interface MyMapProps {
  onClick: (e: MapEvent) => void; // tslint:disable-line: no-any
}

class MyMap extends React.Component<MyMapProps, MyMapState> {

  map: MapboxGL.Map;

  state: MyMapState = {
      viewport: {
          bearing: 0,
          isDragging: false,
          longitude: 150.86914,
          latitude: -34.41921,
          zoom: 3,
      }
  };

  _onViewportChange = (viewport: Viewport) => this.setState({viewport});

  constructor (props: any) { // tslint:disable-line: no-any
    super(props);
    // this.props = props;
  }

  render() {
      return (
          <div>
              <InteractiveMap
                  {...this.state.viewport}
                  mapboxApiAccessToken="pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2ppNnQzNG9nMDRiMDNscDh6Zm1mb3dzNyJ9.nFFwx_YtN04_zs-8uvZKZQ"
                  height={400}
                  width={400}
                  ref={this.setRefInteractive}
                  onViewportChange={this._onViewportChange}
                  onClick={this.props.onClick}
              />
          </div>
      );
  }

  private readonly setRefInteractive = (el: InteractiveMap) => {
      this.map = el.getMap();
  }

}

let regexWeburl = new RegExp(
  '^' +
  // protocol identifier
  '(?:(?:https?|ftp)://)' +
  // user:pass authentication
  '(?:\\S+(?::\\S*)?@)?' +
  '(?:' +
  // IP address exclusion
  // private & local networks
  '(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
  '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
  '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
  // IP address dotted notation octets
  // excludes loopback network 0.0.0.0
  // excludes reserved space >= 224.0.0.0
  // excludes network & broacast addresses
  // (first & last IP address of each class)
  '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
  '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
  '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
  '|' +
  // host name
  '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
  // domain name
  '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
  // TLD identifier
  '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' +
  // TLD may end with dot
  '\\.?' +
  ')' +
  // port number
  '(?::\\d{2,5})?' +
  // resource path
  '(?:[/?#]\\S*)?' +
  '$',
  'i'
);

const oceans: String[] = [ 'Pacific', 'Atlantic', 'Indian', 'Southern', 'Arctic' ];

const valposition = function (lngLat: number[]): boolean {
  let lng = lngLat[0], lat = lngLat[1];
  return (-180 <= lng) && (lng <= 180) && (-90 <= lat) && (lat <= 90);
};

interface Tag {
  id: string;
  text: string;
}

interface Person {
  label: string;
  value: string;
}

interface NewFile {
    name: string;
    preview: string;
    size: number;
    type: string;
}

interface State {
  tags: Tag[];
  tagSuggestions: Tag[];
  people: Person[];
  roles: Array<Array<Tag>>;
  roleSuggestions: Tag[];
  privacy: boolean;
  urls: string[];
  files: NewFile[];
  rejectedFiles: NewFile[];
}

class ItemEntryFormState {
  // Create a field
  description = new FieldState('').validators((val: string) => !val && 'description required');
  ocean = new FieldState('Pacific').validators((val: string) => oceans.indexOf(val) < 0 && 'valid ocean required');
  urls = new FieldState([]).validators((val: string[]) => !val.reduce((accumulator, item) => { return accumulator && !regexWeburl.test(item); }, true)  && 'valid URL required');
  people = new FieldState([{label: '', value: ''}]).validators((val: Person[]) => !(val.length > 0 && val.reduce((accumulator, item) => accumulator && item.hasOwnProperty('value') && item.value !== '', true)) && 'at least one person required');
  position = new FieldState([150.86914, -34.41921]).validators((val: number[]) => !valposition(val) && 'valid position required');
  tags = new FieldState([]).validators((val: Tag[]) => !(val.length > 0) && 'at least one tag required');
  roles = new FieldState([[]]).validators((val: Tag[][]) => !(val.length > 0) && 'at least one role required');
  privacy = new FieldState(false).validators((val: boolean) => !(val || !val) && 'privacy must be set');

  // Compose fields into a form
  form = new FormState({
    description: this.description,
    ocean: this.ocean,
    urls: this.urls,
    position: this.position,
    people: this.people,
    tags: this.tags,
    roles: this.roles,
    privacy: this.privacy
  });

  onSubmit = async (e: any) => { // tslint:disable-line:no-any
    e.preventDefault();
    //  Validate all fields
    let res = await this.form.validate();
    // If any errors you would know
    if (res.hasError) {
      alert(this.form.error);
      return;
    }
    // Yay .. all good. Do what you want with it
    let body = {
      description: this.form.$.description.$,
      ocean: this.form.$.ocean.$,
      urls: this.form.$.urls.$,
      position: this.form.$.position.$,
      people: this.form.$.people.$.map((person) => ({
        personId: person.value,
        roles: new Array<string>()
      })),
      privacy: this.form.$.privacy.$,
      tags: this.form.$.tags.$.map((item: Tag) => {
        return item.text;
      })
    };

    for (let pidx = 0; pidx < body.people.length; pidx++) {
      body.people[pidx].roles = (this.form.$.roles.$[pidx] as Tag[]).map(item => item.text);
    }

    try {
      let response = await API.post('tba21', 'item', {
        headers: {'Content-Type': 'application/json'},
        body: body
      });
      await response.status;
      location.reload();
    } catch (err) {
      alert(err);
    }
  }
}

@observer
export class ItemEntryForm extends React.Component<{}, State> {

  readonly state = {
      tags: [],
      tagSuggestions: [],
      people: [],
      roles: [],
      roleSuggestions: [{id: 'x', text: 'x'}],
      privacy: false,
      urls: [],
      files: Array<NewFile>(),
      rejectedFiles: Array<NewFile>()
  };

  data = new ItemEntryFormState();

  constructor (props: any) { // tslint:disable-line: no-any
    super(props);
    this.handleTagDelete = this.handleTagDelete.bind(this);
    this.handleTagAddition = this.handleTagAddition.bind(this);
    this.handleTagDrag = this.handleTagDrag.bind(this);

    this.handleRoleDelete = this.handleRoleDelete.bind(this);
    this.handleRoleAddition = this.handleRoleAddition.bind(this);
    this.handleRoleDrag = this.handleRoleDrag.bind(this);

    this.onDrop = this.onDrop.bind(this);
  }

  getImageTags = (key: string) => () => {
    API.get('tba21', 'imageTags', {'queryStringParameters': {'key': 'public/' + key}})
      .then((data: any) => { // tslint:disable-line: no-any
        // tslint:disable-next-line: no-any
        console.log(data.Item.labels.map((item: any) => ({id: item.Name, text: item.Name}))); // tslint:disable-line:no-console tslint:disable-line:no-any
        this.setState({ tags: this.state.tags.concat(data.Item.labels.map((item: any) => ({id: item.Name.toLowerCase(), text: item.Name.toLowerCase()}))) }); // tslint:disable-line: no-any
      }).catch((e: any ) => { // tslint:disable-line: no-any
      });
  }

  handlePersonNameChange = (idx: number) => (evt: any) => { // tslint:disable-line:no-any
    const newPeople = this.state.people.map((person: Person, sidx: number) => {
      if (idx !== sidx) {
        return person;
      }
      return { ...person, label: evt.label, value: evt.value };
    });

    console.log(newPeople); // tslint:disable-line:no-console

    this.setState({ people: newPeople });
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

  handleTagDelete(i: number) {
      const { tags } = this.state;
      this.setState({
       tags: tags.filter((tag, index) => index !== i),
      });
      this.data.tags.onChange(this.state.tags);
  }

  handleTagAddition(tag: Tag) {
    this.setState(state => ({ tags: [...state.tags, tag]}));
  }

  handleTagDrag(tag: Tag, currPos: number, newPos: number) {
      const tags: Tag[] = [...this.state.tags];
      const newTags = tags.slice();

      newTags.splice(currPos, 1);
      newTags.splice(newPos, 0, tag);

      // re-render
      this.setState({ tags: newTags });
  }

  handleRoleDelete = (idx: number) => (i: number) => {
    const roles = (this.state.roles as Tag[][]);
    roles[idx] = roles[idx].filter((role, index) => index !== i);
    this.setState({
      roles: roles
    });
  }

  handleRoleAddition = (idx: number) => (role: Tag) => {
    const roles = (this.state.roles as Tag[][]);
    roles[idx] = [...roles[idx], role];
    this.setState({
      roles: roles
    });
  }

  handleRoleDrag = (idx: number) => (role: Tag, currPos: number, newPos: number) => {
    const roles = (this.state.roles as Tag[][]);
    roles[idx] = roles[idx].slice();

    roles[idx].splice(currPos, 1);
    roles[idx].splice(newPos, 0, role);
    this.setState({
      roles: roles
    });
  }

  componentDidMount() {
    API.get('tba21', 'tags', {})
      .then((data: any) => { // tslint:disable-line: no-any
        this.setState({ tagSuggestions: data.map((item: string) => ({id: item, text: item})) });
      }).catch((e: any ) => { // tslint:disable-line: no-any
      });

    API.get('tba21', 'roles', {})
      .then((data: any) => { // tslint:disable-line: no-any
        this.setState({ roleSuggestions: data.map((item: string) => ({id: item, text: item})) });
      }).catch((e: any ) => { // tslint:disable-line: no-any
      });
  }

  componentDidUpdate() {
    this.data.tags.onChange(this.state.tags);
    this.data.people.onChange(this.state.people);
    this.data.roles.onChange(this.state.roles);
  }

  setposition = (e: MapEvent) => {
    this.data.position.onChange(e.lngLat);
  }

  handleAddPerson = () => {
    console.log((this.state.people as Person[]).concat([{label: '', value: ''} ])); // tslint:disable-line: no-console
    const newRoles = this.state.roles as Tag[][];
    newRoles.push([]);
    this.setState({
      people: (this.state.people as Person[]).concat([{label: '', value: ''}]),
      roles: newRoles
    });
    console.log(this.state.roleSuggestions); // tslint:disable-line: no-console
  }

  handleRemovePerson = (idx: number) => () => {
    this.setState({
      people: this.state.people.filter((s, sidx) => idx !== sidx),
      roles: this.state.roles.filter((s, sidx) => idx !== sidx)
    });
  }
  whatType(item: string) {
      return item.indexOf('image') > -1 ? 'image' : item;
  }
  previewItems() {
      return this.state.files.map(f => {
        var itemDisplay;
        let fileType = this.whatType(f.type);
        switch (fileType) {
            case 'application/pdf':
                itemDisplay = <object data={f.preview}/>;
                break;
            case 'image':
                itemDisplay = <img src={f.preview}/>;
                break;
            default:
                break;
        }

        return <li key={f.name}> {itemDisplay} <label> {f.name} <span>{this.humanFileSize(f.size, true)} </span> </label></li>;
      });
  }

  humanFileSize(bytes: number, si: boolean) {
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
    }

  renderRejectedFiles() {
      var tmpList = this.state.rejectedFiles.map(f => {
          return <li key={f.name}> {f.type} file: {f.name} - {f.size} bytes </li>;
      });
      return <aside> <h2> Rejected Files </h2> <ul> {tmpList} </ul> </aside>;
  }
  render() {
    const data = this.data;

    return (
      <Container>
      <MyMap onClick={(e) => this.setposition(e)}/>
      <Form onSubmit={(e) => data.onSubmit(e)}>
        <FormGroup>
          <Label for="position">position</Label>
          <Input
            value={data.position.value.toString()}
            readOnly={true}
          />
        </FormGroup>
        <FormGroup className="dropzone">
          <Dropzone accept="image/jpeg, image/png, image/svg+xml, application/pdf, audio/*, text/*, video/*" onDrop={(accepted, rejected) => {this.onDrop(accepted, rejected); }}>
            Try dropping some files here, or click to select files to upload
          </Dropzone>
        </FormGroup>
        <aside>
            <h2> Dropped files </h2>
            <ul className="previewItems">
                {this.state.files.length > 0 ? this.previewItems() : 'No files yet'}
            </ul>
            {this.state.rejectedFiles.length > 0 ? this.renderRejectedFiles() : 'All files are accepted'}
        </aside>
        <FormGroup>
          <ReactTags
            tags={this.state.tags}
            suggestions={this.state.tagSuggestions}
            handleDelete={this.handleTagDelete}
            handleAddition={this.handleTagAddition}
            handleDrag={this.handleTagDrag}
            delimiters={delimiters}
          />
        </FormGroup>
        <FormGroup>
          <Label for="inputDescription">Description</Label>
          <Input
            id="inputDescription"
            type="text"
            value={data.description.value}
            onChange={(e) => data.description.onChange(e.target.value)}
          />
        </FormGroup>
        {this.state.people.map((person: Person, idx: number) => (
           <div key={idx}>
            <Async
              name="form-field-name"
              value={{label: person.label, value: person.value}} // tslint:disable-line: no-console
              multi={false}
              autosize={false}
              style={{'width': 'auto'}}
              placeholder="Person..."
              ignoreCase={false}
              loadOptions={getPersonOptions}
              onChange={this.handlePersonNameChange(idx)} // tslint:disable-line: no-string-literal
            />
            <ReactTags
              tags={this.state.roles[idx]}
              suggestions={this.state.roleSuggestions}
              placeholder="Add new role..."
              handleDelete={this.handleRoleDelete(idx)}
              handleAddition={this.handleRoleAddition(idx)}
              handleDrag={this.handleRoleDrag(idx)}
              delimiters={delimiters}
            />
            <Button onClick={this.handleRemovePerson(idx)}>-</Button>
          </div>
        ))}
        <Button onClick={this.handleAddPerson}>Add Person</Button>
        <FormGroup>
          <Label for="ocean">Select an ocean</Label>
          <Input type="select" name="ocean" id="ocean" onChange={(e) => data.ocean.onChange(e.target.value)}>
            <option>Pacific</option>
            <option>Atlantic</option>
            <option>Indian</option>
            <option>Southern</option>
            <option>Arctic</option>
          </Input>
        </FormGroup>
        <FormGroup check>
          <Label check>
            <Input type="checkbox" id="privacy" onChange={(e) => data.privacy.onChange(e.target.checked)}/>
            Private item?
          </Label>
        </FormGroup>
        <Button>Submit</Button>
      </Form>
      </Container>
    );
  }
}
