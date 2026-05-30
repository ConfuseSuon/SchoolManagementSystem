import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Box, Typography, Alert, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useRegisterAdmin } from '../api/register';
import { adminRegisterSchema } from '../types';
import type { AdminRegisterForm } from '../types';
import { useUiStore } from '@/stores/ui-store';

export function RegisterPage() {
  const navigate = useNavigate();
  const showToast = useUiStore(state => state.showToast);
  const registerMutation = useRegisterAdmin();

  const form = useForm<AdminRegisterForm>({
    resolver: zodResolver(adminRegisterSchema),
    defaultValues: { name: '', email: '', schoolName: '', schoolAddress: '', password: '', confirmPassword: '' },
  });

  const onSubmit = (data: AdminRegisterForm) => {
    const { confirmPassword, ...payload } = data;
    registerMutation.mutate(payload, {
      onSuccess: () => {
        showToast('Registration successful! Please log in.', 'success');
        navigate('/auth/login');
      },
    });
  };

  const regError = registerMutation.error as AxiosError<{ message: string }>;

  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <Typography variant="h5" sx={styles.title}>
          Create your account
        </Typography>
        <Typography variant="body2" sx={styles.subtitle}>
          Set up your school in minutes.
        </Typography>
      </Box>

      <Box sx={styles.formContainer}>
        {regError && (
          <Alert severity="error" sx={styles.alert}>
            {regError.response?.data?.message || 'Registration failed'}
          </Alert>
        )}
        <Box component="form" onSubmit={form.handleSubmit(onSubmit)} sx={styles.form}>
          <Typography variant="subtitle1" sx={styles.sectionSubtitle}>
            Basic Information
          </Typography>

          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Full Name"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={styles.input}
              />
            )}
          />
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Email Address"
                type="email"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={styles.input}
              />
            )}
          />

          <Typography variant="subtitle1" sx={styles.sectionSubtitle}>
            Your School
          </Typography>

          <Controller
            name="schoolName"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="School Name"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={styles.input}
              />
            )}
          />

          <Controller
            name="schoolAddress"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="School Address"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={styles.input}
              />
            )}
          />

          <Typography variant="subtitle1" sx={styles.sectionSubtitle}>
            Security
          </Typography>

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Password"
                type="password"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={styles.input}
              />
            )}
          />
          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Confirm Password"
                type="password"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={styles.input}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            color="secondary"
            fullWidth
            size="large"
            disabled={registerMutation.isPending}
            sx={styles.submitBtn}
          >
            {registerMutation.isPending ? 'Creating account...' : 'Sign Up'}
          </Button>

          <Box sx={styles.linkBox}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/auth/login" sx={styles.loginLink}>
                Back to login
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const styles = {
  container: {
    width: '100%',
  },
  backLink: {
    display: 'inline-block',
    color: 'text.secondary',
    fontSize: '0.875rem',
    textDecoration: 'none',
    mb: 2,
    '&:hover': {
      color: 'text.primary',
    },
  },
  header: {
    mb: 3,
  },
  title: {
    fontWeight: 700,
    letterSpacing: '-0.5px',
    color: 'text.primary',
    mt: 5,
    mb: 1,
  },
  subtitle: {
    color: 'text.secondary',
  },
  formContainer: {
    mt: 2,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  sectionSubtitle: {
    mt: 2,
    mb: 1,
    fontWeight: 600,
    borderLeft: '3px solid',
    borderColor: 'secondary.main',
    pl: 1.5,
    color: 'text.primary',
  },
  input: {
    mb: 0.5,
  },
  submitBtn: {
    borderRadius: '24px',
    py: 1.25,
    textTransform: 'none',
    fontWeight: 600,
    mt: 2,
  },
  alert: {
    mb: 2,
  },
  linkBox: {
    textAlign: 'center',
    mt: 2,
  },
  loginLink: {
    color: 'secondary.main',
    fontWeight: 600,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
} as const;
