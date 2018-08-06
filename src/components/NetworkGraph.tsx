import * as React from 'react';
import { Sigma, RelativeSize, RandomizeNodePositions, ForceAtlas2, EdgeShapes, NodeShapes, LoadJSON } from 'react-sigma';

// let myGraph =
export class NetworkGraph extends React.Component<{}, {}> {

  render() {
    return (
        <div>
        <Sigma renderer="canvas" style={{maxWidth: 'inherit', height: '400px'}} settings={{labelThreshold: 0, drawEdges: true, drawEdgeLabels: true}}>

          <EdgeShapes default="tapered"/>
          <NodeShapes default="star"/>
          <LoadJSON path="https://tba21-api.acrossthecloud.net/itemsGraph" settings={{ drawEdges: true, drawEdgeLabels: true}}>

          <RandomizeNodePositions>
            <ForceAtlas2 iterationsPerRender={1000} timeout={500}/>
            <RelativeSize initialSize={10}/>
          </RandomizeNodePositions>
          </LoadJSON>
        </Sigma>
        </div>
    );
  }
}
