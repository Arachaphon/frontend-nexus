import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import C_HomeMain from '../../../../components/C_homemain';
import Footer from '../../../../components/Footerhomemain';
import Sidebar from '../../../../components/Sidebar';

// กำหนด API_BASE ให้ถูกต้อง
declare global {
  interface Window {
    __ENV__: {
      API_BASE: string;
    };
  }
}
const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

// --- Types ---
type TabStatus = 'pending' | 'completed';
type ModalType = 'none' | 'create' | 'edit' | 'complete' | 'view';

interface RepairItem {
  id: string;
  reportDate: string;
  appointDate: string;
  roomNumber: string;
  status: TabStatus;
  details: string;
  completeDate?: string;
  cost?: string;
  completeDetails?: string;
}

export default function RepairManagement() {
  const navigate = useNavigate();

  // ดึง ID หอพักจาก localStorage
  const dormitoryId = localStorage.getItem('dormitoryId');

  // --- States ---
  const [activeTab, setActiveTab] = useState<TabStatus>('pending');
  const [modalType, setModalType] = useState<ModalType>('none');
  const [selectedRepairId, setSelectedRepairId] = useState<string | null>(null);
  
  // State สำหรับเก็บชื่อหอพัก
  const [dormitoryName, setDormitoryName] = useState<string>('');

  // จำลองข้อมูล (Mock Data)
  const [repairs, setRepairs] = useState<RepairItem[]>([
    {
      id: '1',
      reportDate: '10-10-1010',
      appointDate: '28-2-2026',
      roomNumber: '101',
      status: 'pending',
      details: 'ซ่อมหลอดไฟเพดาน',
    }
  ]);

  // States สำหรับ Form แจ้งซ่อม
  const [formRoom, setFormRoom] = useState('');
  const [formReportDate, setFormReportDate] = useState('');
  const [formAppointDate, setFormAppointDate] = useState('');
  const [formDetails, setFormDetails] = useState('');

  // States สำหรับ Form บันทึกการเข้าซ่อม
  const [formCompleteDate, setFormCompleteDate] = useState('');
  const [formCost, setFormCost] = useState('0.00');
  const [formCompleteDetails, setFormCompleteDetails] = useState('');

  // --- useEffect สำหรับดึงชื่อหอพัก ---
  useEffect(() => {
    const fetchDormitoryName = async () => {
      if (!dormitoryId) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const name = data.data?.name || data.data?.dormitory_name || data.name || '';
          setDormitoryName(name);
        }
      } catch (error) {
        console.error("Error fetching dormitory name:", error);
      }
    };

    fetchDormitoryName();
  }, [dormitoryId]);

  // ฟิลเตอร์ข้อมูลตามแท็บที่เลือก
  const filteredRepairs = repairs.filter(r => r.status === activeTab);

  // --- Handlers ---
  const handleCloseModal = () => {
    setModalType('none');
    setSelectedRepairId(null);
  };

  const handleOpenCreate = () => {
    setFormRoom('');
    setFormReportDate('');
    setFormAppointDate('');
    setFormDetails('');
    setModalType('create');
  };

  const handleOpenEdit = (repair: RepairItem) => {
    setSelectedRepairId(repair.id);
    setFormRoom(repair.roomNumber);
    setFormReportDate(repair.reportDate);
    setFormAppointDate(repair.appointDate);
    setFormDetails(repair.details);
    setModalType('edit');
  };

  const handleOpenComplete = (id: string) => {
    setSelectedRepairId(id);
    setFormCompleteDate('');
    setFormCost('0.00');
    setFormCompleteDetails('');
    setModalType('complete');
  };

  const handleOpenView = (repair: RepairItem) => {
    setSelectedRepairId(repair.id);
    setFormRoom(repair.roomNumber);
    setFormReportDate(repair.reportDate);
    setFormAppointDate(repair.appointDate);
    setFormDetails(repair.details);
    setFormCompleteDate(repair.completeDate || '-');
    setFormCost(repair.cost || '0.00');
    setFormCompleteDetails(repair.completeDetails || '-');
    setModalType('view');
  };

  const handleSaveRepair = () => {
    if (modalType === 'create') {
      const newRepair: RepairItem = {
        id: Math.random().toString(36).substr(2, 9),
        reportDate: formReportDate || '-',
        appointDate: formAppointDate || '-',
        roomNumber: formRoom || '-',
        status: 'pending',
        details: formDetails || '-',
      };
      setRepairs([...repairs, newRepair]);
    } else if (modalType === 'edit' && selectedRepairId) {
      setRepairs(repairs.map(r => 
        r.id === selectedRepairId 
          ? { ...r, roomNumber: formRoom, reportDate: formReportDate, appointDate: formAppointDate, details: formDetails }
          : r
      ));
    }
    handleCloseModal();
  };

  const handleSaveCompletion = () => {
    if (selectedRepairId) {
      setRepairs(repairs.map(r => 
        r.id === selectedRepairId 
          ? { 
              ...r, 
              status: 'completed', 
              completeDate: formCompleteDate, 
              cost: formCost, 
              completeDetails: formCompleteDetails 
            }
          : r
      ));
    }
    handleCloseModal();
  };

  return (
    <div className="flex h-screen bg-[#f8fcf8] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        
        {/* Header */}
        <div className="flex-none">
          <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />
        </div>

        {/* --- เนื้อหาหลัก --- */}
        <div className="flex-1 overflow-y-auto w-full px-6 pt-6 pb-10">
          <div className="max-w-6xl mx-auto">
            
            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-2 rounded-lg border font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-[#0e4b3a] text-white border-[#0e4b3a]'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                รอดำเนินการ
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-6 py-2 rounded-lg border font-medium transition-colors ${
                  activeTab === 'completed'
                    ? 'bg-[#0e4b3a] text-white border-[#0e4b3a]'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                เสร็จแล้ว
              </button>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-xl font-medium text-gray-800">รายการแจ้งซ่อม</h2>
                {activeTab === 'pending' && (
                  <button 
                    onClick={handleOpenCreate}
                    className="bg-[#78716c] hover:bg-[#655f5b] text-white px-5 py-2 rounded-lg transition-colors font-medium"
                  >
                    สร้างรายการ
                  </button>
                )}
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-max text-left border-collapse">
                  <thead>
                    <tr className="bg-[#e5e5e5] text-gray-600 text-sm">
                      <th className="py-3 px-6 font-medium">วันที่แจ้งซ่อม</th>
                      <th className="py-3 px-6 font-medium">วันที่นัดซ่อม</th>
                      <th className="py-3 px-6 font-medium">ห้อง</th>
                      <th className="py-3 px-6 font-medium text-center">สถานะ</th>
                      <th className="py-3 px-6 font-medium">รายละเอียด</th>
                      <th className="py-3 px-6 font-medium text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRepairs.length > 0 ? (
                      filteredRepairs.map((repair) => (
                        <tr key={repair.id} className="border-b border-gray-100 hover:bg-gray-50 text-gray-700">
                          <td className="py-4 px-6">{repair.reportDate}</td>
                          <td className="py-4 px-6">{repair.appointDate}</td>
                          <td className="py-4 px-6">{repair.roomNumber}</td>
                          <td className="py-4 px-6 text-center">
                            {repair.status === 'pending' ? (
                              <span className="inline-block bg-[#ffed4a] text-yellow-800 text-xs px-3 py-1 rounded-full border border-yellow-300">
                                รอดำเนินการ
                              </span>
                            ) : (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full border border-green-300">
                                เสร็จแล้ว
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 max-w-xs truncate" title={repair.details}>
                            {repair.details}
                          </td>
                          <td className="py-4 px-6 text-right space-x-4 text-sm font-medium">
                            {repair.status === 'pending' ? (
                              <>
                                <button 
                                  onClick={() => handleOpenComplete(repair.id)} 
                                  className="text-[#0e4b3a] underline hover:text-green-800"
                                >
                                  บันทึกการเข้าซ่อม
                                </button>
                                <button 
                                  onClick={() => handleOpenEdit(repair)} 
                                  className="text-gray-600 underline hover:text-gray-800"
                                >
                                  แก้ไข
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => handleOpenView(repair)} 
                                className="text-blue-600 underline hover:text-blue-800"
                              >
                                ดูรายละเอียด
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400">
                          ไม่มีข้อมูล
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex-none w-full border-t border-gray-200">
          <Footer />
        </div>
      </div>

      {/* --- Modal 1: สร้าง / แก้ไข รายการแจ้งซ่อม (แท็บรอดำเนินการ) --- */}
      {(modalType === 'create' || modalType === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-medium text-gray-800">
                {modalType === 'create' ? 'รายละเอียดการซ่อม (สร้างใหม่)' : 'แก้ไขรายการซ่อม'}
              </h2>
            </div>
            
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="w-1/3">
                <label className="block text-gray-700 mb-2">ห้อง<span className="text-red-500">*</span></label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#0e4b3a]"
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                >
                  <option value="">เลือกห้อง</option>
                  <option value="101">101</option>
                  <option value="102">102</option>
                  <option value="103">103</option>
                </select>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-gray-700 mb-2">วันที่แจ้ง<span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#0e4b3a]"
                    value={formReportDate}
                    onChange={(e) => setFormReportDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 mb-2">วันที่นัด<span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#0e4b3a]"
                    value={formAppointDate}
                    onChange={(e) => setFormAppointDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">รายละเอียด<span className="text-red-500">*</span></label>
                <textarea 
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#0e4b3a] resize-none"
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-4 bg-gray-50">
              <button 
                onClick={handleCloseModal}
                className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors bg-white"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleSaveRepair}
                className="px-6 py-2 bg-[#78716c] hover:bg-[#655f5b] text-white rounded-lg transition-colors"
              >
                บันทึก
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- Modal 2: บันทึกการเข้าซ่อม (แก้ Layout ให้สมดุลแล้ว) --- */}
      {modalType === 'complete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-medium text-gray-800">บันทึกการเข้าซ่อม</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              
              {/* แถวที่ 1: วันที่เข้าซ่อม (ซ้าย) และ ค่าใช้จ่ายทั้งหมด (ขวา) */}
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-1">
                  <label className="block text-gray-700 mb-2">วันที่เข้าซ่อม<span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#0e4b3a]"
                    value={formCompleteDate}
                    onChange={(e) => setFormCompleteDate(e.target.value)}
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-gray-700 mb-2">ค่าใช้จ่ายทั้งหมด<span className="text-red-500">*</span></label>
                  <input 
                    min="0"
                    type="number" 
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#0e4b3a]"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                  />
                </div>
              </div>

              {/* แถวที่ 2: รายละเอียดการซ่อม (เต็มความกว้าง) */}
              <div>
                <label className="block text-gray-700 mb-2">รายละเอียดการซ่อม<span className="text-red-500">*</span></label>
                <textarea 
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#0e4b3a] resize-none"
                  value={formCompleteDetails}
                  onChange={(e) => setFormCompleteDetails(e.target.value)}
                ></textarea>
              </div>

            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-4 bg-gray-50">
              <button 
                onClick={handleCloseModal}
                className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors bg-white"
              >
                ปิด
              </button>
              <button 
                onClick={handleSaveCompletion}
                className="px-6 py-2 bg-[#78716c] hover:bg-[#655f5b] text-white rounded-lg transition-colors"
              >
                บันทึก
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- Modal 3: ดูรายละเอียดแบบอ่านอย่างเดียว (สำหรับแท็บเสร็จแล้ว) --- */}
      {modalType === 'view' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-[#0e4b3a]">
              <h2 className="text-xl font-medium text-white">รายละเอียดการแจ้งซ่อม (เสร็จสิ้น)</h2>
              <button onClick={handleCloseModal} className="text-white hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-[#0e4b3a] border-b pb-2">ข้อมูลรับแจ้ง</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <p><span className="text-gray-500 font-medium block text-sm">ห้อง:</span> {formRoom}</p>
                    <p><span className="text-gray-500 font-medium block text-sm">วันที่แจ้ง:</span> {formReportDate}</p>
                    <p><span className="text-gray-500 font-medium block text-sm">วันที่นัดหมาย:</span> {formAppointDate}</p>
                    <p><span className="text-gray-500 font-medium block text-sm">รายละเอียดเบื้องต้น:</span> {formDetails}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-green-700 border-b pb-2">ข้อมูลการดำเนินการ</h3>
                  <div className="bg-green-50 p-4 rounded-lg space-y-3">
                    <p><span className="text-green-800 font-medium block text-sm">วันที่ดำเนินการ:</span> {formCompleteDate}</p>
                    <p><span className="text-green-800 font-medium block text-sm">ค่าใช้จ่ายทั้งหมด:</span> <span className="text-red-600 font-semibold">{formCost} บาท</span></p>
                    <p><span className="text-green-800 font-medium block text-sm">รายละเอียดงานซ่อม:</span> {formCompleteDetails}</p>
                  </div>
                </div>
                
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50">
              <button 
                onClick={handleCloseModal}
                className="px-8 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors bg-white shadow-sm"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}