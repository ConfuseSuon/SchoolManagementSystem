import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Box, MenuItem, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useStaffLogin } from '../mutations';
import { staffLoginSchema } from '../types';
import type { StaffLoginForm as StaffLoginType } from '../types';
import { useAuthStore, isValidJwtPayload } from '@/stores/auth-store';
import { queryClient } from '@/lib/query-client';
import { api } from '@/lib/axios';
import { AsyncSearchSelect } from '@/components/AsyncSearchSelect';

export function StaffLoginForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  const loginMutation = useStaffLogin();

  const form = useForm<StaffLoginType>({
    resolver: zodResolver(staffLoginSchema),
    defaultValues: { role: 'Teacher', email: '', password: '', schoolId: '' },
  });

  const onSubmit = (data: StaffLoginType) => {
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        const token = res.data.access_token;
        try {
          const payloadBase64 = token.split('.')[1];
          const payload = JSON.parse(atob(payloadBase64));
          if (isValidJwtPayload(payload)) {
            setAuth(payload, token);
            queryClient.clear();
            navigate(payload.role === 'Teacher' ? '/teacher' : '/student');
          } else {
            console.error('Invalid JWT payload structure');
          }
        } catch (err) {
          console.error('Failed to parse JWT', err);
        }
      },
    });
  };

  const loginError = loginMutation.error as AxiosError<{ message: string }>;

  return (
    <Box component="form" onSubmit={form.handleSubmit(onSubmit)} sx={styles.form}>
      {loginError && <Alert severity="error" sx={styles.alert}>{loginError.response?.data?.message || 'Login failed'}</Alert>}

      <Controller
        name="role"
        control={form.control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            select
            label="Select Account Type"
            fullWidth
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            sx={styles.input}
          >
            <MenuItem value="Teacher">Teacher</MenuItem>
            <MenuItem value="Student">Student</MenuItem>
          </TextField>
        )}
      />

      <AsyncSearchSelect
        name="schoolId"
        control={form.control}
        label="Search your school"
        placeholder="Type at least 3 characters to search..."
        fetchFn={async (query) => {
          const res = await api.get<any>(`/schools/search?q=${encodeURIComponent(query)}`);
          return res.data;
        }}
        getOptionLabel={(option: any) => option.name}
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

      <Button type="submit" variant="contained" color="secondary" fullWidth size="large" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </Button>
    </Box>
  );
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: 2 },
  input: { mb: 1 },
  alert: { mb: 2 }
} as const;
