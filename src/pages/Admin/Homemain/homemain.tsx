import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import C_HomeMain from '../../../components/C_homemain';
import Footer from '../../../components/Footerhomemain';

const HomeMain = () => {
  const [activeTab, setActiveTab] = useState<'dormitory' | 'users'>('dormitory');
    const navigate = useNavigate();

  useEffect(() => {
  const session = localStorage.getItem('userSession');
  if (!session) {
      navigate('/login');
    }
  }, [navigate]);

  return (

    <div className="flex flex-col min-h-screen">
      <C_HomeMain />

      <div className="flex-grow w-full p-6 relative bg-[#f8fcf8] flex flex-col">

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 relative">

          <div className="hidden md:block w-[120px]"></div>

            <div className="flex space-x-8 gap-4">
                <button
                onClick={() => setActiveTab('dormitory')}
                className={`flex items-center gap-4 pb-2 text-lg font-medium transition-colors border-b-2 ${
                    activeTab === 'dormitory'
                    ? 'text-[#0e4b3a] border-[#0e4b3a]' 
                    : 'text-gray-500 border-gray-300 hover:text-gray-700'
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
                    : 'text-gray-500 border-gray-300 hover:text-gray-700'
                }`}
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                จัดการผู้ใช้งาน
                </button>
            </div>

          <div className="mt-4 md:mt-0 w-[120px] flex justify-end">
            <Link to="/homemain/adddormitory">
                <button className="bg-[#7d7671] hover:bg-[#68625d] text-white px-6 py-4 rounded-md shadow-sm text-sm font-medium transition-colors">
                เพิ่มหอพัก 
                </button>
            </Link>
          </div>

        </div>

        <div className="mt-6 flex-grow"> 

          {activeTab === 'dormitory' ? (
            <div className="text-center text-gray-400 mt-20">
              {/* <p>Dormitory List Content goes here</p> */}
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-20">
              {/* <p>User List Content goes here</p> */}
            </div>
          )}
        </div>

      </div>

      <div className="w-full">
        <Footer />
      </div>

    </div> 
  );
}

export default HomeMain;