import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// กำหนด Type ของ Props
type NavbarProps = {
  onMenuClick: (page: string) => void;
};

const Navbar = ({ onMenuClick }: NavbarProps) => {
  // 1. เรียกใช้ Hook
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('หน้าแรก');

  // 2. ฟังก์ชันเปลี่ยนหน้าไป Login
  const handleLoginClick = () => {
    navigate('/login');
  };

  // 3. ฟังก์ชันเปลี่ยนเมนู (Scroll/Tab)
  const handleClick = (pageName: string) => {
    setActiveTab(pageName); 
    onMenuClick(pageName);  
  };

  const getBtnClass = (name: string) => {
    return activeTab === name
      ? "border-b-2 border-emerald-700 text-emerald-800 transition cursor-default" 
      : "border-b-2 border-transparent hover:text-emerald-600 hover:border-emerald-200 transition cursor-pointer"; 
  };

  return (
    <div className="font-sans text-gray-800 bg-white font-semibold text-lg">
      <div className="sticky top-0 z-50 w-full">
        <nav className="w-full px-6 py-4 flex justify-evenly items-center bg-white">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain" />
          </div>

          {['หน้าแรก', 'ฟีเจอร์', 'บริการ', 'คู่มือการใช้งาน', 'บทความ', 'ติดต่อเรา'].map((menu) => (
            <button key={menu} onClick={() => handleClick(menu)} className={getBtnClass(menu)}>
              {menu}
            </button>
          ))}

          <button 
            onClick={handleLoginClick}
            className="bg-emerald-900 hover:bg-emerald-600 text-white px-6 py-2 rounded-full font-medium transition shadow-md"
          >
            เข้าสู่ระบบ
          </button>
        </nav>
        <div className='bg-emerald-900 h-8 w-full'></div>
      </div>
    </div>
  );
};

export default Navbar;