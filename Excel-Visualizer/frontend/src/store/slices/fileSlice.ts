import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
export interface FileData {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  headers: string[];
  totalRows: number;
  totalColumns: number;
  sheetNames: string[];
  description: string;
  tags: string[];
  uploadedAt: string;
  isPublic: boolean;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileState {
  files: FileData[];
  currentFile: FileData | null;
  currentFileData: any[];
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: FileUploadProgress | null;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}

// Initial state
const initialState: FileState = {
  files: [],
  currentFile: null,
  currentFileData: [],
  isLoading: false,
  isUploading: false,
  uploadProgress: null,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
};

// Async thunks
export const uploadFile = createAsyncThunk(
  'files/upload',
  async (
    data: { file: File; description?: string; tags?: string },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('excelFile', data.file);
      if (data.description) {
        formData.append('description', data.description);
      }
      if (data.tags) {
        formData.append('tags', data.tags);
      }

      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          // This will be handled by the pending case
        },
      });

      return response.data.file;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'File upload failed'
      );
    }
  }
);

export const fetchFiles = createAsyncThunk(
  'files/fetchFiles',
  async (
    params: {
      page?: number;
      limit?: number;
      status?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);

      const response = await axios.get(`/api/files?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch files'
      );
    }
  }
);

export const fetchFileData = createAsyncThunk(
  'files/fetchFileData',
  async (
    params: {
      fileId: string;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await axios.get(
        `/api/files/${params.fileId}/data?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch file data'
      );
    }
  }
);

export const fetchFileDetails = createAsyncThunk(
  'files/fetchFileDetails',
  async (fileId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/files/${fileId}`);
      return response.data.file;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch file details'
      );
    }
  }
);

export const updateFile = createAsyncThunk(
  'files/update',
  async (
    data: {
      fileId: string;
      description?: string;
      tags?: string[];
      isPublic?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(`/api/files/${data.fileId}`, {
        description: data.description,
        tags: data.tags,
        isPublic: data.isPublic,
      });
      return response.data.file;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'File update failed'
      );
    }
  }
);

export const deleteFile = createAsyncThunk(
  'files/delete',
  async (fileId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/files/${fileId}`);
      return fileId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'File deletion failed'
      );
    }
  }
);

export const reprocessFile = createAsyncThunk(
  'files/reprocess',
  async (fileId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/files/${fileId}/reprocess`);
      return response.data.file;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'File reprocessing failed'
      );
    }
  }
);

// File slice
const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentFile: (state) => {
      state.currentFile = null;
      state.currentFileData = [];
    },
    setUploadProgress: (state, action: PayloadAction<FileUploadProgress>) => {
      state.uploadProgress = action.payload;
    },
    clearUploadProgress: (state) => {
      state.uploadProgress = null;
    },
    updateFileInList: (state, action: PayloadAction<FileData>) => {
      const index = state.files.findIndex((file) => file.id === action.payload.id);
      if (index !== -1) {
        state.files[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Upload File
    builder
      .addCase(uploadFile.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.isUploading = false;
        state.files.unshift(action.payload);
        state.uploadProgress = null;
        state.error = null;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = null;
        state.error = action.payload as string;
      });

    // Fetch Files
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.files = action.payload.files;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
        state.error = null;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch File Data
    builder
      .addCase(fetchFileData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFileData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFileData = action.payload.data.rows;
        state.error = null;
      })
      .addCase(fetchFileData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch File Details
    builder
      .addCase(fetchFileDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFileDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFile = action.payload;
        state.error = null;
      })
      .addCase(fetchFileDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update File
    builder
      .addCase(updateFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFile.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update file in the list
        const index = state.files.findIndex((file) => file.id === action.payload.id);
        if (index !== -1) {
          state.files[index] = { ...state.files[index], ...action.payload };
        }
        // Update current file if it's the same
        if (state.currentFile && state.currentFile.id === action.payload.id) {
          state.currentFile = { ...state.currentFile, ...action.payload };
        }
        state.error = null;
      })
      .addCase(updateFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete File
    builder
      .addCase(deleteFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.files = state.files.filter((file) => file.id !== action.payload);
        // Clear current file if it was deleted
        if (state.currentFile && state.currentFile.id === action.payload) {
          state.currentFile = null;
          state.currentFileData = [];
        }
        state.error = null;
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Reprocess File
    builder
      .addCase(reprocessFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reprocessFile.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update file in the list
        const index = state.files.findIndex((file) => file.id === action.payload.id);
        if (index !== -1) {
          state.files[index] = action.payload;
        }
        // Update current file if it's the same
        if (state.currentFile && state.currentFile.id === action.payload.id) {
          state.currentFile = action.payload;
        }
        state.error = null;
      })
      .addCase(reprocessFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearCurrentFile,
  setUploadProgress,
  clearUploadProgress,
  updateFileInList,
} = fileSlice.actions;

export default fileSlice.reducer;