// === Servidor WebSocket puro (sem SSL) compatível com Wokwi ===
import { WebSocketServer } from "ws";

const PORT = 80; // porta padrão HTTP — compatível com Wokwi Web
const wss = new WebSocketServer({ port: PORT, path: "/ws" });
const clients = {};

function log(icon, msg) {
  const t = new Date().toLocaleTimeString("pt-BR", { hour12: false });
  console.log(`[${t}] ${icon} ${msg}`);
}

wss.on("connection", (ws) => {
  log("🔗", "Novo cliente conectado");

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.registrar) {
        clients[data.registrar] = ws;
        ws.deviceId = data.registrar;
        log("✅", `Registrado dispositivo: ${data.registrar}`);
      } else if (data.destino && data.comando) {
        const destino = clients[data.destino];
        if (destino) {
          destino.send(JSON.stringify({ acao: data.comando }));
          log("➡️", `Comando '${data.comando}' enviado para ${data.destino}`);
        } else {
          log("⚠️", `Destino não encontrado: ${data.destino}`);
        }
      }
    } catch (err) {
      log("❌", "Erro: " + err.message);
    }
  });

  ws.on("close", () => {
    log("🔌", `Cliente desconectado (${ws.deviceId || "sem ID"})`);
    for (let id in clients) {
      if (clients[id] === ws) delete clients[id];
    }
  });
});

log("🚀", `Servidor WebSocket iniciado na porta ${PORT}, path /ws`);
