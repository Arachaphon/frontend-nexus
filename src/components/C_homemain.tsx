import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function DormitoryLayout() {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [username, setUsername] = useState('Loading...');

    useEffect(() => {
        // 1. ดึงข้อมูลจาก localStorage ภายใน useEffect โดยตรง
        const session = localStorage.getItem('userSession');
        
        if (!session) {
            // ถ้าไม่มี Session ให้ดีดไปหน้า Login ทันที
            navigate('/login');
            return;
        }

        try {
            const user = JSON.parse(session);
            const foundUsername = user.username || 'User';

            // 2. วิธีแก้ไฟแดง: ตรวจสอบค่าก่อน Update
            // ใช้การเช็คค่าปัจจุบัน (Loading...) เพื่ออัปเดตเพียงครั้งเดียวเมื่อโหลดเสร็จ
            if (username !== foundUsername) {
                setUsername(foundUsername);
            }
        } catch (error) {
            console.error("Session parse error", error);
            navigate('/login');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]); // ใส่เพียง navigate เพื่อให้ทำงานแค่ตอน Mount ครั้งแรก

    const handleLogout = () => {
        if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
            localStorage.removeItem('userSession');
            localStorage.removeItem('rememberPassword');
            navigate('/');
        }
    };

    return (
        <div className="flex flex-col font-sans text-gray-800">
            {/* --- Navbar Section --- */}
            <header className="bg-white px-6 py-3 flex justify-between items-center shadow-sm relative z-20">
                <div className="flex items-start justify-center md:justify-start mb-2">
                    <img src="/logo.png" alt="The Nexus Logo" className="w-48 h-auto object-contain" />
                </div>

                <div className="relative">
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 text-gray-700 hover:text-black focus:outline-none border-b-2 border-transparent hover:border-gray-300 pb-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {/* แสดงชื่อ Username ที่ดึงมาจาก D1 ผ่าน Backend */}
                        <span className="font-medium text-lg uppercase border-b-2 border-[#0e4b3a]">{username}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden z-30">
                            <Link to="/homemain/profilesettings" onClick={() => setIsDropdownOpen(false)}>
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 border-b border-gray-200 text-left">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    โปรไฟล์
                                </button>
                            </Link>
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 text-left">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                ออกจากระบบ
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="bg-emerald-900 text-white py-2 px-6 shadow-md z-10">
                <div className="container mx-auto">
                    <h1 className="text-xl font-medium tracking-wide">Dormitory</h1>
                </div>
            </div>
        </div>
    );
}