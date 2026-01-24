import { useState} from 'react';

const ForgotPasswordPage: React.FC = () => {
   // State สำหรับเก็บค่าอีเมล
   const [email, setEmail] = useState('');
   // State สำหรับเก็บ Error Message
   const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // ลบ Error ทันทีที่เริ่มพิมพ์ใหม่
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Logic ตรวจสอบเบื้องต้น
    if (!email.trim()) {
      setError('จำเป็นต้องระบุอีเมล');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      // ตรวจสอบรูปแบบอีเมลคร่าวๆ
      setError('รูปแบบอีเมลไม่ถูกต้อง');
    } else {
      try{
        const response = await fetch('/api/forgotpassword',{
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ email })
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.message || 'เกิดข้อผิดพลาด');
        }

        alert('ระบบตรวจสอบอีเมล ${email} สำเร็จ');
        localStorage.setItem('resetEmail',email);
        window.location.href = '/createpassword';
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans">
      
        <div className="flex items-start justify-center md:justify-start">
            <img 
                src="/logo.png" 
                alt="The Nexus Logo" 
                className="w-48 h-auto object-contain" 
            />
        </div>

      {/* --- การ์ดลืมรหัสผ่าน --- */}
      <div className="w-full max-w-md bg-lime-50 rounded-2xl shadow-lg p-8 mt-10">
        
        {/* หัวข้อการ์ด */}
        <h2 className="text-center text-gray-800 text-xl font-medium mb-3">
          โปรดระบุอีเมลสำหรับตั้งรหัสผ่านใหม่
        </h2>
        
        {/* เส้นขีดคั่น */}
        <div className="border-b border-gray-300 w-full mb-6"></div>

        <form onSubmit={handleSubmit}>
          
          {/* ช่องกรอกอีเมล */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              อีเมล
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              // ถ้ามี error ให้ขอบเป็นสีแดง
              className={`w-full px-4 py-3 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-lime-50 bg-white shadow-sm ${error ? 'ring-2 ring-red-500' : ''}`}
            />
            {/* แสดง Error text ถ้ามี */}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          {/* ปุ่มส่งอีเมล (ชิดขวา) */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-sky-600 hover:bg-cyan-500 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-colors duration-200"
            >
              ส่งอีเมลรีเซ็ตรหัสผ่าน
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;