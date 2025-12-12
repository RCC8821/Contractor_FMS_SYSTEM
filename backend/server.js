

// server.js
const express = require('express');
const { google } = require('googleapis');
const { validateEnv } = require('./config/env');
const cors = require("cors");

// Routes
const authRoutes = require('./routes/auth');
const cloudinary = require("cloudinary").v2;

// Contractor Selection APIs
const RequirementForm = require('./All_Fms_Api/Contractor_Selection/RequirementForm');
const Approval_For_Meeting = require("./All_Fms_Api/Contractor_Selection/Approval_For_Meeting")
const First_Meeting_Attend = require ('./All_Fms_Api/Contractor_Selection/1st_Meeting_Attend')
const Get_Meeting_Mom = require('./All_Fms_Api/Contractor_Selection/Meeting_Mom')
////// billing APIs 
const Bill_Tally_form = require('./All_Fms_Api/Contractor_Billing/Bill_Tally_form');
const Bill_Checked = require('./All_Fms_Api/Contractor_Billing/Bill_Checked');
const Bill_Checked_Office = require('./All_Fms_Api/Contractor_Billing/Bill_Checked_Office');

/// Payment APIs
const BILL_FINAL_BY_OFFICE = require('./All_Fms_Api/Payment/BILL_FINAL_BY_OFFICE');
const Payment_final_bill_Checked = require('./All_Fms_Api/Payment/Payment_FINAL_BILL_CHECKED');
const Final_bill_Checked_AshokSir = require('./All_Fms_Api/Payment/Final_Bill_Check_By_AshokSir')
const GetPayment = require('./All_Fms_Api/Payment/Payment')


const app = express();
// 1. CORS (Pehle daalo)
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // Ya 'http://localhost:3000'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. Body Parsing (Sirf Ek Baar + 10MB Limit)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Handle OPTIONS Preflight (Safe & Working)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  next();
});

// 4. Validate Environment
validateEnv();

// 5. Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 6. Routes
app.use('/api', authRoutes);
app.use('/api', RequirementForm);
app.use('/api',Approval_For_Meeting)
app.use('/api',First_Meeting_Attend)
app.use('/api',Get_Meeting_Mom)
////////// Billing 
app.use('/api', Bill_Tally_form);
app.use('/api', Bill_Checked);
app.use('/api', Bill_Checked_Office);

/// Payment
app.use('/api', BILL_FINAL_BY_OFFICE);
app.use('/api',Payment_final_bill_Checked)
app.use('/api',Final_bill_Checked_AshokSir)
app.use('/api',GetPayment)
// 7. Health Check
app.get('/', (req, res) => {
  res.json({ message: 'FMS Backend Running!', time: new Date().toISOString() });
});

// 8. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`CORS enabled for: ${process.env.CLIENT_URL || 'all origins'}`);
});

