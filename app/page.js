"use client";

import { useState } from "react";
import styles from "./page.module.css";

const SIZE = 8;

const levels = [
  {
    name: "Débutant",
    start: 56,
    goal: 7,
    walls: [49, 41, 33, 25, 17],
    green: [54, 46, 38],
  },
  {
    name: "Facile",
    start: 56,
    goal: 7,
    walls: [50, 42, 34, 26, 18, 10],
    green: [48, 40, 32],
  },
  {
    name: "Intermédiaire",
    start: 56,
    goal: 7,
    walls: [49, 50, 42, 34, 26, 18],
    green: [48, 32, 24],
  },
  {
    name: "Difficile",
    start: 56,
    goal: 7,
    walls: [50, 51, 43, 35, 27, 19, 11],
    green: [48, 40, 16],
  },
  {
    name: "Expert",
    start: 56,
    goal: 7,
    walls: [49, 50, 51, 43, 35, 27, 19, 11],
    green: [48, 32, 16, 8],
  },
];

const directions = [
  { id: "up", label: "↑", dx: -8 },
  { id: "left", label: "←", dx: -1 },
  { id: "down", label: "↓", dx: 8 },
  { id: "right", label: "→", dx: 1 },
];

function getNextPosition(position, direction) {
  const row = Math.floor(position / SIZE);
  const col = position % SIZE;

  if (direction === "up" && row > 0) return position - 8;
  if (direction === "down" && row < 7) return position + 8;
  if (direction === "left" && col > 0) return position - 1;
  if (direction === "right" && col < 7) return position + 1;

  return position;
}

// Calculer le chemin le plus court avec BFS
function calculateShortestPath(level) {
  const queue = [{ position: level.start, distance: 0 }];
  const visited = new Set([level.start]);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.position === level.goal) {
      return current.distance;
    }

    for (const direction of directions) {
      const next = getNextPosition(
        current.position,
        direction.id
      );

      if (
        next !== current.position &&
        !level.walls.includes(next) &&
        !visited.has(next)
      ) {
        visited.add(next);

        queue.push({
          position: next,
          distance: current.distance + 1,
        });
      }
    }
  }

  return Infinity;
}

export default function Home() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [robot, setRobot] = useState(levels[0].start);
  const [program, setProgram] = useState([]);
  const [instructionsUsed, setInstructionsUsed] = useState(0);
  const [won, setWon] = useState(false);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);

  const level = levels[levelIndex];
  const optimal = calculateShortestPath(level);

  function addInstruction(direction) {
    if (running || won) return;

    setProgram((previous) => [...previous, direction]);
  }

  function removeLastInstruction() {
    if (running || won) return;

    setProgram((previous) => previous.slice(0, -1));
  }

  function clearProgram() {
    if (running || won) return;

    setProgram([]);
  }

  async function executeProgram() {
    if (program.length === 0 || running || won) return;

    setRunning(true);

    let currentPosition = robot;
    let totalInstructions = instructionsUsed;
    const instructions = [...program];

    for (let i = 0; i < instructions.length; i++) {
      const direction = instructions[i];

      const next = getNextPosition(
        currentPosition,
        direction
      );

      totalInstructions++;

      if (
        next !== currentPosition &&
        !level.walls.includes(next)
      ) {
        currentPosition = next;
      }

      setRobot(currentPosition);
      setInstructionsUsed(totalInstructions);
      setProgram(instructions.slice(i + 1));

      await new Promise((resolve) =>
        setTimeout(resolve, 450)
      );

      if (currentPosition === level.goal) {
        const remaining = totalInstructions - optimal;

        const stars =
          remaining === 0 ? 3 :
          remaining === 1 ? 2 : 1;

        setScore(stars);
        setWon(true);
        break;
      }
    }

    setRunning(false);
  }

  function resetLevel() {
    if (running) return;

    setRobot(level.start);
    setProgram([]);
    setInstructionsUsed(0);
    setWon(false);
    setScore(0);
  }

  function nextLevel() {
    if (running || levelIndex >= levels.length - 1) return;

    const nextIndex = levelIndex + 1;

    setLevelIndex(nextIndex);
    setRobot(levels[nextIndex].start);
    setProgram([]);
    setInstructionsUsed(0);
    setWon(false);
    setScore(0);
  }

  function getCellType(index) {
    if (index === robot) return "robot";
    if (index === level.goal) return "goal";
    if (level.walls.includes(index)) return "wall";
    if (level.green.includes(index)) return "green";

    return "normal";
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>🤖 1337 Robot Challenge</h1>
        <p>Réfléchis, programme et trouve le chemin optimal !</p>
      </header>

      <section className={styles.stats}>
        <div className={styles.stat}>
          <span>Niveau</span>
          <strong>{levelIndex + 1} / {levels.length}</strong>
        </div>

        <div className={styles.stat}>
          <span>Difficulté</span>
          <strong>{level.name}</strong>
        </div>

        <div className={styles.stat}>
          <span>Instructions utilisées</span>
          <strong>{instructionsUsed}</strong>
        </div>

        <div className={styles.stat}>
          <span>Minimum nécessaire</span>
          <strong>{optimal}</strong>
        </div>
      </section>

      <section className={styles.boardSection}>
        <div className={styles.board}>
          {Array.from({ length: 64 }, (_, index) => {
            const type = getCellType(index);

            return (
              <div
                key={index}
                className={`${styles.cell} ${styles[type]}`}
              >
                {type === "robot" && "🤖"}
                {type === "goal" && "⭐"}
                {type === "wall" && "🧱"}
                {type === "green" && "✚"}
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.legend}>
        <h2>Signification des couleurs</h2>

        <div className={styles.legendList}>
          <span>🟦 Robot</span>
          <span>🟩 Case spéciale</span>
          <span>🟥 Obstacle</span>
          <span>🟨 Destination</span>
          <span>⬜ Chemin libre</span>
        </div>
      </section>

      <section className={styles.panel}>
        <h2>1. Construis ton programme</h2>

        <p>
          Choisis les directions dans l'ordre souhaité.
          Le robot ne bougera pas avant l'exécution.
        </p>

        <div className={styles.controls}>
          <button
            onClick={() => addInstruction("up")}
            disabled={running || won}
          >
            ↑
          </button>

          <div>
            <button
              onClick={() => addInstruction("left")}
              disabled={running || won}
            >
              ←
            </button>

            <button
              onClick={() => addInstruction("down")}
              disabled={running || won}
            >
              ↓
            </button>

            <button
              onClick={() => addInstruction("right")}
              disabled={running || won}
            >
              →
            </button>
          </div>
        </div>

        <h2>2. Ton programme</h2>

        <div className={styles.program}>
          {program.length === 0 ? (
            <span className={styles.empty}>
              Aucune instruction
            </span>
          ) : (
            program.map((direction, index) => (
              <span key={index} className={styles.command}>
                {directions.find((d) => d.id === direction).label}
              </span>
            ))
          )}
        </div>

        <p className={styles.counter}>
          Instructions restantes : {program.length}
        </p>

        <div className={styles.actions}>
          <button
            className={styles.execute}
            onClick={executeProgram}
            disabled={program.length === 0 || running || won}
          >
            {running ? "Robot en mouvement..." : "▶ Exécuter le programme"}
          </button>

          <button
            className={styles.secondary}
            onClick={removeLastInstruction}
            disabled={running || won || program.length === 0}
          >
            Supprimer la dernière
          </button>

          <button
            className={styles.secondary}
            onClick={clearProgram}
            disabled={running || won || program.length === 0}
          >
            Effacer le programme
          </button>

          <button
            className={styles.reset}
            onClick={resetLevel}
            disabled={running}
          >
            ↻ Recommencer le niveau
          </button>
        </div>

        {won && (
          <div className={styles.result}>
            <h2>🎉 Niveau terminé !</h2>

            <div className={styles.stars}>
              {"⭐".repeat(score)}
            </div>

            <p>
              Ton résultat : {instructionsUsed} instructions.
            </p>

            {score === 3 ? (
              <p>Excellent ! Tu as trouvé le chemin optimal !</p>
            ) : (
              <p>
                Bien joué ! Tu peux recommencer pour trouver
                un chemin plus court.
              </p>
            )}

            {levelIndex < levels.length - 1 ? (
              <button className={styles.next} onClick={nextLevel}>
                Niveau suivant →
              </button>
            ) : (
              <h3>🏆 Tu as terminé tous les niveaux !</h3>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
