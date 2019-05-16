import * as React from 'react';
import { Sigma, RelativeSize, RandomizeNodePositions, ForceAtlas2, EdgeShapes, NodeShapes, Graph } from 'react-sigma';
import { API } from 'aws-amplify';

import 'styles/components/networkGraph.scss';

// let myGraph =
export class NetworkGraph extends React.Component<{}, Graph> {

  state: Graph = {
    nodes: [],
    edges: []
  };

  componentDidMount() {
    API.get('tba21', 'itemsGraph', {})
      .then((data: Graph) => {

        let displayGraph: Graph = {
          nodes: [],
          edges: []
        };

        let noMoreLabel = [] as boolean[];

        displayGraph.nodes = data.nodes;
        data.edges.forEach(e1 => {
          let ind = displayGraph.edges.findIndex((e2) => (e1.source === e2.source && e1.target === e2.target));
          if (ind === -1) {
            displayGraph.edges.push(e1);
          } else {
            if (!noMoreLabel[ind]) {
              if (displayGraph.edges[ind].label.length < 20) {
                displayGraph.edges[ind].label += ', ' + e1.label;
              } else {
                displayGraph.edges[ind].label += ' and more.';
                noMoreLabel[ind] = true;
              }
            }

          }

        });
        this.setState(displayGraph);
      }).catch((e: any) => { // tslint:disable-line: no-any
    });
  }

  render() {
      return (
        <div className={'networkGraph'}>
        {this.state.nodes.length > 0 ? (
          <Sigma
            renderer="canvas"
            style={{maxWidth: 'inherit', height: '400px'}}
            settings={{
              labelThreshold: 0,
              drawEdges: true,
              drawEdgeLabels: true,
              clone: false,
              labelSize: 'fixed',
              enableEdgeHovering: true
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
