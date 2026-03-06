import React, { useState, useEffect } from 'react'; 
import { useParams, Link } from 'react-router-dom';
import { Home, ChevronRight, Waves, Flame, Phone, X } from 'lucide-react'; 

// Import Components (เช็ค Path ให้ตรงกับโครงสร้างของคุณด้วยนะครับ)
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

interface Room {
  id: string;
  room_number: string;
  status: string;
}

const statusMap: Record<string, string> = {
  vacant: 'ว่าง',
  occupied: 'ไม่ว่าง'
}


export default function RoomInfo() {
    const { dormitoryId, roomId } = useParams();
    const [dormitoryName, setDormitoryName] = useState<string>('');
    const [room, setRoom] = useState<Room | null>(null);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [contract, setContract] = useState<Contract[]>([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); 
    const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

    // State สำหรับควบคุม Modal แจ้งย้ายออก
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [moveOutDate, setMoveOutDate] = useState('');
    
    // 🟢 State สำหรับเก็บวันที่ที่ "บันทึก" แล้ว เพื่อนำมาโชว์หน้า UI หลัก
    const [savedMoveOutDate, setSavedMoveOutDate] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!dormitoryId) return;
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('Authentication token not found.');
                    return;
                }
                const headers = {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                const [dormRes, roomRes, tenantRes , contractRes] = await Promise.all([
                    fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, { method: 'GET', headers }),
                    fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}/${roomId}`, { method: 'GET', headers }),
                    fetch(`${API_BASE}/api/rentals/tenants/dormitories/${dormitoryId}`, { method: 'GET', headers }),
                    fetch(`${API_BASE}/api/rentals/contracts/dormitories/${dormitoryId}`, { method: 'GET', headers }),
                ]);

                if (dormRes.status === 403 || roomRes.status === 403) {
                    window.location.href = '/homemain'
                    return
                }

                if (!dormRes.ok || !roomRes.ok) {
                    console.error('API request failed:', dormRes.status, roomRes.status);
                    return;
                }

                const dormData = await dormRes.json();
                setDormitoryName(dormData.name);

                const roomData = await roomRes.json();
                setRoom(roomData.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unexpected error');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [dormitoryId, roomId]);

    // ฟังก์ชันบันทึกการแจ้งย้ายออก
    const handleSaveMoveOut = () => {
        if (!moveOutDate) {
            alert('กรุณาระบุวันที่แจ้งย้ายออก');
            return;
        }
        console.log("วันที่แจ้งย้ายออก:", moveOutDate);
        setSavedMoveOutDate(moveOutDate); // 🟢 บันทึกวันที่เพื่อนำไปแสดงผล
        setIsModalOpen(false); // ปิด Modal
    };

    // 🟢 ฟังก์ชันแปลงวันที่รูปแบบ YYYY-MM-DD เป็น DD/MM/YYYY ตามรูปภาพ
    const formatDisplayDate = (dateString: string) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };
    
  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden relative">
      
      {/* Modal (ป๊อปอัปแจ้งย้ายออก) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-[450px] max-w-[90%] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">แจ้งย้ายออก</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="px-6 py-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่แจ้งย้ายออก<span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                value={moveOutDate}
                onChange={(e) => setMoveOutDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              />
            </div>
            
            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                ปิด
              </button>
              <button 
                onClick={handleSaveMoveOut}
                className="px-6 py-2 text-sm font-medium text-white bg-[#75706b] rounded-md hover:bg-[#5a5652] transition-colors"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sidebar อยู่คงที่ */}
      <Sidebar />
      
      {/* พื้นที่ขวา */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />

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
                         
                         <Link to={`/manage/${dormitoryId}/room/${roomId}/roominfo`} className="hover:text-emerald-600">
                             ข้อมูล ห้อง {room?.room_number}
                         </Link>

                         <ChevronRight className="w-4 h-4 text-gray-400" />
                         <span className="text-gray-800 font-medium">ข้อมูลสัญญา</span>

                     </div>
                     <hr className="border-gray-300 w-full" />
                 </div>

                {/* Grid แบ่ง 2 ฝั่ง ซ้าย-ขวา */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    
                    {/* ฝั่งซ้าย: ข้อมูลห้องพัก */}
                    <div className="xl:col-span-5 bg-white rounded-md shadow-sm border border-gray-200 p-6 flex flex-col h-full">
                        
                        {/* Header ห้อง */}
                        <div className="flex items-start sm:items-center gap-3 mb-4 flex-col sm:flex-row">
                            <h2 className="text-2xl font-normal text-gray-800 break-all">ห้อง : {room?.room_number}</h2>
                            <span className="bg-[#ff9b50] text-white text-xs px-3 py-1 rounded-sm whitespace-nowrap mt-1 sm:mt-0">
                                {statusMap[room?.status ?? ''] ?? '-'}
                            </span>
                        </div>

                        <hr className="border-gray-300 w-full mb-2" />

                        {/* ปุ่ม แก้ไข */}
                        <div className="flex justify-end mb-2">
                            <Link to={`/manage/${dormitoryId}/room/${roomId}/addcontract`} className="text-sm font-semibold text-gray-600 underline hover:text-gray-900">
                                แก้ไข
                            </Link>
                        </div>

                        {/* ข้อมูลสัญญา (List) */}
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

                        {/* เลขมิเตอร์วันเข้าพัก */}
                        <div className="mb-4 flex justify-between items-center mt-auto">
                            <h3 className="text-gray-800 font-medium">เลขมิเตอร์วันเข้าพัก</h3>
                            <Link to={`/manage/${dormitoryId}/room/${roomId}/addcontract3/1`} className="text-sm text-gray-600 underline hover:text-gray-900">
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

                        {/* แจ้งย้ายออก */}
                        <div className="mb-2">
                            <h3 className="text-gray-800 font-medium mb-4">แจ้งย้ายออก</h3>
                            <div className="flex flex-col gap-4 items-center">
                                
                                {/* 🟢 เงื่อนไขสลับหน้าจอตามภาพ ถ้ามีวันที่แล้วให้แสดงวันที่ ถ้าไม่มีให้แสดงปุ่มเดิม */}
                                {savedMoveOutDate ? (
                                    <div className="flex flex-col items-center gap-3 mb-2">
                                        <span className="text-[22px] font-normal text-black">
                                            {formatDisplayDate(savedMoveOutDate)}
                                        </span>
                                        <button 
                                          onClick={() => setIsModalOpen(true)}
                                          className="px-6 py-2 text-sm text-gray-400 border border-gray-200 rounded-md bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            แก้ไขวันที่แจ้งย้ายออก
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                      onClick={() => setIsModalOpen(true)}
                                      className="w-32 py-2 text-sm text-gray-400 border border-gray-200 rounded-md bg-gray-50/50 hover:bg-gray-100 cursor-pointer transition-colors"
                                    >
                                        แจ้งย้ายออก
                                    </button>
                                )}
                                <Link to = {`/manage/${dormitoryId}/room/${roomId}/roominfo/moveout`}
            
                                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-6 rounded-md transition-colors w-full max-w-[200px]">
                                    ยกเลิกสัญญา / ย้ายออก
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* ฝั่งขวา: ข้อมูลผู้เช่า */}
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
                                        <Link to={`/manage/${dormitoryId}/room/${roomId}/tenantinfo`} className="text-gray-600 underline hover:text-gray-900 text-xs">
                                            ข้อมูล
                                        </Link>
                                    </div>
                                </div>

                            </div>

                            {/* ปุ่มเพิ่ม */}
                            <div className="mt-auto flex justify-end">
                                <Link to={`/manage/${dormitoryId}/room/${roomId}/addtenant`} className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors text-sm">
                                    เพิ่ม
                                </Link>

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