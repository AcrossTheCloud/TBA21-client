import * as React from 'react';
import { Sigma, RelativeSize, RandomizeNodePositions, ForceAtlas2, EdgeShapes, NodeShapes, Graph } from 'react-sigma';
import { API } from 'aws-amplify';

// let myGraph =
export class NetworkGraph extends React.Component<{}, Graph> {

  state: Graph = {
    nodes: [],
    edges: []
  };

  constructor(props: any) { // tslint:disable-line: no-any
    super(props);
    // this.props = props;
  }

  componentDidMount() {
    API.get('tba21', 'itemsGraph', {})
      .then((data: Graph) => {
        this.setState(data);
      }).catch((e: any) => { // tslint:disable-line: no-any
    });
  }

  render() {
      return (
        <div>
        {this.state.nodes.length > 0 ? (
          <Sigma
            renderer="webgl"
            style={{maxWidth: 'inherit', height: '400px'}}
            settings={{
              labelThreshold: 0,
              drawEdges: true,
              drawEdgeLabels: true,
              clone: false
            }}
            graph={this.state}
          >
            <EdgeShapes default="curvedArrow"/>
            <NodeShapes default="circle"/>
            <RandomizeNodePositions>
              <ForceAtlas2 worker barnesHutOptimize barnesHutTheta={0.6} iterationsPerRender={100} linLogMode timeout={1000}/>
              <RelativeSize initialSize={10}/>
            </RandomizeNodePositions>
          </Sigma>) : ('')
        }
        </div>
    );
  }
}
