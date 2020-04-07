import * as React from 'react';

interface Props {
  description: string;
}

interface State {
  description: string;
}

export default class HtmlDescription extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    console.log(props);
    this.state = {
      description: this.props.description
    }
  }

  htmlDecode(input: string): string {
    console.log(input);
    let e = document.createElement('div');
    e.innerHTML = input;
    console.log(e);
    console.log(e.childNodes[0]);
    return e.childNodes.length === 0 ? "" : String(e.childNodes[0].nodeValue);
  }

  render() {
    return (
      <div dangerouslySetInnerHTML={{ __html: this.state.description }} />
    );
  }
}
