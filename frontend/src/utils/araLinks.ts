/**
 * Mapping of drug names to ARA (Australian Rheumatology Association) medication information URLs
 * Based on the ARA medication information pages structure
 */

export const ARA_DRUG_LINKS: Record<string, string> = {
  // A-B section
  'Abatacept': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/A-B/Abatacept',
  'Adalimumab': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/A-B/Adalimumab',
  'Allopurinol': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/A-B/Allopurinol',
  'Ambrisentan': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/A-B/Ambrisentan',
  'Anakinra': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/A-B/Anakinra',
  'Anifrolumab': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/A-B/Anifrolumab',
  'Apremilast': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/A-B/Apremilast',
  'Azathioprine': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/A-B/Azathioprine',
  'Baricitinib': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/A-B/Baricitinib',
  'Bimekizumab': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/A-B/Bimekizumab',
  'Biosimilars': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/A-B/Biosimilars',
  'Bisphosphonates (Oral)': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/A-B/Bisphosphonates-Oral',
  'Bisphosphonates (Intravenous/IV)': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/A-B/Bisphosphonates-Intravenous-IV',
  'Bosentan': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/A-B/Bosentan',

  // C-G section
  'Cannabinoids - Medicinal Cannabis': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/C-G/Cannabinoids-Medicinal-Cannabis',
  'Certolizumab': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/C-G/Certolizumab',
  'Colchicine': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/C-G/Colchicine',
  'Ciclosporin': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/C-G/Ciclosporin',
  'Cyclophosphamide': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/C-G/Cyclophosphamide',
  'Denosumab': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/C-G/Denosumab',
  'Deucravacitinib': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/C-G/Deucravacitinib',
  'Duloxetine': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/C-G/Duloxetine',
  'Etanercept': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/C-G/Etanercept',
  'Febuxostat': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/C-G/Febuxostat',
  'Glucosamine': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/C-G/Glucosamine',
  'Golimumab': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/C-G/Golimumab',
  'Goserelin': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/C-G/Goserelin',
  'Guselkumab': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/C-G/Guselkumab',

  // H-M section
  'Hyaluronic Acid': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/H-M/Hyaluronic-Acid',
  'Hydroxychloroquine': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/H-M/Hydroxychloroquine',
  'Iloprost': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/H-M/Iloprost',
  'Infliximab': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/H-M/Infliximab',
  'Ixekizumab': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/H-M/Ixekizumab',
  'IV Immunuglobulin': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/H-M/IV-Immunuglobulin',
  'Leflunomide': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/H-M/Leflunomide',
  'Macitentan': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/H-M/Macitentan',
  'Methotrexate': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/H-M/Methotrexate',
  'Self-Injecting Methotrexate for the Treatment of Arthritis': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/H-M/Self-Injecting-Methotrexate-for-the-Treatment-of-Arthritis',
  'Milnacipran': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/H-M/Milnacipran',
  'Mycophenolate': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/H-M/Mycophenolate',

  // N-R section
  'Nintedanib': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/N-R/Nintedanib',
  'NSAIDs': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/N-R/NSAIDs',
  'Opioids': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/N-R/Opioids',
  'Paracetamol': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/N-R/Paracetamol',
  'Prednisolone': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/N-R/Prednisolone',
  'Pregabalin': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/N-R/Pregabalin',
  'Probenecid': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/N-R/Probenecid',
  'Raloxifene': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/N-R/Raloxifene',
  'Risankizumab': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/N-R/Risankizumab',
  'Rituximab': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/N-R/Rituximab',
  'Romosozumab': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/N-R/Romosozumab',

  // S-Z section
  'Secukinumab': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/S-Z/Secukinumab',
  'Sildenafil': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/S-Z/Sildenafil',
  'Sulfasalazine': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/S-Z/Sulfasalazine',
  'Tacrolimus': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/S-Z/Tacrolimus',
  'Teriparatide': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/S-Z/Teriparatide',
  'Tocilizumab': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/S-Z/Tocilizumab',
  'Tofacitinib': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/S-Z/Tofacitinib',
  'Ustekinumab': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/S-Z/Ustekinumab',
  'Upadacitinib': 'https://rheumatology.org.au/For-Patients/Adult-Medication-Information/S-Z/Upadacitinib',
};

/**
 * Get the ARA medication information URL for a given drug name
 * @param drugName - The name of the drug
 * @returns The ARA URL if available, otherwise null
 */
export const getARALink = (drugName: string): string | null => {
  return ARA_DRUG_LINKS[drugName] || null;
};

/**
 * Check if an ARA link is available for a given drug name
 * @param drugName - The name of the drug
 * @returns True if ARA link is available, false otherwise
 */
export const hasARALink = (drugName: string): boolean => {
  return drugName in ARA_DRUG_LINKS;
};
