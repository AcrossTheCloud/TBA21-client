import * as React from 'react';
import { observer } from 'mobx-react';
import { FormState, FieldState } from 'formstate';
import { Form, FormGroup, Label, Input, Button, Container } from 'reactstrap';
import {
    Viewport,
    InteractiveMap,
    MapEvent
} from 'react-map-gl';
import * as MapboxGL from 'mapbox-gl';
import { Async } from 'react-select';
import { WithContext as ReactTags } from 'react-tag-input';

import 'react-select/dist/react-select.css';
import './ItemEntryForm.css';

// set up delimiters for tag entry
const KeyCodes = {
  comma: 188,
  enter: 13,
};
const delimiters = [KeyCodes.comma, KeyCodes.enter];

const getPersonOptions = (input: string) => {
  return fetch(`https://c8rat70v4a.execute-api.ap-southeast-2.amazonaws.com/dev/people?name=${input}`)
    .then((response) => {
      return response.json();
    }).then((json) => {
      console.log(json); // tslint:disable-line: no-console
      return { options: json.Items.map( (x: any) => { return {value: x.personId, label: x.personName, role: ''}; } ) }; // tslint:disable-line: no-any
    });
};

const getRoleOptions = (input: string) => {
  return fetch(`https://c8rat70v4a.execute-api.ap-southeast-2.amazonaws.com/dev/roles`)
    .then((response) => {
      return response.json();
    }).then((json) => {
      console.log(json); // tslint:disable-line: no-console
      return { options: json.Items.map( (x: string ) => { return {role: x as string }; } ) };
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
  personName: string;
  personId: string;
  role: string;
}

interface State {
  tags: Tag[];
  tagSuggestions: Tag[];
  people: Person[];
  roleSuggestions: Tag[];
}

class ItemEntryFormState {
  // Create a field
  description = new FieldState('').validators((val: string) => !val && 'description required');
  ocean = new FieldState('Pacific').validators((val: string) => oceans.indexOf(val) < 0 && 'valid ocean requured');
  url = new FieldState('').validators((val: string) => !regexWeburl.test(val) && 'valid URL required');
  people = new FieldState([{ personId: '', personName: '', role: '' }]).validators((val: object) => { return false; });
  position = new FieldState([150.86914, -34.41921]).validators((val: number[]) => !valposition(val) && 'valid position required');
  tags = new FieldState([]).validators((val: Tag[]) => !(val.length > 0) && 'at least one tag required');

  // Compose fields into a form
  form = new FormState({
    description: this.description,
    ocean: this.ocean,
    url: this.url,
    position: this.position,
    people: this.people,
    tags: this.tags
  });

  onSubmit = async (e: any) => { // tslint:disable-line:no-any
    e.preventDefault();
    //  Validate all fields
    let res = await this.form.validate();
    // If any errors you would know
    if (res.hasError) {
      return;
    }
    // Yay .. all good. Do what you want with it
    let body = JSON.stringify({
      description: this.form.$.description.$,
      ocean: this.form.$.ocean.$,
      url: this.form.$.url.$,
      position: this.form.$.position.$,
      people: this.form.$.people.$,
      tags: this.form.$.tags.$.map((item: Tag) => {
        return item.text;
      })
    });

    try {
      let response = await fetch('https://c8rat70v4a.execute-api.ap-southeast-2.amazonaws.com/dev/item', {
        method: 'POST',
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
      roleSuggestions: []
  };

  data = new ItemEntryFormState();

  constructor (props: any) { // tslint:disable-line: no-any
    super(props);
    this.handleTagDelete = this.handleTagDelete.bind(this);
    this.handleTagAddition = this.handleTagAddition.bind(this);
    this.handleTagDrag = this.handleTagDrag.bind(this);

/*
    this.handleRoleDelete = this.handleRoleDelete.bind(this);
    this.handleRoleAddition = this.handleRoleAddition.bind(this);
    this.handleRoleDrag = this.handleRoleDrag.bind(this);
    */

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

/* fixme
  handleRoleDelete(i: number, idx: number) {
      const { tags } = this.state;
      this.setState({
       tags: tags.filter((tag, index) => index !== i),
      });
      this.data.tags.onChange(this.state.tags);
  }

  handleRoleAddition(tag: Tag) {
    this.setState(state => ({ tags: [...state.tags, tag]}));
  }

  handleRoleDrag(tag: Tag, currPos: number, newPos: number) {
      const tags: Tag[] = [...this.state.tags];
      const newTags = tags.slice();

      newTags.splice(currPos, 1);
      newTags.splice(newPos, 0, tag);

      // re-render
      this.setState({ tags: newTags });
  }
  */

  componentDidMount() {
    fetch('https://c8rat70v4a.execute-api.ap-southeast-2.amazonaws.com/dev/tags')
    .then((result: any) =>  { // tslint:disable-line:no-any
      return result.json();
    }).then((data) => {
      return data;
    })
    .then((data) => {
      console.log(data); // tslint:disable-line:no-console
      this.setState({ tagSuggestions: data.map((item: string) => ({id: item, text: item})) });
    });

    fetch('https://c8rat70v4a.execute-api.ap-southeast-2.amazonaws.com/dev/roles')
    .then((result: any) =>  { // tslint:disable-line:no-any
      return result.json();
    }).then((data) => {
      return data;
    })
    .then((data) => {
      console.log(data); // tslint:disable-line:no-console
      this.setState({ roleSuggestions: data.map((item: string) => ({id: item, text: item})) });
    });
  }

  componentDidUpdate() {
    this.data.tags.onChange(this.state.tags);
  }

  setposition = (e: MapEvent) => {
    this.data.position.onChange(e.lngLat);
  }

  handleAddPerson = () => {
    this.setState({
      people: (this.state.people as Person[]).concat([{personId: '', personName: '', role: ''}])
    });
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
          <div>
            <Async
              name="form-field-name"
              value={person.personName}
              multi={false}
              autosize={false}
              style={{'width': 'auto'}}
              placeholder="Person..."
              ignoreCase={false}
              loadOptions={getPersonOptions}
              onChange={(e) => { data.people[idx].onChange({personId: (e as object)['label'], personName: (e as object)['value'], role: ''}); }} // tslint:disable-line: no-string-literal
            />
            <Async
              name="form-field-role"
              value={person.role}
              multi={false}
              autosize={false}
              style={{'width': 'auto'}}
              placeholder="Role..."
              ignoreCase={false}
              loadOptions={getRoleOptions}
              onChange={(e) => { data.people[idx].onChange({personId: data.people[idx].personId, personName: data.people[idx].personName, role: (e as object)['role']}); }} // tslint:disable-line: no-string-literal
            />
          </div>
        ))}
        <button type="button" onClick={this.handleAddPerson} className="small">Add Person</button>
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
        <FormGroup>
          <Label for="url">Url</Label>
          <Input type="url" name="url" id="url" placeholder="url placeholder" onChange={(e) => data.url.onChange(e.target.value)}/>
        </FormGroup>
        <Button>Submit</Button>
        <p>{data.form.error}</p>
      </Form>
      </Container>
    );
  }
}
