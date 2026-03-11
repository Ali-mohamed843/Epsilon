import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  ArrowLeft,
  Users,
  Mail,
  Calendar,
  Shield,
  X,
  User,
  Lock,
  Building2,
  ChevronDown,
  Check,
  EyeOff,
  MessageSquare,
  Clock,
  BarChart3,
  Zap,
  TrendingUp,
  Menu,
  Search,
  FileText,
} from 'lucide-react-native';
import { router } from 'expo-router';
import Header from '@/components/Header';
import {
  getTeamMembers,
  getRoles,
  createUser,
  getUserProfile,
  updateUser,
  deleteUser,
  getUserDayStats,
  getFacebookPages,
  getInstagramPages,
  getTiktokPages,
  getSnapchatPages,
  assignPagesToUser,
} from '@/Api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BRAND = '#6e226e';

const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const formatTimeSince = (dateString) => {
  if (!dateString) return null;
  const d = new Date(dateString);
  const now = new Date();
  const diffMs = now - d;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days > 365) return `${Math.floor(days / 365)}y ago`;
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
};


const FormInput = ({
  label, value, onChangeText, placeholder, icon: Icon,
  keyboardType = 'default', secureTextEntry = false, required = false,
  autoCapitalize = 'sentences', optional = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isSecure = secureTextEntry && !showPassword;
  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-slate-700 mb-2">
        {label}{' '}
        {required && <Text className="text-red-400">*</Text>}
        {optional && <Text className="text-slate-400 text-xs font-normal">(optional)</Text>}
      </Text>
      <View className="flex-row items-center bg-slate-50 border rounded-xl px-4"
        style={{ borderColor: value?.trim() ? BRAND : '#e2e8f0' }}>
        <Icon size={16} color="#94A3B8" />
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder}
          placeholderTextColor="#94A3B8" keyboardType={keyboardType}
          secureTextEntry={isSecure} autoCapitalize={autoCapitalize}
          className="flex-1 ml-3 py-3 text-sm text-slate-800" />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            {showPassword ? <EyeOff size={16} color="#94A3B8" /> : <Eye size={16} color="#94A3B8" />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const RoleDropdown = ({ roles, selectedRoleId, onSelect, loading }) => {
  const [open, setOpen] = useState(false);
  const selectedRole = roles.find((r) => r._id === selectedRoleId);
  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-slate-700 mb-2">
        Role <Text className="text-red-400">*</Text>
      </Text>
      {loading ? (
        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <ActivityIndicator size="small" color={BRAND} />
          <Text className="text-sm text-slate-400 ml-3">Loading roles...</Text>
        </View>
      ) : (
        <>
          <TouchableOpacity onPress={() => setOpen(!open)} activeOpacity={0.7}
            className="flex-row items-center justify-between bg-slate-50 border rounded-xl px-4 py-3"
            style={{ borderColor: selectedRoleId ? BRAND : '#e2e8f0' }}>
            <View className="flex-row items-center flex-1">
              <Shield size={16} color="#94A3B8" />
              <Text className="text-sm ml-3" style={{ color: selectedRole ? '#1e293b' : '#94A3B8' }}>
                {selectedRole ? selectedRole.name : 'Select a role...'}
              </Text>
            </View>
            <ChevronDown size={18} color="#94A3B8" style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }} />
          </TouchableOpacity>
          {open && (
            <View className="mt-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg">
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled showsVerticalScrollIndicator>
                {roles.map((role) => {
                  const isSelected = selectedRoleId === role._id;
                  return (
                    <TouchableOpacity key={role._id} onPress={() => { onSelect(role._id); setOpen(false); }}
                      activeOpacity={0.7} className="flex-row items-center px-4 py-3 border-b border-slate-50"
                      style={{ backgroundColor: isSelected ? '#6e226e08' : 'transparent' }}>
                      <View className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                        style={{ backgroundColor: isSelected ? '#6e226e15' : '#f1f5f9' }}>
                        <Shield size={14} color={isSelected ? BRAND : '#94A3B8'} />
                      </View>
                      <Text className="flex-1 text-sm font-medium" style={{ color: isSelected ? BRAND : '#334155' }}>
                        {role.name}
                      </Text>
                      {isSelected && <Check size={16} color={BRAND} strokeWidth={3} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const UserModal = ({ visible, onClose, onSaved, editMember = null }) => {
  const isEditMode = !!editMember;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [userError, setUserError] = useState('');

  useEffect(() => {
    if (visible) {
      setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
      setCompanyName(''); setSelectedRoleId(''); setSaving(false); setUserError('');
      fetchRoles();
      if (isEditMode) fetchUserData(editMember._id || editMember.id);
    }
  }, [visible]);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try { const r = await getRoles(); if (r.success) setRoles(r.roles); } catch (e) {}
    setLoadingRoles(false);
  };

  const fetchUserData = async (userId) => {
    setLoadingUser(true); setUserError('');
    try {
      const r = await getUserProfile(userId);
      if (r.success && r.user) {
        setName(r.user.name || ''); setEmail(r.user.email || '');
        setCompanyName(r.user.company_name || ''); setSelectedRoleId(r.user.role || '');
      } else setUserError(r.message || 'Failed to load user data');
    } catch (e) { setUserError(e.message); }
    setLoadingUser(false);
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Validation', 'Please enter a name.');
    if (!email.trim()) return Alert.alert('Validation', 'Please enter an email.');
    if (!isEditMode && !password.trim()) return Alert.alert('Validation', 'Please enter a password.');
    if (!isEditMode && password !== confirmPassword) return Alert.alert('Validation', 'Passwords do not match.');
    if (isEditMode && password.trim() && password !== confirmPassword) return Alert.alert('Validation', 'Passwords do not match.');
    if (!selectedRoleId) return Alert.alert('Validation', 'Please select a role.');
    setSaving(true);
    try {
      const result = isEditMode
        ? await updateUser(editMember._id || editMember.id, { name: name.trim(), email: email.trim(), password: password.trim() || undefined, password_confirmation: confirmPassword.trim() || undefined, company_name: companyName.trim(), role: selectedRoleId })
        : await createUser({ name: name.trim(), email: email.trim(), password: password.trim(), password_confirmation: confirmPassword.trim(), company_name: companyName.trim(), role: selectedRoleId });
      if (result.success) {
        Alert.alert('Success', isEditMode ? `User "${name.trim()}" updated!` : `User "${name.trim()}" created!`);
        onSaved(result.user, isEditMode); onClose();
      } else Alert.alert('Error', result.message || 'Failed to save user.');
    } catch (e) { Alert.alert('Error', e.message); }
    setSaving(false);
  };

  const isLoading = loadingRoles || loadingUser;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 bg-black/50 justify-center items-center px-5">
          <TouchableOpacity activeOpacity={1} onPress={() => {}} className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            style={{ maxHeight: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 20 }}>
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100" style={{ backgroundColor: '#6e226e08' }}>
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: '#6e226e15' }}>
                  {isEditMode ? <Edit2 size={18} color={BRAND} /> : <Users size={18} color={BRAND} />}
                </View>
                <View>
                  <Text className="text-lg font-bold" style={{ color: BRAND }}>{isEditMode ? 'Edit Member' : 'Add New Member'}</Text>
                  {isEditMode && editMember && <Text className="text-[10px] text-slate-400 mt-0.5">{editMember.email}</Text>}
                </View>
              </View>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="w-8 h-8 rounded-lg items-center justify-center bg-slate-100">
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
            {loadingUser ? (
              <View className="items-center justify-center py-12"><ActivityIndicator size="large" color={BRAND} /><Text className="text-slate-400 text-sm mt-3">Loading user data...</Text></View>
            ) : userError ? (
              <View className="items-center justify-center py-12 px-6">
                <Text className="text-red-500 text-sm font-medium text-center mb-2">Failed to load user</Text>
                <Text className="text-slate-400 text-xs text-center mb-4">{userError}</Text>
                <TouchableOpacity onPress={() => fetchUserData(editMember._id || editMember.id)} activeOpacity={0.7} className="px-5 py-2 rounded-lg" style={{ backgroundColor: BRAND }}>
                  <Text className="text-white text-xs font-semibold">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <ScrollView className="px-5 py-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                  <FormInput label="Name" value={name} onChangeText={setName} placeholder="Enter full name..." icon={User} required autoCapitalize="words" />
                  <FormInput label="Email" value={email} onChangeText={setEmail} placeholder="Enter email address..." icon={Mail} keyboardType="email-address" required autoCapitalize="none" />
                  <FormInput label={isEditMode ? 'New Password' : 'Password'} value={password} onChangeText={setPassword} placeholder={isEditMode ? 'Leave empty to keep current...' : 'Enter password...'} icon={Lock} secureTextEntry required={!isEditMode} optional={isEditMode} autoCapitalize="none" />
                  <FormInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm password..." icon={Lock} secureTextEntry required={!isEditMode} optional={isEditMode} autoCapitalize="none" />
                  <FormInput label="Company" value={companyName} onChangeText={setCompanyName} placeholder="Enter company name..." icon={Building2} autoCapitalize="words" />
                  <RoleDropdown roles={roles} selectedRoleId={selectedRoleId} onSelect={setSelectedRoleId} loading={loadingRoles} />
                </ScrollView>
                <View className="flex-row px-5 py-4 border-t border-slate-100 gap-3">
                  <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="flex-1 py-3 rounded-xl items-center border border-slate-200 bg-white">
                    <Text className="text-sm font-semibold text-slate-500">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSave} disabled={saving || isLoading} activeOpacity={0.7} className="flex-1 py-3 rounded-xl items-center flex-row justify-center" style={{ backgroundColor: saving || isLoading ? '#6e226e60' : BRAND }}>
                    {saving ? <ActivityIndicator size="small" color="#ffffff" /> : (
                      <>{isEditMode ? <Edit2 size={16} color="#ffffff" strokeWidth={2.5} /> : <Plus size={16} color="#ffffff" strokeWidth={2.5} />}
                        <Text className="text-sm font-semibold text-white ml-1.5">{isEditMode ? 'Update Member' : 'Add Member'}</Text></>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const DeleteUserModal = ({ visible, member, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  useEffect(() => { if (visible) setDeleting(false); }, [visible]);
  const handleDelete = async () => {
    if (!member) return;
    setDeleting(true);
    try {
      const r = await deleteUser(member._id || member.id);
      if (r.success) { Alert.alert('Success', `User "${member.name}" deleted!`); onDeleted(member._id || member.id); onClose(); }
      else Alert.alert('Error', r.message || 'Failed to delete user.');
    } catch (e) { Alert.alert('Error', e.message); }
    setDeleting(false);
  };
  if (!member) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 bg-black/50 justify-center items-center px-5">
        <TouchableOpacity activeOpacity={1} onPress={() => {}} className="bg-white rounded-2xl w-full max-w-sm overflow-hidden"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 20 }}>
          <View className="items-center pt-6 pb-4 px-6">
            <View className="w-14 h-14 rounded-full items-center justify-center mb-4 bg-red-50"><Trash2 size={24} color="#EF4444" /></View>
            <Text className="text-lg font-bold text-slate-800 text-center">Delete Member</Text>
            <Text className="text-sm text-slate-400 text-center mt-2 px-2">Are you sure you want to delete <Text className="font-semibold text-slate-600">"{member.name}"</Text>?</Text>
          </View>
          <View className="mx-6 mb-4 rounded-xl p-3 flex-row items-center" style={{ backgroundColor: '#6e226e08' }}>
            <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: BRAND }}>
              <Text className="text-white font-bold text-sm">{getInitials(member.name)}</Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-slate-700">{member.name}</Text>
              <Text className="text-[11px] text-slate-400 mt-0.5">{member.email}</Text>
            </View>
          </View>
          <View className="flex-row px-6 pb-6 gap-3">
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="flex-1 py-3 rounded-xl items-center border border-slate-200 bg-white">
              <Text className="text-sm font-semibold text-slate-500">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} disabled={deleting} activeOpacity={0.7} className="flex-1 py-3 rounded-xl items-center flex-row justify-center" style={{ backgroundColor: deleting ? '#ef444480' : '#EF4444' }}>
              {deleting ? <ActivityIndicator size="small" color="#ffffff" /> : (<><Trash2 size={16} color="#ffffff" /><Text className="text-sm font-semibold text-white ml-1.5">Delete</Text></>)}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const PERF_TABS = [
  { key: 'all', label: 'All' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'x', label: 'X' },
  { key: 'tiktok', label: 'TikTok' },
];

const StatCard = ({ icon: Icon, label, value }) => (
  <View className="rounded-xl p-4 flex-1" style={{ backgroundColor: '#6e226e08' }}>
    <View className="flex-row items-center mb-2"><Icon size={16} color={BRAND} /><Text className="text-[11px] text-slate-500 ml-1.5 font-medium">{label}</Text></View>
    <Text className="text-2xl font-bold" style={{ color: BRAND }}>{value ?? 0}</Text>
  </View>
);

const RateBadge = ({ rate }) => {
  const labels = { green: 'Excellent', yellow: 'Average', red: 'Needs Improvement' };
  return <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: '#6e226e15' }}><Text className="text-xs font-semibold" style={{ color: BRAND }}>{labels[rate] || 'Excellent'}</Text></View>;
};

const PerformanceModal = ({ visible, member, onClose }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { if (visible && member) { setActiveTab('all'); fetchStats('all'); } }, [visible, member]);
  useEffect(() => { if (visible && member) fetchStats(activeTab); }, [activeTab]);

  const fetchStats = async (platform) => {
    if (!member) return;
    setLoading(true); setError('');
    try {
      const r = await getUserDayStats(member._id || member.id, platform === 'all' ? null : platform);
      if (r.success) { setUserData(r.user); setStatsData(r.data); } else setError(r.message);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  if (!member) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 bg-black/50 justify-center items-center px-4">
        <TouchableOpacity activeOpacity={1} onPress={() => {}} className="bg-white rounded-2xl w-full max-w-md overflow-hidden" style={{ maxHeight: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 20 }}>
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100" style={{ backgroundColor: '#6e226e08' }}>
            <View className="flex-row items-center flex-1">
              <View className="w-11 h-11 rounded-full items-center justify-center mr-3" style={{ backgroundColor: BRAND }}><Text className="text-white font-bold text-base">{getInitials(member.name)}</Text></View>
              <View className="flex-1"><Text className="text-base font-bold" style={{ color: BRAND }} numberOfLines={1}>{member.name}</Text><Text className="text-[11px] text-slate-400 mt-0.5" numberOfLines={1}>{member.email}</Text></View>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="w-8 h-8 rounded-lg items-center justify-center bg-slate-100"><X size={16} color="#64748B" /></TouchableOpacity>
          </View>
          <View className="border-b border-slate-100">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              <View className="flex-row gap-2">
                {PERF_TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} activeOpacity={0.7} className="px-4 py-2.5 rounded-xl"
                      style={{ backgroundColor: isActive ? '#6e226e15' : '#f1f5f9', borderWidth: isActive ? 1.5 : 0, borderColor: isActive ? '#6e226e40' : 'transparent' }}>
                      <Text className="text-sm font-semibold" style={{ color: isActive ? BRAND : '#94A3B8' }}>{tab.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
          <ScrollView className="px-5 py-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {loading && <View className="items-center justify-center py-12"><ActivityIndicator size="large" color={BRAND} /><Text className="text-slate-400 text-sm mt-3">Loading stats...</Text></View>}
            {!loading && error !== '' && <View className="items-center justify-center py-10"><Text className="text-slate-500 text-sm mb-2">Failed to load stats</Text><TouchableOpacity onPress={() => fetchStats(activeTab)} activeOpacity={0.7} className="px-4 py-2 rounded-lg" style={{ backgroundColor: BRAND }}><Text className="text-white text-xs font-semibold">Retry</Text></TouchableOpacity></View>}
            {!loading && !error && statsData && (
              <>
                {userData && (
                  <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#6e226e08' }}>
                    <View className="flex-row items-center justify-between mb-3"><Text className="text-sm font-semibold text-slate-700">Agent Status</Text><RateBadge rate={userData.rate} /></View>
                    <View className="flex-row gap-3">
                      <View className="flex-1 bg-white rounded-lg p-3 items-center"><Text className="text-lg font-bold" style={{ color: BRAND }}>{userData.totalAssignedComments ?? 0}</Text><Text className="text-[10px] text-slate-400 mt-1 text-center">Assigned</Text></View>
                      <View className="flex-1 bg-white rounded-lg p-3 items-center"><Text className="text-lg font-bold" style={{ color: BRAND }}>{userData.totalDoneComments ?? 0}</Text><Text className="text-[10px] text-slate-400 mt-1 text-center">Done</Text></View>
                      <View className="flex-1 bg-white rounded-lg p-3 items-center"><Text className="text-lg font-bold" style={{ color: BRAND }}>{userData.totalRespondedAndDoneComments ?? 0}</Text><Text className="text-[10px] text-slate-400 mt-1 text-center">Responded</Text></View>
                    </View>
                  </View>
                )}
                <View className="flex-row gap-3 mb-3"><StatCard icon={Zap} label="Total Actions" value={statsData.totalActions} /><StatCard icon={BarChart3} label="Total Items" value={statsData.totalItems} /></View>
                <View className="flex-row gap-3 mb-3"><StatCard icon={MessageSquare} label="Comments" value={statsData.totalComments} /><StatCard icon={Mail} label="Messages" value={statsData.totalMessages} /></View>
                <View className="rounded-xl p-4 border" style={{ borderColor: '#6e226e20' }}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center"><View className="w-10 h-10 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: '#6e226e15' }}><Clock size={18} color={BRAND} /></View><View><Text className="text-[11px] text-slate-500 font-medium">Avg. Response Time</Text><Text className="text-lg font-bold mt-0.5" style={{ color: BRAND }}>{statsData.avgResponseTimeInMinutes ?? '0s'}</Text></View></View>
                    <TrendingUp size={20} color={BRAND} />
                  </View>
                </View>
                {userData?.login_at && <View className="mt-4 rounded-xl p-3 flex-row items-center" style={{ backgroundColor: '#6e226e08' }}><Calendar size={14} color={BRAND} /><Text className="text-xs ml-2" style={{ color: BRAND }}>Last login: {new Date(userData.login_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text></View>}
              </>
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};


const ASSIGN_PLATFORMS = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'snapchat', label: 'Snapchat' },
];

const AssignPagesModal = ({ visible, member, onClose, onSaved }) => {
  const [platform, setPlatform] = useState('facebook');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [allPages, setAllPages] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const loadIdRef = useRef(0);
  const memberId = member?._id || member?.id || '';

  useEffect(() => {
    if (!visible || !memberId) return;
    setSearch('');
    setDropdownOpen(false);
    setError('');
    loadData(platform);
  }, [visible, memberId, platform]);

  const extractId = (item) => {
    if (!item) return null;
    if (typeof item === 'string') return item;
    return item._id || item.id || null;
  };

  const getAssignedArr = (userObj, plat) => {
    if (!userObj) return [];
    switch (plat) {
      case 'facebook':  return userObj.assigned_pages || [];
      case 'instagram': return userObj.instagram_assigned_pages || [];
      case 'tiktok':    return userObj.tiktok_assigned_pages || [];
      case 'snapchat':  return userObj.snapchat_assigned_pages || [];
      default: return [];
    }
  };

  const loadData = async (plat) => {
    const thisLoad = ++loadIdRef.current;
    setLoading(true);
    setError('');
    setAllPages([]);
    setSelectedIds(new Set());

    try {
      let pageList = [];
      switch (plat) {
        case 'facebook': {
          const adminId = member?.admin || (await AsyncStorage.getItem('user_id'));
          if (!adminId) throw new Error('Admin ID not found');
          const r = await getFacebookPages(adminId);
          if (!r?.success) throw new Error(r?.message || 'Failed to load pages');
          pageList = r.pages || [];
          break;
        }
        case 'instagram': {
          const r = await getInstagramPages();
          if (!r?.success) throw new Error(r?.message || 'Failed to load pages');
          pageList = r.pages || [];
          break;
        }
        case 'tiktok': {
          const r = await getTiktokPages();
          if (!r?.success) throw new Error(r?.message || 'Failed to load pages');
          pageList = r.pages || [];
          break;
        }
        case 'snapchat': {
          const r = await getSnapchatPages();
          if (!r?.success) throw new Error(r?.message || 'Failed to load pages');
          pageList = r.pages || [];
          break;
        }
      }

      if (thisLoad !== loadIdRef.current) return;
      const assignedIds = new Set();

      for (const page of pageList) {
        const admins = page.page_admins;
        if (Array.isArray(admins)) {
          for (const admin of admins) {
            if (extractId(admin) === memberId) {
              assignedIds.add(page._id || page.id);
            }
          }
        }
      }

      if (assignedIds.size === 0) {
        const arr = getAssignedArr(member, plat);
        for (const item of arr) {
          const id = extractId(item);
          if (id) assignedIds.add(id);
        }
      }

      if (assignedIds.size === 0) {
        try {
          const profileResult = await getUserProfile(memberId);
          if (thisLoad !== loadIdRef.current) return;
          if (profileResult?.success && profileResult.user) {
            const arr = getAssignedArr(profileResult.user, plat);
            for (const item of arr) {
              const id = extractId(item);
              if (id) assignedIds.add(id);
            }
          }
        } catch {}
      }

      if (thisLoad !== loadIdRef.current) return;

      setAllPages(pageList);
      setSelectedIds(new Set(assignedIds));
    } catch (e) {
      if (thisLoad !== loadIdRef.current) return;
      setError(e.message || 'Unknown error');
    }

    if (thisLoad === loadIdRef.current) setLoading(false);
  };

  const togglePage = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAssign = async () => {
    if (!memberId) return;
    setSaving(true);
    try {
      const result = await assignPagesToUser({
        pages: Array.from(selectedIds),
        userId: memberId,
        platform,
      });
      if (result.success) {
        Alert.alert('Success', 'Page assignments updated!', [
          { text: 'OK', onPress: () => { onSaved?.(); onClose(); } }
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to update assignments.');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setSaving(false);
  };

  const pname = (p) => p.name || p.username || 'Unnamed';
  const ppic = (p) => {
    if (typeof p.picture === 'string' && p.picture) return p.picture;
    return p.picture?.url || p.picture?.data?.url || null;
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return allPages;
    const q = search.toLowerCase();
    return allPages.filter((p) => pname(p).toLowerCase().includes(q));
  }, [allPages, search]);

  if (!member) return null;

  const activePlatform = ASSIGN_PLATFORMS.find((p) => p.key === platform);
  const assignedCount = selectedIds.size;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View
          className="bg-white rounded-2xl w-full"
          style={{
            height: '90%',
            maxWidth: 448,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 20,
            flexDirection: 'column',
          }}
        >
          <View
            className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100"
            style={{ backgroundColor: '#6e226e08' }}
          >
            <View className="flex-row items-center flex-1">
              <View
                className="w-11 h-11 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: BRAND }}
              >
                <Text className="text-white font-bold text-base">
                  {getInitials(member.name)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold" style={{ color: BRAND }} numberOfLines={1}>
                  Assign Pages
                </Text>
                <Text className="text-[11px] text-slate-400 mt-0.5" numberOfLines={1}>
                  {member.name} • {assignedCount} assigned
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="w-8 h-8 rounded-lg items-center justify-center bg-slate-100"
            >
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View className="px-5 pt-4">
            <Text className="text-sm font-semibold text-slate-700 mb-2">Platform</Text>
            <TouchableOpacity
              onPress={() => !loading && setDropdownOpen(!dropdownOpen)}
              activeOpacity={0.7}
              className="flex-row items-center justify-between bg-slate-50 border rounded-xl px-4 py-3"
              style={{ borderColor: '#6e226e40', opacity: loading ? 0.6 : 1 }}
            >
              <View className="flex-row items-center">
                <Shield size={16} color={BRAND} />
                <Text className="text-sm font-semibold ml-2" style={{ color: BRAND }}>
                  {activePlatform?.label}
                </Text>
              </View>
              <ChevronDown
                size={18}
                color="#94A3B8"
                style={{ transform: [{ rotate: dropdownOpen ? '180deg' : '0deg' }] }}
              />
            </TouchableOpacity>

            {dropdownOpen && (
              <View className="mt-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg">
                {ASSIGN_PLATFORMS.map((p) => {
                  const active = platform === p.key;
                  return (
                    <TouchableOpacity
                      key={p.key}
                      onPress={() => { if (p.key !== platform) setPlatform(p.key); setDropdownOpen(false); }}
                      activeOpacity={0.7}
                      className="flex-row items-center px-4 py-3 border-b border-slate-50"
                      style={{ backgroundColor: active ? '#6e226e08' : 'transparent' }}
                    >
                      <Shield size={14} color={active ? BRAND : '#94A3B8'} />
                      <Text className="flex-1 text-sm font-medium ml-3" style={{ color: active ? BRAND : '#334155' }}>
                        {p.label}
                      </Text>
                      {active && <Check size={16} color={BRAND} strokeWidth={3} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View className="px-5 pt-3 pb-2">
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search size={16} color="#94A3B8" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search pages..."
                placeholderTextColor="#94A3B8"
                className="flex-1 ml-2 text-sm text-slate-800"
              />
              {search.trim() !== '' && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <X size={14} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ── Count ── */}
          <View className="px-5 pb-2">
            <Text className="text-xs text-slate-400">
              {filtered.length} page{filtered.length !== 1 ? 's' : ''} • {assignedCount} selected
            </Text>
          </View>

          <View className="flex-1" style={{ minHeight: 200 }}>
            <ScrollView
              showsVerticalScrollIndicator
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}
              nestedScrollEnabled
            >
              {loading && (
                <View className="items-center justify-center py-12">
                  <ActivityIndicator size="large" color={BRAND} />
                  <Text className="text-slate-400 text-sm mt-3">Loading pages...</Text>
                </View>
              )}

              {!loading && error !== '' && (
                <View className="items-center justify-center py-10">
                  <Text className="text-slate-500 text-sm mb-2">{error}</Text>
                  <TouchableOpacity
                    onPress={() => loadData(platform)}
                    className="px-4 py-2 rounded-lg"
                    style={{ backgroundColor: BRAND }}
                  >
                    <Text className="text-white text-xs font-semibold">Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!loading && !error && filtered.length === 0 && (
                <View className="items-center justify-center py-12">
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: '#6e226e08' }}
                  >
                    <FileText size={28} color={BRAND} />
                  </View>
                  <Text className="text-slate-500 text-sm font-medium">No pages found</Text>
                  <Text className="text-slate-400 text-xs mt-1">
                    No {activePlatform?.label} pages available
                  </Text>
                </View>
              )}

              {!loading && !error && filtered.map((page) => {
                const id = page._id || page.id;
                const name = pname(page);
                const pic = ppic(page);
                const isChecked = selectedIds.has(id);

                return (
                  <TouchableOpacity
                    key={id}
                    onPress={() => togglePage(id)}
                    activeOpacity={0.7}
                    className="flex-row items-center py-3 px-3 mb-2 rounded-xl border"
                    style={{
                      borderColor: isChecked ? '#6e226e60' : '#e2e8f0',
                      backgroundColor: isChecked ? '#6e226e08' : '#ffffff',
                    }}
                  >
                    {pic ? (
                      <Image
                        source={{ uri: pic }}
                        className="w-10 h-10 rounded-lg mr-3"
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        className="w-10 h-10 rounded-lg mr-3 items-center justify-center"
                        style={{ backgroundColor: isChecked ? '#6e226e15' : '#f1f5f9' }}
                      >
                        <Text
                          className="text-sm font-bold"
                          style={{ color: isChecked ? BRAND : '#94A3B8' }}
                        >
                          {getInitials(name)}
                        </Text>
                      </View>
                    )}

                    <View className="flex-1 mr-3">
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: isChecked ? '#1e293b' : '#475569' }}
                        numberOfLines={1}
                      >
                        {name}
                      </Text>
                      <Text
                        className="text-[10px] mt-0.5"
                        style={{ color: isChecked ? BRAND : '#94A3B8' }}
                      >
                        {isChecked ? 'Assigned' : 'Not assigned'}
                      </Text>
                    </View>

                    <View
                      className="w-6 h-6 rounded-md items-center justify-center border-2"
                      style={{
                        borderColor: isChecked ? BRAND : '#cbd5e1',
                        backgroundColor: isChecked ? BRAND : '#ffffff',
                      }}
                    >
                      {isChecked && <Check size={14} color="#ffffff" strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View
            className="px-5 py-4 border-t border-slate-100 bg-white flex-row gap-3"
            style={{ borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}
          >
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="flex-1 py-3 rounded-xl items-center border border-slate-200 bg-white"
            >
              <Text className="text-sm font-semibold text-slate-500">Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAssign}
              disabled={saving}
              activeOpacity={0.7}
              className="flex-1 py-3 rounded-xl items-center flex-row justify-center"
              style={{ backgroundColor: saving ? `${BRAND}60` : BRAND }}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Check size={16} color="#ffffff" strokeWidth={2.5} />
                  <Text className="text-sm font-semibold text-white ml-1.5">
                    Assign ({assignedCount})
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


const TeamMemberCard = ({ member, onEdit, onDelete, onPerformance, onAssignPages }) => {
  const initials = getInitials(member.name);
  const lastLogin = formatTimeSince(member.login_at);
  const joinedDate = formatTimeSince(member.createdAt);

  return (
    <View className="bg-white rounded-2xl p-5 mb-4 border border-slate-200">
      <View className="flex-row items-center mb-4">
        <View className="w-14 h-14 rounded-full items-center justify-center mr-4" style={{ backgroundColor: BRAND }}>
          <Text className="text-white font-bold text-xl">{initials}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-slate-800 font-semibold text-lg">{member.name}</Text>
          <View className="flex-row items-center mt-0.5">
            <Mail size={12} color="#94A3B8" />
            <Text className="text-slate-400 text-xs ml-1 flex-1" numberOfLines={1}>{member.email}</Text>
          </View>
          <View className="flex-row items-center mt-2 gap-2 flex-wrap">
            {member.company_name ? (
              <View className="px-2.5 py-1 rounded-md" style={{ backgroundColor: '#6e226e12' }}>
                <Text className="text-xs font-medium" style={{ color: BRAND }}>{member.company_name}</Text>
              </View>
            ) : null}
            {member.is_subscribed ? (
              <View className="px-2.5 py-1 rounded-md" style={{ backgroundColor: '#6e226e12' }}>
                <Text className="text-xs font-medium" style={{ color: BRAND }}>Subscribed</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View className="flex-row gap-4 mb-4 pl-1">
        {lastLogin ? (
          <View className="flex-row items-center">
            <Calendar size={12} color={BRAND} />
            <Text className="text-[11px] ml-1" style={{ color: BRAND }}>Last login: {lastLogin}</Text>
          </View>
        ) : null}
        {joinedDate ? (
          <View className="flex-row items-center">
            <Shield size={12} color={BRAND} />
            <Text className="text-[11px] ml-1" style={{ color: BRAND }}>Joined: {joinedDate}</Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row justify-between items-center">
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={() => onPerformance(member)} className="flex-row items-center border rounded-lg px-3 py-2.5" style={{ borderColor: '#6e226e30' }} activeOpacity={0.7}>
            <Eye size={16} color={BRAND} />
            <Text className="ml-1.5 font-medium text-xs" style={{ color: BRAND }}>Performance</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onAssignPages(member)} className="flex-row items-center border rounded-lg px-3 py-2.5" style={{ borderColor: '#6e226e30' }} activeOpacity={0.7}>
            <Menu size={16} color={BRAND} />
            <Text className="ml-1.5 font-medium text-xs" style={{ color: BRAND }}>Pages</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={() => onEdit(member)} className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: '#f1f5f9' }} activeOpacity={0.7}>
            <Edit2 size={16} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(member)} className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: '#fef2f2' }} activeOpacity={0.7}>
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function TeamManagement() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLargeScreen = width >= 1024;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingMember, setDeletingMember] = useState(null);
  const [performanceModalVisible, setPerformanceModalVisible] = useState(false);
  const [performanceMember, setPerformanceMember] = useState(null);
  const [assignPagesModalVisible, setAssignPagesModalVisible] = useState(false);
  const [assignPagesMember, setAssignPagesMember] = useState(null);

  const perPage = 10;

  const fetchTeam = useCallback(async (page = 1, reset = false) => {
    if (page === 1) { setLoading(true); setError(''); } else setLoadingMore(true);
    try {
      const r = await getTeamMembers({ page, perPage });
      if (r.success) {
        const u = r.users || [];
        if (reset || page === 1) setMembers(u); else setMembers((prev) => [...prev, ...u]);
        setCurrentPage(page); setTotalPages(r.pageInfo?.totalPages ?? 1); setTotalItems(r.pageInfo?.totalItems ?? 0);
      } else { if (page === 1) setError(r.message || 'Failed to load team'); }
    } catch (e) { if (page === 1) setError(e.message); }
    setLoading(false); setLoadingMore(false);
  }, []);

  useEffect(() => { fetchTeam(1, true); }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View className={`flex-1 ${isLargeScreen ? 'items-center' : ''}`}>
        <View className={`flex-1 bg-white ${isLargeScreen ? 'max-w-lg w-full shadow-xl' : 'w-full'}`}>
          {isTablet && <View className="items-center py-4 bg-slate-50"><Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: BRAND }}>Team Management</Text></View>}
          <Header />
          <View className="px-5 py-5 flex-row justify-between items-center bg-slate-50">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="p-1 -ml-1 mr-3" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <ArrowLeft size={24} color="#64748B" strokeWidth={2} />
              </TouchableOpacity>
              <View>
                <Text className="text-slate-800 font-semibold text-2xl">Team</Text>
                {totalItems > 0 && <Text className="text-xs text-slate-400 mt-0.5">{totalItems} member{totalItems !== 1 ? 's' : ''}</Text>}
              </View>
            </View>
            <TouchableOpacity onPress={() => { setEditingMember(null); setUserModalVisible(true); }} className="w-12 h-12 rounded-2xl items-center justify-center shadow-md" style={{ backgroundColor: BRAND }} activeOpacity={0.7}>
              <Plus size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: isTablet ? 24 : 20, paddingTop: 8, paddingBottom: 40 }}>
            {loading && <View className="flex-1 items-center justify-center py-20"><ActivityIndicator size="large" color={BRAND} /><Text className="text-slate-500 text-sm mt-3">Loading team...</Text></View>}
            {!loading && error !== '' && members.length === 0 && (
              <View className="flex-1 items-center justify-center py-20 px-6">
                <Text className="text-slate-600 text-base font-medium text-center mb-2">Failed to load team</Text>
                <Text className="text-slate-400 text-sm text-center mb-4">{error}</Text>
                <TouchableOpacity onPress={() => fetchTeam(1, true)} activeOpacity={0.7} className="px-6 py-2.5 rounded-lg" style={{ backgroundColor: BRAND }}><Text className="text-white text-sm font-semibold">Retry</Text></TouchableOpacity>
              </View>
            )}
            {!loading && error === '' && members.length === 0 && <View className="flex-1 items-center justify-center py-20"><Text className="text-slate-400 text-base">No team members yet</Text></View>}
            {!loading && members.map((m) => (
              <TeamMemberCard
                key={m._id || m.id}
                member={m}
                onEdit={(member) => { setEditingMember(member); setUserModalVisible(true); }}
                onDelete={(member) => { setDeletingMember(member); setDeleteModalVisible(true); }}
                onPerformance={(member) => { setPerformanceMember(member); setPerformanceModalVisible(true); }}
                onAssignPages={(member) => { setAssignPagesMember(member); setAssignPagesModalVisible(true); }}
              />
            ))}
            {!loading && currentPage < totalPages && (
              <TouchableOpacity onPress={() => { if (!loadingMore && currentPage < totalPages) fetchTeam(currentPage + 1); }} activeOpacity={0.7} className="w-full py-3 rounded-lg items-center justify-center mb-4" style={{ backgroundColor: '#6e226e12' }} disabled={loadingMore}>
                {loadingMore ? <ActivityIndicator size="small" color={BRAND} /> : <Text className="text-sm font-semibold" style={{ color: BRAND }}>Load More Members</Text>}
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>

      <UserModal visible={userModalVisible} onClose={() => { setUserModalVisible(false); setEditingMember(null); }}
        onSaved={(savedUser, isEdit) => {
          if (isEdit) setMembers((prev) => prev.map((m) => (m._id || m.id) === (savedUser._id || savedUser.id) ? { ...m, ...savedUser } : m));
          else { setMembers((prev) => [savedUser, ...prev]); setTotalItems((prev) => prev + 1); }
        }} editMember={editingMember} />

      <DeleteUserModal visible={deleteModalVisible} member={deletingMember}
        onClose={() => { setDeleteModalVisible(false); setDeletingMember(null); }}
        onDeleted={(id) => { setMembers((prev) => prev.filter((m) => (m._id || m.id) !== id)); setTotalItems((prev) => Math.max(0, prev - 1)); }} />

      <PerformanceModal visible={performanceModalVisible} member={performanceMember}
        onClose={() => { setPerformanceModalVisible(false); setPerformanceMember(null); }} />

      <AssignPagesModal
        visible={assignPagesModalVisible}
        member={assignPagesMember}
        onClose={() => { setAssignPagesModalVisible(false); setAssignPagesMember(null); }}
        onSaved={() => fetchTeam(1, true)}
      />
    </SafeAreaView>
  );
}