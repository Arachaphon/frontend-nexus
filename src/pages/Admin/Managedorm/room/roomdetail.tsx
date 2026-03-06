import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link} from 'react-router-dom';
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

interface Room {
  id: string;
  room_number: string;
  status: string;
  current_rent_price: number;
}

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  contract_id: string;
  is_primary: number;
}

interface Contract {
  id: string;
  room_id: string;
  rent_price: number;
  check_in_date: string;
  check_out_date: string | null;
}

export default function RoomDetail() {
  const { dormitoryId, roomId, contractId } = useParams();

  const [dormitoryName, setDormitoryName] = useState<string>('');
  const [room, setRoom] = useState<Room | null>(null); 
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [contract, setContract] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = window.__ENV__?.API_BASE ;

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

      const [dormRes, roomRes , tenantRes, contractRes] = await Promise.all([
        fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, { method: 'GET', headers }),
        fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}/${roomId}`, { method: 'GET', headers }),
        fetch(`${API_BASE}/api/rentals/tenants/dormitories/${dormitoryId}/rooms/${roomId}`, { method: 'GET', headers }),
        fetch(`${API_BASE}/api/rentals/contracts/dormitories/${dormitoryId}/rooms/${roomId}`, { method: 'GET', headers }),
      ]);

      if (!dormRes.ok || !roomRes.ok || !contractRes.ok || !tenantRes.ok) throw new Error('API request failed');

      const dormData = await dormRes.json();
      const roomData = await roomRes.json();
      const tenantData = await tenantRes.json();
      const contractData = await contractRes.json();

      setDormitoryName(dormData.data?.name || dormData.name || '');
      setRoom(roomData.data);
      setTenants(tenantData.data || []);
      setContract(contractData.data) 

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }, [dormitoryId, roomId, contractId, API_BASE]);

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
              <span className="text-gray-700 font-medium">ข้อมูล ห้อง {room?.room_number}</span>
            </div>
            <hr className="border-gray-300 w-full" />
          </div>

          {/* Room Title & Status */}
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-2xl font-bold text-gray-700">ห้อง : {room?.room_number}</h1>
            <span className="bg-cyan-50 text-cyan-600 border border-cyan-100 px-3 py-1 rounded-md text-sm font-bold shadow-sm">
              {room?.status === 'vacant' ? 'ว่าง' : room?.status === 'occupied' ? 'ไม่ว่าง' : '-'}
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
                      {contract.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-gray-400">ไม่มีสัญญา</td>
                        </tr>
                      ) : (
                        contract.map((con) => (
                          <tr key={con.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4">
                              <div className="text-gray-600">เข้า: {con.check_in_date}</div>
                              <div className="text-gray-600">ออก: {con.check_out_date ?? '-'}</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1 text-blue-600 font-medium">
                                <Calendar size={14} /> รายเดือน
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {tenants?.filter(t => t.is_primary === 1).map(t => (
                                <div key={t.id}>
                                  <div className="text-gray-800 font-medium">{t.first_name} {t.last_name}</div>
                                  <div className="text-gray-400 flex items-center gap-1">
                                    <Phone size={12}/> {t.phone_number}
                                  </div>
                                </div>
                              ))}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <Link to={`/manage/${dormitoryId}/room/${roomId}/roominfo/${con.id}`}
                                className="text-gray-500 underline hover:text-emerald-600 font-medium"
                              >
                                รายละเอียด
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
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