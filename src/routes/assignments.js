import express from "express";
import prisma from "../db.js";

const router = express.Router();

// Assign packages to truck
router.post("/", async (req, res) => {
  try {
    console.log("Got assignment request with packages:", req.body.packageIds);
    const { packageIds } = req.body;
    if (!packageIds || !packageIds.length) {
      console.log("No packages provided in request");
      return res.status(400).json({ error: "No packages selected" });
    }

    // Is package already assigned to a truck?
    console.log("Checking for existing assignments...");
    const existingAssignments = await prisma.truckPackageAssignment.findMany({
      where: {
        packageId: { in: packageIds }
      },
      include: {
        package: true,
        truck: true
      }
    });
    console.log(`Found ${existingAssignments.length} existing assignments`);

    if (existingAssignments.length > 0) {
      const alreadyAssigned = existingAssignments.map(assignment => ({
        packageId: assignment.packageId,
        truckId: assignment.truckId
      }));
      console.log("Already assigned packages:", alreadyAssigned);
      return res.status(400).json({
        error: "Some packages are already assigned",
        alreadyAssigned
      });
    }
    console.log("No existing assignments found, proceeding...");

    // Get an available truck
    const truck = await prisma.truck.findFirst({
      where: { isFull: false },
      include: {
        assignments: {
          include: {
            package: true
          }
        }
      }
    });
    console.log("Found available truck:", truck?.id || "none");

    if (!truck) {
      return res.status(404).json({ error: "No trucks available" });
    }

    // Get packages
    const packages = await prisma.package.findMany({
      where: { id: { in: packageIds } }
    });
    console.log(`Found ${packages.length} packages out of ${packageIds.length} requested`);

    // Verify all packages exist
    if (packages.length !== packageIds.length) {
      console.log("Missing packages:", packageIds.filter(id => 
        !packages.find(p => p.id === id))
      );
      return res.status(400).json({ error: "Some packages not found" });
    }

    // Calculate existing volume in truck
    const existingVolume = truck.assignments.reduce((total, assignment) => {
      const pkg = assignment.package;
      return total + (pkg.length * pkg.width * pkg.height);
    }, 0);
    console.log("Existing volume in truck:", existingVolume);

    // Calculate new packages volume
    const newPackagesVolume = packages.reduce((total, pkg) => 
      total + (pkg.length * pkg.width * pkg.height), 0);
    
    // Calculate total volume and percentage
    const truckVolume = truck.length * truck.width * truck.height;
    const totalVolume = existingVolume + newPackagesVolume;
    const percentage = (totalVolume / truckVolume) * 100;
    
    console.log("Volume calculation:", {
      existingVolume,
      newPackagesVolume,
      truckVolume,
      totalVolume,
      percentage: Math.round(percentage) + "%"
    });

    /* 
     Check if assignment would exceed capacity... should also implement check for the height and width of the packages in the future.... Weight should also be considered!
     */
     
    if (percentage > 100) {
      console.log("Assignment would exceed truck capacity");
      return res.status(400).json({
        error: "Assignment would exceed truck capacity",
        details: {
          truckId: truck.id,
          truckVolume,
          currentUsage: Math.round((existingVolume / truckVolume) * 100),
          requiredVolume: Math.round(percentage),
          availableSpace: Math.round(truckVolume - existingVolume)
        }
      });
    }

    /* 
     Not sure how to handle the "next day" stuff yet... The requirement says packages should wait till next day if they can't fill 80% of any truck. Should probably add some status to packages like WAITING, LOADED, etc
     Do we need to track which day it is? 🤔
     */

    /* Assign packages */
    console.log("Starting package assignments...");
    await Promise.all(packageIds.map(packageId => 
      prisma.truckPackageAssignment.create({
        data: { truckId: truck.id, packageId }
      })
    ));
    console.log("Finished assigning packages");

    /* 
    Update truck status. Not completely sure how to add a delay status to the truck at the end of the day... 
    */

    await prisma.truck.update({
      where: { id: truck.id },
      data: {
        isReadyForShipping: percentage >= 80,
        isFull: percentage >= 99.9
      }
    });
    console.log("Updated truck status - Ready for shipping:", percentage >= 80, "Full:", percentage >= 99.9);

    res.json({
      message: "Packages assigned",
      truckId: truck.id,
      volumeUsage: Math.round(percentage)
    });
  } catch (err) {
    console.error("Error in assignment:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router; 