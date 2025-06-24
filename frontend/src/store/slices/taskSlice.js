import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Create axios instance with auth header
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add request interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching tasks...');
      const response = await axiosInstance.get('/tasks');
      console.log('Tasks response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch tasks'
      );
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue, dispatch }) => {
    try {
      console.log('Creating task:', taskData);
      const response = await axiosInstance.post('/tasks', taskData);
      console.log('Create task response:', response.data);
      // Try to extract the task object from different possible response formats
      const createdTask = response.data.task || response.data;
      // After creating, fetch the latest tasks
      await dispatch(fetchTasks());
      return createdTask;
    } catch (error) {
      console.error('Error creating task:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create task'
      );
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      console.log('Updating task:', { id, taskData });
      const response = await axiosInstance.put(`/tasks/${id}`, taskData);
      console.log('Update task response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update task'
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      console.log('Deleting task:', id);
      await axiosInstance.delete(`/tasks/${id}`);
      console.log('Task deleted successfully');
      return id;
    } catch (error) {
      console.error('Error deleting task:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete task'
      );
    }
  }
);

const initialState = {
  tasks: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        // Support both array and object with tasks property
        if (Array.isArray(action.payload)) {
          state.tasks = action.payload;
        } else if (action.payload && Array.isArray(action.payload.tasks)) {
          state.tasks = action.payload.tasks;
        } else {
          state.tasks = [];
        }
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        // Do not push the new task, fetchTasks will update the list
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(state.tasks)) {
          state.tasks = state.tasks.map((task) =>
            task._id === action.payload._id ? action.payload : task
          );
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(state.tasks)) {
          state.tasks = state.tasks.filter((task) => task._id !== action.payload);
        }
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearTasks } = taskSlice.actions;
export default taskSlice.reducer; 