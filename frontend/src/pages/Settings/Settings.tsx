import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { setUser } from '../../store/slices/authSlice';
import { updateUserProfile, submitKYCDocuments } from '../../services/auth.service';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../components/ui/Toast';
import {
  User,
  Shield,
  Lock,
  Upload,
  Check,
  AlertCircle,
  Clock,
  X,
  Camera,
  ShieldAlert,
  Loader2,
  Phone,
  Building,
  Mail,
  Calendar,
  CreditCard,
  KeyRound,
  ToggleLeft,
  ToggleRight,
  UserCheck
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();

  // Determine active tab based on URL param, defaulting to 'profile'
  const activeTab = tab || 'profile';

  // --- Profile State ---
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    businessName: user?.businessName || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>(user?.avatar || '');
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if user changes in Redux/auth hook
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        businessName: user.businessName || '',
      });
      if (user.avatar) {
        setProfilePicPreview(user.avatar);
      }
    }
  }, [user]);

  // --- KYC State ---
  const kycStatus = user?.kyc?.status || 'unverified';
  const rejectionReason = user?.kyc?.rejectionReason || '';
  const [kycForm, setKycForm] = useState({
    idNumber: '',
    dob: '',
  });
  const [frontDocFile, setFrontDocFile] = useState<File | null>(null);
  const [frontDocPreview, setFrontDocPreview] = useState<string>('');
  const [backDocFile, setBackDocFile] = useState<File | null>(null);
  const [backDocPreview, setBackDocPreview] = useState<string>('');
  const [kycLoading, setKycLoading] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // --- Security State ---
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(() => {
    return localStorage.getItem('2fa_enabled') === 'true';
  });
  const [show2FAConfig, setShow2FAConfig] = useState(false);

  // --- Tab Navigation Handlers ---
  const handleTabChange = (tabName: 'profile' | 'kyc' | 'security') => {
    navigate(`/settings/${tabName}`);
  };

  // --- Profile Action Handlers ---
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const triggerProfilePicSelect = () => {
    profileFileInputRef.current?.click();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      let avatarUrl = profilePicPreview;

      // Mock uploading the profile photo if selected
      if (profilePicFile) {
        await new Promise(resolve => setTimeout(resolve, 800)); // simulate upload
        avatarUrl = profilePicPreview; // Using local Object URL as S3 mock URL for display
      }

      const updatedUser = await updateUserProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        businessName: profileForm.businessName,
        avatar: avatarUrl,
      });

      dispatch(setUser(updatedUser));
      toast.success('Profile Saved', 'Your account details have been successfully updated.');
    } catch (error: any) {
      toast.error('Save Failed', error.message || 'Unable to save profile details.');
    } finally {
      setProfileLoading(false);
    }
  };

  // --- KYC Action Handlers ---
  const handleKycChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKycForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFrontDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFrontDocFile(file);
      setFrontDocPreview(URL.createObjectURL(file));
    }
  };

  const handleBackDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBackDocFile(file);
      setBackDocPreview(URL.createObjectURL(file));
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!kycForm.idNumber.trim()) {
      toast.error('Missing ID Number', 'Please enter your National ID or Passport number.');
      return;
    }
    if (!kycForm.dob) {
      toast.error('Missing Date of Birth', 'Please enter your date of birth.');
      return;
    }
    if (!frontDocFile || !backDocFile) {
      toast.error('Documents Required', 'Please upload both front and back views of your ID/Passport.');
      return;
    }

    setKycLoading(true);

    try {
      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock URLs
      const mockDocUrls = [
        'https://via.placeholder.com/600x400/f1f5f9/0f172a?text=ID+Front+View',
        'https://via.placeholder.com/600x400/f1f5f9/0f172a?text=ID+Back+View'
      ];

      const updatedUser = await submitKYCDocuments(mockDocUrls);
      dispatch(setUser(updatedUser));
      toast.success('KYC Submitted', 'Your documents are now under review by our compliance team.');
      
      // Reset local file states
      setFrontDocFile(null);
      setBackDocFile(null);
    } catch (error: any) {
      toast.error('KYC Submission Failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setKycLoading(false);
    }
  };

  // --- Security Action Handlers ---
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error('Password Error', 'Please enter your current password.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password Too Short', 'New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password Mismatch', 'New password and confirm password do not match.');
      return;
    }

    setPasswordLoading(true);

    try {
      // Simulate API change password call since no backend endpoint is present
      await new Promise(resolve => setTimeout(resolve, 1200));

      toast.success('Password Updated', 'Your security password has been changed successfully.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error('Change Password Failed', 'Failed to change password. Please verify current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggle2FA = () => {
    const nextState = !twoFactorEnabled;
    setTwoFactorEnabled(nextState);
    localStorage.setItem('2fa_enabled', String(nextState));

    if (nextState) {
      setShow2FAConfig(true);
      toast.success('2FA Setup Triggered', 'Two-Factor Authentication is pending configuration.');
    } else {
      setShow2FAConfig(false);
      toast.success('2FA Disabled', 'Two-Factor Authentication has been disabled for this account.');
    }
  };

  // Helper config for KYC status badge & information banner
  const getKYCStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          badgeVariant: 'success' as const,
          label: 'Verified',
          bannerBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          icon: UserCheck,
          description: 'Your identity and business details are fully verified. You have full B2B trading clearance.'
        };
      case 'pending':
        return {
          badgeVariant: 'warning' as const,
          label: 'Verification Pending',
          bannerBg: 'bg-amber-50 border-amber-200 text-amber-800',
          icon: Clock,
          description: 'Your KYC documents are currently under review by compliance. This usually takes 24-48 hours.'
        };
      case 'rejected':
        return {
          badgeVariant: 'destructive' as const,
          label: 'Verification Rejected',
          bannerBg: 'bg-rose-50 border-rose-200 text-rose-800',
          icon: ShieldAlert,
          description: `KYC rejected: ${rejectionReason || 'Submitted documents were unreadable or expired. Please upload valid IDs.'}`
        };
      case 'unverified':
      default:
        return {
          badgeVariant: 'secondary' as const,
          label: 'Unverified',
          bannerBg: 'bg-slate-50 border-slate-200 text-slate-700',
          icon: AlertCircle,
          description: 'You have not completed B2B verification yet. Please submit your identity details below to enable bids and sales.'
        };
    }
  };

  const kycConfig = getKYCStatusConfig(kycStatus);
  const StatusIcon = kycConfig.icon;

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Settings Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your account profiles, verify business KYC compliance, and configure system security settings.
          </p>
        </div>

        {/* Outer grid layout: Tabs + Panels */}
        <div className="md:grid md:grid-cols-4 md:gap-8 items-start">
          
          {/* Side Pills (Tab Navigation) */}
          <nav className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1.5 mb-8 md:mb-0 overflow-x-auto pb-2 md:pb-0" aria-label="Tabs">
            <button
              onClick={() => handleTabChange('profile')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap md:w-full ${
                activeTab === 'profile'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-emerald-600' : 'text-slate-400'}`} />
              Profile Details
            </button>

            <button
              onClick={() => handleTabChange('kyc')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap md:w-full ${
                activeTab === 'kyc'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Shield className={`w-4 h-4 ${activeTab === 'kyc' ? 'text-emerald-600' : 'text-slate-400'}`} />
              KYC Verification
              {kycStatus === 'verified' && (
                <Check className="w-3.5 h-3.5 ml-auto text-emerald-600 bg-emerald-50 rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleTabChange('security')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap md:w-full ${
                activeTab === 'security'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Lock className={`w-4 h-4 ${activeTab === 'security' ? 'text-emerald-600' : 'text-slate-400'}`} />
              Security Settings
            </button>
          </nav>

          {/* Active Tab Panel Content */}
          <div className="md:col-span-3 space-y-6">

            {/* TAB 1: PROFILE DETAILS PANEL */}
            {activeTab === 'profile' && (
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900">Profile Details</CardTitle>
                  <CardDescription className="text-slate-500">
                    Update your personal profile information and corporate representation details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    
                    {/* Profile Picture Upload Placeholder */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center shadow-inner">
                          {profilePicPreview ? (
                            <img src={profilePicPreview} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-slate-400" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={triggerProfilePicSelect}
                          className="absolute inset-0 bg-slate-900/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium"
                        >
                          <Camera className="w-4 h-4 mb-0.5" />
                          Upload
                        </button>
                        <input
                          type="file"
                          ref={profileFileInputRef}
                          onChange={handleProfilePicChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                      <div className="text-center sm:text-left">
                        <h4 className="text-sm font-semibold text-slate-900">Profile Picture</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Supported files: JPG, PNG. Max size 2MB.
                        </p>
                        <button
                          type="button"
                          onClick={triggerProfilePicSelect}
                          className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          Select New Photo
                        </button>
                      </div>
                    </div>

                    {/* Profile Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* First Name */}
                      <div className="space-y-1.5">
                        <label htmlFor="firstName" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                          First Name <span className="text-rose-500">*</span>
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          value={profileForm.firstName}
                          onChange={handleProfileChange}
                          placeholder="Nuwan"
                          className="focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                        />
                      </div>

                      {/* Last Name */}
                      <div className="space-y-1.5">
                        <label htmlFor="lastName" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                          Last Name <span className="text-rose-500">*</span>
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          value={profileForm.lastName}
                          onChange={handleProfileChange}
                          placeholder="Chaminda"
                        />
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            disabled
                            value={profileForm.email}
                            className="bg-slate-50 border-slate-200 text-slate-500 pl-9 cursor-not-allowed"
                          />
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-1.5">
                        <label htmlFor="phone" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                            placeholder="+94 77 123 4567"
                            className="pl-9"
                          />
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        </div>
                      </div>

                      {/* Company Name */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label htmlFor="businessName" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                          Company / Business Name
                        </label>
                        <div className="relative">
                          <Input
                            id="businessName"
                            name="businessName"
                            type="text"
                            value={profileForm.businessName}
                            onChange={handleProfileChange}
                            placeholder="Nuwan Lapidary Services Pvt Ltd"
                            className="pl-9"
                          />
                          <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        </div>
                      </div>

                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                      >
                        {profileLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving Details...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Save Profile
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                </CardContent>
              </Card>
            )}

            {/* TAB 2: KYC VERIFICATION PANEL */}
            {activeTab === 'kyc' && (
              <div className="space-y-6">
                
                {/* KYC Compliance Status Card */}
                <Card className="border border-slate-200 shadow-sm overflow-hidden">
                  <div className={`p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${kycConfig.bannerBg}`}>
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-white/80 rounded-lg shadow-sm">
                        <StatusIcon className="w-6 h-6 text-slate-800" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-slate-900">KYC Compliance Status</h2>
                          <Badge variant={kycConfig.badgeVariant}>{kycConfig.label}</Badge>
                        </div>
                        <p className="text-sm text-slate-700 mt-1 max-w-xl leading-relaxed">
                          {kycConfig.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Render submitted overview or document upload form */}
                    {kycStatus === 'verified' ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                          <UserCheck className="w-8 h-8" />
                        </div>
                        <h3 className="text-md font-bold text-slate-900">Compliance Verification Complete</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">
                          Your profile has been fully vetted by compliance. Account limits have been adjusted and trading features are active.
                        </p>
                      </div>
                    ) : kycStatus === 'pending' ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
                          <Clock className="w-8 h-8" />
                        </div>
                        <h3 className="text-md font-bold text-slate-900">KYC Review in Progress</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">
                          Your submitted identification details are being verified by our compliance team. You will be notified once review completes.
                        </p>
                      </div>
                    ) : (
                      // Display verification submission form if unverified or rejected
                      <form onSubmit={handleKycSubmit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          {/* ID Number Input */}
                          <div className="space-y-1.5">
                            <label htmlFor="idNumber" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                              NIC (National ID) or Passport Number <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <Input
                                id="idNumber"
                                name="idNumber"
                                type="text"
                                required
                                value={kycForm.idNumber}
                                onChange={handleKycChange}
                                placeholder="199500000000 or N1234567"
                                className="pl-9"
                              />
                              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            </div>
                          </div>

                          {/* Date of Birth Input */}
                          <div className="space-y-1.5">
                            <label htmlFor="dob" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                              Date of Birth <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <Input
                                id="dob"
                                name="dob"
                                type="date"
                                required
                                value={kycForm.dob}
                                onChange={handleKycChange}
                                className="pl-9 text-slate-800"
                              />
                              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            </div>
                          </div>

                        </div>

                        {/* Front and Back View Upload Zones */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-2">
                            Identity Document Proof (NIC or Passport) <span className="text-rose-500">*</span>
                          </label>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            
                            {/* Front Upload Area */}
                            <div 
                              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[180px] ${
                                frontDocPreview 
                                  ? 'border-emerald-500 bg-emerald-50/20' 
                                  : 'border-slate-300 hover:border-emerald-500 bg-slate-50/40 hover:bg-slate-50'
                              }`}
                              onClick={() => frontInputRef.current?.click()}
                            >
                              <input 
                                type="file"
                                ref={frontInputRef}
                                onChange={handleFrontDocChange}
                                accept="image/*,application/pdf"
                                className="hidden"
                              />

                              {frontDocPreview ? (
                                <div className="space-y-2">
                                  <div className="relative inline-block">
                                    <img src={frontDocPreview} alt="Front ID Preview" className="h-24 w-auto rounded border border-slate-200 object-cover shadow-sm" />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setFrontDocFile(null);
                                        setFrontDocPreview('');
                                      }}
                                      className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <p className="text-xs font-medium text-slate-800 truncate max-w-[200px]">
                                    {frontDocFile?.name}
                                  </p>
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                  <h4 className="text-xs font-semibold text-slate-900">Upload Front Side</h4>
                                  <p className="text-[10px] text-slate-400 mt-1">PDF, PNG, JPG up to 5MB</p>
                                </>
                              )}
                            </div>

                            {/* Back Upload Area */}
                            <div 
                              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[180px] ${
                                backDocPreview 
                                  ? 'border-emerald-500 bg-emerald-50/20' 
                                  : 'border-slate-300 hover:border-emerald-500 bg-slate-50/40 hover:bg-slate-50'
                              }`}
                              onClick={() => backInputRef.current?.click()}
                            >
                              <input 
                                type="file"
                                ref={backInputRef}
                                onChange={handleBackDocChange}
                                accept="image/*,application/pdf"
                                className="hidden"
                              />

                              {backDocPreview ? (
                                <div className="space-y-2">
                                  <div className="relative inline-block">
                                    <img src={backDocPreview} alt="Back ID Preview" className="h-24 w-auto rounded border border-slate-200 object-cover shadow-sm" />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setBackDocFile(null);
                                        setBackDocPreview('');
                                      }}
                                      className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <p className="text-xs font-medium text-slate-800 truncate max-w-[200px]">
                                    {backDocFile?.name}
                                  </p>
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                  <h4 className="text-xs font-semibold text-slate-900">Upload Back Side</h4>
                                  <p className="text-[10px] text-slate-400 mt-1">PDF, PNG, JPG up to 5MB</p>
                                </>
                              )}
                            </div>

                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                          <button
                            type="submit"
                            disabled={kycLoading}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                          >
                            {kycLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting Documents...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Submit for Verification
                              </>
                            )}
                          </button>
                        </div>

                      </form>
                    )}
                  </CardContent>
                </Card>

              </div>
            )}

            {/* TAB 3: SECURITY SETTINGS PANEL */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                
                {/* Two-Factor Authentication Setup Card */}
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold text-slate-900">Two-Factor Authentication (2FA)</CardTitle>
                        <CardDescription className="text-slate-500 mt-1">
                          Secure your B2B account with a secondary verification passcode.
                        </CardDescription>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleToggle2FA}
                        className="text-slate-900 focus:outline-none transition-colors"
                      >
                        {twoFactorEnabled ? (
                          <ToggleRight className="w-12 h-12 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-12 h-12 text-slate-300" />
                        )}
                      </button>
                    </div>
                  </CardHeader>

                  {/* Expandable Setup guide if enabled */}
                  {show2FAConfig && (
                    <CardContent className="pt-0 border-t border-slate-100 bg-slate-50/50 p-6">
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          {/* Mock QR Code representation */}
                          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-inner">
                            <div className="w-32 h-32 bg-slate-900 flex flex-wrap items-center justify-center p-1.5 rounded">
                              {/* Design a simple grid pattern to simulate a QR code */}
                              <div className="grid grid-cols-4 gap-1 w-full h-full">
                                {[...Array(16)].map((_, i) => (
                                  <div key={i} className={`rounded-[2px] ${i % 3 === 0 || i % 7 === 0 ? 'bg-white' : 'bg-slate-900'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-center sm:text-left">
                            <h4 className="text-sm font-bold text-slate-900">Configure Authenticator App</h4>
                            <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
                              Scan this QR Code with Google Authenticator or Microsoft Authenticator to configure 2FA passcode generators.
                            </p>
                            <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono inline-block text-slate-700 shadow-sm mt-1">
                              Secret Key: <span className="font-semibold text-slate-900">GEM-TRAD-KEY-1029</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Change Password Card */}
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-900">Change Password</CardTitle>
                    <CardDescription className="text-slate-500">
                      Update your account login password periodically to maximize security.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSavePassword} className="space-y-4">
                      
                      {/* Current Password */}
                      <div className="space-y-1.5">
                        <label htmlFor="currentPassword" className="text-xs font-semibold text-slate-700">
                          Current Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            required
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="••••••••"
                            className="pl-9"
                          />
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="space-y-1.5">
                        <label htmlFor="newPassword" className="text-xs font-semibold text-slate-700">
                          New Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            required
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Min. 6 characters"
                            className="pl-9"
                          />
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div className="space-y-1.5">
                        <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700">
                          Confirm New Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="Re-type new password"
                            className="pl-9"
                          />
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        </div>
                      </div>

                      {/* Save Password Button */}
                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                        >
                          {passwordLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Updating Password...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Update Password
                            </>
                          )}
                        </button>
                      </div>

                    </form>
                  </CardContent>
                </Card>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
