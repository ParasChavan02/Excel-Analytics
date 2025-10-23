import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineChartBar, HiOutlineUpload, HiOutlineGlobe, HiOutlineShieldCheck } from 'react-icons/hi';

const Home: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transform Excel Data into
              <span className="block text-yellow-300">Beautiful Visualizations</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Upload your Excel files and create stunning 2D and 3D charts with our powerful 
              visualization platform. No coding required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors text-lg"
              >
                Get Started Free
              </Link>
              <Link
                to="/charts/public"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all text-lg"
              >
                View Examples
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to visualize your data and share insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineUpload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Upload</h3>
              <p className="text-gray-600">
                Drag and drop your Excel files (.xls, .xlsx) and we'll handle the rest
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineChartBar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Charts</h3>
              <p className="text-gray-600">
                Create bar, line, pie, scatter plots and more with dynamic data mapping
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineGlobe className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3D Visualizations</h3>
              <p className="text-gray-600">
                Stunning 3D charts and surface plots powered by Three.js
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineShieldCheck className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your data is encrypted and secure. Share publicly or keep it private
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-semibold mb-4">Upload Your Data</h3>
              <p className="text-gray-600 text-lg">
                Upload your Excel file and our system will automatically parse and analyze your data structure
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-semibold mb-4">Choose Visualization</h3>
              <p className="text-gray-600 text-lg">
                Select chart type, map your X and Y axes, and customize colors and styling options
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-semibold mb-4">Share & Export</h3>
              <p className="text-gray-600 text-lg">
                Export your charts as PNG, PDF, or share them publicly with a custom link
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Visualize Your Data?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already creating beautiful data visualizations with Excel Visualizer
          </p>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg inline-block"
          >
            Start Creating Charts
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;