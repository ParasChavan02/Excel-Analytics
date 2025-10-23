import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
export interface ChartConfig {
  xAxis: {
    column: string;
    label: string;
    dataType: 'string' | 'number' | 'date';
  };
  yAxis: {
    column: string;
    label: string;
    dataType: 'number';
  };
  zAxis?: {
    column: string;
    label: string;
    dataType: 'number';
  };
  colors: {
    primary: string;
    secondary: string;
    palette: string[];
  };
  options: {
    responsive: boolean;
    showLegend: boolean;
    showGrid: boolean;
    showTooltip: boolean;
    animation: boolean;
  };
}

export interface ChartData {
  id: string;
  title: string;
  description: string;
  chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter' | 'bubble' | 'area' | 'radar' | 'polarArea' | 'bar3d' | 'line3d' | 'scatter3d' | 'surface3d';
  dimension: '2d' | '3d';
  fileId: string;
  createdBy: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  config: ChartConfig;
  chartData: any;
  views: number;
  likes: number;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChartState {
  charts: ChartData[];
  currentChart: ChartData | null;
  publicCharts: ChartData[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
  publicPagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}

// Initial state
const initialState: ChartState = {
  charts: [],
  currentChart: null,
  publicCharts: [],
  isLoading: false,
  isCreating: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
  publicPagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
};

// Async thunks
export const createChart = createAsyncThunk(
  'charts/create',
  async (
    chartData: {
      title: string;
      description?: string;
      chartType: string;
      dimension: '2d' | '3d';
      fileId: string;
      config: ChartConfig;
      tags?: string[];
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post('/api/charts', chartData);
      return response.data.chart;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Chart creation failed'
      );
    }
  }
);

export const fetchCharts = createAsyncThunk(
  'charts/fetchCharts',
  async (
    params: {
      page?: number;
      limit?: number;
      type?: string;
      public?: boolean;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.type) queryParams.append('type', params.type);
      if (params.public !== undefined) queryParams.append('public', params.public.toString());

      const response = await axios.get(`/api/charts?${queryParams.toString()}`);
      return { ...response.data, isPublic: params.public };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch charts'
      );
    }
  }
);

export const fetchChartDetails = createAsyncThunk(
  'charts/fetchChartDetails',
  async (chartId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/charts/${chartId}`);
      return response.data.chart;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch chart details'
      );
    }
  }
);

export const updateChart = createAsyncThunk(
  'charts/update',
  async (
    data: {
      chartId: string;
      title?: string;
      description?: string;
      isPublic?: boolean;
      tags?: string[];
      config?: Partial<ChartConfig>;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(`/api/charts/${data.chartId}`, {
        title: data.title,
        description: data.description,
        isPublic: data.isPublic,
        tags: data.tags,
        config: data.config,
      });
      return response.data.chart;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Chart update failed'
      );
    }
  }
);

export const deleteChart = createAsyncThunk(
  'charts/delete',
  async (chartId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/charts/${chartId}`);
      return chartId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Chart deletion failed'
      );
    }
  }
);

export const likeChart = createAsyncThunk(
  'charts/like',
  async (chartId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/charts/${chartId}/like`);
      return {
        chartId,
        likesCount: response.data.likesCount,
        isLiked: response.data.isLiked,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to like chart'
      );
    }
  }
);

// Chart slice
const chartSlice = createSlice({
  name: 'charts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentChart: (state) => {
      state.currentChart = null;
    },
    updateChartInList: (state, action: PayloadAction<ChartData>) => {
      const index = state.charts.findIndex((chart) => chart.id === action.payload.id);
      if (index !== -1) {
        state.charts[index] = action.payload;
      }
      // Also update in public charts if it exists there
      const publicIndex = state.publicCharts.findIndex((chart) => chart.id === action.payload.id);
      if (publicIndex !== -1) {
        state.publicCharts[publicIndex] = action.payload;
      }
    },
    setCurrentChart: (state, action: PayloadAction<ChartData>) => {
      state.currentChart = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create Chart
    builder
      .addCase(createChart.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createChart.fulfilled, (state, action) => {
        state.isCreating = false;
        state.charts.unshift(action.payload);
        state.currentChart = action.payload;
        state.error = null;
      })
      .addCase(createChart.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Fetch Charts
    builder
      .addCase(fetchCharts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCharts.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (action.payload.isPublic) {
          state.publicCharts = action.payload.charts;
          state.publicPagination = {
            currentPage: action.payload.currentPage,
            totalPages: action.payload.totalPages,
            total: action.payload.total,
          };
        } else {
          state.charts = action.payload.charts;
          state.pagination = {
            currentPage: action.payload.currentPage,
            totalPages: action.payload.totalPages,
            total: action.payload.total,
          };
        }
        
        state.error = null;
      })
      .addCase(fetchCharts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Chart Details
    builder
      .addCase(fetchChartDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChartDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentChart = action.payload;
        state.error = null;
      })
      .addCase(fetchChartDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Chart
    builder
      .addCase(updateChart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateChart.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Update chart in the list
        const index = state.charts.findIndex((chart) => chart.id === action.payload.id);
        if (index !== -1) {
          state.charts[index] = action.payload;
        }
        
        // Update in public charts if it exists there
        const publicIndex = state.publicCharts.findIndex((chart) => chart.id === action.payload.id);
        if (publicIndex !== -1) {
          state.publicCharts[publicIndex] = action.payload;
        }
        
        // Update current chart if it's the same
        if (state.currentChart && state.currentChart.id === action.payload.id) {
          state.currentChart = action.payload;
        }
        
        state.error = null;
      })
      .addCase(updateChart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Chart
    builder
      .addCase(deleteChart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteChart.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Remove from charts
        state.charts = state.charts.filter((chart) => chart.id !== action.payload);
        
        // Remove from public charts
        state.publicCharts = state.publicCharts.filter((chart) => chart.id !== action.payload);
        
        // Clear current chart if it was deleted
        if (state.currentChart && state.currentChart.id === action.payload) {
          state.currentChart = null;
        }
        
        state.error = null;
      })
      .addCase(deleteChart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Like Chart
    builder
      .addCase(likeChart.pending, () => {
        // Don't set loading state for like operations
      })
      .addCase(likeChart.fulfilled, (state, action) => {
        const { chartId, likesCount } = action.payload;
        
        // Update likes in charts list
        const chartIndex = state.charts.findIndex((chart) => chart.id === chartId);
        if (chartIndex !== -1) {
          state.charts[chartIndex].likes = likesCount;
        }
        
        // Update likes in public charts list
        const publicChartIndex = state.publicCharts.findIndex((chart) => chart.id === chartId);
        if (publicChartIndex !== -1) {
          state.publicCharts[publicChartIndex].likes = likesCount;
        }
        
        // Update current chart if it's the same
        if (state.currentChart && state.currentChart.id === chartId) {
          state.currentChart.likes = likesCount;
        }
      })
      .addCase(likeChart.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearCurrentChart,
  updateChartInList,
  setCurrentChart,
} = chartSlice.actions;

export default chartSlice.reducer;