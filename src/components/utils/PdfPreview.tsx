import * as React from 'react';

import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface Props {
  url: string;
  onLoad: Function;
}

export default class PdfPreview extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return this.props.url !== nextProps.url;
  }

  render() {
    return (
      <Document
        onLoadSuccess={typeof this.props.onLoad === 'function' ? this.props.onLoad() : () => { return; }}
        file={{url: this.props.url}}
      >
        <Page
          pageNumber={1}
        />
      </Document>
    );
  }
}
