import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  const menuItems = [
    { id: 'rooms', label: 'ห้อง', icon: Home, path: '/manage', hasSub: false },
    { id: 'repair', label: 'แจ้งซ่อม', icon: Wrench, path: '/repair', hasSub: false },
    { id: 'report', label: 'รายงาน', icon: Copy, path: '/report', hasSub: false },
    { id: 'meter', label: 'จดมิเตอร์', icon: Edit3, path: '/meter', hasSub: false },
    { id: 'billing', label: 'ออกบิล', icon: FileText, path: '/billing', hasSub: true },
    { id: 'settings', label: 'ตั้งค่า', icon: Settings, path: '/settings', hasSub: true },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r px-4 py-6 flex flex-col gap-4 shadow-sm">
      {/* ปุ่มย้อนกลับไปหน้าเลือกหอพัก */}
      <Link 
        to="/homemain"
        className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-5 rounded-full transition-all text-sm font-medium mb-6 self-center w-fit border border-gray-200"
      >
        <ArrowLeftCircle size={18} />
        เลือกหอพัก
      </Link>

      {/* รายการเมนูหลัก */}
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
          // ตรวจสอบว่า path ปัจจุบัน "เริ่มต้นด้วย" path ของเมนูหรือไม่ 
          // (ช่วยให้เมนูยังสว่างอยู่แม้จะอยู่ในหน้าย่อย เช่น /settings/profile)
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <div key={item.id}>
              <Link
                to={item.path}
                className={`group w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-100' 
                    : 'text-gray-500 hover:bg-teal-50 hover:text-teal-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-teal-500'} 
                  />
                  <span className={`text-[16px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </div>

                {item.hasSub && (
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform ${isActive ? 'text-white rotate-0' : 'text-gray-300 -rotate-90'}`} 
                  />
                )}
              </Link>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;