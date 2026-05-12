import React from 'react';
import { CheckCircle, Package, Truck, Home, AlertCircle } from 'lucide-react';

export type OrderStatus =
  | 'PENDING_DISPATCH'
  | 'IN_CUTTING_PROCESS'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'RETURN_REQUESTED';

interface TimelineStep {
  label: string;
  status: OrderStatus[];
  icon: React.ElementType;
  description: string;
}

const steps: TimelineStep[] = [
  {
    label: 'Order Placed',
    status: ['PENDING_DISPATCH', 'IN_CUTTING_PROCESS', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'DISPUTED'],
    icon: CheckCircle,
    description: 'Order confirmed, payment held in escrow',
  },
  {
    label: 'Processing',
    status: ['IN_CUTTING_PROCESS', 'SHIPPED', 'DELIVERED', 'COMPLETED'],
    icon: Package,
    description: 'Being processed (cutting or packing)',
  },
  {
    label: 'Shipped',
    status: ['SHIPPED', 'DELIVERED', 'COMPLETED'],
    icon: Truck,
    description: 'Dispatched via courier',
  },
  {
    label: 'Delivered',
    status: ['DELIVERED', 'COMPLETED'],
    icon: Home,
    description: 'Delivered to your doorstep',
  },
  {
    label: 'Completed',
    status: ['COMPLETED'],
    icon: CheckCircle,
    description: 'Funds released, order complete',
  },
];

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  isDisputed?: boolean;
  deliveredAt?: Date;
  autoReleaseDate?: Date;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  currentStatus,
  isDisputed = false,
  deliveredAt,
  autoReleaseDate,
}) => {
  const getStepStatus = (step: TimelineStep): 'completed' | 'current' | 'pending' => {
    if (step.status.includes(currentStatus)) {
      return 'current';
    }
    // Check if any later status is reached
    for (const s of step.status) {
      if (isStatusCompleted(currentStatus, s)) {
        return 'completed';
      }
    }
    return 'pending';
  };

  const isStatusCompleted = (current: OrderStatus, stepStatus: OrderStatus): boolean => {
    const orderPriority: OrderStatus[] = [
      'PENDING_DISPATCH',
      'IN_CUTTING_PROCESS',
      'SHIPPED',
      'DELIVERED',
      'COMPLETED',
    ];
    const currentIdx = orderPriority.indexOf(current);
    const stepIdx = orderPriority.indexOf(stepStatus);
    return stepIdx < currentIdx && stepIdx !== -1;
  };

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <h3 className="font-semibold text-red-800">Order Cancelled</h3>
        <p className="text-sm text-red-600">This order has been cancelled.</p>
      </div>
    );
  }

  if (isDisputed) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center mb-4">
        <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
        <h3 className="font-semibold text-yellow-800">Dispute Active</h3>
        <p className="text-sm text-yellow-600">Escrow frozen. Awaiting resolution.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" style={{ left: '1.25rem' }} />
        
        {steps.map((step, idx) => {
          const stepStatus = getStepStatus(step);
          const Icon = step.icon;
          return (
            <div key={idx} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Icon circle */}
              <div
                className={`
                  relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                  ${stepStatus === 'completed' ? 'bg-green-500' : ''}
                  ${stepStatus === 'current' ? 'bg-blue-500 ring-4 ring-blue-100' : ''}
                  ${stepStatus === 'pending' ? 'bg-gray-300' : ''}
                `}
                style={{ left: '-0.125rem' }}
              >
                <Icon className="h-4 w-4 text-white" />
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h4 className={`font-medium ${stepStatus === 'pending' ? 'text-gray-400' : 'text-gray-900'}`}>
                  {step.label}
                </h4>
                <p className={`text-sm ${stepStatus === 'pending' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {step.description}
                </p>
                {step.label === 'Delivered' && deliveredAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Delivered on {new Date(deliveredAt).toLocaleDateString()}
                  </p>
                )}
                {step.label === 'Delivered' && autoReleaseDate && currentStatus !== 'COMPLETED' && (
                  <p className="text-xs text-blue-600 mt-1">
                    Auto-release on {new Date(autoReleaseDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};