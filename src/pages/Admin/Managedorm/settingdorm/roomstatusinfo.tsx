import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

type RoomStatus = 'vacant' | 'occupied';

interface Room {
  id: string;
  number: string;
  status: RoomStatus;
  isSelected: boolean;
}

interface FloorData {
  id: string;
  floorNumber: number;
  rooms: Room[];
}

export default function RoomStatusSetup() {
  const navigate = useNavigate();
  
  // --- States ---
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [dormitoryName, setDormitoryName] = useState<string>(''); 
  const [errorMsg, setErrorMsg] = useState<string>('');

  const dormitoryId = localStorage.getItem('dormitoryId');

  // --- ดึงข้อมูลหอพักและผังห้อง ---
  useEffect(() => {
    const fetchData = async () => {
      if (!dormitoryId) {
        console.error("ไม่พบ dormitoryId ใน localStorage");
        setErrorMsg("ไม่พบข้อมูลรหัสหอพัก กรุณากลับไปเลือกหอพักใหม่");
        setInitialLoad(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        setErrorMsg("ไม่พบข้อมูลการเข้าระบบ (Token) กรุณาล็อกอินใหม่");
        setInitialLoad(false);
        return;
      }

      setLoading(true);
      setErrorMsg('');

      try {
        const [dRes, fRes, rRes] = await Promise.all([
          // ดึงข้อมูลหลักหอพักเพื่อเอาชื่อมาแสดง (ใช้ Endpoint ตามที่คุณให้มาล่าสุด)
          fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
          }),
          // ดึงข้อมูลชั้น
          fetch(`${API_BASE}/api/dormitories/floors/${dormitoryId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
          }),
          // ดึงข้อมูลห้อง
          fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!fRes.ok || !rRes.ok) {
          console.error("API ERROR", fRes.status, rRes.status);
          setErrorMsg(`เกิดข้อผิดพลาดในการดึงข้อมูลจาก Server`);
          return;
        }

        // --- ส่วนดึงชื่อหอพัก ---
        if (dRes.ok) {
           const dormData = await dRes.json();
           // ตรวจสอบโครงสร้าง response ว่าค่า name ซ่อนอยู่ที่ไหน
           const dorm = dormData.data || dormData;
           setDormitoryName(dorm.name || dorm.dormitory_name || dorm.dorm_name || '');
        }

        const floorResult = await fRes.json();
        const roomResult = await rRes.json();

        // --- ส่วนจัดการผังห้อง ---
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

          if (mapped.length === 0) {
             setErrorMsg("ไม่พบข้อมูลผังห้องของหอพักนี้");
          }
        } else {
             setErrorMsg("API ตอบกลับมาไม่สำเร็จ");
        }
      } catch (err) {
        console.error("Fetch crash:", err);
        setErrorMsg("ไม่สามารถเชื่อมต่อกับ Server ได้");
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    fetchData();
  }, [dormitoryId]);

  // --- เลือกห้อง ---
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

  // --- อัปเดตสถานะห้อง ---
  const handleSetStatus = async (newStatus: RoomStatus) => {
    const selectedRoomIds = floors
      .flatMap(f => f.rooms)
      .filter(r => r.isSelected)
      .map(r => r.id);

    if (selectedRoomIds.length === 0) {
      alert("กรุณาเลือกห้องอย่างน้อย 1 ห้อง");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("ไม่พบ token");
        return;
      }

      const res = await fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          roomIds: selectedRoomIds,
          status: newStatus
        })
      });

      if (res.status === 403) {
        window.location.href = '/homemain'
        return
      }

      if (!res.ok) {
        const text = await res.text();
        console.error("Backend error:", text);
        alert("เกิดข้อผิดพลาดจาก server");
        return;
      }

      const result = await res.json();

      if (result.success) {
        setFloors(prev =>
          prev.map(f => ({
            ...f,
            rooms: f.rooms.map(r =>
              r.isSelected
                ? { ...r, status: newStatus, isSelected: false }
                : r
            )
          }))
        );
      } else {
        alert(result.message || "เกิดข้อผิดพลาด");
      }

    } catch (err) {
      console.error("PATCH crash:", err);
      alert("ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };
  
  const getSelectedCount = () => floors.reduce((acc, f) => acc + f.rooms.filter(r => r.isSelected).length, 0);

  if (initialLoad) {
    return (
      <div className="flex h-screen bg-[#f8fcf8] overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e4b3a]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fcf8] font-sans overflow-hidden"> 
      <Sidebar />
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        
        {/* Header */}
        <div className="flex-none">
          <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />
        </div>

        {/* --- เนื้อหาตรงกลาง --- */}
        <div className="flex-1 overflow-y-auto w-full flex flex-col items-center px-4 pt-6">
            
            {errorMsg ? (
                <div className="w-full max-w-5xl bg-red-50 border border-red-200 text-red-600 rounded-xl p-6 text-center shadow-sm mt-10">
                    <span className="font-semibold text-lg">⚠️ ตรวจพบปัญหา:</span>
                    <p className="mt-2">{errorMsg}</p>
                </div>
            ) : (
                <div className="w-full max-w-5xl space-y-6 mb-10">
                    {floors.map((floor) => (
                        <div key={floor.id} className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-full md:w-48 flex flex-col gap-4 md:border-r border-gray-200 md:pr-8 pt-2">
                                    <span className="text-xl font-medium text-gray-800">ชั้นที่ {floor.floorNumber}</span>
                                    <div className="flex flex-col gap-3">
                                        <button onClick={() => handleSelectFloor(floor.id, true)} className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm py-2 px-4 rounded-lg transition-colors">เลือกทั้งชั้น</button>
                                        <button onClick={() => handleSelectFloor(floor.id, false)} className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm py-2 px-4 rounded-lg transition-colors">ยกเลิกเลือกทั้งชั้น</button>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-4">
                                        {floor.rooms.map((room) => (
                                            <div 
                                                key={room.id}
                                                onClick={() => toggleRoomSelection(floor.id, room.id)}
                                                className={`cursor-pointer w-40 h-24 p-3 rounded-lg border flex flex-col justify-center items-center gap-2 transition-all duration-200 select-none ${room.isSelected ? 'border-[#0e4b3a] bg-green-50 shadow-sm ring-1 ring-[#0e4b3a]' : 'border-gray-200 bg-white hover:border-gray-300'} ${room.status === 'occupied' ? 'opacity-80' : ''}`}  
                                            >
                                                <div className="text-center font-medium text-gray-700 text-lg">ห้อง {room.number}</div>
                                                <div className={`text-sm font-medium ${room.status === 'vacant' ? 'text-emerald-500' : 'text-red-500'}`}>{room.status === 'vacant' ? 'ว่าง' : 'ไม่ว่าง'}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* --- STICKY ACTION BAR --- */}
        <div className="flex-none w-full bg-white border-t border-gray-200 py-4 px-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6">
                <span className="text-lg text-gray-800 font-medium">เลือก {getSelectedCount()} ห้อง</span>
                <div className="flex gap-4">
                    <button onClick={() => handleSetStatus('vacant')} className="bg-[#78716c] hover:bg-[#655f5b] text-white px-8 py-2.5 rounded-lg shadow-sm transition-colors font-medium text-lg">ว่าง</button>
                    <button onClick={() => handleSetStatus('occupied')} className="bg-[#78716c] hover:bg-[#655f5b] text-white px-8 py-2.5 rounded-lg shadow-sm transition-colors font-medium text-lg">ไม่ว่าง</button>
                </div>
            </div>
        </div>
        
        {/* Footer */}
        <div className="flex-none w-full border-t border-gray-200">
          <Footer />
        </div>

      </div>
    </div>
  );
}