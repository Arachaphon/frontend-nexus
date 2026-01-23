import { Routes, Route } from 'react-router-dom';
import 'boxicons/css/boxicons.min.css';

// Pages - ตรวจสอบ Path ให้ตรงกับโฟลเดอร์จริงของคุณ
import Home from './pages/Admin/Home/Home.tsx';
import Login from './pages/Admin/Login/login.tsx';
import RegisterPage from './pages/Admin/Login/register.tsx';
import HomeMain from './pages/Admin/Homemain/homemain.tsx';
// ... นำเข้าหน้าอื่นๆ ตามลำดับ

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/homemain" element={<HomeMain />} />
      {/* เพิ่มหน้าอื่นๆ ที่นี่ */}
    </Routes>
  );
}

export default App;