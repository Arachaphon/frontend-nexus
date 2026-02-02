import React, { useState } from 'react';
import { Trash2 } from 'lucide-react'; // ใช้ icon ถังขยะที่มีอยู่แล้ว

// Mock Components (ใช้ import เดิมของคุณ)
import C_HomeMain from '../../../components/C_homemain';
import Footer from '../../../components/Footerhomemain';

interface Room {
  id: number;
  number: string;
  isActive: boolean;
}

interface FloorData {
  id: number;
  floorNumber: number;
  rooms: Room[];
}

const FloorSetup = () => {
  // --- States ---
  // จำลองข้อมูลเริ่มต้นให้เหมือนในรูปภาพ (ชั้น 1 และ ชั้น 2)
  const [floors, setFloors] = useState<FloorData[]>([
    {
      id: 1,
      floorNumber: 1,
      rooms: [
        { id: 101, number: '101', isActive: true },
        { id: 102, number: '102', isActive: true },
      ]
    },
    {
      id: 2,
      floorNumber: 2,
      rooms: [
        { id: 201, number: '201', isActive: true },
        { id: 202, number: '202', isActive: true },
      ]
    }
  ]);
  
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 1, label: 'การคิดค่าน้ำ / ค่าไฟ' },
    { id: 2, label: 'บัญชีธนาคาร' },
    { id: 3, label: 'จัดการชั้น' },
    { id: 4, label: 'ผังห้อง' },
    { id: 5, label: 'ค่าห้อง' },
    { id: 6, label: 'สถานะห้อง' },
  ];

  // --- Functions สำหรับจัดการ UI ส่วนกลาง ---

  // เปลี่ยนเลขห้อง
  const handleRoomNumberChange = (floorId: number, roomId: number, val: string) => {
    setFloors(prev => prev.map(f => {
      if (f.id !== floorId) return f;
      return {
        ...f,
        rooms: f.rooms.map(r => r.id === roomId ? { ...r, number: val } : r)
      };
    }));
  };

  // Toggle เปิด/ปิด การใช้งานห้อง
  const toggleRoomActive = (floorId: number, roomId: number) => {
    setFloors(prev => prev.map(f => {
      if (f.id !== floorId) return f;
      return {
        ...f,
        rooms: f.rooms.map(r => r.id === roomId ? { ...r, isActive: !r.isActive } : r)
      };
    }));
  };

  // ลบห้อง
  const handleDeleteRoom = (floorId: number, roomId: number) => {
    setFloors(prev => prev.map(f => {
      if (f.id !== floorId) return f;
      return {
        ...f,
        rooms: f.rooms.filter(r => r.id !== roomId)
      };
    }));
  };

  // เพิ่มห้องใหม่ในชั้นนั้นๆ
  const handleAddRoom = (floorId: number) => {
    setFloors(prev => prev.map(f => {
      if (f.id !== floorId) return f;
      const nextNum = f.floorNumber * 100 + (f.rooms.length + 1);
      return {
        ...f,
        rooms: [...f.rooms, { id: Date.now(), number: nextNum.toString(), isActive: true }]
      };
    }));
  };

  // เพิ่มชั้นใหม่ (ปุ่มสีเทาเข้มด้านล่าง)
  const handleAddFloor = () => {
    const nextFloorNum = floors.length + 1;
    setFloors([
      ...floors,
      {
        id: Date.now(),
        floorNumber: nextFloorNum,
        rooms: [
          { id: Date.now() + 1, number: `${nextFloorNum}01`, isActive: true }
        ]
      }
    ]);
  };



  return (
    <div className="flex flex-col min-h-screen bg-[#f8fcf8]">
      <C_HomeMain />

      <div className="flex-grow w-full max-w-6xl mx-auto px-4 py-10 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-[#0e4b3a] mb-10 text-center">ตั้งค่าหอพัก</h1>

        {/* --- Progress Bar (คงเดิมตามที่คุณให้มา) --- */}
        <div className="w-full max-w-5xl mb-12">
          <div className="flex items-start justify-between w-full">
            {steps.map((step, index) => {
              const isCompleted = step.id < 4; 
              const isActive = step.id === 4;

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

        {/* --- NEW SECTION: Floor & Room Management (ส่วนที่เพิ่มเข้ามา) --- */}
        <div className="w-full max-w-4xl space-y-6">
            
            {floors.map((floor) => (
                <div key={floor.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    {/* Header ของแต่ละชั้น */}
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-lg font-medium text-gray-700">ชั้น</span>
                        <div className="border-2 border-gray-300 rounded-lg px-6 py-1 text-gray-700 font-semibold min-w-[80px] text-center">
                            {floor.floorNumber}
                        </div>
                    </div>

                    <hr className="border-gray-200 mb-6" />

                    {/* รายการห้อง */}
                    <div className="space-y-4">
                        {floor.rooms.map((room) => (
                            <div key={room.id} className="flex items-center gap-4">
                                {/* Input เลขห้อง */}
                                <input 
                                    type="text"
                                    value={room.number}
                                    onChange={(e) => handleRoomNumberChange(floor.id, room.id, e.target.value)}
                                    className="border border-gray-400 rounded-full px-4 py-1.5 w-24 text-center text-gray-700 focus:outline-none focus:border-[#0e4b3a]"
                                />

                                {/* Toggle Switch */}
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

                                {/* Delete Icon */}
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

                    {/* ปุ่มเพิ่มห้อง */}
                    <button 
                        onClick={() => handleAddRoom(floor.id)}
                        className="border border-gray-400 text-gray-700 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors font-medium"
                    >
                        เพิ่มห้อง
                    </button>
                </div>
            ))}

            {/* ปุ่มเพิ่มชั้น (Center Bottom) */}
            <div className="flex justify-center pt-4">
                <button 
                    onClick={handleAddFloor}
                    className="bg-[#78716c] hover:bg-[#5f5955] text-white px-8 py-2.5 rounded-lg shadow-sm transition-colors font-medium"
                >
                    เพิ่มชั้น
                </button>
            </div>

            {/* ปุ่มถัดไป (Right Bottom) */}
        <div className="w-full max-w-5xl flex justify-between mt-8">
          <a href="/homemain/floorsetup">
            <button className="px-6 py-2.5 text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors flex items-center gap-2">
              กลับ
            </button>
          </a>
          <button className="bg-[#78716c] hover:bg-[#5f5955] text-white px-8 py-2.5 rounded-lg shadow-sm transition-colors font-medium">
            ถัดไป
          </button>
        </div>
      </div>

      </div>

      <Footer />
    </div>
  );
}

export default FloorSetup;