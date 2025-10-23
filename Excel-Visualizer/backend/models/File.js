const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  path: {
    type: String,
    required: [true, 'File path is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  },
  mimetype: {
    type: String,
    required: [true, 'File mimetype is required'],
    enum: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'failed'],
    default: 'uploading'
  },
  processedData: {
    headers: [{
      type: String
    }],
    rows: [{
      type: mongoose.Schema.Types.Mixed
    }],
    totalRows: {
      type: Number,
      default: 0
    },
    totalColumns: {
      type: Number,
      default: 0
    }
  },
  metadata: {
    sheetNames: [{
      type: String
    }],
    activeSheet: {
      type: String,
      default: ''
    },
    dateFormat: {
      type: String,
      default: ''
    },
    numberFormat: {
      type: String,
      default: ''
    }
  },
  charts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chart'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for file URL
FileSchema.virtual('fileUrl').get(function() {
  return `/uploads/${this.filename}`;
});

// Virtual for charts count
FileSchema.virtual('chartsCount').get(function() {
  return this.charts ? this.charts.length : 0;
});

// Index for better query performance
FileSchema.index({ uploadedBy: 1, createdAt: -1 });
FileSchema.index({ status: 1 });
FileSchema.index({ tags: 1 });

// Static method to get user files with pagination
FileSchema.statics.getUserFiles = async function(userId, page = 1, limit = 10, status = null) {
  const query = { uploadedBy: userId };
  if (status) {
    query.status = status;
  }
  
  const files = await this.find(query)
    .populate('uploadedBy', 'username email firstName lastName')
    .populate('charts', 'title chartType createdAt')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
    
  const total = await this.countDocuments(query);
  
  return {
    files,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  };
};

// Static method for admin to get all files
FileSchema.statics.getAllFiles = async function(page = 1, limit = 10, status = null) {
  const query = {};
  if (status) {
    query.status = status;
  }
  
  const files = await this.find(query)
    .populate('uploadedBy', 'username email firstName lastName')
    .populate('charts', 'title chartType createdAt')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
    
  const total = await this.countDocuments(query);
  
  return {
    files,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  };
};

module.exports = mongoose.model('File', FileSchema);