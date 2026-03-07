import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

import C_HomeMain from '../../../../components/C_homemain';
import Footer from '../../../../components/Footerhomemain';
import Sidebar from '../../../../components/Sidebar';

export default function EditMeter() {
    const { dormitoryId, roomId, contractId } = useParams();
    const navigate = useNavigate();
    const [dormitoryName, setDormitoryName] = useState<string>('');
    const [roomNumber, setRoomNumber] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [waterMeter, setWaterMeter] = useState('');
    const [electricMeter, setElectricMeter] = useState('');

    const API_BASE = useRef(window.__ENV__?.API_BASE).current;
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (fetchedRef.current) return;
        if (!dormitoryId || !roomId || !contractId) return;
        fetchedRef.current = true;

        const fetchInfo = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token not found');
                const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

                const [dormRes, roomRes, meterRes] = await Promise.all([
                    fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, { headers }),
                    fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}/${roomId}`, { headers }),
                    fetch(`${API_BASE}/api/meters/${dormitoryId}/contracts/${contractId}`, { headers }),
                ]);

                if (!dormRes.ok) throw new Error(`ไม่พบข้อมูลหอพัก (${dormRes.status})`);
                if (!roomRes.ok) throw new Error(`ไม่พบข้อมูลห้อง (${roomRes.status})`);

                const dormData = await dormRes.json();
                const roomData = await roomRes.json();
                setDormitoryName(dormData.name);
                setRoomNumber(roomData.data.room_number);

                if (!meterRes.ok) throw new Error(`ไม่พบข้อมูลมิเตอร์ (${meterRes.status})`);
                const meterData = await meterRes.json();
                setWaterMeter(String(meterData.data.water_unit_current));
                setElectricMeter(String(meterData.data.electric_unit_current));
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchInfo();
    }, []);

    const handleSave = async () => {
        if (!waterMeter || !electricMeter) {
            setError('กรุณากรอกเลขมิเตอร์ให้ครบถ้วน');
            return;
        }
        try {
            setSaving(true);
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication token not found');

            const res = await fetch(`${API_BASE}/api/meters/${dormitoryId}/contracts/${contractId}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    water_unit_current: Number(waterMeter),
                    electric_unit_current: Number(electricMeter),
                }),
            });

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
                                <span className="text-gray-700 font-medium">แก้ไขมิเตอร์</span>
                            </div>
                            <hr className="border-gray-300 w-full" />
                        </div>

                        <div className="max-w-3xl mx-auto mt-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-800">แก้ไขเลขมิเตอร์วันเข้าพัก</h3>
                                    <p className="text-sm text-gray-500 mt-1">ห้อง {roomNumber || '-'}</p>
                                </div>
                                <hr className="border-gray-100 mb-8" />

                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">{error}</div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">เลขมิเตอร์ค่าน้ำ <span className="text-red-500">*</span></label>
                                        <input type="number" min="0" value={waterMeter} onChange={(e) => setWaterMeter(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">เลขมิเตอร์ค่าไฟ <span className="text-red-500">*</span></label>
                                        <input type="number" min="0" value={electricMeter} onChange={(e) => setElectricMeter(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
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