// server.mjs
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use(express.static(__dirname));

app.get("/api/giveaways", async (req, res) => {
  try {
    const response = await fetch("https://www.gamerpower.com/api/giveaways");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching giveaways:", err);
    res.status(500).json({ error: "Failed to fetch giveaways" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
