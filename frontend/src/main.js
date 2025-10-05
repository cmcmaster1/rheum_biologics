import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
const queryClient = new QueryClient();
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1b5e20'
        },
        secondary: {
            main: '#00695c'
        }
    },
    typography: {
        fontFamily: "'Inter', sans-serif"
    }
});
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsxs(ThemeProvider, { theme: theme, children: [_jsx(CssBaseline, {}), _jsx(App, {})] }) }) }));
