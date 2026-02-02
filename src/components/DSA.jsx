import React, { useCallback } from "react";
import ReactFlow, {
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Howl } from "howler";

// Sound setup
const clickSound = new Howl({ src: ["/click.mp3"], volume:0.2 });
const bfsSound = new Howl({ src: ["/sound.mp3"], volume: 0.5 });
const dfsSound = new Howl({ src: ["/sounds.mp3"], volume: 0.5 });

export default function GraphVisualizer() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Add Node
  const addNode = () => {
    const id = (nodes.length + 1).toString();
    const newNode = {
      id,
      data: { label: `Node ${id}` },
      position: { x: 100 + Math.random() * 400, y: 100 + Math.random() * 300 },
      style: { background: "#1E90FF", color: "white", padding: 10 },
    };
    setNodes((nds) => [...nds, newNode]);
    clickSound.play();
  };

  // Connect Nodes
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  );

  // Reset all nodes to original color
  const resetNodes = () => {
    setNodes((nds) =>
      nds.map((n) => ({ ...n, style: { ...n.style, background: "#1E90FF" } }))
    );
  };

  // BFS Traversal
  const runBFS = () => {
    if (nodes.length === 0) return;
    resetNodes();

    const visited = new Set();
    const queue = [nodes[0].id];

    const bfsStep = () => {
      if (queue.length === 0) return;

      const current = queue.shift();
      visited.add(current);

      setNodes((nds) =>
        nds.map((n) =>
          n.id === current
            ? { ...n, style: { ...n.style, background: "yellow" } }
            : n
        )
      );
      bfsSound.play();

      edges.forEach((e) => {
        if (e.source === current && !visited.has(e.target)) queue.push(e.target);
        if (e.target === current && !visited.has(e.source)) queue.push(e.source);
      });

      setTimeout(bfsStep, 500);
    };

    bfsStep();
  };

  // DFS Traversal
  const runDFS = async () => {
    if (nodes.length === 0) return;
    resetNodes();

    const visited = new Set();
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

    const dfsStep = async (current) => {
      if (!current || visited.has(current)) return;
      visited.add(current);

      setNodes((nds) =>
        nds.map((n) =>
          n.id === current
            ? { ...n, style: { ...n.style, background: "orange" } }
            : n
        )
      );
      dfsSound.play();
      await sleep(500);

      const neighbors = edges
        .filter((e) => e.source === current || e.target === current)
        .map((e) => (e.source === current ? e.target : e.source))
        .filter((nId) => !visited.has(nId));

      for (let nId of neighbors) {
        await dfsStep(nId);
      }
    };

    await dfsStep(nodes[0].id);
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <button
        onClick={addNode}
        style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}
      >
        Add Node
      </button>
      <button
        onClick={runBFS}
        style={{ position: "absolute", top: 50, left: 10, zIndex: 10 }}
      >
        Run BFS
      </button>
      <button
        onClick={runDFS}
        style={{ position: "absolute", top: 90, left: 10, zIndex: 10 }}
      >
        Run DFS
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
