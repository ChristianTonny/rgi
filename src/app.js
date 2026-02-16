import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import healthRoutes from "./api/health.js";
import ingestRoutes from "./api/ingest.js";
import searchRoutes from "./api/search.js";
import queryRoutes from "./api/query.js";
import dashboardsRoutes from "./api/dashboards.js";
import tasksRoutes from "./api/tasks.js";
import governonceRoutes from "./api/governonce.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/health", healthRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/dashboards", dashboardsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/governonce", governonceRoutes);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

export default app;
