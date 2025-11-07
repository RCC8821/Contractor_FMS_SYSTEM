// import React, { useState, useEffect } from 'react';
// import { Search, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
// import {
//   useLazyGetProjectDropdownDataQuery,
//   useGetContractorBillCheckedQuery,
// } from '../../features/billing/billCheckedSlice';

// const Bill_Checked = () => {
//   // === RTK Hooks ===
//   const [triggerDropdown, { data: dropdownResponse, isLoading: loadingDropdown }] =
//     useLazyGetProjectDropdownDataQuery();

//   const dropdownData = {
//     projectIds: dropdownResponse?.projectIds || [],
//     contractorNames: dropdownResponse?.contractorNames || [],
//   };

//   const {
//     data: billData = { data: [] },
//     isLoading: loadingBills,
//     isError: billError,
//   } = useGetContractorBillCheckedQuery();

//   // === State ===
//   const [projectId, setProjectId] = useState('');
//   const [contractorName, setContractorName] = useState('');
//   const [filteredBills, setFilteredBills] = useState([]);
//   const [formData, setFormData] = useState({});
//   const [fetchClicked, setFetchClicked] = useState(false);

//   // === Load Dropdown Data ===
//   useEffect(() => {
//     triggerDropdown();
//   }, []);

//   // === Debug: Log bill data when it loads ===
//   useEffect(() => {
//     console.log('Bill Data Loaded:', billData);
//   }, [billData]);

//   // === Handle Fetch ===
//   const handleFetchData = () => {
//     if (!projectId || !contractorName) {
//       alert('Please select both Project ID and Contractor Name');
//       return;
//     }

//     console.log('Searching for:', { projectId, contractorName });
//     console.log('Available Bills:', billData.data);

//     // MATCH karo - data types ko ensure karo
//     const matches = billData.data.filter((row) => {
//       const rowProjectId = String(row.projectId).trim();
//       const rowContractor = String(row.contractorName).trim();
//       const selectedProject = String(projectId).trim();
//       const selectedContractor = String(contractorName).trim();

//       const isMatch =
//         rowProjectId === selectedProject && rowContractor === selectedContractor;

//       if (isMatch) {
//         console.log('✓ Match found:', row.UID, row.workName);
//       }

//       return isMatch;
//     });

//     console.log('Total Matches:', matches.length);

//     if (matches.length === 0) {
//       alert('No bills found for this combination!');
//       setFetchClicked(true);
//       setFilteredBills([]);
//       return;
//     }

//     setFetchClicked(true);
//     setFilteredBills(matches);

//     // Initialize form data for each bill
//     const initForm = {};
//     matches.forEach((row) => {
//       initForm[row.UID] = {
//         measurementUrl2: null,
//         attendanceUrl2: null,
//       };
//     });
//     setFormData(initForm);
//   };

//   // === File Upload ===
//   const handleFileChange = (uid, field, file) => {
//     setFormData((prev) => ({
//       ...prev,
//       [uid]: { ...prev[uid], [field]: file },
//     }));
//   };

//   // === Submit ===
//   const handleSubmit = () => {
//     const payload = filteredBills.map((row) => ({
//       UID: row.UID,
//       projectId: row.projectId,
//       measurementUrl2: formData[row.UID]?.measurementUrl2,
//       attendanceUrl2: formData[row.UID]?.attendanceUrl2,
//     }));
//     console.log('Submit Payload:', payload);
//     alert('Submitted successfully!');
//   };

//   // === Loading & Error States ===
//   if (loadingBills || loadingDropdown) {
//     return (
//       <div style={{ padding: '2rem', textAlign: 'center' }}>
//         <p style={{ color: '#6c757d' }}>Loading data...</p>
//       </div>
//     );
//   }

//   if (billError) {
//     return (
//       <div style={{ padding: '2rem', textAlign: 'center' }}>
//         <AlertCircle size={48} color="#dc3545" />
//         <p style={{ color: '#dc3545' }}>Error loading bill data.</p>
//       </div>
//     );
//   }

//   // === Main Return ===
//   return (
//     <div style={{ padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
//       <div style={{ marginBottom: '2rem' }}>
//         <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem', fontWeight: '600' }}>
//           Bill Checked - Data Entry
//         </h2>
//         <p style={{ margin: 0, color: '#6c757d' }}>
//           Select Project ID and Contractor to view bills
//         </p>
//       </div>

//       {/* Search Section */}
//       <div
//         style={{
//           backgroundColor: '#fff',
//           padding: '1.5rem',
//           borderRadius: '8px',
//           marginBottom: '1.5rem',
//           border: '1px solid #dee2e6',
//           boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
//         }}
//       >
//         <h3 style={{ margin: '0 0 1.25rem', fontWeight: '600', color: '#495057' }}>
//           Search Criteria
//         </h3>

//         <div
//           style={{
//             display: 'grid',
//             gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
//             gap: '1rem',
//             marginBottom: '1.25rem',
//           }}
//         >
//           {/* Project ID Dropdown */}
//           <div>
//             <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
//               Project ID * ({dropdownData.projectIds?.length || 0})
//             </label>
//             <select
//               value={projectId}
//               onChange={(e) => setProjectId(e.target.value)}
//               style={{
//                 width: '100%',
//                 padding: '0.6rem 0.75rem',
//                 fontSize: '0.95rem',
//                 border: '1px solid #ced4da',
//                 borderRadius: '6px',
//               }}
//             >
//               <option value="">-- Select Project ID --</option>
//               {dropdownData.projectIds.map((id) => (
//                 <option key={id} value={id}>
//                   {id}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Contractor Name Dropdown */}
//           <div>
//             <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
//               Contractor Name * ({dropdownData.contractorNames?.length || 0})
//             </label>
//             <select
//               value={contractorName}
//               onChange={(e) => setContractorName(e.target.value)}
//               style={{
//                 width: '100%',
//                 padding: '0.6rem 0.75rem',
//                 fontSize: '0.95rem',
//                 border: '1px solid #ced4da',
//                 borderRadius: '6px',
//               }}
//             >
//               <option value="">-- Select Contractor --</option>
//               {dropdownData.contractorNames.map((name) => (
//                 <option key={name} value={name}>
//                   {name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <button
//           onClick={handleFetchData}
//           style={{
//             display: 'inline-flex',
//             alignItems: 'center',
//             gap: '0.5rem',
//             padding: '0.65rem 1.5rem',
//             backgroundColor: '#0d6efd',
//             color: 'white',
//             border: 'none',
//             borderRadius: '6px',
//             fontWeight: '500',
//             cursor: 'pointer',
//           }}
//         >
//           <Search size={18} />
//           Fetch Bills
//         </button>
//       </div>

//       {/* Results */}
//       {fetchClicked && (
//         filteredBills.length > 0 ? (
//           <div>
//             <div
//               style={{
//                 backgroundColor: '#d1ecf1',
//                 padding: '0.75rem 1rem',
//                 borderRadius: '6px',
//                 marginBottom: '1.25rem',
//                 color: '#0c5460',
//                 fontWeight: '500',
//               }}
//             >
//               {filteredBills.length} Bill(s) Found
//             </div>

//             {filteredBills.map((row, i) => (
//               <div
//                 key={row.UID}
//                 style={{
//                   backgroundColor: '#fff',
//                   border: '1px solid #dee2e6',
//                   borderRadius: '8px',
//                   marginBottom: '1.25rem',
//                   overflow: 'hidden',
//                 }}
//               >
//                 <div
//                   style={{
//                     backgroundColor: '#f8f9fa',
//                     padding: '1rem',
//                     borderBottom: '1px solid #dee2e6',
//                   }}
//                 >
//                   <div
//                     style={{
//                       display: 'flex',
//                       justifyContent: 'space-between',
//                       alignItems: 'center',
//                     }}
//                   >
//                     <div>
//                       <div style={{ fontWeight: '600' }}>UID: {row.UID}</div>
//                       <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
//                         {row.workName}
//                       </div>
//                     </div>
//                     <span
//                       style={{
//                         background: '#0d6efd',
//                         color: 'white',
//                         padding: '0.3rem 0.8rem',
//                         borderRadius: '20px',
//                         fontSize: '0.8rem',
//                       }}
//                     >
//                       Bill #{i + 1}
//                     </span>
//                   </div>
//                 </div>

//                 <div style={{ padding: '1.25rem' }}>
//                   <div
//                     style={{
//                       display: 'grid',
//                       gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
//                       gap: '0.8rem',
//                       backgroundColor: '#f8f9fa',
//                       padding: '0.75rem',
//                       borderRadius: '6px',
//                       marginBottom: '1rem',
//                     }}
//                   >
//                     <div>
//                       <strong>Project:</strong> {row.projectId}
//                     </div>
//                     <div>
//                       <strong>Contractor:</strong> {row.contractorName}
//                     </div>
//                     <div>
//                       <strong>Bill No:</strong> {row.billNo}
//                     </div>
//                     <div>
//                       <strong>Amount:</strong> ₹{row.amount}
//                     </div>
//                   </div>

//                   <div
//                     style={{
//                       display: 'grid',
//                       gridTemplateColumns: '1fr 1fr',
//                       gap: '1rem',
//                     }}
//                   >
//                     <div>
//                       <label
//                         style={{
//                           display: 'flex',
//                           alignItems: 'center',
//                           gap: '0.4rem',
//                           fontWeight: '500',
//                           marginBottom: '0.5rem',
//                         }}
//                       >
//                         <FileText size={16} color="#0d6efd" />
//                         Measurement Sheet 2
//                       </label>
//                       <div
//                         style={{
//                           border: '2px dashed #dee2e6',
//                           borderRadius: '6px',
//                           padding: '1rem',
//                           textAlign: 'center',
//                           position: 'relative',
//                           backgroundColor: '#f8f9fa',
//                           cursor: 'pointer',
//                         }}
//                       >
//                         <input
//                           type="file"
//                           accept="image/*,.pdf"
//                           onChange={(e) =>
//                             handleFileChange(row.UID, 'measurementUrl2', e.target.files[0])
//                           }
//                           style={{
//                             position: 'absolute',
//                             inset: 0,
//                             opacity: 0,
//                             cursor: 'pointer',
//                           }}
//                         />
//                         <Upload size={20} color="#0d6efd" />
//                         <div
//                           style={{
//                             fontSize: '0.85rem',
//                             color: '#6c757d',
//                             marginTop: '0.4rem',
//                           }}
//                         >
//                           {formData[row.UID]?.measurementUrl2?.name || 'Click to upload'}
//                         </div>
//                       </div>
//                     </div>

//                     <div>
//                       <label
//                         style={{
//                           display: 'flex',
//                           alignItems: 'center',
//                           gap: '0.4rem',
//                           fontWeight: '500',
//                           marginBottom: '0.5rem',
//                         }}
//                       >
//                         <FileText size={16} color="#6610f2" />
//                         Attendance Sheet 2
//                       </label>
//                       <div
//                         style={{
//                           border: '2px dashed #dee2e6',
//                           borderRadius: '6px',
//                           padding: '1rem',
//                           textAlign: 'center',
//                           position: 'relative',
//                           backgroundColor: '#f8f9fa',
//                           cursor: 'pointer',
//                         }}
//                       >
//                         <input
//                           type="file"
//                           accept="image/*,.pdf"
//                           onChange={(e) =>
//                             handleFileChange(row.UID, 'attendanceUrl2', e.target.files[0])
//                           }
//                           style={{
//                             position: 'absolute',
//                             inset: 0,
//                             opacity: 0,
//                             cursor: 'pointer',
//                           }}
//                         />
//                         <Upload size={20} color="#6610f2" />
//                         <div
//                           style={{
//                             fontSize: '0.85rem',
//                             color: '#6c757d',
//                             marginTop: '0.4rem',
//                           }}
//                         >
//                           {formData[row.UID]?.attendanceUrl2?.name || 'Click to upload'}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}

//             <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
//               <button
//                 onClick={handleSubmit}
//                 style={{
//                   padding: '0.75rem 2rem',
//                   backgroundColor: '#198754',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '6px',
//                   fontWeight: '500',
//                   display: 'inline-flex',
//                   alignItems: 'center',
//                   gap: '0.5rem',
//                   cursor: 'pointer',
//                 }}
//               >
//                 <CheckCircle size={20} />
//                 Submit All
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div
//             style={{
//               textAlign: 'center',
//               padding: '2.5rem',
//               backgroundColor: '#fff3cd',
//               border: '1px solid #ffc107',
//               borderRadius: '8px',
//               color: '#856404',
//             }}
//           >
//             <AlertCircle size={40} style={{ marginBottom: '0.75rem' }} />
//             <p>No bills found for selected combination</p>
//           </div>
//         )
//       )}
//     </div>
//   );
// };

// export default Bill_Checked;




import React, { useState, useEffect } from 'react';
import { Search, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import {
  useLazyGetProjectDropdownDataQuery,
  useGetContractorBillCheckedQuery,
} from '../../features/billing/billCheckedSlice';

const Bill_Checked = () => {
  // === RTK Hooks ===
  const [triggerDropdown, { data: dropdownResponse, isLoading: loadingDropdown }] =
    useLazyGetProjectDropdownDataQuery();

  const dropdownData = {
    projectIds: dropdownResponse?.projectIds || [],
    contractorNames: dropdownResponse?.contractorNames || [],
  };

  const {
    data: billData = { data: [] },
    isLoading: loadingBills,
    isError: billError,
  } = useGetContractorBillCheckedQuery();

  // === State ===
  const [projectId, setProjectId] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [filteredBills, setFilteredBills] = useState([]);
  const [formData, setFormData] = useState({});
  const [fetchClicked, setFetchClicked] = useState(false);

  // === Load Dropdown Data ===
  useEffect(() => {
    triggerDropdown();
  }, []);

  // === Handle Fetch ===
  const handleFetchData = () => {
    if (!projectId || !contractorName) {
      alert('Please select both Project ID and Contractor Name');
      return;
    }

    console.log('Searching for:', { projectId, contractorName });
    console.log('Available Bills:', billData.data);

    // MATCH karo - data types ko ensure karo
    const matches = billData.data.filter((row) => {
      const rowProjectId = String(row.projectId).trim();
      const rowContractor = String(row.contractorName).trim();
      const selectedProject = String(projectId).trim();
      const selectedContractor = String(contractorName).trim();

      const isMatch =
        rowProjectId === selectedProject && rowContractor === selectedContractor;

      if (isMatch) {
        console.log('✓ Match found:', row.UID, row.workName);
      }

      return isMatch;
    });

    console.log('Total Matches:', matches.length);

    if (matches.length === 0) {
      alert('No bills found for this combination!');
      setFetchClicked(true);
      setFilteredBills([]);
      return;
    }

    setFetchClicked(true);
    setFilteredBills(matches);

    // Initialize form data for each bill
    const initForm = {};
    matches.forEach((row) => {
      initForm[row.UID] = {
        areaQuantity2: '',
        unit2: '',
        qualityApprove2: '',
        photoEvidence2: '',
        measurementUrl2: null,
        attendanceUrl2: null,
      };
    });
    setFormData(initForm);
  };

  // === File Upload ===
  const handleFileChange = (uid, field, file) => {
    setFormData((prev) => ({
      ...prev,
      [uid]: { ...prev[uid], [field]: file },
    }));
  };

  // === Input Change ===
  const handleInputChange = (uid, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [uid]: { ...prev[uid], [field]: value },
    }));
  };

  // === Submit ===
  const handleSubmit = () => {
    const payload = filteredBills.map((row) => ({
      UID: row.UID,
      projectId: row.projectId,
      areaQuantity2: formData[row.UID]?.areaQuantity2,
      unit2: formData[row.UID]?.unit2,
      qualityApprove2: formData[row.UID]?.qualityApprove2,
      photoEvidence2: formData[row.UID]?.photoEvidence2,
      remarks2: formData[row.UID]?.remarks2,
      measurementUrl2: formData[row.UID]?.measurementUrl2,
      attendanceUrl2: formData[row.UID]?.attendanceUrl2,
    }));
    console.log('Submit Payload:', payload);
    alert('Submitted successfully!');
  };

  // === Loading & Error States ===
  if (loadingBills || loadingDropdown) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#6c757d' }}>Loading data...</p>
      </div>
    );
  }

  if (billError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertCircle size={48} color="#dc3545" />
        <p style={{ color: '#dc3545' }}>Error loading bill data.</p>
      </div>
    );
  }

  // === Main Return ===
  return (
    <div style={{ padding: '1.5rem', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem', fontWeight: '600' }}>
          Bill Checked - Data Entry
        </h2>
        <p style={{ margin: 0, color: '#6c757d' }}>
          Select Project ID and Contractor to view bills
        </p>
      </div>

      {/* Search Section */}
      <div style={{
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid #dee2e6',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ margin: '0 0 1.25rem', fontWeight: '600', color: '#495057' }}>
          Search Criteria
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}>
          {/* Project ID Dropdown */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Project ID * ({dropdownData.projectIds?.length || 0})
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                fontSize: '0.95rem',
                border: '1px solid #ced4da',
                borderRadius: '6px',
              }}
            >
              <option value="">-- Select Project ID --</option>
              {dropdownData.projectIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>

          {/* Contractor Name Dropdown */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Contractor Name * ({dropdownData.contractorNames?.length || 0})
            </label>
            <select
              value={contractorName}
              onChange={(e) => setContractorName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                fontSize: '0.95rem',
                border: '1px solid #ced4da',
                borderRadius: '6px',
              }}
            >
              <option value="">-- Select Contractor --</option>
              {dropdownData.contractorNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleFetchData}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.5rem',
            backgroundColor: '#0d6efd',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          <Search size={18} />
          Fetch Bills
        </button>
      </div>

      {/* Results */}
      {fetchClicked && (
        filteredBills.length > 0 ? (
          <div>
            {/* Bill Details Section - एक बार सभी bills के लिए */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              marginBottom: '2rem',
              border: '1px solid #dee2e6',
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                backgroundColor: '#0d6efd',
                color: 'white',
                padding: '1rem',
                fontWeight: '600',
                fontSize: '1.1rem',
              }}>
                Bill Details - {filteredBills.length} Bill(s) Found
              </div>

              {/* Bills List */}
              <div style={{ padding: '1.5rem' }}>
                {filteredBills.map((row, idx) => (
                  <div key={row.UID} style={{
                    marginBottom: idx !== filteredBills.length - 1 ? '1.5rem' : 0,
                    paddingBottom: idx !== filteredBills.length - 1 ? '1.5rem' : 0,
                    borderBottom: idx !== filteredBills.length - 1 ? '1px solid #dee2e6' : 'none',
                  }}>
                    <div style={{
                      fontWeight: '600',
                      marginBottom: '0.75rem',
                      color: '#495057',
                      fontSize: '1rem',
                    }}>
                      Bill #{idx + 1} - {row.workName}
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                    }}>
                      <div><strong>Project ID:</strong> {row.projectId}</div>
                      <div><strong>Project Name:</strong> {row.projectName}</div>
                      <div><strong>Site Engineer:</strong> {row.siteEngineer}</div>
                      <div><strong>Contractor:</strong> {row.contractorName}</div>
                      <div><strong>Firm:</strong> {row.firmName}</div>
                      <div><strong>Description:</strong> {row.workDesc}</div>
                      <div><strong>Qty:</strong> {row.quantity} {row.unit}</div>
                      <div><strong>Rate:</strong> ₹{row.rate}</div>
                      <div><strong>Amount:</strong> ₹{row.amount}</div>
                      <div><strong>Bill No:</strong> {row.billNo}</div>
                      <div><strong>Bill Date:</strong> {row.billDate}</div>
                      <div><strong>Remark:</strong> {row.remark}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Entry Section - एक बार, table format में */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                backgroundColor: '#198754',
                color: 'white',
                padding: '1rem',
                fontWeight: '600',
                fontSize: '1.1rem',
              }}>
                Data Entry Section
              </div>

              {/* Table */}
              <div style={{ padding: '1.5rem', overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.9rem',
                }}>
                  <thead>
  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>UID</th>
    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Area/Qty 2</th>
    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Unit 2</th>
    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Quality Approve 2</th>
    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Photo Evidence 2</th>
    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Remarks 2</th>
  </tr>
</thead>
                 <tbody>
  {filteredBills.map((row, idx) => (
    <tr key={row.UID} style={{ borderBottom: '1px solid #dee2e6' }}>
      {/* UID */}
      <td style={{ padding: '0.75rem', fontWeight: '600' }}>
        {row.UID}
      </td>

      {/* Area/Qty 2 - Number Input */}
      <td style={{ padding: '0.75rem' }}>
        <input
          type="number"
          value={formData[row.UID]?.areaQuantity2 || ''}
          onChange={(e) => handleInputChange(row.UID, 'areaQuantity2', e.target.value)}
          placeholder="Qty"
          style={{
            width: '100%',
            padding: '0.4rem',
            fontSize: '0.85rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
          }}
        />
      </td>

      {/* Unit 2 */}
      <td style={{ padding: '0.75rem' }}>
        <input
          type="text"
          value={formData[row.UID]?.unit2 || ''}
          onChange={(e) => handleInputChange(row.UID, 'unit2', e.target.value)}
          placeholder="Unit"
          style={{
            width: '100%',
            padding: '0.4rem',
            fontSize: '0.85rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
          }}
        />
      </td>

      {/* Quality Approve 2 */}
      <td style={{ padding: '0.75rem' }}>
        <input
          type="text"
          value={formData[row.UID]?.qualityApprove2 || ''}
          onChange={(e) => handleInputChange(row.UID, 'qualityApprove2', e.target.value)}
          placeholder="Yes/No"
          style={{
            width: '100%',
            padding: '0.4rem',
            fontSize: '0.85rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
          }}
        />
      </td>

      {/* Photo Evidence 2 - File Upload */}
      <td style={{ padding: '0.75rem' }}>
        <div style={{
          border: '1px dashed #ffc107',
          borderRadius: '4px',
          padding: '0.5rem',
          textAlign: 'center',
          position: 'relative',
          backgroundColor: '#fffbf0',
          cursor: 'pointer',
          fontSize: '0.75rem',
        }}>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) =>
              handleFileChange(row.UID, 'photoEvidence2', e.target.files[0])
            }
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              cursor: 'pointer',
            }}
          />
          <FileText size={14} color="#ffc107" style={{ marginBottom: '0.2rem' }} />
          <div style={{ color: '#856404', fontWeight: '500' }}>
            {formData[row.UID]?.photoEvidence2?.name
              ? formData[row.UID].photoEvidence2.name.substring(0, 12) + '...'
              : 'Upload Photo'}
          </div>
        </div>
      </td>

      {/* Remarks 2 */}
      <td style={{ padding: '0.75rem' }}>
        <input
          type="text"
          value={formData[row.UID]?.remarks2 || ''}
          onChange={(e) => handleInputChange(row.UID, 'remarks2', e.target.value)}
          placeholder="Remarks"
          style={{
            width: '100%',
            padding: '0.4rem',
            fontSize: '0.85rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
          }}
        />
      </td>
    </tr>
  ))}
</tbody>
                </table>
              </div>

              {/* File Upload Section - एक बार सभी UIDs के लिए */}
              <div style={{ padding: '1.5rem', borderTop: '1px solid #dee2e6' }}>
                <h4 style={{ margin: '0 0 1rem', fontWeight: '600', color: '#495057' }}>
                  Attach Documents (Applies to all UIDs)
                </h4>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem',
                }}>
                  {/* Measurement */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                      <FileText size={18} color="#0d6efd" />
                      Measurement Sheet 2
                    </label>
                    <div style={{
                      border: '2px dashed #0d6efd',
                      borderRadius: '6px',
                      padding: '1.5rem',
                      textAlign: 'center',
                      position: 'relative',
                      backgroundColor: '#f0f7ff',
                      cursor: 'pointer',
                    }}>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          // Apply to all UIDs
                          filteredBills.forEach(bill => {
                            handleFileChange(bill.UID, 'measurementUrl2', file);
                          });
                        }}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          opacity: 0,
                          cursor: 'pointer',
                        }}
                      />
                      <Upload size={24} color="#0d6efd" style={{ marginBottom: '0.5rem' }} />
                      <div style={{ fontSize: '0.9rem', color: '#0d6efd', fontWeight: '500' }}>
                        {formData[filteredBills[0]?.UID]?.measurementUrl2?.name || 'Click to upload file'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.5rem' }}>
                        Will apply to all {filteredBills.length} UID(s)
                      </div>
                    </div>
                  </div>

                  {/* Attendance */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                      <FileText size={18} color="#6610f2" />
                      Attendance Sheet 2
                    </label>
                    <div style={{
                      border: '2px dashed #6610f2',
                      borderRadius: '6px',
                      padding: '1.5rem',
                      textAlign: 'center',
                      position: 'relative',
                      backgroundColor: '#f5f0ff',
                      cursor: 'pointer',
                    }}>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          // Apply to all UIDs
                          filteredBills.forEach(bill => {
                            handleFileChange(bill.UID, 'attendanceUrl2', file);
                          });
                        }}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          opacity: 0,
                          cursor: 'pointer',
                        }}
                      />
                      <Upload size={24} color="#6610f2" style={{ marginBottom: '0.5rem' }} />
                      <div style={{ fontSize: '0.9rem', color: '#6610f2', fontWeight: '500' }}>
                        {formData[filteredBills[0]?.UID]?.attendanceUrl2?.name || 'Click to upload file'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.5rem' }}>
                        Will apply to all {filteredBills.length} UID(s)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ padding: '1.5rem', textAlign: 'right', borderTop: '1px solid #dee2e6' }}>
                <button
                  onClick={handleSubmit}
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: '#198754',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '500',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                >
                  <CheckCircle size={20} />
                  Submit All
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '2.5rem',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            color: '#856404',
          }}>
            <AlertCircle size={40} style={{ marginBottom: '0.75rem' }} />
            <p>No bills found for selected combination</p>
          </div>
        )
      )}
    </div>
  );
};

export default Bill_Checked;