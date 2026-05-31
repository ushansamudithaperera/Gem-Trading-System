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
  FolderKanban
} from 'lucide-react';
// import { getAvailableCutters, getBuyerCuttingJobs } from '../../services/cutting.service';
import { toast } from '../../components/ui/Toast';

// Cutter definition
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
  hourlyRate?: number; // Price per Carat or hourly
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

// Active Job definition
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

// Sample Curated Cutters Roster
const MOCK_CUTTERS: Cutter[] = [
  {
    _id: 'cutter-1',
    firstName: 'Marcus',
    lastName: 'Vane',
    businessName: 'Vane Precision Lapidary',
    rating: 5.0,
    totalTransactions: 42,
    location: 'Colombo, Sri Lanka',
    bio: 'Specializing in maximizing light return through concave faceting. Over 15 years cutting premium sapphires and spinels.',
    specialties: ['Concave Faceting', 'Custom Step Cuts', 'Spinels'],
    completedJobs: 38,
    averageTurnaroundDays: 12,
    hourlyRate: 75, // $75 per carat
    available: true,
    portfolio: [
      {
        roughName: 'Rough Sapphire',
        polishedName: 'Concave Oval Sapphire',
        roughWeight: '8.4 ct',
        polishedWeight: '4.1 ct',
        roughImg: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400',
        polishedImg: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=400',
      },
      {
        roughName: 'Rough Aquamarine',
        polishedName: 'Precision Emerald-Cut Aqua',
        roughWeight: '14.2 ct',
        polishedWeight: '7.8 ct',
        roughImg: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400',
        polishedImg: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400',
      }
    ]
  },
  {
    _id: 'cutter-2',
    firstName: 'Sophia',
    lastName: 'Sterling',
    businessName: 'Sterling Lapidary Studio',
    rating: 4.9,
    totalTransactions: 29,
    location: 'Antwerp, Belgium',
    bio: 'Artisanal lapidary focusing on organic inclusions and high-dome cabochon cuts. Dedicated to preserving the natural soul of rough stones.',
    specialties: ['Cabochons', 'Carvings', 'Freeform Cuts'],
    completedJobs: 26,
    averageTurnaroundDays: 8,
    hourlyRate: 45, // $45 per carat
    available: true,
    portfolio: [
      {
        roughName: 'Rough Tourmaline',
        polishedName: 'Bicolor Freeform Tourmaline',
        roughWeight: '15.0 ct',
        polishedWeight: '11.2 ct',
        roughImg: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400',
        polishedImg: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=400',
      }
    ]
  },
  {
    _id: 'cutter-3',
    firstName: 'Liam',
    lastName: 'Aurelius',
    businessName: 'Aurelius High-Refractive Gems',
    rating: 4.8,
    totalTransactions: 37,
    location: 'Ratnapura, Sri Lanka',
    bio: 'Specialist in extreme mathematical symmetry, including 161-facet Portuguese cuts. Best for high-value tourmalines and garnets.',
    specialties: ['Portuguese Cuts', 'Extreme Symmetry', 'Garnets'],
    completedJobs: 33,
    averageTurnaroundDays: 15,
    hourlyRate: 110, // $110 per carat
    available: true,
    portfolio: [
      {
        roughName: 'Rough Tsavorite',
        polishedName: '161-Facet Portuguese Tsavorite',
        roughWeight: '9.3 ct',
        polishedWeight: '4.2 ct',
        roughImg: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400',
        polishedImg: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=400',
      }
    ]
  },
  {
    _id: 'cutter-4',
    firstName: 'Elena',
    lastName: 'Rostova',
    businessName: 'Rostova Precision Cuts',
    rating: 4.9,
    totalTransactions: 53,
    location: 'St. Petersburg, Russia',
    bio: 'Award-winning cutter creating patented geometric fantasy cuts. Creating unique light-reflection matrices tailored to each specific stone.',
    specialties: ['Fantasy Cuts', 'Patented Facet Mapping', 'Amethysts'],
    completedJobs: 49,
    averageTurnaroundDays: 10,
    hourlyRate: 95,
    available: false, // Currently busy
    portfolio: [
      {
        roughName: 'Rough Amethyst',
        polishedName: 'Hexagonal Star Amethyst',
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

const INITIAL_MOCK_JOBS: ActiveJob[] = [
  {
    _id: 'job-101',
    gemName: 'Ceylon Blue Sapphire (Rough)',
    roughWeight: '7.8 ct',
    targetCut: 'Oval Concave Brilliant',
    instructions: 'Maximize color depth and brilliance. Focus concave facets towards the culet area. Preserve weight above 3.5 carats if possible.',
    cutterName: 'Marcus Vane',
    cutterId: 'cutter-1',
    status: 'Faceting',
    progress: 70,
    expectedDate: '2026-06-12',
    escrowFee: 585,
    logs: [
      { date: '2026-05-24', message: 'Rough gemstone received at laboratory. Integrity checks complete: zero internal micro-fractures identified.', phase: 'Stone Received' },
      { date: '2026-05-26', message: 'Pre-forming process completed. Girdle shape outlined and pavilion dop pin mounted successfully.', phase: 'Pre-forming' },
      { date: '2026-05-29', message: ' Pavilion faceting completed under 20x magnification. Advancing to crown facet cutting.', phase: 'Faceting' }
    ],
    progressPhotos: [
      { phase: 'Stone Received', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=300' },
      { phase: 'Pre-forming', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=300' }
    ]
  },
  {
    _id: 'job-102',
    gemName: 'Mozambique Rubellites (Rough)',
    roughWeight: '12.4 ct',
    targetCut: 'Cushion Step Cut',
    instructions: 'Maintain depth to amplify saturate magenta-rubellite hues. Medium girdle thickness required for heavy prong settings.',
    cutterName: 'Sophia Sterling',
    cutterId: 'cutter-2',
    status: 'Stone Received',
    progress: 20,
    expectedDate: '2026-06-18',
    escrowFee: 558,
    logs: [
      { date: '2026-05-29', message: 'Stone received and verified. Weight calibrated at 12.38 carats.', phase: 'Stone Received' }
    ],
    progressPhotos: [
      { phase: 'Stone Received', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=300' }
    ]
  }
];

// Mock buyer owned rough gemstones
const MOCK_OWNED_GEMS = [
  { id: 'gem-1', name: 'Rough Tanzanite (9.2 ct) - Intense Violet', weight: '9.2 ct' },
  { id: 'gem-2', name: 'Rough Colombian Emerald (5.4 ct) - Garden Inclusions', weight: '5.4 ct' },
  { id: 'gem-3', name: 'Rough Tsavorite Garnet (4.1 ct) - Vivid Lime Green', weight: '4.1 ct' }
];

export const ServiceHub: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Active Tab: "find-cutter" or "my-jobs"
  const [activeTab, setActiveTab] = useState<'find-cutter' | 'my-jobs'>(() => {
    if (location.pathname.endsWith('/jobs')) return 'my-jobs';
    return 'find-cutter';
  });

  const [cutters] = useState<Cutter[]>(MOCK_CUTTERS);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>(INITIAL_MOCK_JOBS);
  
  // Cutter Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  
  // Hiring Modal
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedCutter, setSelectedCutter] = useState<Cutter | null>(null);
  const [selectedRoughGem, setSelectedRoughGem] = useState(MOCK_OWNED_GEMS[0].id);
  const [customInstructions, setCustomInstructions] = useState('');
  const [expectedFinish, setExpectedFinish] = useState('');
  const [agreedFee, setAgreedFee] = useState<number>(350);

  // Active Portfolio Previews
  const [viewingPortfolio, setViewingPortfolio] = useState<{ cutterId: string; index: number } | null>(null);

  // Advanced Demo Controls
  const [showDemoControls, setShowDemoControls] = useState(true);
  const [newLogMessage, setNewLogMessage] = useState<Record<string, string>>({});

  useEffect(() => {
    // Sync tab when route updates
    if (location.pathname.endsWith('/jobs')) {
      setActiveTab('my-jobs');
    } else {
      setActiveTab('find-cutter');
    }
  }, [location.pathname]);

  const handleTabChange = (tab: 'find-cutter' | 'my-jobs') => {
    setActiveTab(tab);
    if (tab === 'my-jobs') {
      navigate('/service-hub/jobs');
    } else {
      navigate('/service-hub');
    }
  };

  // Specialty options filter list
  const specialtiesList = ['All', ...Array.from(new Set(MOCK_CUTTERS.flatMap(c => c.specialties)))];

  // Filter cutters
  const filteredCutters = cutters.filter(cutter => {
    const matchesSearch = 
      `${cutter.firstName} ${cutter.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cutter.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cutter.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'All' || cutter.specialties.includes(selectedSpecialty);
    
    return matchesSearch && matchesSpecialty;
  });

  // Hire cutter form submit handler
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

    // Insert new active job in states
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

    setActiveJobs([newJob, ...activeJobs]);
    setShowHireModal(false);
    setCustomInstructions('');
    setExpectedFinish('');
    
    toast.success(
      'Service Requested Successfully!',
      `Escrow payment of $${agreedFee} secured. ${selectedCutter.firstName} has been notified.`
    );

    // Switch to active jobs list tab
    handleTabChange('my-jobs');
  };

  // Demo tool: advance stage of job card
  const handleAdvanceStage = (jobId: string) => {
    setActiveJobs(prevJobs => prevJobs.map(job => {
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

      toast.success(
        `Job Advanced to: ${nextStatus}`,
        `Progress increased to ${nextProgress}%.`
      );

      return {
        ...job,
        status: nextStatus,
        progress: nextProgress,
        logs: [...job.logs, newLog]
      };
    }));
  };

  // Demo tool: Add custom log note
  const handleAddCustomLog = (jobId: string) => {
    const msg = newLogMessage[jobId];
    if (!msg || !msg.trim()) return;

    setActiveJobs(prevJobs => prevJobs.map(job => {
      if (job._id !== jobId) return job;
      return {
        ...job,
        logs: [...job.logs, {
          date: new Date().toISOString().split('T')[0],
          message: msg.trim(),
          phase: job.status
        }]
      };
    }));

    setNewLogMessage(prev => ({ ...prev, [jobId]: '' }));
    toast.success('Log Note Dispatched', 'Your note has been appended to the progress timeline.');
  };

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

        {/* Dynamic Glassmorphic Tabs Selector */}
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
            {activeJobs.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
                {activeJobs.length}
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

      {/* -------------------- TAB 1: FIND A CUTTER -------------------- */}
      {activeTab === 'find-cutter' && (
        <div className="space-y-6">
          {/* Filtering row */}
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

          {/* Grid of Cutter Profiles */}
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

                      {/* Details row */}
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

                      {/* Specialties Badges */}
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

                      {/* Portfolio Showcase section */}
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

                          {/* Before & After Panel */}
                          <div className="bg-slate-900/5 rounded-2xl p-2.5 border border-white/50">
                            <div className="grid grid-cols-2 gap-3">
                              {/* Before (Rough) */}
                              <div className="relative rounded-xl overflow-hidden h-24 bg-slate-900">
                                <img
                                  src={activePortfolio.roughImg}
                                  alt="Rough crystal"
                                  className="w-full h-full object-cover opacity-80"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-1.5 flex flex-col justify-between">
                                  <span className="bg-black/40 backdrop-blur-md text-[8px] font-bold text-slate-300 px-1 py-0.5 rounded w-fit uppercase">
                                    Rough
                                  </span>
                                  <div className="text-[9px] text-white font-medium truncate">
                                    {activePortfolio.roughName} ({activePortfolio.roughWeight})
                                  </div>
                                </div>
                              </div>

                              {/* After (Polished) */}
                              <div className="relative rounded-xl overflow-hidden h-24 bg-slate-900">
                                <img
                                  src={activePortfolio.polishedImg}
                                  alt="Polished gemstone"
                                  className="w-full h-full object-cover"
                                />
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
                          ${cutter.hourlyRate}/ct
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCutter(cutter);
                          setAgreedFee((cutter.hourlyRate || 75) * 5); // default calculated for 5 carats
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

      {/* -------------------- TAB 2: MY CUTTING JOBS -------------------- */}
      {activeTab === 'my-jobs' && (
        <div className="space-y-8">
          {activeJobs.length === 0 ? (
            <div className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-3xl p-12 text-center">
              <Scissors className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">No Active Cutting Orders</h3>
              <p className="text-xs text-slate-600 mt-1">You haven't hired a cutter yet. Browse cutters and submit a gemstone request!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {activeJobs.map(job => {
                const currentStageIdx = STAGES.indexOf(job.status);

                return (
                  <div
                    key={job._id}
                    className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl overflow-hidden p-6 md:p-8 space-y-6"
                  >
                    {/* Header: Gem Details & Fee */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                      <div className="flex gap-4 items-start">
                        <div className="h-12 w-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-700 flex-shrink-0">
                          <Layers className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                            Job ID: {job._id}
                          </span>
                          <h3 className="text-xl font-extrabold text-slate-900">
                            {job.gemName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                            <span className="font-semibold bg-white/70 px-2 py-0.5 rounded border border-slate-200">
                              Rough: {job.roughWeight}
                            </span>
                            <span className="font-semibold bg-white/77 px-2 py-0.5 rounded border border-slate-200">
                              Target Cut: {job.targetCut}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              Cutter: <strong className="text-slate-900">{job.cutterName}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 self-start md:self-center">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                            Held in Escrow
                          </span>
                          <p className="text-xl font-black text-teal-600">
                            ${job.escrowFee.toFixed(2)}
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

                    {/* Progress tracking details */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider">
                          Active Phase: <strong className="text-teal-700">{job.status}</strong>
                        </span>
                        <span className="font-black text-slate-900 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-lg shadow-sm">
                          {job.progress}% Complete
                        </span>
                      </div>
                      
                      {/* Premium Horizontal Step Timeline */}
                      <div className="relative pt-6 pb-2">
                        {/* Connecting Line */}
                        <div className="absolute top-[38px] left-[5%] right-[5%] h-1 bg-slate-200/80 rounded-full z-0">
                          <div
                            className="h-full bg-teal-600 rounded-full transition-all duration-500"
                            style={{ width: `${(currentStageIdx / (STAGES.length - 1)) * 100}%` }}
                          />
                        </div>

                        {/* Step Nodes */}
                        <div className="relative flex justify-between z-10">
                          {STAGES.map((stage, idx) => {
                            const isCompleted = idx < currentStageIdx;
                            const isActive = idx === currentStageIdx;

                            return (
                              <div key={stage} className="flex flex-col items-center w-[18%] text-center">
                                {/* Bullet Node */}
                                <div
                                  className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border shadow-sm ${
                                    isCompleted
                                      ? 'bg-teal-600 text-white border-teal-500 scale-105'
                                      : isActive
                                      ? 'bg-white text-teal-700 border-teal-600 ring-4 ring-teal-500/20 scale-110'
                                      : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  {isCompleted ? (
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                  ) : (
                                    idx + 1
                                  )}
                                </div>

                                {/* Node Title */}
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

                    {/* Specifications and Instructions */}
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <div className="bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-inner">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 text-teal-600" />
                            Cutting Specifications & Requests
                          </h4>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {job.instructions}
                          </p>
                        </div>

                        {/* Milestones Log logs */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Milestone Audit logs
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {job.logs.map((log, index) => (
                              <div
                                key={index}
                                className="flex gap-3 bg-white/20 p-3 rounded-xl border border-white/30 hover:bg-white/30 transition-colors"
                              >
                                <span className="text-[9px] font-bold text-slate-400 shrink-0 mt-0.5">
                                  {log.date}
                                </span>
                                <div>
                                  <span className="text-[9px] font-extrabold bg-teal-500/10 text-teal-700 border border-teal-500/20 px-1.5 py-0.5 rounded uppercase mr-2">
                                    {log.phase}
                                  </span>
                                  <p className="text-xs text-slate-800 mt-1 font-medium leading-relaxed">
                                    {log.message}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Photo feed & Actions side */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Camera className="h-3.5 w-3.5" /> Progress Photo Feed
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {job.progressPhotos.map((photo, i) => (
                              <div key={i} className="relative rounded-xl overflow-hidden h-20 bg-slate-900 group">
                                <img
                                  src={photo.img}
                                  alt={photo.phase}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-md text-[7px] font-bold text-white px-1 rounded truncate max-w-[90%]">
                                  {photo.phase}
                                </span>
                              </div>
                            ))}
                            {/* Empty uploads spaces */}
                            {job.progressPhotos.length < 4 && (
                              <div className="border-2 border-dashed border-slate-300/60 rounded-xl h-20 flex flex-col items-center justify-center text-slate-400 hover:border-teal-500 hover:text-slate-600 transition-colors cursor-pointer bg-white/10">
                                <Plus className="h-4 w-4" />
                                <span className="text-[8px] font-bold uppercase mt-1">Pending</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* INTERACTIVE DEMO ACTIONS PANEL */}
                        <div className="bg-gradient-to-br from-indigo-500/5 to-teal-500/5 rounded-2xl p-4 border border-teal-500/20 space-y-3">
                          <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs">
                            <Sparkles className="h-4 w-4 text-teal-600" />
                            <span>Developer Interactive Panel</span>
                          </div>

                          <div className="space-y-2">
                            {/* Advance phase button */}
                            <button
                              onClick={() => handleAdvanceStage(job._id)}
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

                            {/* Add manual message input */}
                            <div className="flex gap-1.5 mt-2">
                              <input
                                type="text"
                                value={newLogMessage[job._id] || ''}
                                onChange={(e) => setNewLogMessage({ ...newLogMessage, [job._id]: e.target.value })}
                                placeholder="Add progress log note..."
                                className="flex-1 text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white/60 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                              />
                              <button
                                onClick={() => handleAddCustomLog(job._id)}
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
              })}
            </div>
          )}
        </div>
      )}

      {/* -------------------- HIRE CUTTER REQUEST MODAL -------------------- */}
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
              {/* Select rough stone */}
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
                      setAgreedFee(Math.round((selectedCutter.hourlyRate || 75) * weightNum));
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

              {/* Specifications / Instructions */}
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

              {/* Dual Column details */}
              <div className="grid grid-cols-2 gap-4">
                {/* Expected Delivery */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Completion Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedFinish}
                    onChange={(e) => setExpectedFinish(e.target.value)}
                    min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Min 3 days
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* Agreed Escrow Fee */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Secured Escrow Fee (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">$</span>
                    <input
                      type="number"
                      required
                      min={50}
                      value={agreedFee}
                      onChange={(e) => setAgreedFee(Number(e.target.value))}
                      className="w-full text-xs pl-6 pr-3 py-2 rounded-xl border border-slate-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
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

              {/* Actions */}
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
