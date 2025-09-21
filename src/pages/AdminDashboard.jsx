import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Navbar } from "../components";
import { RiDashboardLine, RiMoneyDollarCircleLine, RiParkingBoxLine, RiSettings4Line, RiMenuLine, RiBarChartLine, RiHistoryLine, RiSettingsLine } from 'react-icons/ri';
import { FaChartBar, FaCog, FaUpload, FaBuilding, FaHome, FaUsers, FaChartPie } from 'react-icons/fa';
import UploadParking from "./UploadParking";
import CommercialParkingForm from "./CommercialParkingForm";
import IndividualParkingForm from "./IndividualParkingForm";
import ParkingStatistics from '../components/ParkingStatistics';
import SlotManagement from '../components/SlotManagement';
import BookingHistory from '../components/BookingHistory';
import { motion, AnimatePresence } from "framer-motion";
import FloatingElements from "../components/ui/FloatingElements";
import AnimatedCard from "../components/ui/AnimatedCard";
import ShimmerButton from "../components/ui/ShimmerButton";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeDashboardTab, setActiveDashboardTab] = useState('parking-statistics');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const sidebarLinks = [
    {
      title: "Dashboard",
      icon: <FaChartBar className="text-xl" />,
      id: "dashboard"
    },
    {
      title: "Upload Parking",
      icon: <FaUpload className="text-xl" />,
      id: "upload",
      subLinks: [
        {
          title: "Commercial Parking",
          path: "commercial"
        },
        {
          title: "Individual Parking",
          path: "individual"
        }
      ]
    }
  ];

  const renderDashboardContent = () => {
    switch (activeDashboardTab) {
      case 'parking-statistics':
        return <ParkingStatistics />;
      case 'slot-management':
        return <SlotManagement />;
      case 'booking-history':
        return <BookingHistory />;
      default:
        return <ParkingStatistics />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <FloatingElements />
      
      <div className="flex h-screen relative z-10 pt-16 md:pt-0">
        {/* Sidebar */}
        <motion.div 
          className={`
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            fixed lg:static
            w-72 bg-white/90 backdrop-blur-md text-gray-800 p-6 flex-shrink-0
            transition-transform duration-300 ease-in-out
            h-full z-20 shadow-xl border-r border-white/20
          `}
          onClick={handleSidebarClick}
          initial={{ x: -300 }}
          animate={{ x: isSidebarOpen ? 0 : -300 }}
          transition={{ duration: 0.3 }}
        >
          {/* Sidebar Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FaChartBar className="text-white text-xl" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <p className="text-gray-600 text-sm">Manage your parking system</p>
          </div>

          <div className="space-y-3">
            {sidebarLinks.map((link, index) => (
              <motion.div 
                key={link.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {link.id === "settings" ? (
                  // Settings with logout button
                  <motion.button
                    onClick={() => setActiveTab(link.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300
                      ${activeTab === link.id 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'hover:bg-gray-100 text-gray-700 hover:shadow-md'
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {link.icon}
                    <span className="font-medium">{link.title}</span>
                  </motion.button>
                ) : link.path ? (
                  // External links (like Upload Parking)
                  <Link
                    to={link.path}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300
                      ${activeTab === link.id 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'hover:bg-gray-100 text-gray-700 hover:shadow-md'
                      }`}
                  >
                    {link.icon}
                    <span className="font-medium">{link.title}</span>
                  </Link>
                ) : (
                  // Regular sidebar tabs
                  <motion.button
                    onClick={() => setActiveTab(link.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300
                      ${activeTab === link.id 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'hover:bg-gray-100 text-gray-700 hover:shadow-md'
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {link.icon}
                    <span className="font-medium">{link.title}</span>
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto w-full">
          {/* Toggle Button */}
          <motion.button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="lg:hidden fixed top-20 left-4 z-30 bg-white/90 backdrop-blur-md p-3 rounded-xl text-gray-700 hover:bg-white shadow-lg border border-white/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RiMenuLine size={24} />
          </motion.button>

          {/* Overlay for mobile */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-10"
                onClick={() => setSidebarOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          <motion.div 
            className="bg-white/80 backdrop-blur-md p-8 rounded-2xl w-full shadow-xl border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {activeTab === 'dashboard' && (
              <motion.div 
                className="space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Dashboard Header */}
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <FaChartBar className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-gray-600">Monitor and manage your parking system</p>
                  </div>
                </div>
                
                {/* Dashboard Tabs */}
                <div className="flex flex-wrap gap-4 mb-8">
                  <motion.button 
                    onClick={() => setActiveDashboardTab('parking-statistics')} 
                    className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                      activeDashboardTab === 'parking-statistics' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaChartPie className="text-lg" />
                    <span className="font-medium">Parking Statistics</span>
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => setActiveDashboardTab('slot-management')} 
                    className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                      activeDashboardTab === 'slot-management' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RiParkingBoxLine className="text-lg" />
                    <span className="font-medium">Slot Management</span>
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => setActiveDashboardTab('booking-history')} 
                    className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                      activeDashboardTab === 'booking-history' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RiHistoryLine className="text-lg" />
                    <span className="font-medium">Booking History</span>
                  </motion.button>
                </div>

                {/* Dashboard Content */}
                <AnimatedCard>
                  <div className="p-6">
                    {renderDashboardContent()}
                  </div>
                </AnimatedCard>
              </motion.div>
            )}

             

            {activeTab === 'upload' && (
              <motion.div 
                className="space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Upload Header */}
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                    <FaUpload className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Upload Parking</h2>
                    <p className="text-gray-600">Add new parking spaces to your system</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 w-full max-w-6xl">
                  {/* Commercial Parking Card */}
                  <motion.div 
                    onClick={() => setActiveTab('upload-commercial')}
                    className="group cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{ y: -8 }}
                  >
                    <AnimatedCard className="h-full">
                      <div className="p-8">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <FaBuilding className="text-white text-2xl" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              Commercial Parking
                            </h3>
                            <p className="text-gray-600">IT parks, malls, and business facilities</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-6 leading-relaxed">
                          List your commercial parking space, IT park parking, or mall parking facilities with advanced management features.
                        </p>
                        
                        <div className="space-y-3 mb-8">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-700">Multiple parking slots</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-700">Commercial rates</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-700">Business verification</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-700">Automated management</span>
                          </div>
                        </div>
                        
                        <ShimmerButton className="w-full py-3 text-lg font-semibold">
                          <FaBuilding className="mr-2" />
                          List Commercial Space
                        </ShimmerButton>
                      </div>
                    </AnimatedCard>
                  </motion.div>

                  {/* Individual Parking Card */}
                  <motion.div 
                    onClick={() => setActiveTab('upload-individual')}
                    className="group cursor-pointer"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    whileHover={{ y: -8 }}
                  >
                    <AnimatedCard className="h-full">
                      <div className="p-8">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl flex items-center justify-center">
                            <FaHome className="text-white text-2xl" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              Individual Parking
                            </h3>
                            <p className="text-gray-600">Personal spaces and home parking</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-6 leading-relaxed">
                          List your personal parking space, home parking, or single slot parking with flexible management options.
                        </p>
                        
                        <div className="space-y-3 mb-8">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700">Single parking slot</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700">Flexible availability</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700">Personal verification</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700">Simple management</span>
                          </div>
                        </div>
                        
                        <ShimmerButton className="w-full py-3 text-lg font-semibold">
                          <FaHome className="mr-2" />
                          List Individual Space
                        </ShimmerButton>
                      </div>
                    </AnimatedCard>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'upload-commercial' && (
              <motion.div 
                className="space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <FaBuilding className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Commercial Parking Form</h2>
                    <p className="text-gray-600">Add your commercial parking space</p>
                  </div>
                </div>
                <AnimatedCard>
                  <div className="p-6">
                    <CommercialParkingForm isEmbedded={true} />
                  </div>
                </AnimatedCard>
              </motion.div>
            )}

            {activeTab === 'upload-individual' && (
              <motion.div 
                className="space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl flex items-center justify-center">
                    <FaHome className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Individual Parking Form</h2>
                    <p className="text-gray-600">Add your personal parking space</p>
                  </div>
                </div>
                <AnimatedCard>
                  <div className="p-6">
                    <IndividualParkingForm isEmbedded={true} />
                  </div>
                </AnimatedCard>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 