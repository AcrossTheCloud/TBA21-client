import * as React from 'react';
import { observer } from 'mobx-react';
import { FormState, FieldState } from 'formstate';
import { Form, FormGroup, Label, Input, Col } from 'reactstrap';

class EntryFormState {
  // Create a field
  description = new FieldState('').validators((val) => !val && 'description required');

  // Compose fields into a form
  form = new FormState({
    description: this.description
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
      <Form onSubmit={data.onSubmit}>
        <FormGroup>
          <Label for="inputDescription" sm={2}>Description</Label>
          <Col sm={10}>
            <Input
              id="inputDescription"
              type="text"
              value={data.description.value}
              onChange={(e) => data.description.onChange(e.target.value)}
            />
          </Col>
        </FormGroup>
        <p>{data.description.error}</p>
        <p>{data.form.error}</p>
      </Form>
    );
  }
}
