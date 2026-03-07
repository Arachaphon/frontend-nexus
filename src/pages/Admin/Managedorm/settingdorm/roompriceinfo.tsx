import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react'; 
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
  price: number; 
}

interface FloorData {
  id: string;
  floorNumber: number;
  rooms: Room[];
}

export default function RoomPriceInfo() {
  const navigate = useNavigate();
  
  // --- States ---
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [dormitoryName, setDormitoryName] = useState<string>(''); 
  const [errorMsg, setErrorMsg] = useState<string>('');

  // States สำหรับ Modal ระบุค่าห้อง
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [priceInput, setPriceInput] = useState<string>('');

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
          fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/api/dormitories/floors/${dormitoryId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
          }),
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
                isSelected: false,
                price: r.price || 0 // ดึงค่าห้องจาก API ถ้ามี
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

  // --- เลือกห้อง (เปลี่ยนชื่อจาก toggleRoomSelection เป็น toggleSelectRoom ให้ตรงกับข้างล่าง) ---
  const toggleSelectRoom = (floorId: string, roomId: string) => {
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

  const getSelectedCount = () => floors.reduce((acc, f) => acc + f.rooms.filter(r => r.isSelected).length, 0);

  // --- ฟังก์ชันเปิด Modal ---
  const openPriceModal = () => {
    if (getSelectedCount() === 0) {
      alert("กรุณาเลือกห้องอย่างน้อย 1 ห้องเพื่อระบุราคา");
      return;
    }
    setPriceInput('');
    setIsModalOpen(true);
  };

  // --- ฟังก์ชันกดยืนยันราคาจาก Modal ---
  const handleConfirmPrice = async () => {
    const newPrice = parseFloat(priceInput);
    if (isNaN(newPrice) || newPrice < 0) {
      alert("กรุณาระบุราคาให้ถูกต้อง");
      return;
    }

    // อัปเดตราคาใน State (ถ้าต้องการบันทึกลง Database ให้เพิ่ม Fetch API PATCH ตรงนี้ครับ)
    setFloors(prev => prev.map(f => ({
      ...f,
      rooms: f.rooms.map(r => 
        r.isSelected 
          ? { ...r, price: newPrice, isSelected: false } // เปลี่ยนราคาและเคลียร์การเลือก
          : r
      )
    })));
    
    setIsModalOpen(false);
  };

  // --- ฟังก์ชันปุ่มถัดไป ---
  const handleNextStep = () => {
    navigate('/homemain/roomstatus'); // นำไปสู่หน้าสถานะห้องตาม flow
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
        
        {/* Header */}
        <div className="flex-none">
          <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />
        </div>

        {/* --- เนื้อหาตรงกลาง --- */}
        <div className="flex-1 overflow-y-auto w-full flex flex-col items-center px-4 pt-6">
            
          <div className="flex-grow w-full max-w-6xl mx-auto px-4 py-10 flex flex-col items-center">


            {/* --- Progress Bar (ซ่อนไว้ตามที่ในโค้ดคุณทำ) --- */}
            <div className="w-full max-w-5xl mb-12">
            </div>

            {/* --- แสดง Error ถ้ามี --- */}
            {errorMsg && (
                <div className="w-full max-w-5xl bg-red-50 border border-red-200 text-red-600 rounded-xl p-6 text-center shadow-sm mb-6">
                    <span className="font-semibold text-lg">⚠️ ตรวจพบปัญหา:</span>
                    <p className="mt-2">{errorMsg}</p>
                </div>
            )}

            {/* --- MAIN CONTENT: Floor Cards --- */}
            <div className="w-full max-w-5xl space-y-6 mb-10">
              {floors.map((floor) => (
                <div key={floor.id} className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Column */}
                    <div className="w-full md:w-48 flex flex-col gap-4 md:border-r border-gray-200 md:pr-8 pt-2">
                      <span className="text-xl font-medium text-gray-800">ชั้นที่ {floor.floorNumber}</span>
                      <div className="flex flex-col gap-3">
                        <button onClick={() => handleSelectFloor(floor.id, true)} className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm py-2 px-4 rounded-lg transition-colors">เลือกทั้งชั้น</button>
                        <button onClick={() => handleSelectFloor(floor.id, false)} className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm py-2 px-4 rounded-lg transition-colors">ยกเลิกเลือกทั้งชั้น</button>
                      </div>
                    </div>
                    {/* Right Column */}
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-4">
                        {floor.rooms.map((room) => (
                          <div 
                            key={room.id}
                            onClick={() => toggleSelectRoom(floor.id, room.id)}
                            className={`cursor-pointer w-40 h-24 p-3 rounded-lg border flex flex-col justify-between transition-all duration-200 select-none ${room.isSelected ? 'border-[#0e4b3a] bg-[#f0fdf4] ring-1 ring-[#0e4b3a] shadow-sm' : 'border-gray-300 bg-white hover:border-gray-400'}`}
                          >
                            <div className="text-center font-medium text-gray-700 text-lg">ห้อง {room.number}</div>
                            <div className="flex justify-between items-end text-xs text-gray-500">
                              <span>รายเดือน:</span>
                              <span className="font-semibold text-gray-800">{room.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            
          </div>
        </div>

        {/* --- STICKY BOTTOM ACTION BAR --- */}
        <div className="flex-none w-full bg-white border-t border-gray-200 py-4 px-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6">
            <span className="text-lg text-gray-800 font-medium">จำนวนห้องที่เลือก {getSelectedCount()} ห้อง</span>
            <button 
              onClick={openPriceModal}
              className="bg-[#78716c] hover:bg-[#5f5955] text-white px-8 py-2.5 rounded-lg shadow-sm transition-colors font-medium text-lg"
            >
              ระบุค่าห้อง
            </button>
          </div>
        </div>

        {/* Footer: อยู่ต่อท้าย Sticky Bar ตามธรรมชาติ */}
        <div className="flex-none w-full border-t border-gray-200">
          <Footer />
        </div>

      </div>

      {/* --- MODAL (Popup) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">ระบุค่าห้อง</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="px-6 py-8">
              <label className="block text-gray-600 mb-2 font-medium">ราคาค่าเช่ารายเดือน<span className="text-red-500 ml-1">*</span></label>
              <div className="flex rounded-md shadow-sm">
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="flex-1 block w-full rounded-l-md border-gray-300 border px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#0e4b3a] focus:ring-1 focus:ring-[#0e4b3a] focus:outline-none sm:text-sm"
                  placeholder="0.00"
                />
                <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-200 px-3 text-gray-500 sm:text-sm">บาท /เดือน</span>
              </div>
            </div>
            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button onClick={handleConfirmPrice} className="bg-[#78716c] hover:bg-[#5f5955] text-white px-6 py-2 rounded-lg text-sm font-medium">ตกลง</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}