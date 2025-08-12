import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./firebase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const server = createServer(app);

const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? "*" // or specific URL if you want
    : "http://localhost:3000";

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.get("/messages/:caseId", async (req, res) => {
  try {
    const snapshot = await db
      .collection("chats")
      .doc(req.params.caseId)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .get();

    const messages = snapshot.docs.map((doc) => doc.data());
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("sendMessage", async (message) => {
    const { caseId, senderId, senderName, text, timestamp } = message;
    if (!caseId || !senderId || !text) return;

    try {
      await db
        .collection("chats")
        .doc(caseId)
        .collection("messages")
        .add({
          senderId,
          senderName: senderName || "Unknown",
          text,
          timestamp: timestamp || Date.now(),
        });

      console.log(`Message stored for case ${caseId}`);
    } catch (err) {
      console.error("Error storing message:", err);
    }

    io.to(caseId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "build");
  app.use(express.static(buildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
