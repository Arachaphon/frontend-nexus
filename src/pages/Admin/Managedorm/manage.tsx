import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import C_HomeMain from '../../../components/C_homemain';
import Footer from '../../../components/Footerhomemain';
import Sidebar from '../../../components/Sidebar';
// เพิ่ม import ไอคอนให้ครบ (รวมถึง Home)
import { LayoutGrid, CheckSquare, Calendar, XCircle, Home } from 'lucide-react';


// บอก TypeScript ว่า Context ที่ได้รับมามีหน้าตาเป็นอย่างไร
interface LayoutContextType {
  setPageTitle: (title: string) => void;
}

export default function Manage() {
  const [isLoading, setIsLoading] = useState(true);

  // ดึง context อย่างปลอดภัย
  const context = useOutletContext<LayoutContextType>();
  const setPageTitle = context ? context.setPageTitle : null;

  useEffect(() => {
    // สั่งเปลี่ยนชื่อหัวข้อ
    if (setPageTitle) {
      setPageTitle('Manage Dormitory');
    }

    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [setPageTitle]);

  // --- ส่วนข้อมูลจำลอง (Mock Data) ---
  const stats = [
    {
      label: 'ห้องทั้งหมด',
      value: 4,
      unit: 'ห้อง',
      icon: <LayoutGrid className="w-5 h-5 text-gray-500" />,
      borderColor: 'border-green-500',
      textColor: 'text-gray-700'
    },
    {
      label: 'ห้องว่างทั้งหมด',
      value: 4,
      unit: 'ห้อง',
      icon: <CheckSquare className="w-5 h-5 text-gray-500" />,
      borderColor: 'border-green-600',
      textColor: 'text-green-600'
    },
    {
      label: 'จองล่วงหน้า',
      value: 0,
      unit: 'ห้อง',
      icon: <Calendar className="w-5 h-5 text-gray-500" />,
      borderColor: 'border-orange-400',
      textColor: 'text-orange-500'
    },
    {
      label: 'ค้างชำระ',
      value: 0,
      unit: 'ห้อง',
      icon: <XCircle className="w-5 h-5 text-gray-500" />,
      borderColor: 'border-red-400',
      textColor: 'text-red-500'
    },
  ];

  const roomData = [
    { id: '101', status: 'ว่าง' },
    { id: '102', status: 'ว่าง' },
    { id: '201', status: 'ว่าง' },
    { id: '202', status: 'ว่าง' },
  ];
  // --------------------------------

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        
        {/* Main Content */}
        <div className="flex-grow">
          
          {/* Header เดิม */}
          <C_HomeMain title="หอพัก: A" />

          {/* Container หลักสำหรับเนื้อหา */}
          <div className="px-6 pb-6">

             {/* ส่วนหัว "Home > ห้อง" ตามรูปภาพ */}
             <div className="mb-6 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                      <Home className="w-5 h-5 text-gray-600" />
                      {/* ปรับสไตล์เป็นสีฟ้าและมีขีดเส้นใต้ */}
                      <span className=" font-medium  cursor-pointer text-sm">
                        ห้อง
                      </span>
                  </div>
                  {/* เส้นขีดคั่นยาว */}
                  <hr className="border-t-2 border-gray-300" />
             </div>

             {/* 1. Stats Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
               {stats.map((stat, index) => (
                 <div
                   key={index}
                   className={`bg-white rounded-3xl border ${stat.borderColor} py-3 px-5 flex items-center justify-between shadow-sm`}
                 >
                   <div className="flex items-center gap-3">
                     <div className="bg-gray-100 p-2 rounded-lg">
                       {stat.icon}
                     </div>
                     <span className="text-gray-500 text-sm">{stat.label}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className={`text-xl font-semibold ${stat.textColor}`}>
                       {stat.value}
                     </span>
                     <span className="text-gray-400 text-xs mt-1">{stat.unit}</span>
                   </div>
                 </div>
               ))}
             </div>

             {/* 2. Table */}
             <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-600">
                   <thead className="bg-gray-200 text-gray-700 font-semibold">
                     <tr>
                       <th className="px-6 py-3 min-w-[80px]">ห้อง</th>
                       <th className="px-6 py-3 min-w-[100px]">สถานะ</th>
                       <th className="px-6 py-3 text-center">ลูกค้า</th>
                       <th className="px-6 py-3 text-center">ประเภท</th>
                       <th className="px-6 py-3 text-center">ค่าเช่า</th>
                       <th className="px-6 py-3 text-center">แจ้งออก</th>
                       <th className="px-6 py-3 text-center">จองล่วงหน้า</th>
                       <th className="px-6 py-3 text-right">ค้างชำระ</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-200">
                     {roomData.map((room) => (
                       <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 font-medium text-gray-900">
                           {room.id}
                         </td>
                         <td className="px-6 py-4">
                           <span className="bg-cyan-100 text-cyan-600 px-3 py-1 rounded-md text-xs font-bold inline-block text-center min-w-[50px]">
                             {room.status}
                           </span>
                         </td>
                         <td className="px-6 py-4 text-center">-</td>
                         <td className="px-6 py-4 text-center">-</td>
                         <td className="px-6 py-4 text-center">-</td>
                         <td className="px-6 py-4 text-center">-</td>
                         <td className="px-6 py-4 text-center">-</td>
                         <td className="px-6 py-4 text-right">
                           <button className="text-gray-900 underline font-medium hover:text-blue-600 text-xs">
                             ข้อมูล
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>

          </div>
          {/* จบส่วนเนื้อหา Dashboard */}

        </div>

        <Footer />
      </div>
    </div>
  );
}