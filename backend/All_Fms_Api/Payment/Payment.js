const express = require("express");
const { sheets, spreadsheetId } = require("../../config/googleSheet");
const router = express.Router();

router.get("/Get-Payment", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Contractor_Payment_FMS!A7:BE",
    });

    let rows = response.data.values || [];

    // Skip header row (Row 7 is header)
    if (rows.length > 0) {
      rows = rows.slice(1);
    }

    const filteredData = rows
      .filter((row) => {
        // Row में कम से कम 28 कॉलम्स होने चाहिए (A to AB)
        // if (row.length < 28) return false;

        const planned7 = (row[47] || "").toString().trim(); // Column AA → PLANNED_6
        const actual7 = (row[48] || "").toString().trim(); // Column AB → ACTUAL_6

        // Filter: PLANNED_6 filled AND ACTUAL_6 empty
        return planned7 !== "" && actual7 === "";
      })
      .map((row) => ({
        rccBillNo: row[1] || "",
        projectId: row[2] || "",
        projectName: row[3] || "",
        siteEngineer: row[4] || "",
        contractorName: row[5] || "",
        firmName: row[6] || "",
        workName: row[7] || "",
        contractorBillNo: row[8] || "",
        billDate: row[9] || "",
        billUrl: row[10] || "",
        PreviousBillUrl: row[11] || "",
        measurementSheetUrl: row[12] || "",
        attendanceSheetUrl: row[13] || "",
        rccSummarySheetNo: row[14] || "",
        rccSummarySheetUrl: row[15] || "",
        WorkOrderNo: row[16] || "",
        workOrderUrl: row[17] || "",
        WorkOrderValue: row[18] || "",
        billAmount: row[19] || "",
        NETAMOUNTCurrentAmount: row[26] || "",
        PreviousBillAmount: row[27] || "",
        UPToDatePaidAmount: row[28] || "",
        BalanceAmount: row[29] || "",
        remark: row[39] || "",
        planned7: row[47] || "",
        actual7: row[48] || "",
      }));

    // Unique contractor names aur firm names ke combinations extract karo (filtered data se)
    // Yeh duplicates remove karega based on contractorName + firmName
    const uniqueContractors = [];
    const seen = new Set();
    filteredData.forEach(item => {
      const key = `${item.contractorName}||${item.firmName}`;
      if (!seen.has(key) && item.contractorName !== "" && item.firmName !== "") {
        seen.add(key);
        uniqueContractors.push({
          contractorName: item.contractorName,
          firmName: item.firmName
        });
      }
    });
    // Sort karo (optional, contractorName ke basis pe)
    uniqueContractors.sort((a, b) => a.contractorName.localeCompare(b.contractorName));

    res.json({
      success: true,
      message: "Pending final bills fetched successfully",
      count: filteredData.length,
      data: filteredData,
      uniqueContractors: uniqueContractors,  // Yeh ab array of objects hai: [{ contractorName: "Name", firmName: "Firm" }, ...]
    });

  } catch (error) {
    console.error("Error in /Get-Payment", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch data",
      details: error.message,
    });
  }
});

module.exports = router;
