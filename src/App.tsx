import { Routes, Route } from 'react-router-dom';
import 'boxicons/css/boxicons.min.css';

// Pages - ตรวจสอบ Path ให้ตรงกับโฟลเดอร์จริงของคุณ
import Home from './pages/Admin/Home/Home.tsx';
import Login from './pages/Admin/Login/login.tsx';
import RegisterPage from './pages/Admin/Login/register.tsx';
import ForgotPasswordPage from './pages/Admin/Login/forgotpassword.tsx';
import CreatePasswordPage from './pages/Admin/Login/createpassword.tsx';
import HomeMain from './pages/Admin/Homemain/homemain.tsx';
import Adddormitory from './pages/Admin/Homemain/adddormitory.tsx';
import UtilityCalculation from './pages/Admin/Homemain/utilitycalculation.tsx'; 
import ProfileSettings from './pages/Admin/Homemain/profilesettings.tsx';
import BankAccountConfig from './pages/Admin/Homemain/bankaccountconfig.tsx';
import FloorSetup from './pages/Admin/Homemain/floorsetup.tsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
      <Route path="/createpassword" element={<CreatePasswordPage />} />
      <Route path="/homemain" element={<HomeMain />} />
      <Route path="/homemain/adddormitory" element={<Adddormitory />} />
      <Route path="/homemain/utilitycalculation" element={<UtilityCalculation />} />
      <Route path="/homemain/profilesettings" element={<ProfileSettings />} />
      <Route path="/homemain/bankaccountconfig" element={<BankAccountConfig />} />
      <Route path="/homemain/floorsetup" element={<FloorSetup />} />
    </Routes>
  );
}

export default App;