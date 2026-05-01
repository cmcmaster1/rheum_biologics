import { Box, Button, Container, Link, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import { trackAnalyticsEvent } from './api/analytics';
import { DarkModeToggle } from './components/DarkModeToggle';
import { FeedbackDialog } from './components/FeedbackDialog';
import { FiltersPanel } from './components/filters/FiltersPanel';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { SearchResults } from './features/combinations/components/SearchResults';
import { useAnalyticsPageView } from './hooks/useAnalyticsPageView';

const LookupPage = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  useAnalyticsPageView();

  const handleFeedbackOpen = () => {
    trackAnalyticsEvent({ eventName: 'feedback_opened' });
    setFeedbackOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              <Typography variant="h4" fontWeight={700}>
                PBS Biologics Lookup
              </Typography>
              <Box 
                sx={{ 
                  backgroundColor: 'primary.light', 
                  color: 'primary.contrastText',
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { xs: 'auto', sm: '300px' }
                }}
              >
                We&apos;re looking for a sponsor. Email admin@rheumai.com to advertise in this space
              </Box>
            </Stack>
            <Stack spacing={0.75} alignItems="flex-start">
              <Stack direction="row" spacing={1} alignItems="center">
                <DarkModeToggle />
                <Button variant="outlined" size="small" onClick={handleFeedbackOpen}>
                  Send Feedback
                </Button>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Please bookmark the new address{' '}
                <Link href="https://www.rheumbiologics.com/" underline="hover">
                  www.rheumbiologics.com
                </Link>
              </Typography>
            </Stack>
          </Stack>

          <FiltersPanel />

          <SearchResults />
          <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
        </Stack>
      </Container>
    </Box>
  );
};

const App = () => (
  <Routes>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="*" element={<LookupPage />} />
  </Routes>
);

export default App;
