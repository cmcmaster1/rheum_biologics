import { Box, Card, CardContent, Link, Stack, Typography } from '@mui/material';
import { getARALink, hasARALink } from '../utils/araLinks';

const DemoCard = ({ drug }: { drug: string }) => {
  const araLink = getARALink(drug);
  const hasLink = hasARALink(drug);

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6">{drug}</Typography>
          {hasLink && (
            <Link
              href={araLink!}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ 
                fontSize: '0.875rem',
                color: 'primary.main',
                fontWeight: 500
              }}
            >
              ARA Info
            </Link>
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {hasLink ? '✓ ARA medication information available' : '✗ No ARA information available'}
        </Typography>
      </CardContent>
    </Card>
  );
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        ARA Medication Information Links Demo
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        This demonstrates how ARA (Australian Rheumatology Association) medication information links 
        are displayed alongside drug names in the search results.
      </Typography>
      
      {sampleDrugs.map((drug) => (
        <DemoCard key={drug} drug={drug} />
      ))}
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        When a drug has an ARA information page available, an "ARA Info" link will appear next to the drug name, 
        linking directly to the relevant medication information on the ARA website.
      </Typography>
    </Box>
  );
};
