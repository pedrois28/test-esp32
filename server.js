// === SERVER.IO com LOGS MELHORADOS ===
// Compatível com Socket.IO v2.x
// Mostra todas as ações entre ESPs com cores e timestamps

const socketio = require("socket.io");
const PORT = process.env.PORT || 443; // 🔁 Usar porta 443 padrão HTTPS
const io = socketio({
  cors: { origin: "*" }
});

const clients = {}; // Armazena ESPs conectadas

// Função auxiliar para logs com timestamp
const log = (emoji, msg) => {
  const time = new Date().toLocaleTimeString("pt-BR", { hour12: false });
  console.log(`[${time}] ${emoji} ${msg}`);
};

io.on("connection", (socket) => {
  log("🔗", `Nova ESP conectada: ${socket.id}`);

  // Quando um dispositivo se registra
  socket.on("registrar", (id) => {
    clients[id] = socket.id;
    socket.deviceId = id;
    log("✅", `Registrado dispositivo: ${id} (socket: ${socket.id})`);
    socket.emit("registrado", `Dispositivo ${id} registrado com sucesso!`);
  });

  // Quando recebe um comando de uma ESP
  socket.on("comando", (data) => {
    try {
      const origem = socket.deviceId || socket.id;
      const destino = data.destino;
      const comando = data.comando;

      log("📤", `Comando recebido de ${origem}: '${comando}' → destino: ${destino}`);

      const destinoSocket = clients[destino];
      if (destinoSocket) {
        io.to(destinoSocket).emit("acao", comando);
        log("➡️", `Comando '${comando}' enviado com sucesso para ${destino}`);
      } else {
        log("⚠️", `Destino não encontrado: ${destino}`);
        socket.emit("erro", `Destino '${destino}' não encontrado.`);
      }
    } catch (err) {
      log("❌", `Erro ao processar comando: ${err.message}`);
    }
  });

  // Quando um dispositivo se desconecta
  socket.on("disconnect", () => {
    log("🔌", `ESP desconectada: ${socket.deviceId || socket.id}`);
    for (let id in clients) {
      if (clients[id] === socket.id) {
        delete clients[id];
        break;
      }
    }
  });
});

// 🔁 Escuta na porta HTTPS padrão (Render redireciona automaticamente)
io.listen(PORT);
log("🚀", `Servidor iniciado e aguardando conexões na porta ${PORT}...`);
