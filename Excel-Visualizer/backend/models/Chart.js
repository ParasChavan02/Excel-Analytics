const mongoose = require('mongoose');

const ChartSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Chart title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  chartType: {
    type: String,
    required: [true, 'Chart type is required'],
    enum: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'scatter',
      'bubble',
      'area',
      'radar',
      'polarArea',
      'bar3d',
      'line3d',
      'scatter3d',
      'surface3d'
    ]
  },
  dimension: {
    type: String,
    enum: ['2d', '3d'],
    required: [true, 'Chart dimension is required']
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: [true, 'File ID is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  config: {
    xAxis: {
      column: {
        type: String,
        required: [true, 'X-axis column is required']
      },
      label: {
        type: String,
        required: [true, 'X-axis label is required']
      },
      dataType: {
        type: String,
        enum: ['string', 'number', 'date'],
        default: 'string'
      }
    },
    yAxis: {
      column: {
        type: String,
        required: [true, 'Y-axis column is required']
      },
      label: {
        type: String,
        required: [true, 'Y-axis label is required']
      },
      dataType: {
        type: String,
        enum: ['number'],
        default: 'number'
      }
    },
    zAxis: {
      column: {
        type: String
      },
      label: {
        type: String
      },
      dataType: {
        type: String,
        enum: ['number'],
        default: 'number'
      }
    },
    colors: {
      primary: {
        type: String,
        default: '#3B82F6'
      },
      secondary: {
        type: String,
        default: '#EF4444'
      },
      palette: [{
        type: String
      }]
    },
    options: {
      responsive: {
        type: Boolean,
        default: true
      },
      showLegend: {
        type: Boolean,
        default: true
      },
      showGrid: {
        type: Boolean,
        default: true
      },
      showTooltip: {
        type: Boolean,
        default: true
      },
      animation: {
        type: Boolean,
        default: true
      }
    }
  },
  chartData: {
    labels: [{
      type: mongoose.Schema.Types.Mixed
    }],
    datasets: [{
      label: String,
      data: [{
        type: mongoose.Schema.Types.Mixed
      }],
      backgroundColor: [{
        type: String
      }],
      borderColor: [{
        type: String
      }]
    }]
  },
  exportFormats: [{
    type: String,
    enum: ['png', 'jpg', 'pdf', 'svg']
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for likes count
ChartSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for chart URL
ChartSchema.virtual('chartUrl').get(function() {
  return `/api/charts/${this._id}`;
});

// Index for better query performance
ChartSchema.index({ createdBy: 1, createdAt: -1 });
ChartSchema.index({ fileId: 1 });
ChartSchema.index({ chartType: 1 });
ChartSchema.index({ isPublic: 1 });
ChartSchema.index({ tags: 1 });

// Static method to get user charts with pagination
ChartSchema.statics.getUserCharts = async function(userId, page = 1, limit = 10, chartType = null) {
  const query = { createdBy: userId };
  if (chartType) {
    query.chartType = chartType;
  }
  
  const charts = await this.find(query)
    .populate('createdBy', 'username email firstName lastName')
    .populate('fileId', 'originalName filename')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
    
  const total = await this.countDocuments(query);
  
  return {
    charts,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  };
};

// Static method to get public charts
ChartSchema.statics.getPublicCharts = async function(page = 1, limit = 10, chartType = null) {
  const query = { isPublic: true };
  if (chartType) {
    query.chartType = chartType;
  }
  
  const charts = await this.find(query)
    .populate('createdBy', 'username firstName lastName')
    .populate('fileId', 'originalName')
    .sort({ views: -1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
    
  const total = await this.countDocuments(query);
  
  return {
    charts,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  };
};

// Method to increment views
ChartSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle like
ChartSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());
  
  if (likeIndex > -1) {
    // Remove like
    this.likes.splice(likeIndex, 1);
  } else {
    // Add like
    this.likes.push({ user: userId });
  }
  
  return this.save();
};

module.exports = mongoose.model('Chart', ChartSchema);