const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { spawn } = require("child_process");
const { v4: uuid } = require("uuid");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

/* ================= SOCKET ROOMS ================= */
const roomState = {};

io.on("connection", (socket) => {
  socket.on("join-room", (room) => {
    socket.join(room);
    if (roomState[room]) {
      socket.emit("sync-code", roomState[room]);
    }
  });

  socket.on("code-change", ({ roomId, code, lang }) => {
    roomState[roomId] = { code, lang };
    socket.to(roomId).emit("sync-code", { code, lang });
  });
});

/* ================= RUN CODE ================= */
app.post("/run", (req, res) => {
  const { language, code, input } = req.body;
  const id = uuid();
  let file, cmd, args;

  if (language === "python") {
    file = `temp_${id}.py`;
    cmd = "python";
    args = [file];
  } else if (language === "javascript") {
    file = `temp_${id}.js`;
    cmd = "node";
    args = [file];
  } else if (language === "cpp") {
    file = `temp_${id}.cpp`;
    cmd = "g++";
    args = [file, "-o", `out_${id}`];
  } else {
    return res.json({ output: "Unsupported language" });
  }

  fs.writeFileSync(file, code);
  let output = "";

  const clean = () => {
    fs.existsSync(file) && fs.unlinkSync(file);
    fs.existsSync(`out_${id}`) && fs.unlinkSync(`out_${id}`);
  };

  if (language === "cpp") {
    const compile = spawn(cmd, args);
    compile.stderr.on("data", d => output += d);

    compile.on("close", () => {
      if (output) {
        clean();
        return res.json({ output });
      }

      const run = spawn(`./out_${id}`);
      if (input) run.stdin.write(input);
      run.stdin.end();

      run.stdout.on("data", d => output += d);
      run.stderr.on("data", d => output += d);

      run.on("close", () => {
        clean();
        res.json({ output });
      });
    });
  } else {
    const run = spawn(cmd, args);
    if (input) run.stdin.write(input);
    run.stdin.end();

    run.stdout.on("data", d => output += d);
    run.stderr.on("data", d => output += d);

    run.on("close", () => {
      clean();
      res.json({ output });
    });
  }
});

server.listen(5000, () => {
  console.log("🔥 Backend running on http://localhost:5000");
});
