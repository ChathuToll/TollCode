const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://toll-roster-frontend.onrender.com', 'https://toll-roster.onrender.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://tollroster_db_user:I18ubBVvF9pvmVAd@tollrosters.33qlsbs.mongodb.net/?retryWrites=true&w=majority&appName=TollRosters";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

const employeeSchema = new mongoose.Schema({
  Employee: String,
  Status: String,
  WorkingSite: String,
  Type: String,
  Department: String,
  Supervisor: String,
  Monday: String,
  Tuesday: String,
  Wednesday: String,
  Thursday: String,
  Friday: String,
  Competencies: [String]
});

const Employee = mongoose.model("Employee", employeeSchema);

const departmentSchema = new mongoose.Schema({
  name: String,
  roles: [String],
  requiredStaff: Number
});

const Department = mongoose.model("Department", departmentSchema);

const shiftSchema = new mongoose.Schema({
  employeeId: String,
  employeeName: String,
  department: String,
  role: String,
  day: String,
  startTime: String,
  endTime: String,
  weekStart: Date,
  status: { type: String, default: "allocated" }
});

const Shift = mongoose.model("Shift", shiftSchema);

app.get("/api/departments", async (req, res) => {
  try {
    const departments = await Department.find();
    if (departments.length === 0) {
      const defaultDepartments = [
        { name: "Inbound", roles: ["Receiving", "Packing", "Inventory Management"], requiredStaff: 12 },
        { name: "Inventory", roles: ["Stock Auditing", "Forklift Operation", "Labeling"], requiredStaff: 10 },
        { name: "Outbound", roles: ["Shipping", "Packing", "Inventory Management"], requiredStaff: 15 }
      ];
      await Department.insertMany(defaultDepartments);
      res.json(defaultDepartments);
    } else {
      res.json(departments);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/shifts", async (req, res) => {
  try {
    const { weekStart, department } = req.query;
    let query = {};
    
    if (weekStart) {
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      
      query.weekStart = { 
        $gte: startDate, 
        $lte: endDate 
      };
    }
    
    if (department) query.department = department;
    
    console.log('Shifts query:', query);
    const shifts = await Shift.find(query);
    console.log('Found shifts:', shifts.length);
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/shifts", async (req, res) => {
  try {
    const shift = new Shift(req.body);
    await shift.save();
    res.status(201).json(shift);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/shifts/:id", async (req, res) => {
  try {
    const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shift) {
      return res.status(404).json({ error: "Shift not found" });
    }
    res.json(shift);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/shifts/:id", async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);
    if (!shift) {
      return res.status(404).json({ error: "Shift not found" });
    }
    res.json({ message: "Shift deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/shifts/week/:weekStart", async (req, res) => {
  try {
    console.log('Received weekStart parameter:', req.params.weekStart);
    
    const weekStart = new Date(req.params.weekStart);
    console.log('Parsed weekStart date:', weekStart);
    
    if (isNaN(weekStart.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }
    
    const startOfWeek = new Date(weekStart);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(weekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    console.log('Searching for shifts between:', startOfWeek, 'and', endOfWeek);
    
    const result = await Shift.deleteMany({ 
      weekStart: { 
        $gte: startOfWeek, 
        $lte: endOfWeek 
      } 
    });
    
    console.log('Delete result:', result);
    
    res.json({ 
      message: `Deleted ${result.deletedCount} shifts for the week starting ${weekStart.toDateString()}`,
      deletedCount: result.deletedCount,
      weekStart: weekStart.toISOString()
    });
  } catch (error) {
    console.error('Error deleting shifts by week:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/employees", async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/allocate-shifts", async (req, res) => {
  try {
    const { weekStart } = req.body;
    const startDate = new Date(weekStart);
    
    await Shift.deleteMany({ weekStart: startDate });
    
    const employees = await Employee.find({ Status: "Active" });
    const departments = await Department.find();
    
    const shifts = [];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    
    for (const employee of employees) {
      for (const day of days) {
        const shiftTime = employee[day];
        if (shiftTime && shiftTime !== "Off") {
          const [startTime, endTime] = shiftTime.split(" - ");
          const role = employee.Competencies[0];
          
          shifts.push({
            employeeId: employee._id,
            employeeName: employee.Employee,
            department: employee.Department,
            role: role,
            day: day,
            startTime: startTime.trim(),
            endTime: endTime.trim(),
            weekStart: startDate,
            status: "allocated"
          });
        }
      }
    }
    
    await Shift.insertMany(shifts);
    res.json({ message: `Allocated ${shifts.length} shifts`, shifts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/daily-counts", async (req, res) => {
  try {
    const { date, department } = req.query;
    const targetCount = 37;
    
    let query = {};
    if (date) {
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
      query.day = dayOfWeek;
    }
    if (department) query.department = department;
    
    const shifts = await Shift.find(query);
    const allocatedCount = shifts.length;
    
    res.json({
      allocatedCount,
      targetCount,
      difference: allocatedCount - targetCount,
      percentage: Math.round((allocatedCount / targetCount) * 100)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/weekly-dashboard", async (req, res) => {
  try {
    const { weekStart } = req.query;
    
    let shifts;
    if (weekStart) {
      const startDate = new Date(weekStart);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      
      const allShifts = await Shift.find({});
      shifts = allShifts.filter(shift => {
        const shiftDate = new Date(shift.weekStart);
        const weekStartDate = new Date(startDate);
        return shiftDate.toDateString() === weekStartDate.toDateString();
      });
    } else {
      shifts = await Shift.find({});
    }
    
    if (shifts.length === 0) {
      return res.json([]);
    }
    
    const dashboard = {};
    
    shifts.forEach(shift => {
      const key = `${shift.employeeName}_${shift.department}`;
      if (!dashboard[key]) {
        dashboard[key] = {
          employeeName: shift.employeeName,
          department: shift.department,
          roles: {},
          totalHours: 0
        };
      }
      
      if (!dashboard[key].roles[shift.role]) {
        dashboard[key].roles[shift.role] = 0;
      }
      
      const parseTime = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split('.');
        let hour24 = parseInt(hours);
        
        if (period === 'pm' && hour24 !== 12) {
          hour24 += 12;
        } else if (period === 'am' && hour24 === 12) {
          hour24 = 0;
        }
        
        return hour24 + (parseInt(minutes) / 60);
      };
      
      const startHour = parseTime(shift.startTime);
      const endHour = parseTime(shift.endTime);
      const hours = endHour - startHour;
      
      dashboard[key].roles[shift.role] += hours;
      dashboard[key].totalHours += hours;
    });
    
    res.json(Object.values(dashboard));
  } catch (error) {
    console.error('Weekly dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api", (req, res) => {
  res.json({ message: "Toll Roster API is running!" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
