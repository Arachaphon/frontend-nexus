import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import C_HomeMain from '../../../components/C_homemain';
import Footer from '../../../components/Footerhomemain';

const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

const HomeMain = () => {
  const [activeTab, setActiveTab] = useState('dormitory');
  const [dormitories, setDormitories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (!session) {
      navigate('/login');
      return;
    }

    const fetchDormitories = async () => { 
      try {
        const session = localStorage.getItem('userSession');
        if (!session) return;
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/dormitories/list`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.error("Token ไม่ถูกต้องหรือหมดอายุ");
            navigate('/login');
          }
          return; 
        }

        const result = await response.json();
        if (result.success) {
          setDormitories(result.data); 
        }
      } catch (error) {
        console.error("Error fetching dormitories:", error);
      } finally {
        setLoading(false);
      }
    };

  fetchDormitories();
}, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fcf8]">
      <C_HomeMain />

      <div className="flex-grow w-full p-6 relative flex flex-col max-w-7xl mx-auto">
        
        {/* Header Section: Tabs and Add Button */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 relative w-full">
          <div className="hidden md:block w-[120px]"></div>

          <div className="flex space-x-8 gap-4">
            <button
              onClick={() => setActiveTab('dormitory')}
              className={`flex items-center gap-4 pb-2 text-lg font-medium transition-colors border-b-2 ${
                activeTab === 'dormitory'
                  ? 'text-[#0e4b3a] border-[#0e4b3a]'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              จัดการหอพัก
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-4 pb-2 text-lg font-medium transition-colors border-b-2 ${
                activeTab === 'users'
                  ? 'text-[#0e4b3a] border-[#0e4b3a]'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              จัดการผู้ใช้งาน
            </button>
          </div>

          <div className="mt-4 md:mt-0 w-[120px] flex justify-end">
            {/* ซ่อนปุ่มเพิ่มหอพักถ้าอยู่แท็บผู้ใช้งาน เพื่อให้สอดคล้องกับ UI */}
            {activeTab === 'dormitory' && (
              <Link to="/homemain/adddormitory">
                <button className="bg-[#7d7671] hover:bg-[#68625d] text-white px-6 py-3 rounded-md shadow-sm text-sm font-medium transition-colors">
                  เพิ่มหอพัก
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-2 flex-grow w-full"> 
          {activeTab === 'dormitory' ? (
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dormitories.map((dorm) => (
                <div key={dorm.id} className="w-full border border-gray-400 rounded-lg bg-white shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="border-b border-gray-300 px-4 py-3">
                    <h3 className="text-xl text-gray-700 font-normal">{dorm.name}</h3>
                  </div>
                  
                  {/* Body */}
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
                                <div className="text-gray-800">
                                    <span className="text-lg font-medium">0</span>
                                </div>
                                <span className="text-[10px] text-gray-500">บิลค้างชำระ</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full text-right">
                      <Link to={`/manage/${dorm.id}`} className="text-gray-500 underline text-sm hover:text-gray-800">
                        จัดการ
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          ) : (

            /* ---------------- ส่วนที่เพิ่มเข้ามาใหม่: แท็บจัดการผู้ใช้งาน ---------------- */
            <div className="flex flex-col lg:flex-row gap-8 w-full mt-4">
              
              {/* ฝั่งซ้าย: คำอธิบาย */}
              <div className="w-full lg:w-1/4 shrink-0">
                <h2 className="text-lg font-bold text-gray-800 mb-2">เจ้าหน้าที่</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  รายชื่อผู้ใช้งานระบบที่สามารถ<br className="hidden lg:block" />เข้าถึงข้อมูลของหอพัก
                </p>
              </div>

              {/* ฝั่งขวา: การ์ดตาราง */}
              <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                
                {/* ปุ่มเพิ่มผู้ใช้งาน */}
                <div className="flex justify-end mb-4">
                  <button className="bg-[#7d7671] hover:bg-[#68625d] text-white px-6 py-2 rounded-md shadow-sm text-sm font-medium transition-colors">
                    เพิ่ม
                  </button>
                </div>

                {/* ตารางข้อมูล */}
                <div className="w-full rounded-md overflow-hidden text-sm">
                  
                  {/* หัวตาราง */}
                  <div className="grid grid-cols-12 bg-[#e8e8e8] text-gray-700 py-3 px-4 font-medium items-center">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">ชื่อ / ตำแหน่ง</div>
                    <div className="col-span-4">เบอร์ / อีเมล</div>
                    <div className="col-span-2 text-center">เปิดใช้งาน</div>
                    <div className="col-span-1 text-center">หอพัก</div>
                  </div>

                  {/* แถวข้อมูล (นำไป .map() ได้เลย) */}
                  <div className="grid grid-cols-12 border-b border-gray-200 py-4 px-4 items-center bg-white">
                    <div className="col-span-1 text-gray-800">1</div>
                    
                    <div className="col-span-4 flex flex-col gap-1">
                      <span className="text-gray-800">Aos Sjdj</span>
                      <span className="text-gray-500 text-xs">เจ้าของ</span>
                    </div>
                    
                    <div className="col-span-4 flex flex-col gap-1">
                      <span className="text-gray-800">0963505765</span>
                      <span className="text-gray-500 text-xs">aofzakryp@gmail.com</span>
                    </div>
                    
                    {/* ไอคอนติ๊กถูกเปิดใช้งาน */}
                    <div className="col-span-2 flex justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    
                    {/* หอพัก + ปุ่มแก้ไข */}
                    <div className="col-span-1 flex justify-between items-center w-full pr-2">
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-800">A</span>
                      </div>
                      <button className="text-gray-600 text-xs hover:text-gray-900 transition-colors">
                        แก้ไข
                      </button>
                    </div>
                  </div>
                  {/* จบแถวข้อมูล */}

                </div>
              </div>

            </div>
            /* ------------------------------------------------------------------------- */
            
          )}
        </div>
      </div>

      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
}

export default HomeMain;