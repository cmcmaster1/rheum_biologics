import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, CardContent, Link, Stack, Typography } from '@mui/material';
import { getARALink, hasARALink } from '../utils/araLinks';
const DemoCard = ({ drug }) => {
    const araLink = getARALink(drug);
    const hasLink = hasARALink(drug);
    return (_jsx(Card, { variant: "outlined", sx: { mb: 2 }, children: _jsxs(CardContent, { children: [_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Typography, { variant: "h6", children: drug }), hasLink && (_jsx(Link, { href: araLink, target: "_blank", rel: "noopener noreferrer", underline: "hover", sx: {
                                fontSize: '0.875rem',
                                color: 'primary.main',
                                fontWeight: 500
                            }, children: "ARA Info" }))] }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: hasLink ? '✓ ARA medication information available' : '✗ No ARA information available' })] }) }));
};
export const ARALinksDemo = () => {
    const sampleDrugs = [
        'Adalimumab',
        'Etanercept',
        'Infliximab',
        'Methotrexate',
        'Unknown Drug',
        'Tocilizumab',
        'Rituximab'
    ];
    return (_jsxs(Box, { sx: { p: 3 }, children: [_jsx(Typography, { variant: "h4", gutterBottom: true, children: "ARA Medication Information Links Demo" }), _jsx(Typography, { variant: "body1", sx: { mb: 3 }, children: "This demonstrates how ARA (Australian Rheumatology Association) medication information links are displayed alongside drug names in the search results." }), sampleDrugs.map((drug) => (_jsx(DemoCard, { drug: drug }, drug))), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 3 }, children: "When a drug has an ARA information page available, an \"ARA Info\" link will appear next to the drug name, linking directly to the relevant medication information on the ARA website." })] }));
};
