import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cutter Dashboard</h1>
        <p className="text-slate-500 mt-1">You are currently logged in as a <span className="font-semibold text-amber-600">Cutter</span>. Manage cutting jobs and track earnings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard label="Total Earned" value={`$${stats.totalEarned.toLocaleString()}`} icon={DollarSign} accentColor="emerald" />
        <StatCard label="Pending Jobs" value={stats.pending} icon={Clock} accentColor="amber" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Scissors} accentColor="amber" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle} accentColor="sky" />
      </div>

      <div className="premium-section-card">
        <div className="premium-section-header flex flex-row items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500 animate-pulse"></span>
            Recent Faceting Contracts
          </h3>
          <Link to="/service-hub/jobs">
            <button className="inline-flex items-center text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50/80 hover:bg-amber-100 rounded-lg px-3 py-1.5 ring-1 ring-inset ring-amber-200/50 shadow-sm transition-all duration-200">
              Manage Service Hub
            </button>
          </Link>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : jobs.length === 0 ? (
            <p className="text-slate-500">No cutting jobs assigned yet.</p>
          ) : (
            <div className="divide-y divide-slate-100/80">
              {jobs.map((job) => (
                <div key={job._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">Job #{job._id.slice(-8)}</p>
                    <p className="text-sm text-slate-500">Fee: ${job.cutterFee}</p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <p className={`text-sm font-semibold capitalize ${
                      job.status === 'PENDING' ? 'text-amber-600' :
                      job.status === 'IN_PROGRESS' ? 'text-amber-500' :
                      job.status === 'COMPLETED' ? 'text-emerald-600' : 'text-slate-500'
                    }`}>
                      {job.status}
                    </p>
                    <Link to={`/service-hub/jobs/${job._id}`}>
                      <Button variant="link" size="sm" className="text-amber-600 hover:text-amber-700">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};