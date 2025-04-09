# Shipment Control API

A simple API for managing trucks and package assignments.

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

## API Endpoints

### Trucks
- `POST /trucks` - Create a new truck
- `GET /trucks` - List all trucks

### Packages
- `POST /packages` - Create a new package
- `GET /packages` - List all packages

### Assignments
- `POST /assign` - Assign packages to a truck

## Example Requests

### Create a Truck
```bash
POST http://localhost:3000/trucks
{
    "length": 10,
    "width": 5,
    "height": 3
}
```

### Create a Package
```bash
POST http://localhost:3000/packages
{
    "length": 2,
    "width": 2,
    "height": 2
}
```

### Assign Packages
```bash
POST http://localhost:3000/assign
{
    "packageIds": [1, 2, 3]
}
```

## Notes
- Trucks are marked as ready for shipping when they reach 80% capacity
- Trucks are marked as full at 99.9% capacity
- The "delayed until next day" feature for packages that can't fill 80% of any truck is not implemented yet 