import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { fetchTasks } from '../store/slices/taskSlice';
import ErrorBoundary from '../components/ErrorBoundary';

function DashboardContent() {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        console.log('Dashboard mounted, fetching tasks...');
        await dispatch(fetchTasks()).unwrap();
      } catch (err) {
        console.error('Error in loadTasks:', err);
        setLocalError(err.message || 'Failed to load tasks');
      }
    };

    loadTasks();
  }, [dispatch]);

  // Debug information
  console.log('Dashboard render:', { tasks, loading, error, user });

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

  const completedTasks = taskList.filter((task) => task.status === 'completed').length;
  const pendingTasks = taskList.filter((task) => task.status === 'pending').length;
  const inProgressTasks = taskList.filter((task) => task.status === 'in-progress').length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tasks
              </Typography>
              <Typography variant="h3">{taskList.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed Tasks
              </Typography>
              <Typography variant="h3">{completedTasks}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Tasks
              </Typography>
              <Typography variant="h3">{pendingTasks}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Tasks
            </Typography>
            {taskList.length === 0 ? (
              <Typography>No tasks found</Typography>
            ) : (
              taskList.slice(0, 5).map((task) => (
                <Box key={task._id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{task.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Status: {task.status}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function Dashboard() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}

export default Dashboard; 