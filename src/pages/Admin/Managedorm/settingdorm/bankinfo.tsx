import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import C_HomeMain from '../../../../components/C_homemain'; 
import Footer from '../../../../components/Footerhomemain'; 
import Sidebar from '../../../../components/Sidebar';

declare global {
  interface Window {
    __ENV__: {
      API_BASE: string;
    };
  }
}

// --- กำหนด Type ของข้อมูลบัญชี ---
interface BankAccount {
  id: number;
  bankName: string;
  bankLogo: string;
  accountNumber: string;
  accountName: string;
}

// --- ข้อมูลตัวเลือกธนาคาร ---
const BANK_OPTIONS = [
  { value: 'กสิกรไทย', label: 'กสิกรไทย', logo: '/kbank.png', color: 'bg-green-500' },
  { value: 'ธนาคารออมสิน', label: 'ธนาคารออมสิน', logo: '/gsb.png', color: 'bg-pink-500' },
  { value: 'ธนาคารกรุงไทย', label: 'ธนาคารกรุงไทย', logo: '/ktb.png', color: 'bg-blue-400' },
  { value: 'ธนาคารไทยพาณิชย์', label: 'ธนาคารไทยพาณิชย์', logo: '/scb.png', color: 'bg-purple-600' },
  { value: 'ธนาคารกรุงเทพ', label: 'ธนาคารกรุงเทพ', logo: '/bbl.png', color: 'bg-blue-800' },
  { value: 'พร้อมเพย์', label: 'พร้อมเพย์', logo: '/promptpay.png', color: 'bg-blue-600' },
];

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

const Toast = ({ status, message }: { status: SaveStatus; message: string }) => {
  if (status === 'idle') return null;

  const styles: Record<string, string> = {
    saving: 'bg-blue-50 border-blue-200 text-blue-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    error: 'bg-red-50 border-red-200 text-red-700',
  };

  const icons: Record<string, React.ReactNode> = {
    saving: (
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    ),
    success: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium transition-all ${styles[status]}`}>
      {icons[status]}
      {message}
    </div>
  );
};

export default function BankInfo() {
  const { dormitoryId } = useParams();
  const navigate = useNavigate();

  // --- States ทั่วไป ---
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [dormitoryName, setDormitoryName] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [toastMsg, setToastMsg] = useState('');

  // --- States ส่วนบัญชีธนาคาร และ Payment Note ---
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [paymentNote, setPaymentNote] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

  // --- ดึงข้อมูลหอพัก (เฉพาะชื่อและ Payment Note) และบัญชีธนาคาร ---
  const fetchDormitoryData = useCallback(async () => {
    const activeDormId = dormitoryId || localStorage.getItem('dormitoryId');
    if (!activeDormId) {
      setInitialLoad(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // ดึงข้อมูลหอพักเพื่อนำชื่อและ Payment Note มาแสดง
      const response = await fetch(`${API_BASE}/api/dormitories/main/${activeDormId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const dorm = data.data || data;
        
        setDormitoryName(dorm.name || '');
        if (dorm.payment_note) setPaymentNote(dorm.payment_note); 
      }

      // ดึงข้อมูลบัญชีธนาคาร
      const bankRes = await fetch(`${API_BASE}/api/dormitories/banks/${activeDormId}`,{
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bankData = await bankRes.json();
      if (bankData.success) {
        setBankAccounts(bankData.data);
      }

    } catch (err) {
      console.error("Failed to fetch dormitory data", err);
    } finally {
      setInitialLoad(false);
    }
  }, [dormitoryId, API_BASE]);

  useEffect(() => {
    fetchDormitoryData();
  }, [fetchDormitoryData]);

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (saveStatus === 'success' || saveStatus === 'error') {
      const t = setTimeout(() => setSaveStatus('idle'), 3000);
      return () => clearTimeout(t);
    }
  }, [saveStatus]);

  // --- ระบบจัดการบัญชีธนาคาร ---
  const handleOpenModal = () => {
    if (bankAccounts.length >= 3) {
      setSaveStatus('error');
      setToastMsg('สามารถเพิ่มบัญชีธนาคารได้สูงสุด 3 บัญชีเท่านั้น');
      return;
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBank('');
    setAccountNumber('');
    setAccountName('');
    setIsDropdownOpen(false);
  };

  const handleSelectBankOption = (value: string) => {
    setSelectedBank(value);
    setIsDropdownOpen(false);
  };

  const currentSelectedBankInfo = BANK_OPTIONS.find(b => b.value === selectedBank);

  const handleSaveAccount = async () => {
    if (!selectedBank || !accountNumber.trim() || !accountName.trim()) {
      setSaveStatus('error');
      setToastMsg('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    const token = localStorage.getItem('token');
    const activeDormId = dormitoryId || localStorage.getItem('dormitoryId');
    const bankInfo = BANK_OPTIONS.find(b => b.value === selectedBank);
    
    try {
      const response = await fetch(`${API_BASE}/api/dormitories/banks/${activeDormId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dormitoryId: activeDormId,
          bank_name: selectedBank,
          bank_logo: bankInfo?.logo || '',
          account_number: accountNumber,
          account_name: accountName
        })
      });

      if (response.status === 403) {
        window.location.href = '/homemain'
        return
      }
      if (!response.ok) throw new Error("API failed");

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
      setSaveStatus('error');
      setToastMsg('ไม่สามารถบันทึกบัญชีได้');
    }
  };

  const handleDeleteAccount = async (id: string | number) => {
    if (!window.confirm("คุณต้องการลบบัญชีนี้ใช่หรือไม่?")) return;

    try {
      const token = localStorage.getItem('token');
      const activeDormId = dormitoryId || localStorage.getItem('dormitoryId');
      const res = await fetch(`${API_BASE}/api/dormitories/banks/${activeDormId}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setBankAccounts(bankAccounts.filter(acc => acc.id !== id));
      }
    } catch (err) {
      setSaveStatus('error');
      setToastMsg('ลบไม่สำเร็จ');
    }
  };

  // --- บันทึกเฉพาะ Payment Note ---
  const handleNextStep = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const activeDormId = dormitoryId || localStorage.getItem('dormitoryId');
      
      if (!activeDormId) {
        setSaveStatus('error');
        setToastMsg('ไม่พบข้อมูลหอพัก กรุณาสร้างข้อมูลหอพักก่อน');
        return;
      }

      setSaveStatus('saving');
      setToastMsg('กำลังบันทึก...');

      // บันทึก Payment Note (PATCH)
      const response = await fetch(`${API_BASE}/api/dormitories/banks/payment-note/${activeDormId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          dormitoryId: activeDormId,
          payment_note: paymentNote
        })
      });

      const result = await response.json();

      if (response.status === 403) {
        navigate('/homemain');
        return;
      }
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'ไม่สามารถบันทึกข้อมูลได้');
      }
      
      setSaveStatus('success');
      setToastMsg('บันทึกข้อมูลสำเร็จ');
      
      // เพิ่ม navigate เพื่อเปลี่ยนหน้าหลังจากบันทึกสำเร็จ
      // navigate('/homemain/utilitycalculation'); 

    } catch (err: unknown) {
      setSaveStatus('error');
      setToastMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่รู้จัก');
    } finally {
      setLoading(false);
    }
  };

  // --- หน้าจอ Loading ตอนโหลดครั้งแรก ---
  if (initialLoad) {
    return (
      <div className="flex h-screen bg-[#f8fcf8] overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e4b3a]"></div>
        </div>
      </div>
    );
  }

  return (
    // เปลี่ยนตัวคลุมนอกสุดให้มีความสูงพอดีจอ (h-screen) และซ่อนส่วนที่เกิน (overflow-hidden)
    <div className="flex h-screen bg-[#f8fcf8] font-sans overflow-hidden"> 
      <Sidebar />
      
      {/* ล็อคคอลัมน์ขวาให้สูงเท่าจอ และซ่อน scroll ของทั้งหน้า */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        
        {/* Header จะโดนล็อคอยู่กับที่ด้านบน */}
        <div className="flex-none">
          <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />
        </div>

        {/* --- เพิ่ม overflow-y-auto ตรงนี้ เพื่อให้เนื้อหาไถเลื่อน (Scroll) ได้แค่ส่วนกลาง --- */}
        <div className="flex-grow w-full flex flex-col items-center px-6 py-10 overflow-y-auto">
          
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

          {/* --- Payment Notification Section --- */}
          <div className="w-full max-w-5xl bg-white rounded-xl shadow-md p-8 border border-gray-100 mt-6 flex-shrink-0">
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
          <div className="w-full max-w-5xl flex justify-end mt-8 mb-4 flex-shrink-0">
            <button
              type="button" 
              onClick={handleNextStep}
              disabled={bankAccounts.length === 0 || loading}
              className={`px-10 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all ${bankAccounts.length > 0 
                ? 'bg-[#7d7a75] hover:bg-[#6b6863] text-white' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>

        </div> 
        
        {/* Footer จะโดนล็อคอยู่กับที่ด้านล่าง */}
        <div className="flex-none w-full border-t border-gray-200">
          <Footer />
        </div>

      </div>

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

      <Toast status={saveStatus} message={toastMsg} />
    </div> 
  );
}