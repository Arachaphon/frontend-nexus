import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import C_HomeMain from '../../../components/C_homemain';
import Footer from '../../../components/Footerhomemain';

const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

type RoomStatus = 'vacant' | 'occupied';

interface Room {
  id: string; // ปรับให้ตรงกับ Database Schema ที่เป็น TEXT (TEXT PRIMARY KEY)
  number: string;
  status: RoomStatus;
  isSelected: boolean;
}

interface FloorData {
  id: string;
  floorNumber: number;
  rooms: Room[];
}

const RoomStatusSetup = () => {
    const navigate = useNavigate();
    const [floors, setFloors] = useState<FloorData[]>([]);
    const [loading, setLoading] = useState(false);
    const dormitoryId = localStorage.getItem('dormitoryId');

    const steps = [
        { id: 1, label: 'การคิดค่าน้ำ / ค่าไฟ' },
        { id: 2, label: 'บัญชีธนาคาร' },
        { id: 3, label: 'จัดการชั้น' },
        { id: 4, label: 'ผังห้อง' },
        { id: 5, label: 'ค่าห้อง' },
        { id: 6, label: 'สถานะห้อง' },
    ];

    // --- ดึงข้อมูลจากฐานข้อมูล ---
    useEffect(() => {
        const fetchData = async () => {
            if (!dormitoryId) return;

            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found");
                return;
            }

            setLoading(true);
            try {
                const [fRes, rRes] = await Promise.all([
                    fetch(`${API_BASE}/api/floors/get-floors/${dormitoryId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }),
                    fetch(`${API_BASE}/api/rooms/get-rooms/${dormitoryId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                ]);

                if (!fRes.ok || !rRes.ok) {
                    console.error("API ERROR", fRes.status, rRes.status);
                    return;
                }

                const floorResult = await fRes.json();
                const roomResult = await rRes.json();

                if (floorResult.success && roomResult.success) {
                    const mapped = floorResult.data.map((f: any) => ({
                        id: f.id,
                        floorNumber: f.floor_number,
                        rooms: roomResult.data
                            .filter((r: any) => r.floor_id === f.id && r.is_active === 1)
                            .map((r: any) => ({
                                id: r.id,
                                number: r.room_number,
                                status: r.status || 'vacant',
                                isSelected: false
                            }))
                    }));

                    setFloors(mapped);
                }
            } catch (err) {
                console.error("Fetch crash:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dormitoryId]);

    // --- เลือกห้อง (รวมเหลืออันเดียว) ---
    const toggleRoomSelection = (floorId: string, roomId: string) => {
        setFloors(prev => prev.map(f => f.id === floorId ? {
            ...f,
            rooms: f.rooms.map(r => r.id === roomId ? { ...r, isSelected: !r.isSelected } : r)
        } : f));
    };

    // --- เลือกทั้งชั้น ---
    const handleSelectFloor = (floorId: string, selectAll: boolean) => {
        setFloors(prev => prev.map(f => f.id === floorId ? {
            ...f,
            rooms: f.rooms.map(r => ({ ...r, isSelected: selectAll }))
        } : f));
    };

    // --- อัปเดตสถานะห้องไปยัง Backend ---
    const handleSetStatus = async (newStatus: RoomStatus) => {
        const selectedRoomId = floors.flatMap(f => f.rooms.filter(r => r.isSelected).map(r => r.id));
        if (selectedRoomId.length === 0) return alert("กรุณาเลือกห้องอย่างน้อย 1 ห้อง");

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/rooms/update-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ roomId: selectedRoomId, status: newStatus, dormitoryId })
            });
            const result = await res.json();
            if (result.success) {
                setFloors(prev => prev.map(f => ({
                    ...f,
                    rooms: f.rooms.map(r => r.isSelected ? { ...r, status: newStatus, isSelected: false } : r)
                })));
            } else {
                alert("เกิดข้อผิดพลาด: " + result.message);
            }
        } catch (err) {
            alert("ไม่สามารถบันทึกข้อมูลได้");
        } finally {
            setLoading(false);
        }
    };

    const getSelectedCount = () => floors.reduce((acc, f) => acc + f.rooms.filter(r => r.isSelected).length, 0);

    return (
        <div className="flex flex-col min-h-screen bg-[#f8fcf8] relative">
            <C_HomeMain />

            <div className="flex-grow w-full max-w-6xl mx-auto px-4 py-10 flex flex-col items-center pb-32">
                <h1 className="text-2xl font-bold text-[#0e4b3a] mb-10 text-center">ตั้งค่าหอพัก</h1>

                {/* --- Progress Bar --- */}
                <div className="w-full max-w-5xl mb-12">
                    <div className="flex items-start justify-between w-full">
                        {steps.map((step, index) => {
                            const isCompleted = step.id < 6; 
                            const isActive = step.id === 6;

                            let circleClass = "bg-[#e5e7eb] border-gray-200 text-gray-500 ring-4 ring-gray-200";
                            let textClass = "text-gray-400";

                            if (isCompleted) {
                                circleClass = "bg-[#0e4b3a] border-[#0e4b3a] text-white ring-4 ring-[#dcfce7]";
                                textClass = "text-[#0e4b3a]";
                            } else if (isActive) {
                                circleClass = "bg-[#fce96a] border-[#fdf6b2] text-[#5e4e00] ring-4 ring-[#fdf6b2]";
                                textClass = "text-gray-800";
                            }

                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center relative z-10">
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg font-bold border-[3px] transition-all duration-300 mb-3 ${circleClass}`}>
                                            {isCompleted ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            ) : step.id}
                                        </div>
                                        <span className={`text-xs md:text-sm text-center font-medium mt-2 whitespace-nowrap ${textClass}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && <div className="flex-1 h-[2px] bg-gray-300 mt-5 md:mt-6 mx-2"></div>}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* --- MAIN CONTENT: Room Status Setup --- */}
                <div className="w-full max-w-5xl space-y-6">
                    {floors.map((floor) => (
                        <div key={floor.id} className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-full md:w-48 flex flex-col gap-4 md:border-r border-gray-200 md:pr-8 pt-2">
                                    <span className="text-xl font-medium text-gray-800">ชั้นที่ {floor.floorNumber}</span>
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            onClick={() => handleSelectFloor(floor.id, true)}
                                            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm py-2 px-4 rounded-lg transition-colors"
                                        >
                                            เลือกทั้งชั้น
                                        </button>
                                        <button 
                                            onClick={() => handleSelectFloor(floor.id, false)}
                                            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm py-2 px-4 rounded-lg transition-colors"
                                        >
                                            ยกเลิกเลือกทั้งชั้น
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-4">
                                        {floor.rooms.map((room) => (
                                            <div 
                                                key={room.id}
                                                onClick={() => toggleRoomSelection(floor.id, room.id)}
                                                className={`
                                                    cursor-pointer w-40 h-24 p-3 rounded-lg border flex flex-col justify-center items-center gap-2 transition-all duration-200 select-none
                                                    ${room.isSelected ? 'border-[#0e4b3a] bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}
                                                    ${room.status === 'occupied' ? 'opacity-80' : ''}
                                                `}  
                                            >
                                                <div className="text-center font-medium text-gray-700 text-lg">
                                                    ห้อง {room.number}
                                                </div>
                                                <div className={`text-sm font-medium ${room.status === 'vacant' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {room.status === 'vacant' ? 'ว่าง' : 'ไม่ว่าง'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Floating Next Button */}
                <div className="w-full max-w-5xl flex justify-between mt-8">
                    <button onClick={() => navigate('/homemain/roomprice')} className="text-gray-500 hover:text-gray-700">กลับ</button>
                    <button onClick={() => navigate('/homemain/homefinish')} className="bg-[#0e4b3a] text-white px-8 py-2.5 rounded-lg">ถัดไป</button>
                </div>
            </div>

            {/* --- Sticky Bottom Bar --- */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 py-4 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6">
                    <span className="text-lg text-gray-800 font-medium">
                        เลือก {getSelectedCount()} ห้อง
                    </span>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => handleSetStatus('vacant')}
                            className="bg-[#78716c] hover:bg-[#655f5b] text-white px-8 py-2.5 rounded-lg shadow-sm transition-colors font-medium text-lg"
                        >
                            ว่าง
                        </button>
                        <button 
                            onClick={() => handleSetStatus('occupied')}
                            className="bg-[#78716c] hover:bg-[#655f5b] text-white px-8 py-2.5 rounded-lg shadow-sm transition-colors font-medium text-lg opacity-90"
                        >
                            ไม่ว่าง
                        </button>
                    </div>
                </div>
            </div>

            <div className="z-50 relative">
                <Footer />
            </div>
        </div>
    );
}

export default RoomStatusSetup;