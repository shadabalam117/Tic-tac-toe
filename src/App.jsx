// src/App.jsx
import React, { useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";

// 🎇 Starfield Background (3D)
function Starfield({ count = 1500 }) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 200;
  }
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="white" size={0.5} sizeAttenuation />
    </points>
  );
}

// 🌀 Floating Torus Knot (just for cool vibe)
function FloatingKnot() {
  const ref = React.useRef();
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += 0.003;
      ref.current.rotation.y += 0.004;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0, -10]}>
      <torusKnotGeometry args={[3, 1, 128, 32]} />
      <meshStandardMaterial
        color="cyan"
        emissive="cyan"
        emissiveIntensity={0.8}
        wireframe
      />
    </mesh>
  );
}

// 🧠 Game Logic
const combos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getWinner(board) {
  for (let [a, b, c] of combos) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.includes(null) ? null : "draw";
}

// 🔥 Main App
export default function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xTurn, setXTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem("scores");
    return saved ? JSON.parse(saved) : { X: 0, O: 0, draw: 0 };
  });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const res = getWinner(board);
    if (res) {
      setWinner(res);
      setScores((prev) => {
        const updated = { ...prev, [res]: prev[res] + 1 };
        localStorage.setItem("scores", JSON.stringify(updated));
        return updated;
      });
    }
  }, [board]);

  function handleClick(i) {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = xTurn ? "X" : "O";
    setHistory([...history, board]);
    setBoard(newBoard);
    setXTurn(!xTurn);
  }

  function reset() {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setXTurn(true);
    setHistory([]);
  }

  function undo() {
    if (history.length === 0) return;
    setBoard(history[history.length - 1]);
    setHistory(history.slice(0, -1));
    setWinner(null);
    setXTurn(!xTurn);
  }

  return (
    <div className="w-screen h-screen bg-black text-white relative overflow-hidden">
      {/* 3D Canvas Background */}
      <Canvas camera={{ position: [0, 0, 20], fov: 75 }} className="absolute inset-0 -z-10">
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1.2} />
        <Starfield />
        <FloatingKnot />
      </Canvas>

      {/* Game UI */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6">
        <h1 className="text-5xl font-bold mb-4 text-cyan-400 drop-shadow-lg">
          ✨ Tic Tac Toe 3D ✨
        </h1>

        {/* Board */}
        <div className="grid grid-cols-3 gap-3">
          {board.map((cell, i) => (
            <motion.button
              key={i}
              onClick={() => handleClick(i)}
              className="w-24 h-24 flex items-center justify-center text-4xl font-bold rounded-xl bg-gray-900/70 border border-cyan-500 shadow-lg hover:scale-105 transition"
              whileTap={{ scale: 0.9 }}
            >
              {cell === "X" && <span className="text-cyan-400">{cell}</span>}
              {cell === "O" && <span className="text-pink-400">{cell}</span>}
            </motion.button>
          ))}
        </div>

        {/* Status */}
        <div className="mt-4 text-center">
          {winner ? (
            <>
              <p className="text-xl font-semibold mb-2">
                {winner === "draw" ? "It's a draw!" : `${winner} Wins! 🎉`}
              </p>
              <button
                onClick={reset}
                className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition"
              >
                Play Again
              </button>
            </>
          ) : (
            <p className="text-lg">Next Turn: {xTurn ? "X" : "O"}</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3 mt-3">
          <button
            onClick={undo}
            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-800"
          >
            Undo
          </button>
          <button
            onClick={reset}
            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-800"
          >
            Reset
          </button>
        </div>

        {/* Scoreboard */}
        <div className="mt-6 text-lg">
          🏆 X: {scores.X} | O: {scores.O} | Draws: {scores.draw}
        </div>
      </div>
    </div>
  );
}
