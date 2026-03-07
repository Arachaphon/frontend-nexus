import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, PlayCircle } from 'lucide-react'; // เพิ่มการ import icon
import C_HomeMain from '../../../components/C_homemain';
import Footer from '../../../components/Footerhomemain';

const HomeFinish = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (!session) {
      navigate('/login');
    }
  }, [navigate]);
  
  const handleStartUsage = () => {
    console.log("กำลังเข้าสู่ระบบจัดการหอพัก...");
    navigate('/homemain'); 
  };
  return (
    <div className="flex flex-col min-h-screen">
      <C_HomeMain />

      <div className="flex-grow w-full p-6 relative bg-[#f8fcf8] flex flex-col">
        
        {/* --- Header Menu Section --- */}



        {/* --- Main Content Section --- */}
        <div className="mt-6 flex-grow flex items-center justify-center">

            <div className="bg-white w-full max-w-3xl h-[300px] rounded-lg shadow-md border border-gray-100 flex flex-col items-center justify-center animate-fade-in">
              
              {/* วงกลมสีเขียว + เครื่องหมายถูก */}
              <div className="mb-8 relative">
                <div className="w-20 h-20 rounded-full border-[6px] border-[#5eead4] flex items-center justify-center">
                  <Check className="w-10 h-10 text-[#5eead4]" strokeWidth={4} />
                </div>
              </div>

              {/* ปุ่มเริ่มต้นใช้งาน */}
              <button
                className="bg-[#78716c] hover:bg-[#5f5955] text-white px-6 py-3 rounded-lg shadow-sm transition-colors font-medium flex items-center gap-2"
                onClick={handleStartUsage}
              >
                <PlayCircle size={20} className="fill-white text-[#78716c]" />
                เริ่มต้นใช้งาน
              </button>
            </div>

        </div>
      </div>

      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
};

export default HomeFinish;