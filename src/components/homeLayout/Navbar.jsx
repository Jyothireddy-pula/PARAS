import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { close, logo, menu } from "../../assets";
import { navLinks } from "../../constants";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/authentication/authUserSlice";
import { FaSignOutAlt } from "react-icons/fa";
import { signOut } from "../../services/supabase";
import { motion, AnimatePresence } from "framer-motion";
import MobileNavbar from "./MobileNavbar";

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    try {
      await signOut(); // Call Supabase signOut
      dispatch(logout()); // Dispatch Redux action
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavClick = () => {
    // Close mobile menu when any element is clicked
    if (window.innerWidth < 1024) {
      setToggle(false);
    }
  };

  return (
    <>
      {/* Mobile Navbar */}
      <MobileNavbar />
      
      {/* Desktop Navbar */}
      <motion.nav 
        className="w-full hidden md:flex py-4 justify-between items-center shadow-lg bg-slate-800 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link to="/">
          <img src={logo} alt="ParkEase" className="w-[40px] ml-6" />
        </Link>
      </motion.div>

      {/* Main Navigation Links */}
      <ul className="list-none lg:flex hidden items-center flex-1 ml-10">
        {navLinks.map((nav, index) => (
          <motion.li
            key={nav.id}
            className={`font-poppins font-normal cursor-pointer text-[16px] ${
              index === navLinks.length - 1 ? "mr-0" : "mr-10"
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <NavLink
              to={nav.url}
              className={({ isActive }) =>
                isActive
                  ? "text-white font-poppins font-bold px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md transition-all duration-300 shadow-lg"
                  : "text-gray-300 hover:text-white transition-colors duration-300 hover:bg-white/10 px-4 py-2 rounded-md"
              }
            >
              {nav.title}
            </NavLink>
          </motion.li>
        ))}
      </ul>

      {/* Auth Section */}
      <motion.div 
        className="hidden lg:flex items-center mr-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {user ? (
          <div className="flex items-center gap-x-6">
            <motion.span 
              className="text-gray-300 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              Hello! {user.name}
            </motion.span>
            <motion.button
              onClick={handleLogout}
              className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaSignOutAlt size={24} />
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-x-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/login"
                className="text-gray-300 bg-white/10 hover:text-white px-4 py-2 rounded-md transition-all duration-300 backdrop-blur-sm hover:bg-white/20"
              >
                Sign in
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
              >
                Create Account
              </Link>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Mobile Menu */}
      <div className="lg:hidden flex flex-1 justify-end items-center mr-6">
        <motion.img
          src={toggle ? close : menu}
          alt="menu"
          className="w-[28px] h-[28px] object-contain filter invert cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setToggle((prev) => !prev);
          }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: toggle ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        <AnimatePresence>
          {toggle && (
            <motion.div
              className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 absolute top-20 right-0 mx-4 my-2 min-w-[200px] rounded-xl shadow-2xl z-50 backdrop-blur-sm border border-white/10"
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.3 }}
              onClick={handleNavClick}
            >
              <ul className="list-none flex flex-col justify-end items-center flex-1">
                {navLinks.map((nav, index) => (
                  <motion.li
                    key={nav.id}
                    className="font-poppins font-normal cursor-pointer text-[16px] mb-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <NavLink
                      to={nav.url}
                      className={({ isActive }) =>
                        isActive
                          ? "text-white font-poppins font-bold px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md transition-all duration-300"
                          : "text-gray-300 hover:text-white transition-colors duration-300 hover:bg-white/10 px-4 py-2 rounded-md"
                      }
                    >
                      {nav.title}
                    </NavLink>
                  </motion.li>
                ))}
                {/* Mobile Auth Links */}
                {user ? (
                  <>
                    <motion.li 
                      className="text-gray-300 mb-4 bg-white/10 px-4 py-2 rounded-full"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      Hello, {user.name}
                    </motion.li>
                    <motion.li
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <button
                        onClick={handleLogout}
                        className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                      >
                        <FaSignOutAlt size={24} />
                      </button>
                    </motion.li>
                  </>
                ) : (
                  <>
                    <motion.li 
                      className="mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <Link
                        to="/login"
                        className="text-gray-300 hover:text-white transition-colors duration-300 hover:bg-white/10 px-4 py-2 rounded-md"
                      >
                        Sign in
                      </Link>
                    </motion.li>
                    <motion.li
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <Link
                        to="/register"
                        className="text-gray-300 hover:text-white transition-colors duration-300 hover:bg-white/10 px-4 py-2 rounded-md"
                      >
                        Create Account
                      </Link>
                    </motion.li>
                  </>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
    </>
  );
};

export default Navbar;
