const express = require('express');
const { google } = require('googleapis');
// const dotenv = require('dotenv');
const { validateEnv } = require('./config/env');
const cors = require("cors");
const authRoutes = require('./routes/auth');
const cloudinary = require("cloudinary").v2;

///// Contractor Api call
const RequirementForm = require('./All_Fms_Api/RequirementForm')

/// Contractor  Billing  Apis

const Bill_Tally_form = require('./All_Fms_Api/Contractor_Billing/Bill_Tally_form')
const Bill_Checked = require('./All_Fms_Api/Contractor_Billing/Bill_Checked')
const Bill_Checked_Office = require('./All_Fms_Api/Contractor_Billing/Bill_Checked_Office')

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());
app.use(cors()); // Allow requests from React frontend
app.use(express.json());
validateEnv();

// ///////  cloudinary setup /////////

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// //////  Alll api call//////////

app.use('/api', authRoutes);
app.use('/api',RequirementForm)

// Contractor Billing 

app.use('/api',Bill_Tally_form)
app.use('/api',Bill_Checked)
app.use('/api',Bill_Checked_Office)
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});