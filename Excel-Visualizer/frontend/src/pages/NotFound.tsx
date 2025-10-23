import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHome } from 'react-icons/hi';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-3xl font-semibold text-gray-900 mt-4 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <HiOutlineHome className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;