import React, { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams, useNavigate } from 'react-router-dom'; // เพิ่ม useNavigate
import { 
  LayoutGrid, 
  CheckSquare, 
  Calendar, 
  XCircle, 
  Home
} from 'lucide-react';

// Import Component ของคุณ
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

interface Room {
  id: string;
  room_number: string;
  status: string;
}

interface LayoutContextType {
  setPageTitle: (title: string) => void;
}

interface Contract {
  id: string
  room_id: string
  rent_price: number
  check_out_date: string | null  
}

const statusMap: Record<string, string> = {
  vacant: 'ว่าง',
  occupied: 'มีผู้เช่า',
  pending: 'รอเข้าอยู่'
}

export default function Manage() {
  const { dormitoryId} = useParams();
  const navigate = useNavigate(); // เรียกใช้งาน navigate สำหรับเปลี่ยนหน้า
  const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8787';
  const [statsData, setStatsData] = useState({
    total: 0,
    vacant: 0,
    occupied: 0,
    pending: 0
  });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dormitoryName, setDormitoryName] = useState<string>('');
  const [tenants, setTenants] = useState<any[]>([]);
  const [contract, setContract] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const context = useOutletContext<LayoutContextType>();
  const setPageTitle = context ? context.setPageTitle : null;

  useEffect(() => {
    if (setPageTitle) {
      setPageTitle('Manage Dormitory');
    }
    const fetchStats = async () => {
      setIsLoading(true);

      try {
        const token = localStorage.getItem('token');

        if (!token) {
          console.error('Authentication token not found.');
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [statsRes, roomsRes, dormRes , tenantRes , contractRes] = await Promise.all([
          fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}/stats`, { method:'GET', headers }),
          fetch(`${API_BASE}/api/dormitories/rooms/${dormitoryId}`, {method:'GET', headers }),
          fetch(`${API_BASE}/api/dormitories/main/${dormitoryId}`, {method:'GET', headers }),
          fetch(`${API_BASE}/api/rentals/tenants/dormitories/${dormitoryId}`, { method: 'GET', headers }),
          fetch(`${API_BASE}/api/rentals/contracts/dormitories/${dormitoryId}`, { method: 'GET', headers }),
        ]);

        if (!statsRes.ok || !roomsRes.ok) {
          if (statsRes.status === 403 || roomsRes.status === 403) {
            window.location.href = '/homemain'
            return
          }

          console.error('API request failed:', statsRes.status, roomsRes.status);
          return;
        }

        const statsJson = await statsRes.json();
        if (statsJson.success) {
          setStatsData(statsJson.data);
        } else {
          console.error('Stats API error:', statsJson.message);
        }

        const roomsJson = await roomsRes.json();
        if (roomsJson.success) {
          setRooms(roomsJson.data);
        } else {
          console.error('Rooms API error:', roomsJson.message);
        }
        const dormJson = await dormRes.json();
        if (dormRes.ok) {
          setDormitoryName(dormJson.name);
        }

      const tenantData = await tenantRes.json();
      const contractData = await contractRes.json();

      setTenants(tenantData.data || []);
      setContract(contractData.data) 

      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    console.log("Dormitory ID:", dormitoryId);
    if (dormitoryId) {
      fetchStats()
    }
  }, [dormitoryId , setPageTitle]);

  // --- ข้อมูลจำลอง (Stats Cards) ---
  const stats = [
    {
      label: 'ห้องทั้งหมด',
      value: statsData.total,
      unit: 'ห้อง',
      icon: <LayoutGrid className="w-5 h-5" />,
      borderColor: 'border-emerald-500', 
      textColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      label: 'ห้องว่างทั้งหมด',
      value: statsData.vacant,
      unit: 'ห้อง',
      icon: <CheckSquare className="w-5 h-5" />,
      borderColor: 'border-green-500',
      textColor: 'text-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      label: 'ค้างชำระ',
      value: statsData.pending,
      unit: 'ห้อง',
      icon: <XCircle className="w-5 h-5" />,
      borderColor: 'border-red-400',
      textColor: 'text-red-500',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500'
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar ด้านซ้าย */}
      <Sidebar />

      {/* เนื้อหาด้านขวา */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header สีเขียวด้านบน */}
        <C_HomeMain title={`หอพัก: ${dormitoryName || '-'}`} />

        <div className="flex-grow px-6 py-6">
            
            {/* Breadcrumb: Home > ห้อง (แก้ไขโค้ดที่เกินมาให้กลับเป็นเหมือนเดิม) */}
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                <Home className="w-4 h-4" />
                <span className="text-emerald-700 font-semibold">ห้อง</span>
            </div>
            
            {/* Stats Cards Dashboard */}
            <div className="flex flex-wrap justify-center gap-5 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  // เพิ่ม w-full md:w-[320px] เพื่อคุมขนาดการ์ดให้เท่ากันและสวยงาม
                  className={`w-full md:w-[320px] bg-white rounded-2xl border-2 ${stat.borderColor} p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`${stat.iconBg} p-2.5 rounded-xl ${stat.iconColor}`}>
                      {stat.icon}
                    </div>
                    <span className="text-gray-600 font-medium text-sm">{stat.label}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-2xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </span>
                    <span className="text-gray-400 text-xs">{stat.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              
              {/* Table Header/Filter */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                   <LayoutGrid size={18}/> รายการห้องพัก
                </h3>
              </div>

              {/* Table Body */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-center w-[100px]">ห้อง</th>
                      <th className="px-6 py-4 font-semibold text-center w-[120px]">สถานะ</th>
                      <th className="px-6 py-4 font-semibold text-center">ผู้เช่า</th>
                      <th className="px-6 py-4 font-semibold text-center">ประเภท</th>
                      <th className="px-6 py-4 font-semibold text-center">ค่าเช่า</th>
                      <th className="px-6 py-4 font-semibold text-center">แจ้งออก</th>
                      <th className="px-6 py-4 font-semibold text-right">ค้างชำระ</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-gray-100">
                    {rooms.map((room) => (
                      <tr 
                        key={room.id} 
                        // เพิ่มฟังก์ชัน onClick ตรงนี้เพื่อให้กดได้ทั้งแถว
                        onClick={() => navigate(`/manage/${dormitoryId}/room/${room.id}`)}
                        // เพิ่ม cursor-pointer ให้เมาส์เปลี่ยนเป็นรูปมือ
                        className="hover:bg-emerald-50 cursor-pointer transition-colors duration-150 group"
                      >
                        {/* ปรับให้เลขห้องเป็นสีเขียวเวลา hover ทั้งแถว */}
                        <td className="px-6 py-4 font-bold text-gray-700 text-center group-hover:text-emerald-700">
                          {room.room_number || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-cyan-50 text-cyan-600 border border-cyan-100 px-3 py-1 rounded-full text-xs font-bold inline-block min-w-[60px]">
                            {statusMap[room.status] || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-400">
                          {
                            (() => {
                              const t = tenants.find(x => x.room_id === room.id)
                              return t?.first_name && t?.last_name
                                ? `${t.first_name} ${t.last_name}`
                                : '-'
                            })()
                          }
                        </td>
                        <td className="px-6 py-4 text-center text-gray-400">รายเดือน</td>
                        <td className="px-6 py-4 text-center text-gray-400">
                          {
                            (() => {
                              const c = contract.find(x => x.room_id === room.id)
                              return c?.rent_price ?? '-'
                            })()
                          }
                        </td>
                        <td className="px-6 py-4 text-center text-gray-400">
                          {
                            (() => {
                              const c = contract.find(x => x.room_id === room.id)
                              return c?.check_out_date ?? '-'
                            })()
                          }
                        </td>
                        
                        <td className="px-6 py-4 text-right text-red-500">ค้างชำระ</td>
                          
                          <Link 
                            to={`/manage/${dormitoryId}/room/${room.id}`}
                            className="text-gray-500 hover:text-emerald-600 underline text-xs font-medium transition-colors"
                            onClick={(e) => e.stopPropagation()} // ป้องกันไม่ให้ Event การคลิกซ้อนทับกัน
                          >
                            
                          </Link>                       
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>

        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}