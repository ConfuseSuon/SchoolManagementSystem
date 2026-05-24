import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Box, MenuItem, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAdminStepOne, useAdminStepTwo } from '../mutations';
import { adminStepOneSchema, adminStepTwoSchema } from '../types';
import type { AdminStepOneForm, AdminStepTwoForm } from '../types';
import { useAuthStore, isValidJwtPayload } from '@/stores/auth-store';
import { queryClient } from '@/lib/query-client';

interface SchoolData {
  _id: string;
  name: string;
}

function AdminStepOneForm({ onSuccess }: { onSuccess: (token: string, schools: SchoolData[]) => void }) {
  const stepOneMutation = useAdminStepOne();
  const form = useForm<AdminStepOneForm>({
    resolver: zodResolver(adminStepOneSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: AdminStepOneForm) => {
    stepOneMutation.mutate(data, {
      onSuccess: (res) => {
        onSuccess(res.data.tempToken, res.data.schools);
      },
    });
  };

  const error = stepOneMutation.error as AxiosError<{ message: string }>;

  return (
    <Box component="form" onSubmit={form.handleSubmit(onSubmit)} sx={styles.form}>
      {error && <Alert severity="error" sx={styles.alert}>{error.response?.data?.message || 'Login failed'}</Alert>}
      
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
      
      <Button type="submit" variant="contained" color="secondary" fullWidth size="large" disabled={stepOneMutation.isPending}>
        {stepOneMutation.isPending ? 'Authenticating...' : 'Continue'}
      </Button>
    </Box>
  );
}

function AdminStepTwoForm({ tempToken, schools }: { tempToken: string; schools: SchoolData[] }) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const stepTwoMutation = useAdminStepTwo();

  const form = useForm<AdminStepTwoForm>({
    resolver: zodResolver(adminStepTwoSchema),
    defaultValues: { schoolId: '' },
  });

  const onSubmit = (data: AdminStepTwoForm) => {
    stepTwoMutation.mutate({ ...data, tempToken }, {
      onSuccess: (res) => {
        const token = res.data.access_token;
        try {
          const payloadBase64 = token.split('.')[1];
          const payload = JSON.parse(atob(payloadBase64));
          if (isValidJwtPayload(payload)) {
            setAuth(payload, token);
            queryClient.clear();
            navigate('/admin');
          } else {
            console.error('Invalid JWT payload structure');
          }
        } catch (err) {
          console.error('Failed to parse JWT', err);
        }
      },
    });
  };

  const error = stepTwoMutation.error as AxiosError<{ message: string }>;

  return (
    <Box component="form" onSubmit={form.handleSubmit(onSubmit)} sx={styles.form}>
      {error && <Alert severity="error" sx={styles.alert}>{error.response?.data?.message || 'Login failed'}</Alert>}

      <Controller
        name="schoolId"
        control={form.control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            select
            label="Select School"
            fullWidth
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            sx={styles.input}
          >
            {schools.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      
      <Button type="submit" variant="contained" color="secondary" fullWidth size="large" disabled={stepTwoMutation.isPending}>
        {stepTwoMutation.isPending ? 'Logging in...' : 'Enter School'}
      </Button>
    </Box>
  );
}

export function AdminLoginForm() {
  const [tempToken, setTempToken] = useState('');
  const [schools, setSchools] = useState<SchoolData[]>([]);

  const handleStepOneSuccess = (token: string, loadedSchools: SchoolData[]) => {
    setTempToken(token);
    setSchools(loadedSchools);
  };

  if (tempToken) {
    return <AdminStepTwoForm tempToken={tempToken} schools={schools} />;
  }

  return <AdminStepOneForm onSuccess={handleStepOneSuccess} />;
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: 2 },
  input: { mb: 1 },
  alert: { mb: 2 }
} as const;
