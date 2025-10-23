const express = require('express');
const { body, validationResult } = require('express-validator');
const File = require('../models/File');
const { auth } = require('../middleware/auth');
const { uploadSingle, handleMulterError } = require('../middleware/upload');
const ExcelParser = require('../utils/excelParser');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// @route   POST /api/files/upload
// @desc    Upload Excel file
// @access  Private
router.post('/upload', auth, (req, res, next) => {
  uploadSingle(req, res, (err) => {
    handleMulterError(err, req, res, next);
  });
}, [
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const tags = value.split(',').map(tag => tag.trim());
        return tags.every(tag => tag.length <= 20);
      }
      return true;
    })
    .withMessage('Each tag must be 20 characters or less')
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

    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded. Please select an Excel file (.xls or .xlsx)'
      });
    }

    const { description = '', tags = '' } = req.body;
    const file = req.file;

    // Validate Excel file
    const validation = ExcelParser.validateExcelFile(file.path);
    if (!validation.isValid) {
      // Clean up uploaded file if validation fails
      await fs.unlink(file.path).catch(console.error);
      return res.status(400).json({
        message: validation.error
      });
    }

    // Create file record
    const fileData = new File({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedBy: req.user.id,
      status: 'processing',
      description: description.trim(),
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
    });

    await fileData.save();

    // Parse Excel file in background
    try {
      const parsedData = ExcelParser.parseExcelFile(file.path);
      
      // Update file with parsed data
      fileData.processedData = {
        headers: parsedData.headers,
        rows: parsedData.rows,
        totalRows: parsedData.totalRows,
        totalColumns: parsedData.totalColumns
      };
      
      fileData.metadata = {
        sheetNames: parsedData.metadata.sheetNames,
        activeSheet: parsedData.metadata.activeSheet,
        ...parsedData.metadata
      };
      
      fileData.status = 'completed';
      await fileData.save();

    } catch (parseError) {
      console.error('Parsing error:', parseError);
      fileData.status = 'failed';
      await fileData.save();
      
      return res.status(422).json({
        message: 'Failed to parse Excel file',
        error: parseError.message,
        fileId: fileData._id
      });
    }

    res.status(201).json({
      message: 'File uploaded and processed successfully',
      file: {
        id: fileData._id,
        filename: fileData.filename,
        originalName: fileData.originalName,
        size: fileData.size,
        status: fileData.status,
        headers: fileData.processedData.headers,
        totalRows: fileData.processedData.totalRows,
        totalColumns: fileData.processedData.totalColumns,
        sheetNames: fileData.metadata.sheetNames,
        description: fileData.description,
        tags: fileData.tags,
        uploadedAt: fileData.createdAt
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    
    res.status(500).json({
      message: 'Server error during file upload',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/files
// @desc    Get user's uploaded files
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const result = await File.getUserFiles(req.user.id, page, limit, status);

    res.json({
      message: 'Files retrieved successfully',
      ...result
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      message: 'Server error retrieving files',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/files/:id
// @desc    Get specific file details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      .populate('uploadedBy', 'username email firstName lastName')
      .populate('charts', 'title chartType createdAt');

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns the file or is admin
    if (file.uploadedBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      message: 'File retrieved successfully',
      file: file
    });

  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      message: 'Server error retrieving file',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/files/:id/data
// @desc    Get file data for chart generation
// @access  Private
router.get('/:id/data', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns the file or file is public
    if (file.uploadedBy.toString() !== req.user.id && !file.isPublic && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (file.status !== 'completed') {
      return res.status(400).json({
        message: 'File is still being processed or failed to process'
      });
    }

    // Return data with pagination for large datasets
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedRows = file.processedData.rows.slice(startIndex, endIndex);

    res.json({
      message: 'File data retrieved successfully',
      data: {
        headers: file.processedData.headers,
        rows: paginatedRows,
        totalRows: file.processedData.totalRows,
        totalColumns: file.processedData.totalColumns,
        currentPage: page,
        totalPages: Math.ceil(file.processedData.totalRows / limit),
        hasMore: endIndex < file.processedData.totalRows
      },
      metadata: file.metadata
    });

  } catch (error) {
    console.error('Get file data error:', error);
    res.status(500).json({
      message: 'Server error retrieving file data',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/files/:id
// @desc    Update file metadata
// @access  Private
router.put('/:id', [
  auth,
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const tags = value.split(',').map(tag => tag.trim());
        return tags.every(tag => tag.length <= 20);
      }
      if (Array.isArray(value)) {
        return value.every(tag => typeof tag === 'string' && tag.length <= 20);
      }
      return true;
    })
    .withMessage('Each tag must be 20 characters or less'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value')
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

    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns the file
    if (file.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { description, tags, isPublic } = req.body;

    // Update fields if provided
    if (description !== undefined) {
      file.description = description.trim();
    }
    
    if (tags !== undefined) {
      if (typeof tags === 'string') {
        file.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else if (Array.isArray(tags)) {
        file.tags = tags.filter(tag => typeof tag === 'string' && tag.trim().length > 0);
      }
    }
    
    if (isPublic !== undefined) {
      file.isPublic = isPublic;
    }

    await file.save();

    res.json({
      message: 'File updated successfully',
      file: {
        id: file._id,
        description: file.description,
        tags: file.tags,
        isPublic: file.isPublic,
        updatedAt: file.updatedAt
      }
    });

  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({
      message: 'Server error updating file',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   DELETE /api/files/:id
// @desc    Delete file
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns the file
    if (file.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete physical file
    try {
      await fs.unlink(file.path);
    } catch (fsError) {
      console.error('Error deleting physical file:', fsError);
      // Continue with database deletion even if physical file deletion fails
    }

    // Delete from database
    await File.findByIdAndDelete(req.params.id);

    res.json({
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      message: 'Server error deleting file',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   POST /api/files/:id/reprocess
// @desc    Reprocess failed file
// @access  Private
router.post('/:id/reprocess', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns the file
    if (file.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (file.status !== 'failed') {
      return res.status(400).json({
        message: 'File can only be reprocessed if it failed'
      });
    }

    // Update status to processing
    file.status = 'processing';
    await file.save();

    // Parse Excel file again
    try {
      const parsedData = ExcelParser.parseExcelFile(file.path);
      
      // Update file with parsed data
      file.processedData = {
        headers: parsedData.headers,
        rows: parsedData.rows,
        totalRows: parsedData.totalRows,
        totalColumns: parsedData.totalColumns
      };
      
      file.metadata = {
        sheetNames: parsedData.metadata.sheetNames,
        activeSheet: parsedData.metadata.activeSheet,
        ...parsedData.metadata
      };
      
      file.status = 'completed';
      await file.save();

      res.json({
        message: 'File reprocessed successfully',
        file: {
          id: file._id,
          status: file.status,
          headers: file.processedData.headers,
          totalRows: file.processedData.totalRows,
          totalColumns: file.processedData.totalColumns
        }
      });

    } catch (parseError) {
      console.error('Reprocessing error:', parseError);
      file.status = 'failed';
      await file.save();
      
      return res.status(422).json({
        message: 'Failed to reprocess Excel file',
        error: parseError.message
      });
    }

  } catch (error) {
    console.error('Reprocess file error:', error);
    res.status(500).json({
      message: 'Server error reprocessing file',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;