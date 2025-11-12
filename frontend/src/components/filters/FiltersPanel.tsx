import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';

import { useLookupOptions } from '../../hooks/useLookupOptions';
import type { FilterKey } from '../../store/searchStore';
import { useSearchStore } from '../../store/searchStore';

import { MultiFilter } from './MultiFilter';
import { ScheduleSelect } from './ScheduleSelect';

export const FiltersPanel = () => {
  const scheduleYear = useSearchStore((state) => state.scheduleYear);
  const scheduleMonth = useSearchStore((state) => state.scheduleMonth);
  const drug = useSearchStore((state) => state.drug);
  const brand = useSearchStore((state) => state.brand);
  const formulation = useSearchStore((state) => state.formulation);
  const indication = useSearchStore((state) => state.indication);
  const treatmentPhase = useSearchStore((state) => state.treatmentPhase);
  const hospitalType = useSearchStore((state) => state.hospitalType);
  const pbsCode = useSearchStore((state) => state.pbsCode);
  const setFilter = useSearchStore((state) => state.setFilter);
  const resetFilters = useSearchStore((state) => state.resetFilters);

  const buildLookupParams = useCallback(
    (exclude?: FilterKey): Record<string, string | number | undefined> => {
      const params: Record<string, string | number | undefined> = {};

      if (scheduleYear) params.schedule_year = scheduleYear;
      if (scheduleMonth) params.schedule_month = scheduleMonth;

      if (exclude !== 'drug' && drug.length) params.drug = drug.join(',');
      if (exclude !== 'brand' && brand.length) params.brand = brand.join(',');
      if (exclude !== 'formulation' && formulation.length) params.formulation = formulation.join(',');
      if (exclude !== 'indication' && indication.length) params.indication = indication.join(',');
      if (exclude !== 'treatmentPhase' && treatmentPhase.length)
        params.treatment_phase = treatmentPhase.join(',');
      if (exclude !== 'hospitalType' && hospitalType.length)
        params.hospital_type = hospitalType.join(',');
      if (exclude !== 'pbsCode' && pbsCode.length)
        params.pbs_code = pbsCode.join(',');

      return params;
    },
    [brand, drug, formulation, hospitalType, indication, scheduleMonth, scheduleYear, treatmentPhase, pbsCode]
  );

  const drugsParams = useMemo(() => buildLookupParams('drug'), [buildLookupParams]);
  const brandsParams = useMemo(() => buildLookupParams('brand'), [buildLookupParams]);
  const indicationsParams = useMemo(() => buildLookupParams('indication'), [buildLookupParams]);
  const formulationsParams = useMemo(() => buildLookupParams('formulation'), [buildLookupParams]);
  const treatmentPhasesParams = useMemo(
    () => buildLookupParams('treatmentPhase'),
    [buildLookupParams]
  );
  const hospitalTypesParams = useMemo(
    () => buildLookupParams('hospitalType'),
    [buildLookupParams]
  );
  const pbsCodesParams = useMemo(
    () => buildLookupParams('pbsCode'),
    [buildLookupParams]
  );

  const drugsQuery = useLookupOptions('drugs', drugsParams);
  const brandsQuery = useLookupOptions('brands', brandsParams);
  const indicationsQuery = useLookupOptions('indications', indicationsParams);
  const formulationsQuery = useLookupOptions('formulations', formulationsParams);
  const treatmentPhasesQuery = useLookupOptions('treatment-phases', treatmentPhasesParams);
  const hospitalTypesQuery = useLookupOptions('hospital-types', hospitalTypesParams);
  const pbsCodesQuery = useLookupOptions('pbs-codes', pbsCodesParams);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 2.5 }}>
      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Stack flex={1} spacing={1} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Schedule
            </Typography>
            <ScheduleSelect />
          </Stack>
          <Stack flex={1} spacing={1} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Drug
            </Typography>
            <MultiFilter
              label="Drug"
              placeholder="All drugs"
              options={drugsQuery.data ?? []}
              value={drug}
              onChange={(values) => setFilter('drug', values)}
              loading={drugsQuery.isLoading}
            />
          </Stack>
          <Stack flex={1} spacing={1} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Brand
            </Typography>
            <MultiFilter
              label="Brand"
              placeholder="All brands"
              options={brandsQuery.data ?? []}
              value={brand}
              onChange={(values) => setFilter('brand', values)}
              loading={brandsQuery.isLoading}
            />
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Stack flex={1} spacing={1} sx={{ minWidth: 0 }}> {/* minWidth: 0 allows flex items to shrink */}
            <Typography variant="subtitle2" color="text.secondary">
              Indication
            </Typography>
            <MultiFilter
              label="Indication"
              placeholder="All indications"
              options={indicationsQuery.data ?? []}
              value={indication}
              onChange={(values) => setFilter('indication', values)}
              loading={indicationsQuery.isLoading}
            />
          </Stack>
          <Stack flex={1} spacing={1} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Formulation
            </Typography>
            <MultiFilter
              label="Formulation"
              placeholder="All formulations"
              options={formulationsQuery.data ?? []}
              value={formulation}
              onChange={(values) => setFilter('formulation', values)}
              loading={formulationsQuery.isLoading}
            />
          </Stack>
          <Stack flex={1} spacing={1} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Treatment phase
            </Typography>
            <MultiFilter
              label="Treatment phase"
              placeholder="All phases"
              options={treatmentPhasesQuery.data ?? []}
              value={treatmentPhase}
              onChange={(values) => setFilter('treatmentPhase', values)}
              loading={treatmentPhasesQuery.isLoading}
            />
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Stack flex={1} spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Hospital type
            </Typography>
            <MultiFilter
              label="Hospital type"
              placeholder="All hospital types"
              options={hospitalTypesQuery.data ?? []}
              value={hospitalType}
              onChange={(values) => setFilter('hospitalType', values)}
              loading={hospitalTypesQuery.isLoading}
            />
          </Stack>
          <Stack flex={1} spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              PBS Code
            </Typography>
            <MultiFilter
              label="PBS Code"
              placeholder="All PBS codes"
              options={pbsCodesQuery.data ?? []}
              value={pbsCode}
              onChange={(values) => setFilter('pbsCode', values)}
              loading={pbsCodesQuery.isLoading}
            />
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-end">
          <Box flex={1} />
          <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />
          <Button variant="text" onClick={resetFilters} sx={{ alignSelf: { xs: 'stretch', md: 'center' } }}>
            Reset filters
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};
