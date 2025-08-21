import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function Login() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberEmail: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [findEmailDialog, setFindEmailDialog] = useState(false);
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [findEmailCode, setFindEmailCode] = useState('');
  const [resetPasswordData, setResetPasswordData] = useState({
    email: '',
    registrationCode: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [dialogMessage, setDialogMessage] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, rememberEmail: true }));
    }
  }, []);

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/content_insert');
    }
  }, [user, authLoading, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rememberEmail' ? checked : value,
    });
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password, formData.rememberEmail);
      router.push('/content_insert');
    } catch (err: any) {
      setError(err.response?.data?.error || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFindEmail = async () => {
    setDialogMessage('');
    try {
      const response = await fetch('/api/auth/find-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationCode: findEmailCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDialogMessage(`등록된 이메일:\n${data.emails.join('\n')}`);
    } catch (err: any) {
      setDialogMessage(err.message || '오류가 발생했습니다.');
    }
  };

  const handleResetPassword = async () => {
    setDialogMessage('');
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetPasswordData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDialogMessage('비밀번호가 성공적으로 변경되었습니다.');
      setTimeout(() => {
        setResetPasswordDialog(false);
        setResetPasswordData({
          email: '',
          registrationCode: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      }, 2000);
    } catch (err: any) {
      setDialogMessage(err.message || '오류가 발생했습니다.');
    }
  };

  // 로그인 상태면 바로 리다이렉트
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  if (user) {
    return null; // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 500 }}>
            관리자 로그인
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="이메일"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="rememberEmail"
                  checked={formData.rememberEmail}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label="이메일 저장"
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => setFindEmailDialog(true)}
                type="button"
              >
                이메일 찾기
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => setResetPasswordDialog(true)}
                type="button"
              >
                비밀번호 재설정
              </Link>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                계정이 없으신가요?{' '}
                <Link href="/register" underline="hover">
                  회원가입
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* 이메일 찾기 다이얼로그 */}
      <Dialog open={findEmailDialog} onClose={() => setFindEmailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>이메일 찾기</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="회원가입 코드"
            type="text"
            fullWidth
            variant="outlined"
            value={findEmailCode}
            onChange={(e) => setFindEmailCode(e.target.value)}
            sx={{ mb: 2 }}
          />
          {dialogMessage && (
            <Alert severity={dialogMessage.includes('오류') ? 'error' : 'info'} sx={{ whiteSpace: 'pre-line' }}>
              {dialogMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setFindEmailDialog(false);
            setFindEmailCode('');
            setDialogMessage('');
          }}>
            취소
          </Button>
          <Button onClick={handleFindEmail} variant="contained">
            확인
          </Button>
        </DialogActions>
      </Dialog>

      {/* 비밀번호 재설정 다이얼로그 */}
      <Dialog open={resetPasswordDialog} onClose={() => setResetPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>비밀번호 재설정</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="이메일"
            type="email"
            fullWidth
            variant="outlined"
            value={resetPasswordData.email}
            onChange={(e) => setResetPasswordData({ ...resetPasswordData, email: e.target.value })}
            sx={{ mb: 1 }}
          />
          <TextField
            margin="dense"
            label="회원가입 코드"
            type="text"
            fullWidth
            variant="outlined"
            value={resetPasswordData.registrationCode}
            onChange={(e) => setResetPasswordData({ ...resetPasswordData, registrationCode: e.target.value })}
            sx={{ mb: 1 }}
          />
          <TextField
            margin="dense"
            label="새 비밀번호"
            type="password"
            fullWidth
            variant="outlined"
            value={resetPasswordData.newPassword}
            onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
            sx={{ mb: 1 }}
          />
          <TextField
            margin="dense"
            label="새 비밀번호 확인"
            type="password"
            fullWidth
            variant="outlined"
            value={resetPasswordData.confirmNewPassword}
            onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmNewPassword: e.target.value })}
            sx={{ mb: 2 }}
          />
          {dialogMessage && (
            <Alert severity={dialogMessage.includes('성공') ? 'success' : 'error'}>
              {dialogMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setResetPasswordDialog(false);
            setResetPasswordData({
              email: '',
              registrationCode: '',
              newPassword: '',
              confirmNewPassword: '',
            });
            setDialogMessage('');
          }}>
            취소
          </Button>
          <Button onClick={handleResetPassword} variant="contained">
            비밀번호 변경
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}