import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Toolbar,
  Typography,
  Tabs,
  Tab
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { DarkModeToggle } from './components/DarkModeToggle';
import { FeedbackDialog } from './components/FeedbackDialog';
import { FiltersPanel } from './components/filters/FiltersPanel';
import { SearchResults } from './features/combinations/components/SearchResults';
import { useSearchStore } from './store/searchStore';

const SponsorBanner = () => (
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
      minWidth: { xs: 'auto', sm: '320px' }
    }}
  >
    We&apos;re looking for a sponsor. Email admin@rheumai.com to advertise in this space
  </Box>
);

const NavButton = ({ to, label }: { to: string; label: string }) => (
  <Button
    component={NavLink}
    to={to}
    variant="text"
    sx={{
      color: 'text.primary',
      textTransform: 'none',
      fontWeight: 600,
      '&.active': {
        color: 'primary.main',
        textDecoration: 'underline',
        textUnderlineOffset: 8
      }
    }}
  >
    {label}
  </Button>
);

const SearchSection = () => (
  <Stack spacing={3}>
    <FiltersPanel />
    <SearchResults />
  </Stack>
);

const Hero = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <Stack spacing={1.5} sx={{ textAlign: { xs: 'left', md: 'center' }, py: { xs: 2, md: 4 } }}>
    <Typography variant="h3" fontWeight={800}>
      {title}
    </Typography>
    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 900, mx: { md: 'auto' } }}>
      {subtitle}
    </Typography>
  </Stack>
);

const SpecialtyCard = ({
  label,
  to,
  description
}: {
  label: string;
  to: string;
  description: string;
}) => (
  <Paper
    variant="outlined"
    sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      textAlign: 'center',
      alignItems: 'center'
    }}
  >
    <Typography variant="h6" fontWeight={700}>
      {label}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
    <Button component={RouterLink} to={to} variant="contained" size="small">
      Explore
    </Button>
  </Paper>
);

const SpecialtyPage = ({
  title,
  description,
  specialty
}: {
  title: string;
  description: string;
  specialty: 'rheumatology' | 'dermatology' | 'gastroenterology';
}) => {
  const setSpecialtyAndReset = useSearchStore((state) => state.setSpecialtyAndReset);

  useEffect(() => {
    setSpecialtyAndReset(specialty);
  }, [specialty, setSpecialtyAndReset]);

  return (
    <Stack spacing={3}>
      <Hero title={title} subtitle={description} />
      <SponsorBanner />
      <SearchSection />
    </Stack>
  );
};

const LandingPage = () => {
  const shortcuts = useMemo(
    () => [
      { label: 'Rheumatology', to: '/rheumatology', blurb: 'Current biologics experience' },
      { label: 'Dermatology', to: '/dermatology', blurb: 'Psoriasis, hidradenitis, atopic dermatitis' },
      { label: 'Gastroenterology', to: '/gastroenterology', blurb: 'IBD, VIPoma, short bowel, GIST' }
    ],
    []
  );

  return (
    <Stack spacing={3}>
      <Hero
        title="Welcome to PBS Biologics Lookup"
        subtitle="Your comprehensive resource on PBS-listed authority medicines. Choose a specialty to explore authority criteria, treatment phases, brands, and PBS item details."
      />
      <SponsorBanner />
      <Grid container spacing={2}>
        {shortcuts.map((link) => (
          <Grid key={link.to} item xs={12} md={4}>
            <SpecialtyCard label={link.label} to={link.to} description={link.blurb} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

const App = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = useMemo(
    () => [
      { label: 'Home', to: '/' },
      { label: 'Rheumatology', to: '/rheumatology' },
      { label: 'Dermatology', to: '/dermatology' },
      { label: 'Gastroenterology', to: '/gastroenterology' }
    ],
    []
  );

  const tabValue = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path === '/') return '/';
    const match = navLinks
      .filter((link) => link.to !== '/')
      .find((link) => path.startsWith(link.to));
    return match?.to ?? '/';
  }, [location.pathname, navLinks]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={(theme) => ({
          borderBottom: 1,
          borderColor: 'divider',
          backdropFilter: 'blur(6px)',
          backgroundColor: alpha(theme.palette.background.paper, 0.9)
        })}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{ py: 1, gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h6" fontWeight={800}>
                PBS Biologics Lookup
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <DarkModeToggle />
                <Button variant="outlined" size="small" onClick={() => setFeedbackOpen(true)}>
                  Send Feedback
                </Button>
              </Stack>
            </Stack>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              sx={{ flexGrow: 1, justifyContent: 'center', display: 'flex' }}
            >
              {navLinks.map((link) => (
                <Tab
                  key={link.to}
                  label={link.label}
                  value={link.to}
                  sx={{ textTransform: 'none', fontWeight: 700, minWidth: 120 }}
                />
              ))}
            </Tabs>
            <SponsorBanner />
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={4}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/rheumatology"
              element={
                <SpecialtyPage
                  title="Rheumatology"
                  description="Rheumatology biologics authority requirements, treatment phases, brands, and PBS codes."
                  specialty="rheumatology"
                />
              }
            />
            <Route
              path="/dermatology"
              element={
                <SpecialtyPage
                  title="Dermatology"
                  description="Dermatology biologics and small molecules for psoriasis, hidradenitis suppurativa, atopic dermatitis, and related indications."
                  specialty="dermatology"
                />
              }
            />
            <Route
              path="/gastroenterology"
              element={
                <SpecialtyPage
                  title="Gastroenterology"
                  description="IBD therapies and other GI biologics/authority items including Crohn disease, ulcerative colitis, VIPoma, and short bowel syndrome."
                  specialty="gastroenterology"
                />
              }
            />
          </Routes>
        </Stack>
      </Container>

      <Divider />
      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </Box>
  );
};

export default App;
