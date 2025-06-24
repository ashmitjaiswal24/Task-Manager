import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar,
  Alert,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import axios from 'axios';
import { setUser } from '../store/slices/authSlice';

function Profile() {
  const { token } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profilePicture: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Profile GET response:', res.data); // Debug log
        setFormData((prev) => {
          const updated = {
            ...prev,
            name: res.data.user.name || '',
            email: res.data.user.email || '',
            profilePicture: res.data.user.profilePicture || '',
          };
          console.log('Profile formData set:', updated); // Debug log
          return updated;
        });
      } catch (err) {
        setErrorMessage('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture' && files && files[0]) {
      // For now, just use a local URL preview. In production, upload to server and get URL.
      const url = URL.createObjectURL(files[0]);
      setFormData({ ...formData, profilePicture: url });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (name === 'confirmPassword' || name === 'newPassword') {
      if (formData.newPassword !== formData.confirmPassword) {
        setPasswordError('Passwords do not match');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await axios.put(
        '/api/users/profile',
        {
          name: formData.name,
          profilePicture: formData.profilePicture,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage('Profile updated successfully');
      setFormData((prev) => ({
        ...prev,
        name: res.data.user.name || '',
        profilePicture: res.data.user.profilePicture || '',
      }));
      dispatch(setUser(res.data.user));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Avatar
          src={formData.profilePicture}
          sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
        >
          {!formData.profilePicture && <PersonIcon sx={{ fontSize: 60 }} />}
        </Avatar>
        <Typography variant="h6">{formData.name}</Typography>
        <Typography color="textSecondary" sx={{ mb: 2 }}>{formData.email}</Typography>
        <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
          Upload Profile Picture
          <input type="file" name="profilePicture" accept="image/*" hidden onChange={handleChange} />
        </Button>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={formData.email}
          disabled
          sx={{ mb: 2 }}
        />
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Change Password</Typography>
        <TextField
          fullWidth
          label="Current Password"
          name="currentPassword"
          type="password"
          value={formData.currentPassword}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="New Password"
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!!passwordError || loading}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
      </Paper>
    </Box>
  );
}

export default Profile; 