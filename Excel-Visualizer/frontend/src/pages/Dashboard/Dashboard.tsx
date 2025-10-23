import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your Excel Visualizer dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Upload Files</h3>
          <p className="mt-2 text-gray-600">Upload Excel files to start creating visualizations</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">My Charts</h3>
          <p className="mt-2 text-gray-600">View and manage your created charts</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
          <p className="mt-2 text-gray-600">View usage statistics and insights</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;