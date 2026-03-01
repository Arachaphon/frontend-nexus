import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Home, ChevronRight, Calendar } from 'lucide-react';
import C_HomeMain from '../../../../components/C_homemain';
import Footer from '../../../../components/Footerhomemain';
import Sidebar from '../../../../components/Sidebar';

export default function AdvanceRent() {
    const { dormitoryId, roomId, contractId } = useParams();
    const navigate = useNavigate();

    const [dormitoryName, setDormitoryName] = useState<string>('');
    const [roomNumber, setRoomNumber] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [checkInDate, setCheckInDate] = useState<string>('');
    const [monthlyRent, setMonthlyRent] = useState<number>(0);

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [billingCycle, setBillingCycle] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('cash');
    const [note, setNote] = useState('');

    const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

    const paymentTypeMap: Record<'cash' | 'bank', string> = {
        cash: 'เงินสด',
        bank: 'โอนเงินธนาคาร'
    };

    const fetchContract = useCallback(async () => {
        if (!dormitoryId || !roomId || !contractId) return;

        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication token not found');

            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            const [dormRes, roomRes, contractRes] = await Promise.all([
                fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, { headers }),
                fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}/${roomId}`, { headers }),
                fetch(`${API_BASE}/api/rentals/contracts/dormitories/${dormitoryId}/${contractId}`, { headers }),
            ]);

            if (!dormRes.ok || !roomRes.ok || !contractRes.ok) {
                throw new Error('API request failed');
            }

            const dormData = await dormRes.json();
            const roomData = await roomRes.json();
            const contractData = await contractRes.json();

            setDormitoryName(dormData.name);
            setRoomNumber(roomData.data.room_number);
            setCheckInDate(contractData.data.check_in_date);
            setMonthlyRent(contractData.data.rent_price);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }, [dormitoryId, roomId, contractId, API_BASE]);

    useEffect(() => {
        fetchContract();
    }, [fetchContract]);

    useEffect(() => {
        if (!checkInDate || checkInDate.length < 7) return;
        setBillingCycle(checkInDate.slice(0, 7));
    }, [checkInDate]);

    useEffect(() => {
        if (!billingCycle || !checkInDate || !monthlyRent) return;

        const checkIn = new Date(checkInDate);
        const [year, month] = billingCycle.split('-').map(Number);
        const billingDate = new Date(year, month - 1, 1);

        if (billingDate < new Date(checkIn.getFullYear(), checkIn.getMonth(), 1)) {
            setFormError('ไม่สามารถเลือกรอบบิลก่อนเดือนที่เข้าอยู่ได้');
            return;
        } else {
            setFormError(null);
        }

        if (
            billingDate.getFullYear() !== checkIn.getFullYear() ||
            billingDate.getMonth() !== checkIn.getMonth()
        ) {
            setAmount(monthlyRent);
            return;
        }

        const endOfMonth = new Date(year, month, 0);
        const daysInMonth = endOfMonth.getDate();
        const remainingDays = daysInMonth - checkIn.getDate() + 1;
        const dailyRate = monthlyRent / daysInMonth;
        const calculated = Math.ceil(dailyRate * remainingDays);
        setAmount(calculated);
    }, [billingCycle, checkInDate, monthlyRent]);

    const description = billingCycle && roomNumber ? (() => {
            const [year, month] = billingCycle.split('-');
            return `ค่าเช่าห้อง ${roomNumber} เดือน ${month}-${year}`;
        })()
    : '';

    const formatToMMYYYY = (value: string) => {
        const [year, month] = value.split('-');
        return `${month}-${year}`;
    };

    const isFormValid = !!billingCycle && !!description && amount > 0;

    const handleSave = async () => {
        if (!contractId) return;

        if (!billingCycle || !description || amount <= 0) {
            setFormError('กรุณากรอกข้อมูลให้ครบถ้วน และจำนวนเงินต้องมากกว่า 0');
            return;
        }

        setSaving(true);
        setFormError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication token not found');

            const res = await fetch(`${API_BASE}/api/rentals/advances`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contract_id: contractId,
                    billing_month: formatToMMYYYY(billingCycle),
                    description,
                    amount,
                    payment_type: paymentTypeMap[paymentMethod],
                    note: note || null
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'ไม่สามารถบันทึกข้อมูลได้');
            }

            navigate(`/manage/${dormitoryId}/room/${roomId}/addcontract3/${contractId}`);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError (err.message);
            } else {
                setError('Unexpected Error occurred')
            }
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
                        <div className="mb-8 w-full">
                            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                                <Link to={`/manage/${dormitoryId}`} className="hover:text-emerald-600 flex items-center gap-1.5">
                                    <Home className="w-4 h-4" />
                                    <span>ห้อง</span>
                                </Link>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <Link to={`/manage/${dormitoryId}/room/${roomId}`} className="hover:text-emerald-600">
                                    ข้อมูล ห้อง {roomNumber || '-' }
                                </Link>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 font-medium">เพิ่มสัญญา</span>
                            </div>
                            <hr className="border-gray-300 w-full" />
                        </div>

                        <div className="max-w-5xl mx-auto mt-8">
                            <div className="flex justify-center items-center mb-10">
                                <div className="flex flex-col items-center relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center font-bold text-sm mb-2 shadow-sm">1</div>
                                    <span className="text-gray-400 font-medium text-sm">สัญญา</span>
                                </div>
                                <div className="h-1 bg-gray-200 w-24 mx-2 -mt-6"></div>
                                <div className="flex flex-col items-center relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-md">2</div>
                                    <span className="text-emerald-600 font-semibold text-sm">ค่าเช่าล่วงหน้า</span>
                                </div>
                                <div className="h-1 bg-gray-200 w-24 mx-2 -mt-6"></div>
                                <div className="flex flex-col items-center relative z-10 opacity-40">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm mb-2">3</div>
                                    <span className="text-gray-400 font-medium text-sm">มิเตอร์น้ำ-ไฟ</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-800">รับเงินค่าเช่าล่วงหน้า ตอนทำสัญญา</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        ระบบจะคำนวณเงินค่าเช่าล่วงหน้าให้โดยอัตโนมัติ โดยคำนวณจากวันที่ทำสัญญาเข้าอยู่จนถึงวันสิ้นเดือน
                                    </p>
                                </div>

                                <hr className="border-gray-100 mb-8" />

                                <div className="max-w-3xl">
                                    <div className="mb-6 w-full md:w-1/3">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            รอบบิล <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                type="month"
                                                value={billingCycle}
                                                min={checkInDate ? checkInDate.slice(0, 7) : undefined}
                                                onChange={(e) => setBillingCycle(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                                        <div className="flex-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                รายละเอียด <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={description}
                                                readOnly
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none"
                                            />
                                        </div>
                                        <div className="w-full md:w-1/3">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                จำนวนเงิน <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={amount}
                                                    onChange={(e) => setAmount(Number(e.target.value))}
                                                    className="w-full px-3 py-2 text-sm text-gray-800 focus:outline-none"
                                                />
                                                <span className="bg-gray-100 px-3 py-2 text-sm text-gray-500 border-l border-gray-300">
                                                    บาท
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6 w-full md:w-1/3">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            ชำระเงินโดย <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'bank')}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                                        >
                                            <option value="cash">เงินสด</option>
                                            <option value="bank">โอนเงินธนาคาร</option>
                                        </select>
                                    </div>

                                    <div className="mb-10">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Note</label>
                                        <textarea
                                            rows={4}
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                                        ></textarea>
                                    </div>

                                    {formError && (
                                        <div className="mb-4 text-sm text-red-500">{formError}</div>
                                    )}
                                </div>

                                <div className="flex justify-end items-center gap-3 pt-6 border-t border-gray-100">
                                    <Link to={`/manage/${dormitoryId}/room/${roomId}/addcontract3/${contractId}`}>
                                        <button className="bg-white border border-gray-400 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-md transition-colors text-sm">
                                            ข้าม (ไม่รับเงินค่าเช่าล่วงหน้า)
                                        </button>
                                    </Link>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || !isFormValid}
                                        className="bg-[#7d7671] hover:bg-[#68625d] text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors text-sm disabled:opacity-50"
                                    >
                                        {saving ? 'กำลังบันทึก...' : 'บันทึกและไปขั้นตอนถัดไป'}
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