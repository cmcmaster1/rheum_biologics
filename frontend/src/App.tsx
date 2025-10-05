import { Box, Button, Container, Stack, Typography } from '@mui/material';

import { FiltersPanel } from './components/filters/FiltersPanel';
import { SearchResults } from './features/combinations/components/SearchResults';
import { useState } from 'react';
import { FeedbackDialog } from './components/FeedbackDialog';

const App = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.100' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
                We're looking for a sponsor. Email admin@rheumai.com to advertise in this space
              </Box>
            </Stack>
            <Box>
              <Button variant="outlined" size="small" onClick={() => setFeedbackOpen(true)}>
                Send Feedback
              </Button>
            </Box>
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
