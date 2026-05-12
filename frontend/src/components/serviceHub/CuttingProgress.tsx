import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress'; // Simple progress bar component
import { Calendar, Image, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { getCuttingJob, updateCuttingProgress } from '../../services/cutting.service';
import { useSocket } from '../../hooks/useSocket';

export interface CuttingJob {
  _id: string;
  orderId: string;
  roughGemId: string;
  instructions: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  progressImages: string[];
  expectedFinishDate: string;
  actualFinishDate?: string;
  cutterFee: number;
}

interface CuttingProgressProps {
  jobId: string;
  isCutter?: boolean; // If true, show upload progress images button
}

export const CuttingProgress: React.FC<CuttingProgressProps> = ({ jobId, isCutter = false }) => {
  const [job, setJob] = useState<CuttingJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    fetchJob();
    // Join real-time room for cutting progress
    if (socket) {
      socket.emit('join-cutting', jobId);
      socket.on('cutting-progress', (data) => {
        if (data.jobId === jobId) {
          setJob(prev => prev ? { ...prev, ...data } : prev);
        }
      });
    }
    return () => {
      if (socket) socket.emit('leave-cutting', jobId);
    };
  }, [jobId, socket]);

  const fetchJob = async () => {
    try {
      const data = await getCuttingJob(jobId);
      setJob(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !job) return;
    setUploading(true);
    // In real app, upload to Cloudinary or local endpoint
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('images', file));
    try {
      const updated = await updateCuttingProgress(jobId, { progressImages: Array.from(files) });
      setJob(updated);
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'info';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'IN_PROGRESS': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'FAILED': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  if (loading) return <div className="text-center py-8">Loading cutting progress...</div>;
  if (!job) return <div className="text-center text-gray-500">No cutting job found.</div>;

  const progressPercent = {
    PENDING: 10,
    ACCEPTED: 25,
    IN_PROGRESS: 60,
    COMPLETED: 100,
    FAILED: 100,
  }[job.status];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Cutting Progress</CardTitle>
          <Badge variant={getStatusColor(job.status) as any}>
            {job.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Completion</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm font-medium">Instructions:</p>
          <p className="text-sm text-gray-700">{job.instructions}</p>
        </div>

        {/* Dates */}
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="h-4 w-4" />
            Expected: {new Date(job.expectedFinishDate).toLocaleDateString()}
          </div>
          {job.actualFinishDate && (
            <div className="flex items-center gap-1 text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Completed: {new Date(job.actualFinishDate).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Progress images */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Image className="h-4 w-4" />
            <span className="text-sm font-medium">Progress Images</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {job.progressImages.map((img, idx) => (
              <img key={idx} src={img} alt={`Progress ${idx}`} className="w-full h-24 object-cover rounded-md" />
            ))}
            {isCutter && job.status !== 'COMPLETED' && (
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400">
                <span className="text-xs text-gray-500">{uploading ? 'Uploading...' : '+ Add'}</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
          </div>
        </div>

        {/* Status icon */}
        <div className="flex justify-center pt-2">
          {getStatusIcon(job.status)}
          <span className="ml-2 text-sm text-gray-600">
            {job.status === 'COMPLETED' && 'Cutting completed. Ready for dispatch.'}
            {job.status === 'IN_PROGRESS' && 'Your stone is being cut.'}
            {job.status === 'PENDING' && 'Waiting for cutter to accept.'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};