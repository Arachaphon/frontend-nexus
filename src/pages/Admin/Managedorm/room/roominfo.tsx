import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, ChevronRight, Waves, Flame, Phone } from 'lucide-react';

// Import Components (เช็ค Path ให้ตรงกับโครงสร้างของคุณด้วยนะครับ)
import C_HomeMain from '../../../../components/C_homemain';
import Footer from '../../../../components/Footerhomemain';
import Sidebar from '../../../../components/Sidebar';

export default function RoomInfo() {
  // รับพารามิเตอร์ roomId จาก URL
  const { roomId } = useParams<{ roomId: string }>();
  
  // ปรับแก้เผื่อ URL ส่งคำว่า roominfo มา จะได้แสดงเป็น 101 ตามดีไซน์
  const roomNumber = roomId === 'roominfo' ? '101' : (roomId || '101');

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Sidebar อยู่คงที่ */}
      <Sidebar />
      
      {/* พื้นที่ขวา */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <C_HomeMain title="หอพัก: A" />

        {/* ส่วนเนื้อหาหลัก */}
        <div className="flex-1 overflow-y-auto">
            <div className="flex-grow px-6 py-6">
            
                 {/* Breadcrumb พร้อมเส้นคั่น */}
                 <div className="mb-8 w-full">
                     <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                         <Link to="/homemain" className="hover:text-emerald-600 flex items-center gap-1.5">
                             <Home className="w-4 h-4" />
                             <span>ห้อง</span>
                         </Link>
                         <ChevronRight className="w-4 h-4 text-gray-400" />
                         <Link to={`/manage/room/${roomId}`} className="hover:text-emerald-600">
                             ข้อมูล ห้อง {roomId || '101'}
                         </Link>

                     </div>
                     {/* เส้นคั่น */}
                     <hr className="border-gray-300 w-full" />
                 </div>
                {/* ------------------------------------------------------------- */}

                {/* Grid แบ่ง 2 ฝั่ง ซ้าย-ขวา */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    
                    {/* ฝั่งซ้าย: ข้อมูลห้องพัก (แก้ไขเฉพาะส่วน Header นี้ให้ตรงปก) */}
                    <div className="xl:col-span-5 bg-white rounded-md shadow-sm border border-gray-200 p-6 flex flex-col h-full">
                        
                        {/* Header ห้อง (ใส่ break-all เพื่อให้ ID ยาวๆ ปัดบรรทัดได้ ไม่พัง) */}
                        <div className="flex items-start sm:items-center gap-3 mb-4 flex-col sm:flex-row">
                            <h2 className="text-2xl font-normal text-gray-800 break-all">ห้อง : {roomNumber}</h2>
                            <span className="bg-[#ff9b50] text-white text-xs px-3 py-1 rounded-sm whitespace-nowrap mt-1 sm:mt-0">
                                ไม่ว่าง
                            </span>
                        </div>

                        {/* ย้ายเส้นคั่นมาไว้ตรงนี้ ตามรูปภาพ */}
                        <hr className="border-gray-300 w-full mb-2" />

                        {/* ปุ่ม แก้ไข (จัดชิดขวา และอยู่ใต้เส้น) */}
                        <div className="flex justify-end mb-2">
                            <Link to={`/manage/room/${roomId}/addcontract`} className="text-sm font-semibold text-gray-600 underline hover:text-gray-900">
                                แก้ไข
                            </Link>
                        </div>

                        {/* ข้อมูลสัญญา (List) - ไม่ได้แตะต้อง */}
                        <div className="space-y-4 text-gray-700 mb-8 flex-grow">
                            <div className="border-b border-gray-100 pb-2">
                                <span className="mr-2 font-medium">ประเภท :</span> รายเดือน
                            </div>
                            <div className="border-b border-gray-100 pb-2">
                                <span className="mr-2 font-medium">เริ่มต้น :</span> 1010-10-10
                            </div>
                            <div className="border-b border-gray-100 pb-2">
                                <span className="mr-2 font-medium">สิ้นสุด :</span> 1011-10-10
                            </div>
                            <div className="border-b border-gray-100 pb-2">
                                <span className="mr-2 font-medium">ค่าห้อง :</span> 10
                            </div>
                            <div className="border-b border-gray-100 pb-2">
                                <span className="mr-2 font-medium">เงินประกัน :</span> 10
                            </div>
                            <div className="border-b border-gray-100 pb-2">
                                <span className="mr-2 font-medium">เงินล่วงหน้า :</span> 10
                            </div>
                        </div>

                        {/* เลขมิเตอร์วันเข้าพัก - ไม่ได้แตะต้อง */}
                        <div className="mb-4 flex justify-between items-center mt-auto">
                            <h3 className="text-gray-800 font-medium">เลขมิเตอร์วันเข้าพัก</h3>
                            <Link to={`/manage/room/${roomId}/addcontract3`} className="text-sm text-gray-600 underline hover:text-gray-900">
                                แก้ไข
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {/* ค่าน้ำ */}
                            <div className="border border-gray-400 rounded-lg p-3 flex flex-col justify-center items-center h-24">
                                <div className="flex w-full justify-between items-center px-2">
                                    <Waves className="w-10 h-10 text-blue-500" strokeWidth={2.5} />
                                    <div className="text-center">
                                        <div className="text-xl font-semibold text-gray-800">9</div>
                                        <div className="text-sm text-gray-500">ค่าน้ำ</div>
                                    </div>
                                </div>
                            </div>
                            {/* ค่าไฟ */}
                            <div className="border border-gray-400 rounded-lg p-3 flex flex-col justify-center items-center h-24">
                                 <div className="flex w-full justify-between items-center px-2">
                                    <Flame className="w-10 h-10 text-orange-500" fill="currentColor" />
                                    <div className="text-center">
                                        <div className="text-xl font-semibold text-gray-800">9</div>
                                        <div className="text-sm text-gray-500">ค่าไฟ</div>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-200 mb-6" />

                        {/* แจ้งย้ายออก - ไม่ได้แตะต้อง */}
                        <div className="mb-2">
                            <h3 className="text-gray-800 font-medium mb-4">แจ้งย้ายออก</h3>
                            <div className="flex flex-col gap-4 items-center">
                                <button className="w-32 py-2 text-sm text-gray-400 border border-gray-200 rounded-md bg-gray-50/50 cursor-not-allowed">
                                    แจ้งย้ายออก
                                </button>
                                <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-6 rounded-md transition-colors w-full max-w-[200px]">
                                    ยกเลิกสัญญา / ย้ายออก
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ฝั่งขวา: ข้อมูลผู้เช่า - ไม่ได้แตะต้องเลย */}
                    <div className="xl:col-span-7">
                        <div className="bg-white rounded-md shadow-sm border-2  p-6 h-full flex flex-col relative">
                            
                            <div className="mb-6">
                                <h3 className="text-xl font-medium text-gray-800 mb-1">ข้อมูลผู้เช่า</h3>
                                <p className="text-xs text-gray-500">กรณีมีผู้เช่าหลายคนสามารถเพิ่มข้อมูลผู้เช่าท่านอื่นได้</p>
                            </div>

                            {/* Table */}
                            <div className="w-full border border-gray-300 rounded-md overflow-hidden mb-4 text-sm">
                                
                                {/* ส่วน Header (หัวคอลัมน์) */}
                                <div className="grid grid-cols-3 bg-[#e5e5e5] text-gray-700 border-b border-gray-300">
                                    <div className="px-4 py-2 font-medium flex items-center">
                                        ชื่อ
                                    </div>
                                    <div className="px-4 py-2 font-medium flex justify-start items-center gap-1">
                                        <Phone className="w-3 h-3" /> เบอร์
                                    </div>
                                    <div className="px-4 py-2 font-medium text-right"></div>
                                </div>

                                {/* ส่วน Body (แถวข้อมูลผู้เช่า) */}
                                <div className="grid grid-cols-3 bg-white hover:bg-gray-50 border-b border-gray-200 last:border-none transition-colors">
                                    <div className="px-4 py-3 text-gray-800 flex items-center">
                                        นาย ก
                                    </div>
                                    <div className="px-4 py-3 text-gray-800 flex justify-start items-center">
                                        0123456789
                                    </div>
                                    <div className="px-4 py-3 flex justify-end items-center">
                                        <Link to="#" className="text-gray-600 underline hover:text-gray-900 text-xs">
                                            ข้อมูล
                                        </Link>
                                    </div>
                                </div>

                            </div>

                            {/* ปุ่มเพิ่ม */}
                            <div className="mt-auto flex justify-end">
                                <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors text-sm">
                                    เพิ่ม
                                </button>
                            </div>

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