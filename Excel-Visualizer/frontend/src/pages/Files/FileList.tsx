import React from 'react';

const FileList: React.FC = () => {
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="display-6 fw-bold text-dark mb-2">My Files</h1>
          <p className="text-muted">
            Manage your uploaded Excel files
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>File Name</th>
                      <th className="d-none d-md-table-cell">Upload Date</th>
                      <th className="d-none d-lg-table-cell">Size</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">
                        File list component - Coming soon!
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileList;