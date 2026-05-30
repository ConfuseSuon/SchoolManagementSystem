import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useUiStore } from '../stores/ui-store';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormType = z.infer<typeof schema>;

interface CreateLoginModalProps {
  open: boolean;
  onClose: () => void;
  entityId: string;
  role: 'Teacher' | 'Student';
  onSuccess: () => void;
}

export function CreateLoginModal({ open, onClose, entityId, role, onSuccess }: CreateLoginModalProps) {
  const showToast = useUiStore((state) => state.showToast);
  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: (data: FormType) => {
      const endpoint = role === 'Teacher' ? `/teachers/${entityId}/login` : `/students/${entityId}/login`;
      return api.post(endpoint, data);
    },
    onSuccess: () => {
      showToast('Login created successfully', 'success');
      form.reset();
      onSuccess();
      onClose();
    },
  });

  const onSubmit = (data: FormType) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Create Login Credentials</DialogTitle>
      <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
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
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            Create
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
