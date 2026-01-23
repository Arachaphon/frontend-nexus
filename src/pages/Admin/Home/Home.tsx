import { useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

const Home = () => {
  const [currentPage, setCurrentPage] = useState('หน้าแรก');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white font-sans">
      

      <div className="fixed top-0 left-0 w-full z-50"> 
        <Navbar onMenuClick={(page) => setCurrentPage(page)} />
      </div>
      

      <main className="flex-grow w-full mt-40 md:mt-48 pb-10"> 
          
          {currentPage === 'หน้าแรก' && (
            <div className="flex flex-col gap-16"> 

                <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pt-10">
                    <div className="relative w-full h-[600px] md:h-[800px] rounded-[3rem] overflow-hidden border-8 border-[#003628] shadow-2xl animate-fade-in">
                        <img 
                            src="/home.jpg" 
                            alt="Dormitory Building" 
                            className="absolute inset-0 w-full h-full object-cover"
                        />

                        <div className="relative z-10 w-full h-full grid grid-cols-1 md:grid-cols-2 pointer-events-none">
                            <div className="h-full flex flex-col justify-center px-6 md:px-12 py-8 pointer-events-auto">
                                <div className="bg-black/40 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-xl">
                                    <h2 className="text-xl md:text-3xl text-white font-semibold mb-2">
                                        TheNexus Dormitory Management System
                                    </h2>
                                    <h1 className="text-2xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                        ระบบ บริหารจัดการหอพัก
                                    </h1>
                                    <p className="text-gray-200 text-sm md:text-base leading-relaxed mb-8 font-light">
                                        The Nexus - ระบบบริหารจัดการหอพักแบบครบวงจร 
                                        ช่วยให้คุณบริหาร “ธุรกิจหอพัก” ได้อย่างมืออาชีพ
                                    </p>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-[#fbbf24] rounded-full p-1 flex items-center justify-center w-6 h-6 shadow-md flex-shrink-0">
                                                <svg className="w-3 h-3 fill-black font-bold" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                                            </span>
                                            <span className="text-white text-base font-medium drop-shadow-md">ดูภาพรวมข้อมูลภาพรวมหอพัก</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="bg-[#fbbf24] rounded-full p-1 flex items-center justify-center w-6 h-6 shadow-md flex-shrink-0">
                                                <svg className="w-3 h-3 fill-black font-bold" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                                            </span>
                                            <span className="text-white text-base font-medium drop-shadow-md">สร้างใบแจ้งหนี้รายเดือน</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative h-full flex flex-col justify-center px-6 md:px-12 py-8 pointer-events-auto">
                                <div className="bg-black/40 backdrop-blur-sm p-8 md:p-10 rounded-2xl text-white shadow-lg w-full max-w-xl">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <span className="bg-[#fbbf24] rounded-full p-1 flex items-center justify-center w-6 h-6 flex-shrink-0">
                                                <svg className="w-3 h-3 fill-black" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                                            </span>
                                            <span className="text-base font-medium">จัดการผังห้อง จำนวนชั้น พร้อมสถานะการเช่า</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="bg-[#fbbf24] rounded-full p-1 flex items-center justify-center w-6 h-6 flex-shrink-0">
                                                <svg className="w-3 h-3 fill-black" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                                            </span>
                                            <span className="text-base font-medium">สร้างใบจดมิเตอร์ค่าน้ำ-ค่าไฟ</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-8 right-8 flex flex-col gap-3">
                                    <a href="#" className="bg-white p-2 rounded-full shadow-lg hover:scale-110 transition w-11 h-11 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-8 h-8"><path fill="#07c559" d="M375 260.8L375 342.1C375 344.2 373.4 345.8 371.3 345.8L358.3 345.8C357 345.8 355.9 345.1 355.3 344.3L318 294L318 342.2C318 344.3 316.4 345.9 314.3 345.9L301.3 345.9C299.2 345.9 297.6 344.3 297.6 342.2L297.6 260.9C297.6 258.8 299.2 257.2 301.3 257.2L314.2 257.2C315.3 257.2 316.6 257.8 317.2 258.8L354.5 309.1L354.5 260.9C354.5 258.8 356.1 257.2 358.2 257.2L371.2 257.2C373.3 257.1 375 258.8 375 260.7L375 260.8zM281.3 257.1L268.3 257.1C266.2 257.1 264.6 258.7 264.6 260.8L264.6 342.1C264.6 344.2 266.2 345.8 268.3 345.8L281.3 345.8C283.4 345.8 285 344.2 285 342.1L285 260.8C285 258.9 283.4 257.1 281.3 257.1zM249.9 325.2L214.3 325.2L214.3 260.8C214.3 258.7 212.7 257.1 210.6 257.1L197.6 257.1C195.5 257.1 193.9 258.7 193.9 260.8L193.9 342.1C193.9 343.1 194.2 343.9 194.9 344.6C195.6 345.2 196.4 345.6 197.4 345.6L249.6 345.6C251.7 345.6 253.3 344 253.3 341.9L253.3 328.9C253.3 327 251.7 325.2 249.8 325.2L249.9 325.2zM443.6 257.1L391.3 257.1C389.4 257.1 387.6 258.7 387.6 260.8L387.6 342.1C387.6 344 389.2 345.8 391.3 345.8L443.5 345.8C445.6 345.8 447.2 344.2 447.2 342.1L447.2 329C447.2 326.9 445.6 325.3 443.5 325.3L408 325.3L408 311.7L443.5 311.7C445.6 311.7 447.2 310.1 447.2 308L447.2 294.9C447.2 292.8 445.6 291.2 443.5 291.2L408 291.2L408 277.5L443.5 277.5C445.6 277.5 447.2 275.9 447.2 273.8L447.2 260.8C447.1 258.9 445.5 257.1 443.5 257.1L443.6 257.1zM576 157.4L576 483.4C575.9 534.6 533.9 576.1 482.6 576L156.6 576C105.4 575.9 63.9 533.8 64 482.6L64 156.6C64.1 105.4 106.2 63.9 157.4 64L483.4 64C534.6 64.1 576.1 106.1 576 157.4zM505.6 297.5C505.6 214.1 421.9 146.2 319.2 146.2C216.5 146.2 132.8 214.1 132.8 297.5C132.8 372.2 199.1 434.9 288.7 446.8C310.5 451.5 308 459.5 303.1 488.9C302.3 493.6 299.3 507.3 319.2 499C339.1 490.7 426.5 435.8 465.7 390.8C492.7 361.1 505.6 331 505.6 297.7L505.6 297.5z"/></svg>
                                    </a>
                                    <a href="#" className="bg-white p-2 rounded-full shadow-lg hover:scale-110 transition w-11 h-11 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-[#1877F2] fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <section className="w-full bg-[#003628] py-20 text-white">
                    <div className="max-w-[1600px] mx-auto px-8 md:px-16">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-medium mb-4">4 ขั้นตอน</h2>
                            <p className="text-2xl md:text-3xl font-light">การใช้การบริหารหอพัก ได้อย่างมืออาชีพ</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center relative">
                            
                            <div className="flex flex-col items-center gap-4 z-10">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#003628] text-2xl font-bold shadow-lg mb-2">
                                    1
                                </div>
                                <h3 className="text-xl font-semibold">ขั้นตอน-1</h3>
                                <h4 className="text-lg font-medium mb-2">ผู้เช่าลงทะเบียนห้องพัก</h4>
                                <p className="text-gray-300 text-sm leading-relaxed px-4">
                                    ระบบบริหารจัดการอพาร์ตเมนต์แบบครบวงจร ช่วยให้คุณบริหาร "ธุรกิจหอพักและอพาร์ตเมนต์" ได้อย่างมืออาชีพ
                                </p>
                            </div>

                            
                            <div className="flex flex-col items-center gap-4 z-10">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#003628] text-2xl font-bold shadow-lg mb-2">
                                    2
                                </div>
                                <h3 className="text-xl font-semibold">ขั้นตอน-2</h3>
                                <h4 className="text-lg font-medium mb-2">ออกบิลค่าน้ำ-ไฟอัตโนมัติ</h4>
                                <p className="text-gray-300 text-sm leading-relaxed px-4">
                                    ระบบบริหารจัดการหอพักแบบครบวงจร ช่วยให้คุณบริหาร "ธุรกิจหอพัก" ได้อย่างมืออาชีพ
                                </p>
                            </div>

                            
                            <div className="flex flex-col items-center gap-4 z-10">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#003628] text-2xl font-bold shadow-lg mb-2">
                                    3
                                </div>
                                <h3 className="text-xl font-semibold">ขั้นตอน-3</h3>
                                <h4 className="text-lg font-medium mb-2">ผู้เช่าชำระเงินผ่าน QR Code</h4>
                                <p className="text-gray-300 text-sm leading-relaxed px-4">
                                    รองรับการชำระเงินผ่านพร้อมเพย์/แอปธนาคาร ผู้เช่าสแกนจ่ายได้เลย สะดวก ปลอดภัย
                                </p>
                            </div>

                            
                            <div className="flex flex-col items-center gap-4 z-10">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#003628] text-2xl font-bold shadow-lg mb-2">
                                    4
                                </div>
                                <h3 className="text-xl font-semibold">ขั้นตอน-4</h3>
                                <h4 className="text-lg font-medium mb-2">ดูรายงานสรุปยอดรายเดือน</h4>
                                <p className="text-gray-300 text-sm leading-relaxed px-4">
                                    มีแดชบอร์ดให้ดูภาพรวมรายได้ + สถานะผู้เช่า เช็กยอดค้างชำระ รายรับ และรายงานการเงินแบบละเอียด
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section className="w-full bg-white py-24">
                     <div className="max-w-[1600px] mx-auto px-4 md:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            
                            
                            <div className="w-full h-[400px] lg:h-[500px] rounded-[3rem] overflow-hidden shadow-2xl">
                                
                                <img 
                                    src="home1.png" 
                                    alt="Building Exterior" 
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h4 className="text-[#003628] font-bold text-lg mb-2">The Nexus Dormitory Management System</h4>
                                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                                        ระบบ The Nexus เหมาะกับใคร
                                    </h2>
                                </div>

                                <div>
                                     <button className="border-2 border-[#003628] text-[#003628] rounded-full px-8 py-2 font-bold text-lg hover:bg-[#003628] hover:text-white transition duration-300">
                                        บริการหอพัก
                                    </button>
                                </div>

                                <div className="text-gray-600 text-lg leading-relaxed space-y-2 font-medium">
                                    <p>ช่วยจัดการข้อมูลรายเดือนได้ดี</p>
                                    <p>มีพนักงานในการดูแลแต่ละอาคาร ใช้สำหรับเก็บข้อมูลผู้เช่า</p>
                                    <p>ออกบิลค่าน้ำ-ไฟอัตโนมัติ และรับชำระเงินผ่าน QR Code ได้อย่างง่ายดาย</p>
                                    <p>ช่วยลดงานเอกสารและบริหารหอพักได้อย่างมืออาชีพ</p>
                                    <p>แบบครบวงจรใน ระบบเดียว เจ้าของบริหารไม่ปวดหัว</p>
                                </div>
                            </div>

                        </div>
                     </div>
                </section>
            
            </div>
          )}
          {/* ==================== จบส่วนของหน้าแรก ==================== */}
                
            


          {/* ==================== หน้าอื่นๆ ==================== */}
          {/* เพิ่ม Container mx-auto ให้หน้าอื่นๆ ด้วยเพื่อให้เนื้อหาไม่ชิดขอบจอเกินไป */}
          {currentPage === 'ฟีเจอร์' && (
            <div className="w-full max-w-[1600px] mx-auto px-4 p-10 bg-gray-50 rounded-3xl min-h-[500px] text-center">
               <h2 className="text-3xl font-bold text-emerald-800">หน้าฟีเจอร์</h2>
               <p className="mt-4">เนื้อหาเกี่ยวกับฟีเจอร์ต่างๆ จะแสดงที่นี่...</p>
            </div>
          )}

          {currentPage === 'บริการ' && (
             <div className="w-full max-w-[1600px] mx-auto px-4 p-10 bg-gray-50 rounded-3xl min-h-[500px] text-center">
               <h2 className="text-3xl font-bold text-emerald-800">หน้าบริการ</h2>
               <p className="mt-4">เนื้อหาเกี่ยวกับบริการ...</p>
            </div>
          )}
          
          {currentPage === 'คู่มือการใช้งาน' && (
             <div className="w-full max-w-[1600px] mx-auto px-4 p-10 bg-gray-50 rounded-3xl min-h-[500px] text-center">
               <h2 className="text-3xl font-bold text-emerald-800">คู่มือการใช้งาน</h2>
            </div>
          )}
          
          {currentPage === 'บทความ' && (
             <div className="w-full max-w-[1600px] mx-auto px-4 p-10 bg-gray-50 rounded-3xl min-h-[500px] text-center">
               <h2 className="text-3xl font-bold text-emerald-800">บทความ</h2>
            </div>
          )}
          
          {currentPage === 'ติดต่อเรา' && (
             <div className="w-full max-w-[1600px] mx-auto px-4 p-10 bg-gray-50 rounded-3xl min-h-[500px] text-center">
               <h2 className="text-3xl font-bold text-emerald-800">ติดต่อเรา</h2>
            </div>
          )}


      </main>
      <div className="w-full">
         <Footer />
      </div>

    </div>
  );
};

export default Home;