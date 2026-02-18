import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Building2, 
  UserPlus,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className="flex items-center text-green-500 text-sm font-medium bg-green-50 px-2 py-1 rounded-lg">
          <TrendingUp size={14} className="mr-1" />
          {trend}
        </div>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: 0,
    newHires: 12 // Mock data for now
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const [empRes, deptRes] = await Promise.allSettled([
          api.get('/api/hr/employees'),
          api.get('/api/hr/departments')
        ]);
        
        const employees = empRes.status === 'fulfilled' ? (empRes.value?.data?.data || []) : [];
        const departments = deptRes.status === 'fulfilled' ? (deptRes.value?.data?.data || []) : [];
        
        if (empRes.status === 'rejected' && deptRes.status === 'rejected') {
          throw new Error('Failed to fetch dashboard data');
        }

        setStats({
          totalEmployees: Array.isArray(employees) ? employees.length : 0,
          activeEmployees: Array.isArray(employees) ? employees.filter(e => e?.employmentStatus === 'ACTIVE').length : 0,
          departments: Array.isArray(departments) ? departments.length : 0,
          newHires: 12
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Unable to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
        <p className="text-orange-600 font-medium mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-sm text-gray-400 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Employees" 
          value={loading ? '...' : stats.totalEmployees} 
          icon={Users} 
          color="bg-blue-500"
          trend="+5.2%"
        />
        <StatCard 
          title="Active Employees" 
          value={loading ? '...' : stats.activeEmployees} 
          icon={UserCheck} 
          color="bg-green-500"
          trend="+3.1%"
        />
        <StatCard 
          title="Departments" 
          value={loading ? '...' : stats.departments} 
          icon={Building2} 
          color="bg-purple-500"
        />
        <StatCard 
          title="New Hires" 
          value={stats.newHires} 
          icon={UserPlus} 
          color="bg-orange-500"
          trend="+12%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity or Quick Links can go here */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Employee Growth</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
              View Report <ArrowUpRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-400">Employee growth chart visualization placeholder</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <UserPlus size={18} />
                </div>
                <span className="font-medium text-gray-700">Add New Employee</span>
              </div>
              <ArrowUpRight size={18} className="text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <Building2 size={18} />
                </div>
                <span className="font-medium text-gray-700">Create Department</span>
              </div>
              <ArrowUpRight size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

