// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { apiFetch } from '@/lib/http';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('Super Admin');
  const [password, setPassword] = useState('password12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      const token = data?.token;
      if (!token) {
        throw new Error('Token tidak ditemukan di response.');
      }

      localStorage.setItem('token', token);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Container maxWidth="sm">
        
          <Paper
            variant="outlined"
            sx={{
              mb: 6,
              width: '100%',
              height: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#f3f5f7',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              App Logo
            </Typography>
          </Paper>

          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="subtitle1" mb={0.5}>
              Username
            </Typography>
            <TextField
              fullWidth
              size="medium"
              margin="dense"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <Typography variant="subtitle1" mt={2} mb={0.5}>
              Password
            </Typography>
            <TextField
              fullWidth
              type="password"
              size="medium"
              margin="dense"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <Typography color="error" variant="body2" mt={1}>
                {error}
              </Typography>
            )}

            <Box mt={4}>
              <Button
                type="submit"
                variant="contained"
                sx={{ px: 6 }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Box>
          </Box>
        </Container>
      </Grid>

      
      <Grid
        item
        xs={0}
        md={6}
        sx={{
          display: { xs: 'none', md: 'block' },
          bgcolor: '#e4e7ec',
        }}
      >
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            color: '#555',
            fontSize: 24,
            fontWeight: 600,
          }}
        >
         
          App Illustration / Background
        </Box>
      </Grid>
    </Grid>
  );
}
