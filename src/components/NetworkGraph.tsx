import * as React from 'react';
import { Sigma, RelativeSize, RandomizeNodePositions, ForceAtlas2, EdgeShapes, NodeShapes, LoadJSON } from 'react-sigma';

// let myGraph =
export class NetworkGraph extends React.Component<{}, {}> {

  render() {
    return (
        <div>
        <Sigma
          renderer="canvas"
          style={{maxWidth: 'inherit', height: '400px'}}
          settings={{
            labelThreshold: 0,
            drawEdges: true,
            drawEdgeLabels: true
          }}
        >
          <EdgeShapes default="curvedArrow"/>
          <NodeShapes default="circle"/>
          <LoadJSON path="https://tba21-api.acrossthecloud.net/itemsGraph">
          <RandomizeNodePositions>
            <ForceAtlas2 worker barnesHutOptimize barnesHutTheta={0.6} iterationsPerRender={100} linLogMode timeout={1000}/>
            <RelativeSize initialSize={10}/>
          </RandomizeNodePositions>
          </LoadJSON>
        </Sigma>
        </div>
    );
  }
}
