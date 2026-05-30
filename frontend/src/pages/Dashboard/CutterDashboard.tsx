import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Scissors, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCutterJobs } from '../../services/cutting.service';

interface JobStats {
  pending: number;
  inProgress: number;
  completed: number;
  totalEarned: number;
}

export const CutterDashboard: React.FC = () => {
  const { user: _user } = useSelector((state: RootState) => state.auth);
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<JobStats>({
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalEarned: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getCutterJobs();
        setJobs(data.slice(0, 5));
        const pending = data.filter((j: any) => j.status === 'PENDING').length;
        const inProgress = data.filter((j: any) => j.status === 'IN_PROGRESS').length;
        const completed = data.filter((j: any) => j.status === 'COMPLETED').length;
        const totalEarned = data.filter((j: any) => j.status === 'COMPLETED').reduce((sum: number, j: any) => sum + j.cutterFee, 0);
        setStats({ pending, inProgress, completed, totalEarned });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Premium Amethyst Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-fuchsia-950 p-8 md:p-10 shadow-2xl border border-purple-500/20">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-fuchsia-500/5 blur-3xl"></div>
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-500/10 rounded-full border border-purple-500/20 backdrop-blur-md mb-4">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse"></span>
            Master Gem Cutter
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Cutter Dashboard
          </h1>
          <p className="text-slate-300 mt-2 max-w-2xl text-sm">
            Review raw gemstone facet specifications, claim cutting contracts, report yield percentages, and track fee dispersals.
          </p>
        </div>
      </div>

      {/* Elevated Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earned */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/90 to-white/45 backdrop-blur-xl border border-white/60 rounded-2xl p-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(168,85,247,0.08)] hover:border-purple-300/60">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 pointer-events-none" />
          <div className="relative z-20">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Revenue</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">${stats.totalEarned.toLocaleString()}</p>
          </div>
          <div className="relative z-20 bg-purple-50 text-purple-600 p-3.5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-purple-100/80 shadow-inner">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Pending Jobs */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/90 to-white/45 backdrop-blur-xl border border-white/60 rounded-2xl p-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(245,158,11,0.08)] hover:border-amber-300/60">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 pointer-events-none" />
          <div className="relative z-20">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Pending Jobs</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.pending}</p>
          </div>
          <div className="relative z-20 bg-amber-50 text-amber-600 p-3.5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-amber-100/80 shadow-inner">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* In Progress */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/90 to-white/45 backdrop-blur-xl border border-white/60 rounded-2xl p-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(99,102,241,0.08)] hover:border-indigo-300/60">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 pointer-events-none" />
          <div className="relative z-20">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">In Progress</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.inProgress}</p>
          </div>
          <div className="relative z-20 bg-indigo-50 text-indigo-600 p-3.5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-indigo-100/80 shadow-inner">
            <Scissors className="h-6 w-6" />
          </div>
        </div>

        {/* Completed Cuts */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/90 to-white/45 backdrop-blur-xl border border-white/60 rounded-2xl p-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.08)] hover:border-emerald-300/60">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 pointer-events-none" />
          <div className="relative z-20">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Completed Cuts</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.completed}</p>
          </div>
          <div className="relative z-20 bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-emerald-100/80 shadow-inner">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Cutting Jobs Card */}
      <Card className="rounded-3xl border border-white/60 bg-gradient-to-br from-white/80 to-white/30 backdrop-blur-xl shadow-lg overflow-hidden transition-all duration-500 hover:border-purple-300/40 hover:shadow-[0_20px_50px_-10px_rgba(168,85,247,0.05)]">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500 animate-pulse"></span>
            Recent Faceting Contracts
          </CardTitle>
          <Link to="/service-hub/jobs">
            <button className="inline-flex items-center text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg px-3 py-1.5 transition-colors">
              Manage Service Hub
            </button>
          </Link>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <p className="text-slate-500 text-sm animate-pulse">Scanning lapidary logbooks...</p>
          ) : jobs.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No gem cutting contracts assigned yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <div key={job._id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group">
                  <div>
                    <p className="font-bold text-slate-800 text-sm md:text-base group-hover:text-purple-600 transition-colors">Faceting Job #{job._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-slate-400 font-medium">Contract Fee: ${job.cutterFee.toLocaleString()}</p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        job.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-250/20' :
                        job.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-700 border border-indigo-250/20' :
                        'bg-amber-100 text-amber-700 border border-amber-250/20'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <Link to={`/service-hub/jobs/${job._id}`}>
                      <button className="inline-flex items-center justify-center text-xs font-bold text-slate-600 hover:text-white bg-slate-50 hover:bg-slate-800 border border-slate-200 hover:border-slate-800 rounded-lg px-3 py-1.5 transition-all duration-300">
                        View Specs
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};