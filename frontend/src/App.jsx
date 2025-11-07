// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import ContractorRequirementForm from './components/Contractor/ContractorRequirementForm';
// import NotFound from './pages/NotFound'; // Assuming you have a NotFound component

// const App = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/dashboard" element={<Dashboard />}>
//           <Route path="Contractor-Requirement-Form" element={<ContractorRequirementForm />} />
//         </Route>
//         <Route path="*" element={<NotFound />} />
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;




// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { useSelector } from 'react-redux';
import ContractorRequirementForm from './components/Contractor/ContractorRequirementForm';

// Billing 

import Bill_Tally_form from "./components/Contractor_Billing/Bill_Tally_form"
import Bill_Checked from './components/Contractor_Billing/Bill_Checked';


const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="Contractor-Requirement-Form" element={<ContractorRequirementForm />} />
          <Route path="Bill_Tally_form" element={<Bill_Tally_form />} />
          <Route path="Bill_Checked" element={<Bill_Checked />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;