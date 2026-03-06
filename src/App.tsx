import { Routes, Route } from 'react-router-dom';
import 'boxicons/css/boxicons.min.css';

// Pages - ตรวจสอบ Path ให้ตรงกับโฟลเดอร์จริงของคุณ
import ProtectedRoute from './hooks/ProtectedRoute'
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
import RoomLayoutSetup from './pages/Admin/Homemain/roomsetup.tsx';
import RoomPriceSetup from './pages/Admin/Homemain/roomprice.tsx';
import RoomStatusSetup from './pages/Admin/Homemain/roomstatus.tsx';
import RoomFinish from './pages/Admin/Homemain/homefinish.tsx';
import Manage from './pages/Admin/Managedorm/room/manage.tsx';
import RoomDetail from './pages/Admin/Managedorm/room/roomdetail.tsx';
import AddContract from './pages/Admin/Managedorm/room/addcontract.tsx';
import AdvanceRent from './pages/Admin/Managedorm/room/addcontract2.tsx';
import MeterReading from './pages/Admin/Managedorm/room/addcontract3.tsx';
import RoomInfo from './pages/Admin/Managedorm/room/roominfo.tsx';
import Tenantinfo from './pages/Admin/Managedorm/room/tenantinfo.tsx';
import AddTenant from './pages/Admin/Managedorm/room/addtenant.tsx';
import MoveOut from './pages/Admin/Managedorm/room/moveout.tsx';
import MoveOutDetail from './pages/Admin/Managedorm/room/moveoutdetail.tsx';

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-10 text-2xl font-bold text-gray-400">
    หน้า {title} (กำลังพัฒนา)
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
      <Route path="/createpassword" element={<CreatePasswordPage />} />
      
      <Route path="/homemain" element={<ProtectedRoute><HomeMain /></ProtectedRoute>}/>
      <Route path="/homemain/adddormitory" element={<ProtectedRoute requiredRole="owner|landlord"><Adddormitory /></ProtectedRoute>}/>
      <Route path="/homemain/utilitycalculation" element={<ProtectedRoute requiredRole="owner|landlord"><UtilityCalculation /></ProtectedRoute>} />
      <Route path="/homemain/profilesettings" element={<ProtectedRoute requiredRole="owner|landlord"><ProfileSettings /></ProtectedRoute>} />
      <Route path="/homemain/bankaccountconfig" element={<ProtectedRoute requiredRole="owner|landlord"><BankAccountConfig /></ProtectedRoute>} />
      <Route path="/homemain/floorsetup" element={<ProtectedRoute requiredRole="owner|landlord"><FloorSetup /></ProtectedRoute>} />
      <Route path="/homemain/roomsetup" element={<ProtectedRoute requiredRole="owner|landlord"><RoomLayoutSetup /></ProtectedRoute>} />
      <Route path="/homemain/roomprice" element={<ProtectedRoute requiredRole="owner|landlord"><RoomPriceSetup /></ProtectedRoute>} />
      <Route path="/homemain/roomstatus" element={<ProtectedRoute requiredRole="owner|landlord"><RoomStatusSetup /></ProtectedRoute>} />
      <Route path="/homemain/homefinish" element={<ProtectedRoute requiredRole="owner|landlord"><RoomFinish /></ProtectedRoute>} />
      <Route path="/manage" element={<ProtectedRoute><Manage /></ProtectedRoute>} />



      {/* --- เพิ่ม Route สำหรับเมนูอื่นๆ ใน Sidebar (กันจอขาว) --- */}
      {/* คุณค่อยๆ สร้างไฟล์จริงมาแทนที่ Placeholder ทีหลังได้ครับ */}
      <Route path="/repair" element={<Placeholder title="แจ้งซ่อม" />} />
      <Route path="/report" element={<Placeholder title="รายงาน" />} />
      <Route path="/meter" element={<Placeholder title="จดมิเตอร์" />} />
      <Route path="/billing" element={<Placeholder title="ออกบิล" />} />
      <Route path="/settings" element={<Placeholder title="ตั้งค่า" />} />
      <Route path="/manage/:dormitoryId" element={<Manage />} />
      <Route path="/manage/:dormitoryId/room/:roomId" element={<RoomDetail />} /> 
      <Route path="/manage/:dormitoryId/room/:roomId/addcontract" element={<AddContract />} />
      <Route path="/manage/:dormitoryId/room/:roomId/addcontract2/:contractId" element={<AdvanceRent />} />
      <Route path="/manage/:dormitoryId/room/:roomId/addcontract3/:contractId" element={<MeterReading />} />  
      <Route path="/manage/:dormitoryId/room/:roomId/roominfo/:contractId" element={<RoomInfo />} /> 
      <Route path="/manage/:dormitoryId/room/:roomId/addtenant/:contractId" element={<AddTenant />} />
      <Route path="/manage/:dormitoryId/room/:roomId/tenantinfo" element={<Tenantinfo />} />
      <Route path="/manage/:dormitoryId/room/:roomId/roominfo/moveout" element={<MoveOut />} />
      <Route path="/manage/:dormitoryId/room/:roomId/roominfo/moveoutdetail" element={<MoveOutDetail />} />
    </Routes>
  );
}

export default App;