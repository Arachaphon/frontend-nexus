import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Home, ChevronRight, Calendar, Phone, LayoutGrid } from 'lucide-react';
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

export default function RoomDetail() {
  const { dormitoryId, roomId } = useParams();
  const navigate = useNavigate();

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
      if (!token) throw new Error('Authentication token not found');

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const [dormRes, roomRes] = await Promise.all([
        fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, { method: 'GET', headers }),
        fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}/${roomId}`, { method: 'GET', headers }),
      ]);

      if (!dormRes.ok || !roomRes.ok) throw new Error('API request failed');

      const dormData = await dormRes.json();
      const roomData = await roomRes.json();

      // ดักโครงสร้างข้อมูลเผื่อกรณี API ส่งกลับมาต่างกัน
      setDormitoryName(dormData.data?.name || dormData.name || '');
      setRoomNumber(roomData.data?.room_number || roomData.room_number || '');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }, [dormitoryId, roomId, API_BASE]);

  useEffect(() => {
    fetchRoomDetail();
  }, [fetchRoomDetail]);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />

        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50">
            <div className="text-emerald-600 text-sm font-medium animate-pulse">Loading...</div>
          </div>
        )}

        <div className="flex-grow px-6 py-6 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="mb-8 w-full">
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
              <Link to={`/manage/${dormitoryId}`} className="hover:text-emerald-600 flex items-center gap-1.5">
                <Home className="w-4 h-4" />
                <span>ห้อง</span>
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700 font-medium">ข้อมูล ห้อง {roomNumber}</span>
            </div>
            <hr className="border-gray-300 w-full" />
          </div>

          {/* Room Title & Status */}
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-2xl font-bold text-gray-700">ห้อง : {roomNumber}</h1>
            <span className="bg-cyan-50 text-cyan-600 border border-cyan-100 px-3 py-1 rounded-md text-sm font-bold shadow-sm">
              ว่าง
            </span>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Contract Actions */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit sticky top-6">
                <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">รายละเอียดสัญญา</h3>
                <Link 
                  to={`/manage/${dormitoryId}/room/${roomId}/addcontract`}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  เพิ่มสัญญา
                </Link>
              </div>
            </div>

            {/* Right Column: Waiting Lists & Tenants */}
            <div className="lg:col-span-9 flex flex-col gap-6">
              {/* Card 1: ผู้เช่าปัจจุบัน */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                

                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                  <div>
                    <h3 className="font-semibold text-gray-700">ผู้เช่าปัจจุบัน</h3>
                    
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#f2f2f2] text-gray-600 font-medium border-b">
                      <tr>
                        <th className="px-4 py-3">วันที่เข้า/ออก</th>
                        <th className="px-4 py-3">ประเภท</th>
                        <th className="px-4 py-3">ลูกค้า</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {/* ข้อมูล Mockup ตัวอย่าง */}
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="text-gray-600">เข้า: 10-10-1010</div>
                          <div className="text-gray-600">ออก: 30-6-2569</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-blue-600 font-medium">
                            <Calendar size={14} /> รายเดือน
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-gray-800 font-medium">นาย ก</div>
                          <div className="text-gray-400 flex items-center gap-1"><Phone size={12}/> 0123456789</div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link 
                            to={`/manage/${dormitoryId}/room/${roomId}/roominfo`}
                            className="text-gray-500 underline hover:text-emerald-600 font-medium"
                          >
                            รายละเอียด
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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