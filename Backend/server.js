import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "config", "config.env") });

// Important: ESM imports are hoisted, so use dynamic import to ensure
// dotenv has run before loading modules that read process.env at import time.
const [{ default: app }, { default: cloudinary }] = await Promise.all([
  import("./app.js"),
  import("cloudinary"),
]);

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
