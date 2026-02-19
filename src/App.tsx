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
import RoomLayoutSetup from './pages/Admin/Homemain/roomsetup.tsx';
import RoomPriceSetup from './pages/Admin/Homemain/roomprice.tsx';
import RoomStatusSetup from './pages/Admin/Homemain/roomstatus.tsx';
import RoomFinish from './pages/Admin/Homemain/homefinish.tsx';
import Manage from './pages/Admin/Managedorm/room/manage.tsx';
import RoomDetail from './pages/Admin/Managedorm/room/roomdetail.tsx';
import AddContract from './pages/Admin/Managedorm/room/addcontract.tsx';
import AdvanceRent from './pages/Admin/Managedorm/room/addcontract2.tsx';

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
      <Route path="/homemain" element={<HomeMain />} />
      <Route path="/homemain/adddormitory" element={<Adddormitory />} />
      <Route path="/homemain/utilitycalculation" element={<UtilityCalculation />} />
      <Route path="/homemain/profilesettings" element={<ProfileSettings />} />
      <Route path="/homemain/bankaccountconfig" element={<BankAccountConfig />} />
      <Route path="/homemain/floorsetup" element={<FloorSetup />} />
      <Route path="/homemain/roomsetup" element={<RoomLayoutSetup />} />
      <Route path="/homemain/roomprice" element={<RoomPriceSetup />} />
      <Route path="/homemain/roomstatus" element={<RoomStatusSetup />} />
      <Route path="/homemain/homefinish" element={<RoomFinish />} />
      <Route path="/manage" element={<Manage />} />
      


      {/* --- เพิ่ม Route สำหรับเมนูอื่นๆ ใน Sidebar (กันจอขาว) --- */}
      {/* คุณค่อยๆ สร้างไฟล์จริงมาแทนที่ Placeholder ทีหลังได้ครับ */}
      <Route path="/repair" element={<Placeholder title="แจ้งซ่อม" />} />
      <Route path="/report" element={<Placeholder title="รายงาน" />} />
      <Route path="/meter" element={<Placeholder title="จดมิเตอร์" />} />
      <Route path="/billing" element={<Placeholder title="ออกบิล" />} />
      <Route path="/settings" element={<Placeholder title="ตั้งค่า" />} />
      <Route path="/manage/room/:roomId" element={<RoomDetail />} />
      <Route path="/manage/room/:roomId/addcontract" element={<AddContract />} />
      <Route path="/manage/room/:roomId/addcontract2" element={<AdvanceRent />} />        
    </Routes>
  );
}

export default App;