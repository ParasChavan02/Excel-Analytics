const express = require('express');
const User = require('../models/User');
const File = require('../models/File');
const Chart = require('../models/Chart');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Admin
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalFiles = await File.countDocuments();
    const totalCharts = await Chart.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin', isActive: true });

    // Get recent activity
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email firstName lastName createdAt');

    const recentFiles = await File.find()
      .populate('uploadedBy', 'username email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('originalName size status createdAt uploadedBy');

    const recentCharts = await Chart.find()
      .populate('createdBy', 'username email')
      .populate('fileId', 'originalName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title chartType views createdAt createdBy fileId');

    // Get file status distribution
    const fileStatusStats = await File.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get chart type distribution
    const chartTypeStats = await Chart.aggregate([
      {
        $group: {
          _id: '$chartType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user registration trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get storage usage
    const storageStats = await File.aggregate([
      {
        $group: {
          _id: null,
          totalSize: { $sum: '$size' },
          avgSize: { $avg: '$size' },
          maxSize: { $max: '$size' },
          minSize: { $min: '$size' }
        }
      }
    ]);

    res.json({
      message: 'Dashboard statistics retrieved successfully',
      statistics: {
        totals: {
          users: totalUsers,
          files: totalFiles,
          charts: totalCharts,
          admins: totalAdmins
        },
        recentActivity: {
          users: recentUsers,
          files: recentFiles,
          charts: recentCharts
        },
        distributions: {
          fileStatus: fileStatusStats,
          chartTypes: chartTypeStats
        },
        trends: {
          userRegistrations: userTrends
        },
        storage: storageStats[0] || {
          totalSize: 0,
          avgSize: 0,
          maxSize: 0,
          minSize: 0
        }
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      message: 'Server error retrieving dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Admin
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role;
    const status = req.query.status;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.isActive = status === 'active';
    }

    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    res.json({
      message: 'Users retrieved successfully',
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({
      message: 'Server error retrieving users',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Admin
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be either "user" or "admin"'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow admin to demote themselves
    if (user._id.toString() === req.user.id && role === 'user') {
      return res.status(400).json({
        message: 'You cannot change your own role'
      });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });

  } catch (error) {
    console.error('Admin update user role error:', error);
    res.status(500).json({
      message: 'Server error updating user role',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Activate/Deactivate user
// @access  Admin
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        message: 'isActive must be a boolean value'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow admin to deactivate themselves
    if (user._id.toString() === req.user.id && !isActive) {
      return res.status(400).json({
        message: 'You cannot deactivate your own account'
      });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });

  } catch (error) {
    console.error('Admin update user status error:', error);
    res.status(500).json({
      message: 'Server error updating user status',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/admin/files
// @desc    Get all files with pagination
// @access  Admin
router.get('/files', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const result = await File.getAllFiles(page, limit, status);

    res.json({
      message: 'Files retrieved successfully',
      ...result
    });

  } catch (error) {
    console.error('Admin get files error:', error);
    res.status(500).json({
      message: 'Server error retrieving files',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   DELETE /api/admin/files/:id
// @desc    Admin delete file
// @access  Admin
router.delete('/files/:id', adminAuth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete physical file
    const fs = require('fs').promises;
    try {
      await fs.unlink(file.path);
    } catch (fsError) {
      console.error('Error deleting physical file:', fsError);
    }

    // Delete associated charts
    await Chart.deleteMany({ fileId: req.params.id });

    // Delete from database
    await File.findByIdAndDelete(req.params.id);

    res.json({
      message: 'File and associated charts deleted successfully'
    });

  } catch (error) {
    console.error('Admin delete file error:', error);
    res.status(500).json({
      message: 'Server error deleting file',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/admin/charts
// @desc    Get all charts with pagination
// @access  Admin
router.get('/charts', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const chartType = req.query.type;

    const query = {};
    if (chartType) {
      query.chartType = chartType;
    }

    const charts = await Chart.find(query)
      .populate('createdBy', 'username email firstName lastName')
      .populate('fileId', 'originalName filename')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Chart.countDocuments(query);

    res.json({
      message: 'Charts retrieved successfully',
      charts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Admin get charts error:', error);
    res.status(500).json({
      message: 'Server error retrieving charts',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   DELETE /api/admin/charts/:id
// @desc    Admin delete chart
// @access  Admin
router.delete('/charts/:id', adminAuth, async (req, res) => {
  try {
    const chart = await Chart.findById(req.params.id);

    if (!chart) {
      return res.status(404).json({ message: 'Chart not found' });
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
    console.error('Admin delete chart error:', error);
    res.status(500).json({
      message: 'Server error deleting chart',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/admin/system-info
// @desc    Get system information
// @access  Admin
router.get('/system-info', adminAuth, async (req, res) => {
  try {
    const os = require('os');
    const fs = require('fs').promises;
    const path = require('path');

    // Get system info
    const systemInfo = {
      platform: os.platform(),
      architecture: os.arch(),
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: process.memoryUsage()
      },
      cpus: os.cpus().length
    };

    // Get upload directory size
    let uploadSize = 0;
    try {
      const uploadDir = path.join(__dirname, '../uploads');
      const files = await fs.readdir(uploadDir);
      
      for (const file of files) {
        try {
          const stat = await fs.stat(path.join(uploadDir, file));
          uploadSize += stat.size;
        } catch (err) {
          // Skip files that can't be accessed
        }
      }
    } catch (err) {
      console.error('Error calculating upload directory size:', err);
    }

    res.json({
      message: 'System information retrieved successfully',
      system: systemInfo,
      storage: {
        uploadsSize: uploadSize,
        uploadsSizeFormatted: formatBytes(uploadSize)
      },
      database: {
        connected: require('mongoose').connection.readyState === 1
      }
    });

  } catch (error) {
    console.error('Admin system info error:', error);
    res.status(500).json({
      message: 'Server error retrieving system information',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

module.exports = router;