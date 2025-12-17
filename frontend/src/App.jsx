
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { useSelector } from 'react-redux';

//////////////
import ContractorRequirementForm from './components/Contractor/ContractorRequirementForm';
import Approval_For_Meeting from './components/Contractor/Approval_For_Meeting';
import First_Meeting_Attend from './components/Contractor/First_Meeting_Attend';
import Meeting_Mom from './components/Contractor/Meeting_Mom';
import Second_Meeting_Attend from './components/Contractor/Second_Meeting_Attend';
// Billing 

import Bill_Tally_form from "./components/Contractor_Billing/Bill_Tally_form"
import Bill_Checked from './components/Contractor_Billing/Bill_Checked';
import Bill_Checked_By_Office from './components/Contractor_Billing/Bill_Checked_By_Office';


////////  Payment 

import BILL_FINAL_BY_OFFICE from './components/Payment/BILL_FINAL_BY_OFFICE';
import BiLL_Checked_BY_RavindraSir from './components/Payment/BiLL_Checked_BY_RavindraSir';
import BiLL_Checked_BY_AshokSir from './components/Payment/BiLL_Checked_BY_AshokSir';
import Payment_Tally from './components/Payment/Payment_Tally';





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
          <Route path='Approval_For_Meeting' element={<Approval_For_Meeting/>}/>
          <Route path='First_Meeting_Attend' element={<First_Meeting_Attend/>}/>
          <Route path='Meeting_Mom' element={<Meeting_Mom/>}/>
          <Route path='Second_Meeting_Attend' element={<Second_Meeting_Attend/>}/>
  //////Billing         
          <Route path="Bill_Tally_form" element={<Bill_Tally_form />} />
          <Route path="Bill_Checked" element={<Bill_Checked />} />
          <Route path="Bill_Checked_By_Office" element={<Bill_Checked_By_Office />} />

  ///Payment
          <Route path='BILL_FINAL_BY_OFFICE' element={<BILL_FINAL_BY_OFFICE/>}/>
          <Route path='BiLL_Checked_BY_RavindraSir' element={<BiLL_Checked_BY_RavindraSir/>}/>
          <Route path='BiLL_Checked_BY_AshokSir' element={<BiLL_Checked_BY_AshokSir/>}/>
          <Route path='Payment_Tally' element={<Payment_Tally/>}/>

        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;