import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, ChevronRight, Calendar, Phone, User, AlertCircle } from 'lucide-react';
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
  const { dormitoryId, roomId } = useParams();

  const [dormitoryName, setDormitoryName] = useState<string>('');
  const [room, setRoom] = useState<Room | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [contract, setContract] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = window.__ENV__?.API_BASE;

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

      const [dormRes, roomRes, tenantRes, contractRes] = await Promise.all([
        fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, { method: 'GET', headers }),
        fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}/${roomId}`, { method: 'GET', headers }),
        fetch(`${API_BASE}/api/rentals/tenants/dormitories/${dormitoryId}/rooms/${roomId}`, { method: 'GET', headers }),
        fetch(`${API_BASE}/api/rentals/contracts/dormitories/${dormitoryId}/rooms/${roomId}`, { method: 'GET', headers }),
      ]);

      // redirect ถ้า 403
      if (dormRes.status === 403 || roomRes.status === 403) {
        window.location.href = '/homemain';
        return;
      }

      // ข้อมูลหลักต้องโหลดได้
      if (!dormRes.ok) throw new Error(`ไม่สามารถโหลดข้อมูลหอพักได้ (${dormRes.status})`);
      if (!roomRes.ok) throw new Error(`ไม่สามารถโหลดข้อมูลห้องได้ (${roomRes.status})`);

      const dormData = await dormRes.json();
      const roomData = await roomRes.json();
      setDormitoryName(dormData.data?.name || dormData.name || '');
      setRoom(roomData.data);

      // tenant และ contract — ถ้า error แสดงเป็น [] ไม่ crash
      if (tenantRes.ok) {
        const tenantData = await tenantRes.json();
        setTenants(tenantData.data || []);
      } else {
        setTenants([]);
      }

      if (contractRes.ok) {
        const contractData = await contractRes.json();
        setContract(contractData.data || []);
      } else {
        setContract([]);
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิด');
    } finally {
      setLoading(false);
    }
  }, [dormitoryId, roomId, API_BASE]);

  useEffect(() => {
    fetchRoomDetail();
  }, [fetchRoomDetail]);

  const getTenantsForContract = (contractId: string) =>
    tenants
      .filter((t) => t.contract_id === contractId)
      .sort((a, b) => b.is_primary - a.is_primary);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50">
            <div className="text-emerald-600 text-sm font-medium animate-pulse">กำลังโหลด...</div>
          </div>
        )}

        <div className="flex-grow px-6 py-6 overflow-y-auto">

          {/* Error state — แสดงแทนหน้าขาว */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-gray-500 text-sm">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={fetchRoomDetail}
                  className="text-sm text-emerald-600 underline hover:text-emerald-800"
                >
                  ลองใหม่
                </button>
                <Link
                  to={`/manage/${dormitoryId}`}
                  className="text-sm text-gray-500 underline hover:text-gray-700"
                >
                  กลับหน้ารายการห้อง
                </Link>
              </div>
            </div>
          )}

          {/* Main content */}
          {!error && !loading && (
            <>
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

                {/* Left: Contract Actions */}
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

                {/* Right: Tenants */}
                <div className="lg:col-span-9 flex flex-col gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                      <h3 className="font-semibold text-gray-700">ผู้เช่าปัจจุบัน</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#f2f2f2] text-gray-600 font-medium border-b">
                          <tr>
                            <th className="px-4 py-3">วันที่เข้า/ออก</th>
                            <th className="px-4 py-3">ประเภท</th>
                            <th className="px-4 py-3">ผู้เช่าทั้งหมด</th>
                            <th className="px-4 py-3 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {contract.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                ยังไม่มีสัญญา
                              </td>
                            </tr>
                          ) : (
                            contract.map((con) => {
                              const contractTenants = getTenantsForContract(con.id);
                              return (
                                <tr key={con.id} className="hover:bg-gray-50 transition-colors align-top">
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-gray-600">เข้า: {con.check_in_date}</div>
                                    <div className="text-gray-600">ออก: {con.check_out_date ?? '-'}</div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-1 text-blue-600 font-medium whitespace-nowrap">
                                      <Calendar size={14} /> รายเดือน
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    {contractTenants.length === 0 ? (
                                      <span className="text-gray-400">ไม่มีผู้เช่า</span>
                                    ) : (
                                      <div className="flex flex-col gap-2">
                                        {contractTenants.map((t) => (
                                          <Link
                                            key={t.id}
                                            to={`/manage/${dormitoryId}/room/${roomId}/tenant/${t.id}`}
                                            className="flex items-start gap-2 group hover:bg-emerald-50 rounded-md p-1.5 -mx-1.5 transition-colors"
                                          >
                                            <div className="mt-0.5 text-gray-400 group-hover:text-emerald-500">
                                              <User size={14} />
                                            </div>
                                            <div>
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-gray-800 font-medium group-hover:text-emerald-700">
                                                  {t.first_name} {t.last_name}
                                                </span>
                                                {t.is_primary === 1 ? (
                                                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                                                    ผู้เช่าหลัก
                                                  </span>
                                                ) : (
                                                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-semibold">
                                                    ผู้เช่าร่วม
                                                  </span>
                                                )}
                                              </div>
                                              <div className="text-gray-400 flex items-center gap-1 mt-0.5">
                                                <Phone size={11} /> {t.phone_number}
                                              </div>
                                            </div>
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-4 text-right align-top">
                                    <Link
                                      to={`/manage/${dormitoryId}/room/${roomId}/roominfo/${con.id}`}
                                      className="text-gray-500 underline hover:text-emerald-600 font-medium whitespace-nowrap"
                                    >
                                      รายละเอียด
                                    </Link>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
}