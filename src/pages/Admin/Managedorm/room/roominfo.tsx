import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, ChevronRight, Waves, Flame, Phone, X } from 'lucide-react';

import C_HomeMain from '../../../../components/C_homemain';
import Footer from '../../../../components/Footerhomemain';
import Sidebar from '../../../../components/Sidebar';

declare global {
  interface Window {
    __ENV__: { API_BASE: string };
  }
}

interface Room {
  id: string;
  room_number: string;
  status: string;
}

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

interface Contract {
  id: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string | null;
  rent_price: number;
  security_deposit: number;
  booking_fee: number;
}

interface Meter {
  id: string;
  water_unit_current: number;
  electric_unit_current: number;
}

const statusMap: Record<string, string> = {
  vacant: 'ว่าง',
  occupied: 'ไม่ว่าง',
};

export default function RoomInfo() {
  const { dormitoryId, roomId, contractId } = useParams();

  const [dormitoryName, setDormitoryName] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [meters, setMeters] = useState<Meter | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = window.__ENV__?.API_BASE;

  const [isMoveOutOpen, setIsMoveOutOpen] = useState(false);
  const [moveOutDate, setMoveOutDate] = useState('');
  const [moveOutSaving, setMoveOutSaving] = useState(false);
  const [moveOutError, setMoveOutError] = useState('');

  useEffect(() => {
    const fetchInfo = async () => {
      if (!dormitoryId || !roomId || !contractId) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
        
        const [dormRes, roomRes, tenantRes, contractRes, meterRes] = await Promise.all([
          fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, { headers }),
          fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}/${roomId}`, { headers }),
          fetch(`${API_BASE}/api/rentals/tenants/dormitories/${dormitoryId}/rooms/${roomId}`, { headers }),
          fetch(`${API_BASE}/api/rentals/contracts/dormitories/${dormitoryId}/rooms/${roomId}`, { headers }),
          fetch(`${API_BASE}/api/meters/${dormitoryId}/contracts/${contractId}`, { headers }),
        ]);
        
        if ([dormRes, roomRes, tenantRes, contractRes].some((r) => r.status === 403)) {
          window.location.href = '/homemain';
          return;
        }

        const dormData = await dormRes.json();
        const roomData = await roomRes.json();
        const tenantData = await tenantRes.json();
        const contractData = await contractRes.json();
        const meterData = await meterRes.json();

        setDormitoryName(dormData.name);
        setRoom(roomData.data);
        setTenants(tenantData.data?.filter((t: any) => t.contract_id === contractId) || []);
        const sel = contractData.data?.find((c: Contract) => c.id === contractId) || null;
        setContract(sel);
        if (sel?.check_out_date) setMoveOutDate(sel.check_out_date);
        setMeters(meterData.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [dormitoryId, roomId, contractId]);

  const handleSaveMoveOut = async () => {
    if (!moveOutDate) {
      setMoveOutError('กรุณาระบุวันที่แจ้งย้ายออก');
      return;
    }
    setMoveOutSaving(true);
    setMoveOutError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_BASE}/api/rentals/contracts/dormitories/${dormitoryId}/contracts/${contractId}/checkout`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ check_out_date: moveOutDate }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMoveOutError(data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        return;
      }
      setContract((prev) => prev ? { ...prev, check_out_date: moveOutDate } : prev);
      setIsMoveOutOpen(false);
    } catch {
      setMoveOutError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setMoveOutSaving(false);
    }
  };

  const formatDate = (d: string | null | undefined) => {
    if (!d) return '-';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden relative">

      {/* ══ Modal: แจ้งย้ายออก ══════════════════════════════ */}
      {isMoveOutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-[450px] max-w-[90%] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">แจ้งย้ายออก</h3>
              <button onClick={() => setIsMoveOutOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่แจ้งย้ายออก<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={moveOutDate}
                onChange={(e) => setMoveOutDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {moveOutError && <p className="text-red-500 text-xs mt-2">{moveOutError}</p>}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setIsMoveOutOpen(false)}
                className="px-6 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ปิด
              </button>
              <button
                onClick={handleSaveMoveOut}
                disabled={moveOutSaving}
                className="px-6 py-2 text-sm font-medium text-white bg-[#75706b] rounded-md hover:bg-[#5a5652] disabled:opacity-50"
              >
                {moveOutSaving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ══ Layout ═══════════════════════════════════════════ */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />

        <div className="flex-1 overflow-y-auto">
          <div className="flex-grow px-6 py-6">

            {/* Breadcrumb */}
            <div className="mb-8 w-full">
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                <Link to={`/manage/${dormitoryId}`} className="hover:text-emerald-600 flex items-center gap-1.5">
                  <Home className="w-4 h-4" /><span>ห้อง</span>
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to={`/manage/${dormitoryId}/room/${roomId}`} className="hover:text-emerald-600">
                  ข้อมูล ห้อง {room?.room_number}
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-800 font-medium">ข้อมูลสัญญา</span>
              </div>
              <hr className="border-gray-300 w-full" />
            </div>

            {/* Grid 2 ฝั่ง */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

              {/* ══ ฝั่งซ้าย: ข้อมูลห้อง/สัญญา ══════════════ */}
              <div className="xl:col-span-5 bg-white rounded-md shadow-sm border border-gray-200 p-6 flex flex-col h-full">

                {/* Header ห้อง */}
                <div className="flex items-start sm:items-center gap-3 mb-4 flex-col sm:flex-row">
                  <h2 className="text-2xl font-normal text-gray-800 break-all">ห้อง : {room?.room_number}</h2>
                  <span className="bg-[#ff9b50] text-white text-xs px-3 py-1 rounded-sm whitespace-nowrap mt-1 sm:mt-0">
                    {statusMap[room?.status ?? ''] ?? '-'}
                  </span>
                </div>

                <hr className="border-gray-300 w-full mb-2" />

                <div className="flex justify-end mb-2">
                  <Link to={`/manage/${dormitoryId}/room/${roomId}/editcontract/${contractId}`} className="text-sm font-semibold text-gray-600 underline hover:text-gray-900">
                    แก้ไข
                  </Link>
                </div>

                {/* ข้อมูลสัญญา */}
                <div className="space-y-4 text-gray-700 mb-8 flex-grow">
                  {[
                    { label: 'ประเภท', value: 'รายเดือน' },
                    { label: 'เริ่มต้น', value: formatDate(contract?.check_in_date) },
                    { label: 'สิ้นสุด', value: formatDate(contract?.check_out_date) },
                    { label: 'ค่าห้อง', value: contract?.rent_price },
                    { label: 'เงินประกัน', value: contract?.security_deposit },
                    { label: 'เงินล่วงหน้า', value: contract?.booking_fee },
                  ].map((row) => (
                    <div key={row.label} className="border-b border-gray-100 pb-2">
                      <span className="mr-2 font-medium">{row.label} :</span> {row.value ?? '-'}
                    </div>
                  ))}
                </div>

                {/* เลขมิเตอร์ */}
                <div className="mb-4 flex justify-between items-center mt-auto">
                  <h3 className="text-gray-800 font-medium">เลขมิเตอร์วันเข้าพัก</h3>
                  <Link to={`/manage/${dormitoryId}/room/${roomId}/editmeter/${contractId}`}  className="text-sm text-gray-600 underline hover:text-gray-900">
                    แก้ไข
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="border border-gray-400 rounded-lg p-3 flex flex-col justify-center items-center h-24">
                    <div className="flex w-full justify-between items-center px-2">
                      <Waves className="w-10 h-10 text-blue-500" strokeWidth={2.5} />
                      <div className="text-center">
                        <div className="text-xl font-semibold text-gray-800">{meters?.water_unit_current ?? '-'}</div>
                        <div className="text-sm text-gray-500">ค่าน้ำ</div>
                      </div>
                    </div>
                  </div>
                  <div className="border border-gray-400 rounded-lg p-3 flex flex-col justify-center items-center h-24">
                    <div className="flex w-full justify-between items-center px-2">
                      <Flame className="w-10 h-10 text-orange-500" fill="currentColor" />
                      <div className="text-center">
                        <div className="text-xl font-semibold text-gray-800">{meters?.electric_unit_current ?? '-'}</div>
                        <div className="text-sm text-gray-500">ค่าไฟ</div>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200 mb-6" />

                {/* ══ แจ้งย้ายออก + ยกเลิกสัญญา ══ */}
                <div className="mb-2">
                  <h3 className="text-gray-800 font-medium mb-4">แจ้งย้ายออก</h3>
                  <div className="flex flex-col gap-4 items-center">

                    {/* แสดงวันที่ที่บันทึกแล้ว หรือปุ่มแจ้งย้ายออก */}
                    {contract?.check_out_date ? (
                      <div className="flex flex-col items-center gap-3 mb-2">
                        <span className="text-[22px] font-normal text-black">
                          {formatDate(contract.check_out_date)}
                        </span>
                        <button
                          onClick={() => { setMoveOutError(''); setIsMoveOutOpen(true); }}
                          className="px-6 py-2 text-sm text-gray-400 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors"
                        >
                          แก้ไขวันที่แจ้งย้ายออก
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setMoveOutError(''); setIsMoveOutOpen(true); }}
                        className="w-32 py-2 text-sm text-gray-400 border border-gray-200 rounded-md bg-gray-50/50 hover:bg-gray-100 transition-colors"
                      >
                        แจ้งย้ายออก
                      </button>
                    )}

                    {/* ปุ่มยกเลิกสัญญา → ไปหน้า moveout */}
                    <Link
                      to={`/manage/${dormitoryId}/room/${roomId}/roominfo/${contractId}/moveout`}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-6 rounded-md transition-colors w-full max-w-[200px] text-center"
                    >
                      ยกเลิกสัญญา / ย้ายออก
                    </Link>

                  </div>
                </div>
              </div>

              {/* ══ ฝั่งขวา: ข้อมูลผู้เช่า ══════════════════ */}
              <div className="xl:col-span-7">
                <div className="bg-white rounded-md shadow-sm border-2 p-6 h-full flex flex-col relative">
                  <div className="mb-6">
                    <h3 className="text-xl font-medium text-gray-800 mb-1">ข้อมูลผู้เช่า</h3>
                    <p className="text-xs text-gray-500">กรณีมีผู้เช่าหลายคนสามารถเพิ่มข้อมูลผู้เช่าท่านอื่นได้</p>
                  </div>

                  <div className="w-full border border-gray-300 rounded-md overflow-hidden mb-4 text-sm">
                    <div className="grid grid-cols-3 bg-[#e5e5e5] text-gray-700 border-b border-gray-300">
                      <div className="px-4 py-2 font-medium">ชื่อ</div>
                      <div className="px-4 py-2 font-medium flex justify-start items-center gap-1">
                        <Phone className="w-3 h-3" /> เบอร์
                      </div>
                      <div className="px-4 py-2 font-medium text-right"></div>
                    </div>

                    {tenants.length === 0 ? (
                      <div className="px-4 py-4 text-center text-gray-400 text-sm">ไม่มีผู้เช่า</div>
                    ) : (
                      tenants.map((tenant) => (
                        <div key={tenant.id} className="grid grid-cols-3 bg-white border-b border-gray-200">
                          <div className="px-4 py-3">{tenant.first_name} {tenant.last_name}</div>
                          <div className="px-4 py-3">{tenant.phone_number}</div>
                          <div className="px-4 py-3 text-right">
                            <Link to={`/manage/${dormitoryId}/room/${roomId}/tenant/${tenant.id}`} className="text-emerald-600 hover:underline">
                              ข้อมูล
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-auto flex justify-end">
                    <Link to={`/manage/${dormitoryId}/room/${roomId}/addtenant/${contractId}`}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors text-sm"
                    >
                      เพิ่ม
                    </Link>
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