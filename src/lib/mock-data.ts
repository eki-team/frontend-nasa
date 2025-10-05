// Mock data para testing de la UI sin backend
import type { ChatResponse, Citation } from './api-rag';
import type { Study, StudyDetail, SearchResponse, GraphResponse, Insights, KpiData } from './types';

const mockCitations: Citation[] = [
  {
    source_id: "OSDR-001",
    doi: "10.1038/s41598-019-42345-1",
    osdr_id: "OSD-001",
    section: "Results",
    snippet: "Gene expression analysis revealed significant upregulation of oxidative stress markers in microgravity conditions...",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-001",
    title: "Transcriptional Response of Human Cells to Microgravity",
    year: 2019
  },
  {
    source_id: "OSDR-002",
    doi: "10.1126/science.aax1234",
    osdr_id: "OSD-047",
    section: "Discussion",
    snippet: "Our findings indicate that prolonged spaceflight exposure affects bone density markers, particularly in load-bearing regions...",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-047",
    title: "Effects of Long-Duration Spaceflight on Bone Metabolism",
    year: 2020
  },
  {
    source_id: "OSDR-003",
    osdr_id: "OSD-123",
    section: "Methods",
    snippet: "Samples were collected from astronauts before, during, and after missions to assess immune system changes in the space environment...",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-123",
    title: "Immune System Adaptation in Space Environment",
    year: 2021
  },
  {
    source_id: "OSDR-004",
    doi: "10.1016/j.cell.2022.03.045",
    osdr_id: "OSD-201",
    section: "Results",
    snippet: "RNA sequencing data showed differential expression in DNA repair pathways, suggesting adaptive responses to cosmic radiation...",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-201",
    title: "Genomic Responses to Cosmic Radiation Exposure",
    year: 2022
  },
  {
    source_id: "OSDR-005",
    osdr_id: "OSD-089",
    section: "Introduction",
    snippet: "Previous studies on plant growth in microgravity have shown altered root orientation and modified gravitropism responses...",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-089",
    title: "Plant Adaptation Mechanisms in Microgravity",
    year: 2018
  }
];

const mockResponses: Record<string, ChatResponse> = {
  default: {
    answer: `Based on the analysis of NASA's Open Science Data Repository, several key findings emerge regarding biological responses to spaceflight:

**Gene Expression Changes:**
Research shows significant upregulation of oxidative stress markers in microgravity conditions. Human cells demonstrate transcriptional responses that suggest adaptive mechanisms to the space environment.

**Bone Metabolism:**
Long-duration spaceflight significantly affects bone density markers, particularly in load-bearing regions. Studies indicate that astronauts experience measurable changes in bone metabolism during extended missions.

**Immune System Adaptation:**
The space environment triggers notable changes in immune system function. Data collected before, during, and after missions reveals adaptive responses that help maintain immune competence in spaceflight conditions.

**Radiation Effects:**
Cosmic radiation exposure leads to differential expression in DNA repair pathways. RNA sequencing data demonstrates that cells activate adaptive responses to manage radiation-induced stress.

These findings are critical for understanding human health during long-duration space missions and developing countermeasures for future deep space exploration.`,
    citations: mockCitations,
    used_filters: {
      organism: ["Homo sapiens"],
      mission_env: ["ISS", "Long Duration"]
    },
    metrics: {
      latency_ms: 245,
      retrieved_k: 15,
      grounded_ratio: 0.92,
      dedup_count: 3,
      section_distribution: {
        "Results": 5,
        "Discussion": 4,
        "Methods": 3,
        "Introduction": 3
      }
    },
    session_id: "mock-session-001"
  },
  
  microgravity: {
    answer: `Microgravity environments present unique challenges for biological systems:

**Cellular Level:**
Gene expression analysis reveals significant upregulation of oxidative stress markers. Cells activate various stress response pathways to adapt to the absence of gravitational forces.

**Plant Biology:**
Plant growth in microgravity shows altered root orientation and modified gravitropism responses. These adaptations are crucial for developing sustainable food production systems for long-term space missions.

**Physiological Changes:**
The absence of gravity affects multiple biological systems, from cellular metabolism to organ function. Understanding these mechanisms is essential for crew health management.`,
    citations: [mockCitations[0], mockCitations[4]],
    metrics: {
      latency_ms: 198,
      retrieved_k: 8,
      grounded_ratio: 0.95,
      dedup_count: 1
    },
    session_id: "mock-session-002"
  },

  radiation: {
    answer: `Cosmic radiation poses significant challenges for space exploration:

**DNA Damage and Repair:**
RNA sequencing data shows differential expression in DNA repair pathways, suggesting adaptive responses to cosmic radiation. Cells activate multiple repair mechanisms to manage radiation-induced damage.

**Long-term Effects:**
Studies indicate that prolonged exposure to space radiation may have cumulative effects on cellular function. Research focuses on understanding these mechanisms to develop protective strategies.

**Countermeasures:**
Current research explores various approaches to mitigate radiation effects, including pharmaceutical interventions and shielding technologies.`,
    citations: [mockCitations[3]],
    metrics: {
      latency_ms: 215,
      retrieved_k: 6,
      grounded_ratio: 0.88,
      dedup_count: 2
    },
    session_id: "mock-session-003"
  },

  bone: {
    answer: `Bone health is a major concern for long-duration spaceflight:

**Bone Density Loss:**
Research demonstrates that prolonged spaceflight exposure significantly affects bone density markers, particularly in load-bearing regions. This represents one of the most significant physiological challenges for astronauts.

**Mechanisms:**
The lack of mechanical loading in microgravity disrupts normal bone remodeling processes, leading to increased bone resorption and decreased formation.

**Prevention Strategies:**
Exercise protocols and nutritional interventions are being developed to minimize bone loss during missions. Understanding these mechanisms is crucial for Mars missions and beyond.`,
    citations: [mockCitations[1]],
    metrics: {
      latency_ms: 187,
      retrieved_k: 5,
      grounded_ratio: 0.91,
      dedup_count: 1
    },
    session_id: "mock-session-004"
  },

  immune: {
    answer: `The immune system undergoes significant changes in the space environment:

**Adaptive Responses:**
Samples collected from astronauts before, during, and after missions reveal complex adaptive responses in immune function. The space environment triggers changes that help maintain immune competence.

**Clinical Implications:**
Understanding these changes is critical for crew health management during long-duration missions. Research focuses on identifying potential vulnerabilities and developing countermeasures.

**Future Research:**
Ongoing studies aim to characterize the full spectrum of immune system adaptations to support missions to the Moon, Mars, and beyond.`,
    citations: [mockCitations[2]],
    metrics: {
      latency_ms: 203,
      retrieved_k: 7,
      grounded_ratio: 0.93,
      dedup_count: 0
    },
    session_id: "mock-session-005"
  }
};

// Función para obtener respuesta mock basada en la query
export function getMockChatResponse(query: string): ChatResponse {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('microgravity') || lowerQuery.includes('gravity') || lowerQuery.includes('plant')) {
    return mockResponses.microgravity;
  }
  
  if (lowerQuery.includes('radiation') || lowerQuery.includes('cosmic') || lowerQuery.includes('dna')) {
    return mockResponses.radiation;
  }
  
  if (lowerQuery.includes('bone') || lowerQuery.includes('density') || lowerQuery.includes('skeleton')) {
    return mockResponses.bone;
  }
  
  if (lowerQuery.includes('immune') || lowerQuery.includes('immunity') || lowerQuery.includes('infection')) {
    return mockResponses.immune;
  }
  
  return mockResponses.default;
}

// Simulación de delay de red
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== MOCK DATA PARA ESTUDIOS ====================

export const mockStudies: Study[] = [
  {
    id: "OSD-001",
    title: "Transcriptional Response of Human Cells to Microgravity",
    year: 2019,
    mission: "ISS Expedition 45",
    species: "Homo sapiens",
    outcomes: ["positive", "mixed"],
    summary: "Comprehensive analysis of gene expression changes in human cells exposed to microgravity conditions aboard the ISS.",
    keywords: ["microgravity", "gene expression", "oxidative stress", "human cells"],
    authors: ["Smith, J.", "Johnson, M.", "Williams, R."],
    doi: "10.1038/s41598-019-42345-1",
    abstract: "Gene expression analysis revealed significant upregulation of oxidative stress markers in microgravity conditions. Human cells demonstrate transcriptional responses that suggest adaptive mechanisms to the space environment. Our comprehensive RNA-seq study identified 1,247 differentially expressed genes, with particular enrichment in stress response pathways.",
    citations: 127,
    relevanceScore: 0.95
  },
  {
    id: "OSD-047",
    title: "Effects of Long-Duration Spaceflight on Bone Metabolism",
    year: 2020,
    mission: "ISS One-Year Mission",
    species: "Homo sapiens",
    outcomes: ["negative"],
    summary: "Longitudinal study of bone density changes in astronauts during extended missions, revealing significant metabolic alterations.",
    keywords: ["bone density", "spaceflight", "metabolism", "osteoporosis"],
    authors: ["Davis, K.", "Martinez, L.", "Anderson, T."],
    doi: "10.1126/science.aax1234",
    abstract: "Our findings indicate that prolonged spaceflight exposure affects bone density markers, particularly in load-bearing regions. Monthly measurements showed progressive loss of bone mineral density at a rate of 1-2% per month. The study provides critical data for developing countermeasures for future Mars missions.",
    citations: 203,
    relevanceScore: 0.93
  },
  {
    id: "OSD-123",
    title: "Immune System Adaptation in Space Environment",
    year: 2021,
    mission: "ISS Expedition 60",
    species: ["Homo sapiens", "Mus musculus"],
    outcomes: ["mixed", "positive"],
    summary: "Investigation of immune system changes in both human and mouse models during spaceflight conditions.",
    keywords: ["immune system", "adaptation", "spaceflight", "immunology"],
    authors: ["Chen, Y.", "Brown, A.", "Wilson, S.", "Taylor, M."],
    doi: "10.1016/j.immuni.2021.05.023",
    abstract: "Samples were collected from astronauts before, during, and after missions to assess immune system changes in the space environment. Flow cytometry analysis revealed altered T-cell populations and modified cytokine profiles. Parallel mouse studies confirmed adaptive responses that help maintain immune competence.",
    citations: 89,
    relevanceScore: 0.91
  },
  {
    id: "OSD-201",
    title: "Genomic Responses to Cosmic Radiation Exposure",
    year: 2022,
    mission: "ISS Expedition 65",
    species: "Homo sapiens",
    outcomes: ["mixed"],
    summary: "Analysis of DNA repair pathways and genomic stability in response to space radiation exposure.",
    keywords: ["radiation", "DNA repair", "genomics", "cosmic rays"],
    authors: ["Rodriguez, C.", "Lee, H.", "Thompson, J."],
    doi: "10.1016/j.cell.2022.03.045",
    abstract: "RNA sequencing data showed differential expression in DNA repair pathways, suggesting adaptive responses to cosmic radiation. Whole genome sequencing detected low levels of somatic mutations, predominantly C>T transitions. Our findings suggest that cells activate multiple protective mechanisms during spaceflight.",
    citations: 156,
    relevanceScore: 0.94
  },
  {
    id: "OSD-089",
    title: "Plant Adaptation Mechanisms in Microgravity",
    year: 2018,
    mission: "Veggie Plant Growth System",
    species: "Arabidopsis thaliana",
    outcomes: ["positive"],
    summary: "Study of plant growth, development, and molecular responses in microgravity conditions.",
    keywords: ["plants", "microgravity", "gravitropism", "agriculture"],
    authors: ["Green, P.", "White, K.", "Black, R."],
    doi: "10.1104/pp.18.00123",
    abstract: "Previous studies on plant growth in microgravity have shown altered root orientation and modified gravitropism responses. Our experiments aboard the ISS demonstrate that plants can successfully complete their life cycle in space, with modifications in gene expression related to cell wall remodeling and hormone signaling.",
    citations: 78,
    relevanceScore: 0.88
  },
  {
    id: "OSD-302",
    title: "Cardiovascular Adaptations During Extended Spaceflight",
    year: 2023,
    mission: "ISS Long Duration",
    species: "Homo sapiens",
    outcomes: ["negative", "mixed"],
    summary: "Comprehensive cardiovascular monitoring during long-duration missions revealing structural and functional changes.",
    keywords: ["cardiovascular", "heart", "spaceflight", "adaptation"],
    authors: ["Miller, D.", "Garcia, A.", "Harris, B."],
    doi: "10.1161/CIRCULATIONAHA.123.012345",
    abstract: "Echocardiography and biomarker analysis revealed progressive cardiac remodeling during missions exceeding 6 months. Left ventricular mass decreased by an average of 12%, with associated changes in cardiac output and rhythm patterns.",
    citations: 142,
    relevanceScore: 0.92
  },
  {
    id: "OSD-415",
    title: "Muscle Atrophy Mechanisms in Microgravity",
    year: 2021,
    mission: "ISS Expedition 62",
    species: ["Homo sapiens", "Rattus norvegicus"],
    outcomes: ["negative"],
    summary: "Molecular analysis of muscle wasting processes during spaceflight in human and rodent models.",
    keywords: ["muscle", "atrophy", "microgravity", "proteomics"],
    authors: ["Lopez, F.", "Kim, S.", "Patel, N."],
    doi: "10.1152/japplphysiol.00456.2021",
    abstract: "Proteomics analysis revealed upregulation of ubiquitin-proteasome pathways and downregulation of protein synthesis markers. Muscle biopsies showed 15-20% loss of muscle mass in antigravity muscles over 6-month missions despite exercise countermeasures.",
    citations: 98,
    relevanceScore: 0.90
  },
  {
    id: "OSD-528",
    title: "Microbiome Changes in Closed Space Environments",
    year: 2022,
    mission: "ISS Expedition 68",
    species: "Homo sapiens",
    outcomes: ["mixed"],
    summary: "Longitudinal tracking of human microbiome composition changes during spaceflight.",
    keywords: ["microbiome", "gut bacteria", "spaceflight", "16S sequencing"],
    authors: ["Johnson, E.", "Wang, L.", "O'Brien, K."],
    doi: "10.1186/s40168-022-01234-5",
    abstract: "16S rRNA sequencing revealed significant shifts in gut microbiome composition during spaceflight, with decreased diversity and altered Firmicutes/Bacteroidetes ratio. These changes correlated with dietary constraints and environmental factors unique to the ISS.",
    citations: 67,
    relevanceScore: 0.86
  },
  {
    id: "OSD-634",
    title: "Neural Plasticity and Cognition in Space",
    year: 2023,
    mission: "ISS Cognitive Assessment",
    species: "Homo sapiens",
    outcomes: ["positive", "mixed"],
    summary: "Assessment of cognitive function and brain structure changes during and after spaceflight.",
    keywords: ["brain", "cognition", "neural plasticity", "MRI"],
    authors: ["Nakamura, T.", "Singh, R.", "Mueller, F."],
    doi: "10.1038/s41593-023-01234-8",
    abstract: "Structural MRI revealed ventricular expansion and upward shift of the brain. Cognitive testing showed maintained performance on most tasks, with some evidence of improved spatial processing abilities. Neuroplasticity markers in blood samples suggested ongoing adaptation.",
    citations: 112,
    relevanceScore: 0.89
  },
  {
    id: "OSD-745",
    title: "Sleep Architecture Alterations in Microgravity",
    year: 2020,
    mission: "ISS Sleep Study",
    species: "Homo sapiens",
    outcomes: ["negative"],
    summary: "Polysomnographic analysis of sleep patterns and quality during spaceflight missions.",
    keywords: ["sleep", "circadian rhythm", "microgravity", "polysomnography"],
    authors: ["Foster, M.", "Yang, X.", "Roberts, L."],
    doi: "10.5665/sleep.8234",
    abstract: "Continuous polysomnography recording revealed reduced sleep efficiency, increased sleep latency, and altered REM/NREM ratios. Astronauts experienced an average of 6.5 hours of sleep per night versus the recommended 8 hours, with frequent awakenings.",
    citations: 93,
    relevanceScore: 0.87
  }
];

export const mockStudyDetails: Record<string, StudyDetail> = {
  "OSD-001": {
    ...mockStudies[0],
    related: [mockStudies[4], mockStudies[6]],
    methods: "RNA was extracted from human lymphocytes collected before, during (flight day 15 and 60), and after (return+3 days) spaceflight. Libraries were prepared using standard Illumina protocols and sequenced on HiSeq 4000. Differential expression analysis was performed using DESeq2 with FDR < 0.05."
  },
  "OSD-047": {
    ...mockStudies[1],
    related: [mockStudies[5], mockStudies[6]],
    methods: "Bone density was measured using dual-energy X-ray absorptiometry (DXA) pre-flight and at monthly intervals during flight. Blood and urine samples were collected for biochemical markers of bone metabolism (CTX, P1NP, osteocalcin). Exercise logs were maintained to correlate with bone density changes."
  },
  "OSD-123": {
    ...mockStudies[2],
    related: [mockStudies[0], mockStudies[7]],
    methods: "Blood samples were collected at L-180, L-45, multiple timepoints during flight, and R+3, R+30 days. Flow cytometry panels included CD3, CD4, CD8, CD19, CD56, and activation markers. Cytokine profiling was performed using multiplex bead arrays. Mouse samples were processed similarly with species-specific antibodies."
  }
};

// Función para obtener estudios mock con filtros
export function getMockStudies(filters: {
  query?: string;
  mission?: string;
  species?: string[];
  outcome?: string[];
  yearFrom?: number;
  yearTo?: number;
  page?: number;
  pageSize?: number;
}): SearchResponse {
  let filteredStudies = [...mockStudies];
  
  // Filtrar por query
  if (filters.query && filters.query.trim() !== "") {
    const query = filters.query.toLowerCase();
    filteredStudies = filteredStudies.filter(study =>
      study.title.toLowerCase().includes(query) ||
      study.abstract?.toLowerCase().includes(query) ||
      study.keywords?.some(k => k.toLowerCase().includes(query)) ||
      study.summary?.toLowerCase().includes(query)
    );
  }
  
  // Filtrar por misión
  if (filters.mission) {
    filteredStudies = filteredStudies.filter(study =>
      study.mission?.toLowerCase().includes(filters.mission!.toLowerCase())
    );
  }
  
  // Filtrar por especie
  if (filters.species && filters.species.length > 0) {
    filteredStudies = filteredStudies.filter(study => {
      const studySpecies = Array.isArray(study.species) ? study.species : [study.species];
      return filters.species!.some(filterSpecies =>
        studySpecies.some(s => s?.toLowerCase().includes(filterSpecies.toLowerCase()))
      );
    });
  }
  
  // Filtrar por outcome
  if (filters.outcome && filters.outcome.length > 0) {
    filteredStudies = filteredStudies.filter(study =>
      study.outcomes?.some(outcome => filters.outcome!.includes(outcome))
    );
  }
  
  // Filtrar por rango de años
  if (filters.yearFrom) {
    filteredStudies = filteredStudies.filter(study =>
      study.year && study.year >= filters.yearFrom!
    );
  }
  
  if (filters.yearTo) {
    filteredStudies = filteredStudies.filter(study =>
      study.year && study.year <= filters.yearTo!
    );
  }
  
  // Paginación
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 12;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStudies = filteredStudies.slice(startIndex, endIndex);
  
  return {
    studies: paginatedStudies,
    total: filteredStudies.length,
    page,
    pageSize,
    totalPages: Math.ceil(filteredStudies.length / pageSize),
    hasMore: endIndex < filteredStudies.length
  };
}

// Función para obtener un estudio específico por ID
export function getMockStudyById(id: string): StudyDetail {
  const detail = mockStudyDetails[id];
  if (detail) {
    return detail;
  }
  
  // Si no hay detalle específico, crear uno genérico
  const study = mockStudies.find(s => s.id === id);
  if (study) {
    return {
      ...study,
      related: mockStudies.filter(s => s.id !== id).slice(0, 3),
      methods: "Detailed methodology available in the full publication."
    };
  }
  
  throw new Error(`Study not found: ${id}`);
}

// Mock data para KPIs
export function getMockKpiData(): KpiData {
  return {
    totalStudies: mockStudies.length,
    yearsCovered: "2018-2023",
    totalMissions: 8,
    totalSpecies: 4
  };
}

// Mock data para insights
export function getMockInsights(): Insights {
  return {
    byYear: [
      { year: 2018, count: 1 },
      { year: 2019, count: 1 },
      { year: 2020, count: 2 },
      { year: 2021, count: 2 },
      { year: 2022, count: 2 },
      { year: 2023, count: 2 }
    ],
    topMissions: [
      { name: "ISS Expedition 45", count: 1 },
      { name: "ISS One-Year Mission", count: 1 },
      { name: "ISS Expedition 60", count: 1 },
      { name: "ISS Expedition 65", count: 1 },
      { name: "ISS Long Duration", count: 2 }
    ],
    outcomesDist: [
      { label: "Positive", count: 3 },
      { label: "Negative", count: 4 },
      { label: "Mixed", count: 6 },
      { label: "Inconclusive", count: 0 }
    ],
    consensusVsDisagreement: [
      { topic: "Bone Density Loss", consensus: 85, disagreement: 15 },
      { topic: "Immune Changes", consensus: 70, disagreement: 30 },
      { topic: "Muscle Atrophy", consensus: 90, disagreement: 10 },
      { topic: "Cognitive Effects", consensus: 60, disagreement: 40 }
    ],
    heatmap: [
      { entity: "Homo sapiens", outcome: "positive", count: 3 },
      { entity: "Homo sapiens", outcome: "negative", count: 4 },
      { entity: "Homo sapiens", outcome: "mixed", count: 5 },
      { entity: "Mus musculus", outcome: "positive", count: 1 },
      { entity: "Mus musculus", outcome: "mixed", count: 1 },
      { entity: "Arabidopsis thaliana", outcome: "positive", count: 1 }
    ]
  };
}

// Mock data para grafo
export function getMockGraph(): GraphResponse {
  return {
    nodes: [
      { id: "ISS", label: "ISS", type: "mission", degree: 8, color: "#3b82f6" },
      { id: "Human", label: "Homo sapiens", type: "species", degree: 7, color: "#10b981" },
      { id: "Mouse", label: "Mus musculus", type: "species", degree: 2, color: "#10b981" },
      { id: "Plant", label: "Arabidopsis", type: "species", degree: 1, color: "#10b981" },
      { id: "Bone", label: "Bone Metabolism", type: "outcome", degree: 2, color: "#ef4444" },
      { id: "Immune", label: "Immune System", type: "outcome", degree: 2, color: "#f59e0b" },
      { id: "Muscle", label: "Muscle", type: "outcome", degree: 1, color: "#ef4444" },
      { id: "Brain", label: "Neural", type: "outcome", degree: 1, color: "#8b5cf6" },
      { id: "OSD-001", label: "Gene Expression", type: "paper", degree: 3, color: "#6366f1" },
      { id: "OSD-047", label: "Bone Study", type: "paper", degree: 2, color: "#6366f1" }
    ],
    links: [
      { source: "ISS", target: "Human", relation: "studies", weight: 7 },
      { source: "ISS", target: "Mouse", relation: "studies", weight: 2 },
      { source: "ISS", target: "Plant", relation: "studies", weight: 1 },
      { source: "Human", target: "Bone", relation: "affected", weight: 2 },
      { source: "Human", target: "Immune", relation: "affected", weight: 2 },
      { source: "Human", target: "Muscle", relation: "affected", weight: 1 },
      { source: "Human", target: "Brain", relation: "affected", weight: 1 },
      { source: "OSD-001", target: "Human", relation: "analyzed", weight: 1 },
      { source: "OSD-047", target: "Bone", relation: "measured", weight: 1 }
    ]
  };
}
