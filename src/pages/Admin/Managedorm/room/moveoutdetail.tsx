import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

import C_HomeMain from '../../../../components/C_homemain';
import Footer from '../../../../components/Footerhomemain';
import Sidebar from '../../../../components/Sidebar';

declare global {
  interface Window { __ENV__: { API_BASE: string } }
}

interface Bill {
  id: string;
  bill_date: string;
  total_amount: number;
}

interface LocationState {
  moveOutDate: string;
  securityDeposit: number;
  pendingTotal: number;
  refundAmount: number;
  pendingBills: Bill[];
}

export default function MoveOutDetail() {
  const { dormitoryId, roomId } = useParams();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [dormitoryName, setDormitoryName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

  useEffect(() => {
    const fetchStats = async () => {
      if (!dormitoryId) return;
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [dormRes, roomRes] = await Promise.all([
          fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, { headers }),
          fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}/${roomId}`, { headers }),
        ]);
        if (dormRes.ok) {
          const d = await dormRes.json();
          setDormitoryName(d.data?.name || d.name || '');
        }
        if (roomRes.ok) {
          const d = await roomRes.json();
          setRoomNumber(d.data?.room_number || '');
        }
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, [dormitoryId, roomId, API_BASE]);

  const fmt = (n: number) =>
    n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtDate = (d: string) => {
    if (!d) return '-';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  // fallback ถ้าไม่มี state (เช่น refresh หน้า)
  if (!state) {
    return (
      <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />
          <div className="flex-1 flex items-center justify-center flex-col gap-4 text-gray-400">
            <p>ไม่พบข้อมูลการย้ายออก</p>
            <Link to={`/manage/${dormitoryId}`} className="text-emerald-600 underline text-sm">
              กลับไปหน้าจัดการหอพัก
            </Link>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  const { moveOutDate, securityDeposit, pendingTotal, refundAmount, pendingBills } = state;
  const isRefund = refundAmount >= 0;

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
                  <Home className="w-4 h-4" /><span>ห้อง</span>
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to={`/manage/${dormitoryId}`} className="hover:text-emerald-600">
                  ข้อมูล ห้อง {roomNumber || roomId}
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-800 font-medium">สรุปการย้ายออก</span>
              </div>
              <hr className="border-gray-300 w-full" />
            </div>

            {/* Success banner */}
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-md px-6 py-4 mb-6">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-emerald-700 font-medium text-sm">ย้ายออกเรียบร้อยแล้ว</p>
                <p className="text-emerald-600 text-xs mt-0.5">
                  วันที่ออก: {fmtDate(moveOutDate)} — ห้องถูกเปลี่ยนสถานะเป็น <span className="font-semibold">ว่าง</span> แล้ว
                </p>
              </div>
            </div>

            {/* กล่องสรุป */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-8 mb-6">
              <h3 className="text-lg font-normal text-gray-700 mb-4">รายละเอียดการย้ายออก</h3>
              <hr className="border-gray-300 w-full mb-6" />

              <div className="w-full text-sm">
                {/* Header */}
                <div className="grid grid-cols-3 bg-[#e5e5e5] text-gray-800 py-3 px-6 font-medium border-t border-b border-gray-300">
                  <div>รายการ</div>
                  <div className="text-center">วันที่</div>
                  <div className="text-right">ยอดเงิน (บาท)</div>
                </div>

                {/* เงินประกัน */}
                <div className="grid grid-cols-3 py-4 px-6 border-b border-gray-100 items-center">
                  <div className="text-gray-700 font-medium">เงินประกัน</div>
                  <div className="text-center text-gray-400">-</div>
                  <div className="text-right text-red-500 font-medium">{fmt(securityDeposit)}</div>
                </div>

                {/* bills ค้างชำระ */}
                {pendingBills.length > 0 && (
                  <>
                    <div className="px-6 py-2 bg-gray-50 text-xs text-gray-500 font-medium">
                      ใบแจ้งหนี้ที่หักจากเงินประกัน
                    </div>
                    {pendingBills.map((bill) => (
                      <div key={bill.id} className="grid grid-cols-3 py-4 px-6 border-b border-gray-100 items-center">
                        <div className="text-gray-500 font-mono text-xs">
                          #{bill.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="text-center text-gray-400">{fmtDate(bill.bill_date)}</div>
                        <div className="text-right text-gray-700">−{fmt(bill.total_amount)}</div>
                      </div>
                    ))}
                  </>
                )}

                {/* สรุปยอด */}
                <div className="grid grid-cols-3 py-5 px-6 bg-gray-50 border-t border-gray-200 items-center">
                  <div className="col-span-2 text-right pr-4 font-semibold text-gray-700">
                    {isRefund ? 'ยอดเงินคืนให้ผู้เช่า' : 'ผู้เช่าต้องชำระเพิ่ม'}
                  </div>
                  <div className={`text-right text-lg font-bold ${isRefund ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isRefund ? '+' : '-'}{fmt(Math.abs(refundAmount))}
                  </div>
                </div>
              </div>
            </div>

            {/* ปุ่มกลับ */}
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