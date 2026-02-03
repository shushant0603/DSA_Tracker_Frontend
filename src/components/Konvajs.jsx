import React, { useState } from "react";
import { Stage, Layer, Circle, Star, Line, Text } from "react-konva";
// import { Howl } from "howler";
import { gsap } from "gsap";

// Sounds
// const clickSound = new Howl({ src: ["/sounds/click.mp3"], volume: 0.5 });
// const bfsSound = new Howl({ src: ["/sounds/bfs.mp3"], volume: 0.5 });
// const dfsSound = new Howl({ src: ["/sounds/dfs.mp3"], volume: 0.5 });

export default function DSAGamePlayground() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const addNode = () => {
    const id = (nodes.length + 1).toString();
    const newNode = {
      id,
      x: 100 + Math.random() * 600,
      y: 100 + Math.random() * 400,
      color: "#1E90FF",
      label: `Node ${id}`,
      sparkle: false,
      shape: Math.random() > 0.5 ? "circle" : "star",
    };
    setNodes([...nodes, newNode]);
    // clickSound.play();
    // Particle burst
  };

  const connectNodes = () => {
    if (nodes.length >= 2) {
      const newEdge = {
        from: nodes[nodes.length - 2].id,
        to: nodes[nodes.length - 1].id,
      };
      setEdges([...edges, newEdge]);
      // Optional: animate line swoosh
    }
  };

  // BFS / DFS will be implemented like before
  // Each node visit → color change + sparkle + sound
  // Use async + setTimeout for step-by-step animation
  // Particle trail can be done via small stars/circles fading

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={addNode}>Add Node</button>
        <button onClick={connectNodes}>Connect Last 2 Nodes</button>
        <button /* onClick={runBFS} */>Run BFS</button>
        <button /* onClick={runDFS} */>Run DFS</button>
      </div>

      <Stage width={900} height={600} style={{ border: "1px solid gray" }}>
        <Layer>
          {/* Render Edges */}
          {edges.map((e, i) => {
            const fromNode = nodes.find((n) => n.id === e.from);
            const toNode = nodes.find((n) => n.id === e.to);
            if (!fromNode || !toNode) return null;
            return <Line key={i} points={[fromNode.x, fromNode.y, toNode.x, toNode.y]} stroke="black" strokeWidth={2} />;
          })}

          {/* Render Nodes */}
          {nodes.map((n) => (
            <React.Fragment key={n.id}>
              {n.shape === "circle" ? (
                <Circle
                  x={n.x}
                  y={n.y}
                  radius={30}
                  fill={n.color}
                  draggable
                  onDragEnd={(e) => {
                    const { x, y } = e.target.position();
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === n.id ? { ...node, x, y } : node
                      )
                    );
                  }}
                />
              ) : (
                <Star
                  x={n.x}
                  y={n.y}
                  numPoints={5}
                  innerRadius={10}
                  outerRadius={20}
                  fill={n.color}
                  draggable
                />
              )}

              {/* Sparkle / Particle placeholder */}
              {n.sparkle && <Star x={n.x} y={n.y} numPoints={5} innerRadius={5} outerRadius={15} fill="white" opacity={0.8} />}

              <Text x={n.x - 15} y={n.y - 8} text={n.label} fontSize={14} fill="black" />
            </React.Fragment>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
