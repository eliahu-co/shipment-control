# Shipment Control API

A simple API for managing trucks and package assignments.

## System Architecture

![System Diagram](https://www.mermaidchart.com/raw/a3dc7c47-c5ee-45e2-8963-be22f32ebe38?theme=light&version=v0.1&format=svg)

### Data Models
- **Truck**: id, length, width, height, isFull, isReadyForShipping
- **Package**: id, length, width, height
- **TruckPackageAssignment**: truckId, packageId

### Current Assignment Flow
1. Receive request with package IDs
2. Check if packages exist and aren't already assigned
3. Find available truck
4. Calculate total volume
5. Check if volume <= 100%
6. If volume >= 80%, mark as ready for shipping
7. Assign packages and update truck status

### Error Handling
- Invalid dimensions (negative/missing)
- No available trucks
- Package already assigned
- Truck capacity exceeded

### Future Improvements
- Package weight limits
- Truck weight capacity
- Individual dimension checks (height/width constraints)
- "Delayed until next day" for packages that can't fill 80%
- Check all available trucks instead of first match
- Package status tracking (PENDING, ASSIGNED, DELAYED)
- Date tracking for delayed packages
- Optimal package arrangement in truck space

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your database connection:
```
DATABASE_URL="postgresql://user:password@localhost:5432/shipment_control"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the server:
```bash
npm run dev
```

## API Reference

### Trucks
`POST /trucks` - Create a new truck
```json
{
    "length": 10,
    "width": 5,
    "height": 3
}
```

### Packages
`POST /packages` - Create a new package
```json
{
    "length": 2,
    "width": 2,
    "height": 2
}
```

### Assignments
`POST /assign` - Assign packages to a truck
```json
{
    "packageIds": [1, 2, 3]
}
```

All endpoints return appropriate HTTP status codes and error messages when needed. Use `GET /trucks` and `GET /packages` to list existing items.

## Notes
- Trucks are marked as ready for shipping when they reach 80% capacity
- Trucks are marked as full at 99.9% capacity
- The "delayed until next day" feature for packages that can't fill 80% of any truck is not implemented yet 