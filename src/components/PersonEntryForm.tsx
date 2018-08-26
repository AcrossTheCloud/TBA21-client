import * as React from 'react';
import { observer } from 'mobx-react';
import { FormState, FieldState } from 'formstate';
import { API } from 'aws-amplify';
import { Form, FormGroup, Label, Input, Button, Container } from 'reactstrap';

class PersonEntryFormState {
  // Create a field
  name = new FieldState('').validators((val: string) => !val && 'name required');
  biography = new FieldState('').validators((val: string) => !val && 'biography required');

  // Compose fields into a form
  form = new FormState({
    name: this.name,
    biography: this.biography
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
    let body = {
      name: this.form.$.name.$,
      biography: this.form.$.biography.$
    };

    try {
      let response = await API.post('tba21', 'person', {
        headers: {'Content-Type': 'application/json'},
        body: body
      });
      await response.status;
      location.reload();
      await response.status;
      location.reload();
    } catch (err) {
      alert(err);
    }
  }

}

@observer
export class PersonEntryForm extends React.Component<{}, {}> {

  data = new PersonEntryFormState();

  render() {
    const data = this.data;
    return (
      <Container>
      <Form onSubmit={(e) => data.onSubmit(e)}>
        <FormGroup>
          <Label for="inputName">Person Name</Label>
          <Input
            id="inputName"
            type="text"
            value={data.name.value}
            onChange={(e) => data.name.onChange(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label for="inputBiography">Person Biography</Label>
          <Input
            id="inputBiography"
            type="textarea"
            value={data.biography.value}
            onChange={(e) => data.biography.onChange(e.target.value)}
          />
        </FormGroup>
        <Button>Submit</Button>
        <p>{data.form.error}</p>
      </Form>
      </Container>
    );
  }
}
