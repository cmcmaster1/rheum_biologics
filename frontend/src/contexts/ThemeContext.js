import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
const ThemeContext = createContext(undefined);
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
export const CustomThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        // Check localStorage first, then system preference
        const savedMode = localStorage.getItem('themeMode');
        if (savedMode) {
            return savedMode;
        }
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });
    const toggleMode = () => {
        setMode((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            localStorage.setItem('themeMode', newMode);
            return newMode;
        });
    };
    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            // Only update if user hasn't manually set a preference
            if (!localStorage.getItem('themeMode')) {
                setMode(e.matches ? 'dark' : 'light');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    const theme = createTheme({
        palette: {
            mode,
            primary: {
                main: mode === 'dark' ? '#90caf9' : '#1b5e20',
                light: mode === 'dark' ? '#bbdefb' : '#42a5f5',
                dark: mode === 'dark' ? '#42a5f5' : '#1565c0',
                contrastText: mode === 'dark' ? '#000' : '#fff',
            },
            secondary: {
                main: mode === 'dark' ? '#f48fb1' : '#00695c',
                light: mode === 'dark' ? '#f8bbd9' : '#ff5983',
                dark: mode === 'dark' ? '#c2185b' : '#9a0036',
            },
            background: {
                default: mode === 'dark' ? '#121212' : '#f5f5f5',
                paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
            },
            text: {
                primary: mode === 'dark' ? '#ffffff' : '#000000',
                secondary: mode === 'dark' ? '#b3b3b3' : '#666666',
            },
        },
        typography: {
            fontFamily: "'Inter', sans-serif"
        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
                        borderColor: mode === 'dark' ? '#333333' : '#e0e0e0',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
                        borderColor: mode === 'dark' ? '#333333' : '#e0e0e0',
                    },
                },
            },
        },
    });
    return (_jsx(ThemeContext.Provider, { value: { mode, toggleMode }, children: _jsxs(ThemeProvider, { theme: theme, children: [_jsx(CssBaseline, {}), children] }) }));
};
