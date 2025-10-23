import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineChartBar } from 'react-icons/hi';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <HiOutlineChartBar className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">
                Excel Visualizer
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className="text-gray-900 hover:text-blue-600 font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/charts/public"
                className="text-gray-900 hover:text-blue-600 font-medium transition-colors"
              >
                Public Charts
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <HiOutlineChartBar className="w-5 h-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold">
                  Excel Visualizer
                </span>
              </div>
              <p className="text-gray-300 max-w-md">
                Transform your Excel data into beautiful, interactive charts and visualizations. 
                Upload, analyze, and share your data insights with ease.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/charts/public" className="text-gray-300 hover:text-white transition-colors">
                    Public Charts
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Excel File Upload</li>
                <li>Interactive Charts</li>
                <li>3D Visualizations</li>
                <li>Data Export</li>
                <li>User Dashboard</li>
                <li>Admin Panel</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-300">
              © 2024 Excel Visualizer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;