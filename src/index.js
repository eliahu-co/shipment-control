import express from "express";
import dotenv from "dotenv";
import truckRoutes from "./routes/trucks.js";
import packageRoutes from "./routes/packages.js";
import assignmentRoutes from "./routes/assignments.js";

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/trucks", truckRoutes);
app.use("/packages", packageRoutes);
app.use("/assign", assignmentRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 