import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaSignOutAlt, FaMapMarkerAlt } from "react-icons/fa";
import { navLinks } from "../../constants";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/authentication/authUserSlice";
import { signOut } from "../../services/supabase";

const MobileNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(); // Call Supabase signOut
      dispatch(logout()); // Dispatch Redux action
      navigate('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile Navbar */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-white/20 md:hidden"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <motion.button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FaMapMarkerAlt className="text-white text-sm" />
            </div>
            <span className="text-lg font-bold text-gray-800">PARAS</span>
          </motion.button>

          {/* Menu Button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? (
              <FaTimes className="text-gray-700 text-lg" />
            ) : (
              <FaBars className="text-gray-700 text-lg" />
            )}
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              className="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl z-50"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Menu Header */}
              <div className="p-6 border-b border-gray-200">
                <motion.button 
                  onClick={() => {
                    navigate('/');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity w-full text-left"
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <FaMapMarkerAlt className="text-white text-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">PARAS</h2>
                    <p className="text-sm text-gray-600">Smart Parking</p>
                  </div>
                </motion.button>
              </div>

              {/* Menu Items */}
              <div className="p-4 space-y-2">
                {navLinks.map((nav, index) => (
                  <motion.button
                    key={nav.id}
                    onClick={() => {
                      navigate(nav.url);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors text-left"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-lg font-bold">
                        {nav.title.charAt(0)}
                      </span>
                    </div>
                    <span className="text-gray-800 font-medium">{nav.title}</span>
                  </motion.button>
                ))}
              </div>

              {/* Menu Footer - Auth Section */}
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
                {user ? (
                  <div className="space-y-3">
                    <motion.div
                      className="text-center text-gray-600 bg-gray-50 px-4 py-2 rounded-lg"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      Hello, {user.name}
                    </motion.div>
                    <motion.button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <FaSignOutAlt className="text-red-600" />
                      <span className="text-red-600 font-medium">Sign Out</span>
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <motion.button
                      onClick={() => {
                        navigate('/login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <span className="text-gray-600 font-medium">Sign In</span>
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        navigate('/register');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-colors"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <span className="text-white font-medium">Create Account</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavbar;
