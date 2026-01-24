import React, { useState } from 'react';
import { Layers, Trash2 } from 'lucide-react'; 

// Mock Components (ถ้า path ของคุณถูกแล้ว ให้ใช้ import เดิมของคุณได้เลย)
import C_HomeMain from '../../../components/C_homemain';
import Footer from '../../../components/Footerhomemain';


interface FloorData {
  id: number;
  floorNumber: number;
  roomCount: string;
}

const FloorSetup = () => {
  // --- States ---
  const [totalFloorsInput, setTotalFloorsInput] = useState('');
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [loading,setLoading] = useState(false);

  const steps = [
    { id: 1, label: 'การคิดค่าน้ำ / ค่าไฟ' },
    { id: 2, label: 'บัญชีธนาคาร' },
    { id: 3, label: 'จัดการชั้น' },
    { id: 4, label: 'ผังห้อง' },
    { id: 5, label: 'ค่าห้อง' },
    { id: 6, label: 'สถานะห้อง' },
  ];

  // ฟังก์ชันสร้างรายการชั้น
  const handleGenerateFloors = () => {
    const num = parseInt(totalFloorsInput);
    if (!isNaN(num) && num > 0) {
      // จำกัดไม่ให้เกิน 30 ชั้นตาม UX ที่เขียนไว้
      if (num > 30) {
        alert("จำนวนชั้นสูงสุดไม่เกิน 30 ชั้น");
        return;
      }
      
      const newFloors: FloorData[] = [];
      for (let i = 1; i <= num; i++) {
        newFloors.push({
          id: Date.now() + i,
          floorNumber: i,
          roomCount: '' // เริ่มต้นเป็นค่าว่าง
        });
      }
      setFloors(newFloors);
    }
  };

  // ฟังก์ชันอัปเดตจำนวนห้อง
  const handleRoomCountChange = (id: number, val: string) => {
    if (!/^\d*$/.test(val)) return; // รับเฉพาะตัวเลข
    setFloors(prev => prev.map(f =>
      f.id === id ? { ...f, roomCount: val } : f
    ));
  };

  // ฟังก์ชันลบชั้น
  const handleDeleteFloor = (id: number) => {
    // ลบแล้วอาจจะต้อง Re-index เลขชั้นใหม่หรือไม่? 
    // ใน Code นี้แค่ลบออกไปเฉยๆ ถ้าต้องการให้เลขชั้นเรียงใหม่ต้อง map index ใหม่ครับ
    setFloors(prev => prev.filter(f => f.id !== id));
  };

  // ฟังก์ชันตรวจสอบก่อนไปหน้าถัดไป
  const handleNextStep = async () => {
    // 1. ตรวจสอบว่ามีชั้นหรือไม่
    if (floors.length === 0) return;

    // 2. ตรวจสอบว่าทุกชั้นกรอกจำนวนห้องหรือยัง
    const incompleteFloors = floors.filter(f => !f.roomCount || parseInt(f.roomCount) === 0);
    
    if (incompleteFloors.length > 0) {
      alert(`กรุณาระบุจำนวนห้องให้ครบทุกชั้น (ชั้นที่ยังไม่ระบุ: ${incompleteFloors.map(f => f.floorNumber).join(', ')})`);
      return;
    }

    setLoading(true);

    try {
      // ดึง Dormitory ID จากหน้าแรก (สมมติว่าเก็บไว้ใน localStorage)
      const dormId = localStorage.getItem('currentDormId') || '1';

      const response = await fetch('/api/floor-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dormId,
          floors: floors.map(f => ({
            floor_number: f.floorNumber,
            room_count: parseInt(f.roomCount)
          }))
        })
      });

      if (!response.ok) throw new Error('ไม่สามารถบันทึกข้อมูลชั้นได้');

      alert('บันทึกข้อมูลสำเร็จ!');
      // ไปหน้าผังห้อง (Step 4)
      //window.location.href = '/homemain/roomlayout'; 
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fcf8]">
      <C_HomeMain />

      <div className="flex-grow w-full max-w-6xl mx-auto px-4 py-10 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-[#0e4b3a] mb-10 text-center">ตั้งค่าหอพัก</h1>

        {/* --- Progress Bar --- */}
        <div className="w-full max-w-5xl mb-12">
          <div className="flex items-start justify-between w-full">
            {steps.map((step, index) => {
              const isCompleted = step.id < 3;
              const isActive = step.id === 3;

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

        {/* --- Main Content Card --- */}
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden min-h-[450px] flex flex-col">
          
          {/* Header In Card */}
          <div className="bg-gray-50 border-b border-gray-100 py-4 px-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Layers className="text-[#0e4b3a]" size={24} />
              จำนวนชั้น
            </h2>
          </div>

          <div className="flex flex-col md:flex-row h-full flex-grow">
            {/* Left Panel: Inputs */}
            <div className="w-full md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-gray-100 bg-[#fafafa]">
              <h3 className="text-lg font-bold text-gray-800 mb-4">กำหนดโครงสร้าง</h3>
              <ul className="list-disc pl-5 text-gray-600 text-sm mb-8 space-y-2">
                <li>ระบุจำนวนชั้นทั้งหมดของอาคาร</li>
                <li>จำนวนชั้นสูงสุดไม่เกิน 30 ชั้น</li>
                <li>หลังจากกดตกลง สามารถแก้ไขจำนวนห้องรายชั้นได้ทางขวา</li>
              </ul>

              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ระบุจำนวนชั้น <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={totalFloorsInput}
                    min="1"
                    placeholder="เช่น 2"
                    onChange={(e) => setTotalFloorsInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateFloors()} 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e4b3a]/20 focus:border-[#0e4b3a] transition-all text-center font-medium"
                  />
                  <button
                    onClick={handleGenerateFloors}
                    className="px-6 py-2.5 bg-[#76736e] hover:bg-[#5e5b57] active:bg-[#4b4845] text-white rounded-lg text-sm font-medium transition-all shadow-sm whitespace-nowrap"
                  >
                    ตกลง
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel: Dynamic List */}
            <div className="w-full md:w-2/3 p-6 md:p-8 bg-white relative">
              {floors.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 min-h-[200px]">
                  <Layers size={48} className="text-gray-200" />
                  <span className="text-sm">ระบุจำนวนชั้นด้านซ้ายเพื่อเริ่มตั้งค่า</span>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                     <h3 className="text-gray-700 font-semibold">รายการชั้นทั้งหมด ({floors.length})</h3>
                     <span className="text-xs text-gray-500">ระบุจำนวนห้องในแต่ละชั้น</span>
                  </div>
                  
                  <div className="space-y-3 overflow-y-auto pr-2 max-h-[320px] custom-scrollbar pb-4">
                    {floors.map((floor) => (
                      <div key={floor.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#f0fdf4] text-[#0e4b3a] flex items-center justify-center font-bold text-sm">
                                {floor.floorNumber}
                            </div>
                            <span className="font-medium text-gray-700">ชั้นที่ {floor.floorNumber}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={floor.roomCount}
                            placeholder="0"
                            onChange={(e) => handleRoomCountChange(floor.id, e.target.value)}
                            className="w-20 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-center text-gray-800 font-medium"
                          />
                          <span className="text-gray-500 text-sm w-8">ห้อง</span>
                          <button
                            onClick={() => handleDeleteFloor(floor.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                            title="ลบชั้นนี้"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* --- End Main Content Card --- */}

        {/* --- ปุ่มถัดไป --- */}
        <div className="w-full max-w-5xl flex justify-between mt-8">
            <a href="/homemain/bankaccountconfig">
                <button className="px-6 py-2.5 text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors flex items-center gap-2">
                    กลับ
                </button>
            </a>
            <button
                onClick={handleNextStep}
                disabled={floors.length === 0 || loading}
                className={`px-10 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 ${
                floors.length > 0
                    ? 'bg-[#76736e] hover:bg-[#5e5b57] text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
                ถัดไป  
            </button>
        </div>

      </div>

      <Footer />
    </div>
  );
}

export default FloorSetup;