import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useMemo, useState } from 'react';

import {
  AnalyticsSummary,
  dashboardCsvUrl,
  getDashboardAnalytics,
  getDashboardMe,
  getDashboardStatus,
  loginDashboard,
  logoutDashboard,
  setupDashboard
} from '../../api/dashboard';

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
    return <LinearProgress />;
  }

  if (statusQuery.isError || !statusQuery.data) {
    return (
      <DashboardShell>
        <Alert severity="error">Dashboard status could not be loaded.</Alert>
      </DashboardShell>
    );
  }

  if (!meQuery.isSuccess) {
    return (
      <DashboardShell>
        <AuthPanel status={statusQuery.data} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Analytics Dashboard
            </Typography>
            <Typography color="text.secondary">
              Signed in as {meQuery.data.email}. Unique visitors are anonymous browser/device IDs.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="outlined"
              href={dashboardCsvUrl(days, eventName)}
              target="_blank"
              rel="noreferrer"
            >
              Download CSV
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => logoutMutation.mutate()}
            >
              Log out
            </Button>
          </Stack>
        </Stack>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Days"
              type="number"
              value={days}
              onChange={(event) => setDays(Number(event.target.value) || 30)}
              inputProps={{ min: 1, max: 365 }}
              sx={{ width: { xs: '100%', sm: 140 } }}
            />
            <FormControl sx={{ minWidth: { xs: '100%', sm: 220 } }}>
              <InputLabel id="event-filter-label">Event</InputLabel>
              <Select
                labelId="event-filter-label"
                label="Event"
                value={eventName}
                onChange={(event) => setEventName(event.target.value)}
              >
                {eventOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {analyticsQuery.isLoading && <LinearProgress />}
        {analyticsQuery.isError && <Alert severity="error">Analytics could not be loaded.</Alert>}
        {analyticsQuery.data && <DashboardAnalytics summary={analyticsQuery.data} />}
      </Stack>
    </DashboardShell>
  );
};

const AuthPanel = ({ status }: { status: { email: string; passwordSet: boolean } }) => {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState(status.email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      status.passwordSet ? loginDashboard(email, password) : setupDashboard(email, password),
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['dashboard-status'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-me'] });
    },
    onError: (mutationError: any) => {
      setError(mutationError?.response?.data?.message || 'Dashboard access failed.');
    }
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <Paper
      component="form"
      variant="outlined"
      onSubmit={handleSubmit}
      sx={{ p: 3, maxWidth: 460, mx: 'auto', borderRadius: 1 }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Analytics Dashboard
          </Typography>
          <Typography color="text.secondary">
            {status.passwordSet
              ? 'Log in to view private analytics.'
              : 'Set the dashboard password for first-time access.'}
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {!status.passwordSet && (
          <Alert severity="info">Only {status.email} can complete first-time setup.</Alert>
        )}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <TextField
          label={status.passwordSet ? 'Password' : 'New password'}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          helperText={status.passwordSet ? undefined : 'Use at least 12 characters.'}
        />
        <Button type="submit" variant="contained" disabled={mutation.isPending}>
          {status.passwordSet ? 'Log in' : 'Set password'}
        </Button>
      </Stack>
    </Paper>
  );
};

const DashboardAnalytics = ({ summary }: { summary: AnalyticsSummary }) => {
  const maxDailyEvents = Math.max(...summary.daily.map((day) => day.events), 1);

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))'
          },
          gap: 2
        }}
      >
        <Metric label="Events" value={summary.overview.total_events} />
        <Metric label="Sessions" value={summary.overview.sessions} />
        <Metric label="Unique devices" value={summary.overview.visitors} />
        <Metric label="Searches" value={summary.overview.searches} />
        <Metric label="Page views" value={summary.overview.page_views} />
        <Metric label="Outbound clicks" value={summary.overview.outbound_clicks} />
        <Metric label="Feedback opens" value={summary.overview.feedback_opens} />
        <Metric label="Period" value={`${summary.days} days`} />
      </Box>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Daily Activity
        </Typography>
        <Stack spacing={1.25}>
          {summary.daily.map((day) => (
            <Stack key={day.date} spacing={0.5}>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography variant="body2">{formatDate(day.date)}</Typography>
                <Typography variant="body2" fontWeight={700}>
                  {day.events} events · {day.sessions} sessions
                </Typography>
              </Stack>
              <Box sx={{ height: 10, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Box
                  sx={{
                    width: `${Math.max((day.events / maxDailyEvents) * 100, 2)}%`,
                    height: '100%',
                    bgcolor: 'primary.main',
                    borderRadius: 1
                  }}
                />
              </Box>
            </Stack>
          ))}
        </Stack>
      </Paper>

      <DataTable
        title="Event Breakdown"
        rows={summary.eventBreakdown}
        columns={[
          ['event_name', 'Event'],
          ['events', 'Events'],
          ['sessions', 'Sessions'],
          ['visitors', 'Devices']
        ]}
      />
      <DataTable
        title="Top Filters"
        rows={summary.topFilters}
        columns={[
          ['filter_key', 'Filter'],
          ['value_label', 'Value'],
          ['count', 'Changes']
        ]}
      />
      <DataTable
        title="Top Drugs Clicked"
        rows={summary.topDrugs}
        columns={[
          ['drug', 'Drug'],
          ['clicks', 'Clicks']
        ]}
      />
      <DataTable
        title="Top Pages"
        rows={summary.topPages}
        columns={[
          ['path', 'Path'],
          ['events', 'Events'],
          ['sessions', 'Sessions'],
          ['visitors', 'Devices']
        ]}
      />
      <DataTable
        title="Timezones"
        rows={summary.topTimezones}
        columns={[
          ['timezone', 'Timezone'],
          ['events', 'Events'],
          ['sessions', 'Sessions'],
          ['visitors', 'Devices']
        ]}
      />
    </Stack>
  );
};

const Metric = ({ label, value }: { label: string; value: number | string }) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h4" fontWeight={700}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </Typography>
  </Paper>
);

const DataTable = ({
  title,
  rows,
  columns
}: {
  title: string;
  rows: Array<Record<string, any>>;
  columns: Array<[string, string]>;
}) => {
  const visibleRows = useMemo(() => rows.slice(0, 50), [rows]);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map(([, label]) => (
                <TableCell key={label}>{label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length}>No data for this filter.</TableCell>
              </TableRow>
            )}
            {visibleRows.map((row, index) => (
              <TableRow key={index}>
                {columns.map(([key]) => (
                  <TableCell key={key}>{formatCell(row[key])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};

const DashboardShell = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      {children}
    </Container>
  </Box>
);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date));

const formatCell = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  return String(value);
};
