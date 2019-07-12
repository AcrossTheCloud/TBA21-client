declare module 'react-sigma' {
  import * as React from 'react';

  interface Edge {
    id: string;
    source: string;
    target: string;
    label: string;
  }

  interface Node {
    id: string;
    label: string;
  }

  interface Graph {
    nodes: Array<Node>;
    edges: Array<Edge>;
  }

  export interface ReactSigmaProps {
      graph?: Graph;
      settings?: any;
      renderer?: string;
      style?: any;
      onOverEdge?(event: any): any;
  }

  export class Sigma extends React.Component<ReactSigmaProps> { }

  export class RandomizeNodePositions extends React.PureComponent<any> { }

  export class ForceAtlas2 extends React.Component<any> {}

  export class EdgeShapes extends React.Component<any> {}

  export class NodeShapes extends React.Component<any> {}

  export class RelativeSize extends React.Component<any> { }

  export class LoadGEXF extends React.PureComponent<any> { }

  export class LoadJSON extends React.PureComponent<any> { }

}
