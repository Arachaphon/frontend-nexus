import React, { useState, useEffect } from 'react'; 
import C_HomeMain from '../../../components/C_homemain'; 
import Footer from '../../../components/Footerhomemain'; 

declare global {
  interface Window {
    __ENV__: {
      API_BASE: string;
    };
  }
}

const ProfileSettings: React.FC = () => {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [currentId, setCurrentId] = useState<string | number>("");

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      try {
        const userData = JSON.parse(session);
        setCurrentId(userData.id);
        fetchUserData(userData.id); 
      } catch {
        console.error("Session parse error");
      }
    }
  }, []);

  const fetchUserData = async (id: string | number) => {
    try {
      const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';
      setLoading(true);
      
      const token = localStorage.getItem('token'); 

      const response = await fetch(`${API_BASE}/api/profile?id=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.status === 403) {
        window.location.href = '/homemain'
        return
      }

      const data = await response.json();
      
      if (data && !data.error) {
        setProfile({
          name: data.data?.username || data.username || '',
          email: data.data?.email || data.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/api/profile`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          userId: currentId, 
          username: profile.name, 
          email: profile.email 
        })
      });

      if (!response.ok) throw new Error('บันทึกไม่สำเร็จ');

      if (response.ok) {
        const session = localStorage.getItem('userSession');
        if (session) {
          const userData = JSON.parse(session);
          userData.username = profile.name; 
          localStorage.setItem('userSession', JSON.stringify(userData));
        }
        
        fetchUserData(currentId); 
        alert('บันทึกข้อมูลสำเร็จ!');
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  // --- ส่วนรหัสผ่าน ---
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  
  // 🟢 1. สร้าง State สำหรับควบคุมการเปิด/ปิดลูกตา
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const savePassword = async () => {
    const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';
    if (!password.current || !password.new || !password.confirm){
      alert('กรุณากรอกข้อมูลรหัสผ่านให้ครบถ้วน');
      return;
    }
    if (password.new !== password.confirm) {
      alert('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/api/profile/password`, {
        method: 'PATCH',
        headers: { 
          'Content-Type' : 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          userId: currentId,
          currentPassword: password.current,
          newPassword: password.new
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
      }

      setPassword({ current: '' , new: '' , confirm: ''});
      alert('เปลี่ยนรหัสผ่านสำเร็จ!');
    } catch (error : unknown) {
      alert(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[#f8fcf8]'>
        <p className='text-lg text-gray-600'>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  // 🟢 ไอคอนลูกตาเปิด (Eye)
  const EyeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  // 🟢 ไอคอนลูกตาปิด (EyeSlash)
  const EyeSlashIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.858 9.858" />
    </svg>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fcf8]">
      <C_HomeMain />
        <div className="flex-grow w-full max-w-6xl mx-auto px-6 py-10">
          {/* ส่วนที่ 1: ข้อมูลส่วนตัว (เหมือนเดิม) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 items-start">
            <div className="text-center md:text-left">
              <h2 className="text-xl font-semibold text-gray-800">ข้อมูลส่วนตัว</h2>
              <p className="text-sm text-gray-500 mt-1">อัปเดตข้อมูลโปรไฟล์และอีเมลของบัญชีของคุณ</p>
            </div>
            
            <div className="md:col-span-2 space-y-5 max-w-2xl">
              <div className="flex flex-col">
                <label className="mb-2 text-base font-medium text-gray-800">ชื่อ</label>
                <input 
                  type="text" 
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full border border-gray-400 rounded-xl h-12 px-4 focus:outline-none focus:ring-1 focus:ring-lime-50 bg-white shadow-sm "
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-base font-medium text-gray-800">อีเมล</label>
                <input 
                  type="email" 
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="w-full border border-gray-400 rounded-xl h-12 px-4 focus:outline-none focus:ring-1 focus:ring-lime-50 bg-white shadow-sm"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  onClick={saveProfile}
                  className="bg-[#7d7671] hover:bg-[#635d59] text-white px-8 py-2.5 rounded-lg text-sm transition-colors shadow-md"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>

          <div className="w-full border-b border-[#8daaa2] my-12 opacity-40"></div>

          {/* ส่วนที่ 2: อัพเดทรหัสผ่าน */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-start">
            <div className="text-center md:text-left">
              <h2 className="text-xl font-semibold text-gray-800">อัพเดทรหัสผ่าน</h2>
              <p className="text-sm text-gray-500 mt-1">ระบุรหัสผ่านเดิมและรหัสผ่านใหม่ของคุณ</p>
            </div>
            
            <div className="md:col-span-2 space-y-5 max-w-2xl">
              {/* รหัสผ่านปัจจุบัน (ไม่ได้ใส่ลูกตา ตามที่คุณบรีฟ) */}
              <div className="flex flex-col">
                <label className="mb-2 text-base font-medium text-gray-800">รหัสผ่านปัจจุบัน</label>
                <input 
                  type="password" 
                  name="current"
                  value={password.current}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-400 rounded-xl h-12 px-4 focus:outline-none focus:ring-1 focus:ring-lime-50 bg-white shadow-sm"
                />
              </div>

              {/* 🟢 รหัสผ่านใหม่ (เพิ่มลูกตา) */}
              <div className="flex flex-col">
                <label className="mb-2 text-base font-medium text-gray-800">รหัสผ่านใหม่</label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? "text" : "password"} // เปลี่ยน type ตาม state
                    name="new"
                    value={password.new}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-400 rounded-xl h-12 px-4 pr-12 focus:outline-none focus:ring-1 focus:ring-lime-50 bg-white shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                  >
                    {showNewPassword ? EyeSlashIcon : EyeIcon}
                  </button>
                </div>
              </div>

              {/* 🟢 ยืนยันรหัสผ่านใหม่อีกครั้ง (เพิ่มลูกตา) */}
              <div className="flex flex-col">
                <label className="mb-2 text-base font-medium text-gray-800">ยืนยันรหัสผ่านใหม่อีกครั้ง</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} // เปลี่ยน type ตาม state
                    name="confirm"
                    value={password.confirm}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-400 rounded-xl h-12 px-4 pr-12 focus:outline-none focus:ring-1 focus:ring-lime-50 bg-white shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                  >
                    {showConfirmPassword ? EyeSlashIcon : EyeIcon}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={savePassword}
                  className="bg-[#7d7a75] hover:bg-[#6b6863] text-white px-8 py-2.5 rounded-lg text-sm transition-colors shadow-md"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      <Footer />
    </div>
  );
}
export default ProfileSettings;