import { Link } from "react-router-dom";
import styles from "../../style";
import { parking } from "../../assets";
import { GetStarted } from "../index";
import { motion } from "framer-motion";
import FloatingElements from "../ui/FloatingElements";
const Hero = () => {
  return (
    <section
      id="home"
      className={`flex md:flex-row flex-col ${styles.paddingY} relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900`}
    >
      {/* Floating Elements */}
      <FloatingElements />
      
      <motion.div
        className={`flex-1 ${styles.flexStart} flex-col xl:px-0 sm:px-16 px-6 relative z-10`}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex flex-row justify-between items-center w-full">
          <motion.h1 
            className="flex-1 font-poppins font-semibold ss:text-[72px] text-[52px] text-white ss:leading-[100px] leading-[75px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="block">Future of</span>
            <br className="sm:block hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Parking
            </span>
          </motion.h1>
          <motion.div 
            className="ss:flex hidden md:mr-4 mr-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link to="/listbookings">
              <GetStarted />
            </Link>
          </motion.div>
        </div>
        
        <motion.h1 
          className="font-poppins font-semibold ss:text-[68px] text-[52px] text-white ss:leading-[100px] leading-[75px] w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            ParkEase
          </span>
        </motion.h1>
        
        <motion.p 
          className={`${styles.paragraph} max-w-[470px] mt-5 text-gray-300`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          We use advanced technology to find the perfect parking spots that fit your needs.
        </motion.p>
      </motion.div>
      
      <motion.div
        className={`flex flex-1 ${styles.flexCenter} md:my-0 my-10 relative`}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <motion.img
          src={parking}
          alt="parking"
          className="w-[100%] h-[100%] relative z-[5] p-2 rounded-3xl"
          whileHover={{ scale: 1.05, rotate: 2 }}
          transition={{ duration: 0.3 }}
        />

        {/* Animated gradient backgrounds */}
        <motion.div 
          className="absolute z-[0] w-[40%] h-[35%] top-0 pink__gradient rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute z-[1] w-[80%] h-[80%] rounded-full bottom-30 white__gradient"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute z-[0] w-[50%] h-[50%] right-20 bottom-20 blue__gradient rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </motion.div>

      <motion.div 
        className={`ss:hidden ${styles.flexCenter}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <Link to="/listbookings">
          <GetStarted />
        </Link>
      </motion.div>
    </section>
  );
};

export default Hero;
