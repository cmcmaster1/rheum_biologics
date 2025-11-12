import { jsx as _jsx } from "react/jsx-runtime";
import { IconButton, Tooltip } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
export const DarkModeToggle = () => {
    const { mode, toggleMode } = useTheme();
    return (_jsx(Tooltip, { title: `Switch to ${mode === 'light' ? 'dark' : 'light'} mode`, children: _jsx(IconButton, { onClick: toggleMode, color: "inherit", children: mode === 'light' ? _jsx(DarkMode, {}) : _jsx(LightMode, {}) }) }));
};
