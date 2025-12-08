// Simple Express + MySQL API for tasks, notes, lists, and tags
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  dateStrings: true, // return DATE as 'YYYY-MM-DD' so UI comparisons work
  waitForConnections: true,
  connectionLimit: 10,
});

function uuid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

async function fetchOne(table, id) {
  const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  return rows[0] || null;
}

// Map DB rows to UI-friendly camelCase
function mapTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    time: row.time,
    type: row.type,
    completed: !!row.completed,
    createdAt: row.created_at,
    listId: row.list_id,
  };
}

function mapNote(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    color: row.color,
    createdAt: row.created_at,
  };
}

function mapList(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
    taskIds: [],
  };
}

function mapTag(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}

// ===== NOTES =====
app.get("/api/notes", async (_req, res) => {
  const [rows] = await pool.query(
    "SELECT id, title, content, color, created_at FROM notes ORDER BY created_at DESC"
  );
  res.json(rows.map(mapNote));
});

app.post("/api/notes", async (req, res) => {
  const id = req.body.id || uuid("note");
  const { title, content = "", color = "#FFEB3B" } = req.body;
  await pool.query(
    "INSERT INTO notes (id, title, content, color, created_at) VALUES (?, ?, ?, ?, NOW())",
    [id, title, content, color]
  );
  res.status(201).json(mapNote(await fetchOne("notes", id)));
});

app.put("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, color } = req.body;
  await pool.query("UPDATE notes SET title=?, content=?, color=? WHERE id=?", [
    title,
    content,
    color,
    id,
  ]);
  const note = mapNote(await fetchOne("notes", id));
  if (!note) return res.status(404).send("Not found");
  res.json(note);
});

app.delete("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM notes WHERE id=?", [id]);
  res.status(204).send();
});

// ===== TASKS =====
app.get("/api/tasks", async (_req, res) => {
  const [rows] = await pool.query(
    "SELECT id, title, description, date, time, type, completed, created_at, list_id FROM tasks WHERE is_deleted = 0 ORDER BY date ASC, time ASC"
  );
  res.json(rows.map(mapTask));
});

app.post("/api/tasks", async (req, res) => {
  const id = req.body.id || uuid("task");
  const {
    title,
    description = "",
    date,
    time = "",
    type = "personal",
    completed = 0,
    listId = null,
  } = req.body;
  await pool.query(
    "INSERT INTO tasks (id, title, description, date, time, type, completed, created_at, list_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, 0)",
    [id, title, description, date, time, type, completed ? 1 : 0, listId]
  );
  res.status(201).json(mapTask(await fetchOne("tasks", id)));
});

app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, date, time, type, completed, listId } = req.body;
  await pool.query(
    "UPDATE tasks SET title=?, description=?, date=?, time=?, type=?, completed=?, list_id=? WHERE id=?",
    [title, description, date, time, type, completed ? 1 : 0, listId, id]
  );
  const task = mapTask(await fetchOne("tasks", id));
  if (!task) return res.status(404).send("Not found");
  res.json(task);
});

app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  // Soft delete to avoid orphaned relations; requires is_deleted column
  await pool.query("UPDATE tasks SET is_deleted = 1 WHERE id=?", [id]);
  res.status(204).send();
});

// ===== LISTS =====
app.get("/api/lists", async (_req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, color, created_at FROM lists ORDER BY created_at DESC"
  );
  res.json(rows.map(mapList));
});

app.post("/api/lists", async (req, res) => {
  const id = req.body.id || uuid("list");
  const { name, color = "#4CAF50" } = req.body;
  await pool.query(
    "INSERT INTO lists (id, name, color, created_at) VALUES (?, ?, ?, NOW())",
    [id, name, color]
  );
  res.status(201).json(mapList(await fetchOne("lists", id)));
});

app.put("/api/lists/:id", async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;
  await pool.query("UPDATE lists SET name=?, color=? WHERE id=?", [
    name,
    color,
    id,
  ]);
  const list = mapList(await fetchOne("lists", id));
  if (!list) return res.status(404).send("Not found");
  res.json(list);
});

app.delete("/api/lists/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM lists WHERE id=?", [id]);
  res.status(204).send();
});

// ===== TAGS =====
app.get("/api/tags", async (_req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, created_at FROM tags ORDER BY created_at DESC"
  );
  res.json(rows.map(mapTag));
});

app.post("/api/tags", async (req, res) => {
  const id = req.body.id || uuid("tag");
  const { name } = req.body;
  await pool.query(
    "INSERT INTO tags (id, name, created_at) VALUES (?, ?, NOW())",
    [id, name]
  );
  res.status(201).json(mapTag(await fetchOne("tags", id)));
});

app.delete("/api/tags/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM tags WHERE id=?", [id]);
  res.status(204).send();
});

// ===== HEALTH =====
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on ${port}`));
