import React, { useState, useEffect } from 'react'; // เติม React และ useEffect
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

  const fetchUserData = async (id: string|number) => {
    try {
      const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/profile?id=${id}`);
      const data = await response.json();
      
      if (data && !data.error) {
        setProfile({
          name: data.username || '',
          email: data.email || ''
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
      const response = await fetch(`${API_BASE}/api/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: currentId, 
          name: profile.name, 
          email: profile.email 
        })
      });

      if (!response.ok) throw new Error('บันทึกไม่สำเร็จ');

      // ใน profilesettings.tsx
      if (response.ok) {
        
        // อัปเดตข้อมูลใน LocalStorage ให้เป็นชื่อใหม่ด้วย
        const session = localStorage.getItem('userSession');
        if (session) {
          const userData = JSON.parse(session);
          userData.username = profile.name; // อัปเดตชื่อใหม่เข้าไป
          localStorage.setItem('userSession', JSON.stringify(userData));
        }
        
        // โหลดข้อมูลใหม่จาก Server มาแสดงผลอีกครั้ง
        fetchUserData(currentId); 
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  // --- ส่วนรหัสผ่าน (ใช้ Fetch ไปยัง API เปลี่ยนรหัสผ่านที่สร้างใหม่) ---
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });

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
      const response = await fetch(`${API_BASE}/api/profile/change-password`, {
        method: 'POST',
        headers: { 'Content-Type' : 'application/json'},
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

  return (
    // ... ส่วน UI คงเดิมตามที่คุณเขียนมา ...
    <div className="flex flex-col min-h-screen bg-[#f8fcf8]">
      <C_HomeMain />
        {/* Header Bar สีเขียวเข้มตามรูปภาพ */}
        <div className="flex-grow w-full max-w-6xl mx-auto px-6 py-10">
          {/* ส่วนที่ 1: ข้อมูลส่วนตัว */}
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
              <div className="flex flex-col">
                <label className="mb-2 text-base font-medium text-gray-800">รหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  name="new"
                  value={password.new}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-400 rounded-xl h-12 px-4 focus:outline-none focus:ring-1 focus:ring-lime-50 bg-white shadow-sm"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-base font-medium text-gray-800">ยืนยันรหัสผ่านใหม่อีกครั้ง</label>
                <input 
                  type="password" 
                  name="confirm"
                  value={password.confirm}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-400 rounded-xl h-12 px-4 focus:outline-none focus:ring-1 focus:ring-lime-50 bg-white shadow-sm"
                />
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