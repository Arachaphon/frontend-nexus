import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

interface FormData {
  name: string;
  address: string;
  phone_number: string;
  tax_id: string;
  due_date: string;
  fine_per_day: string;
}

interface FormErrors {
  [key: string]: string; 
}

export default function DormInfo() {
  const { dormitoryId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    phone_number: '',
    tax_id: '',
    due_date: '',
    fine_per_day: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [dormitoryName, setDormitoryName] = useState<string>('');

  const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

  // --- ดึงข้อมูลหอพักเดิมมาแสดง (ถ้ามี) ---
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
        setFormData({
          name: dorm.name || '',
          address: dorm.address || '',
          phone_number: dorm.phone_number || '',
          tax_id: dorm.tax_id || '',
          due_date: dorm.due_date ? String(dorm.due_date) : '',
          fine_per_day: dorm.fine_per_day ? String(dorm.fine_per_day) : ''
        });
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

  // --- จัดการ Input ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number' && value !== '' && Number(value) < 0) return;
    
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  // --- บันทึกข้อมูล ---
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'จำเป็นต้องกรอกชื่อหอพัก';
    if (!formData.address.trim()) newErrors.address = 'จำเป็นต้องกรอกที่อยู่';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'จำเป็นต้องกรอกเบอร์โทรศัพท์';
    if (formData.due_date === '') newErrors.due_date = 'จำเป็นต้องระบุวันสุดท้ายของการชำระเงิน';
    if (formData.fine_per_day === '') newErrors.fine_per_day = 'จำเป็นต้องระบุค่าปรับ';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // เลื่อนหน้าจอกลับขึ้นไปด้านบนเมื่อมี Error
      const scrollableDiv = document.getElementById('scrollable-content');
      if(scrollableDiv) scrollableDiv.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const activeDormId = dormitoryId || localStorage.getItem('dormitoryId');
      
      // เลือก Method (ถ้ามี ID แล้ว = แก้ไข (PUT), ถ้ายังไม่มี = สร้างใหม่ (POST))
      const method = activeDormId ? 'PUT' : 'POST';
      const url = activeDormId 
        ? `${API_BASE}/api/dormitories/main/${activeDormId}`
        : `${API_BASE}/api/dormitories/main`;

      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          due_date: Number(formData.due_date),
          fine_per_day: Number(formData.fine_per_day)
        })
      });

      const result = await response.json();

      if (response.status === 403) {
        navigate('/homemain');
        return;
      }
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'ไม่สามารถบันทึกข้อมูลได้');
      }

      if (result.dormitory_id) {
        localStorage.setItem('dormitoryId', result.dormitory_id);
      }
      
      alert('บันทึกข้อมูลสำเร็จ');
      
      // อัปเดตชื่อด้านบนให้เป็นชื่อล่าสุด
      setDormitoryName(formData.name);

    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("เกิดข้อผิดพลาดที่ไม่รู้จัก");
      } 
    } finally {
      setLoading(false);
    }
  };

  // --- หน้าจอ Loading ตอนโหลดครั้งแรก ---
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
    // เปลี่ยนตัวคลุมนอกสุดให้มีความสูงพอดีจอ (h-screen) และซ่อนส่วนที่เกิน (overflow-hidden)
    <div className="flex h-screen bg-[#f8fcf8] font-sans overflow-hidden"> 
      <Sidebar />
      
      {/* ล็อคคอลัมน์ขวาให้สูงเท่าจอ และซ่อน scroll ของทั้งหน้า */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        
        {/* Header โดนล็อคอยู่กับที่ด้านบน */}
        <div className="flex-none">
          <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />
        </div>

        {/* --- ส่วนเนื้อหาตรงกลางที่เลื่อนได้ (Scrollable Area) --- */}
        <div id="scrollable-content" className="flex-grow w-full flex flex-col items-center px-6 py-10 overflow-y-auto">
          
          {/* ตัวคลุมจำกัดความกว้างให้เนื้อหาไม่เกินจอใหญ่ */}
          <div className="w-full max-w-6xl flex flex-col items-center">
            
            {/* ฟอร์มรายละเอียดหอพัก */}
            <div className="w-full flex flex-col items-center mb-8">
              <h2 className="text-xl font-bold text-[#0e4b3a]">ข้อมูลหอพัก</h2>
              <p className="text-sm text-gray-500 mb-6">ชื่อและที่อยู่เพื่อนำไปแสดงในรายการใบแจ้งหนี้และใบเสร็จ</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full px-4 md:px-12">
                <div className="flex flex-col">
                  <label className="mb-2 font-medium text-gray-700">ชื่อ<span className="text-red-500">*</span></label>
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text" 
                    className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-400'} rounded-lg h-12 px-4 focus:outline-none focus:border-[#0e4b3a] shadow-sm bg-white`}
                  />
                  {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name}</span>}
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 font-medium text-gray-700">ที่อยู่<span className="text-red-500">*</span></label>
                  <input 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    type="text" 
                    className={`w-full border ${errors.address ? 'border-red-500' : 'border-gray-400'} rounded-lg h-12 px-4 focus:outline-none focus:border-[#0e4b3a] shadow-sm bg-white`}
                  />
                  {errors.address && <span className="text-red-500 text-xs mt-1">{errors.address}</span>}
                </div>
              </div>
            </div>

            <div className="w-full border-b border-[#8daaa2] my-4 md:mx-12 opacity-50"></div>

            {/* ฟอร์มรายละเอียดอื่นๆ */}
            <div className="w-full flex flex-col items-center my-8">
              <h2 className="text-xl font-bold text-[#0e4b3a]">รายละเอียดอื่นๆ</h2>
              <p className="text-sm text-gray-500 mb-6">เบอร์โทรศัพท์และ เลขประจำตัวผู้เสียภาษี</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full px-4 md:px-12">
                <div className="flex flex-col">
                  <label className="mb-2 font-medium text-gray-700">เบอร์โทรศัพท์<span className="text-red-500">*</span></label>
                  <input 
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    type="text" 
                    className={`w-full border ${errors.phone_number ? 'border-red-500' : 'border-gray-400'} rounded-lg h-12 px-4 focus:outline-none focus:border-[#0e4b3a] shadow-sm bg-white`}
                  />
                  {errors.phone_number && <span className="text-red-500 text-xs mt-1">{errors.phone_number}</span>}
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 font-medium text-gray-700">เลขประจำตัวผู้เสียภาษี</label>
                  <input 
                    name="tax_id"
                    value={formData.tax_id}
                    onChange={handleChange}
                    type="text" 
                    className="w-full border border-gray-400 rounded-lg h-12 px-4 focus:outline-none focus:border-[#0e4b3a] shadow-sm bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="w-full border-b border-[#8daaa2] my-4 md:mx-12 opacity-50"></div>

            {/* ฟอร์มกำหนดชำระค่าห้องและค่าปรับ */}
            <div className="w-full flex flex-col items-center my-8">
              <h2 className="text-xl font-bold text-[#0e4b3a]">กำหนดชำระค่าห้องและค่าปรับ</h2>
              <p className="text-sm text-gray-500 mb-6">วันที่ที่ต้องการให้ระบบเริ่มคิดค่าปรับอัตโนมัติกรณีเลยวันที่กำหนดชำระเงิน</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full px-4 md:px-12">
                <div className="flex flex-col">
                  <label className="mb-2 font-medium text-gray-700">ระบุวันสุดท้ายของการชำระเงิน<span className="text-red-500">*</span></label>
                  <div className={`flex items-center w-full border ${errors.due_date ? 'border-red-500' : 'border-gray-400'} rounded-lg h-12 overflow-hidden shadow-sm bg-white`}>
                    <div className="bg-gray-200 px-4 h-full flex items-center text-gray-600 border-r border-gray-400 text-sm">วันที่</div>
                    <input 
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleChange}
                      type="number" 
                      min="0"
                      placeholder="0"
                      className="flex-grow px-4 focus:outline-none h-full"
                    />
                  </div>
                  {errors.due_date && <span className="text-red-500 text-xs mt-1">{errors.due_date}</span>}
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 font-medium text-gray-700">ค่าปรับชำระล่าช้าต่อวัน<span className="text-red-500">*</span></label>
                  <div className={`flex items-center w-full border ${errors.fine_per_day ? 'border-red-500' : 'border-gray-400'} rounded-lg h-12 overflow-hidden shadow-sm bg-white`}>
                    <input 
                      name="fine_per_day"
                      value={formData.fine_per_day}
                      onChange={handleChange}
                      type="number" 
                      min="0"
                      placeholder="0"
                      className="flex-grow px-4 focus:outline-none h-full"
                    />
                    <div className="bg-gray-200 px-4 h-full flex items-center text-gray-600 border-l border-gray-400 text-sm">บาท /วัน</div>
                  </div>
                  {errors.fine_per_day && <span className="text-red-500 text-xs mt-1">{errors.fine_per_day}</span>}
                </div>
              </div>
            </div>

            <div className="w-full border-b border-[#8daaa2] mt-4 mb-8 md:mx-12 opacity-50"></div>

            {/* ปุ่มบันทึก */}
            <div className="w-full flex justify-end mt-8 mb-4">
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className={loading ? "opacity-50 cursor-not-allowed bg-[#7d7671] text-white px-10 py-2 rounded-md font-medium shadow transition-colors" : "bg-[#7d7671] hover:bg-[#635d59] text-white px-10 py-2 rounded-md font-medium shadow transition-colors"}
              >
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>

          </div>
        </div>
        
        {/* Footer โดนล็อคอยู่กับที่ด้านล่าง */}
        <div className="flex-none w-full border-t border-gray-200">
          <Footer />
        </div>

      </div>
    </div> 
  );
}