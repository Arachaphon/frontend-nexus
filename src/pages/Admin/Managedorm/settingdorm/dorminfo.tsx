import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import C_HomeMain from '../../../../components/C_homemain';
import Footer from '../../../../components/Footerhomemain';
import Sidebar from '../../../../components/Sidebar';

declare global {
  interface Window {
    __ENV__: { API_BASE: string };
  }
}

interface FormData {
  name: string;
  address: string;
  phone_number: string;
  tax_id: string;
  due_date: string;
  fine_per_day: string;
  payment_note: string;
}

interface FormErrors {
  [key: string]: string;
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

/* ────────────────────────────────────────────────────────── */
/* Small reusable field wrapper                              */
/* ────────────────────────────────────────────────────────── */
const Field = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">
        <svg className="w-3 h-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

const inputCls = (hasError?: boolean) =>
  `w-full border rounded-xl h-11 px-4 text-sm bg-white transition-all outline-none
   focus:ring-2 focus:ring-[#0e4b3a]/25 focus:border-[#0e4b3a]
   ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`;

const Section = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) => (
  <div className="flex items-start gap-3 mb-6">
    <div className="w-9 h-9 rounded-lg bg-[#0e4b3a]/10 flex items-center justify-center text-[#0e4b3a] shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <h2 className="text-base font-bold text-[#0e4b3a]">{title}</h2>
      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    </div>
  </div>
);

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

export default function DormInfo() {
  const { dormitoryId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: '', address: '', phone_number: '', tax_id: '',
    due_date: '', fine_per_day: '', payment_note: '',
  });

  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [toastMsg, setToastMsg] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const [dormitoryName, setDormitoryName] = useState('');

  const API_BASE = window.__ENV__?.API_BASE;

  const fetchDormitoryData = useCallback(async () => {
    const activeDormId = dormitoryId || localStorage.getItem('dormitoryId');
    if (!activeDormId) { setInitialLoad(false); return; }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/dormitories/main/${activeDormId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) { window.location.href = '/homemain'; return; }

      if (res.ok) {
        const dorm = await res.json();
        const d = dorm.data ?? dorm;

        const mapped: FormData = {
          name: d.name ?? '',
          address: d.address ?? '',
          phone_number: d.phone_number ?? '',
          tax_id: d.tax_id ?? '',
          due_date: d.due_date != null ? String(d.due_date) : '',
          fine_per_day: d.fine_per_day != null ? String(d.fine_per_day) : '',
          payment_note: d.payment_note ?? '',
        };

        setFormData(mapped);
        setOriginalData(mapped);
        setDormitoryName(d.name ?? '');
      }
    } catch (err) {
      console.error('Failed to fetch dormitory data', err);
    } finally {
      setInitialLoad(false);
    }
  }, [dormitoryId, API_BASE]);

  useEffect(() => { fetchDormitoryData(); }, [fetchDormitoryData]);

  // Auto-dismiss toast after 3 s
  useEffect(() => {
    if (saveStatus === 'success' || saveStatus === 'error') {
      const t = setTimeout(() => setSaveStatus('idle'), 3000);
      return () => clearTimeout(t);
    }
  }, [saveStatus]);

  // ── Helpers ──────────────────────────────────────────────
  const isDirty = originalData
    ? Object.keys(formData).some((k) => formData[k as keyof FormData] !== originalData[k as keyof FormData])
    : false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'number' && value !== '' && Number(value) < 0) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!formData.name.trim())         e.name         = 'จำเป็นต้องกรอกชื่อหอพัก';
    if (!formData.address.trim())      e.address      = 'จำเป็นต้องกรอกที่อยู่';
    if (!formData.phone_number.trim()) e.phone_number = 'จำเป็นต้องกรอกเบอร์โทรศัพท์';
    if (formData.due_date === '')      e.due_date     = 'จำเป็นต้องระบุวันสุดท้ายของการชำระเงิน';
    if (formData.fine_per_day === '')  e.fine_per_day = 'จำเป็นต้องระบุค่าปรับ';

    const due = Number(formData.due_date);
    if (!e.due_date && (due < 1 || due > 31)) e.due_date = 'วันที่ต้องอยู่ระหว่าง 1 ถึง 31';

    setErrors(e);
    if (Object.keys(e).length > 0) {
      document.getElementById('scrollable-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return Object.keys(e).length === 0;
  };

  // ── Submit — uses PATCH when id exists, POST for new ────
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setSaveStatus('saving');
    setToastMsg('กำลังบันทึก...');

    try {
      const token = localStorage.getItem('token');
      const activeDormId = dormitoryId || localStorage.getItem('dormitoryId');

      const isUpdate = Boolean(activeDormId);
      const method   = isUpdate ? 'PATCH' : 'POST';
      const url      = isUpdate
        ? `${API_BASE}/api/dormitories/main/${activeDormId}`
        : `${API_BASE}/api/dormitories/main`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          due_date:     Number(formData.due_date),
          fine_per_day: Number(formData.fine_per_day),
        }),
      });

      if (res.status === 403) { navigate('/homemain'); return; }

      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'ไม่สามารถบันทึกข้อมูลได้');

      if (result.dormitory_id) localStorage.setItem('dormitoryId', result.dormitory_id);

      setDormitoryName(formData.name);
      setOriginalData({ ...formData });

      setSaveStatus('success');
      setToastMsg('บันทึกข้อมูลเรียบร้อยแล้ว');
    } catch (err: unknown) {
      setSaveStatus('error');
      setToastMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่รู้จัก');
    }
  };

  const handleReset = () => {
    if (originalData) { setFormData(originalData); setErrors({}); }
  };

  // ── Loading skeleton ─────────────────────────────────────
  if (initialLoad) {
    return (
      <div className="flex h-screen bg-[#f7faf8] overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-[3px] border-[#0e4b3a]/20 border-t-[#0e4b3a] animate-spin" />
            <p className="text-sm text-gray-400">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#f7faf8] font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Header */}
        <div className="flex-none">
          <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />
        </div>

        {/* Scrollable content */}
        <div id="scrollable-content" className="flex-grow overflow-y-auto px-6 py-8">
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">

            {/* Dirty-state banner */}
            {isDirty && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  มีการแก้ไขที่ยังไม่ได้บันทึก
                </span>
                <button onClick={handleReset} className="underline underline-offset-2 hover:text-amber-900 transition-colors">
                  ยกเลิกการแก้ไข
                </button>
              </div>
            )}

            {/* ── Card 1: ข้อมูลหอพัก ─────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <Section
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
                title="ข้อมูลหอพัก"
                subtitle="ชื่อและที่อยู่ที่จะแสดงในใบแจ้งหนี้และใบเสร็จรับเงิน"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="ชื่อหอพัก" required error={errors.name}>
                  <input
                    name="name" value={formData.name} onChange={handleChange}
                    type="text" placeholder="เช่น หอพักสมหวัง"
                    className={inputCls(!!errors.name)}
                  />
                </Field>

                <Field label="ที่อยู่" required error={errors.address}>
                  <input
                    name="address" value={formData.address} onChange={handleChange}
                    type="text" placeholder="เลขที่ ถนน ตำบล อำเภอ จังหวัด"
                    className={inputCls(!!errors.address)}
                  />
                </Field>
              </div>
            </div>

            {/* ── Card 2: รายละเอียดอื่นๆ ─────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <Section
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                title="รายละเอียดอื่นๆ"
                subtitle="เบอร์โทรศัพท์และเลขประจำตัวผู้เสียภาษี"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="เบอร์โทรศัพท์" required error={errors.phone_number}>
                  <input
                    name="phone_number" value={formData.phone_number} onChange={handleChange}
                    type="text" placeholder="0xx-xxx-xxxx"
                    className={inputCls(!!errors.phone_number)}
                  />
                </Field>

                <Field label="เลขประจำตัวผู้เสียภาษี">
                  <input
                    name="tax_id" value={formData.tax_id} onChange={handleChange}
                    type="text" placeholder="ไม่บังคับ"
                    className={inputCls()}
                  />
                </Field>
              </div>
            </div>

            {/* ── Card 3: กำหนดชำระและค่าปรับ ─────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <Section
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                title="กำหนดชำระค่าห้องและค่าปรับ"
                subtitle="ระบบจะเริ่มคิดค่าปรับอัตโนมัติเมื่อเลยวันที่กำหนด"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <Field label="วันสุดท้ายของการชำระเงิน" required error={errors.due_date}>
                  <div className={`flex items-center rounded-xl border overflow-hidden transition-all
                    focus-within:ring-2 focus-within:ring-[#0e4b3a]/25 focus-within:border-[#0e4b3a]
                    ${errors.due_date ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                    <span className="px-3 h-11 flex items-center text-sm text-gray-500 bg-gray-50 border-r border-gray-200 whitespace-nowrap">
                      วันที่
                    </span>
                    <input
                      name="due_date" value={formData.due_date} onChange={handleChange}
                      type="number" min="1" max="31" placeholder="1–31"
                      className="flex-1 px-4 h-11 text-sm bg-white outline-none"
                    />
                    <span className="px-3 h-11 flex items-center text-sm text-gray-500 bg-gray-50 border-l border-gray-200 whitespace-nowrap">
                      ของเดือน
                    </span>
                  </div>
                </Field>

                <Field label="ค่าปรับชำระล่าช้าต่อวัน" required error={errors.fine_per_day}>
                  <div className={`flex items-center rounded-xl border overflow-hidden transition-all
                    focus-within:ring-2 focus-within:ring-[#0e4b3a]/25 focus-within:border-[#0e4b3a]
                    ${errors.fine_per_day ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                    <input
                      name="fine_per_day" value={formData.fine_per_day} onChange={handleChange}
                      type="number" min="0" placeholder="0"
                      className="flex-1 px-4 h-11 text-sm bg-white outline-none"
                    />
                    <span className="px-3 h-11 flex items-center text-sm text-gray-500 bg-gray-50 border-l border-gray-200 whitespace-nowrap">
                      บาท/วัน
                    </span>
                  </div>
                </Field>
              </div>

              {/* หมายเหตุการชำระเงิน */}
              <Field label="หมายเหตุการชำระเงิน">
                <div className="relative">
                  <textarea
                    name="payment_note" value={formData.payment_note} onChange={handleChange}
                    rows={3} placeholder="เช่น โอนแล้วแจ้งแอดมินที่ Line: @dormitory"
                    className="w-full border border-gray-300 hover:border-gray-400 rounded-xl px-4 py-3 text-sm bg-white
                      transition-all outline-none focus:ring-2 focus:ring-[#0e4b3a]/25 focus:border-[#0e4b3a] resize-none"
                  />
                  <span className="absolute bottom-2.5 right-3 text-[10px] text-gray-400">
                    {formData.payment_note.length} ตัวอักษร
                  </span>
                </div>
              </Field>
            </div>

            {/* ── Action bar ───────────────────────────────── */}
            <div className="flex items-center justify-between pt-2 pb-8">
              <p className="text-xs text-gray-400">
                {dormitoryId ? `ID: ${dormitoryId}` : 'หอพักใหม่ (ยังไม่ได้บันทึก)'}
              </p>

              <div className="flex items-center gap-3">
                {isDirty && (
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600
                      border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    ยกเลิก
                  </button>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={saveStatus === 'saving'}
                  className={`flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold text-white
                    shadow-sm transition-all
                    ${saveStatus === 'saving'
                      ? 'bg-[#0e4b3a]/50 cursor-not-allowed'
                      : 'bg-[#0e4b3a] hover:bg-[#0a3a2d] active:scale-[0.98]'
                    }`}
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      บันทึก
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex-none w-full border-t border-gray-200">
          <Footer />
        </div>
      </div>

      {/* Toast */}
      <Toast status={saveStatus} message={toastMsg} />
    </div>
  );
}