import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { FiltersPanel } from './components/filters/FiltersPanel';
import { SearchResults } from './features/combinations/components/SearchResults';
import { useState } from 'react';
import { FeedbackDialog } from './components/FeedbackDialog';
const App = () => {
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    return (_jsx(Box, { sx: { minHeight: '100vh', backgroundColor: 'grey.100' }, children: _jsx(Container, { maxWidth: "lg", sx: { py: 4 }, children: _jsxs(Stack, { spacing: 4, children: [_jsxs(Stack, { spacing: 1, children: [_jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 2, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: "space-between", children: [_jsx(Typography, { variant: "h4", fontWeight: 700, children: "PBS Biologics Lookup" }), _jsx(Box, { sx: {
                                            backgroundColor: 'primary.light',
                                            color: 'primary.contrastText',
                                            px: 2,
                                            py: 1,
                                            borderRadius: 1,
                                            fontSize: '0.875rem',
                                            textAlign: 'center',
                                            width: { xs: '100%', sm: 'auto' },
                                            minWidth: { xs: 'auto', sm: '300px' }
                                        }, children: "We're looking for a sponsor. Email admin@rheumai.com to advertise in this space" })] }), _jsx(Box, { children: _jsx(Button, { variant: "outlined", size: "small", onClick: () => setFeedbackOpen(true), children: "Send Feedback" }) })] }), _jsx(FiltersPanel, {}), _jsx(SearchResults, {}), _jsx(FeedbackDialog, { open: feedbackOpen, onClose: () => setFeedbackOpen(false) })] }) }) }));
};
export default App;
