import express from "express";
import prisma from "../db.js";

const router = express.Router();

// Create truck
router.post("/", async (req, res) => {
  try {
    const { length, width, height } = req.body;
    console.log("Creating new truck:", { length, width, height });  // Debug dimensions

    if (!length || !width || !height) {
      console.log("Missing dimensions in request");  // Debug validation
      return res.status(400).json({ error: "Missing dimensions" });
    }

    const truck = await prisma.truck.create({
      data: { length, width, height }
    });
    console.log("Created truck with ID:", truck.id);  // Debug success
    res.json(truck);
  } catch (err) {
    console.error("Error creating truck:", err);  // Debug errors
    res.status(500).json({ error: err.message });
  }
});

// Get trucks
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all trucks...");  // Debug request
    const trucks = await prisma.truck.findMany();
    console.log(`Found ${trucks.length} trucks`);  // Debug results
    res.json(trucks);
  } catch (err) {
    console.error("Error fetching trucks:", err);  // Debug errors
    res.status(500).json({ error: err.message });
  }
});

export default router; 