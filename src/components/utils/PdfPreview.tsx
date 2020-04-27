import * as React from 'react';

import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface Props {
  url: string;
  onLoad: Function;
}
interface State {
  url: string;
}

export default class PdfPreview extends React.Component<Props, State> {
  _isMounted: boolean = false;

  constructor(props: Props) {
    super(props);

    this.state = {
      url: this.props.url
    };
  }

  componentDidMount(): void {
    this._isMounted = true;
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  render() {
    return (
      <Document
        onLoadSuccess={typeof this.props.onLoad === 'function' ? () => this.props.onLoad() : () => { return; }}
        file={{url: this.state.url}}
      >
        <Page
          pageNumber={1}
        />
      </Document>
    );
  }
}
