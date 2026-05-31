import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
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
        <h1 className="text-2xl font-bold text-slate-900">Cutter Dashboard</h1>
        <p className="text-slate-500 mt-1">You are currently logged in as a <span className="font-semibold text-blue-700">Cutter</span>. Manage cutting jobs and track earnings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Earned</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">${stats.totalEarned.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl flex items-center justify-center border border-emerald-100">
              <DollarSign className="h-6 w-6 text-emerald-700" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Pending Jobs</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl flex items-center justify-center border border-amber-100">
              <Clock className="h-6 w-6 text-amber-700" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">In Progress</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.inProgress}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl flex items-center justify-center border border-blue-100">
              <Scissors className="h-6 w-6 text-blue-700" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Completed</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.completed}</p>
            </div>
            <div className="bg-sky-50 p-3 rounded-xl flex items-center justify-center border border-sky-100">
              <CheckCircle className="h-6 w-6 text-sky-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Cutting Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : jobs.length === 0 ? (
            <p className="text-slate-500">No cutting jobs assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job._id} className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <p className="font-medium text-slate-900">Job #{job._id.slice(-8)}</p>
                    <p className="text-sm text-slate-500">Fee: ${job.cutterFee}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium capitalize ${
                      job.status === 'PENDING' ? 'text-amber-600' :
                      job.status === 'IN_PROGRESS' ? 'text-blue-600' :
                      job.status === 'COMPLETED' ? 'text-emerald-600' : 'text-slate-500'
                    }`}>
                      {job.status}
                    </p>
                    <Link to={`/service-hub/jobs/${job._id}`}>
                      <Button variant="link" size="sm" className="text-blue-700 hover:text-blue-800">View</Button>
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