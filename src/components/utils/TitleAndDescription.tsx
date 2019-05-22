import * as React from 'react';
import { Container, Form, Input, Label } from 'reactstrap';

interface State {
  title?: string;
  description?: string;
}

interface Props {
  title?: string;
  description?: string;
  handleTitleDescription: Function;
}

export class TitleAndDescription extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      title: '',
      description: ''
    };
  }

  componentDidMount(): void {
    if (this.props.title) {
      this.setState({
        title: this.props.title,
      });
    }
    if (this.props.description) {
      this.setState({
        description: this.props.description
      });
    }
  }

  handleBlur = () => {
    const title = this.state.title,
      description = this.state.description;
    this.props.handleTitleDescription(title, description);
  }

  handleChange = (e) => {
    if (e.target.id === 'title') {
      this.setState({
        title: e.target.value,
      });
    }
    if (e.target.id === 'description') {
      this.setState({
        description: e.target.value
      });
    }
    setTimeout(this.handleBlur, 3000);
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
              onChange={this.handleChange}
              onBlur={this.handleBlur}
            />
            <br />
            <Label for="description">Description</Label>
            <Input
              type="textarea"
              name="description"
              id="description"
              defaultValue={this.props.description}
              onChange={this.handleChange}
              onBlur={this.handleBlur}
            />
            <br />

          </Form>
        </Container>
    );
  }
}