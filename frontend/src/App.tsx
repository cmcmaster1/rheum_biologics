import { Box, Container, Link, Stack, Typography } from '@mui/material';

import { FiltersPanel } from './components/filters/FiltersPanel';
import { SearchResults } from './features/combinations/components/SearchResults';

const App = () => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.100' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={700}>
              PBS Biologics Lookup
            </Typography>
            <Typography color="text.secondary">
              Evidence-based biologic prescribing support for rheumatologists. Data sourced from the
              Australian Pharmaceutical Benefits Scheme (PBS).
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Latest releases available monthly. For feedback contact{' '}
              <Link href="mailto:pbs-support@example.com">pbs-support@example.com</Link>.
            </Typography>
          </Stack>

          <FiltersPanel />

          <SearchResults />
        </Stack>
      </Container>
    </Box>
  );
};

export default App;
