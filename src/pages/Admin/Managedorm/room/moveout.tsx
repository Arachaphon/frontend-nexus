import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // 🟢 เพิ่ม useNavigate สำหรับเปลี่ยนหน้า
import { Home, ChevronRight } from 'lucide-react';

// Import Components
import C_HomeMain from '../../../../components/C_homemain';
import Footer from '../../../../components/Footerhomemain';
import Sidebar from '../../../../components/Sidebar';

declare global {
  interface Window {
    __ENV__: {
      API_BASE: string;
    };
  }
}

export default function MoveOut() {
  const { dormitoryId, roomId } = useParams();
  const navigate = useNavigate(); // 🟢 เรียกใช้สำหรับนำทางด้วยคำสั่งโปรแกรม
  
  // State
  const [moveOutDate, setMoveOutDate] = useState('1010-10-10');
  const [dormitoryName, setDormitoryName] = useState<string>(''); 
  const [roomNumber, setRoomNumber] = useState<string>(''); 
  const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

  // ดึงข้อมูลหอพักและห้อง
  useEffect(() => {
      const fetchStats = async () => {
          if (!dormitoryId) return;
          try {
              const token = localStorage.getItem('token');
              if (!token) return;
              
              const headers = {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
              };

              const [dormRes, roomRes] = await Promise.all([
                  fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, { method: 'GET', headers }),
                  fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}/${roomId}`, { method: 'GET', headers })
              ]);

              if (dormRes.ok) {
                  const dormData = await dormRes.json();
                  setDormitoryName(dormData.data?.name || dormData.name || '');
              }
              if (roomRes.ok) {
                  const roomData = await roomRes.json();
                  setRoomNumber(roomData.data?.room_number || roomData.room_number || '');
              }
          } catch (err) {
              console.error('Unexpected error:', err); 
          }
      };
      fetchStats();
  }, [dormitoryId, roomId, API_BASE]);

  const handleSave = () => {
    // 🟢 1. โค้ดส่งข้อมูลไป API เพื่อบันทึกการย้ายออก (ถ้ามี)
    console.log("บันทึกการย้ายออก วันที่:", moveOutDate);
    
    // 🟢 2. เมื่อบันทึกสำเร็จ ให้ย้ายไปหน้า MoveOutDetail พร้อมส่งข้อมูลไปทาง state
    // (ตรวจสอบให้แน่ใจว่าใน App.tsx คุณตั้ง Path นี้ไว้แล้ว)
    navigate(`/manage/${dormitoryId}/room/${roomId}/roominfo/moveoutdetail`, { 
      state: { moveOutDate } 
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        
        <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />

        <div className="flex-1 overflow-y-auto">
          <div className="w-full px-8 py-8">
            
            {/* Breadcrumb */}
            <div className="mb-8 w-full">
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 flex-wrap">
                <Link to="/homemain" className="hover:text-emerald-600 flex items-center gap-1.5">
                  <Home className="w-4 h-4" />
                  <span>ห้อง</span>
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to={`/manage/${dormitoryId}/room/${roomId}/roominfo`} className="hover:text-emerald-600">
                  ข้อมูล ห้อง {roomNumber || roomId}
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to={`/manage/${dormitoryId}/room/${roomId}/roominfo`} className="hover:text-emerald-600">
                  ข้อมูลสัญญา
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-800 font-medium">ย้ายออก</span>
              </div>
              <hr className="border-gray-300 w-full" />
            </div>

            <div className="space-y-6">
              
              {/* กล่อง 1: ใบแจ้งหนี้ค้างชำระ */}
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-8">
                <h3 className="text-lg font-normal text-gray-700 mb-4">ใบแจ้งหนี้ค้างชำระ</h3>
                <hr className="border-gray-300 w-full mb-6" />
                <div className="w-full text-sm">
                  <div className="grid grid-cols-2 bg-[#dcdcdc] text-gray-800 py-3 px-6 font-medium">
                    <div>เลขที่</div>
                    <div className="text-right">ยอดเงิน</div>
                  </div>
                  <div className="grid grid-cols-2 py-5 px-6 border-b border-gray-100">
                    <div></div>
                    <div className="text-right text-emerald-500 font-medium">0.00</div>
                  </div>
                </div>
              </div>

              {/* กล่อง 2: เงินประกัน */}
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-8">
                <h3 className="text-lg font-normal text-gray-700 mb-4">เงินประกัน: ที่ผู้เช่าชำระตอนเข้าพัก</h3>
                <hr className="border-gray-300 w-full mb-8" />
                <div className="text-right text-red-500 text-xl font-medium">
                  เงินประกัน 10.00 บาท
                </div>
              </div>

              {/* กล่อง 3: สรุปค่าใช้จ่าย */}
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-10 flex flex-col items-center text-center">
                <h3 className="text-gray-800 text-lg font-medium mb-2">สรุปค่าใช้จ่าย คืนเงิน 4.00 บาท</h3>
                <p className="text-gray-800 text-sm mb-6">คำนวนจาก เงินประกัน - ยอดรวมใบแจ้งหนี้ค้างชำระ - รายการเงินเพิ่มเติม</p>
                
                <hr className="border-gray-300 w-full mb-6" />
                
                <p className="text-red-500 text-sm mb-8 font-medium">
                  ในกรณีที่มีใบแจ้งหนี้ค้างชำระ เมื่อกดปุ่มย้ายออก ใบแจ้งหนี้จะถูกทำการรับเงินให้อัตโนมัติ
                </p>
                
                <div className="flex items-center justify-center gap-4">
                  <label className="text-sm font-medium text-gray-800">วันที่ออก</label>
                  <input 
                    type="date" 
                    value={moveOutDate}
                    onChange={(e) => setMoveOutDate(e.target.value)}
                    className="border border-gray-400 rounded-md px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                  />
                  {/* 🟢 แก้ไข: ใช้ปุ่มที่มี onClick เรียก handleSave ตรงๆ ไม่ต้องมี Link ครอบ */}
                  <button 
                    onClick={handleSave}
                    className="bg-[#75706b] hover:bg-[#5a5652] text-white text-sm py-2 px-8 rounded-md transition-colors shadow-sm"
                  >
                    บันทึก
                  </button>
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