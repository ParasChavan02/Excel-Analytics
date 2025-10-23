import React from 'react';

const ChartList: React.FC = () => {
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="display-6 fw-bold text-dark mb-2">My Charts</h1>
          <p className="text-muted">
            View and manage your created charts
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* Chart Grid - Will be populated with actual charts */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                <div className="text-center">
                  <i className="bi bi-bar-chart fs-1 text-primary mb-3"></i>
                  <p className="text-muted">Chart list component - Coming soon!</p>
                </div>
              </div>
            </div>
            <div className="card-footer bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Sample Chart</span>
                <div className="btn-group">
                  <button className="btn btn-sm btn-outline-primary">Edit</button>
                  <button className="btn btn-sm btn-outline-danger">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartList;