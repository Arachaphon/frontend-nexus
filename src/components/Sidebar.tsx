import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // นำเข้า Link และ hook สำหรับเช็ค path
import { 
  Home, 
  Wrench, 
  Copy, 
  Edit3, 
  FileText, 
  Settings, 
  ChevronDown, 
  ArrowLeftCircle 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation(); // ใช้เช็คว่าตอนนี้อยู่ที่ path ไหน

  const menuItems = [
    { id: 'rooms', label: 'ห้อง', icon: Home, path: '/manage', hasSub: false },
    { id: 'repair', label: 'แจ้งซ่อม', icon: Wrench, path: '/repair', hasSub: false },
    { id: 'report', label: 'รายงาน', icon: Copy, path: '/report', hasSub: false },
    { id: 'meter', label: 'จดมิเตอร์', icon: Edit3, path: '/meter', hasSub: true },
    { id: 'billing', label: 'ออกบิล', icon: FileText, path: '/billing', hasSub: true },
    { id: 'settings', label: 'ตั้งค่า', icon: Settings, path: '/settings', hasSub: true },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r px-4 py-6 flex flex-col gap-4">
      {/* ปุ่มเลือกหอพัก - เปลี่ยนเป็น Link ไปหน้าเลือกหอ */}
      <Link 
        to="/homemain"
        className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-full transition-all text-sm font-medium mb-4 self-center w-fit"
      >
        <ArrowLeftCircle size={18} />
        เลือกหอพัก
      </Link>

      {/* รายการเมนู */}
      <nav className="flex flex-col">
        {menuItems.map((item) => {
          // เช็คว่า path ปัจจุบันตรงกับเมนูนี้หรือไม่
          const isActive = location.pathname === item.path;
          
          return (
            <div key={item.id} className="relative">
              <Link
                to={item.path}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mb-1 ${
                  isActive 
                    ? 'bg-[#5EEAD4] text-[#065F46]' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-lg ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </div>
                {item.hasSub && (
                  <ChevronDown size={18} className={isActive ? 'text-[#065F46]' : 'text-gray-400'} />
                )}
              </Link>
              
              <div className="mx-2 border-b border-gray-100 last:border-0" />
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;