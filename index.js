import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma.ts";
import {
  loadUnits,
  reloadUnits,
  startSimulation,
  stopSimulation,
  resetSimulation,
  getUnits,
  getSimulationTimer,
  formatSimulationTime,
} from "./simulation.js";
import { WS_CONFIG } from "./ws.config.js";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let initialUnits = [];
let simulationState = "stopped";

io.on("connection", async (socket) => {
  console.log("client connected:", socket.id);

  if (!initialUnits.length) {
    initialUnits = await loadUnits(prisma);
  }

  socket.emit("units:init", getUnits());

  socket.on("simulation:play", () => {
    console.log("SIMULATION PLAY RECEIVED");
    startSimulation((units) => {
      console.log("SERVER TICK:", units[0].positionLat);
      io.emit("units:update", units);
    });

    const wasStopped = simulationState === "stopped";
    simulationState = "running";

    io.emit("simulation:status", {
      type: "play",
      message: wasStopped ? "Simulation started" : "Simulation resumed",
      timestamp: formatSimulationTime(),
    });
  });

  socket.on("simulation:stop", () => {
    stopSimulation();
    console.log("SIMULATION STOP RECEIVED");
    simulationState = "stopped";
    io.emit("simulation:update", { timer: getSimulationTimer() });
    io.emit("simulation:status", {
      type: "stop",
      message: "Simulation is paused/stopped",
      timestamp: formatSimulationTime(),
    });
  });

  socket.on("simulation:reset", () => {
    resetSimulation(initialUnits);
    console.log("SIMULATION RESET RECEIVED");
    simulationState = "stopped";
    io.emit("simulation:update", { timer: getSimulationTimer() });
    io.emit("simulation:status", {
      type: "reset",
      message: "Simulation has been reset",
      timestamp: formatSimulationTime(),
    });
    io.emit("units:init", getUnits());
  });

  socket.on("units:reload", async () => {
    console.log("Reloading units from DB");

    initialUnits = await reloadUnits(prisma);

    io.emit("units:init", getUnits());
  });
});

setInterval(() => {
  io.emit("simulation:update", { timer: getSimulationTimer() });
}, WS_CONFIG.TICK_RATE);

server.listen(3000, () => console.log("Server running on port 3000"));
