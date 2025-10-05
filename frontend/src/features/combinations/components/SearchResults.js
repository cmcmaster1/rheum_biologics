import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, Box, Card, CardContent, CircularProgress, Grid, Link, Pagination, Stack, Typography } from '@mui/material';
import { useSearchStore } from '../../../store/searchStore';
import { useCombinationSearch } from '../hooks/useCombinationSearch';
import { getARALink, hasARALink } from '../../../utils/araLinks';
const ResultCard = ({ drug, brand, pbsCode, formulation, indication, treatmentPhase, hospitalType, authorityMethod, streamlinedCode, onlineApplication, maximumQuantity, maximumPack, repeats }) => (_jsx(Card, { variant: "outlined", sx: { height: '100%' }, children: _jsx(CardContent, { children: _jsxs(Stack, { spacing: 1.2, children: [_jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "flex-start", children: [_jsxs(Box, { children: [_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Typography, { variant: "h6", children: drug }), hasARALink(drug) && (_jsx(Link, { href: getARALink(drug), target: "_blank", rel: "noopener noreferrer", underline: "hover", sx: {
                                                fontSize: '0.875rem',
                                                color: 'primary.main',
                                                fontWeight: 500
                                            }, children: "ARA Info" }))] }), _jsx(Typography, { color: "text.secondary", children: brand })] }), _jsx(Typography, { variant: "body2", fontWeight: 600, children: _jsxs(Link, { href: `https://www.pbs.gov.au/medicine/item/${pbsCode}`, target: "_blank", rel: "noopener noreferrer", underline: "hover", children: ["PBS ", pbsCode] }) })] }), _jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: formulation }), _jsxs(Typography, { variant: "body2", children: ["Indication: ", indication] }), treatmentPhase && (_jsxs(Typography, { variant: "body2", children: ["Treatment phase: ", treatmentPhase] })), hospitalType && _jsxs(Typography, { variant: "body2", children: ["Hospital type: ", hospitalType] }), _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 1, children: [authorityMethod && (_jsxs(Typography, { variant: "body2", children: ["Authority: ", authorityMethod] })), streamlinedCode && (_jsxs(Typography, { variant: "body2", children: ["Streamlined: ", streamlinedCode] }))] }), _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 1, children: [maximumPackageText(maximumPack, maximumQuantity), repeats !== null && _jsxs(Typography, { variant: "body2", children: ["Repeats: ", repeats] })] }), onlineApplication !== null && (_jsxs(Typography, { variant: "body2", children: ["Online application: ", onlineApplication ? 'Available' : 'Contact Services Australia'] }))] }) }) }));
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
    return _jsx(Typography, { variant: "body2", children: parts.join(' | ') });
};
export const SearchResults = () => {
    const { data, isLoading, isError, error } = useCombinationSearch();
    const page = useSearchStore((state) => state.page);
    const limit = useSearchStore((state) => state.limit);
    const setPage = useSearchStore((state) => state.setPage);
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
    return (_jsxs(Stack, { spacing: 3, children: [_jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["Showing ", combinations.length, " of ", total, " results \u00B7 Latest schedule ", combinations[0]?.schedule_month, " ", combinations[0]?.schedule_year] }), _jsx(Grid, { container: true, spacing: 2, children: combinations.map((combination) => (_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(ResultCard, { drug: combination.drug, brand: combination.brand, pbsCode: combination.pbs_code, formulation: combination.formulation, indication: combination.indication, treatmentPhase: combination.treatment_phase, hospitalType: combination.hospital_type, authorityMethod: combination.authority_method, streamlinedCode: combination.streamlined_code, onlineApplication: combination.online_application, maximumQuantity: combination.maximum_quantity_units, maximumPack: combination.maximum_prescribable_pack, repeats: combination.number_of_repeats }) }, combination.id))) }), totalPages > 1 && (_jsx(Stack, { alignItems: "center", children: _jsx(Pagination, { count: totalPages, color: "primary", page: page, onChange: (_event, value) => setPage(value), showFirstButton: true, showLastButton: true }) }))] }));
};
