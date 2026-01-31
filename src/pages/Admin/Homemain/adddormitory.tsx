import React, { useState } from 'react';
import C_HomeMain from '../../../components/C_homemain'; 
import Footer from '../../../components/Footerhomemain'; 

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

const Adddormitory: React.FC = () => {

  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    phone_number: '',
    tax_id: '',
    due_date: '',
    fine_per_day: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading,setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    // ตรวจสอบ: ถ้าเป็นตัวเลข ห้ามต่ำกว่า 0 (ห้ามติดลบ)
    if (type === 'number' && value !== '' && Number(value) < 0) return;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // ลบ Error ทันทีเมื่อมีการแก้ไขในช่องนั้น
    if (errors[name]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        setLoading(true);
        try{
            const token = localStorage.getItem('token');
            const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

            const response = await fetch(`${API_BASE}/api/dormitories/add`, {
                method: 'POST',
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

            if (!response.ok || !result.success) {
                throw new Error(result.message ||'ไม่สามารถบันทึกข้อมูลได้');
            }

            if (result.dormitory_id) {
                localStorage.setItem('dormitoryId', result.dormitory_id)
                console.log('สร้างหอพักสำเร็จ:', formData);
            }
            window.location.href = "/Homemain/utilitycalculation";
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("เกิดข้อผิดพลาดที่ไม่รู้จัก")
            } 
        } finally {
            setLoading(false);
        }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fcf8]"> 
      <C_HomeMain />

      <div className="flex-grow w-full max-w-6xl mx-auto px-6 py-10 flex flex-col items-center">


        <div className="w-full flex flex-col items-center mb-8">
            <h2 className="text-xl font-bold text-[#0e4b3a]">รายละเอียดหอพัก</h2>
            <p className="text-sm text-gray-500 mb-6">ชื่อและที่อยู่เพื่อนำไปแสดงในรายการใบแจ้งหนี้และใบเสร็จ</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full px-4 md:px-12">
                <div className="flex flex-col">
                    <label className="mb-2 font-medium text-gray-700">ชื่อ<span className="text-red-500">*</span></label>
                    <input 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        type="text" 
                        className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-400'} rounded-lg h-12 px-4 focus:outline-none focus:border-[#0e4b3a] shadow-sm`}
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
                        className={`w-full border ${errors.address ? 'border-red-500' : 'border-gray-400'} rounded-lg h-12 px-4 focus:outline-none focus:border-[#0e4b3a] shadow-sm`}
                    />
                    {errors.address && <span className="text-red-500 text-xs mt-1">{errors.address}</span>}
                </div>
            </div>
        </div>

        <div className="w-full border-b border-[#8daaa2] my-4 md:mx-12 opacity-50"></div>

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
                        className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-400'} rounded-lg h-12 px-4 focus:outline-none focus:border-[#0e4b3a] shadow-sm`}
                    />
                    {errors.phone && <span className="text-red-500 text-xs mt-1">{errors.phone_number}</span>}
                </div>

                <div className="flex flex-col">
                    <label className="mb-2 font-medium text-gray-700">เลขประจำตัวผู้เสียภาษี</label>
                    <input 
                        name="tax_id"
                        value={formData.tax_id}
                        onChange={handleChange}
                        type="text" 
                        className="w-full border border-gray-400 rounded-lg h-12 px-4 focus:outline-none focus:border-[#0e4b3a] shadow-sm"
                    />
                </div>
            </div>
        </div>

        <div className="w-full border-b border-[#8daaa2] my-4 md:mx-12 opacity-50"></div>

        <div className="w-full flex flex-col items-center my-8">
            <h2 className="text-xl font-bold text-[#0e4b3a]">กำหนดชำระค่าห้องและค่าปรับ</h2>
            <p className="text-sm text-gray-500 mb-6">วันที่ที่ต้องการให้ระบบเริ่มคิดค่าปรับอัตโนมัติกรณีเลยวันที่กำหนดชำระเงิน</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full px-4 md:px-12">

                <div className="flex flex-col">
                    <label className="mb-2 font-medium text-gray-700">ระบุวันสุดท้ายของการชำระเงิน<span className="text-red-500">*</span></label>
                    <div className={`flex items-center w-full border ${errors.dueDate ? 'border-red-500' : 'border-gray-400'} rounded-lg h-12 overflow-hidden shadow-sm bg-white`}>
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
                    {errors.dueDate && <span className="text-red-500 text-xs mt-1">{errors.due_date}</span>}
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

        <div className="w-full flex justify-end px-4 md:px-12">
            <button 
                onClick={handleSubmit}
                disabled={loading}
                className={loading ? "opacity-50 cursor-not-allowed":"bg-[#7d7671] hover:bg-[#635d59] text-white px-10 py-2 rounded-md font-medium shadow transition-colors"}
            >
                {loading ? "กำลังบันทึก...":"สร้าง"}
            </button>
        </div>

      </div>

      <div className="w-full">
        <Footer />
      </div>

    </div> 
  );
}

export default Adddormitory;