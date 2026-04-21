import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "config", "config.env") });

// Important: ESM imports are hoisted, so use dynamic import to ensure
// dotenv has run before loading modules that read process.env at import time.
import http from "http";
import { Server } from "socket.io";

const [{ default: app }, { default: cloudinary }] = await Promise.all([
  import("./app.js"),
  import("cloudinary"),
]);

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174", "https://rahatclinic.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected to Socket.IO:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
