import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useLookupOptions } from '../../hooks/useLookupOptions';
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
    const specialty = useSearchStore((state) => state.specialty);
    const setFilter = useSearchStore((state) => state.setFilter);
    const resetFilters = useSearchStore((state) => state.resetFilters);
    const buildLookupParams = useCallback((exclude) => {
        const params = {};
        params.specialty = specialty;
        if (scheduleYear)
            params.schedule_year = scheduleYear;
        if (scheduleMonth)
            params.schedule_month = scheduleMonth;
        if (exclude !== 'drug' && drug.length)
            params.drug = drug.join(',');
        if (exclude !== 'brand' && brand.length)
            params.brand = brand.join(',');
        if (exclude !== 'formulation' && formulation.length)
            params.formulation = formulation.join(',');
        if (exclude !== 'indication' && indication.length)
            params.indication = indication.join(',');
        if (exclude !== 'treatmentPhase' && treatmentPhase.length)
            params.treatment_phase = treatmentPhase.join(',');
        if (exclude !== 'hospitalType' && hospitalType.length)
            params.hospital_type = hospitalType.join(',');
        if (exclude !== 'pbsCode' && pbsCode.length)
            params.pbs_code = pbsCode.join(',');
        return params;
    }, [brand, drug, formulation, hospitalType, indication, scheduleMonth, scheduleYear, treatmentPhase, pbsCode, specialty]);
    const drugsParams = useMemo(() => buildLookupParams('drug'), [buildLookupParams]);
    const brandsParams = useMemo(() => buildLookupParams('brand'), [buildLookupParams]);
    const indicationsParams = useMemo(() => buildLookupParams('indication'), [buildLookupParams]);
    const formulationsParams = useMemo(() => buildLookupParams('formulation'), [buildLookupParams]);
    const treatmentPhasesParams = useMemo(() => buildLookupParams('treatmentPhase'), [buildLookupParams]);
    const hospitalTypesParams = useMemo(() => buildLookupParams('hospitalType'), [buildLookupParams]);
    const pbsCodesParams = useMemo(() => buildLookupParams('pbsCode'), [buildLookupParams]);
    const drugsQuery = useLookupOptions('drugs', drugsParams);
    const brandsQuery = useLookupOptions('brands', brandsParams);
    const indicationsQuery = useLookupOptions('indications', indicationsParams);
    const formulationsQuery = useLookupOptions('formulations', formulationsParams);
    const treatmentPhasesQuery = useLookupOptions('treatment-phases', treatmentPhasesParams);
    const hospitalTypesQuery = useLookupOptions('hospital-types', hospitalTypesParams);
    const pbsCodesQuery = useLookupOptions('pbs-codes', pbsCodesParams);
    return (_jsx(Paper, { elevation: 0, variant: "outlined", sx: { p: 2.5 }, children: _jsxs(Stack, { spacing: 2.5, children: [_jsxs(Stack, { direction: { xs: 'column', md: 'row' }, spacing: 2, children: [_jsxs(Stack, { flex: 1, spacing: 1, sx: { minWidth: 0 }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Schedule" }), _jsx(ScheduleSelect, {})] }), _jsxs(Stack, { flex: 1, spacing: 1, sx: { minWidth: 0 }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Drug" }), _jsx(MultiFilter, { label: "Drug", placeholder: "All drugs", options: drugsQuery.data ?? [], value: drug, onChange: (values) => setFilter('drug', values), loading: drugsQuery.isLoading })] }), _jsxs(Stack, { flex: 1, spacing: 1, sx: { minWidth: 0 }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Brand" }), _jsx(MultiFilter, { label: "Brand", placeholder: "All brands", options: brandsQuery.data ?? [], value: brand, onChange: (values) => setFilter('brand', values), loading: brandsQuery.isLoading })] })] }), _jsxs(Stack, { direction: { xs: 'column', md: 'row' }, spacing: 2, children: [_jsxs(Stack, { flex: 1, spacing: 1, sx: { minWidth: 0 }, children: [" ", _jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Indication" }), _jsx(MultiFilter, { label: "Indication", placeholder: "All indications", options: indicationsQuery.data ?? [], value: indication, onChange: (values) => setFilter('indication', values), loading: indicationsQuery.isLoading })] }), _jsxs(Stack, { flex: 1, spacing: 1, sx: { minWidth: 0 }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Formulation" }), _jsx(MultiFilter, { label: "Formulation", placeholder: "All formulations", options: formulationsQuery.data ?? [], value: formulation, onChange: (values) => setFilter('formulation', values), loading: formulationsQuery.isLoading })] }), _jsxs(Stack, { flex: 1, spacing: 1, sx: { minWidth: 0 }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Treatment phase" }), _jsx(MultiFilter, { label: "Treatment phase", placeholder: "All phases", options: treatmentPhasesQuery.data ?? [], value: treatmentPhase, onChange: (values) => setFilter('treatmentPhase', values), loading: treatmentPhasesQuery.isLoading })] })] }), _jsxs(Stack, { direction: { xs: 'column', md: 'row' }, spacing: 2, children: [_jsxs(Stack, { flex: 1, spacing: 1, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Hospital type" }), _jsx(MultiFilter, { label: "Hospital type", placeholder: "All hospital types", options: hospitalTypesQuery.data ?? [], value: hospitalType, onChange: (values) => setFilter('hospitalType', values), loading: hospitalTypesQuery.isLoading })] }), _jsxs(Stack, { flex: 1, spacing: 1, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "PBS Code" }), _jsx(MultiFilter, { label: "PBS Code", placeholder: "All PBS codes", options: pbsCodesQuery.data ?? [], value: pbsCode, onChange: (values) => setFilter('pbsCode', values), loading: pbsCodesQuery.isLoading })] })] }), _jsxs(Stack, { direction: { xs: 'column', md: 'row' }, spacing: 2, alignItems: "flex-end", children: [_jsx(Box, { flex: 1 }), _jsx(Divider, { flexItem: true, orientation: "vertical", sx: { display: { xs: 'none', md: 'block' } } }), _jsx(Button, { variant: "text", onClick: resetFilters, sx: { alignSelf: { xs: 'stretch', md: 'center' } }, children: "Reset filters" })] })] }) }));
};
