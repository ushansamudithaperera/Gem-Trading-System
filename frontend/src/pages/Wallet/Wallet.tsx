import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import api from '../../services/api';
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
  Clock,
  AlertCircle
} from 'lucide-react';

interface Transaction {
  _id?: string;
  id?: string;
  orderNumber?: string;
  date?: string;
  createdAt?: string;
  description: string;
  amount: number;
  type: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export const Wallet: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [escrowBalance, setEscrowBalance] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Sri Lanka Currency Formatter
  const formatLKR = (amount: number) => {
    const isNegative = amount < 0;
    const absVal = Math.abs(amount);
    const formatted = `Rs. ${absVal.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return isNegative ? `- ${formatted}` : formatted;
  };

  // Fetch Wallet details from backend API
  const fetchWalletDetails = async (isSilentRefresh = false) => {
    if (!isSilentRefresh) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    try {
      const response = await api.get('/wallet/my-wallet');
      const data = response.data.data;
      
      setAvailableBalance(data.availableBalance ?? 0);
      setEscrowBalance(data.escrowBalance ?? 0);
      setTotalEarnings(data.totalEarnings ?? 0);
      setTransactions(data.transactions ?? []);
    } catch (error: any) {
      console.error('Error fetching wallet metrics:', error);
      toast.error('Wallet Sync Error', error.message || 'Could not fetch updated wallet details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const handlePayout = () => {
    if (availableBalance <= 0) {
      toast.warning('Payout Unavailable', 'You do not have any available balance to withdraw.');
      return;
    }
    toast.success('Payout Requested', 'Your available balance is being transferred to Commercial Bank Sri Lanka.');
  };

  const getTypeBadgeStyles = (type: string) => {
    switch (type.toLowerCase()) {
      case 'escrow_release':
      case 'earning':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'payout_bank':
      case 'payout':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'escrow_credit':
      case 'held':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Primary loader view
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
          <p className="text-sm text-slate-500 font-semibold animate-pulse">Syncing secure database ledger...</p>
        </div>
      </div>
    );
  }

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
            onClick={() => fetchWalletDetails(true)}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all self-start cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Balances'}
          </button>
        </div>

        {/* Balance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Total Earnings Card (Green Card) */}
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
                <h3 className="text-2xl md:text-3xl font-black">{formatLKR(totalEarnings)}</h3>
                <p className="text-xs text-emerald-200 mt-1">Net accumulated earnings before payout fee clearances</p>
              </div>
            </CardContent>
          </Card>

          {/* Available Payout Balance (Middle Card) */}
          <Card className="border border-slate-200/60 shadow-sm bg-white relative overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">Available Balance</span>
                <span className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <CheckCircle className="w-5 h-5" />
                </span>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900">{formatLKR(availableBalance)}</h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-500">
                    {user?.businessName ? 'Commercial Bank Connected' : 'No payout account set'}
                  </span>
                  <button
                    onClick={handlePayout}
                    disabled={availableBalance <= 0}
                    className={`font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-colors cursor-pointer ${
                      availableBalance > 0
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                    }`}
                  >
                    Payout Now
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Locked Escrow Balance (Escrow Card) */}
          <Card className="border border-slate-200/60 shadow-sm bg-white relative overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">Locked in Escrow</span>
                <span className="p-2 bg-amber-50 rounded-xl text-amber-600">
                  <Clock className={`w-5 h-5 ${escrowBalance > 0 ? 'animate-pulse' : ''}`} />
                </span>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900">{formatLKR(escrowBalance)}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
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
            {user?.businessName ? (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-850 block">{user.businessName}</span>
                  <span className="text-xs text-slate-500 block">Holder: {user.firstName} {user.lastName}</span>
                  <span className="text-xs text-slate-500 block font-mono">Status: Awaiting Verification</span>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 uppercase font-bold text-[10px]">
                  Pending
                </Badge>
              </div>
            ) : (
              <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-100 text-center flex flex-col items-center justify-center gap-2">
                <Building className="w-8 h-8 text-slate-350" />
                <span className="text-xs font-semibold text-slate-700">No bank account linked</span>
                <span className="text-[11px] text-slate-500">Provide bank information in settings to enable transfers.</span>
              </div>
            )}
          </Card>

          <Card className="border border-slate-200/60 shadow-sm bg-white p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-450" />
              Card Payouts (Stripe Connect)
            </h3>
            {user?.stripeConnectAccountId ? (
              <div className="flex items-center justify-between p-4 border border-blue-100 bg-blue-50/20 rounded-xl">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-850 block">Stripe Connect Account</span>
                  <span className="text-xs text-slate-500 block font-mono">ID: {user.stripeConnectAccountId}</span>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 uppercase font-bold text-[10px]">
                  Connected
                </Badge>
              </div>
            ) : (
              <div className="p-6 border border-slate-100 bg-slate-50/50 rounded-xl text-center flex flex-col items-center justify-center gap-2">
                <CreditCard className="w-8 h-8 text-slate-350" />
                <span className="text-xs font-semibold text-slate-700">Stripe Connect is inactive</span>
                <span className="text-[11px] text-slate-500">Connect Stripe to clear instant credit card payouts.</span>
              </div>
            )}
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
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-8 h-8 text-slate-350" />
                        <span className="font-semibold text-slate-700">No transactions recorded</span>
                        <span className="text-xs text-slate-500">Your payments and payouts history will appear here.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map(txn => {
                    const formattedId = txn._id ? `TXN-${txn._id.substring(18).toUpperCase()}` : (txn.id || 'TXN-UNKNOWN');
                    const formattedDate = txn.createdAt ? new Date(txn.createdAt).toLocaleDateString('en-LK') : (txn.date || '-');
                    const isCredit = txn.amount > 0;
                    
                    return (
                      <tr key={txn._id || txn.id} className="hover:bg-slate-50/30 transition-colors">
                        {/* ID */}
                        <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                          {formattedId}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-slate-500">
                          {formattedDate}
                        </td>

                        {/* Description */}
                        <td className="px-6 py-4 text-slate-700">
                          <div className="font-medium">{txn.description}</div>
                          {txn.orderNumber && (
                            <span className="text-[10px] text-slate-450 font-mono">Ref: {txn.orderNumber}</span>
                          )}
                        </td>

                        {/* Type Badge */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${getTypeBadgeStyles(txn.type)}`}>
                            {txn.type.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className={`px-6 py-4 font-bold ${isCredit ? 'text-emerald-600' : 'text-slate-750'}`}>
                          {formatLKR(txn.amount)}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-right">
                          <Badge variant="outline" className={`font-semibold text-xs px-2 py-0.5 border ${
                            txn.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : txn.status === 'Pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {txn.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
};
