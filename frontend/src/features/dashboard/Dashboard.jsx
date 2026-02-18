import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '../../app/axios';

const StatCard = ({ title, value, icon, change, isPositive, colorClass = 'bg-blue-50 text-blue-600' }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        {icon}
      </div>
      {change && (
        <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
          {isPositive ? <ArrowUpRight size={16} className="ml-0.5" /> : <ArrowDownRight size={16} className="ml-0.5" />}
        </div>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departmentsCount: 0,
    ticketsCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Log API configuration
        console.log('[DASHBOARD] API Configuration:');
        console.log('[DASHBOARD] Base URL:', api.defaults.baseURL);
        console.log('[DASHBOARD] Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
        console.log('[DASHBOARD] Authorization Header:', api.defaults.headers.common['Authorization'] ? 'Set' : 'Not Set');

        // Check if token exists
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('[DASHBOARD] No token found in localStorage');
          setError('Authentication required. Please log in.');
          window.location.href = '/login';
          return;
        }

        // Fetch employees
        console.log('[DASHBOARD] Fetching employees from:', api.defaults.baseURL + '/employees');
        const empRes = await api.get('/employees');
        console.log('[DASHBOARD] Employees response status:', empRes.status);
        console.log('[DASHBOARD] Employees response data:', empRes.data);

        // Fetch departments
        console.log('[DASHBOARD] Fetching departments from:', api.defaults.baseURL + '/departments');
        const deptRes = await api.get('/departments');
        console.log('[DASHBOARD] Departments response status:', deptRes.status);
        console.log('[DASHBOARD] Departments response data:', deptRes.data);

        // Extract data safely
        const employees = Array.isArray(empRes.data) ? empRes.data : empRes.data?.data || [];
        const departments = Array.isArray(deptRes.data) ? deptRes.data : deptRes.data?.data || [];

        console.log('[DASHBOARD] Extracted employees count:', employees.length);
        console.log('[DASHBOARD] Extracted departments count:', departments.length);

        setStats({
          totalEmployees: employees.length,
          activeEmployees: employees.filter(e => e.status === 'Active' || e.employmentStatus === 'ACTIVE').length,
          departmentsCount: departments.length,
          ticketsCount: 12 // Placeholder for future integration
        });
        setError(null);
        console.log('[DASHBOARD] Stats updated successfully');
      } catch (err) {
        console.error('[DASHBOARD] API ERROR:', err.response?.status, err.response?.data);
        console.error('[DASHBOARD] Full error object:', err);
        console.error('[DASHBOARD] Error message:', err.message);
        console.error('[DASHBOARD] Error config:', err.config);

        // Handle specific error cases
        if (err.response?.status === 401) {
          console.error('[DASHBOARD] Unauthorized (401) - clearing token and redirecting to login');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }

        if (err.response?.status === 403) {
          console.error('[DASHBOARD] Forbidden (403) - access denied');
          setError('Access denied. You do not have permission to view this data.');
          return;
        }

        if (err.response?.status === 500) {
          console.error('[DASHBOARD] Server error (500):', err.response?.data?.message);
          setError(`Server error: ${err.response?.data?.message || 'Internal server error'}`);
          return;
        }

        if (err.response?.status === 404) {
          console.error('[DASHBOARD] Not found (404)');
          setError('API endpoint not found. Please check server configuration.');
          return;
        }

        if (!err.response) {
          console.error('[DASHBOARD] Network error - no response from server');
          setError('Network error. Please check your connection and ensure the server is running.');
          return;
        }

        setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again later.');
        
        // Fallback for demo purposes if backend isn't ready
        console.log('[DASHBOARD] Using fallback demo data');
        setStats({
          totalEmployees: 156,
          activeEmployees: 142,
          departmentsCount: 8,
          ticketsCount: 12
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-gray-600 font-medium">Live System Status</span>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md flex items-center gap-3">
          <AlertCircle className="text-amber-500" size={20} />
          <p className="text-amber-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Employees" 
          value={stats.totalEmployees} 
          icon={<Users size={24} />} 
          change="+12%" 
          isPositive={true}
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title="Active Employees" 
          value={stats.activeEmployees} 
          icon={<Users size={24} />} 
          change="+8%" 
          isPositive={true}
          colorClass="bg-green-50 text-green-600"
        />
        <StatCard 
          title="Departments" 
          value={stats.departmentsCount} 
          icon={<Building2 size={24} />} 
          colorClass="bg-purple-50 text-purple-600"
        />
        <StatCard 
          title="Open Tickets" 
          value={stats.ticketsCount} 
          icon={<TrendingUp size={24} />} 
          change="-4%" 
          isPositive={true}
          colorClass="bg-orange-50 text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Employee Hires</h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    S
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Sarah Jenkins</p>
                    <p className="text-xs text-gray-500">Engineering • Joined 2h ago</p>
                  </div>
                </div>
                <div className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                  New
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Department Distribution</h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Detailed Report</button>
          </div>
          <div className="space-y-5">
            {[
              { name: 'Engineering', count: 42, color: 'bg-blue-500' },
              { name: 'Product', count: 18, color: 'bg-purple-500' },
              { name: 'Design', count: 12, color: 'bg-pink-500' },
              { name: 'HR', count: 8, color: 'bg-green-500' }
            ].map((dept) => (
              <div key={dept.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600 font-medium">{dept.name}</span>
                  <span className="text-gray-900 font-bold">{dept.count}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`${dept.color} h-2 rounded-full`} style={{ width: `${dept.count}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
