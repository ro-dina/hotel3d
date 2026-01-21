import http from "http";

const PORT = 8787;
const OLLAMA = "http://127.0.0.1:11434";
const TOKEN = process.env.LLM_TOKEN;

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/api/chat") {
    res.writeHead(404);
    return res.end("not found");
  }

  const auth = req.headers["authorization"] || "";
  if (!TOKEN || auth !== `Bearer ${TOKEN}`) {
    res.writeHead(401);
    return res.end("unauthorized");
  }

  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", async () => {
    try {
      const parsed = JSON.parse(body);

      const r = await fetch(`${OLLAMA}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL ?? "llama3.1:8b-instruct",
          messages: parsed.messages,
          stream: false,
        }),
      });

      const json = await r.json();

      const out = {
        content: json?.message?.content ?? "",
        message: json?.message ?? { role: "assistant", content: json?.message?.content ?? "" },
      };

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(out));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: String(e) }));
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`LLM gateway on :${PORT}`);
});