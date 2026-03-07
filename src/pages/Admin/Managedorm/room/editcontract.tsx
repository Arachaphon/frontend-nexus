import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

import C_HomeMain from '../../../../components/C_homemain';
import Footer from '../../../../components/Footerhomemain';
import Sidebar from '../../../../components/Sidebar';

export default function EditContract() {
    const { dormitoryId, roomId, contractId } = useParams();
    const navigate = useNavigate();
    const API_BASE = useRef(window.__ENV__?.API_BASE).current;
    const fetchedRef = useRef(false);

    const [dormitoryName, setDormitoryName] = useState<string>('');
    const [roomNumber, setRoomNumber] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Form states ---
    const [checkInDate, setCheckInDate]   = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [deposit, setDeposit]           = useState<number | ''>('');
    const [monthlyRent, setMonthlyRent]   = useState<number | ''>('');
    const [booking, setBooking]           = useState<number | ''>('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const numDeposit = deposit === '' ? 0 : deposit;
    const numBooking = booking === '' ? 0 : booking;
    const totalToPay = Math.max(0, numDeposit - numBooking);

    useEffect(() => {
        if (fetchedRef.current) return;
        if (!dormitoryId || !roomId || !contractId) return;
        fetchedRef.current = true;

        const fetchInfo = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token not found');
                const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

                const [dormRes, roomRes, contractRes] = await Promise.all([
                    fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, { headers }),
                    fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}/${roomId}`, { headers }),
                    fetch(`${API_BASE}/api/rentals/contracts/dormitories/${dormitoryId}/${contractId}`, { headers }),
                ]);

                if (!dormRes.ok) throw new Error(`ไม่พบข้อมูลหอพัก (${dormRes.status})`);
                if (!roomRes.ok) throw new Error(`ไม่พบข้อมูลห้อง (${roomRes.status})`);
                if (!contractRes.ok) throw new Error(`ไม่พบสัญญา (${contractRes.status})`);

                const dormData     = await dormRes.json();
                const roomData     = await roomRes.json();
                const contractData = await contractRes.json();
                const c = contractData.data;

                setDormitoryName(dormData.name);
                setRoomNumber(roomData.data.room_number);
                setCheckInDate(c.check_in_date ?? '');
                setCheckOutDate(c.check_out_date ?? '');
                setMonthlyRent(c.rent_price ?? '');
                setDeposit(c.security_deposit ?? '');
                setPaymentMethod(c.security_deposit_type ?? '');
                setBooking(c.booking_fee ?? '');
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchInfo();
    }, []);

    const handleSave = async () => {
        const newErrors: { [key: string]: string } = {};
        if (!checkInDate) newErrors.checkInDate = 'กรุณาระบุวันที่เข้าพัก';
        if (checkOutDate && checkOutDate <= checkInDate) newErrors.checkOutDate = 'วันที่ออกต้องมากกว่าวันที่เข้าพัก';
        if (deposit === '') newErrors.deposit = 'กรุณาระบุเงินประกัน';
        if (monthlyRent === '') newErrors.monthlyRent = 'กรุณาระบุค่าเช่าต่อเดือน';
        if (!paymentMethod) newErrors.paymentMethod = 'กรุณาเลือกช่องทางการชำระเงิน';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            setSaving(true);
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication token not found');

            const res = await fetch(
                `${API_BASE}/api/rentals/contracts/dormitories/${dormitoryId}/contracts/${contractId}/edit`,
                {
                    method: 'PATCH',
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        check_in_date: checkInDate,
                        check_out_date: checkOutDate || null,
                        rent_price: monthlyRent,
                        security_deposit: deposit,
                        security_deposit_type: paymentMethod,
                        booking_fee: booking || 0,
                    }),
                }
            );

            if (!res.ok) {
                let errMsg = 'ไม่สามารถบันทึกข้อมูลได้';
                const ct = res.headers.get('content-type') || '';
                if (ct.includes('application/json')) {
                    const data = await res.json();
                    errMsg = data.error || errMsg;
                }
                throw new Error(errMsg);
            }

            navigate(`/manage/${dormitoryId}/room/${roomId}/roominfo/${contractId}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unexpected Error occurred');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />
                {loading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50">
                        <div className="text-gray-600 text-sm font-medium">Loading...</div>
                    </div>
                )}
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
                                    ข้อมูล ห้อง {roomNumber || '-'}
                                </Link>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <Link to={`/manage/${dormitoryId}/room/${roomId}/roominfo/${contractId}`} className="hover:text-emerald-600">
                                    ข้อมูลสัญญา
                                </Link>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 font-medium">แก้ไขสัญญา</span>
                            </div>
                            <hr className="border-gray-300 w-full" />
                        </div>

                        <div className="max-w-5xl mx-auto mt-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">

                                {error && (
                                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">{error}</div>
                                )}

                                <h3 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">สัญญารายเดือน</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">วันที่เข้าพัก <span className="text-red-500">*</span></label>
                                        <input type="date" value={checkInDate}
                                            onChange={(e) => { setCheckInDate(e.target.value); if (errors.checkInDate) setErrors({ ...errors, checkInDate: '' }); }}
                                            className={`w-full border ${errors.checkInDate ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-emerald-500`} />
                                        {errors.checkInDate && <p className="text-red-500 text-xs mt-1">{errors.checkInDate}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">วันที่ออก</label>
                                        <input type="date" value={checkOutDate}
                                            onChange={(e) => { setCheckOutDate(e.target.value); if (errors.checkOutDate) setErrors({ ...errors, checkOutDate: '' }); }}
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-emerald-500" />
                                        {errors.checkOutDate && <p className="text-red-500 text-xs mt-1">{errors.checkOutDate}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">เงินประกัน <span className="text-red-500">*</span></label>
                                        <div className={`flex items-center border ${errors.deposit ? 'border-red-500' : 'border-gray-300'} rounded overflow-hidden`}>
                                            <input type="number" min="0" value={deposit}
                                                onChange={(e) => { setDeposit(e.target.value === '' ? '' : Number(e.target.value)); if (errors.deposit) setErrors({ ...errors, deposit: '' }); }}
                                                onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                                className="w-full px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                                            <span className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-l border-gray-300">บาท</span>
                                        </div>
                                        {errors.deposit && <p className="text-red-500 text-xs mt-1">{errors.deposit}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">ค่าเช่าต่อเดือน <span className="text-red-500">*</span></label>
                                        <div className={`flex items-center border ${errors.monthlyRent ? 'border-red-500' : 'border-gray-300'} rounded overflow-hidden`}>
                                            <input type="number" min="0" value={monthlyRent}
                                                onChange={(e) => { setMonthlyRent(e.target.value === '' ? '' : Number(e.target.value)); if (errors.monthlyRent) setErrors({ ...errors, monthlyRent: '' }); }}
                                                onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                                className="w-full px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                                            <span className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-l border-gray-300">บาท</span>
                                        </div>
                                        {errors.monthlyRent && <p className="text-red-500 text-xs mt-1">{errors.monthlyRent}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">เงินจอง</label>
                                        <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                                            <input type="number" value={booking}
                                                onChange={(e) => setBooking(e.target.value === '' ? '' : Number(e.target.value))}
                                                className="w-full px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                                            <span className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-l border-gray-300">บาท</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">ระบุจำนวนเงิน หากลูกค้ามีการโอนจองก่อนเข้าพัก</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">ชำระเงินประกันด้วย <span className="text-red-500">*</span></label>
                                        <select value={paymentMethod}
                                            onChange={(e) => { setPaymentMethod(e.target.value); if (errors.paymentMethod) setErrors({ ...errors, paymentMethod: '' }); }}
                                            className={`w-full border ${errors.paymentMethod ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-emerald-500 bg-white`}>
                                            <option value="">-- เลือก --</option>
                                            <option value="เงินสด">เงินสด</option>
                                            <option value="โอนเงินธนาคาร">โอนเงินธนาคาร</option>
                                        </select>
                                        {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>}
                                    </div>

                                </div>

                                {/* สรุปยอด */}
                                <div className="bg-white border-2 border-emerald-500 rounded-lg p-5 mb-8 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
                                    <h4 className="text-sm font-bold text-gray-800 mb-4">สรุปยอดชำระ</h4>
                                    <div className="flex justify-between items-center mb-2 text-sm">
                                        <span className="text-gray-500">เงินประกัน</span>
                                        <span className="font-medium">{Math.max(0, numDeposit).toLocaleString()} บาท</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-3 text-sm border-b border-gray-100 pb-3">
                                        <span className="text-gray-500">เงินจอง</span>
                                        <span className="font-medium text-red-500">-{numBooking.toLocaleString()} บาท</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-gray-800">รวมที่ต้องชำระ (เก็บเพิ่ม)</span>
                                        <span className="text-emerald-600 text-xl">{totalToPay.toLocaleString()} บาท</span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <Link to={`/manage/${dormitoryId}/room/${roomId}/roominfo/${contractId}`}
                                        className="border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-2 px-6 rounded-lg text-sm transition-colors">
                                        ยกเลิก
                                    </Link>
                                    <button onClick={handleSave} disabled={saving}
                                        className="bg-[#7d7671] hover:bg-[#68625d] text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors text-sm disabled:opacity-50">
                                        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
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