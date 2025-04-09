import express from "express";
import prisma from "../db.js";

const router = express.Router();

// Create package
router.post("/", async (req, res) => {
  try {
    const { length, width, height } = req.body;
    console.log("Creating new package:", { length, width, height });  // Debug input

    if (!length || !width || !height) {
      console.log("Missing dimensions in request");  // Debug validation
      return res.status(400).json({ error: "Missing dimensions" });
    }

    const newPackage = await prisma.package.create({
      data: { length, width, height }
    });
    console.log("Created package with ID:", newPackage.id);  // Debug success
    res.json(newPackage);
  } catch (err) {
    console.error("Error creating package:", err);  // Debug errors
    res.status(500).json({ error: err.message });
  }
});

// Get packages
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all packages...");  // Debug request
    const packages = await prisma.package.findMany();
    console.log(`Found ${packages.length} packages`);  // Debug results
    res.json(packages);
  } catch (err) {
    console.error("Error fetching packages:", err);  // Debug errors
    res.status(500).json({ error: err.message });
  }
});

export default router; 