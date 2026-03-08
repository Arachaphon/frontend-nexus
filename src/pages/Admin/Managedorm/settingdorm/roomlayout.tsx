import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react'; // เพิ่ม import ตัว icon ที่ใช้ใน UI
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

// --- Types สำหรับผังห้อง ---
interface Room {
  id: string;
  number: string;
  isActive: boolean;
}

interface Floor {
  id: string;
  floorNumber: number;
  rooms: Room[];
}



export default function RoomLayout() {
  const { dormitoryId } = useParams();
  const navigate = useNavigate();

  // --- States ---
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [dormitoryName, setDormitoryName] = useState<string>('');
  
  // State สำหรับจัดการชั้นและห้อง
  const [floors, setFloors] = useState<Floor[]>([]);

  const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

  // --- ดึงข้อมูลหอพักและผังห้อง ---
  const fetchDormitoryData = useCallback(async () => {
    const activeDormId = dormitoryId || localStorage.getItem('dormitoryId');
    if (!activeDormId) {
      setInitialLoad(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/api/dormitories/main/${activeDormId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const dorm = data.data || data;
        setDormitoryName(dorm.name || '');
        // หมายเหตุ: ตรงนี้ควร fetch ข้อมูลผังห้องจาก API มาใส่ setFloors ด้วยหากมีข้อมูลเก่า
      }
    } catch (err) {
      console.error("Failed to fetch dormitory data", err);
    } finally {
      setInitialLoad(false);
    }
  }, [dormitoryId, API_BASE]);

  useEffect(() => {
    fetchDormitoryData();
  }, [fetchDormitoryData]);

  // --- Logic จัดการชั้นและห้อง (ส่วนที่ทำให้โค้ดไม่แดง) ---
  const handleAddFloor = () => {
    const newFloor: Floor = {
      id: Date.now().toString(),
      floorNumber: floors.length + 1,
      rooms: []
    };
    setFloors([...floors, newFloor]);
  };

  const handleDeleteFloor = (floorId: string) => {
    setFloors(floors.filter(f => f.id !== floorId));
  };

  const handleAddRoom = (floorId: string) => {
    setFloors(floors.map(f => {
      if (f.id === floorId) {
        const newRoom: Room = {
          id: Date.now().toString(),
          number: `${f.floorNumber}${String(f.rooms.length + 1).padStart(2, '0')}`,
          isActive: true
        };
        return { ...f, rooms: [...f.rooms, newRoom] };
      }
      return f;
    }));
  };

  const handleDeleteRoom = (floorId: string, roomId: string) => {
    setFloors(floors.map(f => {
      if (f.id === floorId) {
        return { ...f, rooms: f.rooms.filter(r => r.id !== roomId) };
      }
      return f;
    }));
  };

  const handleRoomNumberChange = (floorId: string, roomId: string, newNumber: string) => {
    setFloors(floors.map(f => {
      if (f.id === floorId) {
        return {
          ...f,
          rooms: f.rooms.map(r => r.id === roomId ? { ...r, number: newNumber } : r)
        };
      }
      return f;
    }));
  };

  const toggleRoomActive = (floorId: string, roomId: string) => {
    setFloors(floors.map(f => {
      if (f.id === floorId) {
        return {
          ...f,
          rooms: f.rooms.map(r => r.id === roomId ? { ...r, isActive: !r.isActive } : r)
        };
      }
      return f;
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Logic การยิง API บันทึกผังห้อง (Floors/Rooms)
      console.log("Saving layout:", floors);
      alert("บันทึกข้อมูลผังห้องสำเร็จ");
      // navigate('/next-path');
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex-none">
          <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />
        </div>

        <div className="flex-grow w-full flex flex-col items-center px-6 py-10 overflow-y-auto">
          <div className="flex-grow w-full max-w-6xl mx-auto px-4 py-10 flex flex-col items-center">


            {/* Progress Bar */}
            <div className="w-full max-w-5xl mb-12">
              <div className="flex items-start justify-between w-full">

              </div>
            </div>

            {/* Floor & Room Management */}
            <div className="w-full max-w-4xl space-y-6">
              {floors.map((floor) => (
                <div key={floor.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-medium text-gray-700">ชั้น</span>
                      <div className="border-2 border-gray-300 rounded-lg px-6 py-1 text-gray-700 font-semibold min-w-[80px] text-center">
                        {floor.floorNumber}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteFloor(floor.id)}
                      className="p-1.5 hover:bg-red-50 rounded-md transition-colors group"
                      title="ลบชั้น"
                    >
                      <Trash2 size={20} className="text-red-400 group-hover:text-red-600" />
                    </button>
                  </div>

                  <hr className="border-gray-200 mb-6" />

                  <div className="space-y-4">
                    {floor.rooms.map((room) => (
                      <div key={room.id} className="flex items-center gap-4">
                        <input 
                          type="text"
                          value={room.number}
                          onChange={(e) => handleRoomNumberChange(floor.id, room.id, e.target.value)}
                          className="border border-gray-400 rounded-full px-4 py-1.5 w-24 text-center text-gray-700 focus:outline-none focus:border-[#0e4b3a]"
                        />
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => toggleRoomActive(floor.id, room.id)}
                            className={`w-12 h-6 rounded-full relative transition-colors duration-200 ease-in-out ${
                              room.isActive ? 'bg-orange-400' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 left-0.5 shadow-sm transition-transform duration-200 ease-in-out ${
                              room.isActive ? 'translate-x-6' : 'translate-x-0'
                            }`}></div>
                          </button>
                          <span className="text-sm text-gray-700 font-medium select-none">เปิดใช้งาน</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteRoom(floor.id, room.id)}
                          className="p-1 hover:bg-red-50 rounded-full group ml-2"
                        >
                          <Trash2 size={18} className="text-red-500 group-hover:text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <hr className="border-gray-200 my-4" />

                  <button 
                    onClick={() => handleAddRoom(floor.id)}
                    className="border border-gray-400 text-gray-700 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors font-medium"
                  >
                    เพิ่มห้อง
                  </button>
                </div>
              ))}

              <div className="flex justify-center pt-4">
                <button 
                  onClick={handleAddFloor}
                  className="bg-[#78716c] hover:bg-[#5f5955] text-white px-8 py-2.5 rounded-lg shadow-sm transition-colors font-medium"
                >
                  เพิ่มชั้น
                </button>
              </div>

              <div className="w-full max-w-5xl flex justify-end mt-8">
                <button
                  onClick={handleSave}
                  disabled={floors.length === 0 || loading}
                  className={`px-10 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 ${
                  floors.length > 0
                    ? 'bg-[#76736e] hover:bg-[#5e5b57] text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  บันทึก 
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-none w-full border-t border-gray-200">
          <Footer />
        </div>
      </div>
    </div> 
  );
}