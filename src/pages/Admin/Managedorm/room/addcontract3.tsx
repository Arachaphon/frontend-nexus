import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

// Import Components
import C_HomeMain from '../../../../components/C_homemain';
import Footer from '../../../../components/Footerhomemain';
import Sidebar from '../../../../components/Sidebar';

export default function MeterReading() {
  const { roomId } = useParams();

  // State สำหรับเก็บข้อมูลเลขมิเตอร์
  const [waterMeter, setWaterMeter] = useState('');
  const [electricMeter, setElectricMeter] = useState('');

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Sidebar อยู่คงที่ */}
      <Sidebar />
      
      {/* พื้นที่ขวา */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header อยู่คงที่ */}
        <C_HomeMain title="หอพัก: A" />

        {/* ส่วนเนื้อหาหลัก */}
        <div className="flex-1 overflow-y-auto">
            
            {/* ปรับระยะขอบตรงนี้ให้เท่ากับหน้า Manage */}
            <div className="flex-grow px-6 py-6">
            
                 {/* Breadcrumb พร้อมเส้นคั่น */}
                 <div className="mb-8 w-full">
                     <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                         <Link to="#" className="hover:text-emerald-600 flex items-center gap-1.5">
                             <Home className="w-4 h-4" />
                             <span>ห้อง</span>
                         </Link>
                         <ChevronRight className="w-4 h-4 text-gray-400" />
                         <Link to={`/manage/room/${roomId}`} className="hover:text-emerald-600">
                             ข้อมูล ห้อง {roomId || '101'}
                         </Link>
                         <ChevronRight className="w-4 h-4 text-gray-400" />
                         <span className="text-gray-700 font-medium">เพิ่มสัญญา</span>
                     </div>
                     {/* เส้นคั่น */}
                     <hr className="border-gray-300 w-full" />
                 </div>

                {/* จัดฟอร์มและ Stepper ให้อยู่กึ่งกลางหน้าจอ */}
                <div className="max-w-5xl mx-auto mt-8">

                    {/* Stepper (อัปเดตให้อยู่สเต็ปที่ 3) */}
                    <div className="flex justify-center items-center mb-10">
                        <div className="flex flex-col items-center relative z-10 opacity-40">
                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm mb-2 shadow-sm">1</div>
                            <span className="text-gray-400 font-medium text-sm">สัญญา</span>
                        </div>
                        
                        <div className="h-1 bg-gray-200 w-24 mx-2 -mt-6"></div>
                        
                        <div className="flex flex-col items-center relative z-10 opacity-40">
                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm mb-2 shadow-sm">2</div>
                            <span className="text-gray-400 font-medium text-sm">ค่าเช่าล่วงหน้า</span>
                        </div>
                        
                        <div className="h-1 bg-gray-200 w-24 mx-2 -mt-6"></div>

                        <div className="flex flex-col items-center relative z-10">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-md">3</div>
                            <span className="text-emerald-600 font-semibold text-sm">มิเตอร์น้ำ-ไฟ</span>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        
                        {/* ส่วนหัวของฟอร์ม */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800">เลขมิเตอร์วันเข้าพัก</h3>
                        </div>
                        
                        <hr className="border-gray-100 mb-8" />

                        {/* Inputs เลขมิเตอร์ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 max-w-3xl mx-auto">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">เลขมิเตอร์ค่าน้ำ <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={waterMeter}
                                    onChange={(e) => setWaterMeter(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">เลขมิเตอร์ค่าไฟ <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={electricMeter}
                                    onChange={(e) => setElectricMeter(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                                />
                            </div>
                        </div>

                        {/* ปุ่ม Action ด้านล่าง */}
                        <div className="flex justify-end pt-2 max-w-3xl mx-auto">
                            <Link 
                                to={`/manage/room/${roomId}/roominfo`} /* เปลี่ยนพาทให้ตรงกับที่คุณตั้งไว้ใน Router */
                                className="bg-[#7d7671] hover:bg-[#68625d] text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors text-sm text-center"
                            >
                                บันทึก
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}