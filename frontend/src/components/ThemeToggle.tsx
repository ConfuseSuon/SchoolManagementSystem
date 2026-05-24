import { IconButton } from '@mui/material';
import type { IconButtonProps } from '@mui/material';
import { DarkModeOutlined, LightModeOutlined } from '@mui/icons-material';
import { useUiStore } from '@/stores/ui-store';

interface ThemeToggleProps extends Omit<IconButtonProps, 'onClick'> { }

export function ThemeToggle({ sx, ...props }: ThemeToggleProps) {
  const darkMode = useUiStore((state) => state.darkMode);
  const toggleDarkMode = useUiStore((state) => state.toggleDarkMode);

  return (
    <IconButton
      onClick={toggleDarkMode}
      color="inherit"
      sx={sx}
      aria-label="toggle theme"
      {...props}
    >
      {darkMode ? <LightModeOutlined /> : <DarkModeOutlined sx={{ color: '#000000' }} />}
    </IconButton>
  );
}
