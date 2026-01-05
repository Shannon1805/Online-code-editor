import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { socket } from "./socket";

const ROOM_ID = "hopecore-room";

export default function Editor() {
  const [code, setCode] = useState("");
  const [lang, setLang] = useState("python");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState([]);

  const typingTimeout = useRef(null);
  const versionTimeout = useRef(null);

  /* ================= SHARE ================= */
  const shareRoom = () => {
    const link = `${window.location.origin}?room=${ROOM_ID}`;
    navigator.clipboard.writeText(link);
    alert("🔗 Room link copied!");
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    socket.emit("join-room", ROOM_ID);

    const syncHandler = (data) => {
      setCode(data.code);
      setLang(data.lang);
    };

    socket.on("sync-code", syncHandler);
    return () => socket.off("sync-code", syncHandler);
  }, []);

  /* ================= VERSION AUTO SAVE ================= */
  useEffect(() => {
    clearTimeout(versionTimeout.current);
    versionTimeout.current = setTimeout(() => {
      if (code.trim()) {
        setVersions((prev) => [
          {
            id: Date.now(),
            code,
            lang,
            time: new Date().toLocaleTimeString()
          },
          ...prev.slice(0, 9)
        ]);
      }
    }, 4000);
  }, [code, lang]);

  /* ================= CODE CHANGE ================= */
  const handleChange = (e) => {
    const v = e.target.value;
    setCode(v);

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("code-change", {
        roomId: ROOM_ID,
        code: v,
        lang
      });
    }, 200);
  };

  /* ================= RUN CODE ================= */
  const runCode = async () => {
    try {
      setLoading(true);
      setOutput("⏳ Running...");

      const res = await axios.post("http://localhost:5000/run", {
        language: lang,
        code,
        input
      });

      setOutput(res.data.output || "No Output");
    } catch {
      setOutput("❌ Execution Error");
    } finally {
      setLoading(false);
    }
  };

  const restoreVersion = (v) => {
    setCode(v.code);
    setLang(v.lang);
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={shareRoom}>🔗 Share</button>
      </div>

      <select value={lang} onChange={(e) => setLang(e.target.value)}>
        <option value="python">Python</option>
        <option value="javascript">JavaScript</option>
        <option value="cpp">C++</option>
      </select>

      <textarea
        rows="14"
        value={code}
        onChange={handleChange}
        placeholder="Write your code..."
        style={{ width: "100%", marginTop: 10 }}
      />

      <textarea
        rows="4"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Input (stdin) — optional"
        style={{ width: "100%", marginTop: 10 }}
      />

      <button onClick={runCode} disabled={loading}>
        {loading ? "⏳ Running..." : "▶ Run"}
      </button>

      <pre style={{ background: "#111", color: "#0f0", padding: 10 }}>
        {output}
      </pre>

      <h4>🕒 Version History</h4>
      {versions.map((v) => (
        <div
          key={v.id}
          style={{ cursor: "pointer", border: "1px solid #ccc", padding: 6 }}
          onClick={() => restoreVersion(v)}
        >
          ⏱ {v.time} | {v.lang}
        </div>
      ))}
    </div>
  );
}

