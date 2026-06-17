import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, Box, Card, CardContent, CircularProgress, Grid, IconButton, Link, Pagination, Stack, Tooltip, Typography } from '@mui/material';
import { Check, ContentCopy, OpenInNew } from '@mui/icons-material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { trackAnalyticsEvent } from '../../../api/analytics';
import { useSearchStore } from '../../../store/searchStore';
import { getARALink, hasARALink } from '../../../utils/araLinks';
import { useCombinationSearch } from '../hooks/useCombinationSearch';
const ResultCard = ({ drug, brand, pbsCode, formulation, indication, treatmentPhase, hospitalType, authorityMethod, streamlinedCode, onlineApplication, maximumQuantity, maximumPack, repeats, companyOrSponsor, patientSupportProgram, patientSupportUrl, compassionateAccessProgram, compassionateAccessUrl, scheduleMonth, scheduleYear }) => (_jsx(Card, { variant: "outlined", sx: {
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
    }, children: _jsx(CardContent, { sx: {
            padding: { xs: 1.5, sm: 2 },
            '&:last-child': {
                paddingBottom: { xs: 1.5, sm: 2 }
            },
            overflow: 'hidden',
            wordWrap: 'break-word'
        }, children: _jsxs(Stack, { spacing: { xs: 0.8, sm: 1.2 }, children: [_jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, justifyContent: "space-between", alignItems: { xs: 'stretch', sm: 'flex-start' }, spacing: { xs: 0.5, sm: 0 }, children: [_jsxs(Box, { children: [_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Typography, { variant: "h6", sx: { fontSize: { xs: '1.1rem', sm: '1.25rem' } }, children: drug }), hasARALink(drug) && (_jsxs(Link, { href: getARALink(drug), target: "_blank", rel: "noopener noreferrer", underline: "hover", sx: {
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 0.25,
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                color: 'primary.main',
                                                fontWeight: 500
                                            }, ...analyticsLinkAttributes({
                                                destination: 'ara',
                                                targetUrl: getARALink(drug),
                                                linkText: 'ARA Info',
                                                drug,
                                                brand,
                                                pbsCode,
                                                indication,
                                                scheduleMonth,
                                                scheduleYear
                                            }), children: ["ARA Info", _jsx(OpenInNew, { sx: { fontSize: '0.9em' } })] }))] }), _jsx(Typography, { color: "text.secondary", sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } }, children: brand })] }), _jsxs(Stack, { direction: "row", spacing: 0.25, alignItems: "center", sx: {
                                mt: { xs: 1, sm: 0 },
                                flexShrink: 0
                            }, children: [_jsxs(Link, { href: `https://www.pbs.gov.au/medicine/item/${pbsCode}`, target: "_blank", rel: "noopener noreferrer", underline: "hover", sx: {
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.25,
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        fontWeight: 600
                                    }, ...analyticsLinkAttributes({
                                        destination: 'pbs',
                                        targetUrl: `https://www.pbs.gov.au/medicine/item/${pbsCode}`,
                                        linkText: `PBS ${pbsCode}`,
                                        drug,
                                        brand,
                                        pbsCode,
                                        indication,
                                        scheduleMonth,
                                        scheduleYear
                                    }), children: ["PBS ", pbsCode, _jsx(OpenInNew, { sx: { fontSize: '0.95em' } })] }), _jsx(CopyButton, { label: "PBS item code", value: pbsCode, analyticsPayload: {
                                        field: 'pbs_code',
                                        value: pbsCode,
                                        drug,
                                        brand,
                                        pbsCode,
                                        indication,
                                        scheduleMonth,
                                        scheduleYear
                                    } })] })] }), _jsx(Typography, { variant: "subtitle2", color: "text.secondary", sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } }, children: formulation }), _jsxs(Typography, { variant: "body2", sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } }, children: ["Indication: ", indication] }), treatmentPhase && (_jsxs(Typography, { variant: "body2", sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } }, children: ["Treatment phase: ", treatmentPhase] })), hospitalType && _jsxs(Typography, { variant: "body2", sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } }, children: ["Hospital type: ", hospitalType] }), _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: { xs: 0.5, sm: 1 }, children: [authorityMethod && (_jsxs(Typography, { variant: "body2", sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } }, children: ["Authority: ", authorityMethod] })), streamlinedCode && (_jsxs(Stack, { direction: "row", spacing: 0.25, alignItems: "center", sx: { minWidth: 0 }, children: [_jsxs(Typography, { variant: "body2", sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } }, children: ["Streamlined: ", streamlinedCode] }), _jsx(CopyButton, { label: "streamlined code", value: streamlinedCode, analyticsPayload: {
                                        field: 'streamlined_code',
                                        value: streamlinedCode,
                                        drug,
                                        brand,
                                        pbsCode,
                                        indication,
                                        scheduleMonth,
                                        scheduleYear
                                    } })] }))] }), _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: { xs: 0.5, sm: 1 }, children: [maximumPackageText(maximumPack, maximumQuantity), repeats !== null && _jsxs(Typography, { variant: "body2", sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } }, children: ["Repeats: ", repeats] })] }), onlineApplication !== null && (_jsxs(Typography, { variant: "body2", sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } }, children: ["Online application: ", onlineApplication ? 'Available' : 'Contact Services Australia'] })), (patientSupportUrl || compassionateAccessUrl) && (_jsxs(Box, { sx: {
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                        gap: { xs: 0.75, sm: 1.5 },
                        pt: 0.25
                    }, children: [patientSupportUrl && (_jsxs(Typography, { component: "div", variant: "body2", sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' }, minWidth: 0 }, children: [_jsx(Box, { component: "span", sx: { display: 'block', color: 'text.secondary' }, children: "Patient support" }), _jsxs(Link, { href: patientSupportUrl, target: "_blank", rel: "noopener noreferrer", underline: "hover", sx: {
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.25,
                                        maxWidth: '100%',
                                        overflowWrap: 'anywhere',
                                        wordBreak: 'break-word'
                                    }, ...analyticsLinkAttributes({
                                        destination: 'patient_support',
                                        targetUrl: patientSupportUrl,
                                        linkText: patientSupportProgram ?? companyOrSponsor ?? 'Program link',
                                        drug,
                                        brand,
                                        pbsCode,
                                        indication,
                                        scheduleMonth,
                                        scheduleYear
                                    }), children: [_jsx(Box, { component: "span", sx: { minWidth: 0 }, children: patientSupportProgram ?? companyOrSponsor ?? 'Program link' }), _jsx(OpenInNew, { sx: { fontSize: '0.9em', flexShrink: 0 } })] })] })), compassionateAccessUrl && (_jsxs(Typography, { component: "div", variant: "body2", sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' }, minWidth: 0 }, children: [_jsx(Box, { component: "span", sx: { display: 'block', color: 'text.secondary' }, children: "Access program" }), _jsxs(Link, { href: compassionateAccessUrl, target: "_blank", rel: "noopener noreferrer", underline: "hover", sx: {
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.25,
                                        maxWidth: '100%',
                                        overflowWrap: 'anywhere',
                                        wordBreak: 'break-word'
                                    }, ...analyticsLinkAttributes({
                                        destination: 'compassionate_access',
                                        targetUrl: compassionateAccessUrl,
                                        linkText: compassionateAccessProgram ?? companyOrSponsor ?? 'Program link',
                                        drug,
                                        brand,
                                        pbsCode,
                                        indication,
                                        scheduleMonth,
                                        scheduleYear
                                    }), children: [_jsx(Box, { component: "span", sx: { minWidth: 0 }, children: compassionateAccessProgram ?? companyOrSponsor ?? 'Program link' }), _jsx(OpenInNew, { sx: { fontSize: '0.9em', flexShrink: 0 } })] })] }))] }))] }) }) }));
const CopyButton = ({ label, value, analyticsPayload }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await copyToClipboard(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
        trackAnalyticsEvent({
            eventName: 'code_copied',
            payload: analyticsPayload
        });
    };
    return (_jsx(Tooltip, { title: copied ? 'Copied' : `Copy ${label}`, children: _jsx(IconButton, { "aria-label": `Copy ${label}`, size: "small", onClick: handleCopy, sx: {
                color: copied ? 'success.main' : 'text.secondary',
                flexShrink: 0,
                p: 0.35
            }, children: copied ? _jsx(Check, { fontSize: "inherit" }) : _jsx(ContentCopy, { fontSize: "inherit" }) }) }));
};
const copyToClipboard = async (value) => {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
};
const analyticsLinkAttributes = ({ destination, targetUrl, linkText, drug, brand, pbsCode, indication, scheduleMonth, scheduleYear }) => ({
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
const maximumPackageText = (pack, units) => {
    if (pack === null && units === null) {
        return null;
    }
    const parts = [];
    if (pack !== null) {
        parts.push(`Pack: ${pack}`);
    }
    if (units !== null) {
        parts.push(`Quantity: ${units}`);
    }
    return _jsx(Typography, { variant: "body2", sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } }, children: parts.join(' | ') });
};
export const SearchResults = () => {
    const { data, isLoading, isError, error, queryParams } = useCombinationSearch();
    const page = useSearchStore((state) => state.page);
    const limit = useSearchStore((state) => state.limit);
    const setPage = useSearchStore((state) => state.setPage);
    const lastSearchEventKey = useRef(null);
    const searchAnalyticsPayload = useMemo(() => buildSearchAnalyticsPayload(queryParams), [queryParams]);
    useEffect(() => {
        const handleAnalyticsLinkClick = (event) => {
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }
            const link = target.closest('a[data-analytics-destination]');
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
    const handlePageChange = (value) => {
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
        return (_jsxs(Stack, { alignItems: "center", py: 6, spacing: 2, children: [_jsx(CircularProgress, {}), _jsx(Typography, { children: "Loading combinations\u2026" })] }));
    }
    if (isError) {
        return (_jsx(Alert, { severity: "error", children: error instanceof Error ? error.message : 'Failed to load combinations' }));
    }
    const combinations = data?.data ?? [];
    const total = data?.meta.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    if (total === 0) {
        return (_jsxs(Stack, { spacing: 2, py: 6, alignItems: "center", children: [_jsx(Typography, { variant: "h6", children: "No results" }), _jsx(Typography, { color: "text.secondary", align: "center", children: "Try adjusting your filters or selecting a different schedule." })] }));
    }
    return (_jsxs(Stack, { spacing: 3, children: [_jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["Showing ", combinations.length, " of ", total, " results \u00B7 Latest schedule ", combinations[0]?.schedule_month, " ", combinations[0]?.schedule_year] }), _jsx(Grid, { container: true, spacing: { xs: 1, sm: 2 }, children: combinations.map((combination) => (_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(ResultCard, { drug: combination.drug, brand: combination.brand, pbsCode: combination.pbs_code, formulation: combination.formulation, indication: combination.indication, treatmentPhase: combination.treatment_phase, hospitalType: combination.hospital_type, authorityMethod: combination.authority_method, streamlinedCode: combination.streamlined_code, onlineApplication: combination.online_application, maximumQuantity: combination.maximum_quantity_units, maximumPack: combination.maximum_prescribable_pack, repeats: combination.number_of_repeats, companyOrSponsor: combination.company_or_sponsor, patientSupportProgram: combination.patient_support_program, patientSupportUrl: combination.patient_support_url, compassionateAccessProgram: combination.compassionate_access_program, compassionateAccessUrl: combination.compassionate_access_url, scheduleMonth: combination.schedule_month, scheduleYear: combination.schedule_year }) }, combination.id))) }), totalPages > 1 && (_jsx(Stack, { alignItems: "center", children: _jsx(Pagination, { count: totalPages, color: "primary", page: page, onChange: (_event, value) => handlePageChange(value), showFirstButton: true, showLastButton: true }) }))] }));
};
const buildSearchAnalyticsPayload = (queryParams) => {
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
