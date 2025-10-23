const express = require('express');
const { body, validationResult } = require('express-validator');
const Chart = require('../models/Chart');
const File = require('../models/File');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/charts
// @desc    Create a new chart
// @access  Private
router.post('/', [
  auth,
  body('title')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be between 1 and 100 characters'),
  body('chartType')
    .isIn(['bar', 'line', 'pie', 'doughnut', 'scatter', 'bubble', 'area', 'radar', 'polarArea', 'bar3d', 'line3d', 'scatter3d', 'surface3d'])
    .withMessage('Invalid chart type'),
  body('dimension')
    .isIn(['2d', '3d'])
    .withMessage('Dimension must be either 2d or 3d'),
  body('fileId')
    .isMongoId()
    .withMessage('Valid file ID is required'),
  body('config.xAxis.column')
    .notEmpty()
    .withMessage('X-axis column is required'),
  body('config.yAxis.column')
    .notEmpty()
    .withMessage('Y-axis column is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, chartType, dimension, fileId, config } = req.body;

    // Verify file exists and user has access
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.uploadedBy.toString() !== req.user.id && !file.isPublic) {
      return res.status(403).json({ message: 'Access denied to file' });
    }

    if (file.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Cannot create chart from file that is not fully processed' 
      });
    }

    // Validate column names exist in file
    const { headers } = file.processedData;
    if (!headers.includes(config.xAxis.column)) {
      return res.status(400).json({
        message: `X-axis column '${config.xAxis.column}' not found in file`
      });
    }
    if (!headers.includes(config.yAxis.column)) {
      return res.status(400).json({
        message: `Y-axis column '${config.yAxis.column}' not found in file`
      });
    }

    // For 3D charts, validate Z-axis
    if (dimension === '3d' && config.zAxis && config.zAxis.column) {
      if (!headers.includes(config.zAxis.column)) {
        return res.status(400).json({
          message: `Z-axis column '${config.zAxis.column}' not found in file`
        });
      }
    }

    // Generate chart data
    const chartData = generateChartData(file.processedData, config, chartType);

    // Create chart
    const chart = new Chart({
      title,
      description: description || '',
      chartType,
      dimension,
      fileId,
      createdBy: req.user.id,
      config: {
        xAxis: {
          column: config.xAxis.column,
          label: config.xAxis.label || config.xAxis.column,
          dataType: config.xAxis.dataType || 'string'
        },
        yAxis: {
          column: config.yAxis.column,
          label: config.yAxis.label || config.yAxis.column,
          dataType: config.yAxis.dataType || 'number'
        },
        ...(dimension === '3d' && config.zAxis && {
          zAxis: {
            column: config.zAxis.column,
            label: config.zAxis.label || config.zAxis.column,
            dataType: config.zAxis.dataType || 'number'
          }
        }),
        colors: {
          primary: config.colors?.primary || '#3B82F6',
          secondary: config.colors?.secondary || '#EF4444',
          palette: config.colors?.palette || ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']
        },
        options: {
          responsive: config.options?.responsive !== false,
          showLegend: config.options?.showLegend !== false,
          showGrid: config.options?.showGrid !== false,
          showTooltip: config.options?.showTooltip !== false,
          animation: config.options?.animation !== false
        }
      },
      chartData,
      tags: req.body.tags || []
    });

    await chart.save();

    // Add chart reference to file
    if (!file.charts.includes(chart._id)) {
      file.charts.push(chart._id);
      await file.save();
    }

    res.status(201).json({
      message: 'Chart created successfully',
      chart: await Chart.findById(chart._id)
        .populate('createdBy', 'username firstName lastName')
        .populate('fileId', 'originalName filename')
    });

  } catch (error) {
    console.error('Create chart error:', error);
    res.status(500).json({
      message: 'Server error creating chart',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/charts
// @desc    Get user's charts or public charts
// @access  Private/Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const chartType = req.query.type;
    const isPublic = req.query.public === 'true';

    let result;
    
    if (isPublic) {
      // Get public charts
      result = await Chart.getPublicCharts(page, limit, chartType);
    } else if (req.user) {
      // Get user's charts
      result = await Chart.getUserCharts(req.user.id, page, limit, chartType);
    } else {
      return res.status(401).json({ message: 'Authentication required for private charts' });
    }

    res.json({
      message: 'Charts retrieved successfully',
      ...result
    });

  } catch (error) {
    console.error('Get charts error:', error);
    res.status(500).json({
      message: 'Server error retrieving charts',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/charts/:id
// @desc    Get specific chart
// @access  Private/Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const chart = await Chart.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName')
      .populate('fileId', 'originalName filename description');

    if (!chart) {
      return res.status(404).json({ message: 'Chart not found' });
    }

    // Check access permissions
    const canAccess = chart.isPublic || 
                     (req.user && chart.createdBy._id.toString() === req.user.id) ||
                     (req.user && req.user.role === 'admin');

    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Increment views if not the owner
    if (!req.user || chart.createdBy._id.toString() !== req.user.id) {
      await chart.incrementViews();
    }

    res.json({
      message: 'Chart retrieved successfully',
      chart: chart
    });

  } catch (error) {
    console.error('Get chart error:', error);
    res.status(500).json({
      message: 'Server error retrieving chart',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/charts/:id
// @desc    Update chart
// @access  Private
router.put('/:id', [
  auth,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const chart = await Chart.findById(req.params.id);

    if (!chart) {
      return res.status(404).json({ message: 'Chart not found' });
    }

    // Check if user owns the chart
    if (chart.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, isPublic, tags, config } = req.body;

    // Update fields if provided
    if (title !== undefined) chart.title = title;
    if (description !== undefined) chart.description = description;
    if (isPublic !== undefined) chart.isPublic = isPublic;
    if (tags !== undefined) chart.tags = tags;
    
    // Update config if provided
    if (config) {
      if (config.colors) {
        chart.config.colors = { ...chart.config.colors, ...config.colors };
      }
      if (config.options) {
        chart.config.options = { ...chart.config.options, ...config.options };
      }
    }

    await chart.save();

    res.json({
      message: 'Chart updated successfully',
      chart: await Chart.findById(chart._id)
        .populate('createdBy', 'username firstName lastName')
        .populate('fileId', 'originalName filename')
    });

  } catch (error) {
    console.error('Update chart error:', error);
    res.status(500).json({
      message: 'Server error updating chart',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   DELETE /api/charts/:id
// @desc    Delete chart
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const chart = await Chart.findById(req.params.id);

    if (!chart) {
      return res.status(404).json({ message: 'Chart not found' });
    }

    // Check if user owns the chart
    if (chart.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove chart reference from file
    await File.findByIdAndUpdate(chart.fileId, {
      $pull: { charts: chart._id }
    });

    // Delete chart
    await Chart.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Chart deleted successfully'
    });

  } catch (error) {
    console.error('Delete chart error:', error);
    res.status(500).json({
      message: 'Server error deleting chart',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   POST /api/charts/:id/like
// @desc    Toggle chart like
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const chart = await Chart.findById(req.params.id);

    if (!chart) {
      return res.status(404).json({ message: 'Chart not found' });
    }

    if (!chart.isPublic) {
      return res.status(403).json({ message: 'Can only like public charts' });
    }

    await chart.toggleLike(req.user.id);

    res.json({
      message: 'Chart like toggled successfully',
      likesCount: chart.likesCount,
      isLiked: chart.likes.some(like => like.user.toString() === req.user.id)
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      message: 'Server error toggling like',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Helper function to generate chart data
function generateChartData(fileData, config, chartType) {
  const { rows, headers } = fileData;
  const { xAxis, yAxis, zAxis } = config;
  
  // Extract data for specified columns
  const labels = [];
  const dataPoints = [];
  
  rows.forEach(row => {
    const xValue = row[xAxis.column];
    const yValue = row[yAxis.column];
    
    // Skip rows with null/undefined values
    if (xValue !== null && xValue !== undefined && 
        yValue !== null && yValue !== undefined) {
      
      labels.push(xValue);
      
      if (zAxis && zAxis.column) {
        // 3D data point
        const zValue = row[zAxis.column];
        if (zValue !== null && zValue !== undefined) {
          dataPoints.push({
            x: xValue,
            y: yValue,
            z: zValue
          });
        }
      } else {
        // 2D data point
        dataPoints.push(yValue);
      }
    }
  });

  // Generate colors based on chart type
  const colors = generateColors(dataPoints.length, config.colors);

  // Structure data based on chart type
  const datasets = [{
    label: yAxis.label || yAxis.column,
    data: dataPoints,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: chartType === 'line' ? 2 : 1,
    fill: chartType === 'area'
  }];

  return {
    labels: chartType === 'pie' || chartType === 'doughnut' ? labels : labels,
    datasets: datasets
  };
}

// Helper function to generate colors
function generateColors(count, colorConfig) {
  const palette = colorConfig?.palette || [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];
  
  const background = [];
  const border = [];
  
  for (let i = 0; i < count; i++) {
    const color = palette[i % palette.length];
    background.push(color + '80'); // Add transparency
    border.push(color);
  }
  
  return { background, border };
}

module.exports = router;