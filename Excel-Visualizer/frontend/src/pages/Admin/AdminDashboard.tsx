import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          System administration and management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">User Management</h3>
          <p className="mt-2 text-gray-600">Manage user accounts and permissions</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">System Analytics</h3>
          <p className="mt-2 text-gray-600">View system usage and performance</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">File Management</h3>
          <p className="mt-2 text-gray-600">Oversee uploaded files and storage</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;