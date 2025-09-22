import { useState, useEffect } from 'react';
// import { fetchCongestionData } from '../services/supabase';
import { fetchCongestionFromML } from '../services/supabase';

import BookingsDashboard from './BookingsDashboard';
import MarkdownIt from 'markdown-it';
import html2pdf from 'html2pdf.js';
import { generateCongestionReport } from '../services/gemini';
import Loader from './loading/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartBar, FaBook, FaDownload, FaFilePdf, FaBars, FaTimes, FaBuilding, FaClock, FaUsers } from 'react-icons/fa';
import FloatingElements from './ui/FloatingElements';
import AnimatedCard from './ui/AnimatedCard';
import ShimmerButton from './ui/ShimmerButton';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const GovDashboard = () => {
  const md = new MarkdownIt();
  const [congestionData, setCongestionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('all');
  const [selectedTab, setSelectedTab] = useState('congestion');
  const [report, setReport] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadCongestionData();
  }, []);

  const loadCongestionData = async () => {
    try {
      setLoading(true);
      // const data = await fetchCongestionData();
      const data = await fetchCongestionFromML({ days: 30, lookback_days: 7 });
      setCongestionData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = congestionData.filter(item => 
    selectedTimePeriod === 'all' || item.time_period === selectedTimePeriod
  );

  const chartData = filteredData.reduce((acc, item) => {
    const existingPark = acc.find(p => p.parking_lot === item.parking_lot);
    if (existingPark) {
      existingPark[item.time_period || 'overall'] = item.congestion_level;
    } else {
      acc.push({
        parking_lot: item.parking_lot,
        [item.time_period || 'overall']: item.congestion_level
      });
    }
    return acc;
  }, []);

  const generateReport = async () => {
    try {
      console.log('Generating report...');
      setIsGeneratingReport(true);
      const reportText = await generateCongestionReport(congestionData);
      console.log('Report generated:', reportText);
      setReport(reportText);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report: ' + err.message);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const downloadReport = async () => {
    console.log('Downloading report...');
    if (!report || typeof report !== 'string') {
      console.error('No report to download');
      return;
    }

    // Create a styled container for the PDF
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 40px; font-family: 'Helvetica', Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <!-- Header with Logo and Title -->
        <div style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0;">
          <h1 style="color: #1a365d; font-size: 28px; margin-bottom: 10px;">
            Smart Parking System
          </h1>
          <h2 style="color: #2c5282; font-size: 24px; margin-bottom: 15px;">
            Parking Congestion Analysis Report
          </h2>
          <p style="color: #718096; font-size: 14px;">
            Generated on: ${new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <!-- Executive Summary Box -->
        <div style="background-color: #f7fafc; border-left: 4px solid #4299e1; padding: 20px; margin-bottom: 30px;">
          <h3 style="color: #2b6cb0; margin: 0 0 10px 0; font-size: 18px;">Executive Summary</h3>
          <div style="color: #4a5568; line-height: 1.6;">
            This report provides a comprehensive analysis of parking congestion patterns across different locations and time periods.
          </div>
        </div>

        <!-- Main Content -->
        <div style="color: #2d3748; line-height: 1.8; font-size: 16px;">
          ${md.render(`
            ## Key Findings
            - **High Congestion**: Several parking lots experience high congestion during peak hours.
            - **Time Period Trends**: Morning and evening periods show the highest congestion levels.
            - **Recommendations**: Implement dynamic pricing and increase parking availability.

            ## Detailed Analysis
            ### Morning Congestion
            - **Parking Lot A**: 80% congestion
            - **Parking Lot B**: 75% congestion

            ### Afternoon Congestion
            - **Parking Lot A**: 60% congestion
            - **Parking Lot B**: 65% congestion

            ### Evening Congestion
            - **Parking Lot A**: 90% congestion
            - **Parking Lot B**: 85% congestion

            ## Recommendations
            1. **Dynamic Pricing**: Adjust pricing based on congestion levels to manage demand.
            2. **Increase Capacity**: Explore options to increase parking capacity in high-demand areas.
            3. **Public Transport Incentives**: Encourage the use of public transport during peak hours.

            > **Note**: This report is generated using AI analysis and should be reviewed for accuracy.
          `)}
        </div>

        <!-- Footer -->
        <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center;">
          <p style="color: #718096; font-size: 12px; margin-bottom: 5px;">
            Generated by Smart Parking System Analytics
          </p>
          <p style="color: #a0aec0; font-size: 10px;">
            Confidential Document • For Internal Use Only
          </p>
        </div>
      </div>
    `;

    // Add custom styles for markdown content
    const style = document.createElement('style');
    style.textContent = `
      h1, h2, h3, h4, h5, h6 {
        color: #2d3748;
        margin-top: 24px;
        margin-bottom: 16px;
      }
      h1 { font-size: 24px; }
      h2 { font-size: 20px; }
      h3 { font-size: 18px; }
      p { margin-bottom: 16px; }
      ul, ol {
        margin-bottom: 16px;
        padding-left: 24px;
      }
      li {
        margin-bottom: 8px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 16px;
      }
      th, td {
        border: 1px solid #e2e8f0;
        padding: 12px;
        text-align: left;
      }
      th {
        background-color: #f7fafc;
        color: #2d3748;
      }
      tr:nth-child(even) {
        background-color: #f7fafc;
      }
      blockquote {
        border-left: 4px solid #4299e1;
        padding-left: 16px;
        margin: 16px 0;
        color: #4a5568;
      }
      code {
        background-color: #f7fafc;
        padding: 2px 4px;
        border-radius: 4px;
        font-family: monospace;
      }
    `;
    element.appendChild(style);
    
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `parking_congestion_report_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'portrait'
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      setIsGeneratingReport(true);
      await html2pdf().set(opt).from(element).save();
      console.log('PDF generated and downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const renderContent = () => {
    if (selectedTab === 'congestion') {
      return (
        <div className="space-y-6">
          {/* Header */}
          <motion.div 
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Parking Congestion Dashboard</h1>
              <p className="text-gray-600">Monitor and analyze parking congestion patterns across the city</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaClock className="text-blue-500" />
              <span>Last updated: {new Date().toLocaleString()}</span>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatedCard>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Parking Lots</p>
                    <p className="text-2xl font-bold text-gray-900">{chartData.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FaBuilding className="text-blue-600 text-xl" />
                  </div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Avg Congestion</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredData.length > 0 
                        ? Math.round(filteredData.reduce((acc, item) => acc + item.congestion_level, 0) / filteredData.length)
                        : 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FaChartBar className="text-green-600 text-xl" />
                  </div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Data Points</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FaUsers className="text-purple-600 text-xl" />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>

          {/* Time Period Filter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AnimatedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Time Period</h3>
                <div className="flex flex-wrap gap-3">
                  {['all', 'morning', 'afternoon', 'evening'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedTimePeriod(period)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        selectedTimePeriod === period
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </AnimatedCard>
          </motion.div>

          {/* Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <AnimatedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Congestion Analysis Chart</h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="parking_lot" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                        fontSize={12}
                        stroke="#6b7280"
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        fontSize={12}
                        stroke="#6b7280"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      {selectedTimePeriod === 'all' && (
                        <>
                          <Bar dataKey="morning" fill="#3b82f6" name="Morning" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="afternoon" fill="#10b981" name="Afternoon" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="evening" fill="#f59e0b" name="Evening" radius={[4, 4, 0, 0]} />
                        </>
                      )}
                      {selectedTimePeriod !== 'all' && (
                        <Bar 
                          dataKey={selectedTimePeriod} 
                          fill="#3b82f6" 
                          name={selectedTimePeriod.charAt(0).toUpperCase() + selectedTimePeriod.slice(1)}
                          radius={[4, 4, 0, 0]}
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>

          {/* Data Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <AnimatedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Data</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        <th className="p-4 text-left font-semibold">Parking Lot</th>
                        <th className="p-4 text-left font-semibold">Time Period</th>
                        <th className="p-4 text-left font-semibold">Congestion Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredData.map((item, index) => (
                        <tr key={index} className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="p-4 font-medium text-gray-900">{item.parking_lot}</td>
                          <td className="p-4 text-gray-700">{item.time_period || 'Overall'}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    item.congestion_level > 80 ? 'bg-red-500' :
                                    item.congestion_level > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${item.congestion_level}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                                {item.congestion_level}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>

          {/* Report Section */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <AnimatedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis Report</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <ShimmerButton
                    onClick={() => generateReport()}
                    disabled={isGeneratingReport}
                    className="flex items-center gap-2"
                  >
                    <FaBook />
                    {isGeneratingReport ? 'Generating Report...' : 'Generate AI Analysis Report'}
                  </ShimmerButton>

                  {report && typeof report === 'string' && (
                    <ShimmerButton
                      onClick={downloadReport}
                      disabled={isGeneratingReport}
                      className="flex items-center gap-2 bg-green-600"
                    >
                      <FaDownload />
                      {isGeneratingReport ? 'Generating PDF...' : 'Download PDF Report'}
                    </ShimmerButton>
                  )}
                </div>

                {/* Report Preview */}
                {report && typeof report === 'string' && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-xl border">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaFilePdf className="text-red-500" />
                      AI Generated Analysis Report
                    </h4>
                    <div 
                      className="prose max-w-none text-gray-700" 
                      dangerouslySetInnerHTML={{ __html: md.render(report) }}
                    />
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">Error: {error}</p>
                  </div>
                )}
              </div>
            </AnimatedCard>
          </motion.div>
        </div>
      );
    } else if (selectedTab === 'bookings') {
      return <BookingsDashboard />;
    }
  };

  if (loading) return <Loader show3D={true} />;
  if (error) return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-xl font-semibold mb-2">Error</div>
        <div className="text-gray-600">{error}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-blue-50 relative overflow-hidden">
      <FloatingElements />
      
      <div className="flex h-screen relative z-10">
        {/* Menu Button - Mobile and Desktop */}
        <motion.button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-20 left-4 z-30 bg-white/90 backdrop-blur-md p-3 rounded-xl text-gray-700 shadow-lg border border-white/20"
          whileTap={{ scale: 0.95 }}
        >
          {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </motion.button>

        {/* Sidebar */}
        <motion.div 
          className={`
            fixed
            w-72 bg-white/90 backdrop-blur-md text-gray-800 p-6 flex-shrink-0
            h-full z-20 shadow-xl border-r border-white/20
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          initial={{ x: -300 }}
          animate={{ x: isMobileMenuOpen ? 0 : -300 }}
          transition={{ duration: 0.3 }}
        >
          {/* Sidebar Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FaChartBar className="text-white text-xl" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Government Dashboard</h1>
            </div>
            <p className="text-gray-600 text-sm">Smart Parking Analytics</p>
          </div>

          <div className="space-y-3">
            <motion.button
              onClick={() => {
                setSelectedTab('congestion');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                selectedTab === 'congestion' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-700'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <FaChartBar className="text-lg" />
              <span className="font-medium">Congestion Dashboard</span>
            </motion.button>

            <motion.button
              onClick={() => {
                setSelectedTab('bookings');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                selectedTab === 'bookings' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-700'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <FaBook className="text-lg" />
              <span className="font-medium">Bookings Dashboard</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Overlay for all screen sizes */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10"
              onClick={() => setIsMobileMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto w-full">
          <motion.div 
            className="bg-white/80 backdrop-blur-md p-6 lg:p-8 rounded-2xl w-full shadow-xl border border-white/20 min-h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GovDashboard;
