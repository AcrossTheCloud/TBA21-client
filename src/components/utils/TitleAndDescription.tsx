import * as React from 'react';
import { Container, Form, Input, Label } from 'reactstrap';

interface State {
  title: string;
  description?: string;
}

interface Props {
  title?: string;
  description?: string;
  callback: Function;
}

export class TitleAndDescription extends React.Component<Props, State> {
  onBlurTimeout;

  constructor(props: Props) {
    super(props);

    this.state = {
      title: '',
      description: ''
    };
  }

  componentDidMount(): void {
    this.setState({
      title: (this.props.title ? this.props.title : '' ),
      description: (this.props.description ? this.props.description : '')
    });
  }

  /**
   * Gets user input and sets the state.
   * @param type { string }
   * @param value { string }
   */
  handleChange = (type: string, value: string) => {
    if (this.onBlurTimeout) {
      clearTimeout(this.onBlurTimeout);
    }

    let state = {};
    Object.assign(state, { [type]: value });

    this.setState({...state});
    this.onBlurTimeout = setTimeout(() => this.props.callback(this.state.title, this.state.description), 1000);
  }

  render() {
    return(
      <Container>
        <Form>
          <Label for="title">Title</Label>
          <Input
            type="text"
            name="title"
            id="title"
            defaultValue={this.props.title}
            onChange={e => this.handleChange('title', e.target.value)}
            onBlur={() => this.props.callback(this.state.title, this.state.description)}
          />
          <br />
          <Label for="description">Description</Label>
          <Input
            type="textarea"
            name="description"
            id="description"
            defaultValue={this.props.description}
            onChange={e => this.handleChange('description', e.target.value)}
            onBlur={() => this.props.callback(this.state.title, this.state.description)}
          />
          <br />

        </Form>
      </Container>
    );
  }
}