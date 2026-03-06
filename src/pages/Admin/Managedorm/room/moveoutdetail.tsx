import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, ChevronRight, ChevronLeft } from 'lucide-react';

// Import Components
import C_HomeMain from '../../../../components/C_homemain';
import Footer from '../../../../components/Footerhomemain';
import Sidebar from '../../../../components/Sidebar';

declare global {
  interface Window {
    __ENV__: { API_BASE: string; };
  }
}

export default function MoveOutDetail() {
  const { dormitoryId, roomId } = useParams();
  const [dormitoryName, setDormitoryName] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

  useEffect(() => {
    const fetchStats = async () => {
      if (!dormitoryId) return;
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [dormRes, roomRes] = await Promise.all([
          fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, { headers }),
          fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}/${roomId}`, { headers })
        ]);
        if (dormRes.ok) {
          const dormData = await dormRes.json();
          setDormitoryName(dormData.data?.name || dormData.name || '');
        }
        if (roomRes.ok) {
          const roomData = await roomRes.json();
          setRoomNumber(roomData.data?.room_number || roomData.room_number || '');
        }
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, [dormitoryId, roomId, API_BASE]);

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

            {/* กล่องสรุปรายละเอียด */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-8 mb-6">
              <h3 className="text-lg font-normal text-gray-700 mb-4">รายละเอียดการย้ายออก</h3>
              <hr className="border-gray-300 w-full mb-6" />
              
              <div className="w-full text-sm">
                {/* หัวตาราง */}
                <div className="grid grid-cols-3 bg-[#e5e5e5] text-gray-800 py-3 px-6 font-medium border-t border-b border-gray-300">
                  <div>เลขที่ใบเสร็จรับเงิน</div>
                  <div className="text-center">ประเภท</div>
                  <div className="text-right">ยอดเงิน</div>
                </div>

                {/* แถวข้อมูล */}
                <div className="grid grid-cols-3 py-6 px-6 border-b border-gray-100 items-center">
                  <div className="text-gray-700">B2026020003</div>
                  <div className="flex justify-center">
                    <span className="border border-gray-300 px-4 py-1 rounded-md text-gray-800">
                      คืนเงินประกัน
                    </span>
                  </div>
                  <div className="text-right text-emerald-500 font-medium text-lg">-4.00</div>
                </div>
              </div>

              {/* ยอดเงินประกันรวม */}
              <div className="mt-12 text-center">
                <span className="text-emerald-500 text-xl font-medium">
                  เงินประกัน 10.00 บาท
                </span>
              </div>
            </div>

            {/* ปุ่มกลับไปหน้าจัดการหอพัก */}
            <div className="flex justify-end pr-2">
              <Link 
                to={`/manage/${dormitoryId}`} 
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>กลับไปยังหน้ารายละเอียดหอพัก</span>
              </Link>
            </div>

          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}