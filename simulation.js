import { moveTowards } from "./services/moveTowards.js";
import { WS_CONFIG } from "./ws.config.js";

let units = [];
let simulationInterval = null;
let simulationTimerValue = 0;

/**
 * Control simulation timer
 * @param {"play" | "stop" | "reset"} controlAction
 */

export function simulationTimer(controlAction) {
  if (controlAction === "play") {
    if (!simulationInterval) return simulationTimerValue;
  }
  if (controlAction === "stop") {
    return simulationTimerValue;
  }
  if (controlAction === "reset") {
    return (simulationTimerValue = 0);
  }

  return simulationTimerValue;
}

export function getSimulationTimer() {
  return simulationTimerValue;
}

export async function reloadUnits(prisma) {
  const dbUnits = await prisma.unit.findMany();
  units = dbUnits.map((u) => ({ ...u }));
  return structuredClone(units);
}

export async function loadUnits(prisma) {
  const dbUnits = await prisma.unit.findMany();
  units = dbUnits.map((u) => ({
    ...u,
  }));
  return structuredClone(units);
}

export function getUnits() {
  return units;
}

function moveUnit(unit) {
  if (unit.task !== "MOVE") return unit;

  const [newLat, newLng] = moveTowards(
    [unit.positionLat, unit.positionLng],
    [unit.destLat, unit.destLng],
    unit.speed
  );

  return {
    ...unit,
    positionLat: newLat,
    positionLng: newLng,
    destLat: unit.destLat,
    destLng: unit.destLng,
  };
}

export function startSimulation(onUpdate) {
  if (simulationInterval) return;

  simulationInterval = setInterval(() => {
    units = units.map(moveUnit);

    simulationTimerValue++;
    console.log("Simulation Timer:", simulationTimerValue);

    if (onUpdate) onUpdate(units);
  }, WS_CONFIG.TICK_RATE);
}

export function stopSimulation() {
  if (!simulationInterval) return;

  clearInterval(simulationInterval);
  simulationInterval = null;
  console.log("Simulation Timer:", simulationTimerValue);
}

export function resetSimulation(initialUnits, onUpdate) {
  stopSimulation();
  simulationTimerValue = 0;
  units = structuredClone(initialUnits);

  if (onUpdate) onUpdate(units);
}

export function formatSimulationTime() {
  const totalSeconds = simulationTimerValue;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}
