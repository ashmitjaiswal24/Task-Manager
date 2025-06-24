import { useState } from 'react';
import axios from 'axios';
import { Alert, Box, Button, TextField, Typography, Paper } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';

function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('/api/users/verify-otp', { email, otp: String(otp) });
      setMessage(res.data.message);
      setSeverity('success');
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Redirect after 2 seconds
    } catch (err) {
      setMessage(err.response?.data?.message || 'Verification failed.');
      setSeverity('error');
    }
    setLoading(false);
  };

  return (
    <Box>
      <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          Verify Email
        </Typography>
        {message && <Alert severity={severity}>{message}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="OTP"
            name="otp"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={success}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading || success}
            sx={{ mt: 2 }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default VerifyOtp; 