import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../components/ui/Toast';
import {
  Wallet as WalletIcon,
  TrendingUp,
  RefreshCw,
  Building,
  CreditCard,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Transaction {
  id: string;
  orderNumber: string;
  date: string;
  description: string;
  amount: number;
  type: 'escrow_credit' | 'payout_bank' | 'escrow_release';
  status: 'Completed' | 'Pending' | 'Failed';
}

const mockTransactions: Transaction[] = [
  {
    id: 'TXN-10192',
    orderNumber: 'ORD-17180429412',
    date: '2026-06-08',
    description: 'Escrow Release: Natural Blue Sapphire (1.8 Carats)',
    amount: 320000.00,
    type: 'escrow_release',
    status: 'Completed'
  },
  {
    id: 'TXN-10191',
    orderNumber: 'ORD-17180429412',
    date: '2026-06-08',
    description: 'Payment Payout to Commercial Bank A/C ****8812',
    amount: -304000.00,
    type: 'payout_bank',
    status: 'Completed'
  },
  {
    id: 'TXN-10190',
    orderNumber: 'ORD-17180430588',
    date: '2026-06-06',
    description: 'Escrow Credit: Rough Spinel (5.2 Carats) - Order dispatch pending',
    amount: 180000.00,
    type: 'escrow_credit',
    status: 'Pending'
  },
  {
    id: 'TXN-10189',
    orderNumber: 'ORD-17180422941',
    date: '2026-06-03',
    description: 'Escrow Release: Oval Cut Yellow Sapphire (2.1 Carats)',
    amount: 450000.00,
    type: 'escrow_release',
    status: 'Completed'
  },
  {
    id: 'TXN-10188',
    orderNumber: 'ORD-17180422941',
    date: '2026-06-03',
    description: 'Payment Payout to Commercial Bank A/C ****8812',
    amount: -427500.00,
    type: 'payout_bank',
    status: 'Completed'
  }
];

export const Wallet: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [loading, setLoading] = useState(false);

  // Sri Lanka Currency Formatter
  const formatLKR = (amount: number) => {
    const isNegative = amount < 0;
    const absVal = Math.abs(amount);
    const formatted = `Rs. ${absVal.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return isNegative ? `- ${formatted}` : formatted;
  };

  const handlePayout = () => {
    toast.success('Payout Requested', 'Your available balance is being transferred to Commercial Bank Sri Lanka.');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <WalletIcon className="w-8 h-8 text-emerald-600" />
              Wallet & Earnings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your sales payouts, review escrow balances, and configure payout destinations.
            </p>
          </div>
          
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                setTransactions(mockTransactions);
              }, 600);
            }}
            disabled={loading}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all self-start"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Balances
          </button>
        </div>

        {/* Balance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Total Earnings Card */}
          <Card className="border border-slate-200/60 shadow-sm bg-gradient-to-br from-emerald-700 to-emerald-900 text-white relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
              <TrendingUp className="w-48 h-48" />
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs text-emerald-100 font-semibold uppercase tracking-wider">Total Earnings</span>
                <span className="p-2 bg-emerald-600/30 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-emerald-300" />
                </span>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black">{formatLKR(950000.00)}</h3>
                <p className="text-xs text-emerald-200 mt-1">Net accumulated earnings before payout fee clearances</p>
              </div>
            </CardContent>
          </Card>

          {/* Available Payout Balance */}
          <Card className="border border-slate-200/60 shadow-sm bg-white relative overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">Available Balance</span>
                <span className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <CheckCircle className="w-5 h-5" />
                </span>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900">{formatLKR(122500.00)}</h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-500">Commercial Bank (****8812)</span>
                  <button
                    onClick={handlePayout}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-colors"
                  >
                    Payout Now
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Locked Escrow Balance */}
          <Card className="border border-slate-200/60 shadow-sm bg-white relative overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">Locked in Escrow</span>
                <span className="p-2 bg-amber-50 rounded-xl text-amber-600">
                  <Clock className="w-5 h-5 animate-pulse" />
                </span>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900">{formatLKR(180000.00)}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Locked until gem dispatch verification releases
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Bank Details & Stripe Integration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-slate-200/60 shadow-sm bg-white p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-450" />
              Connected Bank Account
            </h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="space-y-1">
                <span className="font-semibold text-slate-850 block">Commercial Bank of Ceylon</span>
                <span className="text-xs text-slate-500 block">Holder: Chaminda Precision Cuts</span>
                <span className="text-xs text-slate-500 block font-mono">A/C: **********8812</span>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 uppercase font-bold text-[10px]">
                Primary
              </Badge>
            </div>
          </Card>

          <Card className="border border-slate-200/60 shadow-sm bg-white p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-450" />
              Card Payouts (Stripe Connect)
            </h3>
            <div className="flex items-center justify-between p-4 border border-blue-100 bg-blue-50/20 rounded-xl">
              <div className="space-y-1">
                <span className="font-semibold text-slate-850 block">Stripe Connect Account</span>
                <span className="text-xs text-slate-500 block">Linked to GemTrade Platform payouts</span>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 uppercase font-bold text-[10px]">
                Connected
              </Badge>
            </div>
          </Card>
        </div>

        {/* Transaction History Table */}
        <Card className="border border-slate-200/60 shadow-sm bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-bold text-slate-900">Transaction History</h3>
            <span className="text-xs text-slate-500 font-medium">Showing latest platform settlements</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {transactions.map(txn => {
                  const isCredit = txn.amount > 0;
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* ID */}
                      <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                        {txn.id}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-500">
                        {txn.date}
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4 text-slate-700">
                        <div className="font-medium">{txn.description}</div>
                        <span className="text-[10px] text-slate-450 font-mono">Ref: {txn.orderNumber}</span>
                      </td>

                      {/* Type Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          txn.type === 'escrow_release'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : txn.type === 'payout_bank'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {txn.type.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className={`px-6 py-4 font-bold ${isCredit ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {formatLKR(txn.amount)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-right">
                        <Badge variant="outline" className={`font-semibold text-xs px-2 py-0.5 border ${
                          txn.status === 'Completed'
                            ? 'bg-emerald-55 text-emerald-800 border-emerald-200'
                            : txn.status === 'Pending'
                            ? 'bg-amber-55 text-amber-800 border-amber-200'
                            : 'bg-rose-55 text-rose-800 border-rose-200'
                        }`}>
                          {txn.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
};

