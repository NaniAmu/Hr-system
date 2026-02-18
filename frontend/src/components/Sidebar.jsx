import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout, hasRole, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
    { name: 'Employees', path: '/employees', icon: <Users size={20} />, roles: ['ADMIN', 'HR'] },
    { name: 'Departments', path: '/departments', icon: <Building2 size={20} />, roles: ['ADMIN', 'HR'] },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => {
    const hasAccess = hasRole(item.roles);
    console.log('[SIDEBAR] Checking access for', item.name, '- hasAccess:', hasAccess);
    return hasAccess;
  });

  console.log('[SIDEBAR] User role:', user?.role);
  console.log('[SIDEBAR] Filtered nav items count:', filteredNavItems.length);
  console.log('[SIDEBAR] Filtered nav items:', filteredNavItems.map(i => i.name));

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">HR</div>
          <span>HRMS</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {filteredNavItems.length > 0 ? (
          filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </div>
              <ChevronRight size={16} className="opacity-50" />
            </NavLink>
          ))
        ) : (
          <div className="px-4 py-3 text-slate-500 text-sm">
            <p>No navigation items available for your role.</p>
            {user?.role && (
              <p className="text-xs mt-2 text-slate-600">Role: {user.role}</p>
            )}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
