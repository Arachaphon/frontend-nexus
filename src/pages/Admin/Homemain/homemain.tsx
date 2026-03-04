import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import C_HomeMain from '../../../components/C_homemain';
import Footer from '../../../components/Footerhomemain';
import { useAuth } from '../../../hooks/useAuth'

const GreenCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2"/>
    <path d="M8 12L11 15L16 9" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const API_BASE = window.__ENV__?.API_BASE || 'https://backend-nexus.67023031-devops.workers.dev';

const HomeMain = () => {
  const { isOwnerOrLandlord } = useAuth()
  const [activeTab, setActiveTab] = useState('dormitory');
  const [dormitories, setDormitories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- States สำหรับควบคุม Modal และข้อมูล ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editUserId, setEditUserId] = useState<string | null>(null);

  // เริ่มต้นด้วยอาเรย์ว่าง เพื่อรอรับข้อมูลจริงจาก API (รวมถึงข้อมูลเจ้าของหอ)
  const [users, setUsers] = useState<any[]>([]);

  // State สำหรับเก็บ ID หอพักที่ติ๊กเลือก
  const [selectedDormIds, setSelectedDormIds] = useState<string[]>([]);
  
  // State สำหรับฟอร์ม
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    role: '',
    email: '',
    password: '',
    is_active: true
  });

  const fetchDormitories = async () => { 
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/dormitories/main`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) setDormitories(result.data); 
      }
    } catch (error) {
      console.error("Error fetching dormitories:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/api/staff`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setUsers(result.data)
      } else if (response.status === 403) {
        console.warn('ไม่มีสิทธิ์เข้าหน้าจัดการผู้ใช้')
        setUsers([])
      } else {
        console.error('Backend error:', result.message)
      }
    } catch (error) {
      console.error('Network error:', error)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchDormitories(), fetchUsers()]);
      setLoading(false);
    };

    initData();
  }, [navigate]);

  const openModal = (mode: 'add' | 'edit', user?: any) => {
    setModalMode(mode);
    if (mode === 'edit' && user) {
      setEditUserId(user.id);
      setFormData({
        full_name: user.full_name || '', 
        phone: user.phone || '',        
        role: user.role,                
        email: user.email || '',
        password: '..........', 
        is_active: user.is_active ?? true
      });
      setSelectedDormIds(user.dorm_ids || []);
    } else {
      setEditUserId(null);
      setFormData({ full_name: '', phone: '', role: '', email: '', password: '', is_active: true });
      setSelectedDormIds([]);
    }
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };


  const handleSave = async () => {
    const token = localStorage.getItem('token');
    
    const payload: any = { 
      username: formData.full_name,
      phoneNumber: formData.phone,
      role: formData.role,
      email: formData.email,
      password: formData.password,
      dorm_ids: selectedDormIds 
    };

    try {

      const url = modalMode === 'add' 
        ? `${API_BASE}/api/staff`          
        : `${API_BASE}/api/staff/${editUserId}`;  

      const method = modalMode === 'add' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      if(result.success) {
          setIsModalOpen(false);
          fetchUsers(); // รีโหลดข้อมูลตาราง
          alert(modalMode === 'add' ? "เพิ่มเจ้าหน้าที่สำเร็จ" : "แก้ไขข้อมูลสำเร็จ");
      } else {
          alert("เกิดข้อผิดพลาด: " + (result.message || result.error));
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fcf8]">
      <C_HomeMain />

      <div className="flex-grow w-full p-6 relative flex flex-col max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 relative w-full">
          <div className="hidden md:block w-[120px]"></div>

          <div className="flex space-x-8 gap-4">
            <button
              onClick={() => setActiveTab('dormitory')}
              className={`flex items-center gap-4 pb-2 text-lg font-medium transition-colors border-b-2 ${
                activeTab === 'dormitory' ? 'text-[#0e4b3a] border-[#0e4b3a]' : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              จัดการหอพัก
            </button>
            {isOwnerOrLandlord && (
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-4 pb-2 text-lg font-medium transition-colors border-b-2 ${
                  activeTab === 'users' ? 'text-[#0e4b3a] border-[#0e4b3a]' : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                จัดการผู้ใช้งาน
              </button>
            )}
          </div>
          {isOwnerOrLandlord && (
            <div className="mt-4 md:mt-0 w-[120px] flex justify-end">
              {activeTab === 'dormitory' && (
                <Link to="/homemain/adddormitory">
                  <button className="bg-[#7d7671] hover:bg-[#68625d] text-white px-6 py-3 rounded-md shadow-sm text-sm font-medium transition-colors">เพิ่มหอพัก</button>
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="mt-2 flex-grow w-full"> 
          {activeTab === 'dormitory' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dormitories.map((dorm) => (
                <div key={dorm.id} className="w-full border border-gray-400 rounded-lg bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-gray-300 px-4 py-3">
                    <h3 className="text-xl text-gray-700 font-normal">{dorm.name}</h3>
                  </div>
                  <div className="p-6 flex flex-col items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full">
                        <div className="bg-[#0e4b3a] p-3 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h11V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex gap-2 flex-grow">
                            <div className="border border-gray-400 px-2 py-2 flex flex-col items-center flex-1">
                                <div className="text-gray-800">
                                    <span className="text-lg font-medium">{dorm.vacant_rooms}</span>
                                    <span className="text-sm">/{dorm.total_rooms}</span>
                                </div>
                                <span className="text-[10px] text-gray-500">ห้องว่าง</span>
                            </div>
                            <div className="border border-gray-400 px-2 py-2 flex flex-col items-center flex-1">
                                <div className="text-gray-800"><span className="text-lg font-medium">0</span></div>
                                <span className="text-[10px] text-gray-500">บิลค้างชำระ</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full text-right">
                      <Link to={`/manage/${dorm.id}`} className="text-gray-500 underline text-sm hover:text-gray-800">จัดการ</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 w-full mt-4">
              <div className="w-full lg:w-1/4 shrink-0">
                <h2 className="text-lg font-bold text-gray-800 mb-2">เจ้าหน้าที่</h2>
                <p className="text-sm text-gray-600 leading-relaxed">รายชื่อผู้ใช้งานระบบที่สามารถ<br className="hidden lg:block" />เข้าถึงข้อมูลของหอพัก</p>
              </div>

              <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-end mb-4">
                  <button onClick={() => openModal('add')} className="bg-[#7d7671] hover:bg-[#68625d] text-white px-6 py-2 rounded-md shadow-sm text-sm font-medium transition-colors">เพิ่ม</button>
                </div>

                <div className="w-full rounded-md overflow-hidden text-sm">
                  <div className="grid grid-cols-12 bg-[#e8e8e8] text-gray-700 py-3 px-4 font-medium items-center">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">ชื่อ / ตำแหน่ง</div>
                    <div className="col-span-3">เบอร์ / อีเมล</div>
                    <div className="col-span-2 text-center">เปิดใช้งาน</div>
                    <div className="col-span-1 text-center">หอพัก</div>
                    <div className="col-span-1 text-right"></div> 
                  </div>

                  {users.map((user, index) => (
                    <div key={user.id || index} className="grid grid-cols-12 border-b border-gray-200 py-4 px-4 items-center bg-white">
                      <div className="col-span-1 text-gray-800">{index + 1}</div>
                      <div className="col-span-4 flex flex-col gap-1">
                        <span className="text-gray-800 font-medium">{user.full_name}</span>
                        <span className="text-gray-500 text-xs">{user.role === 'owner' ? 'เจ้าของ' : 'ผู้จัดการ'}</span>
                      </div>
                      <div className="col-span-3 flex flex-col gap-1">
                        <span className="text-gray-800">{user.phone || '-'}</span>
                        <span className="text-gray-800 font-medium">{user.dorm_label || '-'}</span>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="col-span-1 flex justify-center items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-800 font-medium">{user.dorm_label || '-'}</span>
                      </div>
                      <div className="col-span-1 text-right">
                        <button onClick={() => openModal('edit', user)} className="text-gray-400 text-xs hover:text-gray-800 transition-colors">แก้ไข</button>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <div className="py-10 text-center text-gray-500 italic">ไม่พบข้อมูลเจ้าหน้าที่</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto relative">
            
            <div className="absolute w-0 h-0 opacity-0 overflow-hidden -z-10">
              <input type="text" tabIndex={-1} name="fake_username" /><input type="password" tabIndex={-1} name="fake_password" />
            </div>

            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">{modalMode === 'add' ? 'เพิ่มเจ้าหน้าที่' : 'แก้ไขเจ้าหน้าที่'}</h2>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อและนามสกุล<span className="text-red-500">*</span></label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} autoComplete="off" className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์ติดต่อ<span className="text-red-500">*</span></label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} autoComplete="off" className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">ตำแหน่ง <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select name="role" value={formData.role} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-600 appearance-none focus:outline-none focus:ring-1 focus:ring-stone-100">
                        <option value="" disabled>ตำแหน่ง</option><option value="owner">เจ้าของ</option><option value="manager">ผู้จัดการ</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน {modalMode === 'add' && <span className="text-red-500">*</span>}</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} autoComplete="new-password" className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="off" className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="accent-black w-4 h-4" />
                  <span className="text-sm">เปิดใช้งาน</span>
                </label>
                
                <div className="text-sm font-medium mt-4 mb-2">หอพักที่เข้าจัดการได้</div>
                <div className="flex flex-col gap-2 ml-1">
                  {dormitories.map((dorm) => (
                    <label key={dorm.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="accent-black w-4 h-4" checked={selectedDormIds.includes(dorm.id)} onChange={(e) => {
                          if (e.target.checked) setSelectedDormIds([...selectedDormIds, dorm.id]);
                          else setSelectedDormIds(selectedDormIds.filter(id => id !== dorm.id));
                        }} 
                      />
                      <span className="text-sm">{dorm.name}</span>
                    </label>
                  ))}
                  {dormitories.length === 0 && <span className="text-sm text-gray-500">กำลังโหลดข้อมูลหอพัก...</span>}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-center text-sm font-bold mb-4">ตารางสิทธิ์การใช้งาน</h3>
                <div className="overflow-x-auto border border-gray-300 rounded-lg text-[13px]">
                  <table className="w-full text-center border-collapse table-fixed">
                    <thead className="bg-white border-b border-gray-300 font-medium text-gray-700">
                      <tr>
                        <th className="w-[14.28%] py-2 px-2 border-r border-gray-300">ตำแหน่ง</th>
                        <th className="w-[14.28%] py-2 px-2 border-r border-gray-300">ภาพรวม</th>
                        <th className="w-[14.28%] py-2 px-2 border-r border-gray-300">ห้อง</th>
                        <th className="w-[14.28%] py-2 px-2 border-r border-gray-300">แจ้งซ่อม</th>
                        <th className="w-[14.28%] py-2 px-2 border-r border-gray-300">จดมิเตอร์</th>
                        <th className="w-[14.28%] py-2 px-2 border-r border-gray-300">ออกบิล</th>
                        <th className="w-[14.28%] py-2 px-2">ตั้งค่า</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 border-r border-gray-300 bg-gray-50 text-gray-800">เจ้าของ</td>
                        {[...Array(6)].map((_, i) => (<td key={i} className="py-3 border-r border-gray-300 last:border-r-0"><div className="flex justify-center"><GreenCheckIcon /></div></td>))}
                      </tr>
                      <tr>
                        <td className="py-3 border-r border-gray-300 bg-gray-50 text-gray-800">ผู้จัดการ</td>
                        {[...Array(5)].map((_, i) => (<td key={i} className="py-3 border-r border-gray-300"><div className="flex justify-center"><GreenCheckIcon /></div></td>))}
                        <td className="py-3 border-r border-gray-300"></td><td className="py-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setIsModalOpen(false)} className="px-8 py-2 border border-gray-400 rounded-md text-sm hover:bg-gray-50">ปิด</button>
              <button onClick={handleSave} className="px-8 py-2 bg-[#7d7671] text-white rounded-md text-sm hover:bg-[#68625d]">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full mt-auto"><Footer /></div>
    </div>
  );
}

export default HomeMain;