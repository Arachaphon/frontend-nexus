import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ประกาศ Type เพื่อให้ TypeScript ไม่ฟ้อง Error เวลาเรียก window.__ENV__
declare global {
  interface Window {
    __ENV__: {
      API_BASE: string;
    };
  }
}

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

interface FormErrors {
    username?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '', 
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name as keyof FormErrors]) {
        setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    const { username, email, phoneNumber, password, confirmPassword } = formData;

    if (!username.trim()) newErrors.username = "จำเป็นต้องกรอกข้อมูลเหล่านี้";
    if (!email.trim()) newErrors.email = "จำเป็นต้องกรอกข้อมูลเหล่านี้";
    if (!phoneNumber.trim()) newErrors.phoneNumber = "จำเป็นต้องกรอกข้อมูลเหล่านี้";

    if (!password) {
        newErrors.password = "จำเป็นต้องกรอกข้อมูลเหล่านี้";
    } else {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(password)) {
            newErrors.password = `รหัสผ่านต้องมีอย่างน้อย 8 ตัว ประกอบด้วย A-Z, a-z, 0-9 และอักขระพิเศษ`;
        }
    }

    if (!confirmPassword.trim()) {
        newErrors.confirmPassword = "จำเป็นต้องกรอกข้อมูลเหล่านี้";
    } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

        const response = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            email,
            password,
            phoneNumber, 
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || 'การลงทะเบียนล้มเหลว');
        }

        alert("สมัครสมาชิกสำเร็จ!");
        navigate('/login');

      } catch (err: unknown) {
         if (err instanceof Error) {
          alert(`เกิดข้อผิดพลาด: ${err.message}`);
        }
      } finally {
         setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md flex justify-center mb-6">
        <img src="/logo.png" alt="The Nexus Logo" className="w-56 h-auto object-contain" />
      </div>

      <div className="w-full max-w-[500px] bg-lime-50 rounded-[30px] shadow-sm p-8 md:p-10 border">
        <form className="space-y-4" onSubmit={handleSubmit}>
          
          <div>
            <RequiredLabel text="ชื่อและนามสกุล" />
            <input 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              className={`${inputStyle} ${errors.username ? 'ring-2 ring-red-500' : ''}`} 
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          <div>
            <RequiredLabel text="อีเมล" />
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className={`${inputStyle} ${errors.email ? 'ring-2 ring-red-500' : ''}`} 
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <RequiredLabel text="เบอร์โทรศัพท์" />
            <input 
              type="tel" 
              name="phoneNumber" 
              value={formData.phoneNumber} 
              onChange={handleChange} 
              className={`${inputStyle} ${errors.phoneNumber ? 'ring-2 ring-red-500' : ''}`} 
            />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
          </div>

          <div>
            <RequiredLabel text="รหัสผ่าน" detail="(อย่างน้อย 8 ตัวอักษร)" />
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              className={`${inputStyle} ${errors.password ? 'ring-2 ring-red-500' : ''}`} 
            />
            {errors.password && <p className="text-red-500 text-xs mt-1 whitespace-pre-line">{errors.password}</p>}
          </div>

          <div>
            <RequiredLabel text="ยืนยันรหัสผ่าน" />
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              className={`${inputStyle} ${errors.confirmPassword ? 'ring-2 ring-red-500' : ''}`} 
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="flex items-center justify-between pt-6 mt-2">
            <a href="/login" className="text-sm text-gray-500 hover:text-gray-800 underline decoration-gray-300 underline-offset-2">มีบัญชีอยู่แล้ว?</a>
            <button
              type="submit"
              disabled={loading}
              className={`bg-sky-600 hover:bg-cyan-500 text-white font-medium py-3 px-10 rounded-lg shadow-md transition duration-200 text-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'กำลังโหลด...' : 'ลงทะเบียน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;