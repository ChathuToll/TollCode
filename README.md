# Toll Roster Management System
### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## API Endpoints

- `GET /api/employees` - List all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/shifts` - List shifts
- `POST /api/shifts` - Create shift
- `POST /api/allocate-shifts` - Auto allocate shifts
- `GET /api/daily-counts` - Get daily head counts
- `GET /api/weekly-dashboard` - Get weekly hours dashboard

## Database

The application uses MongoDB Atlas with the following collections:
- `employees` - Employee information
- `departments` - Department configurations
- `shifts` - Shift allocations
