import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- ส่วนประกอบย่อย (ก๊อปปี้มาจากหน้า Register เพื่อความเหมือน) ---
interface RequiredLabelProps {
  text: string;
  detail?: string; 
}

const RequiredLabel: React.FC<RequiredLabelProps> = ({ text, detail }) => {
  return (
    <label className="block text-gray-700 text-sm mb-1 font-medium">
      {text}
      {detail && <span className="text-gray-400 text-xs ml-1 font-normal">{detail}</span>}
      <span className="text-red-400 ml-1">* จำเป็น</span>
    </label>
  );
};

const inputStyle = "w-full px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-lime-50 outline-none bg-white shadow-sm";

// --- Interface State ---
interface PasswordErrors {
    password?: string;
    confirmPassword?: string;
}

const CreatePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<PasswordErrors>({});
  const [loading, setLoading] = useState(false); // แก้ไขการประกาศ State

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof PasswordErrors]) {
        setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => { // เพิ่ม async ตรงนี้
    e.preventDefault();
    const newErrors: PasswordErrors = {};
    const { password, confirmPassword } = formData;

    // --- Validation Logic (คงเดิม) ---
    if (!password) {
        newErrors.password = "จำเป็นต้องกรอกข้อมูลเหล่านี้";
    } else {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(password)) {
            newErrors.password = `รหัสผ่านต้องมีอย่างน้อย 8 ตัว ประกอบด้วย A-Z, a-z, 0-9 และอักขระพิเศษ`;
        }
    }
    if (!confirmPassword) {
        newErrors.confirmPassword = "จำเป็นต้องกรอกข้อมูลเหล่านี้";
    } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
        setLoading(true);
        try {
            // ดึง Email จาก localStorage (ที่เก็บไว้จากหน้า Forgot Password)
            const email = localStorage.getItem('resetEmail');

            const response = await fetch('/api/create', { // ใช้ await fetch
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: formData.password
                }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'เกิดข้อผิดพลาด');
            }

            alert("ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่");
            localStorage.removeItem('resetEmail'); // ล้างข้อมูลชั่วคราว
            navigate('/login');

        } catch (err: unknown) { // แก้ไขการ Handle Error
            if (err instanceof Error) {
                alert(err.message);
            }
        } finally {
            setLoading(false);
        }
    }
};

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans">
      
        {/* Logo Section */}
        <div className="flex items-start justify-center md:justify-start">
            <img 
                src="/logo.png" 
                alt="The Nexus Logo" 
                className="w-48 h-auto object-contain" 
            />
        </div>

      {/* --- การ์ดตั้งรหัสผ่านใหม่ --- */}
      <div className="w-full max-w-md bg-lime-50 rounded-2xl shadow-lg p-8 mt-10">
        
        {/* หัวข้อการ์ด */}
        <h2 className="text-center text-gray-800 text-xl font-medium mb-3">
          ตั้งรหัสผ่านใหม่
        </h2>
        
        {/* เส้นขีดคั่น */}
        <div className="border-b border-gray-300 w-full mb-6"></div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ช่องรหัสผ่านใหม่ */}
          <div>
            <RequiredLabel text="รหัสผ่านใหม่" detail="(อย่างน้อย 8 ตัวอักษร)" />
            <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                className={`${inputStyle} ${errors.password ? 'ring-2 ring-red-500' : ''}`} 
            />
            {errors.password && <p className="text-red-500 text-xs mt-1 whitespace-pre-line">{errors.password}</p>}
          </div>

          {/* ช่องยืนยันรหัสผ่านใหม่ */}
          <div>
            <RequiredLabel text="ยืนยันรหัสผ่านใหม่" />
            <input 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                className={`${inputStyle} ${errors.confirmPassword ? 'ring-2 ring-red-500' : ''}`} 
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* ปุ่มบันทึก (ชิดขวา) */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-sky-600 hover:bg-cyan-500 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-colors duration-200"
            >
              ยืนยันการเปลี่ยนรหัสผ่าน
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreatePasswordPage;