import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { DarkModeToggle } from './components/DarkModeToggle';
import { FeedbackDialog } from './components/FeedbackDialog';
import { FiltersPanel } from './components/filters/FiltersPanel';
import { SearchResults } from './features/combinations/components/SearchResults';

const App = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
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
            <Stack direction="row" spacing={1} alignItems="center">
              <DarkModeToggle />
              <Button variant="outlined" size="small" onClick={() => setFeedbackOpen(true)}>
                Send Feedback
              </Button>
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

export default App;
