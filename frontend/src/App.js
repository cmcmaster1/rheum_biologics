import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { FiltersPanel } from './components/filters/FiltersPanel';
import { SearchResults } from './features/combinations/components/SearchResults';
const App = () => {
    return (_jsx(Box, { sx: { minHeight: '100vh', backgroundColor: 'grey.100' }, children: _jsx(Container, { maxWidth: "lg", sx: { py: 4 }, children: _jsxs(Stack, { spacing: 4, children: [_jsxs(Stack, { spacing: 1, children: [_jsx(Typography, { variant: "h4", fontWeight: 700, children: "PBS Biologics Lookup" }), _jsx(Typography, { color: "text.secondary", children: "Evidence-based biologic prescribing support for rheumatologists. Data sourced from the Australian Pharmaceutical Benefits Scheme (PBS)." }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["Latest releases available monthly. For feedback contact", ' ', _jsx(Link, { href: "mailto:pbs-support@example.com", children: "pbs-support@example.com" }), "."] })] }), _jsx(FiltersPanel, {}), _jsx(SearchResults, {})] }) }) }));
};
export default App;
