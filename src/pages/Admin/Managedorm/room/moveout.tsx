import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

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
  payment_status: string;
}

interface Contract {
  id: string;
  security_deposit: number;
  check_out_date: string | null;
}

export default function MoveOut() {
  const { dormitoryId, roomId, contractId } = useParams();
  const navigate = useNavigate();

  const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

  const [dormitoryName, setDormitoryName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [contract, setContract] = useState<Contract | null>(null);
  const [pendingBills, setPendingBills] = useState<Bill[]>([]);
  const [moveOutDate, setMoveOutDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ─── Fetch ────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      if (!dormitoryId || !roomId || !contractId) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const [dormRes, roomRes, contractRes, billsRes] = await Promise.all([
          fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, { headers }),
          fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}/${roomId}`, { headers }),
          fetch(`${API_BASE}/api/rentals/contracts/dormitories/${dormitoryId}/rooms/${roomId}`, { headers }),
          fetch(`${API_BASE}/api/bills/${dormitoryId}/bills`, { headers }),
        ]);

        if (dormRes.ok) {
          const d = await dormRes.json();
          setDormitoryName(d.data?.name || d.name || '');
        }
        if (roomRes.ok) {
          const d = await roomRes.json();
          setRoomNumber(d.data?.room_number || '');
        }
        if (contractRes.ok) {
          const d = await contractRes.json();
          const found = (d.data as Contract[])?.find((c) => c.id === contractId) ?? null;
          setContract(found);
          if (found?.check_out_date) setMoveOutDate(found.check_out_date);
        }
        if (billsRes.ok) {
          const d = await billsRes.json();
          // กรอง bills ที่ยัง pending ของ room นี้
          const pending = (d.data as (Bill & { room_id: string })[])?.filter(
            (b) => b.payment_status === 'pending'
          ) ?? [];
          setPendingBills(pending);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dormitoryId, roomId, contractId]);

  // ─── คำนวณ ────────────────────────────────────────────────
  const securityDeposit = contract?.security_deposit ?? 0;
  const pendingTotal = pendingBills.reduce((sum, b) => sum + b.total_amount, 0);
  const refundAmount = securityDeposit - pendingTotal;

  // ─── บันทึกย้ายออก ────────────────────────────────────────
  const handleSave = async () => {
    if (!moveOutDate) {
      setError('กรุณาระบุวันที่ออก');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // 1. อัปเดต check_out_date ก่อน (ถ้ายังไม่ได้ set)
      await fetch(
        `${API_BASE}/api/rentals/contracts/dormitories/${dormitoryId}/contracts/${contractId}/checkout`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ check_out_date: moveOutDate }),
        }
      );

      // 2. ลบสัญญา + ผู้เช่า + เปลี่ยนสถานะห้อง
      const deleteRes = await fetch(
        `${API_BASE}/api/rentals/contracts/dormitories/${dormitoryId}/contracts/${contractId}`,
        { method: 'DELETE', headers }
      );
      const deleteData = await deleteRes.json();

      if (!deleteRes.ok || !deleteData.success) {
        setError(deleteData.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        return;
      }

      // 3. ส่งข้อมูลสรุปไปหน้า moveoutdetail
      navigate(
        `/manage/${dormitoryId}/room/${roomId}/roominfo/${contractId}/moveoutdetail`,
        {
          state: {
            moveOutDate,
            securityDeposit,
            pendingTotal,
            refundAmount,
            pendingBills,
          },
        }
      );
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n: number) =>
    n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtDate = (d: string) => {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
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
                  <Home className="w-4 h-4" /><span>ห้อง</span>
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to={`/manage/${dormitoryId}/room/${roomId}`} className="hover:text-emerald-600">
                  ข้อมูล ห้อง {roomNumber || roomId}
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to={`/manage/${dormitoryId}/room/${roomId}/roominfo/${contractId}`} className="hover:text-emerald-600">
                  ข้อมูลสัญญา
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-800 font-medium">ย้ายออก</span>
              </div>
              <hr className="border-gray-300 w-full" />
            </div>

            {loading ? (
              <div className="text-center py-20 text-gray-400 text-sm animate-pulse">กำลังโหลด...</div>
            ) : (
              <div className="space-y-6">

                {/* กล่อง 1: ใบแจ้งหนี้ค้างชำระ */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-8">
                  <h3 className="text-lg font-normal text-gray-700 mb-4">ใบแจ้งหนี้ค้างชำระ</h3>
                  <hr className="border-gray-300 w-full mb-6" />
                  <div className="w-full text-sm">
                    <div className="grid grid-cols-3 bg-[#dcdcdc] text-gray-800 py-3 px-6 font-medium">
                      <div>เลขที่</div>
                      <div className="text-center">วันที่</div>
                      <div className="text-right">ยอดเงิน</div>
                    </div>

                    {pendingBills.length === 0 ? (
                      <div className="grid grid-cols-3 py-5 px-6 border-b border-gray-100">
                        <div className="text-gray-400 col-span-2">ไม่มีใบแจ้งหนี้ค้างชำระ</div>
                        <div className="text-right text-emerald-600 font-medium">0.00</div>
                      </div>
                    ) : (
                      <>
                        {pendingBills.map((bill) => (
                          <div key={bill.id} className="grid grid-cols-3 py-4 px-6 border-b border-gray-100">
                            <div className="text-gray-700 font-mono text-xs">{bill.id.slice(0, 8).toUpperCase()}</div>
                            <div className="text-center text-gray-500">{fmtDate(bill.bill_date)}</div>
                            <div className="text-right text-red-500 font-medium">{fmt(bill.total_amount)}</div>
                          </div>
                        ))}
                        <div className="grid grid-cols-3 py-3 px-6 bg-gray-50">
                          <div className="col-span-2 text-right text-gray-600 font-medium pr-4">รวมค้างชำระ</div>
                          <div className="text-right text-red-500 font-semibold">{fmt(pendingTotal)}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* กล่อง 2: เงินประกัน */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-8">
                  <h3 className="text-lg font-normal text-gray-700 mb-4">เงินประกัน: ที่ผู้เช่าชำระตอนเข้าพัก</h3>
                  <hr className="border-gray-300 w-full mb-6" />
                  <div className="text-right text-red-500 text-xl font-medium">
                    เงินประกัน {fmt(securityDeposit)} บาท
                  </div>
                </div>

                {/* กล่อง 3: สรุปค่าใช้จ่าย */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-10 flex flex-col items-center text-center">
                  <h3 className="text-gray-800 text-lg font-medium mb-2">
                    สรุปค่าใช้จ่าย{' '}
                    {refundAmount >= 0
                      ? <span className="text-emerald-600">คืนเงิน {fmt(refundAmount)} บาท</span>
                      : <span className="text-red-500">ค้างชำระเพิ่ม {fmt(Math.abs(refundAmount))} บาท</span>
                    }
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    คำนวณจาก เงินประกัน ({fmt(securityDeposit)}) − ยอดรวมใบแจ้งหนี้ค้างชำระ ({fmt(pendingTotal)})
                  </p>

                  <hr className="border-gray-300 w-full mb-6" />

                  {pendingBills.length > 0 && (
                    <p className="text-red-500 text-sm mb-8 font-medium">
                      ในกรณีที่มีใบแจ้งหนี้ค้างชำระ เมื่อกดปุ่มย้ายออก ใบแจ้งหนี้จะถูกทำการรับเงินให้อัตโนมัติ
                    </p>
                  )}

                  {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <label className="text-sm font-medium text-gray-800">วันที่ออก</label>
                    <input
                      type="date"
                      value={moveOutDate}
                      onChange={(e) => setMoveOutDate(e.target.value)}
                      className="border border-gray-400 rounded-md px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                    />
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-[#75706b] hover:bg-[#5a5652] disabled:opacity-50 text-white text-sm py-2 px-8 rounded-md transition-colors shadow-sm"
                    >
                      {saving ? 'กำลังบันทึก...' : 'บันทึก / ย้ายออก'}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}