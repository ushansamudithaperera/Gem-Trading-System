import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Scissors,
  Star,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  User,
  AlertCircle,
  Plus,
  Check,
  ChevronRight,
  Shield,
  Layers,
  X,
  Camera,
  FolderKanban,
  Inbox,
  CheckCircle,
  XCircle,
  Gem,
  Package
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import { useRoleTheme } from '../../utils/theme';

// ─────────────────────────────────────────────────────────────────────────────
// Shared Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface Cutter {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  rating: number;
  totalTransactions: number;
  businessName?: string;
  location: string;
  bio?: string;
  specialties: string[];
  completedJobs: number;
  averageTurnaroundDays: number;
  ratePerCarat?: number;
  available: boolean;
  portfolio: {
    roughName: string;
    polishedName: string;
    roughWeight: string;
    polishedWeight: string;
    roughImg: string;
    polishedImg: string;
  }[];
}

export interface ActiveJob {
  _id: string;
  gemName: string;
  roughWeight: string;
  targetCut: string;
  instructions: string;
  cutterName: string;
  cutterAvatar?: string;
  cutterId: string;
  status: 'Stone Received' | 'Pre-forming' | 'Faceting' | 'Polished' | 'Ready to Ship';
  progress: number;
  expectedDate: string;
  escrowFee: number;
  logs: { date: string; message: string; phase: string }[];
  progressPhotos: { phase: string; img: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CUTTER-specific: Incoming Job Request from a Buyer
// ─────────────────────────────────────────────────────────────────────────────

interface IncomingJobRequest {
  _id: string;
  buyerName: string;
  gemName: string;
  roughWeight: string;
  targetCut: string;
  instructions: string;
  offeredFee: number;
  requestDate: string;
  status: 'Pending' | 'Accepted' | 'Declined';
}

// ─────────────────────────────────────────────────────────────────────────────
// LKR Currency Formatter
// ─────────────────────────────────────────────────────────────────────────────

const formatLKR = (amount: number): string => {
  return `Rs. ${amount.toLocaleString('en-LK')}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data — Sri Lankan Lapidary Industry
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_CUTTERS: Cutter[] = [
  {
    _id: 'cutter-1',
    firstName: 'Nuwan',
    lastName: 'Bandara',
    businessName: 'Nuwan Lapidary Services',
    rating: 5.0,
    totalTransactions: 42,
    location: 'Ratnapura, Sri Lanka',
    bio: 'Third-generation lapidary master from "The City of Gems". Specializing in maximizing brilliance in Ceylon sapphires through precision concave faceting techniques passed down through our family.',
    specialties: ['Concave Faceting', 'Custom Step Cuts', 'Ceylon Sapphires'],
    completedJobs: 38,
    averageTurnaroundDays: 12,
    ratePerCarat: 22500, // Rs. 22,500 per carat
    available: true,
    portfolio: [
      {
        roughName: 'Rough Ceylon Sapphire',
        polishedName: 'Concave Oval Ceylon Sapphire',
        roughWeight: '8.4 ct',
        polishedWeight: '4.1 ct',
        roughImg: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400',
        polishedImg: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=400',
      },
      {
        roughName: 'Rough Padparadscha',
        polishedName: 'Precision Emerald-Cut Padparadscha',
        roughWeight: '14.2 ct',
        polishedWeight: '7.8 ct',
        roughImg: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400',
        polishedImg: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400',
      }
    ]
  },
  {
    _id: 'cutter-2',
    firstName: 'Chaminda',
    lastName: 'Perera',
    businessName: 'Chaminda Precision Cuts',
    rating: 4.9,
    totalTransactions: 29,
    location: 'Beruwala, Sri Lanka',
    bio: 'Artisanal lapidary focusing on cabochon cuts and freeform shapes. Dedicated to preserving the natural beauty of Ceylon star sapphires and cat\'s eye chrysoberyl from the Beruwala gem market.',
    specialties: ['Cabochons', 'Star Sapphires', 'Cat\'s Eye Cuts'],
    completedJobs: 26,
    averageTurnaroundDays: 8,
    ratePerCarat: 13500,
    available: true,
    portfolio: [
      {
        roughName: 'Rough Star Sapphire',
        polishedName: 'High-Dome Star Sapphire Cabochon',
        roughWeight: '15.0 ct',
        polishedWeight: '11.2 ct',
        roughImg: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400',
        polishedImg: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=400',
      }
    ]
  },
  {
    _id: 'cutter-3',
    firstName: 'Ruwan',
    lastName: 'Jayasekara',
    businessName: 'Ruwan Gems — Premium Faceting',
    rating: 4.8,
    totalTransactions: 37,
    location: 'Ratnapura, Sri Lanka',
    bio: 'Specialist in extreme mathematical symmetry, including 161-facet Portuguese cuts. Best known for cutting high-value Ceylon spinels and tsavorites sourced from the Balangoda mines.',
    specialties: ['Portuguese Cuts', 'Extreme Symmetry', 'Ceylon Spinels'],
    completedJobs: 33,
    averageTurnaroundDays: 15,
    ratePerCarat: 33000,
    available: true,
    portfolio: [
      {
        roughName: 'Rough Ceylon Spinel',
        polishedName: '161-Facet Portuguese Ceylon Spinel',
        roughWeight: '9.3 ct',
        polishedWeight: '4.2 ct',
        roughImg: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400',
        polishedImg: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=400',
      }
    ]
  },
  {
    _id: 'cutter-4',
    firstName: 'Ishara',
    lastName: 'De Silva',
    businessName: 'De Silva Gem Atelier',
    rating: 4.9,
    totalTransactions: 53,
    location: 'Galle, Sri Lanka',
    bio: 'Award-winning cutter creating patented geometric fantasy cuts. Known for transforming raw Ceylon alexandrites and moonstone into museum-grade collector pieces at our Galle Fort workshop.',
    specialties: ['Fantasy Cuts', 'Alexandrites', 'Ceylon Moonstone'],
    completedJobs: 49,
    averageTurnaroundDays: 10,
    ratePerCarat: 28500,
    available: false,
    portfolio: [
      {
        roughName: 'Rough Ceylon Alexandrite',
        polishedName: 'Hexagonal Fantasy Ceylon Alexandrite',
        roughWeight: '12.5 ct',
        polishedWeight: '6.4 ct',
        roughImg: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400',
        polishedImg: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=400',
      }
    ]
  }
];

const STAGES: ActiveJob['status'][] = [
  'Stone Received',
  'Pre-forming',
  'Faceting',
  'Polished',
  'Ready to Ship'
];

const STAGE_PROGRESS_MAP: Record<ActiveJob['status'], number> = {
  'Stone Received': 20,
  'Pre-forming': 45,
  'Faceting': 70,
  'Polished': 90,
  'Ready to Ship': 100,
};

// ─── Buyer / Seller: Active jobs (gems they sent out for cutting) ───
const INITIAL_BUYER_JOBS: ActiveJob[] = [
  {
    _id: 'job-101',
    gemName: 'Ceylon Blue Sapphire (Rough)',
    roughWeight: '7.8 ct',
    targetCut: 'Oval Concave Brilliant',
    instructions: 'Maximize color depth and brilliance. Focus concave facets towards the culet area. Preserve weight above 3.5 carats if possible.',
    cutterName: 'Nuwan Bandara',
    cutterId: 'cutter-1',
    status: 'Faceting',
    progress: 70,
    expectedDate: '2026-06-12',
    escrowFee: 175500,
    logs: [
      { date: '2026-05-24', message: 'Rough gemstone received at Ratnapura laboratory. Integrity checks complete: zero internal micro-fractures identified.', phase: 'Stone Received' },
      { date: '2026-05-26', message: 'Pre-forming process completed. Girdle shape outlined and pavilion dop pin mounted successfully.', phase: 'Pre-forming' },
      { date: '2026-05-29', message: 'Pavilion faceting completed under 20x magnification. Advancing to crown facet cutting.', phase: 'Faceting' }
    ],
    progressPhotos: [
      { phase: 'Stone Received', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=300' },
      { phase: 'Pre-forming', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=300' }
    ]
  },
  {
    _id: 'job-102',
    gemName: 'Ceylon Star Sapphire (Rough)',
    roughWeight: '12.4 ct',
    targetCut: 'High-Dome Cabochon',
    instructions: 'Maintain depth to amplify asterism effect. Medium girdle thickness required for bezel settings. Preserve the silk inclusions for maximum star display.',
    cutterName: 'Chaminda Perera',
    cutterId: 'cutter-2',
    status: 'Stone Received',
    progress: 20,
    expectedDate: '2026-06-18',
    escrowFee: 167400,
    logs: [
      { date: '2026-05-29', message: 'Stone received at Beruwala workshop and verified. Weight calibrated at 12.38 carats.', phase: 'Stone Received' }
    ],
    progressPhotos: [
      { phase: 'Stone Received', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=300' }
    ]
  }
];

// ─── Cutter: Jobs they are currently working on ───
const INITIAL_CUTTER_ACTIVE_JOBS: ActiveJob[] = [
  {
    _id: 'cjob-201',
    gemName: 'Ceylon Blue Sapphire (Rough)',
    roughWeight: '7.8 ct',
    targetCut: 'Oval Concave Brilliant',
    instructions: 'Maximize color depth and brilliance. Focus concave facets towards the culet area. Preserve weight above 3.5 carats if possible.',
    cutterName: 'You',
    cutterId: 'cutter-self',
    status: 'Faceting',
    progress: 70,
    expectedDate: '2026-06-12',
    escrowFee: 175500,
    logs: [
      { date: '2026-05-24', message: 'Rough gemstone received at Ratnapura laboratory. Integrity checks complete.', phase: 'Stone Received' },
      { date: '2026-05-26', message: 'Pre-forming process completed. Girdle shape outlined and pavilion dop pin mounted.', phase: 'Pre-forming' },
      { date: '2026-05-29', message: 'Pavilion faceting completed under 20x magnification. Advancing to crown facets.', phase: 'Faceting' }
    ],
    progressPhotos: [
      { phase: 'Stone Received', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=300' },
      { phase: 'Pre-forming', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=300' }
    ]
  },
  {
    _id: 'cjob-202',
    gemName: 'Ceylon Padparadscha (Rough)',
    roughWeight: '5.2 ct',
    targetCut: 'Cushion Modified Brilliant',
    instructions: 'Preserve the pink-orange hue. Shallow pavilion to maintain pastel saturation. Final weight must exceed 2.5 carats.',
    cutterName: 'You',
    cutterId: 'cutter-self',
    status: 'Pre-forming',
    progress: 45,
    expectedDate: '2026-06-20',
    escrowFee: 117000,
    logs: [
      { date: '2026-05-30', message: 'Stone received from Colombo escrow vault. Weight verified at 5.18 carats.', phase: 'Stone Received' },
      { date: '2026-06-01', message: 'Pre-forming initiated. Mapping optimal symmetry angles for cushion shape.', phase: 'Pre-forming' }
    ],
    progressPhotos: [
      { phase: 'Stone Received', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=300' }
    ]
  }
];

// ─── Cutter: Incoming job requests from buyers ───
const INITIAL_INCOMING_REQUESTS: IncomingJobRequest[] = [
  {
    _id: 'req-301',
    buyerName: 'Kasun Wijeratne',
    gemName: 'Rough Ceylon Moonstone (6.8 ct)',
    roughWeight: '6.8 ct',
    targetCut: 'Oval Cabochon — High Dome',
    instructions: 'Maximize blue adularescence. Keep dome height at 60% of width for optimal light play. Must retain minimum 4 carats.',
    offeredFee: 91800,
    requestDate: '2026-06-02',
    status: 'Pending',
  },
  {
    _id: 'req-302',
    buyerName: 'Dinesh Karunaratne',
    gemName: 'Rough Ceylon Spinel (4.3 ct)',
    roughWeight: '4.3 ct',
    targetCut: 'Round Brilliant — 57 Facet',
    instructions: 'Standard round brilliant with excellent symmetry. Vivid red color must be preserved. Table size 55-58%. Crown angle 34°.',
    offeredFee: 141900,
    requestDate: '2026-06-01',
    status: 'Pending',
  },
  {
    _id: 'req-303',
    buyerName: 'Amaya Rajapaksha',
    gemName: 'Rough Ceylon Alexandrite (3.1 ct)',
    roughWeight: '3.1 ct',
    targetCut: 'Emerald Step Cut',
    instructions: 'Color-change effect must be clearly visible under both daylight and incandescent. Keep depth ratio under 70%.',
    offeredFee: 102300,
    requestDate: '2026-05-28',
    status: 'Pending',
  }
];

// Mock buyer owned rough gemstones (for hiring modal)
const MOCK_OWNED_GEMS = [
  { id: 'gem-1', name: 'Rough Ceylon Padparadscha (9.2 ct) - Sunset Pink-Orange', weight: '9.2 ct' },
  { id: 'gem-2', name: 'Rough Ceylon Alexandrite (5.4 ct) - Color-Change Green-Red', weight: '5.4 ct' },
  { id: 'gem-3', name: 'Rough Ceylon Moonstone (4.1 ct) - Blue Sheen Adularescence', weight: '4.1 ct' }
];

// ─────────────────────────────────────────────────────────────────────────────
// ServiceHub Component
// ─────────────────────────────────────────────────────────────────────────────

export const ServiceHub: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role: activeRole } = useRoleTheme();

  const isCutter = activeRole === 'CUTTER';

  // ─── BUYER/SELLER State ───
  const [activeTab, setActiveTab] = useState<'find-cutter' | 'my-jobs'>(() => {
    if (location.pathname.endsWith('/jobs')) return 'my-jobs';
    return 'find-cutter';
  });
  const [cutters] = useState<Cutter[]>(MOCK_CUTTERS);
  const [buyerActiveJobs, setBuyerActiveJobs] = useState<ActiveJob[]>(INITIAL_BUYER_JOBS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedCutter, setSelectedCutter] = useState<Cutter | null>(null);
  const [selectedRoughGem, setSelectedRoughGem] = useState(MOCK_OWNED_GEMS[0].id);
  const [customInstructions, setCustomInstructions] = useState('');
  const [expectedFinish, setExpectedFinish] = useState('');
  const [agreedFee, setAgreedFee] = useState<number>(105000);
  const [viewingPortfolio, setViewingPortfolio] = useState<{ cutterId: string; index: number } | null>(null);
  const [showDemoControls, setShowDemoControls] = useState(true);
  const [newLogMessage, setNewLogMessage] = useState<Record<string, string>>({});

  // ─── CUTTER State ───
  const [cutterTab, setCutterTab] = useState<'incoming' | 'active'>(() => {
    if (location.pathname.endsWith('/jobs')) return 'active';
    return 'incoming';
  });
  const [incomingRequests, setIncomingRequests] = useState<IncomingJobRequest[]>(INITIAL_INCOMING_REQUESTS);
  const [cutterActiveJobs, setCutterActiveJobs] = useState<ActiveJob[]>(INITIAL_CUTTER_ACTIVE_JOBS);
  const [cutterNewLogMessage, setCutterNewLogMessage] = useState<Record<string, string>>({});

  // Sync tabs with route
  useEffect(() => {
    if (location.pathname.endsWith('/jobs')) {
      setActiveTab('my-jobs');
      setCutterTab('active');
    } else {
      setActiveTab('find-cutter');
      setCutterTab('incoming');
    }
  }, [location.pathname]);

  // ─────────────────────────────────────────────────────────────────────────
  // BUYER/SELLER Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleTabChange = (tab: 'find-cutter' | 'my-jobs') => {
    setActiveTab(tab);
    if (tab === 'my-jobs') {
      navigate('/service-hub/jobs');
    } else {
      navigate('/service-hub');
    }
  };

  const specialtiesList = ['All', ...Array.from(new Set(MOCK_CUTTERS.flatMap(c => c.specialties)))];

  const filteredCutters = cutters.filter(cutter => {
    const matchesSearch =
      `${cutter.firstName} ${cutter.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cutter.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cutter.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || cutter.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  const handleHireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCutter) return;
    const gem = MOCK_OWNED_GEMS.find(g => g.id === selectedRoughGem);
    if (!gem) return;
    if (!customInstructions.trim()) {
      toast.error('Instructions Required', 'Please provide cut instructions.');
      return;
    }
    if (!expectedFinish) {
      toast.error('Date Required', 'Please specify expected finish date.');
      return;
    }

    const newJob: ActiveJob = {
      _id: `job-${Date.now()}`,
      gemName: gem.name,
      roughWeight: gem.weight,
      targetCut: 'Custom Precision Cut',
      instructions: customInstructions,
      cutterName: `${selectedCutter.firstName} ${selectedCutter.lastName}`,
      cutterId: selectedCutter._id,
      status: 'Stone Received',
      progress: 20,
      expectedDate: expectedFinish,
      escrowFee: agreedFee,
      logs: [
        { date: new Date().toISOString().split('T')[0], message: 'Service requested. Escrow secured. Gemstone transit initiated.', phase: 'Stone Received' }
      ],
      progressPhotos: [
        { phase: 'Stone Received', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=300' }
      ]
    };

    setBuyerActiveJobs([newJob, ...buyerActiveJobs]);
    setShowHireModal(false);
    setCustomInstructions('');
    setExpectedFinish('');

    toast.success(
      'Service Requested Successfully!',
      `Escrow payment of ${formatLKR(agreedFee)} secured. ${selectedCutter.firstName} has been notified.`
    );
    handleTabChange('my-jobs');
  };

  const handleAdvanceStage = (jobId: string, _jobsList: ActiveJob[], setJobs: React.Dispatch<React.SetStateAction<ActiveJob[]>>) => {
    setJobs(prevJobs => prevJobs.map(job => {
      if (job._id !== jobId) return job;
      const currentIdx = STAGES.indexOf(job.status);
      if (currentIdx === STAGES.length - 1) {
        toast.info('Job Completed', 'Gemstone has already been shipped!');
        return job;
      }
      const nextStatus = STAGES[currentIdx + 1];
      const nextProgress = STAGE_PROGRESS_MAP[nextStatus];
      const stageMessages: Record<ActiveJob['status'], string> = {
        'Stone Received': 'Cutter checked the gemstone dimensions and locked it in the mechanical dop stick.',
        'Pre-forming': 'Completed shaping pre-form outline. Symmetry looks excellent, facet mapping initiated.',
        'Faceting': 'Precisely cut all pavilion and crown facets. Pavilion depth and crown angles calibrated.',
        'Polished': 'Lapping completed. All facets buffed with fine oxide polish. High refractivity achieved.',
        'Ready to Ship': 'Polished gemstone packaged in secure case. Transit tracking code dispatched to Courier.'
      };
      const newLog = {
        date: new Date().toISOString().split('T')[0],
        message: stageMessages[nextStatus],
        phase: nextStatus
      };
      toast.success(`Job Advanced to: ${nextStatus}`, `Progress increased to ${nextProgress}%.`);
      return { ...job, status: nextStatus, progress: nextProgress, logs: [...job.logs, newLog] };
    }));
  };

  const handleAddCustomLog = (jobId: string, logMap: Record<string, string>, setLogMap: React.Dispatch<React.SetStateAction<Record<string, string>>>, _jobsList: ActiveJob[], setJobs: React.Dispatch<React.SetStateAction<ActiveJob[]>>) => {
    const msg = logMap[jobId];
    if (!msg || !msg.trim()) return;
    setJobs(prevJobs => prevJobs.map(job => {
      if (job._id !== jobId) return job;
      return { ...job, logs: [...job.logs, { date: new Date().toISOString().split('T')[0], message: msg.trim(), phase: job.status }] };
    }));
    setLogMap(prev => ({ ...prev, [jobId]: '' }));
    toast.success('Log Note Dispatched', 'Your note has been appended to the progress timeline.');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CUTTER Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleCutterTabChange = (tab: 'incoming' | 'active') => {
    setCutterTab(tab);
    if (tab === 'active') {
      navigate('/service-hub/jobs');
    } else {
      navigate('/service-hub');
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = incomingRequests.find(r => r._id === requestId);
    if (!request) return;

    setIncomingRequests(prev => prev.map(r =>
      r._id === requestId ? { ...r, status: 'Accepted' as const } : r
    ));

    const newJob: ActiveJob = {
      _id: `cjob-${Date.now()}`,
      gemName: request.gemName,
      roughWeight: request.roughWeight,
      targetCut: request.targetCut,
      instructions: request.instructions,
      cutterName: 'You',
      cutterId: 'cutter-self',
      status: 'Stone Received',
      progress: 20,
      expectedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      escrowFee: request.offeredFee,
      logs: [
        { date: new Date().toISOString().split('T')[0], message: `Job accepted from ${request.buyerName}. Awaiting gemstone shipment to workshop.`, phase: 'Stone Received' }
      ],
      progressPhotos: []
    };

    setCutterActiveJobs(prev => [newJob, ...prev]);
    toast.success('Job Accepted!', `You accepted the cutting request from ${request.buyerName}. ${formatLKR(request.offeredFee)} has been secured in escrow.`);
    handleCutterTabChange('active');
  };

  const handleDeclineRequest = (requestId: string) => {
    setIncomingRequests(prev => prev.map(r =>
      r._id === requestId ? { ...r, status: 'Declined' as const } : r
    ));
    toast.info('Request Declined', 'The buyer has been notified.');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Shared Job Card Renderer
  // ─────────────────────────────────────────────────────────────────────────

  const renderJobCard = (
    job: ActiveJob,
    jobsList: ActiveJob[],
    setJobs: React.Dispatch<React.SetStateAction<ActiveJob[]>>,
    logMap: Record<string, string>,
    setLogMap: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    showCutterLabel: boolean
  ) => {
    const currentStageIdx = STAGES.indexOf(job.status);

    return (
      <div
        key={job._id}
        className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl overflow-hidden p-6 md:p-8 space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex gap-4 items-start">
            <div className="h-12 w-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-700 flex-shrink-0">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Job ID: {job._id}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">{job.gemName}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                <span className="font-semibold bg-white/70 px-2 py-0.5 rounded border border-slate-200">
                  Rough: {job.roughWeight}
                </span>
                <span className="font-semibold bg-white/70 px-2 py-0.5 rounded border border-slate-200">
                  Target Cut: {job.targetCut}
                </span>
                {showCutterLabel && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      Cutter: <strong className="text-slate-900">{job.cutterName}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 self-start md:self-center">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Held in Escrow
              </span>
              <p className="text-xl font-black text-teal-600">
                {formatLKR(job.escrowFee)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Est. Finish Date
              </span>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end mt-0.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {job.expectedDate}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold uppercase tracking-wider">
              Active Phase: <strong className="text-teal-700">{job.status}</strong>
            </span>
            <span className="font-black text-slate-900 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-lg shadow-sm">
              {job.progress}% Complete
            </span>
          </div>

          {/* Step Timeline */}
          <div className="relative pt-6 pb-2">
            <div className="absolute top-[38px] left-[5%] right-[5%] h-1 bg-slate-200/80 rounded-full z-0">
              <div
                className="h-full bg-teal-600 rounded-full transition-all duration-500"
                style={{ width: `${(currentStageIdx / (STAGES.length - 1)) * 100}%` }}
              />
            </div>
            <div className="relative flex justify-between z-10">
              {STAGES.map((stage, idx) => {
                const isCompleted = idx < currentStageIdx;
                const isActive = idx === currentStageIdx;
                return (
                  <div key={stage} className="flex flex-col items-center w-[18%] text-center">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border shadow-sm ${
                        isCompleted
                          ? 'bg-teal-600 text-white border-teal-500 scale-105'
                          : isActive
                          ? 'bg-white text-teal-700 border-teal-600 ring-4 ring-teal-500/20 scale-110'
                          : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : idx + 1}
                    </div>
                    <span className={`text-[10px] font-bold mt-2 hidden sm:block ${
                      isActive ? 'text-slate-900 font-extrabold' : isCompleted ? 'text-teal-600' : 'text-slate-400'
                    }`}>
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Specs, Logs, Photos */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-inner">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-teal-600" />
                Cutting Specifications & Requests
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{job.instructions}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Milestone Audit Logs</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {job.logs.map((log, index) => (
                  <div key={index} className="flex gap-3 bg-white/20 p-3 rounded-xl border border-white/30 hover:bg-white/30 transition-colors">
                    <span className="text-[9px] font-bold text-slate-400 shrink-0 mt-0.5">{log.date}</span>
                    <div>
                      <span className="text-[9px] font-extrabold bg-teal-500/10 text-teal-700 border border-teal-500/20 px-1.5 py-0.5 rounded uppercase mr-2">
                        {log.phase}
                      </span>
                      <p className="text-xs text-slate-800 mt-1 font-medium leading-relaxed">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Camera className="h-3.5 w-3.5" /> Progress Photo Feed
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {job.progressPhotos.map((photo, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden h-20 bg-slate-900 group">
                    <img src={photo.img} alt={photo.phase} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-md text-[7px] font-bold text-white px-1 rounded truncate max-w-[90%]">
                      {photo.phase}
                    </span>
                  </div>
                ))}
                {job.progressPhotos.length < 4 && (
                  <div className="border-2 border-dashed border-slate-300/60 rounded-xl h-20 flex flex-col items-center justify-center text-slate-400 hover:border-teal-500 hover:text-slate-600 transition-colors cursor-pointer bg-white/10">
                    <Plus className="h-4 w-4" />
                    <span className="text-[8px] font-bold uppercase mt-1">Pending</span>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Demo Panel */}
            <div className="bg-gradient-to-br from-indigo-500/5 to-teal-500/5 rounded-2xl p-4 border border-teal-500/20 space-y-3">
              <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs">
                <Sparkles className="h-4 w-4 text-teal-600" />
                <span>Developer Interactive Panel</span>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => handleAdvanceStage(job._id, jobsList, setJobs)}
                  disabled={job.status === 'Ready to Ship'}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                    job.status === 'Ready to Ship'
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-teal-600 hover:bg-teal-700 text-white hover:scale-[1.01]'
                  }`}
                >
                  Advance Cutting Phase
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="flex gap-1.5 mt-2">
                  <input
                    type="text"
                    value={logMap[job._id] || ''}
                    onChange={(e) => setLogMap({ ...logMap, [job._id]: e.target.value })}
                    placeholder="Add progress log note..."
                    className="flex-1 text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white/60 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                  />
                  <button
                    onClick={() => handleAddCustomLog(job._id, logMap, setLogMap, jobsList, setJobs)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-2.5 rounded-lg flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: CUTTER VIEW — Lapidary Dashboard
  // ═══════════════════════════════════════════════════════════════════════════

  if (isCutter) {
    const pendingRequests = incomingRequests.filter(r => r.status === 'Pending');
    const processedRequests = incomingRequests.filter(r => r.status !== 'Pending');

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Scissors className="h-8 w-8 text-purple-600 animate-pulse" />
              Lapidary Dashboard
            </h1>
            <p className="text-slate-600 mt-1 max-w-xl text-sm">
              Manage incoming cutting requests from buyers, accept new commissions, and track your active lapidary jobs.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-white/50 backdrop-blur-md rounded-2xl p-1.5 border border-white/80 shadow-md flex gap-2 w-fit">
            <button
              onClick={() => handleCutterTabChange('incoming')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer relative ${
                cutterTab === 'incoming'
                  ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Inbox className="h-4 w-4" />
              Incoming Requests
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleCutterTabChange('active')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer relative ${
                cutterTab === 'active'
                  ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <FolderKanban className="h-4 w-4" />
              Active Jobs
              {cutterActiveJobs.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
                  {cutterActiveJobs.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ─── CUTTER TAB: Incoming Job Requests ─── */}
        {cutterTab === 'incoming' && (
          <div className="space-y-6">
            {/* Pending Requests */}
            {pendingRequests.length === 0 && processedRequests.length === 0 ? (
              <div className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-3xl p-12 text-center">
                <Inbox className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900">No Incoming Requests</h3>
                <p className="text-xs text-slate-600 mt-1">You have no pending cutting requests from buyers at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Pending */}
                {pendingRequests.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      Pending Review ({pendingRequests.length})
                    </h2>
                    {pendingRequests.map(req => (
                      <div
                        key={req._id}
                        className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-2xl p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex gap-4 items-start flex-1">
                            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 flex-shrink-0">
                              <Gem className="h-6 w-6" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-extrabold text-slate-900">{req.gemName}</h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                                  Pending
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" /> Buyer: <strong className="text-slate-900">{req.buyerName}</strong>
                                </span>
                                <span className="font-semibold bg-white/70 px-2 py-0.5 rounded border border-slate-200">
                                  Weight: {req.roughWeight}
                                </span>
                                <span className="font-semibold bg-white/70 px-2 py-0.5 rounded border border-slate-200">
                                  Target: {req.targetCut}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> {req.requestDate}
                                </span>
                              </div>
                              <div className="bg-white/50 backdrop-blur-md rounded-xl p-3 border border-white/60 mt-2">
                                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                  <strong className="text-slate-900">Instructions:</strong> {req.instructions}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                                Offered Fee
                              </span>
                              <p className="text-2xl font-black text-teal-600">
                                {formatLKR(req.offeredFee)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptRequest(req._id)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleDeclineRequest(req._id)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 shadow-sm transition-all duration-200 cursor-pointer"
                              >
                                <XCircle className="h-4 w-4" />
                                Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Processed Requests */}
                {processedRequests.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Previously Processed ({processedRequests.length})
                    </h2>
                    {processedRequests.map(req => (
                      <div
                        key={req._id}
                        className="bg-white/20 backdrop-blur-md border border-white/40 rounded-2xl p-4 opacity-60"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                              req.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                            }`}>
                              {req.status === 'Accepted' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-700">{req.gemName}</p>
                              <p className="text-[11px] text-slate-500">from {req.buyerName} • {req.requestDate}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            req.status === 'Accepted'
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── CUTTER TAB: Active Jobs ─── */}
        {cutterTab === 'active' && (
          <div className="space-y-8">
            {cutterActiveJobs.length === 0 ? (
              <div className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-3xl p-12 text-center">
                <Package className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900">No Active Cutting Jobs</h3>
                <p className="text-xs text-slate-600 mt-1">Accept an incoming request to start a new cutting job.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {cutterActiveJobs.map(job =>
                  renderJobCard(job, cutterActiveJobs, setCutterActiveJobs, cutterNewLogMessage, setCutterNewLogMessage, false)
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: BUYER / SELLER VIEW — Find a Cutter + My Cutting Jobs
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Scissors className="h-8 w-8 text-teal-600 animate-pulse" />
            B2B Lapidary Service Hub
          </h1>
          <p className="text-slate-600 mt-1 max-w-xl text-sm">
            Hire world-class gem cutters, secure your precious rough gems in escrow, and track complex cutting milestones in real-time.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white/50 backdrop-blur-md rounded-2xl p-1.5 border border-white/80 shadow-md flex gap-2 w-fit">
          <button
            onClick={() => handleTabChange('find-cutter')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
              activeTab === 'find-cutter'
                ? 'bg-teal-600 text-white shadow-md hover:bg-teal-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <User className="h-4 w-4" />
            Find a Cutter
          </button>
          <button
            onClick={() => handleTabChange('my-jobs')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer relative ${
              activeTab === 'my-jobs'
                ? 'bg-teal-600 text-white shadow-md hover:bg-teal-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <FolderKanban className="h-4 w-4" />
            My Cutting Jobs
            {buyerActiveJobs.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
                {buyerActiveJobs.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Demo helper banner */}
      {showDemoControls && (
        <div className="bg-gradient-to-r from-teal-500/10 to-indigo-500/10 backdrop-blur-md border border-teal-500/20 rounded-2xl p-4 flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-800">
              <span className="font-bold text-slate-900">Developer Interactive Sandbox Activated:</span>
              <p className="mt-1 leading-relaxed">
                Test the full escrow-lapidary cycle! You can click <span className="font-bold">Request Service</span> to hire an expert, and then transition the state nodes inside <span className="font-bold">My Cutting Jobs</span> to simulate live lapidary status shifts.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDemoControls(false)}
            className="text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ─── TAB 1: FIND A CUTTER ─── */}
      {activeTab === 'find-cutter' && (
        <div className="space-y-6">
          {/* Filter Row */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search cutters by specialty, bio, or name..."
                className="w-full text-xs pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {specialtiesList.map(spec => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 ${
                    selectedSpecialty === spec
                      ? 'bg-teal-600/15 text-teal-700 border border-teal-500/20'
                      : 'bg-white/60 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Cutter Cards Grid */}
          {filteredCutters.length === 0 ? (
            <div className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-3xl p-12 text-center">
              <Scissors className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">No Cutters Located</h3>
              <p className="text-xs text-slate-600 mt-1">Try resetting your specialties filter or entering a different search term.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredCutters.map(cutter => {
                const currentPortfolioIndex = viewingPortfolio?.cutterId === cutter._id ? viewingPortfolio.index : 0;
                const activePortfolio = cutter.portfolio[currentPortfolioIndex];

                return (
                  <div
                    key={cutter._id}
                    className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Header */}
                    <div className="p-6 pb-4 border-b border-white/40 bg-gradient-to-r from-teal-500/5 to-indigo-500/5">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 font-extrabold text-xl shadow-inner flex-shrink-0">
                            {cutter.firstName[0]}{cutter.lastName[0]}
                          </div>
                          <div>
                            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                              {cutter.firstName} {cutter.lastName}
                              <span className="h-2 w-2 rounded-full bg-teal-500 inline-block" title="Verified Master Cutter"></span>
                            </h3>
                            <p className="text-xs text-slate-600 font-medium">{cutter.businessName}</p>

                            <div className="flex items-center gap-1.5 mt-1.5">
                              <div className="flex items-center">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-bold text-slate-900 ml-1">{cutter.rating.toFixed(1)}</span>
                              </div>
                              <span className="text-slate-300 text-xs">•</span>
                              <span className="text-xs text-slate-600">{cutter.completedJobs} Lapidary Orders</span>
                            </div>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                          cutter.available
                            ? 'bg-teal-500/10 text-teal-700 border-teal-500/20'
                            : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                        }`}>
                          {cutter.available ? 'Ready to Cut' : 'At Capacity'}
                        </span>
                      </div>
                    </div>

                    {/* Bio & Specialties */}
                    <div className="p-6 py-4 space-y-4 flex-1">
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        "{cutter.bio}"
                      </p>

                      <div className="grid grid-cols-2 gap-3 text-xs bg-white/20 p-3 rounded-xl border border-white/30">
                        <div className="flex items-center gap-2 text-slate-700">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-semibold">{cutter.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-semibold">Avg. {cutter.averageTurnaroundDays} days</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Lapidary Specialties
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cutter.specialties.map(spec => (
                            <span key={spec} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/60 border border-slate-200 text-slate-700">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Portfolio Showcase */}
                      {cutter.portfolio.length > 0 && activePortfolio && (
                        <div className="mt-4 pt-4 border-t border-slate-100/60">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Featured Portfolio
                            </span>
                            {cutter.portfolio.length > 1 && (
                              <div className="flex gap-1.5">
                                {cutter.portfolio.map((_, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setViewingPortfolio({ cutterId: cutter._id, index: idx })}
                                    className={`h-2 w-2 rounded-full cursor-pointer transition-all ${
                                      currentPortfolioIndex === idx ? 'bg-teal-600 w-3.5' : 'bg-slate-300 hover:bg-slate-400'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="bg-slate-900/5 rounded-2xl p-2.5 border border-white/50">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="relative rounded-xl overflow-hidden h-24 bg-slate-900">
                                <img src={activePortfolio.roughImg} alt="Rough crystal" className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-1.5 flex flex-col justify-between">
                                  <span className="bg-black/40 backdrop-blur-md text-[8px] font-bold text-slate-300 px-1 py-0.5 rounded w-fit uppercase">
                                    Rough
                                  </span>
                                  <div className="text-[9px] text-white font-medium truncate">
                                    {activePortfolio.roughName} ({activePortfolio.roughWeight})
                                  </div>
                                </div>
                              </div>

                              <div className="relative rounded-xl overflow-hidden h-24 bg-slate-900">
                                <img src={activePortfolio.polishedImg} alt="Polished gemstone" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-1.5 flex flex-col justify-between">
                                  <span className="bg-teal-600/90 text-[8px] font-bold text-white px-1 py-0.5 rounded w-fit uppercase flex items-center gap-0.5">
                                    <Sparkles className="h-2 w-2 animate-spin" /> Faceted
                                  </span>
                                  <div className="text-[9px] text-white font-medium truncate">
                                    {activePortfolio.polishedName} ({activePortfolio.polishedWeight})
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-6 pt-0 flex justify-between items-center border-t border-white/30 bg-white/20">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                          Lapidary Fee
                        </span>
                        <p className="text-lg font-black text-teal-600">
                          Rs. {(cutter.ratePerCarat || 0).toLocaleString('en-LK')}/ct
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCutter(cutter);
                          setAgreedFee((cutter.ratePerCarat || 22500) * 5);
                          setShowHireModal(true);
                        }}
                        disabled={!cutter.available}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-md ${
                          cutter.available
                            ? 'bg-slate-900 hover:bg-slate-800 text-white hover:scale-[1.02] cursor-pointer'
                            : 'bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed'
                        }`}
                      >
                        Request Service
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: MY CUTTING JOBS ─── */}
      {activeTab === 'my-jobs' && (
        <div className="space-y-8">
          {buyerActiveJobs.length === 0 ? (
            <div className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-3xl p-12 text-center">
              <Scissors className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">No Active Cutting Orders</h3>
              <p className="text-xs text-slate-600 mt-1">You haven't hired a cutter yet. Browse cutters and submit a gemstone request!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {buyerActiveJobs.map(job =>
                renderJobCard(job, buyerActiveJobs, setBuyerActiveJobs, newLogMessage, setNewLogMessage, true)
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── HIRE CUTTER REQUEST MODAL ─── */}
      {showHireModal && selectedCutter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white/95 backdrop-blur-xl border border-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                  Secure Escrow Request
                </span>
                <h3 className="text-xl font-extrabold mt-1">
                  Hire {selectedCutter.firstName} {selectedCutter.lastName}
                </h3>
              </div>
              <button
                onClick={() => setShowHireModal(false)}
                className="text-white/80 hover:text-white cursor-pointer bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleHireSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Rough Gemstone from Inventory *
                </label>
                <select
                  value={selectedRoughGem}
                  onChange={(e) => {
                    setSelectedRoughGem(e.target.value);
                    const gem = MOCK_OWNED_GEMS.find(g => g.id === e.target.value);
                    if (gem) {
                      const weightNum = parseFloat(gem.weight);
                      setAgreedFee(Math.round((selectedCutter.ratePerCarat || 22500) * weightNum));
                    }
                  }}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {MOCK_OWNED_GEMS.map(gem => (
                    <option key={gem.id} value={gem.id}>
                      {gem.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Only rough gemstones currently secured in the Escrow vault are eligible for lapidary dispatch.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Facet Instructions & Specifications *
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={4}
                  required
                  placeholder="Describe your target cut specifications, symmetry criteria, inclusion removals, girdle width, and polish requirements..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Completion Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedFinish}
                    onChange={(e) => setExpectedFinish(e.target.value)}
                    min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Secured Escrow Fee (LKR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">Rs.</span>
                    <input
                      type="number"
                      required
                      min={5000}
                      value={agreedFee}
                      onChange={(e) => setAgreedFee(Number(e.target.value))}
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Escrow Disclaimer */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-start gap-2.5 text-[11px] leading-relaxed text-slate-600">
                <Shield className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-900">Escrow Security Policy:</strong> Your funds will be locked in the secure smart escrow contract. The cutter will not receive payment until you verify delivery and release the funds, or a dispute is resolved by an arbiter.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHireModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md cursor-pointer text-center"
                >
                  Authorize Hire Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
