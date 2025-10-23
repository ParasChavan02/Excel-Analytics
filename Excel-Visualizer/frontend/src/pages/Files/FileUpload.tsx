import React, { useState } from 'react';

const FileUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="display-6 fw-bold text-dark mb-2">Upload Excel File</h1>
          <p className="text-muted">
            Upload your Excel files to create visualizations
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-md-8 col-lg-6 mx-auto">
          <div className="card">
            <div className="card-body">
              <div
                className={`border-2 border-dashed rounded-3 p-4 text-center ${
                  isDragging ? 'border-primary bg-light' : 'border-secondary'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  // Handle file drop here
                }}
              >
                <div className="py-5">
                  <i className="bi bi-cloud-upload fs-1 text-primary mb-3"></i>
                  <p className="mb-2">Drag and drop your Excel file here</p>
                  <p className="text-muted mb-3">or</p>
                  <label className="btn btn-primary mb-0">
                    Browse Files
                    <input
                      type="file"
                      className="d-none"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => {
                        // Handle file selection here
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;