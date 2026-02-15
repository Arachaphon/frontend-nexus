import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

// Import Components
import C_HomeMain from '../../../../components/C_homemain';
import Footer from '../../../../components/Footerhomemain';
import Sidebar from '../../../../components/Sidebar';

export default function AddContract() {
  const { roomId } = useParams();

  // State สำหรับคำนวณเงิน (เริ่มต้นเป็น 0 หรือค่าว่างตามที่ขอ)
  const [deposit, setDeposit] = useState<number | ''>(''); 
  const [booking, setBooking] = useState<number | ''>('');
  
  // คำนวณยอดรวม (แปลงค่าว่างเป็น 0 เพื่อคำนวณ)
  const numDeposit = deposit === '' ? 0 : deposit;
  const numBooking = booking === '' ? 0 : booking;
  const totalToPay = Math.max(0, numDeposit - numBooking);

  return (
    // 1. ใช้ h-screen และ overflow-hidden เพื่อล็อคความสูงหน้าจอไม่ให้ล้น
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Sidebar อยู่คงที่ */}
      <Sidebar />
      
      {/* พื้นที่ขวา */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header อยู่คงที่ */}
        <C_HomeMain title="หอพัก: A" />

        {/* 2. ส่วนเนื้อหาหลัก: ใส่ overflow-y-auto เพื่อให้ Scroll ได้เฉพาะตรงนี้ */}
        <div className="flex-1 overflow-y-auto">
            <div className="px-4 md:px-10 py-6 max-w-5xl mx-auto">
            
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
                    <Link to="/homemain" className="hover:text-emerald-600 flex items-center">
                        <Home className="w-4 h-4" />
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <Link to={`/manage/room/${roomId}`} className="hover:text-emerald-600">
                        ข้อมูล ห้อง {roomId}
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-emerald-600 font-medium">เพิ่มสัญญา</span>
                </div>

                {/* Stepper */}
                <div className="flex justify-center items-center mb-10">
                    <div className="flex flex-col items-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-md">1</div>
                    <span className="text-emerald-600 font-semibold text-sm">สัญญา</span>
                    </div>
                    <div className="h-1 bg-gray-200 w-24 mx-2 -mt-6"></div>
                    
                    <div className="flex flex-col items-center relative z-10 opacity-40">
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm mb-2">2</div>
                    <span className="text-gray-400 font-medium text-sm">ค่าเช่าล่วงหน้า</span>
                    </div>
                    <div className="h-1 bg-gray-200 w-24 mx-2 -mt-6"></div>

                    <div className="flex flex-col items-center relative z-10 opacity-40">
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm mb-2">3</div>
                    <span className="text-gray-400 font-medium text-sm">มิเตอร์น้ำ-ไฟ</span>
                    </div>
                </div>

                {/* Form Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    
                    {/* --- สัญญารายเดือน --- */}
                    <h3 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">สัญญารายเดือน</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                    
                        {/* วันที่ */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">วันที่เข้าพัก <span className="text-red-500">*</span></label>
                            <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">วันที่ออก</label>
                            <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-emerald-500" />
                        </div>

                        {/* เงินประกัน & ค่าเช่า */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">เงินประกัน <span className="text-red-500">*</span></label>
                            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                            <input 
                                type="number" 
                                placeholder=""
                                value={deposit}
                                onChange={(e) => setDeposit(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full px-3 py-2 text-sm text-gray-800 focus:outline-none" 
                            />
                            <span className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-l border-gray-300">บาท</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">ค่าเช่าต่อเดือน <span className="text-red-500">*</span></label>
                            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                            <input type="number" placeholder="" className="w-full px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                            <span className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-l border-gray-300">บาท</span>
                            </div>
                        </div>

                        {/* เงินจอง */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">เงินจอง</label>
                            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                            <input 
                                type="number" 
                                placeholder=""
                                value={booking}
                                onChange={(e) => setBooking(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full px-3 py-2 text-sm text-gray-800 focus:outline-none" 
                            />
                            <span className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-l border-gray-300">บาท</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">ระบุจำนวนเงิน หากลูกค้ามีการโอนจองก่อนเข้าพัก</p>
                        </div>
                    
                        {/* ช่องทางชำระ */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">ชำระเงินประกันด้วย <span className="text-red-500">*</span></label>
                            <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-emerald-500 bg-white">
                            <option value="">-- เลือก --</option>
                            <option value="cash">เงินสด</option>
                            <option value="bank">โอนเงินธนาคาร</option>
                            </select>
                        </div>

                    </div>

                    {/* กล่องสรุปสีเขียว */}
                    <div className="bg-white border-2 border-emerald-500 rounded-lg p-5 mb-10 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div> 
                        
                        <h4 className="text-sm font-bold text-gray-800 mb-4">สรุปยอดชำระ</h4>
                        <div className="flex justify-between items-center mb-2 text-sm">
                            <span className="text-gray-500">เงินประกัน</span>
                            <span className="font-medium">{numDeposit.toLocaleString()} บาท</span>
                        </div>
                        <div className="flex justify-between items-center mb-3 text-sm border-b border-gray-100 pb-3">
                            <span className="text-gray-500">หัก เงินจอง</span>
                            <span className="font-medium text-red-500">-{numBooking.toLocaleString()} บาท</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-gray-800">รวมที่ต้องชำระ (เก็บเพิ่ม)</span>
                            <span className="text-emerald-600 text-xl">{totalToPay.toLocaleString()} บาท</span>
                        </div>
                    </div>

                    {/* --- ข้อมูลผู้เช่า --- */}
                    <h3 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">ข้อมูลผู้เช่า</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">ชื่อจริง <span className="text-red-500">*</span></label>
                            <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">นามสกุล <span className="text-red-500">*</span></label>
                            <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">เบอร์ติดต่อ <span className="text-red-500">*</span></label>
                            <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">เลขบัตรประชาชน / พาสปอร์ต <span className="text-red-500">*</span></label>
                            <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                        </div>
                    </div>
                    <div className="mb-8">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">ที่อยู่</label>
                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                    </div>

                    {/* --- บุคคลติดต่อฉุกเฉิน --- */}
                    <h3 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">บุคคลติดต่อฉุกเฉิน</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">ชื่อบุคคลติดต่อฉุกเฉิน</label>
                            <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">ความสัมพันธ์</label>
                            <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">เบอร์ติดต่อ</label>
                            <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                        </div>
                    </div>

                    {/* --- อื่นๆ --- */}
                    <h3 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">อื่นๆ</h3>
                    <div className="mb-8">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Note</label>
                        <textarea rows={3} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"></textarea>
                        <p className="text-[10px] text-gray-400 mt-1">ข้อความนี้จะแสดงที่รายงาน - ผู้เช่าปัจจุบัน</p>
                    </div>

                    {/* ปุ่มต่อไป */}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors text-sm">
                            ต่อไป
                        </button>
                    </div>

                </div>
            </div>
            

            
        </div>
        <Footer />
      </div>
    </div>
  );
}