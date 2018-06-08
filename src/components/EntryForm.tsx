import * as React from 'react';
import { observer } from 'mobx-react';
import { FormState, FieldState } from 'formstate';

import { Form, FormGroup, Label, Input, Button, Container } from 'reactstrap';

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

class EntryFormState {
  // Create a field
  description = new FieldState('').validators((val) => !val && 'description required');
  ocean = new FieldState('Pacific').validators((val) => oceans.indexOf(val) < 0 && 'valid ocean requured');
  url = new FieldState('').validators((val) => regexWeburl.test(val) && 'valid URL required');
  artist = new FieldState('').validators((val) => {return false;});

  // Compose fields into a form
  form = new FormState({
    description: this.description,
    ocean: this.ocean,
    url: this.url,
    artist: this.artist
  });

  onSubmit = async () => {
    //  Validate all fields
    const res = await this.form.validate();
    // If any errors you would know
    if (res.hasError) {
      // fixme
      return;
    }
  // Yay .. all good. Do what you want with it
  // fixme
  }
}

@observer
export class EntryForm extends React.Component<{}, {}> {
  data = new EntryFormState();
  render() {
    const data = this.data;
    return (
      <Container>
      <Form onSubmit={data.onSubmit}>
        <FormGroup>
          <Label for="inputDescription">Description</Label>
          <Input
            id="inputDescription"
            type="text"
            value={data.description.value}
            onChange={(e) => data.description.onChange(e.target.value)}
          />
        </FormGroup>
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
        <FormGroup>
          <Label for="artist">Artist</Label>
          <Input
            id="artist"
            type="text"
            value={data.artist.value}
            onChange={(e) => data.artist.onChange(e.target.value)}
          />
        </FormGroup>
        <Button>Submit</Button>
        <p>{data.form.error}</p>
      </Form>
      </Container>
    );
  }
}
