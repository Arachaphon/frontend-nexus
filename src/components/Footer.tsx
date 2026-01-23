import { faFacebook, faLine } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Footer = () => {
  return (
    <footer className="bg-yellow-200 text-gray-800 py-10 mt-auto">
      <div className="container mx-auto px-6 max-w-6xl">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-end items-end mb-2">
          <div className="text-right">
            <h2 className="font-bold text-lg md:text-xl text-black">TheNexus Dormitory Management System</h2>
            <h3 className="font-bold text-base md:text-lg text-black">ระบบบริหารจัดการหอพัก</h3>
          </div>
        </div>

        <hr className="border-gray-500 mb-8" />

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Logo Column */}
          <div className="flex items-start justify-center md:justify-start">
            <img 
              src="/logo.png" 
              alt="The Nexus Logo" 
              className="w-48 h-auto object-contain" 
            />
          </div>

          {/* Description Column */}
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-lg text-black">TheNexus Dormitory</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              บริหารหอพักและอพาร์ตเมนต์ได้ง่ายขึ้น<br/>
              ลดความผิดพลาดและประหยัดเวลา<br/>
              เพื่อให้คุณมีเวลาโฟกัสกับการพัฒนาธุรกิจ<br/>
              และการเติบโตอย่างยั่งยืน
            </p>
          </div>

          {/* Contact Column - FIXED ALIGNMENT */}
          <div className="flex flex-col gap-2 pl-0 md:pl-8">
            <h4 className="font-bold text-lg text-black">ช่องทางการติดต่อ</h4>
            <ul className="space-y-3 text-sm font-medium text-gray-800">
              
              {/* Phone */}
              <li className="flex items-center gap-3">
                {/* ใช้ w-8 เพื่อจองพื้นที่แนวนอนให้เท่ากันทุกไอคอน */}
                <div className="w-8 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-5 h-5 fill-current text-black">
                    <path d="M224.2 89C216.3 70.1 195.7 60.1 176.1 65.4L170.6 66.9C106 84.5 50.8 147.1 66.9 223.3C104 398.3 241.7 536 416.7 573.1C493 589.3 555.5 534 573.1 469.4L574.6 463.9C580 444.2 569.9 423.6 551.1 415.8L453.8 375.3C437.3 368.4 418.2 373.2 406.8 387.1L368.2 434.3C297.9 399.4 241.3 341 208.8 269.3L253 233.3C266.9 222 271.6 202.9 264.8 186.3L224.2 89z"/>
                  </svg>
                </div>
                <span>012-345-6789</span>
              </li>

              {/* Email */}
              <li className="flex items-center gap-3">
                <div className="w-8 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-5 h-5 fill-current text-black">
                    <path d="M64 416L64 192C64 139 107 96 160 96L480 96C533 96 576 139 576 192L576 416C576 469 533 512 480 512L360 512C354.8 512 349.8 513.7 345.6 516.8L230.4 603.2C226.2 606.3 221.2 608 216 608C202.7 608 192 597.3 192 584L192 512L160 512C107 512 64 469 64 416z"/>
                  </svg>
                </div>
                <span>TheNexus@TheNexus.com</span>
              </li>

              {/* Facebook */}
              <li className="flex items-center gap-3">
                <div className="w-8 flex justify-center">
                  <FontAwesomeIcon icon={faFacebook} className="text-xl text-black" />
                </div>
                <span>TheNexus</span>
              </li>

              {/* Line */}
              <li className="flex items-center gap-3">
                <div className="w-8 flex justify-center">
                  <FontAwesomeIcon icon={faLine} className="text-xl text-black" />
                </div>
                <span>TheNexus</span>
              </li>

            </ul>
          </div>
        </div>

        {/* Footer Bottom Links */}
        <div className="mt-10 pt-4 border-t border-gray-400 flex justify-center md:justify-end gap-4 text-xs font-semibold text-gray-700">
          <a href="#" className="hover:underline">Terms Condition</a>
          <span>|</span>
          <a href="#" className="hover:underline">Privacy Policy</a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;