import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  clearError,
} from '../store/slices/taskSlice';
import ErrorBoundary from '../components/ErrorBoundary';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

function TaskListContent() {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.tasks);
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
  });
  const [localError, setLocalError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const loadTasks = async () => {
      try {
        await dispatch(fetchTasks()).unwrap();
      } catch (err) {
        console.error('Error loading tasks:', err);
        setLocalError(err.message || 'Failed to load tasks');
      }
    };
    loadTasks();

    // Cleanup function
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'pending',
    });
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
    });
    setOpen(true);
  };

  const handleDelete = async (taskId) => {
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      setSnackbar({
        open: true,
        message: 'Task deleted successfully',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error deleting task:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete task',
        severity: 'error',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await dispatch(updateTask({ id: editingTask._id, taskData: formData })).unwrap();
        setSnackbar({
          open: true,
          message: 'Task updated successfully',
          severity: 'success',
        });
      } else {
        await dispatch(createTask(formData)).unwrap();
        setSnackbar({
          open: true,
          message: 'Task created successfully',
          severity: 'success',
        });
      }
      handleClose();
    } catch (err) {
      console.error('Error saving task:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to save task',
        severity: 'error',
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || localError) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error || localError}</Alert>
      </Box>
    );
  }

  // Ensure tasks is an array
  const taskList = Array.isArray(tasks) ? tasks : [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Tasks</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add Task
        </Button>
      </Box>

      <Paper>
        <List>
          {taskList.length === 0 ? (
            <ListItem>
              <ListItemText primary="No tasks found" />
            </ListItem>
          ) : (
            taskList.map((task) => (
              <ListItem key={task._id}>
                <ListItemText
                  primary={task.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {task.description}
                      </Typography>
                      <br />
                      Status: {task.status}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleEdit(task)} sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDelete(task._id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              margin="normal"
            />
            <TextField
              fullWidth
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              margin="normal"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingTask ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function TaskList() {
  return (
    <ErrorBoundary>
      <TaskListContent />
    </ErrorBoundary>
  );
}

export default TaskList; 