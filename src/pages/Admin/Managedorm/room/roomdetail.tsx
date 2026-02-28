import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import C_HomeMain from '../../../../components/C_homemain';
import Footer from '../../../../components/Footerhomemain';
import Sidebar from '../../../../components/Sidebar';

export default function RoomDetail() {
  const { dormitoryId, roomId } = useParams();

  const [dormitoryName, setDormitoryName] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

  const fetchRoomDetail = useCallback(async () => {
    if (!dormitoryId || !roomId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const [dormRes, roomRes] = await Promise.all([
        fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, {
          method: 'GET',
          headers,
        }),
        fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}/${roomId}`, {
          method: 'GET',
          headers,
        }),
      ]);

      if (!dormRes.ok || !roomRes.ok) {
        throw new Error('API request failed');
      }

      const dormData = await dormRes.json();
      const roomData = await roomRes.json();

      setDormitoryName(dormData.name);
      setRoomNumber(roomData.data.room_number);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [dormitoryId, roomId, API_BASE]);

  useEffect(() => {
    fetchRoomDetail();
  }, [fetchRoomDetail]);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />

        {/* ✅ Loading Overlay (ไม่กระทบ UI layout เดิม) */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50">
            <div className="text-gray-600 text-sm font-medium">
              Loading...
            </div>
          </div>
        )}

        <div className="flex-grow px-6 py-6">

          <div className="mb-8 w-full">
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
              <Link
                to={`/manage/${dormitoryId}`}
                className="hover:text-emerald-600 flex items-center gap-1.5"
              >
                <Home className="w-4 h-4" />
                <span>ห้อง</span>
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700 font-medium">
                ข้อมูล ห้อง {roomNumber}
              </span>
            </div>
            <hr className="border-gray-300 w-full" />
          </div>

          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-2xl font-bold text-gray-700">
              ห้อง : {roomNumber}
            </h1>
            <span className="bg-cyan-100 text-cyan-600 px-3 py-1 rounded-md text-sm font-bold shadow-sm">
              ว่าง
            </span>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Contract Actions */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">รายละเอียดสัญญา</h3>
                <Link 
                to={`/manage/${dormitoryId}/room/${roomId}/addcontract`}
                className="w-full bg-emerald-400 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                        >
           
                เพิ่มสัญญา
                </Link>
              </div>
            </div>

            {/* Right Column: Waiting Lists */}
            <div className="lg:col-span-9 flex flex-col gap-6">
              
              {/* Card 1: รายชื่อคนจองรอเข้าพัก */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-700">รายชื่อคนจองรอเข้าพัก</h3>
                    <p className="text-xs text-gray-400">เพิ่มรายการจองก่อนเข้าพัก</p>
                  </div>
                  <button className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-md transition-colors">
                    เพิ่ม
                  </button>
                </div>
                <div className="p-4 bg-gray-50 min-h-[100px]">
                   {/* Table Header Mockup */}
                   <div className="grid grid-cols-6 gap-2 text-xs text-gray-500 font-medium mb-2 px-2">
                      <div className="col-span-1">เลขที่ / วันที่จอง</div>
                      <div>ประเภท</div>
                      <div>ลูกค้า</div>
                      <div>วันที่เข้าพัก</div>
                      <div>ราคา</div>
                      <div>สถานะ</div>
                   </div>
                   {/* Empty State placeholder */}
                   <div className="bg-white h-12 rounded border border-gray-200 w-full mb-2"></div>
                </div>
              </div>

              {/* Card 2: รายชื่อคนจองรอเข้าพัก (Duplicate UI as per image) */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-700">รายชื่อคนจองรอเข้าพัก</h3>
                </div>
                <div className="p-4 bg-gray-50 min-h-[100px]">
                   <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 font-medium mb-2 px-2">
                      <div>วันที่เข้าพัก</div>
                      <div>ประเภท</div>
                      <div>ลูกค้า</div>
                   </div>
                   <div className="bg-white h-12 rounded border border-gray-200 w-full mb-2"></div>
                   
                   <div className="flex justify-end mt-2">
                     <button className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-md transition-colors">
                       ดูทั้งหมด
                     </button>
                   </div>
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