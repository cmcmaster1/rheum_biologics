import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, Box, Button, Container, FormControl, InputLabel, LinearProgress, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { dashboardCsvUrl, getDashboardAnalytics, getDashboardMe, getDashboardStatus, loginDashboard, logoutDashboard, setupDashboard } from '../../api/dashboard';
const eventOptions = [
    { value: '', label: 'All events' },
    { value: 'page_view', label: 'Page views' },
    { value: 'session_start', label: 'Session starts' },
    { value: 'search_results', label: 'Searches' },
    { value: 'filter_changed', label: 'Filter changes' },
    { value: 'outbound_link_click', label: 'Outbound clicks' },
    { value: 'feedback_opened', label: 'Feedback opens' }
];
export const DashboardPage = () => {
    const queryClient = useQueryClient();
    const [days, setDays] = useState(30);
    const [eventName, setEventName] = useState('');
    const statusQuery = useQuery({
        queryKey: ['dashboard-status'],
        queryFn: getDashboardStatus
    });
    const meQuery = useQuery({
        queryKey: ['dashboard-me'],
        queryFn: getDashboardMe,
        retry: false
    });
    const analyticsQuery = useQuery({
        queryKey: ['dashboard-analytics', days, eventName],
        queryFn: () => getDashboardAnalytics(days, eventName),
        enabled: meQuery.isSuccess
    });
    const logoutMutation = useMutation({
        mutationFn: logoutDashboard,
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['dashboard-me'] });
            queryClient.removeQueries({ queryKey: ['dashboard-analytics'] });
            void queryClient.invalidateQueries({ queryKey: ['dashboard-status'] });
        }
    });
    if (statusQuery.isLoading) {
        return _jsx(LinearProgress, {});
    }
    if (statusQuery.isError || !statusQuery.data) {
        return (_jsx(DashboardShell, { children: _jsx(Alert, { severity: "error", children: "Dashboard status could not be loaded." }) }));
    }
    if (!meQuery.isSuccess) {
        return (_jsx(DashboardShell, { children: _jsx(AuthPanel, { status: statusQuery.data }) }));
    }
    return (_jsx(DashboardShell, { children: _jsxs(Stack, { spacing: 3, children: [_jsxs(Stack, { direction: { xs: 'column', md: 'row' }, spacing: 2, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: "space-between", children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", fontWeight: 700, children: "Analytics Dashboard" }), _jsxs(Typography, { color: "text.secondary", children: ["Signed in as ", meQuery.data.email, ". Unique visitors are anonymous browser/device IDs."] })] }), _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 1, children: [_jsx(Button, { variant: "outlined", href: dashboardCsvUrl(days, eventName), target: "_blank", rel: "noreferrer", children: "Download CSV" }), _jsx(Button, { variant: "outlined", color: "inherit", onClick: () => logoutMutation.mutate(), children: "Log out" })] })] }), _jsx(Paper, { variant: "outlined", sx: { p: 2, borderRadius: 1 }, children: _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 2, children: [_jsx(TextField, { label: "Days", type: "number", value: days, onChange: (event) => setDays(Number(event.target.value) || 30), inputProps: { min: 1, max: 365 }, sx: { width: { xs: '100%', sm: 140 } } }), _jsxs(FormControl, { sx: { minWidth: { xs: '100%', sm: 220 } }, children: [_jsx(InputLabel, { id: "event-filter-label", children: "Event" }), _jsx(Select, { labelId: "event-filter-label", label: "Event", value: eventName, onChange: (event) => setEventName(event.target.value), children: eventOptions.map((option) => (_jsx(MenuItem, { value: option.value, children: option.label }, option.value))) })] })] }) }), analyticsQuery.isLoading && _jsx(LinearProgress, {}), analyticsQuery.isError && _jsx(Alert, { severity: "error", children: "Analytics could not be loaded." }), analyticsQuery.data && _jsx(DashboardAnalytics, { summary: analyticsQuery.data })] }) }));
};
const AuthPanel = ({ status }) => {
    const queryClient = useQueryClient();
    const [email, setEmail] = useState(status.email);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const mutation = useMutation({
        mutationFn: () => status.passwordSet ? loginDashboard(email, password) : setupDashboard(email, password),
        onSuccess: () => {
            setError(null);
            void queryClient.invalidateQueries({ queryKey: ['dashboard-status'] });
            void queryClient.invalidateQueries({ queryKey: ['dashboard-me'] });
        },
        onError: (mutationError) => {
            setError(mutationError?.response?.data?.message || 'Dashboard access failed.');
        }
    });
    const handleSubmit = (event) => {
        event.preventDefault();
        mutation.mutate();
    };
    return (_jsx(Paper, { component: "form", variant: "outlined", onSubmit: handleSubmit, sx: { p: 3, maxWidth: 460, mx: 'auto', borderRadius: 1 }, children: _jsxs(Stack, { spacing: 2, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h5", fontWeight: 700, children: "Analytics Dashboard" }), _jsx(Typography, { color: "text.secondary", children: status.passwordSet
                                ? 'Log in to view private analytics.'
                                : 'Set the dashboard password for first-time access.' })] }), error && _jsx(Alert, { severity: "error", children: error }), !status.passwordSet && (_jsxs(Alert, { severity: "info", children: ["Only ", status.email, " can complete first-time setup."] })), _jsx(TextField, { label: "Email", type: "email", value: email, onChange: (event) => setEmail(event.target.value), required: true }), _jsx(TextField, { label: status.passwordSet ? 'Password' : 'New password', type: "password", value: password, onChange: (event) => setPassword(event.target.value), required: true, helperText: status.passwordSet ? undefined : 'Use at least 12 characters.' }), _jsx(Button, { type: "submit", variant: "contained", disabled: mutation.isPending, children: status.passwordSet ? 'Log in' : 'Set password' })] }) }));
};
const DashboardAnalytics = ({ summary }) => {
    const maxDailyEvents = Math.max(...summary.daily.map((day) => day.events), 1);
    return (_jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { sx: {
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, minmax(0, 1fr))',
                        md: 'repeat(4, minmax(0, 1fr))'
                    },
                    gap: 2
                }, children: [_jsx(Metric, { label: "Events", value: summary.overview.total_events }), _jsx(Metric, { label: "Sessions", value: summary.overview.sessions }), _jsx(Metric, { label: "Unique devices", value: summary.overview.visitors }), _jsx(Metric, { label: "Searches", value: summary.overview.searches }), _jsx(Metric, { label: "Page views", value: summary.overview.page_views }), _jsx(Metric, { label: "Outbound clicks", value: summary.overview.outbound_clicks }), _jsx(Metric, { label: "Feedback opens", value: summary.overview.feedback_opens }), _jsx(Metric, { label: "Period", value: `${summary.days} days` })] }), _jsxs(Paper, { variant: "outlined", sx: { p: 2, borderRadius: 1 }, children: [_jsx(Typography, { variant: "h6", fontWeight: 700, gutterBottom: true, children: "Daily Activity" }), _jsx(Stack, { spacing: 1.25, children: summary.daily.map((day) => (_jsxs(Stack, { spacing: 0.5, children: [_jsxs(Stack, { direction: "row", justifyContent: "space-between", spacing: 2, children: [_jsx(Typography, { variant: "body2", children: formatDate(day.date) }), _jsxs(Typography, { variant: "body2", fontWeight: 700, children: [day.events, " events \u00B7 ", day.sessions, " sessions"] })] }), _jsx(Box, { sx: { height: 10, bgcolor: 'action.hover', borderRadius: 1 }, children: _jsx(Box, { sx: {
                                            width: `${Math.max((day.events / maxDailyEvents) * 100, 2)}%`,
                                            height: '100%',
                                            bgcolor: 'primary.main',
                                            borderRadius: 1
                                        } }) })] }, day.date))) })] }), _jsx(DataTable, { title: "Event Breakdown", rows: summary.eventBreakdown, columns: [
                    ['event_name', 'Event'],
                    ['events', 'Events'],
                    ['sessions', 'Sessions'],
                    ['visitors', 'Devices']
                ] }), _jsx(DataTable, { title: "Top Filters", rows: summary.topFilters, columns: [
                    ['filter_key', 'Filter'],
                    ['value_label', 'Value'],
                    ['count', 'Changes']
                ] }), _jsx(DataTable, { title: "Top Drugs Clicked", rows: summary.topDrugs, columns: [
                    ['drug', 'Drug'],
                    ['clicks', 'Clicks']
                ] }), _jsx(DataTable, { title: "Top Pages", rows: summary.topPages, columns: [
                    ['path', 'Path'],
                    ['events', 'Events'],
                    ['sessions', 'Sessions'],
                    ['visitors', 'Devices']
                ] }), _jsx(DataTable, { title: "Timezones", rows: summary.topTimezones, columns: [
                    ['timezone', 'Timezone'],
                    ['events', 'Events'],
                    ['sessions', 'Sessions'],
                    ['visitors', 'Devices']
                ] })] }));
};
const Metric = ({ label, value }) => (_jsxs(Paper, { variant: "outlined", sx: { p: 2, borderRadius: 1 }, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: label }), _jsx(Typography, { variant: "h4", fontWeight: 700, children: typeof value === 'number' ? value.toLocaleString() : value })] }));
const DataTable = ({ title, rows, columns }) => {
    const visibleRows = useMemo(() => rows.slice(0, 50), [rows]);
    return (_jsxs(Paper, { variant: "outlined", sx: { borderRadius: 1, overflow: 'hidden' }, children: [_jsx(Box, { sx: { p: 2 }, children: _jsx(Typography, { variant: "h6", fontWeight: 700, children: title }) }), _jsx(Box, { sx: { overflowX: 'auto' }, children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsx(TableRow, { children: columns.map(([, label]) => (_jsx(TableCell, { children: label }, label))) }) }), _jsxs(TableBody, { children: [visibleRows.length === 0 && (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: columns.length, children: "No data for this filter." }) })), visibleRows.map((row, index) => (_jsx(TableRow, { children: columns.map(([key]) => (_jsx(TableCell, { children: formatCell(row[key]) }, key))) }, index)))] })] }) })] }));
};
const DashboardShell = ({ children }) => (_jsx(Box, { sx: { minHeight: '100vh', backgroundColor: 'background.default' }, children: _jsx(Container, { maxWidth: "lg", sx: { py: 4, px: { xs: 2, sm: 3 } }, children: children }) }));
const formatDate = (date) => new Intl.DateTimeFormat('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
}).format(new Date(date));
const formatCell = (value) => {
    if (value === null || value === undefined || value === '') {
        return '-';
    }
    if (typeof value === 'number') {
        return value.toLocaleString();
    }
    return String(value);
};
