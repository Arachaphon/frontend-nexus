import React, { useState, useEffect } from 'react';
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

// กำหนด Interface สำหรับ TypeScript
interface SubMenuItem {
  label: string;
  path: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  subMenu?: SubMenuItem[];
}

const Sidebar = () => {
  const location = useLocation();
  
  // แก้ไข Error: ระบุ Type เป็น <string | null> เพื่อให้เก็บค่า id หรือ null ได้
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    { id: 'rooms', label: 'ห้อง', icon: Home, path: '/manage' },
    { id: 'repair', label: 'แจ้งซ่อม', icon: Wrench, path: '/repair' },
    { id: 'meter', label: 'จดมิเตอร์', icon: Edit3, path: '/meter' },
    { 
      id: 'billing', 
      label: 'ออกบิล', 
      icon: FileText, 
      path: '/billing',
      subMenu: [
        { label: 'บิลรายเดือน', path: '/billing/monthly' },
      ]
    },
    { 
      id: 'settings', 
      label: 'ตั้งค่า', 
      icon: Settings, 
      path: '/settings',
      subMenu: [
        { label: 'ข้อมูลหอพัก', path: '/settings/info' },
        { label: 'บัญชีธนาคาร', path: '/settings/bank' },
        { label: 'ผังห้อง', path: '/settings/layout' },
        { label: 'ห้องว่าง', path: '/settings/available' },
        { label: 'ค่าห้อง', path: '/settings/room-rates' },
      ]
    },
  ];

  // ตรวจสอบ URL เพื่อเปิด Sub-menu อัตโนมัติเมื่อ Refresh หน้า
  useEffect(() => {
    const activeMenu = menuItems.find(item => 
      item.subMenu && location.pathname.startsWith(item.path)
    );
    if (activeMenu) {
      setOpenSubMenu(activeMenu.id);
    }
  }, [location.pathname]);

  const toggleSubMenu = (id: string) => {
    setOpenSubMenu(openSubMenu === id ? null : id);
  };

  return (
    <div className="w-64 h-screen bg-white border-r px-4 py-6 flex flex-col gap-4 shadow-sm overflow-y-auto">
      {/* ปุ่มย้อนกลับ เลือกหอพัก */}
      <Link 
        to="/homemain"
        className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-5 rounded-full transition-all text-sm font-medium mb-6 self-center w-fit border border-gray-200"
      >
        <ArrowLeftCircle size={18} />
        เลือกหอพัก
      </Link>

      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const isSubOpen = openSubMenu === item.id;

          return (
            <div key={item.id} className="flex flex-col">
              {/* รายการเมนูหลัก */}
              {item.subMenu ? (
                // ถ้ามีเมนูย่อย ให้เป็นปุ่มกดเพื่อ Toggle
                <button
                  onClick={() => toggleSubMenu(item.id)}
                  className={`group w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-100' 
                      : 'text-gray-500 hover:bg-teal-50 hover:text-teal-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon 
                      size={22} 
                      className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-teal-500'} 
                    />
                    <span className={`text-[16px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-300 ${isSubOpen ? 'rotate-0' : '-rotate-90'} ${isActive ? 'text-white' : 'text-gray-300'}`} 
                  />
                </button>
              ) : (
                // ถ้าไม่มีเมนูย่อย ให้เป็น Link ปกติ
                <Link
                  to={item.path}
                  onClick={() => setOpenSubMenu(null)}
                  className={`group w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-100' 
                      : 'text-gray-500 hover:bg-teal-50 hover:text-teal-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon 
                      size={22} 
                      className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-teal-500'} 
                    />
                    <span className={`text-[16px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              )}

              {/* รายการเมนูย่อย (แสดงเมื่อ isSubOpen เป็น true) */}
              {item.subMenu && isSubOpen && (
                <div className="flex flex-col mt-1 mb-2">
                  {item.subMenu.map((sub, index) => {
                    const isSubActive = location.pathname === sub.path;
                    return (
                      <Link
                        key={index}
                        to={sub.path}
                        className={`py-2 pl-12 pr-4 text-sm transition-colors rounded-lg ${
                          isSubActive 
                            ? 'text-teal-600 font-bold' 
                            : 'text-gray-500 hover:text-teal-500 hover:bg-gray-50'
                        }`}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;