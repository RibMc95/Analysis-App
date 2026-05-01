import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import favoritesRoutes from "./routes/favorites.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Stock app backend is running",
  });
});

app.use("/api/favorites", favoritesRoutes);

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});