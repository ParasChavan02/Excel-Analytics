import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

// Export utilities for charts
export class ChartExporter {
  constructor() {
    this.defaultOptions = {
      format: 'png',
      quality: 1.0,
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true
    };
  }

  // Export chart as image (PNG/JPG)
  async exportAsImage(element, filename = 'chart', options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: config.backgroundColor,
        scale: config.scale,
        useCORS: config.useCORS,
        allowTaint: true,
        foreignObjectRendering: true,
        logging: false
      });

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `${filename}.${config.format}`);
            resolve({
              success: true,
              filename: `${filename}.${config.format}`,
              size: blob.size
            });
          } else {
            reject(new Error('Failed to create image blob'));
          }
        }, `image/${config.format}`, config.quality);
      });
    } catch (error) {
      throw new Error(`Image export failed: ${error.message}`);
    }
  }

  // Export chart as PDF
  async exportAsPDF(element, filename = 'chart', options = {}) {
    const config = {
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      margin: 10,
      ...options
    };

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: config.backgroundColor || '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF(config.orientation, config.unit, config.format);
      
      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth() - (config.margin * 2);
      const pdfHeight = pdf.internal.pageSize.getHeight() - (config.margin * 2);
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      const x = (pdf.internal.pageSize.getWidth() - finalWidth) / 2;
      const y = (pdf.internal.pageSize.getHeight() - finalHeight) / 2;

      // Add title if provided
      if (config.title) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(config.title, pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      }

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      
      // Add metadata
      pdf.setProperties({
        title: config.title || filename,
        creator: 'Excel Visualizer',
        producer: 'Excel Visualizer App'
      });

      pdf.save(`${filename}.pdf`);

      return {
        success: true,
        filename: `${filename}.pdf`,
        pages: 1
      };
    } catch (error) {
      throw new Error(`PDF export failed: ${error.message}`);
    }
  }

  // Export multiple charts as PDF report
  async exportMultipleAsPDF(elements, filename = 'chart-report', options = {}) {
    const config = {
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      margin: 15,
      spacing: 10,
      ...options
    };

    try {
      const pdf = new jsPDF(config.orientation, config.unit, config.format);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - (config.margin * 2);
      const contentHeight = pageHeight - (config.margin * 2);

      // Add title page
      if (config.title) {
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text(config.title, pageWidth / 2, 50, { align: 'center' });
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 70, { align: 'center' });
        
        if (config.description) {
          pdf.setFontSize(10);
          pdf.text(config.description, config.margin, 90, { maxWidth: contentWidth });
        }
        
        pdf.addPage();
      }

      let currentY = config.margin;
      
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const canvas = await html2canvas(element.element, {
          backgroundColor: '#ffffff',
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Calculate scaled dimensions
        const scale = Math.min(contentWidth / imgWidth, (contentHeight * 0.6) / imgHeight);
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;
        
        // Check if we need a new page
        if (currentY + scaledHeight + 40 > pageHeight - config.margin && i > 0) {
          pdf.addPage();
          currentY = config.margin;
        }
        
        // Add chart title
        if (element.title) {
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(element.title, config.margin, currentY + 10);
          currentY += 20;
        }
        
        // Add image centered
        const x = (pageWidth - scaledWidth) / 2;
        pdf.addImage(imgData, 'PNG', x, currentY, scaledWidth, scaledHeight);
        currentY += scaledHeight + config.spacing;
        
        // Add description if provided
        if (element.description) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(element.description, config.margin, currentY, { maxWidth: contentWidth });
          currentY += 20;
        }
      }

      pdf.save(`${filename}.pdf`);

      return {
        success: true,
        filename: `${filename}.pdf`,
        pages: pdf.internal.getNumberOfPages(),
        charts: elements.length
      };
    } catch (error) {
      throw new Error(`Multi-chart PDF export failed: ${error.message}`);
    }
  }

  // Export chart data as CSV
  exportAsCSV(chartData, filename = 'chart-data') {
    try {
      const { labels, datasets } = chartData;
      
      let csvContent = 'Label';
      datasets.forEach(dataset => {
        csvContent += `,${dataset.label || 'Data'}`;
      });
      csvContent += '\n';

      labels.forEach((label, index) => {
        csvContent += `"${label}"`;
        datasets.forEach(dataset => {
          const value = dataset.data[index] || 0;
          csvContent += `,${value}`;
        });
        csvContent += '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${filename}.csv`);

      return {
        success: true,
        filename: `${filename}.csv`,
        rows: labels.length + 1
      };
    } catch (error) {
      throw new Error(`CSV export failed: ${error.message}`);
    }
  }

  // Export chart data as JSON
  exportAsJSON(chartData, config = {}, filename = 'chart-config') {
    try {
      const exportData = {
        chartData,
        config,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      saveAs(blob, `${filename}.json`);

      return {
        success: true,
        filename: `${filename}.json`,
        size: blob.size
      };
    } catch (error) {
      throw new Error(`JSON export failed: ${error.message}`);
    }
  }

  // Get supported export formats
  getSupportedFormats() {
    return [
      { value: 'png', label: 'PNG Image', description: 'High quality image format' },
      { value: 'jpg', label: 'JPEG Image', description: 'Compressed image format' },
      { value: 'pdf', label: 'PDF Document', description: 'Portable document format' },
      { value: 'csv', label: 'CSV Data', description: 'Comma-separated values' },
      { value: 'json', label: 'JSON Config', description: 'Chart configuration data' }
    ];
  }
}

// Export component for UI
import React, { useState } from 'react';
import './ChartExporter.css';

const ChartExportDialog = ({ 
  isOpen, 
  onClose, 
  chartElement, 
  chartData, 
  chartConfig = {},
  title = 'My Chart' 
}) => {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('png');
  const [exportOptions, setExportOptions] = useState({
    quality: 1.0,
    backgroundColor: '#ffffff',
    includeTitle: true,
    filename: title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  });

  const exporter = new ChartExporter();

  const handleExport = async () => {
    if (!chartElement) return;

    setExporting(true);
    try {
      let result;
      const filename = exportOptions.filename || 'chart';

      switch (exportFormat) {
        case 'png':
        case 'jpg':
          result = await exporter.exportAsImage(chartElement, filename, {
            format: exportFormat,
            quality: exportOptions.quality,
            backgroundColor: exportOptions.backgroundColor
          });
          break;
        
        case 'pdf':
          result = await exporter.exportAsPDF(chartElement, filename, {
            title: exportOptions.includeTitle ? title : null,
            backgroundColor: exportOptions.backgroundColor
          });
          break;
        
        case 'csv':
          result = exporter.exportAsCSV(chartData, filename);
          break;
        
        case 'json':
          result = exporter.exportAsJSON(chartData, chartConfig, filename);
          break;
        
        default:
          throw new Error('Unsupported format');
      }

      // Show success message (you could integrate with your notification system)
      console.log('Export successful:', result);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      // Show error message
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  const formats = exporter.getSupportedFormats();

  return (
    <div className="export-dialog-overlay">
      <div className="export-dialog">
        <div className="export-header">
          <h3>Export Chart</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="export-content">
          <div className="form-group">
            <label>Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              {formats.map(format => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
            <small>{formats.find(f => f.value === exportFormat)?.description}</small>
          </div>

          <div className="form-group">
            <label>Filename</label>
            <input
              type="text"
              value={exportOptions.filename}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                filename: e.target.value
              }))}
              placeholder="Enter filename"
            />
          </div>

          {(exportFormat === 'png' || exportFormat === 'jpg' || exportFormat === 'pdf') && (
            <>
              <div className="form-group">
                <label>Background Color</label>
                <input
                  type="color"
                  value={exportOptions.backgroundColor}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    backgroundColor: e.target.value
                  }))}
                />
              </div>

              {exportFormat !== 'pdf' && (
                <div className="form-group">
                  <label>Quality: {Math.round(exportOptions.quality * 100)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={exportOptions.quality}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      quality: parseFloat(e.target.value)
                    }))}
                  />
                </div>
              )}

              {exportFormat === 'pdf' && (
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={exportOptions.includeTitle}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        includeTitle: e.target.checked
                      }))}
                    />
                    Include Title
                  </label>
                </div>
              )}
            </>
          )}
        </div>

        <div className="export-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={exporting}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};

export { ChartExporter, ChartExportDialog };