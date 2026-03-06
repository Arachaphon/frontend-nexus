import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

import C_HomeMain from '../../../../components/C_homemain';
import Footer from '../../../../components/Footerhomemain';
import Sidebar from '../../../../components/Sidebar';

declare global {
  interface Window {
    __ENV__: { API_BASE: string };
  }
}

export default function AddTenant() {
  const { dormitoryId, roomId, contractId } = useParams();
  const navigate = useNavigate();
  const API_BASE = window.__ENV__?.API_BASE;

  const [dormitoryName, setDormitoryName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    idCard: '',
    address: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    note: ''
  });

  useEffect(() => {
    const fetchInfo = async () => {
      if (!dormitoryId) return;
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        const [dormRes, roomRes] = await Promise.all([
          fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, { headers }),
          fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}/${roomId}`, { headers })
        ]);

        if (dormRes.status === 403 || roomRes.status === 403) {
          window.location.href = '/homemain';
          return;
        }
        if (dormRes.ok) setDormitoryName((await dormRes.json()).name);
        if (roomRes.ok) setRoomNumber((await roomRes.json())?.data?.room_number);
      } catch (err) {
        console.error('Fetch info error:', err);
      }
    };
    fetchInfo();
  }, [dormitoryId, roomId, contractId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() ||
        !formData.phone.trim() || !formData.idCard.trim()) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบ: ชื่อจริง, นามสกุล, เบอร์ติดต่อ และเลขบัตรประชาชน');
      return;
    }
    if (!contractId) {
      setError('ไม่พบ contractId กรุณาตรวจสอบ URL');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {

      const tenantRes = await fetch(`${API_BASE}/api/rentals/tenants/dormitories/${dormitoryId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          dormitory_id: dormitoryId,
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          phone_number: formData.phone.trim(),
          id_card_or_passport: formData.idCard.trim(),
          address: formData.address.trim() || null,
          emergency_contact_name: formData.emergencyName.trim() || null,
          emergency_contact_relation: formData.emergencyRelation.trim() || null,
          emergency_contact_phone: formData.emergencyPhone.trim() || null,
          note: formData.note.trim() || null,
        })
      });

      if (!tenantRes.ok) {
        const err = await tenantRes.json().catch(() => ({}));
        setError(err?.error || 'สร้างผู้เช่าไม่สำเร็จ กรุณาลองใหม่');
        return;
      }

      const { data: newTenant } = await tenantRes.json();

      const linkRes = await fetch(`${API_BASE}/api/rentals/tenants/dormitories/${dormitoryId}/${contractId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tenant_id: newTenant.id,
          is_primary: 0  
        })
      });

      if (!linkRes.ok) {
        const err = await linkRes.json().catch(() => ({}));
        setError(err?.error || 'ผูกผู้เช่ากับสัญญาไม่สำเร็จ กรุณาลองใหม่');
        return;
      }

      navigate(`/manage/${dormitoryId}/room/${roomId}/roominfo/${contractId}`);

    } catch (err) {
      console.error('Save tenant error:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />

        <div className="flex-1 overflow-y-auto">
          <div className="w-full px-6 py-6">

            {/* Breadcrumb */}
            <div className="mb-6 w-full">
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 flex-wrap">
                <Link to="/homemain" className="hover:text-emerald-600 flex items-center gap-1.5">
                  <Home className="w-4 h-4" />
                  <span>ห้อง</span>
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to={`/manage/${dormitoryId}/room/${roomId}/roominfo`} className="hover:text-emerald-600">
                  ข้อมูล ห้อง {roomNumber}
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to={`/manage/${dormitoryId}/room/${roomId}/roominfo`} className="hover:text-emerald-600">
                  ข้อมูลสัญญา
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-800 font-medium">เพิ่มข้อมูลผู้เช่าร่วม</span>
              </div>
              <hr className="border-gray-300 w-full" />
            </div>

            {/* Form Card */}
            <div className="w-full bg-white rounded-md shadow-sm border border-gray-200 p-8">

              {/* Error Banner */}
              {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
                  {error}
                </div>
              )}

              {/* Section 1: ข้อมูลผู้เช่า */}
              <h3 className="text-lg font-medium text-gray-800 mb-6">ข้อมูลผู้เช่าร่วม</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-10">

                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">
                    ชื่อจริง<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="เช่น นาย สมชาย"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">
                    นามสกุล<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="เช่น ใจดี"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">
                    เบอร์ติดต่อ<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0xx-xxx-xxxx"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">
                    เลขบัตรประชาชน / พาสปอร์ต<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="idCard"
                    value={formData.idCard}
                    onChange={handleChange}
                    placeholder="1-xxxx-xxxxx-xx-x"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                  <p className="text-[11px] text-gray-400 mb-2 leading-tight">
                    (สำหรับแสดงบนใบแจ้งหนี้/ใบเสร็จ)
                  </p>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="จังหวัด / ตำบล / อำเภอ / หมู่ที่ / บ้านเลขที่"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

              </div>

              {/* Section 2: บุคคลติดต่อฉุกเฉิน */}
              <hr className="border-gray-200 mb-6" />
              <h3 className="text-lg font-medium text-gray-800 mb-6">บุคคลติดต่อฉุกเฉิน</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 mb-10">

                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">ชื่อบุคคลติดต่อฉุกเฉิน</label>
                  <input
                    type="text"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">ความสัมพันธ์</label>
                  <input
                    type="text"
                    name="emergencyRelation"
                    value={formData.emergencyRelation}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">เบอร์ติดต่อ</label>
                  <input
                    type="text"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

              </div>

              {/* Section 3: อื่นๆ */}
              <hr className="border-gray-200 mb-6" />
              <h3 className="text-lg font-medium text-gray-800 mb-6">อื่นๆ</h3>
              <div className="mb-8">
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">Note</label>
                  <textarea
                    name="note"
                    rows={4}
                    value={formData.note}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  ></textarea>
                  <p className="text-[11px] text-gray-500 mt-2">ข้อความนี้จะแสดงที่ รายงาน - ผู้เช่าปัจจุบัน</p>
                </div>
              </div>

              {/* ปุ่มบันทึก */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="bg-[#75706b] hover:bg-[#5a5652] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 px-10 rounded-md transition-colors shadow-sm"
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>

            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}