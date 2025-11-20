// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Box,
  Button,
  Container,
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
    } catch (err) {
      setError((err as Error)?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafb', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          bgcolor: '#fefefe', 
          borderRadius: 3, 
          overflow: 'hidden',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        }}>
          {/* Left Side - Login Form */}
          <Box
            sx={{
              p: { xs: 4, md: 6 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {/* Logo */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Image
                src="/jasamarga-logo.png"
                alt="Jasa Marga Logo"
                width={200}
                height={60}
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: '#0f172a' }}>
                Welcome Back
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b' }}>
                Sign in to access Traffic Management System
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" mb={1} fontWeight={500} sx={{ color: '#0f172a' }}>
                  Username
                </Typography>
                <TextField
                  fullWidth
                  size="medium"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#fefefe',
                      '&:hover fieldset': {
                        borderColor: '#2596be',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2596be',
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" mb={1} fontWeight={500} sx={{ color: '#0f172a' }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  size="medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#fefefe',
                      '&:hover fieldset': {
                        borderColor: '#2596be',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2596be',
                      },
                    },
                  }}
                />
              </Box>

              {error && (
                <Box sx={{ 
                  mb: 3, 
                  p: 2, 
                  bgcolor: '#fee2e2', 
                  borderRadius: 2, 
                  border: '1px solid #fecaca' 
                }}>
                  <Typography variant="body2" sx={{ color: '#dc2626' }}>
                    {error}
                  </Typography>
                </Box>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  bgcolor: '#2596be',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#1e7a9e',
                  },
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>
          </Box>

          {/* Right Side - Illustration */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              backgroundImage: 'linear-gradient(135deg, #2596be 0%, #1e7a9e 100%)',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              p: 4,
            }}
          >
            <Box
              sx={{
                textAlign: 'center',
                color: '#fefefe',
                zIndex: 1,
              }}
            >
              <Typography variant="h3" fontWeight={700} gutterBottom>
                Traffic JM
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Monitoring & Management System
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  Efficient toll gate traffic data management
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
