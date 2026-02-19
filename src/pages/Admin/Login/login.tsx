import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ประกาศ Type เพื่อให้ TypeScript รู้จัก window.__ENV__
declare global {
  interface Window {
    __ENV__: {
      API_BASE: string;
    };
  }
}

const LoginPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberUsername');
    const savedPassword = localStorage.getItem('rememberPassword');
    if (savedUsername && savedPassword) {
      setFormData({ username: savedUsername, password: savedPassword });
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    
    const { username, password } = formData;
    const newErrors: { username?: string; password?: string } = {};

    if (!username) newErrors.username = 'กรุณากรอกชื่อผู้ใช้หรืออีเมล';
    if (!password) newErrors.password = 'กรุณากรอกรหัสผ่าน';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setLoading(true);

    try {
      // แก้ไขจุดสำคัญ: ดึงค่าจาก window.__ENV__ ตามมาตรฐาน Docker/อาจารย์
      const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';
      
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.token) {
          localStorage.setItem('token',result.token);
        }
        if (rememberMe) {
          localStorage.setItem('rememberUsername', formData.username);
          localStorage.setItem('rememberPassword', formData.password);
        } else {
          localStorage.removeItem('rememberUsername');
          localStorage.removeItem('rememberPassword');
        }

        if (result.user) {
          localStorage.setItem('userSession', JSON.stringify(result.user));
        }

        navigate('/homemain'); 
      } else {
        throw new Error(result.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }

    } catch (err: unknown) {
      console.error('Login Error:', err);
      // ถ้า Error เป็น "Failed to fetch" แสดงว่า URL API_BASE ผิด
      setErrors({ general: (err as Error).message === 'Failed to fetch' 
        ? 'ไม่สามารถเชื่อมต่อ Server ได้ (ตรวจสอบ API_BASE)' 
        : (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-white flex items-center justify-center overflow-hidden font-sans">
      <div className="absolute -top-[1%] -left-[15%] w-[90%] h-[25%] bg-emerald-900 transform rotate-[25deg] rounded-[60px] z-0"></div>
      <div className="absolute -bottom-[5%] -left-[20%] w-[150%] h-[25%] bg-emerald-900 transform rotate-[25deg] rounded-[60px] z-0"></div>

      <div className="z-10 container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl">
        <div className="hidden lg:block relative">
          <div className="rounded-[40px] overflow-hidden shadow-2xl">
            <img src="/login.png" alt="Office Coworking" className="w-full h-[700px] object-cover" />
          </div>
        </div>

        <div className="flex flex-col items-center lg:items-end w-full">
          <div className="w-full max-w-md flex justify-center lg:justify-end mb-6">
            <img src="/logo.png" alt="The Nexus Logo" className="w-56 h-auto object-contain" />
          </div>

          <div className="bg-lime-50 w-full max-w-[500px] p-8 rounded-[30px] shadow-xl relative">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-gray-800 font-medium mb-2 text-sm">ชื่อผู้ใช้ / อีเมล</label>
                <input 
                  type="text" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-lime-50 outline-none bg-white shadow-sm ${errors.username ? 'ring-2 ring-red-500' : ''}`}
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-gray-800 font-medium mb-2 text-sm">รหัสผ่าน</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-10 rounded-lg border-none focus:ring-2 focus:ring-lime-50 outline-none bg-white shadow-sm ${errors.password ? 'ring-2 ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                {errors.general && <p className="text-red-500 text-xs mt-1 font-bold">{errors.general}</p>}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                  <span className="text-gray-700">บันทึกรหัสผ่าน</span>
                </label>
                <a href="/forgotpassword" className="text-gray-700 underline hover:text-gray-900">ลืมรหัสผ่าน</a>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={loading} className="bg-sky-600 hover:bg-cyan-500 text-white font-medium py-3 px-10 rounded-lg shadow-md transition duration-200 text-lg disabled:opacity-50">
                  {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
                </button>
              </div>

              <div className="border-t border-gray-300 my-4"></div>
              <div className="text-right">
                <span className="text-gray-600">ยังไม่มีบัญชีผู้ใช้? </span>
                <a href="/register" className="text-gray-800 underline hover:text-black font-medium ml-2">ลงทะเบียน</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;