import React, { useState } from 'react';
import ChartRenderer from './ChartRenderer';
import Chart3DRenderer from './Chart3DRenderer';
import './ChartCustomizer.css';

const ChartCustomizer = ({ 
  chartData, 
  onSave, 
  initialConfig = {} 
}) => {
  const [config, setConfig] = useState({
    type: '2d-bar',
    title: 'My Chart',
    backgroundColor: '#ffffff',
    showGrid: true,
    showLegend: true,
    animation: true,
    colorScheme: 'default',
    chartColors: [],
    fontSize: 14,
    fontFamily: 'Arial',
    borderWidth: 2,
    borderRadius: 0,
    showValues: true,
    opacity: 1,
    responsive: true,
    aspectRatio: 2,
    ...initialConfig
  });

  const [activeTab, setActiveTab] = useState('general');
  const [previewMode, setPreviewMode] = useState('2d');

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const colorSchemes = {
    default: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
    vibrant: ['#FF4757', '#3742FA', '#2ED573', '#FFA502', '#A4B0BE', '#FF3838'],
    pastel: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4'],
    dark: ['#2C3E50', '#E74C3C', '#3498DB', '#F39C12', '#9B59B6', '#1ABC9C'],
    monochrome: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#ECF0F1']
  };

  const chartTypes2D = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'doughnut', label: 'Doughnut Chart' },
    { value: 'radar', label: 'Radar Chart' },
    { value: 'scatter', label: 'Scatter Plot' }
  ];

  const chartTypes3D = [
    { value: '3d-bar', label: '3D Bar Chart' },
    { value: '3d-pie', label: '3D Pie Chart' },
    { value: '3d-surface', label: '3D Surface Plot' }
  ];

  const getCurrentChartType = () => {
    if (previewMode === '3d') {
      return config.type.startsWith('3d-') ? config.type : '3d-bar';
    }
    return config.type.startsWith('3d-') ? 'bar' : config.type;
  };

  const renderPreview = () => {
    const chartType = getCurrentChartType();
    
    if (previewMode === '3d') {
      return (
        <Chart3DRenderer
          chartData={chartData}
          chartType={chartType}
          title={config.title}
          customization={config}
          width={500}
          height={400}
        />
      );
    } else {
      return (
        <ChartRenderer
          chartData={chartData}
          chartType={chartType}
          title={config.title}
          customization={config}
          width={500}
          height={400}
        />
      );
    }
  };

  return (
    <div className="chart-customizer">
      <div className="customizer-header">
        <h2>Chart Customizer</h2>
        <div className="preview-toggle">
          <button 
            className={previewMode === '2d' ? 'active' : ''}
            onClick={() => setPreviewMode('2d')}
          >
            2D View
          </button>
          <button 
            className={previewMode === '3d' ? 'active' : ''}
            onClick={() => setPreviewMode('3d')}
          >
            3D View
          </button>
        </div>
      </div>

      <div className="customizer-body">
        <div className="customizer-sidebar">
          <div className="tab-navigation">
            <button 
              className={activeTab === 'general' ? 'active' : ''}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button 
              className={activeTab === 'styling' ? 'active' : ''}
              onClick={() => setActiveTab('styling')}
            >
              Styling
            </button>
            <button 
              className={activeTab === 'colors' ? 'active' : ''}
              onClick={() => setActiveTab('colors')}
            >
              Colors
            </button>
            <button 
              className={activeTab === 'advanced' ? 'active' : ''}
              onClick={() => setActiveTab('advanced')}
            >
              Advanced
            </button>
          </div>

          <div className="customization-panel">
            {activeTab === 'general' && (
              <div className="panel-content">
                <div className="form-group">
                  <label>Chart Title</label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => handleConfigChange('title', e.target.value)}
                    placeholder="Enter chart title"
                  />
                </div>

                <div className="form-group">
                  <label>Chart Type</label>
                  <select
                    value={config.type}
                    onChange={(e) => handleConfigChange('type', e.target.value)}
                  >
                    <optgroup label="2D Charts">
                      {chartTypes2D.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="3D Charts">
                      {chartTypes3D.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={config.showLegend}
                      onChange={(e) => handleConfigChange('showLegend', e.target.checked)}
                    />
                    Show Legend
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={config.showGrid}
                      onChange={(e) => handleConfigChange('showGrid', e.target.checked)}
                    />
                    Show Grid
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={config.animation}
                      onChange={(e) => handleConfigChange('animation', e.target.checked)}
                    />
                    Enable Animations
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'styling' && (
              <div className="panel-content">
                <div className="form-group">
                  <label>Background Color</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      value={config.backgroundColor}
                      onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                    />
                    <input
                      type="text"
                      value={config.backgroundColor}
                      onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Font Size</label>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={config.fontSize}
                    onChange={(e) => handleConfigChange('fontSize', parseInt(e.target.value))}
                  />
                  <span>{config.fontSize}px</span>
                </div>

                <div className="form-group">
                  <label>Font Family</label>
                  <select
                    value={config.fontFamily}
                    onChange={(e) => handleConfigChange('fontFamily', e.target.value)}
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Border Width</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={config.borderWidth}
                    onChange={(e) => handleConfigChange('borderWidth', parseInt(e.target.value))}
                  />
                  <span>{config.borderWidth}px</span>
                </div>

                <div className="form-group">
                  <label>Opacity</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={config.opacity}
                    onChange={(e) => handleConfigChange('opacity', parseFloat(e.target.value))}
                  />
                  <span>{Math.round(config.opacity * 100)}%</span>
                </div>
              </div>
            )}

            {activeTab === 'colors' && (
              <div className="panel-content">
                <div className="form-group">
                  <label>Color Scheme</label>
                  <select
                    value={config.colorScheme}
                    onChange={(e) => handleConfigChange('colorScheme', e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="vibrant">Vibrant</option>
                    <option value="pastel">Pastel</option>
                    <option value="dark">Dark</option>
                    <option value="monochrome">Monochrome</option>
                  </select>
                </div>

                <div className="color-preview">
                  <label>Color Preview</label>
                  <div className="color-swatches">
                    {colorSchemes[config.colorScheme].map((color, index) => (
                      <div
                        key={index}
                        className="color-swatch"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Custom Colors</label>
                  <div className="custom-colors">
                    {Array(6).fill().map((_, index) => (
                      <input
                        key={index}
                        type="color"
                        value={config.chartColors[index] || colorSchemes[config.colorScheme][index]}
                        onChange={(e) => {
                          const newColors = [...config.chartColors];
                          newColors[index] = e.target.value;
                          handleConfigChange('chartColors', newColors);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="panel-content">
                <div className="form-group">
                  <label>Aspect Ratio</label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={config.aspectRatio}
                    onChange={(e) => handleConfigChange('aspectRatio', parseFloat(e.target.value))}
                  />
                  <span>{config.aspectRatio}</span>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={config.responsive}
                      onChange={(e) => handleConfigChange('responsive', e.target.checked)}
                    />
                    Responsive Design
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={config.showValues}
                      onChange={(e) => handleConfigChange('showValues', e.target.checked)}
                    />
                    Show Data Values
                  </label>
                </div>

                <div className="form-group">
                  <label>Border Radius</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={config.borderRadius}
                    onChange={(e) => handleConfigChange('borderRadius', parseInt(e.target.value))}
                  />
                  <span>{config.borderRadius}px</span>
                </div>
              </div>
            )}
          </div>

          <div className="customizer-actions">
            <button 
              className="btn btn-primary"
              onClick={() => onSave(config)}
            >
              Save Configuration
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setConfig(initialConfig)}
            >
              Reset to Default
            </button>
          </div>
        </div>

        <div className="customizer-preview">
          <div className="preview-container">
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartCustomizer;