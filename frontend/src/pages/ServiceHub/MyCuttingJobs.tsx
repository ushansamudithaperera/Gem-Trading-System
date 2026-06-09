import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Calendar,
  Sparkles,
  User,
  AlertCircle,
  Check,
  Layers,
  Inbox,
  CheckCircle,
  XCircle,
  Package,
  Loader2,
  ChevronDown,
  Phone,
  Mail
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import api from '../../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export enum JobStatus {
  PENDING_ACCEPTANCE = 'pending_acceptance',
  STONE_RECEIVED = 'stone_received',
  PRE_FORMING = 'pre_forming',
  FACETING = 'faceting',
  POLISHED = 'polished',
  READY_TO_SHIP = 'ready_to_ship',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export interface ProgressLog {
  phase: string;
  note: string;
  photoUrl?: string;
  date: string | Date;
}

export interface CuttingJob {
  _id: string;
  buyerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  cutterId: string;
  gemId: {
    _id: string;
    name: string;
    caratWeight: number;
    quality: string;
    color: string;
  };
  stoneDetails?: string;
  targetCut?: string;
  instructions: string;
  expectedFinishDate: string;
  actualFinishDate?: string;
  agreedPrice: number;
  jobStatus: JobStatus;
  progressLogs: ProgressLog[];
  progressImages: string[];
  notes?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Styling Map & Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STAGES = [
  JobStatus.STONE_RECEIVED,
  JobStatus.PRE_FORMING,
  JobStatus.FACETING,
  JobStatus.POLISHED,
  JobStatus.READY_TO_SHIP,
];

const STAGE_LABELS: Record<string, string> = {
  [JobStatus.PENDING_ACCEPTANCE]: 'Pending Request',
  [JobStatus.STONE_RECEIVED]: 'Stone Received',
  [JobStatus.PRE_FORMING]: 'Pre-forming',
  [JobStatus.FACETING]: 'Faceting',
  [JobStatus.POLISHED]: 'Polished',
  [JobStatus.READY_TO_SHIP]: 'Ready to Ship',
  [JobStatus.COMPLETED]: 'Completed',
  [JobStatus.REJECTED]: 'Rejected',
};

const STAGE_COLORS: Record<string, string> = {
  [JobStatus.PENDING_ACCEPTANCE]: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  [JobStatus.STONE_RECEIVED]: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  [JobStatus.PRE_FORMING]: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
  [JobStatus.FACETING]: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  [JobStatus.POLISHED]: 'bg-pink-500/10 text-pink-700 border-pink-500/20',
  [JobStatus.READY_TO_SHIP]: 'bg-teal-500/10 text-teal-700 border-teal-500/20',
  [JobStatus.COMPLETED]: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  [JobStatus.REJECTED]: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
};

// Formats number to Sri Lankan Rupee (LKR)
const formatLKR = (amount: number): string => {
  return `Rs. ${amount.toLocaleString('en-LK')}`;
};

// Determines next logical phase for a job
const getNextLogicalPhase = (current: JobStatus): JobStatus | null => {
  const progression = [
    JobStatus.STONE_RECEIVED,
    JobStatus.PRE_FORMING,
    JobStatus.FACETING,
    JobStatus.POLISHED,
    JobStatus.READY_TO_SHIP,
    JobStatus.COMPLETED
  ];
  const idx = progression.indexOf(current);
  if (idx !== -1 && idx < progression.length - 1) {
    return progression[idx + 1];
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const MyCuttingJobs: React.FC = () => {
  const [jobs, setJobs] = useState<CuttingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'history'>('active');

  // Input states for form updates
  const [updatePhase, setUpdatePhase] = useState<Record<string, JobStatus>>({});
  const [updateNotes, setUpdateNotes] = useState<Record<string, string>>({});
  const [submittingProgress, setSubmittingProgress] = useState<Record<string, boolean>>({});

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetch Data on Mount
  // ─────────────────────────────────────────────────────────────────────────────

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs/cutter');
      // Extract jobs list
      const jobsList = response.data.data.jobs || response.data.data || [];
      setJobs(jobsList);
      
      // Pre-populate updatePhase state for each active job
      const phaseDefaults: Record<string, JobStatus> = {};
      jobsList.forEach((job: CuttingJob) => {
        phaseDefaults[job._id] = job.jobStatus;
      });
      setUpdatePhase(phaseDefaults);
    } catch (error: any) {
      console.error(error);
      toast.error('Fetch Failed', error.message || 'Unable to retrieve cutting jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Accept/Reject Handlers (Optimistic Updates)
  // ─────────────────────────────────────────────────────────────────────────────

  const handleAcceptJob = async (jobId: string) => {
    // Preserve current state for rollbacks
    const previousJobs = [...jobs];

    // Optimistic Update
    setJobs(prevJobs =>
      prevJobs.map(job => {
        if (job._id === jobId) {
          return {
            ...job,
            jobStatus: JobStatus.STONE_RECEIVED,
            progressLogs: [
              {
                phase: JobStatus.STONE_RECEIVED,
                note: 'Job accepted. Awaiting stone delivery.',
                date: new Date().toISOString(),
              },
              ...job.progressLogs,
            ],
          };
        }
        return job;
      })
    );

    // If we accept the job, it moves to active, so switch view to active tab
    setActiveTab('active');
    toast.success('Job Accepted!', 'You accepted this cutting job request.');

    try {
      const response = await api.patch(`/jobs/${jobId}/status`, { status: 'Accepted' });
      // Sync state with backend's returned job document
      const updatedJob = response.data.data;
      setJobs(prev => prev.map(job => (job._id === jobId ? updatedJob : job)));
    } catch (error: any) {
      console.error(error);
      // Revert state
      setJobs(previousJobs);
      toast.error('Action Failed', error.message || 'Could not accept the job. Reverting...');
    }
  };

  const handleRejectJob = async (jobId: string) => {
    const reason = window.prompt('Please enter a reason for rejecting this job request:');
    if (reason === null) return; // User cancelled prompt

    // Preserve current state for rollbacks
    const previousJobs = [...jobs];

    // Optimistic Update
    setJobs(prevJobs =>
      prevJobs.map(job => {
        if (job._id === jobId) {
          return {
            ...job,
            jobStatus: JobStatus.REJECTED,
            notes: reason || 'Job rejected by cutter.',
            progressLogs: [
              {
                phase: JobStatus.REJECTED,
                note: reason || 'Job rejected by cutter.',
                date: new Date().toISOString(),
              },
              ...job.progressLogs,
            ],
          };
        }
        return job;
      })
    );

    toast.info('Job Rejected', 'The request has been rejected.');

    try {
      const response = await api.patch(`/jobs/${jobId}/status`, {
        status: 'Rejected',
        reason: reason || 'Job rejected by cutter.',
      });
      const updatedJob = response.data.data;
      setJobs(prev => prev.map(job => (job._id === jobId ? updatedJob : job)));
    } catch (error: any) {
      console.error(error);
      setJobs(previousJobs);
      toast.error('Action Failed', error.message || 'Could not reject the job. Reverting...');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Progress Form Handler (Optimistic Updates)
  // ─────────────────────────────────────────────────────────────────────────────

  const handleUpdateProgress = async (jobId: string) => {
    const targetPhase = updatePhase[jobId];
    const notes = updateNotes[jobId] || '';

    if (!targetPhase) {
      toast.error('Select Phase', 'Please select a phase for updating progress.');
      return;
    }

    // Preserve current state for rollbacks
    const previousJobs = [...jobs];
    const jobToUpdate = jobs.find(j => j._id === jobId);
    if (!jobToUpdate) return;

    // Set submitting loading state
    setSubmittingProgress(prev => ({ ...prev, [jobId]: true }));

    // Optimistic Update
    setJobs(prevJobs =>
      prevJobs.map(job => {
        if (job._id === jobId) {
          const isCompleted = targetPhase === JobStatus.COMPLETED;
          return {
            ...job,
            jobStatus: targetPhase,
            actualFinishDate: isCompleted ? new Date().toISOString() : job.actualFinishDate,
            progressLogs: [
              {
                phase: targetPhase,
                note: notes || `Status updated to ${STAGE_LABELS[targetPhase] || targetPhase}`,
                date: new Date().toISOString(),
              },
              ...job.progressLogs,
            ],
          };
        }
        return job;
      })
    );

    // Reset notes input
    setUpdateNotes(prev => ({ ...prev, [jobId]: '' }));
    toast.success('Progress Updated!', 'Your status update has been broadcasted.');

    try {
      const response = await api.post(`/jobs/${jobId}/progress`, {
        phase: targetPhase,
        note: notes || undefined,
      });
      
      const updatedJob = response.data.data;
      setJobs(prev => prev.map(job => (job._id === jobId ? updatedJob : job)));
      
      // Update form's phase dropdown target
      setUpdatePhase(prev => ({ ...prev, [jobId]: updatedJob.jobStatus }));
    } catch (error: any) {
      console.error(error);
      // Revert state
      setJobs(previousJobs);
      toast.error('Update Failed', error.message || 'Could not broadcast progress update. Reverting...');
    } finally {
      setSubmittingProgress(prev => ({ ...prev, [jobId]: false }));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Filtering and Tabs
  // ─────────────────────────────────────────────────────────────────────────────

  const pendingRequests = jobs.filter(job => job.jobStatus === JobStatus.PENDING_ACCEPTANCE);
  const activeJobs = jobs.filter(job =>
    [
      JobStatus.STONE_RECEIVED,
      JobStatus.PRE_FORMING,
      JobStatus.FACETING,
      JobStatus.POLISHED,
      JobStatus.READY_TO_SHIP,
    ].includes(job.jobStatus)
  );
  const historyJobs = jobs.filter(job =>
    [JobStatus.COMPLETED, JobStatus.REJECTED].includes(job.jobStatus)
  );

  const currentTabJobs =
    activeTab === 'requests'
      ? pendingRequests
      : activeTab === 'active'
      ? activeJobs
      : historyJobs;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading your cutting jobs...</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render JSX
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-purple-900/5 via-violet-800/5 to-indigo-900/5 p-6 rounded-3xl border border-purple-500/10 backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Scissors className="h-8 w-8 text-purple-600 animate-pulse" />
            Lapidary Dashboard
          </h1>
          <p className="text-slate-600 mt-1 max-w-xl text-sm leading-relaxed">
            Accept buyer orders, update faceting milestones, secure your cleared LKR payouts, and track gem cutting progress logs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white/50 backdrop-blur-md rounded-2xl p-1.5 border border-white/80 shadow-md flex gap-2 w-fit shrink-0">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer relative ${
              activeTab === 'requests'
                ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <Inbox className="h-4 w-4" />
            Job Requests
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
                {pendingRequests.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer relative ${
              activeTab === 'active'
                ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <FolderKanbanIcon className="h-4 w-4" />
            Active Jobs
            {activeJobs.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
                {activeJobs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer relative ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            History
          </button>
        </div>
      </div>

      {/* Main Jobs Listing */}
      {currentTabJobs.length === 0 ? (
        <div className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-3xl p-16 text-center shadow-inner">
          {activeTab === 'requests' ? (
            <Inbox className="h-14 w-14 text-slate-400 mx-auto mb-4" />
          ) : activeTab === 'active' ? (
            <Package className="h-14 w-14 text-slate-400 mx-auto mb-4" />
          ) : (
            <CheckCircle className="h-14 w-14 text-slate-400 mx-auto mb-4" />
          )}
          <h3 className="text-xl font-bold text-slate-900">
            {activeTab === 'requests'
              ? 'No Pending Requests'
              : activeTab === 'active'
              ? 'No Active Jobs'
              : 'No History Record'}
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
            {activeTab === 'requests'
              ? 'You have no incoming cutting requests from gemstone buyers at this time.'
              : activeTab === 'active'
              ? 'Your active cutting queue is clear. Accept a pending request to start work.'
              : 'Your lapidary cutting logs are clear.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {currentTabJobs.map(job => {
            const currentStageIdx = STAGES.indexOf(job.jobStatus);
            const nextPhase = getNextLogicalPhase(job.jobStatus);

            return (
              <div
                key={job._id}
                className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl overflow-hidden p-6 md:p-8 space-y-6 transition-all duration-300 hover:shadow-lg"
              >
                {/* Job Info Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                  <div className="flex gap-4 items-start">
                    <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-700 flex-shrink-0">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                        Job ID: {job._id}
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900">
                        {job.gemId?.name || job.stoneDetails || 'Rough Gemstone'}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                        <span className="font-semibold bg-white/70 px-2.5 py-0.5 rounded border border-slate-200">
                          Rough: {job.gemId?.caratWeight ? `${job.gemId.caratWeight} ct` : 'N/A'}
                        </span>
                        <span className="font-semibold bg-white/70 px-2.5 py-0.5 rounded border border-slate-200">
                          Target Cut: {job.targetCut || 'N/A'}
                        </span>
                        <span>•</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STAGE_COLORS[job.jobStatus] || 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                          {STAGE_LABELS[job.jobStatus] || job.jobStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-start md:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                        Commission Fee
                      </span>
                      <p className="text-xl font-black text-teal-600">
                        {formatLKR(job.agreedPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                        Deadline
                      </span>
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end mt-0.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(job.expectedFinishDate).toLocaleDateString('en-LK', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar (Only for In Progress / Active jobs) */}
                {activeTab === 'active' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider">
                        Active Phase: <strong className="text-purple-700">{STAGE_LABELS[job.jobStatus]}</strong>
                      </span>
                      <span className="font-black text-slate-900 bg-white/80 border border-slate-200 px-2.5 py-0.5 rounded-lg shadow-sm">
                        {Math.round(((currentStageIdx + 1) / STAGES.length) * 100)}% Complete
                      </span>
                    </div>

                    {/* Step Timeline */}
                    <div className="relative pt-6 pb-2">
                      <div className="absolute top-[38px] left-[5%] right-[5%] h-1 bg-slate-200/80 rounded-full z-0">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${(currentStageIdx / (STAGES.length - 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="relative flex justify-between z-10">
                        {STAGES.map((stage, idx) => {
                          const isCompleted = idx < currentStageIdx;
                          const isActive = idx === currentStageIdx;
                          return (
                            <div key={stage} className="flex flex-col items-center w-[18%] text-center">
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border shadow-sm ${
                                  isCompleted
                                    ? 'bg-purple-600 text-white border-purple-500 scale-105'
                                    : isActive
                                    ? 'bg-white text-purple-700 border-purple-600 ring-4 ring-purple-500/20 scale-110 font-black'
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : idx + 1}
                              </div>
                              <span
                                className={`text-[10px] font-bold mt-2 hidden sm:block ${
                                  isActive
                                    ? 'text-slate-900 font-extrabold'
                                    : isCompleted
                                    ? 'text-purple-600'
                                    : 'text-slate-400'
                                }`}
                              >
                                {STAGE_LABELS[stage]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Content Area */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left Column: Details & Logs */}
                  <div className="lg:col-span-2 space-y-5">
                    {/* Buyer Info & Specs */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Specs */}
                      <div className="bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-inner space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/50 pb-1.5">
                          <AlertCircle className="h-3.5 w-3.5 text-purple-600" />
                          Cutting Specifications
                        </h4>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {job.instructions}
                        </p>
                      </div>

                      {/* Buyer Details */}
                      <div className="bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-inner space-y-2">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/50 pb-1.5">
                          <User className="h-3.5 w-3.5 text-purple-600" />
                          Buyer Details
                        </h4>
                        <div className="space-y-1 text-xs text-slate-700 font-medium">
                          <p className="font-bold text-slate-900">
                            {job.buyerId?.firstName} {job.buyerId?.lastName}
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {job.buyerId?.email}
                          </p>
                          {job.buyerId?.phone && (
                            <p className="flex items-center gap-1.5 text-slate-600">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              {job.buyerId.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress Timeline Logs */}
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Milestone Audit Logs
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {job.progressLogs.length === 0 ? (
                          <div className="text-xs text-slate-400 italic p-3 bg-white/20 rounded-xl">
                            No progress logs submitted yet.
                          </div>
                        ) : (
                          job.progressLogs.map((log, index) => (
                            <div
                              key={index}
                              className="flex gap-3 bg-white/30 p-3 rounded-xl border border-white/40 hover:bg-white/40 transition-colors"
                            >
                              <span className="text-[9px] font-bold text-slate-400 shrink-0 mt-0.5">
                                {new Date(log.date).toLocaleDateString()}
                              </span>
                              <div>
                                <span className={`text-[9px] font-extrabold border px-1.5 py-0.5 rounded uppercase mr-2 ${STAGE_COLORS[log.phase] || 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                                  {STAGE_LABELS[log.phase] || log.phase}
                                </span>
                                <p className="text-xs text-slate-800 mt-1.5 font-medium leading-relaxed">
                                  {log.note}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions (Form / Accept/Reject) */}
                  <div className="space-y-4">
                    {/* JOB REQUESTS TAB: Accept / Reject */}
                    {activeTab === 'requests' && (
                      <div className="bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-2xl p-4 border border-purple-500/20 space-y-4">
                        <div>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                            Awaiting Decision
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-2">
                            Review Request
                          </h4>
                          <p className="text-xs text-slate-600 mt-1">
                            Accept this order to start processing the stone, or reject it if you cannot complete the cut.
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleAcceptJob(job._id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Accept Order
                          </button>
                          <button
                            onClick={() => handleRejectJob(job._id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 shadow-sm transition-all duration-200 cursor-pointer"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject Order
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ACTIVE JOBS TAB: Real Update Progress Form */}
                    {activeTab === 'active' && (
                      <div className="bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-2xl p-4 border border-purple-500/20 space-y-4">
                        <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <span>Update Progress Form</span>
                        </div>
                        
                        <div className="space-y-3">
                          {/* Dropdown for next phase */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Select Next Phase
                            </label>
                            <div className="relative">
                              <select
                                value={updatePhase[job._id] || job.jobStatus}
                                onChange={(e) =>
                                  setUpdatePhase(prev => ({
                                    ...prev,
                                    [job._id]: e.target.value as JobStatus,
                                  }))
                                }
                                className="w-full text-xs pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 appearance-none font-semibold text-slate-800"
                              >
                                {/* Option 1: Current phase (to add log without status advance) */}
                                <option value={job.jobStatus}>
                                  Keep current: {STAGE_LABELS[job.jobStatus]}
                                </option>
                                
                                {/* Option 2: Next phase in sequence */}
                                {nextPhase && (
                                  <option value={nextPhase}>
                                    Advance to: {STAGE_LABELS[nextPhase]}
                                  </option>
                                )}
                              </select>
                              <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
                            </div>
                          </div>

                          {/* Text input for progress notes */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Progress Notes
                            </label>
                            <textarea
                              value={updateNotes[job._id] || ''}
                              onChange={(e) =>
                                setUpdateNotes(prev => ({
                                  ...prev,
                                  [job._id]: e.target.value,
                                }))
                              }
                              placeholder="Describe your progress (e.g., pavilion complete, facets polished)..."
                              rows={3}
                              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 placeholder:text-slate-400 font-medium"
                            />
                          </div>

                          {/* Submit Button */}
                          <button
                            onClick={() => handleUpdateProgress(job._id)}
                            disabled={submittingProgress[job._id]}
                            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md bg-purple-600 hover:bg-purple-700 text-white cursor-pointer hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submittingProgress[job._id] ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Submitting Update...
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4" />
                                Submit Update
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* HISTORY TAB: Display Final Status */}
                    {activeTab === 'history' && (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
                        <div className="flex justify-center">
                          {job.jobStatus === JobStatus.COMPLETED ? (
                            <CheckCircle className="h-8 w-8 text-emerald-600" />
                          ) : (
                            <XCircle className="h-8 w-8 text-rose-600" />
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase">
                          {job.jobStatus === JobStatus.COMPLETED
                            ? 'Gem Cut Completed'
                            : 'Job Request Rejected'}
                        </h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                          {job.jobStatus === JobStatus.COMPLETED
                            ? `This job was completed successfully. Your payout of ${formatLKR(job.agreedPrice)} has been cleared into your wallet.`
                            : `This cutting job was rejected. Reason: ${job.notes || 'No reason provided.'}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Minor Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const FolderKanbanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    <path d="M8 10v4" />
    <path d="M12 10v4" />
    <path d="M16 10v4" />
  </svg>
);
