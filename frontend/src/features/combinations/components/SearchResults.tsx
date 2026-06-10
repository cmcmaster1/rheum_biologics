import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Link,
  Pagination,
  Stack,
  Typography
} from '@mui/material';
import { useEffect, useMemo, useRef } from 'react';

import { trackAnalyticsEvent } from '../../../api/analytics';
import { useSearchStore } from '../../../store/searchStore';
import { getARALink, hasARALink } from '../../../utils/araLinks';
import type { CombinationQuery } from '../api';
import { useCombinationSearch } from '../hooks/useCombinationSearch';

type OutboundDestination = 'ara' | 'pbs' | 'patient_support' | 'compassionate_access';

const ResultCard = ({
  drug,
  brand,
  pbsCode,
  formulation,
  indication,
  treatmentPhase,
  hospitalType,
  authorityMethod,
  streamlinedCode,
  onlineApplication,
  maximumQuantity,
  maximumPack,
  repeats,
  companyOrSponsor,
  patientSupportProgram,
  patientSupportUrl,
  compassionateAccessProgram,
  compassionateAccessUrl,
  scheduleMonth,
  scheduleYear
}: {
  drug: string;
  brand: string;
  pbsCode: string;
  formulation: string;
  indication: string;
  treatmentPhase: string | null;
  hospitalType: string | null;
  authorityMethod: string | null;
  streamlinedCode: string | null;
  onlineApplication: boolean | null;
  maximumQuantity: number | null;
  maximumPack: number | null;
  repeats: number | null;
  companyOrSponsor: string | null;
  patientSupportProgram: string | null;
  patientSupportUrl: string | null;
  compassionateAccessProgram: string | null;
  compassionateAccessUrl: string | null;
  scheduleMonth: string;
  scheduleYear: number;
}) => (
  <Card variant="outlined" sx={{ 
    height: '100%',
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden'
  }}>
    <CardContent sx={{ 
      padding: { xs: 1.5, sm: 2 },
      '&:last-child': { 
        paddingBottom: { xs: 1.5, sm: 2 } 
      },
      overflow: 'hidden',
      wordWrap: 'break-word'
    }}>
      <Stack spacing={{ xs: 0.8, sm: 1.2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          spacing={{ xs: 0.5, sm: 0 }}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>{drug}</Typography>
              {hasARALink(drug) && (
                <Link
                  href={getARALink(drug)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    color: 'primary.main',
                    fontWeight: 500
                  }}
                  {...analyticsLinkAttributes({
                    destination: 'ara',
                    targetUrl: getARALink(drug)!,
                    linkText: 'ARA Info',
                    drug,
                    brand,
                    pbsCode,
                    indication,
                    scheduleMonth,
                    scheduleYear
                  })}
                >
                  ARA Info
                </Link>
              )}
            </Stack>
            <Typography color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{brand}</Typography>
          </Box>
          <Typography variant="body2" fontWeight={600} sx={{ 
            mt: { xs: 1, sm: 0 },
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}>
            <Link
              href={`https://www.pbs.gov.au/medicine/item/${pbsCode}`}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              {...analyticsLinkAttributes({
                destination: 'pbs',
                targetUrl: `https://www.pbs.gov.au/medicine/item/${pbsCode}`,
                linkText: `PBS ${pbsCode}`,
                drug,
                brand,
                pbsCode,
                indication,
                scheduleMonth,
                scheduleYear
              })}
            >
              PBS {pbsCode}
            </Link>
          </Typography>
        </Stack>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          {formulation}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Indication: {indication}</Typography>
        {treatmentPhase && (
          <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Treatment phase: {treatmentPhase}</Typography>
        )}
        {hospitalType && <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Hospital type: {hospitalType}</Typography>}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 1 }}>
          {authorityMethod && (
            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Authority: {authorityMethod}</Typography>
          )}
          {streamlinedCode && (
            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Streamlined: {streamlinedCode}</Typography>
          )}
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 1 }}>
          {maximumPackageText(maximumPack, maximumQuantity)}
          {repeats !== null && <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Repeats: {repeats}</Typography>}
        </Stack>
        {onlineApplication !== null && (
          <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Online application: {onlineApplication ? 'Available' : 'Contact Services Australia'}
          </Typography>
        )}
        {(patientSupportUrl || compassionateAccessUrl) && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 1 }}>
            {patientSupportUrl && (
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Patient support:{' '}
                <Link
                  href={patientSupportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  {...analyticsLinkAttributes({
                    destination: 'patient_support',
                    targetUrl: patientSupportUrl,
                    linkText: patientSupportProgram ?? companyOrSponsor ?? 'Program link',
                    drug,
                    brand,
                    pbsCode,
                    indication,
                    scheduleMonth,
                    scheduleYear
                  })}
                >
                  {patientSupportProgram ?? companyOrSponsor ?? 'Program link'}
                </Link>
              </Typography>
            )}
            {compassionateAccessUrl && (
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Access program:{' '}
                <Link
                  href={compassionateAccessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  {...analyticsLinkAttributes({
                    destination: 'compassionate_access',
                    targetUrl: compassionateAccessUrl,
                    linkText: compassionateAccessProgram ?? companyOrSponsor ?? 'Program link',
                    drug,
                    brand,
                    pbsCode,
                    indication,
                    scheduleMonth,
                    scheduleYear
                  })}
                >
                  {compassionateAccessProgram ?? companyOrSponsor ?? 'Program link'}
                </Link>
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </CardContent>
  </Card>
);

const analyticsLinkAttributes = ({
  destination,
  targetUrl,
  linkText,
  drug,
  brand,
  pbsCode,
  indication,
  scheduleMonth,
  scheduleYear
}: {
  destination: OutboundDestination;
  targetUrl: string;
  linkText: string;
  drug: string;
  brand: string;
  pbsCode: string;
  indication: string;
  scheduleMonth: string;
  scheduleYear: number;
}) => ({
  'data-analytics-destination': destination,
  'data-analytics-target-url': targetUrl,
  'data-analytics-link-text': linkText,
  'data-analytics-drug': drug,
  'data-analytics-brand': brand,
  'data-analytics-pbs-code': pbsCode,
  'data-analytics-indication': indication,
  'data-analytics-schedule-month': scheduleMonth,
  'data-analytics-schedule-year': String(scheduleYear)
});

const maximumPackageText = (pack: number | null, units: number | null) => {
  if (pack === null && units === null) {
    return null;
  }

  const parts: string[] = [];
  if (pack !== null) {
    parts.push(`Pack: ${pack}`);
  }
  if (units !== null) {
    parts.push(`Quantity: ${units}`);
  }

  return <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{parts.join(' | ')}</Typography>;
};

export const SearchResults = () => {
  const { data, isLoading, isError, error, queryParams } = useCombinationSearch();
  const page = useSearchStore((state) => state.page);
  const limit = useSearchStore((state) => state.limit);
  const setPage = useSearchStore((state) => state.setPage);
  const lastSearchEventKey = useRef<string | null>(null);
  const searchAnalyticsPayload = useMemo(
    () => buildSearchAnalyticsPayload(queryParams),
    [queryParams]
  );

  useEffect(() => {
    const handleAnalyticsLinkClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest<HTMLAnchorElement>('a[data-analytics-destination]');
      if (!link) {
        return;
      }

      trackAnalyticsEvent({
        eventName: 'outbound_link_click',
        payload: {
          destination: link.dataset.analyticsDestination,
          targetUrl: link.dataset.analyticsTargetUrl ?? link.href,
          linkText: link.dataset.analyticsLinkText ?? link.textContent?.trim(),
          drug: link.dataset.analyticsDrug,
          brand: link.dataset.analyticsBrand,
          pbsCode: link.dataset.analyticsPbsCode,
          indication: link.dataset.analyticsIndication,
          scheduleMonth: link.dataset.analyticsScheduleMonth,
          scheduleYear: Number(link.dataset.analyticsScheduleYear)
        }
      });
    };

    document.addEventListener('click', handleAnalyticsLinkClick, { capture: true });
    return () => document.removeEventListener('click', handleAnalyticsLinkClick, { capture: true });
  }, []);

  useEffect(() => {
    if (!data || isLoading || isError) {
      return;
    }

    const eventKey = JSON.stringify({
      queryParams,
      total: data.meta.total
    });

    if (lastSearchEventKey.current === eventKey) {
      return;
    }

    lastSearchEventKey.current = eventKey;
    trackAnalyticsEvent({
      eventName: 'search_results',
      payload: {
        ...searchAnalyticsPayload,
        visibleResults: data.data.length,
        totalResults: data.meta.total,
        page
      }
    });
  }, [data, isError, isLoading, page, queryParams, searchAnalyticsPayload]);

  const handlePageChange = (value: number) => {
    trackAnalyticsEvent({
      eventName: 'pagination_changed',
      payload: {
        fromPage: page,
        toPage: value,
        ...searchAnalyticsPayload
      }
    });
    setPage(value);
  };

  if (isLoading) {
    return (
      <Stack alignItems="center" py={6} spacing={2}>
        <CircularProgress />
        <Typography>Loading combinations…</Typography>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">{error instanceof Error ? error.message : 'Failed to load combinations'}</Alert>
    );
  }

  const combinations = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (total === 0) {
    return (
      <Stack spacing={2} py={6} alignItems="center">
        <Typography variant="h6">No results</Typography>
        <Typography color="text.secondary" align="center">
          Try adjusting your filters or selecting a different schedule.
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="body2" color="text.secondary">
        Showing {combinations.length} of {total} results · Latest schedule {combinations[0]?.schedule_month} {combinations[0]?.schedule_year}
      </Typography>
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        {combinations.map((combination) => (
          <Grid key={combination.id} item xs={12} md={6}>
            <ResultCard
              drug={combination.drug}
              brand={combination.brand}
              pbsCode={combination.pbs_code}
              formulation={combination.formulation}
              indication={combination.indication}
              treatmentPhase={combination.treatment_phase}
              hospitalType={combination.hospital_type}
              authorityMethod={combination.authority_method}
              streamlinedCode={combination.streamlined_code}
              onlineApplication={combination.online_application}
              maximumQuantity={combination.maximum_quantity_units}
              maximumPack={combination.maximum_prescribable_pack}
              repeats={combination.number_of_repeats}
              companyOrSponsor={combination.company_or_sponsor}
              patientSupportProgram={combination.patient_support_program}
              patientSupportUrl={combination.patient_support_url}
              compassionateAccessProgram={combination.compassionate_access_program}
              compassionateAccessUrl={combination.compassionate_access_url}
              scheduleMonth={combination.schedule_month}
              scheduleYear={combination.schedule_year}
            />
          </Grid>
        ))}
      </Grid>
      {totalPages > 1 && (
        <Stack alignItems="center">
          <Pagination
            count={totalPages}
            color="primary"
            page={page}
            onChange={(_event, value) => handlePageChange(value)}
            showFirstButton
            showLastButton
          />
        </Stack>
      )}
    </Stack>
  );
};

const buildSearchAnalyticsPayload = (queryParams: CombinationQuery) => {
  const filters = {
    scheduleYear: queryParams.schedule_year,
    scheduleMonth: queryParams.schedule_month,
    drug: queryParams.drug ?? [],
    brand: queryParams.brand ?? [],
    formulation: queryParams.formulation ?? [],
    indication: queryParams.indication ?? [],
    treatmentPhase: queryParams.treatment_phase ?? [],
    hospitalType: queryParams.hospital_type ?? [],
    pbsCode: queryParams.pbs_code ?? []
  };

  const activeFilterCount = Object.values(filters).filter((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== undefined && value !== '';
  }).length;

  return {
    activeFilterCount,
    filters,
    limit: queryParams.limit,
    offset: queryParams.offset
  };
};
