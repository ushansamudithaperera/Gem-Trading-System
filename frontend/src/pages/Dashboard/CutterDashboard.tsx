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
        <p className="text-slate-600">Manage cutting jobs and track earnings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Earned</p>
              <p className="text-2xl font-bold">${stats.totalEarned.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Jobs</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>
            <Scissors className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Cutting Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : jobs.length === 0 ? (
            <p className="text-gray-500">No cutting jobs assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job._id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">Job #{job._id.slice(-8)}</p>
                    <p className="text-sm text-gray-500">Fee: ${job.cutterFee}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium capitalize ${
                      job.status === 'PENDING' ? 'text-yellow-600' :
                      job.status === 'IN_PROGRESS' ? 'text-blue-600' :
                      job.status === 'COMPLETED' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {job.status}
                    </p>
                    <Link to={`/service-hub/jobs/${job._id}`}>
                      <Button variant="link" size="sm">View</Button>
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