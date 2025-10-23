import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { 
  HiOutlineHome, 
  HiOutlineDocumentText, 
  HiOutlineChartBar, 
  HiOutlineCog,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineMenuAlt3,
  HiOutlineShieldCheck
} from 'react-icons/hi';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isSidebarOpen } = useAppSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const sidebarItems = [
    {
      name: 'Dashboard',
      icon: HiOutlineHome,
      href: '/dashboard',
    },
    {
      name: 'Files',
      icon: HiOutlineDocumentText,
      href: '/files',
    },
    {
      name: 'Charts',
      icon: HiOutlineChartBar,
      href: '/charts',
    },
    {
      name: 'Profile',
      icon: HiOutlineUser,
      href: '/profile',
    },
    {
      name: 'Settings',
      icon: HiOutlineCog,
      href: '/settings',
    },
    ...(user?.role === 'admin' ? [{
      name: 'Admin',
      icon: HiOutlineShieldCheck,
      href: '/admin',
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <HiOutlineChartBar className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <span className="ml-3 text-xl font-bold text-gray-900">
                Excel Visualizer
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
                      window.location.pathname === item.href
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {isSidebarOpen && (
                      <span className="ml-3 font-medium">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <HiOutlineUser className="w-5 h-5 text-gray-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <HiOutlineLogout className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <HiOutlineMenuAlt3 className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="ml-4 text-2xl font-semibold text-gray-900">
                {/* Dynamic title based on route */}
                {window.location.pathname === '/dashboard' && 'Dashboard'}
                {window.location.pathname === '/files' && 'Files'}
                {window.location.pathname === '/files/upload' && 'Upload File'}
                {window.location.pathname === '/charts' && 'Charts'}
                {window.location.pathname === '/charts/create' && 'Create Chart'}
                {window.location.pathname === '/profile' && 'Profile'}
                {window.location.pathname === '/settings' && 'Settings'}
                {window.location.pathname === '/admin' && 'Admin Dashboard'}
              </h1>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <Link
                to="/files/upload"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload File
              </Link>
              <Link
                to="/charts/create"
                className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Create Chart
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;