import { use, useEffect, useState } from 'react';
import React from 'react';
import { resolvePath, useNavigate } from 'react-router-dom';
import C_HomeMain from '../../../components/C_homemain'; 
import Footer from '../../../components/Footerhomemain'; 

declare global {
  interface Window {
    __ENV__: {
      API_BASE: string;
    };
  }
}

// กำหนด Type ของข้อมูลบัญชี
interface BankAccount {
  id: number;
  bankName: string;
  bankLogo: string;
  accountNumber: string;
  accountName: string;
}

// ข้อมูลตัวเลือกธนาคาร
const BANK_OPTIONS = [
  { value: 'กสิกรไทย', label: 'กสิกรไทย', logo: '/kbank.png', color: 'bg-green-500' },
  { value: 'ธนาคารออมสิน', label: 'ธนาคารออมสิน', logo: '/gsb.png', color: 'bg-pink-500' },
  { value: 'ธนาคารกรุงไทย', label: 'ธนาคารกรุงไทย', logo: '/ktb.png', color: 'bg-blue-400' },
  { value: 'ธนาคารไทยพาณิชย์', label: 'ธนาคารไทยพาณิชย์', logo: '/scb.png', color: 'bg-purple-600' },
  { value: 'ธนาคารกรุงเทพ', label: 'ธนาคารกรุงเทพ', logo: '/bbl.png', color: 'bg-blue-800' },
  { value: 'พร้อมเพย์', label: 'พร้อมเพย์', logo: '/promptpay.png', color: 'bg-blue-600' },
];

const BankAccountConfig = () => {
  const navigate = useNavigate();
  const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';
  // --- States ---
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [paymentNote, setPaymentNote] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  // Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const steps = [
    { id: 1, label: 'การคิดค่าน้ำ / ค่าไฟ' },
    { id: 2, label: 'บัญชีธนาคาร' },
    { id: 3, label: 'จัดการชั้น' },
    { id: 4, label: 'ผังห้อง' }, 
    { id: 5, label: 'ค่าห้อง' },
    { id: 6, label: 'สถานะห้อง' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const dormitoryId = localStorage.getItem('dormitoryId');
      if (!dormitoryId) {
        alert('ไม่พบข้อมูลหอพัก กรุณากลับไปเริ่มสร้างใหม่');
        return;
      }
      const bankRes = await fetch(`${API_BASE}/api/banks/list/${dormitoryId}`,{
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bankData = await bankRes.json();
      if (Array.isArray(bankData)) setBankAccounts(bankData);

      const dormRes = await fetch(`${API_BASE}/api/dormitories/info/${dormitoryId}`,{
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dormData = await dormRes.json();
      if (dormData.payment_note) setPaymentNote(dormData.payment_note);
    } catch (err) {
      console.error('Fetch Error:',err);
    }
  };

  // เปิด Modal
  const handleOpenModal = () => {
    if (bankAccounts.length >= 3) {
      alert('สามารถเพิ่มบัญชีธนาคารได้สูงสุด 3 บัญชีเท่านั้น');
      return;
    }
    setShowModal(true);
  };

  // ปิด Modal และ Reset ค่า
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBank('');
    setAccountNumber('');
    setAccountName('');
    setIsDropdownOpen(false);
  };

  // บันทึกบัญชี
  const handleSaveAccount = async () => {
    if (!selectedBank || !accountNumber.trim() || !accountName.trim()) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    const token = localStorage.getItem('token');
    const dormitoryId = localStorage.getItem('dormitoryId');
    const bankInfo = BANK_OPTIONS.find(b => b.value === selectedBank);
    
    try {
      const response = await fetch(`${API_BASE}/api/banks/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dormitoryId: dormitoryId,
          bank_name: selectedBank,
          bank_logo: bankInfo?.logo || '',
          account_number: accountNumber,
          account_name: accountName
        })
      });

      const data = await response.json();
        if (data.success) {

          setBankAccounts([...bankAccounts, {
            id: data.bank_id,
            bankName: selectedBank,
            bankLogo: bankInfo?.logo || '',
            accountNumber: accountNumber,
            accountName: accountName
          }]);
          handleCloseModal();
        }
      } catch (err) {
        alert("ไม่สามารถบันทึกบัญชีได้");
    }
  };

  const handleNextStep = async () => {
    if (bankAccounts.length === 0) {
      alert("กรุณาเพิ่มบัญชีธนาคารอย่างน้อย 1 รายการ");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const dormitoryId = localStorage.getItem('dormitoryId');

      const response = await fetch(`${API_BASE}/api/dormitories/update-payment-note`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          dormitoryId: dormitoryId,
          payment_note: paymentNote
        })
      });

      if (response.ok) {
        navigate('/homemain/floorsetup');
      }
    } catch (err) {
      alert("บันทึกหมายเหตุไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // ลบบัญชี
  const handleDeleteAccount = async (id: string | number) => {
    if (!window.confirm("คุณต้องการลบบัญชีนี้ใช่หรือไม่?")) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/banks/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setBankAccounts(bankAccounts.filter(acc => acc.id !== id));
      }
    } catch (err) {
      alert("ลบไม่สำเร็จ");
    }
  };

  // เลือกธนาคารจาก Custom Dropdown
  const handleSelectBankOption = (value: string) => {
    setSelectedBank(value);
    setIsDropdownOpen(false);
  };

  // ข้อมูลธนาคารที่เลือกอยู่ปัจจุบัน
  const currentSelectedBankInfo = BANK_OPTIONS.find(b => b.value === selectedBank);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fcf8] relative font-sans">
      <C_HomeMain />

      <div className="flex-grow w-full max-w-6xl mx-auto px-4 py-10 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-[#0e4b3a] mb-10 text-center">ตั้งค่าหอพัก</h1>

        {/* --- Progress Bar --- */}
        <div className="w-full max-w-5xl mb-12">
          <div className="flex items-start justify-between w-full">
            {steps.map((step, index) => {
              const isCompleted = step.id < 2;
              const isActive = step.id === 2;
              
              let circleClass = "bg-[#e5e7eb] border-gray-200 text-gray-500 ring-4 ring-gray-200";
              let textClass = "text-gray-400";

              if (isCompleted) {
                circleClass = "bg-[#0e4b3a] border-[#0e4b3a] text-white ring-4 ring-[#dcfce7]";
                textClass = "text-[#0e4b3a]";
              } else if (isActive) {
                circleClass = "bg-[#fce96a] border-[#fdf6b2] text-[#5e4e00] ring-4 ring-[#fdf6b2]";
                textClass = "text-gray-800";
              }

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-[3px] transition-all duration-300 mb-3 ${circleClass}`}>
                      {isCompleted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : step.id}
                    </div>
                    <span className={`text-sm text-center font-medium mt-2 whitespace-nowrap ${textClass}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-[2px] mt-6 mx-2 ${isCompleted ? 'bg-[#0e4b3a]' : 'bg-gray-300'}`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* --- Main Content Card (Bank Accounts) --- */}
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-md p-0 flex flex-col md:flex-row items-stretch border border-gray-100 min-h-[400px] overflow-hidden">
          
          {/* Left Column: Instructions */}
          <div className="w-full md:w-[30%] bg-white p-8 border-r border-gray-100 flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-6">บัญชีธนาคาร</h3>
            <ul className="space-y-4 text-gray-600 text-sm list-disc pl-5 font-medium leading-relaxed mb-8">
              <li>
                <span className="text-gray-800 font-semibold">รายการบัญชีธนาคาร :</span><br/>
                รายชื่อธนาคารที่ใช้รับเงิน ซึ่งจะแสดงในใบแจ้งหนี้
              </li>
              <li>
                <span className="text-gray-800 font-semibold">คำแนะนำ</span> ควรระบุ ไม่เกิน 3 รายชื่อธนาคาร
              </li>
            </ul>
            
            <button 
              onClick={handleOpenModal}
              className="bg-[#7d7a75] hover:bg-[#6b6863] text-white text-sm font-medium py-3 px-4 rounded-lg shadow-sm transition-all mt-auto w-full"
            >
              เพิ่มบัญชีธนาคาร
            </button>
          </div>

          {/* Right Column: List */}
          <div className="w-full md:w-[70%] bg-gray-50/30 p-8 relative">
             {/* Header Row */}
             <div className="flex bg-gray-200 rounded-t-lg text-gray-700 text-sm font-bold py-3 px-4">
                <div className="w-1/3">ธนาคาร</div>
                <div className="w-1/3">ชื่อบัญชี</div>
                <div className="w-1/3 text-right pr-8">เลขบัญชี</div>
             </div>

             {/* Data Rows */}
             <div className="bg-white rounded-b-lg border border-gray-200 min-h-[250px]">
                {bankAccounts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                    <p>ยังไม่มีบัญชีธนาคาร</p>
                  </div>
                ) : (
                  <ul>
                    {bankAccounts.map((acc) => (
                      <li key={acc.id} className={`flex items-center py-4 px-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors relative group`}>
                          <div className="w-1/3 flex items-center gap-3">
                            {/* Logo */}
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 bg-white flex items-center justify-center shadow-sm">
                              {acc.bankLogo ? (
                                <img 
                                  src={acc.bankLogo} 
                                  alt={acc.bankName} 
                                  className="w-full h-full object-contain p-0.5 rounded-full" 
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200"></div>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-800">{acc.bankName}</span>
                          </div>
                          <div className="w-1/3 text-sm text-gray-600 truncate pr-2">
                            {acc.accountName}
                          </div>
                          <div className="w-1/3 text-sm text-gray-600 text-right pr-8 font-mono">
                            {acc.accountNumber}
                          </div>
                          
                          <button 
                           onClick={() => handleDeleteAccount(acc.id)}
                           className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                      </li>
                    ))}
                  </ul>
                )}
             </div>
          </div>
        </div>

        {/* --- (NEW) Payment Notification Section ส่วนที่เพิ่มเข้ามา --- */}
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-md p-8 border border-gray-100 mt-6">
            <h3 className="text-sm font-bold text-gray-800 mb-2">ขั้นตอนการแจ้งการชำระเงิน</h3>
            <ul className="list-disc pl-5 text-sm text-gray-600 font-medium mb-4">
                <li>รายละเอียดการชำระเงินจะแสดงในใบแจ้งหนี้</li>
            </ul>

            <label className="block text-sm font-bold text-gray-700 mb-2">
                ข้อความ<span className="text-red-500">*</span>
            </label>
            <textarea
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0e4b3a] min-h-[60px]"
            />
            
            <div className="mt-3 text-xs text-gray-500 font-medium leading-relaxed">
                <p>ตัวอย่าง: "ชำระเงินแล้ว ผ่านทางการโอนเงินธนาคาร"</p>
                <p className="pl-[42px]">"ชำระเงินแล้ว หมายเลขการชำระเงินคือ 123456789"</p>
                <p className="pl-[42px]">หรือเมื่อชำระเงินแล้ว กรุณาส่งหลักฐานการชำระเงินมาที่ Line: @ไม่บอก หรือโทรแจ้ง 0962969696</p>
            </div>
        </div>

        {/* --- Next Button --- */}
        <div className="w-full max-w-5xl flex justify-between mt-8">
          <a href="/homemain/utilitycalculation">
            <button className="px-6 py-2.5 text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors flex items-center gap-2">
              กลับ
            </button>
          </a>
          <button 
            onClick={handleNextStep}
            disabled={bankAccounts.length === 0 || loading}
            className={`px-10 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all ${bankAccounts.length > 0 
              ? 'bg-[#7d7a75] hover:bg-[#6b6863] text-white' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            {loading ? 'กำลังบันทึก...' : 'ถัดไป'}
          </button>
        </div>
      </div>

      <Footer />

      {/* ================= ADD BANK MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white w-[700px] rounded-lg shadow-2xl overflow-hidden border border-[#e8e8d0]">
            <div className="p-10 relative">
               <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>

               <div className="space-y-6">
                  {/* === Custom Dropdown Bank Select === */}
                  <div className="flex items-center">
                    <label className="w-32 text-sm font-bold text-gray-700">ธนาคาร<span className="text-red-500">*</span></label>
                    <div className="flex-1 relative">
                      <button 
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full border ${isDropdownOpen ? 'border-white ring-1 ring-lime-500' : 'border-gray-300'} rounded-md px-3 py-2 text-left bg-white focus:outline-none flex items-center justify-between transition-all`}
                      >
                        {selectedBank ? (
                          <div className="flex items-center gap-2">
                             {currentSelectedBankInfo?.logo && (
                               <img src={currentSelectedBankInfo.logo} alt="" className="w-5 h-5 object-contain" />
                             )}
                             <span className="text-gray-700">{selectedBank}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">เลือกธนาคาร</span>
                        )}
                        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                          {BANK_OPTIONS.map((bank) => (
                            <div 
                              key={bank.value}
                              onClick={() => handleSelectBankOption(bank.value)}
                              className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                            >
                              <div className="w-6 h-6 flex items-center justify-center">
                                <img src={bank.logo} alt={bank.label} className="w-full h-full object-contain" />
                              </div>
                              <span className="text-gray-700 text-sm">{bank.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Input เลขบัญชี */}
                  <div className="flex items-center">
                    <label className="w-32 text-sm font-bold text-gray-700">เลขบัญชี<span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-lime-50"
                      placeholder="เช่น 1010101010"
                    />
                  </div>

                  {/* Input ชื่อบัญชี */}
                  <div className="flex items-center">
                    <label className="w-32 text-sm font-bold text-gray-700">ชื่อบัญชี<span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-lime-50"
                      placeholder="ชื่อบัญชี (ภาษาไทย หรือ อังกฤษ)"
                    />
                  </div>
               </div>
            </div>

            <div className="flex justify-end px-10 pb-8 pt-2">
               <button onClick={handleSaveAccount} className="bg-[#7d7a75] hover:bg-[#6b6863] text-white font-medium px-8 py-2 rounded-lg text-sm transition-colors">
                 ตกลง
               </button>
            </div>
          </div>
        </div>
      )}
    </div> 
  );
};

export default BankAccountConfig;