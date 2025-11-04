const io = require("socket.io")(process.env.PORT || 3000, {
  cors: { origin: "*" }
});

const clients = {};

io.on("connection", (socket) => {
  console.log("🔗 Nova ESP conectada:", socket.id);

  socket.on("registrar", (id) => {
    clients[id] = socket.id;
    console.log(`✅ Registrado dispositivo: ${id}`);
  });

  socket.on("comando", (data) => {
    const destinoSocket = clients[data.destino];
    if (destinoSocket) {
      io.to(destinoSocket).emit("acao", data.comando);
    } else {
      console.log("⚠️ Destino não encontrado:", data.destino);
    }
  });

  socket.on("disconnect", () =>
    console.log("❌ ESP desconectada:", socket.id)
  );
});

console.log("🚀 Servidor iniciado...");
