import { Routes, Route } from 'react-router-dom';
import 'boxicons/css/boxicons.min.css';

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
import EditMeter from './pages/Admin/Managedorm/room/editmeter.tsx';
import EditContract from './pages/Admin/Managedorm/room/editcontract.tsx';
import DormInfo from './pages/Admin/Managedorm/settingdorm/dorminfo.tsx';
import BankInfo from './pages/Admin/Managedorm/settingdorm/bankinfo.tsx';
import RoomLayout from './pages/Admin/Managedorm/settingdorm/roomlayout.tsx';
import RoomStatus from './pages/Admin/Managedorm/settingdorm/roomstatusinfo.tsx';
import RoomPrice from './pages/Admin/Managedorm/settingdorm/roompriceinfo.tsx';
import RoomPriceInfo from './pages/Admin/Managedorm/settingdorm/roompriceinfo.tsx';

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
      <Route path="/homemain/adddormitory" element={<ProtectedRoute requiredRole="user"><Adddormitory /></ProtectedRoute>}/>
      <Route path="/homemain/utilitycalculation" element={<ProtectedRoute requiredRole="user"><UtilityCalculation /></ProtectedRoute>} />
      <Route path="/homemain/profilesettings" element={<ProtectedRoute requiredRole="user"><ProfileSettings /></ProtectedRoute>} />
      <Route path="/homemain/bankaccountconfig" element={<ProtectedRoute requiredRole="user"><BankAccountConfig /></ProtectedRoute>} />
      <Route path="/homemain/floorsetup" element={<ProtectedRoute requiredRole="user"><FloorSetup /></ProtectedRoute>} />
      <Route path="/homemain/roomsetup" element={<ProtectedRoute requiredRole="user"><RoomLayoutSetup /></ProtectedRoute>} />
      <Route path="/homemain/roomprice" element={<ProtectedRoute requiredRole="user"><RoomPriceSetup /></ProtectedRoute>} />
      <Route path="/homemain/roomstatus" element={<ProtectedRoute requiredRole="user"><RoomStatusSetup /></ProtectedRoute>} />
      <Route path="/homemain/homefinish" element={<ProtectedRoute requiredRole="user"><RoomFinish /></ProtectedRoute>} />

      <Route path="/repair" element={<Placeholder title="แจ้งซ่อม" />} />
      <Route path="/report" element={<Placeholder title="รายงาน" />} />
      <Route path="/meter" element={<Placeholder title="จดมิเตอร์" />} />
      <Route path="/billing" element={<Placeholder title="ออกบิล" />} />
      <Route path="/settings" element={<Placeholder title="ตั้งค่า" />} />

      <Route path="/manage/:dormitoryId" element={<ProtectedRoute><Manage /></ProtectedRoute>} />
      <Route path="/manage/:dormitoryId/room/:roomId" element={<ProtectedRoute><RoomDetail /></ProtectedRoute>} />
      <Route path="/manage/:dormitoryId/room/:roomId/addcontract" element={<ProtectedRoute><AddContract /></ProtectedRoute>} />
      <Route path="/manage/:dormitoryId/room/:roomId/addcontract2/:contractId" element={<ProtectedRoute><AdvanceRent /></ProtectedRoute>} />
      <Route path="/manage/:dormitoryId/room/:roomId/addcontract3/:contractId" element={<ProtectedRoute><MeterReading /></ProtectedRoute>} />
      <Route path="/manage/:dormitoryId/room/:roomId/addtenant/:contractId" element={<ProtectedRoute><AddTenant /></ProtectedRoute>} />
      <Route path="/manage/:dormitoryId/room/:roomId/tenant/:tenantId" element={<ProtectedRoute><Tenantinfo /></ProtectedRoute>} />
      <Route path="/manage/:dormitoryId/room/:roomId/roominfo/:contractId/moveout" element={<ProtectedRoute><MoveOut /></ProtectedRoute>} />
      <Route path="/manage/:dormitoryId/room/:roomId/roominfo/:contractId/moveoutdetail" element={<ProtectedRoute><MoveOutDetail /></ProtectedRoute>} />
      <Route path="/manage/:dormitoryId/room/:roomId/roominfo/:contractId" element={<ProtectedRoute><RoomInfo /></ProtectedRoute>} />
      <Route path="/manage/:dormitoryId/room/:roomId/editmeter/:contractId" element={<ProtectedRoute><EditMeter /></ProtectedRoute>} />
      <Route path="/manage/:dormitoryId/room/:roomId/editcontract/:contractId" element={<ProtectedRoute><EditContract /></ProtectedRoute>} />

      <Route path="/settings/info/:dormitoryId"
        element={<ProtectedRoute requiredRole={['owner','manager']}><DormInfo /></ProtectedRoute>} />
      <Route path="/settings/bank"
        element={<ProtectedRoute requiredRole={['owner','manager']}><BankInfo /></ProtectedRoute>} />
      <Route path="/settings/layout"
        element={<ProtectedRoute requiredRole={['owner','manager']}><RoomLayout /></ProtectedRoute>} />
      <Route path="/settings/available"
        element={<ProtectedRoute requiredRole={['owner','manager']}><RoomStatus /></ProtectedRoute>} />
      <Route path="/settings/room-rates"
        element={<ProtectedRoute requiredRole={['owner','manager']}><RoomPriceInfo /></ProtectedRoute>} />

    </Routes>
  );
}

export default App;