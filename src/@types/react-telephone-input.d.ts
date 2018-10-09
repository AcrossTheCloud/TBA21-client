

declare module 'react-telephone-input' {
  import * as React from 'react';

  export interface ReactTelProps {
      defaultCountry?: string;
      flagsImagePath?: string;
      value?: string;
      onChange?(telNumber: string, selectedCountry: any): void;
  }

  export default class ReactTelInput extends React.Component<ReactTelProps> { }

}
