import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

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

export default function Tenantinfo() {
  const { dormitoryId, roomId, tenantId } = useParams();

  const [dormitoryName, setDormitoryName] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const API_BASE = window.__ENV__?.API_BASE;

  useEffect(() => {
    const fetchStats = async () => {
      if (!dormitoryId) return;
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [dormRes, roomRes] = await Promise.all([
          fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, { method: 'GET', headers }),
          fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}/${roomId}`, { method: 'GET', headers }),
        ]);

        if (dormRes.status === 403 || roomRes.status === 403) {
          window.location.href = '/homemain';
          return;
        }

        if (dormRes.ok) {
          const dormData = await dormRes.json();
          setDormitoryName(dormData.name);
        }
        if (roomRes.ok) {
          const roomData = await roomRes.json();
          setRoomNumber(roomData.data.room_number);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };
    fetchStats();
  }, [dormitoryId, roomId]);

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
    const fetchTenant = async () => {
      if (!tenantId) return;

      const token = localStorage.getItem('token');

      const res = await fetch(
        `${API_BASE}/api/rentals/tenants/dormitories/${dormitoryId}/tenants/${tenantId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await res.json();

      if (data.success) {
        const t = data.data;
        setFormData({
          firstName: t.first_name || '',
          lastName: t.last_name || '',
          phone: t.phone_number || '',
          idCard: t.id_card_or_passport || '',
          address: t.address || '',
          emergencyName: t.emergency_contact_name || '',
          emergencyRelation: t.emergency_contact_relation || '',
          emergencyPhone: t.emergency_contact_phone || '',
          note: t.note || ''
        });
      }
    };
    fetchTenant();
  }, [tenantId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.idCard) {
      setSaveError('กรุณากรอกข้อมูลที่จำเป็นให้ครบ (ชื่อ, นามสกุล, เบอร์, เลขบัตร)');
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(
        `${API_BASE}/api/rentals/tenants/dormitories/${dormitoryId}/tenants/${tenantId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_number: formData.phone,
            id_card_or_passport: formData.idCard,
            address: formData.address,
            emergency_contact_name: formData.emergencyName,
            emergency_contact_relation: formData.emergencyRelation,
            emergency_contact_phone: formData.emergencyPhone,
            note: formData.note
          })
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSaveError(data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        return;
      }
    } catch (err) {
      console.error('PATCH tenant error:', err);
      setSaveError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSaving(false);
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
                <Link to={`/manage/${dormitoryId}`} className="hover:text-emerald-600 flex items-center gap-1.5">
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
                <span className="text-gray-800 font-medium">ข้อมูลผู้เช่า</span>
              </div>
              <hr className="border-gray-300 w-full" />
            </div>

            {/* Form Card */}
            <div className="w-full bg-white rounded-md shadow-sm border border-gray-200 p-8">

              {/* Section 1 */}
              <h3 className="text-lg font-medium text-gray-800 mb-6">ข้อมูลผู้เช่า</h3>
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">
                    เลขบัตรประชาชน/ พาสปอร์ต<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="idCard"
                    value={formData.idCard}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                  <p className="text-[11px] text-gray-400 mb-2 leading-tight">
                    (สำหรับแสดงบนใบแจ้งหนี้/ใบเสร็จ)<br />
                    **ตัวอย่าง ที่อยู่ จังหวัด หนองปลาปู ตำบลปลาช่อน อำเภอกบ หมู่ที่ 99 บ้านเลขที่ 99**
                  </p>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

              </div>

              {/* Section 2 */}
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

              {/* Section 3 */}
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

              {/* Error message */}
              {saveError && (
                <p className="text-red-500 text-sm mb-4 text-right">{saveError}</p>
              )}

              {/* Save button */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#75706b] hover:bg-[#5a5652] disabled:opacity-50 text-white text-sm font-medium py-2.5 px-10 rounded-md transition-colors shadow-sm"
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึก'}
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