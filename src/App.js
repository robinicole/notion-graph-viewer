import { useEffect, useState } from "react";
import axios from "axios";
import { ForceGraph2D } from "react-force-graph";
import { forceCollide } from "d3-force";

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/notion-data");
        const data = response.data.data;

        // Process data and create graph data
        const nodes = data.map((result) => ({
          id: result.id,
          name: result.properties.Name.title[0]?.plain_text,
        }));

        const links = data.flatMap((result) =>
          result.properties.Children.relation.map((child) => ({
            source: result.id,
            target: child.id,
          }))
        );

        setGraphData({ nodes, links });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const nodeCanvasObject = (node, ctx, globalScale) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(label, node.x, node.y + 10);

    ctx.beginPath();
    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color;
    ctx.fill();
  };

  const labelCollisionForce = () => {
    const padding = 2;
    const radius = 12;

    return forceCollide()
      .radius((d) => radius + padding)
      .strength(0.7);
  };

  return (
    <div className="App" style={{ width: "100%", height: "100vh" }}>
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy="group"
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        onNodeDragEnd={(node) => {
          node.fx = node.x;
          node.fy = node.y;
        }}
        nodeCanvasObject={nodeCanvasObject}
        d3AdditionalForce="labelCollisionForce"
        d3Force={(name, force) => {
          return name === "labelCollisionForce" ? labelCollisionForce() : force;
        }}
      />
    </div>
  );
}

export default App;
