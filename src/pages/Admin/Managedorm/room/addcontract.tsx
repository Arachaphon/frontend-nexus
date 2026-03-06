import React, { useState, useEffect, useCallback } from 'react'; 
import { useParams, Link, useNavigate } from 'react-router-dom'; // เพิ่ม useNavigate
import { Home, ChevronRight } from 'lucide-react';

// Import Components
import C_HomeMain from '../../../../components/C_homemain';
import Footer from '../../../../components/Footerhomemain';
import Sidebar from '../../../../components/Sidebar';

export default function AddContract() {
    const { dormitoryId, roomId} = useParams();
    const navigate = useNavigate();
    const [dormitoryName, setDormitoryName] = useState<string>('');
    const [roomNumber, setRoomNumber] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';

    const fetchContract = useCallback(async () => {
    if (!dormitoryId || !roomId) return;

    setLoading(true);
    setError(null);

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };

        const [dormRes, roomRes] = await Promise.all([
            fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, {
            method: 'GET',
            headers,
            }),
            fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}/${roomId}`, {
            method: 'GET',
            headers,
            })
        ]);

        if (!dormRes.ok || !roomRes.ok ) {
            throw new Error('API request failed');
        }

        const dormData = await dormRes.json();
        const roomData = await roomRes.json();
        
        setDormitoryName(dormData.name);
        setRoomNumber(roomData.data.room_number);

    } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('Unexpected error occurred');
        }
    } finally {
        setLoading(false);
    };
    }, [dormitoryId, roomId, API_BASE]);

    useEffect(() => {
        fetchContract();
    }, [fetchContract]);

  // --- States สำหรับฟอร์ม ---
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [deposit, setDeposit] = useState<number | ''>(''); 
  const [monthlyRent, setMonthlyRent] = useState<number | ''>(''); // เพิ่ม state ค่าเช่าต่อเดือน
  const [booking, setBooking] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('');
  
  // ข้อมูลผู้เช่า
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState('');
  const [address, setAddress] = useState('');
  const [emerName, setEmerName] = useState('');
  const [emerRelation, setEmerRelation] = useState('');
  const [emerPhone, setemerPhone] = useState('');
  const [note, setNote] = useState('');

  // State เก็บ Error
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const numDeposit = deposit === '' ? 0 : deposit;
  const numBooking = booking === '' ? 0 : booking;
  const totalToPay = Math.max(0, numDeposit - numBooking);

  // ฟังก์ชันตรวจสอบความถูกต้องของฟอร์ม
  const handleNext = async () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!checkInDate) newErrors.checkInDate = 'กรุณาระบุวันที่เข้าพัก';
    if (checkOutDate && checkOutDate <= checkInDate) {
        newErrors.checkOutDate = 'วันที่ออกต้องมากกว่าวันที่เข้าพัก';
    }
    if (deposit === '') newErrors.deposit = 'กรุณาระบุเงินประกัน';
    if (monthlyRent === '') newErrors.monthlyRent = 'กรุณาระบุค่าเช่าต่อเดือน';
    if (!paymentMethod) newErrors.paymentMethod = 'กรุณาเลือกช่องทางการชำระเงิน';
    if (!firstName.trim()) newErrors.firstName = 'กรุณาระบุชื่อจริง';
    if (!lastName.trim()) newErrors.lastName = 'กรุณาระบุนามสกุล';
    if (!phone.trim()) newErrors.phone = 'กรุณาระบุเบอร์ติดต่อ';
    if (!idCard.trim()) newErrors.idCard = 'กรุณาระบุเลขบัตรประชาชน / พาสปอร์ต';
    
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
        return;
    }

    try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };

        const contractRes = await fetch(
            `${API_BASE}/api/rentals/contracts` , {
            method: 'POST',
            headers,
            body: JSON.stringify({
                room_id: roomId,
                check_in_date: checkInDate,
                check_out_date: checkOutDate || null,
                rent_price: monthlyRent,
                security_deposit: deposit,
                security_deposit_type: paymentMethod,
                booking_fee: booking,
                tenant: {
                    first_name: firstName,
                    last_name: lastName,
                    phone_number: phone,
                    id_card_or_passport: idCard,
                    address: address || null,
                    emergency_contact_name: emerName || null,
                    emergency_contact_relation: emerRelation || null,
                    emergency_contact_phone: emerPhone || null,
                    note: note || null
                }
            })
        });


        if (!contractRes.ok) {
            const errData = await contractRes.json();
            throw new Error(errData.error || 'API request failed');
        }

        const data = await contractRes.json();
        const newContractId = data.data.contract_id;
        console.log('navigating to:', `/manage/${dormitoryId}/room/${roomId}/addcontract2/${newContractId}`);
        navigate(`/manage/${dormitoryId}/room/${roomId}/addcontract2/${newContractId}`);
    } catch (err:unknown) {
        if (err instanceof Error) {
            setError (err.message);
        } else {
            setError('Unexpected Error occurred')
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        
        <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />

        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50">
            <div className="text-gray-600 text-sm font-medium">
              Loading...
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
            
            <div className="flex-grow px-6 py-6">
                <div className="mb-8 w-full">
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                        <Link to={`/manage/${dormitoryId}`} className="hover:text-emerald-600 flex items-center gap-1.5">
                            <Home className="w-4 h-4" />
                            <span>ห้อง</span>
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <Link to={`/manage/${dormitoryId}/room/${roomId}`} className="hover:text-emerald-600">
                            ข้อมูล ห้อง {roomNumber || '-' }
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 font-medium">เพิ่มสัญญา</span>
                    </div>
                    <hr className="border-gray-300 w-full" />
                </div>

                <div className="max-w-5xl mx-auto mt-8">
                    
                    <div className="flex justify-center items-center mb-10">
                        <div className="flex flex-col items-center relative z-10">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-md">1</div>
                            <span className="text-emerald-600 font-semibold text-sm">สัญญา</span>
                        </div>
                        <div className="h-1 bg-gray-200 w-24 mx-2 -mt-6"></div>
                        
                        <div className="flex flex-col items-center relative z-10 opacity-40">
                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm mb-2">2</div>
                            <span className="text-gray-400 font-medium text-sm">ค่าเช่าล่วงหน้า</span>
                        </div>
                        <div className="h-1 bg-gray-200 w-24 mx-2 -mt-6"></div>

                        <div className="flex flex-col items-center relative z-10 opacity-40">
                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm mb-2">3</div>
                            <span className="text-gray-400 font-medium text-sm">มิเตอร์น้ำ-ไฟ</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        
                        <h3 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">สัญญารายเดือน</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                        
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">วันที่เข้าพัก <span className="text-red-500">*</span></label>
                                <input 
                                    type="date" 
                                    value={checkInDate}
                                    onChange={(e) => {
                                      setCheckInDate(e.target.value);
                                      if (errors.checkInDate) setErrors({ ...errors, checkInDate: '' });
                                    }}
                                    className={`w-full border ${errors.checkInDate ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-emerald-500`} 
                                />
                                {errors.checkInDate && <p className="text-red-500 text-xs mt-1">{errors.checkInDate}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">วันที่ออก</label>
                                <input type="date"
                                value={checkOutDate}
                                onChange={(e) => {
                                    setCheckOutDate(e.target.value);
                                    if (errors.checkOutDate) {
                                    setErrors({ ...errors, checkOutDate: '' });
                                    }
                                }}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-emerald-500" />
                                {errors.checkOutDate && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.checkOutDate}
                                </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">เงินประกัน <span className="text-red-500">*</span></label>
                                <div className={`flex items-center border ${errors.deposit ? 'border-red-500' : 'border-gray-300'} rounded overflow-hidden`}>
                                <input 
                                    type="number" 
                                    min="0" 
                                    placeholder="" 
                                    value={deposit}
                                    onChange={(e) => {
                                      setDeposit(e.target.value === '' ? '' : Number(e.target.value));
                                      if (errors.deposit) setErrors({ ...errors, deposit: '' });
                                    }}
                                    className="w-full px-3 py-2 text-sm text-gray-800 focus:outline-none"
                                    onKeyDown={(e) => {
                                        if (e.key === '-' || e.key === 'e') {
                                        e.preventDefault();
                                        }
                                    }}
                                />
                                <span className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-l border-gray-300">บาท</span>
                                </div>
                                {errors.deposit && <p className="text-red-500 text-xs mt-1">{errors.deposit}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">ค่าเช่าต่อเดือน <span className="text-red-500">*</span></label>
                                <div className={`flex items-center border ${errors.monthlyRent ? 'border-red-500' : 'border-gray-300'} rounded overflow-hidden`}>
                                    <input 
                                        type="number" 
                                        min="0" 
                                        placeholder="" 
                                        value={monthlyRent}
                                        onChange={(e) => {
                                          setMonthlyRent(e.target.value === '' ? '' : Number(e.target.value));
                                          if (errors.monthlyRent) setErrors({ ...errors, monthlyRent: '' });
                                        }}
                                        className="w-full px-3 py-2 text-sm text-gray-800 focus:outline-none"
                                        onKeyDown={(e) => {
                                            if (e.key === '-' || e.key === 'e') {
                                            e.preventDefault();
                                            }
                                        }}
                                    />
                                    <span className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-l border-gray-300">บาท</span>
                                </div>
                                {errors.monthlyRent && <p className="text-red-500 text-xs mt-1">{errors.monthlyRent}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">เงินจอง</label>
                                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                                <input 
                                    type="number" 
                                    placeholder=""
                                    value={booking}
                                    onChange={(e) => setBooking(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-full px-3 py-2 text-sm text-gray-800 focus:outline-none" 
                                />
                                <span className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-l border-gray-300">บาท</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">ระบุจำนวนเงิน หากลูกค้ามีการโอนจองก่อนเข้าพัก</p>
                            </div>
                        
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">ชำระเงินประกันด้วย <span className="text-red-500">*</span></label>
                                <select 
                                  value={paymentMethod}
                                  onChange={(e) => {
                                    setPaymentMethod(e.target.value);
                                    if (errors.paymentMethod) setErrors({ ...errors, paymentMethod: '' });
                                  }}
                                  className={`w-full border ${errors.paymentMethod ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-emerald-500 bg-white`}
                                >
                                  <option value="">-- เลือก --</option>
                                  <option value="เงินสด">เงินสด</option>
                                  <option value="โอนเงินธนาคาร">โอนเงินธนาคาร</option>
                                </select>
                                {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>}
                            </div>

                        </div>

                        <div className="bg-white border-2 border-emerald-500 rounded-lg p-5 mb-10 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div> 
                            
                            <h4 className="text-sm font-bold text-gray-800 mb-4">สรุปยอดชำระ</h4>
                            <div className="flex justify-between items-center mb-2 text-sm">
                                <span className="text-gray-500">เงินประกัน</span>
                                <span className="font-medium">
                                    {Math.max(0, numDeposit).toLocaleString()} บาท
                                </span>
                            </div>
                            <div className="flex justify-between items-center mb-3 text-sm border-b border-gray-100 pb-3">
                                <span className="text-gray-500">เงินจอง</span>
                                <span className="font-medium text-red-500">-{numBooking.toLocaleString()} บาท</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-gray-800">รวมที่ต้องชำระ (เก็บเพิ่ม)</span>
                                <span className="text-emerald-600 text-xl">{totalToPay.toLocaleString()} บาท</span>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">ข้อมูลผู้เช่า</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">ชื่อจริง <span className="text-red-500">*</span></label>
                                <input 
                                  type="text" 
                                  value={firstName}
                                  onChange={(e) => {
                                    setFirstName(e.target.value);
                                    if (errors.firstName) setErrors({ ...errors, firstName: '' });
                                  }}
                                  className={`w-full border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500`} 
                                />
                                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">นามสกุล <span className="text-red-500">*</span></label>
                                <input 
                                  type="text" 
                                  value={lastName}
                                  onChange={(e) => {
                                    setLastName(e.target.value);
                                    if (errors.lastName) setErrors({ ...errors, lastName: '' });
                                  }}
                                  className={`w-full border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500`} 
                                />
                                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">เบอร์ติดต่อ <span className="text-red-500">*</span></label>
                                <input 
                                  type="text" 
                                  value={phone}
                                  onChange={(e) => {
                                    setPhone(e.target.value);
                                    if (errors.phone) setErrors({ ...errors, phone: '' });
                                  }}
                                  className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500`} 
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">เลขบัตรประชาชน / พาสปอร์ต <span className="text-red-500">*</span></label>
                                <input 
                                  type="text" 
                                  value={idCard}
                                  onChange={(e) => {
                                    setIdCard(e.target.value);
                                    if (errors.idCard) setErrors({ ...errors, idCard: '' });
                                  }}
                                  className={`w-full border ${errors.idCard ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500`} 
                                />
                                {errors.idCard && <p className="text-red-500 text-xs mt-1">{errors.idCard}</p>}
                            </div>
                        </div>
                        <div className="mb-8">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">ที่อยู่</label>
                            <p className="text-xs text-gray-400 mt-1">สำหรับแสดงบนใบแจ้งหนี้/ใบเสร็จ</p>
                            <input 
                            type="text" 
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                        </div>

                        <h3 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">บุคคลติดต่อฉุกเฉิน</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">ชื่อบุคคลติดต่อฉุกเฉิน</label>
                                <input 
                                type="text"
                                value={emerName}
                                onChange={(e) => setEmerName(e.target.value)} 
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">ความสัมพันธ์</label>
                                <input 
                                type="text"
                                value={emerRelation}
                                onChange={(e) => setEmerRelation(e.target.value)}                                  
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">เบอร์ติดต่อ</label>
                                <input 
                                type="text"
                                value={emerPhone}
                                onChange={(e) => setemerPhone(e.target.value)}  
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">อื่นๆ</h3>
                        <div className="mb-8">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Note</label>
                            <textarea rows={3} 
                            value={note}
                            onChange={(e) =>  setNote(e.target.value)}                                   
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                            <p className="text-xs text-gray-400 mt-1">ข้อความนี้จะแสดงที่รายงาน - ผู้เช่าปัจจุบัน</p>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            {/* เปลี่ยนจาก <Link> เป็น <button> เพื่อตรวจสอบเงื่อนไขก่อนเปลี่ยนหน้า */}
                            <button 
                              onClick={handleNext}
                              className="bg-[#7d7671] hover:bg-[#68625d] text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors text-sm"
                            >
                                ต่อไป
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}