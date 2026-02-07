import React, { useEffect,useState } from 'react';
import { X } from 'lucide-react'; // ไอคอนปิด
import { useNavigate } from 'react-router-dom';
// Mock Components (ใช้ import เดิมของคุณ)
import C_HomeMain from '../../../components/C_homemain';
import Footer from '../../../components/Footerhomemain';

const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

interface Room {
  id: number;
  number: string;
  price: number;
  isSelected: boolean;
}

interface FloorData {
  id: number;
  floorNumber: number;
  rooms: Room[];
}

const RoomPriceSetup = () => {
  // --- States ---
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [loading, setLoading] = useState(false);
  const dormitoryId = localStorage.getItem('dormitoryId');
  const navigate = useNavigate();
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [priceInput, setPriceInput] = useState('');

  const steps = [
    { id: 1, label: 'การคิดค่าน้ำ / ค่าไฟ' },
    { id: 2, label: 'บัญชีธนาคาร' },
    { id: 3, label: 'จัดการชั้น' },
    { id: 4, label: 'ผังห้อง' },
    { id: 5, label: 'ค่าห้อง' },
    { id: 6, label: 'สถานะห้อง' },
  ];

  // --- Functions ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!dormitoryId) return;

        const floorRes = await fetch(`${API_BASE}/api/floors/get-floors/${dormitoryId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const floorResult = await floorRes.json();

        const roomRes = await fetch(`${API_BASE}/api/rooms/get-rooms/${dormitoryId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const roomResult = await roomRes.json();

        if (floorResult.success && roomResult.success) {
          const mappedFloors = floorResult.data.map((f: any) => ({
            id: f.id,
            floorNumber: f.floor_number,
            rooms: roomResult.data
              .filter((r: any) => r.floor_id === f.id) 
              .map((r: any) => ({
                id: r.id,
                number: r.room_number,
                price: r.current_rent_price || 0,
                isActive: r.is_active === 1,
                isSelected: false
              }))
          }));
          setFloors(mappedFloors);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
    fetchData();
  }, [dormitoryId]);
  // เลือกห้องเดี่ยว
  const toggleSelectRoom = (floorId: number, roomId: number) => {
    setFloors(prev => prev.map(f => {
      if (f.id !== floorId) return f;
      return {
        ...f,
        rooms: f.rooms.map(r => r.id === roomId ? { ...r, isSelected: !r.isSelected } : r)
      };
    }));
  };

  // เลือกทั้งชั้น / ยกเลิกทั้งชั้น
  const handleSelectFloor = (floorId: number, selectAll: boolean) => {
    setFloors(prev => prev.map(f => {
      if (f.id !== floorId) return f;
      return {
        ...f,
        rooms: f.rooms.map(r => ({ ...r, isSelected: selectAll }))
      };
    }));
  };

  // นับจำนวนห้องที่เลือก
  const getSelectedCount = () => {
    return floors.reduce((acc, floor) => {
      return acc + floor.rooms.filter(r => r.isSelected).length;
    }, 0);
  };

  // เปิด Modal
  const openPriceModal = () => {
    if (getSelectedCount() === 0) {
      alert("กรุณาเลือกห้องอย่างน้อย 1 ห้อง");
      return;
    }
    setPriceInput(''); // รีเซ็ตค่า
    setIsModalOpen(true);
  };

  // บันทึกราคาจาก Modal
// ในไฟล์ roomprice.tsx

const handleConfirmPrice = async () => {
  const newPrice = parseFloat(priceInput);
  if (isNaN(newPrice) || newPrice < 0) {
    alert("กรุณาระบุราคาที่ถูกต้อง");
    return;
  }

  // ดึง ID ของห้องที่ถูกเลือกทั้งหมด
  const selectedRoomIds = floors.flatMap(f => 
    f.rooms.filter(r => r.isSelected).map(r => r.id)
  );

  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/rooms/update-prices`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        roomIds: selectedRoomIds,
        price: newPrice
      })
    });

    const result = await response.json();

    if (result.success) {
      // เมื่อบันทึกสำเร็จ ให้ Update UI
      setFloors(prev => prev.map(f => ({
        ...f,
        rooms: f.rooms.map(r => 
          r.isSelected ? { ...r, price: newPrice, isSelected: false } : r
        )
      })));
      setIsModalOpen(false);
      alert("บันทึกราคาสำเร็จ!");
    } else {
      alert("เกิดข้อผิดพลาด: " + result.message);
    }
  } catch (error) {
    console.error('Update price error:', error);
    alert("ไม่สามารถติดต่อ Server ได้");
  } finally {
    setLoading(false);
  }
};

  const handleNextStep = () => {
    const hasUnsetPrice = floors.some(f => f.rooms.some(r => r.price <= 0));
    
    if (hasUnsetPrice) {
      if (!confirm("บางห้องยังไม่ได้ระบุราคา คุณต้องการดำเนินการต่อหรือไม่?")) {
        return;
      }
    }
    navigate('/homemain/roomstatus'); 
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fcf8] relative">
      <C_HomeMain />

      <div className="flex-grow w-full max-w-6xl mx-auto px-4 py-10 flex flex-col items-center pb-32">
        <h1 className="text-2xl font-bold text-[#0e4b3a] mb-10 text-center">ตั้งค่าหอพัก</h1>

        {/* --- Progress Bar --- */}
        <div className="w-full max-w-5xl mb-12">
          <div className="flex items-start justify-between w-full">
            {steps.map((step, index) => {
              const isCompleted = step.id < 5; 
              const isActive = step.id === 5;

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

        {/* --- MAIN CONTENT --- */}
        <div className="w-full max-w-5xl space-y-6">
            
            {floors.map((floor) => (
                <div key={floor.id} className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        
                        {/* Left Column: Floor Info & Actions */}
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

                        {/* Right Column: Rooms Grid */}
                        <div className="flex-1">
                            <div className="flex flex-wrap gap-4">
                                {floor.rooms.map((room) => (
                                    <div 
                                        key={room.id}
                                        onClick={() => toggleSelectRoom(floor.id, room.id)}
                                        className={`
                                            cursor-pointer w-40 h-24 p-3 rounded-lg border flex flex-col justify-between transition-all duration-200 select-none
                                            ${room.isSelected 
                                                ? 'border-[#0e4b3a] bg-[#f0fdf4] ring-1 ring-[#0e4b3a] shadow-sm' 
                                                : 'border-gray-300 bg-white hover:border-gray-400'
                                            }
                                        `}
                                    >
                                        <div className="text-center font-medium text-gray-700 text-lg">
                                            ห้อง {room.number}
                                        </div>
                                        <div className="flex justify-between items-end text-xs text-gray-500">
                                            <span>รายเดือน:</span>
                                            <span className="font-semibold text-gray-800">
                                                {room.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                                            </span>
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
          <a href="/homemain/roomsetup">
            <button className="px-6 py-2.5 text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors flex items-center gap-2">
              กลับ
            </button>
          </a>
          <button 
            onClick={handleNextStep}
            className="bg-[#78716c] hover:bg-[#5f5955] text-white px-8 py-2.5 rounded-lg shadow-sm transition-colors font-medium">
            ถัดไป
          </button>
        </div>

      </div>

      {/* --- Sticky Bottom Bar --- */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 py-4 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6">
            <span className="text-lg text-gray-800 font-medium">
                จำนวนห้องที่เลือก {getSelectedCount()} ห้อง
            </span>
            <button 
                onClick={openPriceModal}
                className="bg-[#78716c] hover:bg-[#5f5955] text-white px-8 py-2.5 rounded-lg shadow-sm transition-colors font-medium text-lg"
            >
                ระบุค่าห้อง
            </button>
        </div>
      </div>

      {/* --- MODAL (Popup) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">ระบุค่าห้อง</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-8">
              <label className="block text-gray-600 mb-2 font-medium">
                ราคาค่าเช่ารายเดือน<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex rounded-md shadow-sm">
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="flex-1 block w-full rounded-l-md border-gray-300 border px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#0e4b3a] focus:ring-1 focus:ring-[#0e4b3a] focus:outline-none sm:text-sm"
                  placeholder=""
                />
                <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-200 px-3 text-gray-500 sm:text-sm">
                  บาท /เดือน
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={handleConfirmPrice}
                className="bg-[#78716c] hover:bg-[#5f5955] text-white px-6 py-2 rounded-lg shadow-sm transition-colors text-sm font-medium"
              >
                ตกลง
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <div className="z-50 relative">
        <Footer />
      </div>
    </div>
  );
}

export default RoomPriceSetup;