import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { CuttingProgress } from '../../components/serviceHub/CuttingProgress';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { getCutterJobs, getBuyerCuttingJobs } from '../../services/cutting.service';
import { Scissors, CheckCircle, Clock } from 'lucide-react';

export const CuttingJobs: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isCutter = user?.roles.includes('CUTTER');
  const isBuyer = user?.roles.includes('BUYER');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        let data;
        if (isCutter) {
          data = await getCutterJobs();
        } else if (isBuyer) {
          data = await getBuyerCuttingJobs();
        } else {
          data = [];
        }
        setJobs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [isCutter, isBuyer]);

  const pendingJobs = jobs.filter(j => j.status === 'PENDING');
  const inProgressJobs = jobs.filter(j => j.status === 'IN_PROGRESS');
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED');

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isCutter ? 'My Cutting Jobs' : 'My Cutting Requests'}
      </h1>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> Pending ({pendingJobs.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex items-center gap-1">
            <Scissors className="h-4 w-4" /> In Progress ({inProgressJobs.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" /> Completed ({completedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingJobs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No pending cutting jobs.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingJobs.map(job => (
                <CuttingProgress key={job._id} jobId={job._id} isCutter={isCutter} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress">
          {inProgressJobs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No jobs in progress.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {inProgressJobs.map(job => (
                <CuttingProgress key={job._id} jobId={job._id} isCutter={isCutter} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedJobs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No completed jobs.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedJobs.map(job => (
                <CuttingProgress key={job._id} jobId={job._id} isCutter={isCutter} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};