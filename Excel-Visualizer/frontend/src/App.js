import React, { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/Auth/AuthPage';
import ChartRenderer, { generateSampleChartData } from './components/Charts/ChartRenderer';
import { filesAPI, chartsAPI } from './services/api';

function AppContent() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');

  console.log('App: Current auth state:', { isAuthenticated, user, loading });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Excel Visualizer...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>Excel Visualizer</h1>
            <p>Transform your Excel data into beautiful charts and visualizations</p>
          </div>
          <div className="user-menu">
            <span className="welcome-text">Welcome, {user?.firstName || user?.username}!</span>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </div>
      </header>

      <nav className="tab-navigation">
        <button 
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Excel
        </button>
        <button 
          className={`tab ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          My Charts
        </button>
        <button 
          className={`tab ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          Chart Gallery
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'upload' && <FileUploadSection setActiveTab={setActiveTab} />}
        {activeTab === 'charts' && <MyChartsSection setActiveTab={setActiveTab} />}
        {activeTab === 'gallery' && <ChartGallerySection setActiveTab={setActiveTab} />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function FileUploadSection({ setActiveTab }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please select a valid Excel file (.xlsx or .xls)');
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const result = await filesAPI.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      
      setUploadResult(result);
      setFile(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="section">
      <h2>Upload Excel File</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {uploadResult && (
        <div className="success-message">
          <h3>✅ Upload Successful!</h3>
          <p>File: {uploadResult.file?.originalName}</p>
          <p>Rows processed: {uploadResult.file?.rowCount || 'N/A'}</p>
        </div>
      )}

      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'file-selected' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file && !uploading ? (
          <>
            <div className="upload-icon">📊</div>
            <p>Drag and drop your Excel file here</p>
            <p>or</p>
            <label className="file-input-label">
              Choose File
              <input 
                type="file" 
                accept=".xlsx,.xls" 
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
            </label>
            <p className="file-info">Supports .xlsx and .xls files (max 10MB)</p>
          </>
        ) : uploading ? (
          <div className="upload-progress">
            <div className="progress-icon">⬆️</div>
            <h3>Uploading... {uploadProgress}%</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p>Please wait while we process your file</p>
          </div>
        ) : (
          <div className="file-preview">
            <div className="file-icon">📄</div>
            <div className="file-details">
              <h3>{file.name}</h3>
              <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <div className="file-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Processing...' : 'Upload & Process'}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setFile(null)}
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MyChartsSection({ setActiveTab }) {
  const [charts, setCharts] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [chartTitle, setChartTitle] = useState('');
  const [showCreateChart, setShowCreateChart] = useState(false);

  useEffect(() => {
    loadChartsAndFiles();
  }, []);

  const loadChartsAndFiles = async () => {
    try {
      setLoading(true);
      const [chartsData, filesData] = await Promise.all([
        chartsAPI.getCharts(),
        filesAPI.getFiles()
      ]);
      setCharts(chartsData);
      setFiles(filesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChart = async () => {
    if (!selectedFile || !chartTitle) return;

    try {
      const chartData = {
        title: chartTitle,
        type: chartType,
        fileId: selectedFile._id,
        config: {
          // Chart configuration based on file data
        }
      };

      const newChart = await chartsAPI.createChart(chartData);
      setCharts([newChart, ...charts]);
      setShowCreateChart(false);
      setSelectedFile(null);
      setChartTitle('');
      setActiveTab('charts'); // Navigate to charts section after successful creation
    } catch (error) {
      console.error('Failed to create chart:', error);
    }
  };

  const handleDeleteChart = async (chartId) => {
    if (window.confirm('Are you sure you want to delete this chart?')) {
      try {
        await chartsAPI.deleteChart(chartId);
        setCharts(charts.filter(chart => chart._id !== chartId));
      } catch (error) {
        console.error('Failed to delete chart:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="section">
        <div className="loading-state">Loading your charts...</div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2>My Charts</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateChart(true)}
          disabled={files.length === 0}
        >
          Create New Chart
        </button>
      </div>

      {showCreateChart && (
        <div className="create-chart-form">
          <h3>Create New Chart</h3>
          <div className="form-group">
            <label>Chart Title</label>
            <input
              type="text"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              placeholder="Enter chart title"
            />
          </div>
          <div className="form-group">
            <label>Select File</label>
            <select
              value={selectedFile?._id || ''}
              onChange={(e) => {
                const file = files.find(f => f._id === e.target.value);
                setSelectedFile(file);
              }}
            >
              <option value="">Choose a file...</option>
              {files.map(file => (
                <option key={file._id} value={file._id}>
                  {file.originalName} ({file.rowCount} rows)
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleCreateChart}>
              Create Chart
            </button>
            <button className="btn btn-secondary" onClick={() => setShowCreateChart(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="charts-grid">
        {charts.map(chart => (
          <div key={chart._id} className="chart-card">
            <div className="chart-preview">
              <ChartRenderer
                chartData={generateSampleChartData(chart.type)}
                chartType={chart.type}
                title={chart.title}
                width={280}
                height={200}
              />
            </div>
            <div className="chart-info">
              <h3>{chart.title}</h3>
              <p>{chart.type} Chart</p>
              <p className="chart-date">
                Created: {new Date(chart.createdAt).toLocaleDateString()}
              </p>
              <div className="chart-actions">
                <button className="btn btn-small">View</button>
                <button className="btn btn-small">Edit</button>
                <button 
                  className="btn btn-small btn-danger"
                  onClick={() => handleDeleteChart(chart._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {charts.length === 0 && (
          <div className="empty-state">
            <p>No charts created yet</p>
            {files.length === 0 ? (
              <p>Upload an Excel file first to get started</p>
            ) : (
              <p>Click "Create New Chart" to get started</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ChartGallerySection({ setActiveTab }) {
  const [selectedChart, setSelectedChart] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFileSelect, setShowFileSelect] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const filesData = await filesAPI.getFiles();
      setFiles(filesData);
    } catch (error) {
      console.error('Failed to load files:', error);
      setError('Failed to load your files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartTypes = [
    { id: 'bar', type: 'Bar Chart', icon: '📊', description: 'Perfect for comparing categories' },
    { id: 'line', type: 'Line Chart', icon: '📈', description: 'Great for showing trends over time' },
    { id: 'pie', type: 'Pie Chart', icon: '🥧', description: 'Ideal for showing parts of a whole' },
    { id: '3d-bar', type: '3D Bar Chart', icon: '📊', description: '3D visualization for impact' },
    { id: 'scatter', type: 'Scatter Plot', icon: '⚫', description: 'Shows relationships between variables' },
    { id: 'area', type: 'Area Chart', icon: '🏔️', description: 'Displays cumulative data' }
  ];

  const handleChartSelect = (chart) => {
    setSelectedChart(chart);
    if (files.length === 0) {
      setError('Please upload an Excel file first to create charts.');
    } else {
      setShowFileSelect(true);
    }
  };

  const handleFileSelect = async (file) => {
    try {
      setLoading(true);
      setSelectedFile(file);
      
      // Create a new chart with the selected type and file
      const chartData = {
        title: `New ${selectedChart.type}`,
        type: selectedChart.id,
        fileId: file._id,
        config: {
          // Default configuration based on chart type
          type: selectedChart.id,
          // Add more default config based on chart type
        }
      };

      const newChart = await chartsAPI.createChart(chartData);
      
      // Redirect to My Charts section or show the new chart
      setShowFileSelect(false);
      setSelectedChart(null);
      setActiveTab('charts'); // This assumes setActiveTab is passed as a prop
    } catch (error) {
      console.error('Failed to create chart:', error);
      setError('Failed to create chart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="section">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="section">
      <h2>Chart Gallery</h2>
      <p>Choose from various chart types for your data visualization</p>
      
      {error && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {showFileSelect ? (
        <div className="file-selection">
          <h3>Select a File for Your {selectedChart?.type}</h3>
          {files.length > 0 ? (
            <div className="files-grid">
              {files.map(file => (
                <div key={file._id} className="file-item">
                  <div className="file-icon">📄</div>
                  <h4>{file.originalName}</h4>
                  <p>{file.rowCount} rows</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleFileSelect(file)}
                  >
                    Use This File
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No files available. Please upload an Excel file first.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setActiveTab('upload')}
              >
                Upload File
              </button>
            </div>
          )}
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setShowFileSelect(false);
              setSelectedChart(null);
            }}
          >
            Back to Chart Types
          </button>
        </div>
      ) : (
        <div className="gallery-grid">
          {chartTypes.map((chart) => (
            <div key={chart.id} className="gallery-item">
              <div className="gallery-icon">{chart.icon}</div>
              <h3>{chart.type}</h3>
              <p>{chart.description}</p>
              <button 
                className="btn btn-outline"
                onClick={() => handleChartSelect(chart)}
              >
                Try This Chart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;