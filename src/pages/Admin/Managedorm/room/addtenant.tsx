import React, { useState, useEffect } from 'react'; // 🟢 เพิ่ม useEffect
import { useParams, Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

// Import Components (เช็ค Path ให้ตรงกับโฟลเดอร์ของคุณด้วยนะครับ)
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

export default function AddTenant() {
  const { dormitoryId, roomId } = useParams();
  
  // 🟢 เพิ่ม State สำหรับเก็บชื่อหอพักและเลขห้อง
  const [dormitoryName, setDormitoryName] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

  // State สำหรับเก็บข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    firstName: 'นาย ก',
    lastName: 'ข',
    phone: '0123456789',
    idCard: '1561561561561',
    address: 'ที่อยู่ จังหวัด หนองปลาปู ตำบลปลาช่อน อำเภอกบ หมู่ที่ 99 บ้านเลขที่ 99',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    note: ''
  });

  // 🟢 เพิ่ม useEffect ดึงข้อมูลหอพักเพื่อไม่ให้หน้าจอขาว
  useEffect(() => {
    const fetchStats = async () => {
        if (!dormitoryId) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const [dormRes, roomRes] = await Promise.all([
                fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, { method: 'GET', headers }),
                fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}/${roomId}`, { method: 'GET', headers })
            ]);

            if (dormRes.ok) {
                const dormData = await dormRes.json();
                setDormitoryName(dormData.data.name);
            }
            if (roomRes.ok) {
                const roomData = await roomRes.json();
                setRoomNumber(roomData.data.room_number);
            }
        } catch (err) {
            console.error('Unexpected error:', err); 
        }
    };
    fetchStats();
  }, [dormitoryId, roomId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // โค้ดสำหรับเซฟข้อมูลส่งไป API จะอยู่ตรงนี้ครับ
    console.log("Saving Tenant Data:", formData);
    alert('บันทึกข้อมูลสำเร็จ!');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* พื้นที่ขวา */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header - (ดึงชื่อหอพักมาแสดงได้แล้ว) */}
        <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />

        {/* ส่วนเนื้อหาหลัก */}
        <div className="flex-1 overflow-y-auto">
          {/* ขยายเต็มพื้นที่ */}
          <div className="w-full px-6 py-6">
            
            {/* Breadcrumb */}
            <div className="mb-6 w-full">
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 flex-wrap">
                <Link to="/homemain" className="hover:text-emerald-600 flex items-center gap-1.5">
                  <Home className="w-4 h-4" />
                  <span>ห้อง</span>
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to={`/manage/${dormitoryId}/room/${roomId}/roominfo`} className="hover:text-emerald-600">
                  ข้อมูล ห้อง {roomNumber || roomId}
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to={`/manage/${dormitoryId}/room/${roomId}/roominfo`} className="hover:text-emerald-600">
                  ข้อมูลสัญญา
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-800 font-medium">เพิ่มข้อมูลผู้เช่า</span>
              </div>
              <hr className="border-gray-300 w-full" />
            </div>

            {/* Card ฟอร์มข้อมูล (ขยายเต็ม 100%) */}
            <div className="w-full bg-white rounded-md shadow-sm border border-gray-200 p-8">
              
              {/* --- Section 1: ข้อมูลผู้เช่า --- */}
              <h3 className="text-lg font-medium text-gray-800 mb-6">ข้อมูลผู้เช่า</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-10">
                
                {/* ชื่อจริง */}
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">
                    ชื่อจริง<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* นามสกุล */}
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">
                    นามสกุล<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* เบอร์ติดต่อ */}
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">
                    เบอร์ติดต่อ<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* เลขบัตรประชาชน */}
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">
                    เลขบัตรประชาชน/ พาสปอร์ต<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="idCard"
                    value={formData.idCard}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* ที่อยู่ (กินพื้นที่ 2 คอลัมน์) */}
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                  <p className="text-[11px] text-gray-400 mb-2 leading-tight">
                    (สำหรับแสดงบนใบแจ้งหนี้/ใบเสร็จ)<br/>
                    **ตัวอย่าง ที่อยู่ จังหวัด หนองปลาปู ตำบลปลาช่อน อำเภอกบ หมู่ที่ 99 บ้านเลขที่ 99**
                  </p>
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

              </div>

              {/* --- Section 2: บุคคลติดต่อฉุกเฉิน --- */}
              <hr className="border-gray-200 mb-6" />
              <h3 className="text-lg font-medium text-gray-800 mb-6">บุคคลติดต่อฉุกเฉิน</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 mb-10">
                
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">ชื่อบุคคลติดต่อฉุกเฉิน</label>
                  <input 
                    type="text" 
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">ความสัมพันธ์</label>
                  <input 
                    type="text" 
                    name="emergencyRelation"
                    value={formData.emergencyRelation}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">เบอร์ติดต่อ</label>
                  <input 
                    type="text" 
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

              </div>

              {/* --- Section 3: อื่นๆ --- */}
              <hr className="border-gray-200 mb-6" />
              <h3 className="text-lg font-medium text-gray-800 mb-6">อื่นๆ</h3>
              <div className="mb-8">
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">Note</label>
                  <textarea 
                    name="note"
                    rows={4}
                    value={formData.note}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  ></textarea>
                  <p className="text-[11px] text-gray-500 mt-2">ข้อความนี้จะแสดงที่ รายงาน - ผู้เช่าปัจจุบัน</p>
                </div>
              </div>

              {/* ปุ่มบันทึก */}
              <div className="flex justify-end mt-4">
                <button 
                  onClick={handleSave}
                  className="bg-[#75706b] hover:bg-[#5a5652] text-white text-sm font-medium py-2.5 px-10 rounded-md transition-colors shadow-sm"
                >
                  บันทึก
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