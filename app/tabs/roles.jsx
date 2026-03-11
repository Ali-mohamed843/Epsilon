import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Search,
  Shield,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  FileText,
  MessageSquare,
  Mail,
  Users,
  AtSign,
  Lock,
  Bot,
  Star,
  Layers,
  Settings,
  Globe,
} from 'lucide-react-native';
import { router } from 'expo-router';
import Header from '@/components/Header';
import {
  getRoles,
  createRole,
  getPermissions,
  getRoleById,
  updateRole,
  deleteRole,
} from '@/Api/api';

const BRAND = '#6e226e';


const CATEGORY_ICONS = {
  page: FileText,
  comment: MessageSquare,
  message: Mail,
  post: Layers,
  user: Users,
  mention: AtSign,
  role: Lock,
  package: Bot,
  influencer: Star,
  other: Settings,
};

const CATEGORY_LABELS = {
  page: 'Pages',
  comment: 'Comments',
  message: 'Messages',
  post: 'Posts',
  user: 'Users',
  mention: 'Mentions',
  role: 'Roles',
  package: 'AI Packages',
  influencer: 'Influencers',
  other: 'Other',
};

const getCategoryIcon = (categoryKey, color, size = 16) => {
  const IconComponent = CATEGORY_ICONS[categoryKey] || Globe;
  return <IconComponent size={size} color={color} />;
};

const CheckBox = ({ checked, onPress, label }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="flex-row items-center py-2.5 px-3"
  >
    <View
      className="w-5 h-5 rounded border-2 items-center justify-center mr-3"
      style={{
        borderColor: checked ? BRAND : '#cbd5e1',
        backgroundColor: checked ? BRAND : 'transparent',
      }}
    >
      {checked && <Check size={12} color="#ffffff" strokeWidth={3} />}
    </View>
    <Text
      className="text-sm flex-1"
      style={{ color: checked ? '#1e293b' : '#64748b' }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const PermissionCategoryDropdown = ({
  categoryKey,
  permissions,
  selectedPermissions,
  onToggle,
  expanded,
  onToggleExpand,
}) => {
  const uniquePermissions = useMemo(() => {
    const seen = new Set();
    return permissions.filter((p) => {
      if (seen.has(p.token)) return false;
      seen.add(p.token);
      return true;
    });
  }, [permissions]);

  const selectedCount = uniquePermissions.filter((p) =>
    selectedPermissions.includes(p.token)
  ).length;
  const allSelected =
    selectedCount === uniquePermissions.length && uniquePermissions.length > 0;

  const categoryLabel =
    CATEGORY_LABELS[categoryKey] ||
    categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);

  return (
    <View className="mb-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
      <TouchableOpacity
        onPress={onToggleExpand}
        activeOpacity={0.7}
        className="flex-row items-center justify-between px-4 py-3"
        style={{ backgroundColor: expanded ? '#6e226e08' : '#ffffff' }}
      >
        <View className="flex-row items-center flex-1">
          <View
            className="w-8 h-8 rounded-lg items-center justify-center mr-3"
            style={{
              backgroundColor: selectedCount > 0 ? '#6e226e15' : '#f1f5f9',
            }}
          >
            {getCategoryIcon(
              categoryKey,
              selectedCount > 0 ? BRAND : '#94A3B8'
            )}
          </View>
          <View className="flex-1">
            <Text
              className="text-sm font-semibold"
              style={{ color: selectedCount > 0 ? BRAND : '#334155' }}
            >
              {categoryLabel}
            </Text>
            <Text className="text-[10px] text-slate-400 mt-0.5">
              {selectedCount}/{uniquePermissions.length} selected
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          {selectedCount > 0 && (
            <View
              className="px-2 py-0.5 rounded-full mr-2"
              style={{ backgroundColor: BRAND }}
            >
              <Text className="text-[10px] text-white font-bold">
                {selectedCount}
              </Text>
            </View>
          )}
          {expanded ? (
            <ChevronUp size={18} color="#94A3B8" />
          ) : (
            <ChevronDown size={18} color="#94A3B8" />
          )}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="border-t border-slate-100">
          {uniquePermissions.length > 1 && (
            <TouchableOpacity
              onPress={() => {
                if (allSelected) {
                  uniquePermissions.forEach((p) => {
                    if (selectedPermissions.includes(p.token)) onToggle(p.token);
                  });
                } else {
                  uniquePermissions.forEach((p) => {
                    if (!selectedPermissions.includes(p.token)) onToggle(p.token);
                  });
                }
              }}
              activeOpacity={0.7}
              className="flex-row items-center py-2.5 px-3 border-b border-slate-50"
            >
              <View
                className="w-5 h-5 rounded border-2 items-center justify-center mr-3"
                style={{
                  borderColor: allSelected ? BRAND : '#cbd5e1',
                  backgroundColor: allSelected ? BRAND : 'transparent',
                }}
              >
                {allSelected && (
                  <Check size={12} color="#ffffff" strokeWidth={3} />
                )}
              </View>
              <Text className="text-sm font-medium" style={{ color: BRAND }}>
                Select All
              </Text>
            </TouchableOpacity>
          )}

          {uniquePermissions.map((perm) => (
            <CheckBox
              key={perm._id}
              checked={selectedPermissions.includes(perm.token)}
              onPress={() => onToggle(perm.token)}
              label={perm.name.charAt(0).toUpperCase() + perm.name.slice(1)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const RoleModal = ({ visible, onClose, onSaved, editRole = null }) => {
  const isEditMode = !!editRole;

  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [saving, setSaving] = useState(false);
  const [permissionsDropdownOpen, setPermissionsDropdownOpen] = useState(false);

  // Permissions from API
  const [permissionCategories, setPermissionCategories] = useState({});
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [permissionsError, setPermissionsError] = useState('');

  // Loading role data for edit
  const [loadingRole, setLoadingRole] = useState(false);
  const [roleError, setRoleError] = useState('');

  // Reset form & fetch data on open
  useEffect(() => {
    if (visible) {
      setRoleName('');
      setSelectedPermissions([]);
      setExpandedCategories({});
      setSaving(false);
      setPermissionsDropdownOpen(false);
      setRoleError('');
      fetchPermissions();

      if (isEditMode) {
        fetchRoleData(editRole._id);
      }
    }
  }, [visible]);

  const fetchPermissions = async () => {
    setLoadingPermissions(true);
    setPermissionsError('');
    try {
      const result = await getPermissions();
      if (result.success) {
        setPermissionCategories(result.permissions);
      } else {
        setPermissionsError(result.message || 'Failed to load permissions');
      }
    } catch (err) {
      setPermissionsError(err.message);
    }
    setLoadingPermissions(false);
  };

  const fetchRoleData = async (roleId) => {
    setLoadingRole(true);
    setRoleError('');
    try {
      const result = await getRoleById(roleId);
      if (result.success && result.role) {
        setRoleName(result.role.name || '');
        setSelectedPermissions(result.role.permissions || []);
      } else {
        setRoleError(result.message || 'Failed to load role data');
      }
    } catch (err) {
      setRoleError(err.message);
    }
    setLoadingRole(false);
  };

  const togglePermission = (token) => {
    setSelectedPermissions((prev) =>
      prev.includes(token)
        ? prev.filter((p) => p !== token)
        : [...prev, token]
    );
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const allUniquePermissions = useMemo(() => {
    const seen = new Set();
    const result = [];
    Object.values(permissionCategories).forEach((perms) => {
      perms.forEach((p) => {
        if (!seen.has(p.token)) {
          seen.add(p.token);
          result.push(p);
        }
      });
    });
    return result;
  }, [permissionCategories]);

  const totalPermissions = allUniquePermissions.length;
  const categoryKeys = Object.keys(permissionCategories);

  const toggleSelectAll = () => {
    if (selectedPermissions.length === totalPermissions) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(allUniquePermissions.map((p) => p.token));
    }
  };

  const getPermissionLabel = (token) => {
    const perm = allUniquePermissions.find((p) => p.token === token);
    if (perm)
      return perm.name.charAt(0).toUpperCase() + perm.name.slice(1);
    return token;
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      Alert.alert('Validation', 'Please enter a role name.');
      return;
    }
    if (selectedPermissions.length === 0) {
      Alert.alert('Validation', 'Please select at least one permission.');
      return;
    }

    setSaving(true);
    try {
      let result;
      if (isEditMode) {
        result = await updateRole(editRole._id, {
          name: roleName.trim(),
          permissions: selectedPermissions,
        });
      } else {
        result = await createRole({
          name: roleName.trim(),
          permissions: selectedPermissions,
        });
      }

      if (result.success) {
        // Alert.alert(
        //   'Success',
        //   isEditMode
        //     ? `Role "${roleName.trim()}" updated successfully!`
        //     : `Role "${roleName.trim()}" created successfully!`
        // );
        onSaved(result.role, isEditMode);
        onClose();
      } else {
        Alert.alert('Error', result.message || 'Failed to save role.');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    }
    setSaving(false);
  };

  const isLoading = loadingPermissions || loadingRole;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="flex-1 bg-black/50 justify-center items-center px-5"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            style={{
              maxHeight: '85%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 20,
            }}
          >
            {/* Header */}
            <View
              className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100"
              style={{ backgroundColor: '#6e226e08' }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-9 h-9 rounded-lg items-center justify-center mr-3"
                  style={{
                    backgroundColor: isEditMode ? '#f59e0b20' : '#6e226e15',
                  }}
                >
                  {isEditMode ? (
                    <Pencil size={18} color="#f59e0b" />
                  ) : (
                    <Shield size={18} color={BRAND} />
                  )}
                </View>
                <View>
                  <Text
                    className="text-lg font-bold"
                    style={{ color: BRAND }}
                  >
                    {isEditMode ? 'Edit Role' : 'Create New Role'}
                  </Text>
                  {/* {isEditMode && editRole && (
                    <Text className="text-[10px] text-slate-400 mt-0.5">
                      ID: {editRole._id}
                    </Text>
                  )} */}
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

            {/* Loading role data overlay */}
            {loadingRole && (
              <View className="items-center justify-center py-12">
                <ActivityIndicator size="large" color={BRAND} />
                <Text className="text-slate-400 text-sm mt-3">
                  Loading role data...
                </Text>
              </View>
            )}

            {/* Role fetch error */}
            {!loadingRole && roleError ? (
              <View className="items-center justify-center py-12 px-6">
                <Text className="text-red-500 text-sm font-medium text-center mb-2">
                  Failed to load role
                </Text>
                <Text className="text-slate-400 text-xs text-center mb-4">
                  {roleError}
                </Text>
                <TouchableOpacity
                  onPress={() => fetchRoleData(editRole._id)}
                  activeOpacity={0.7}
                  className="px-5 py-2 rounded-lg"
                  style={{ backgroundColor: BRAND }}
                >
                  <Text className="text-white text-xs font-semibold">
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : !loadingRole ? (
              <>
                <ScrollView
                  className="px-5 py-4"
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled={true}
                >
                  {/* Role Name Input */}
                  <View className="mb-5">
                    <Text className="text-sm font-semibold text-slate-700 mb-2">
                      Role Name <Text className="text-red-400">*</Text>
                    </Text>
                    <TextInput
                      value={roleName}
                      onChangeText={setRoleName}
                      placeholder="Enter role name..."
                      placeholderTextColor="#94A3B8"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800"
                      style={{
                        borderColor: roleName.trim() ? BRAND : '#e2e8f0',
                      }}
                    />
                  </View>

                  {/* Permissions Section */}
                  <View className="mb-5">
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-sm font-semibold text-slate-700">
                        Permissions <Text className="text-red-400">*</Text>
                      </Text>
                      {!loadingPermissions && totalPermissions > 0 && (
                        <Text className="text-xs text-slate-400">
                          {selectedPermissions.length}/{totalPermissions}{' '}
                          selected
                        </Text>
                      )}
                    </View>

                    {/* Loading permissions */}
                    {loadingPermissions && (
                      <View className="items-center py-8">
                        <ActivityIndicator size="small" color={BRAND} />
                        <Text className="text-slate-400 text-xs mt-2">
                          Loading permissions...
                        </Text>
                      </View>
                    )}

                    {/* Permissions error */}
                    {!loadingPermissions && permissionsError && (
                      <View className="items-center py-6 bg-red-50 rounded-xl">
                        <Text className="text-red-400 text-sm mb-2">
                          Failed to load permissions
                        </Text>
                        <Text className="text-red-300 text-xs mb-3">
                          {permissionsError}
                        </Text>
                        <TouchableOpacity
                          onPress={fetchPermissions}
                          activeOpacity={0.7}
                          className="px-4 py-2 rounded-lg"
                          style={{ backgroundColor: BRAND }}
                        >
                          <Text className="text-white text-xs font-semibold">
                            Retry
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Permissions loaded */}
                    {!loadingPermissions &&
                      !permissionsError &&
                      totalPermissions > 0 && (
                        <>
                          {/* Dropdown Toggle */}
                          <TouchableOpacity
                            onPress={() =>
                              setPermissionsDropdownOpen(
                                !permissionsDropdownOpen
                              )
                            }
                            activeOpacity={0.7}
                            className="flex-row items-center justify-between bg-slate-50 border rounded-xl px-4 py-3 mb-3"
                            style={{
                              borderColor:
                                selectedPermissions.length > 0
                                  ? BRAND
                                  : '#e2e8f0',
                            }}
                          >
                            <View className="flex-row items-center flex-1">
                              <Shield size={16} color="#94A3B8" />
                              <Text className="text-sm text-slate-500 ml-2">
                                {selectedPermissions.length > 0
                                  ? `${selectedPermissions.length} permission${
                                      selectedPermissions.length !== 1
                                        ? 's'
                                        : ''
                                    } selected`
                                  : 'Select permissions...'}
                              </Text>
                            </View>
                            {permissionsDropdownOpen ? (
                              <ChevronUp size={18} color="#94A3B8" />
                            ) : (
                              <ChevronDown size={18} color="#94A3B8" />
                            )}
                          </TouchableOpacity>

                          {/* Expanded Permissions */}
                          {permissionsDropdownOpen && (
                            <View className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                              {/* Select All */}
                              <TouchableOpacity
                                onPress={toggleSelectAll}
                                activeOpacity={0.7}
                                className="flex-row items-center py-3 px-4 border-b border-slate-200"
                                style={{ backgroundColor: '#6e226e08' }}
                              >
                                <View
                                  className="w-5 h-5 rounded border-2 items-center justify-center mr-3"
                                  style={{
                                    borderColor:
                                      selectedPermissions.length ===
                                      totalPermissions
                                        ? BRAND
                                        : '#cbd5e1',
                                    backgroundColor:
                                      selectedPermissions.length ===
                                      totalPermissions
                                        ? BRAND
                                        : 'transparent',
                                  }}
                                >
                                  {selectedPermissions.length ===
                                    totalPermissions && (
                                    <Check
                                      size={12}
                                      color="#ffffff"
                                      strokeWidth={3}
                                    />
                                  )}
                                </View>
                                <Text
                                  className="text-sm font-bold"
                                  style={{ color: BRAND }}
                                >
                                  Select All Permissions
                                </Text>
                              </TouchableOpacity>

                              <ScrollView
                                className="p-2"
                                style={{ maxHeight: 350 }}
                                nestedScrollEnabled={true}
                                showsVerticalScrollIndicator={true}
                              >
                                {categoryKeys.map((catKey) => (
                                  <PermissionCategoryDropdown
                                    key={catKey}
                                    categoryKey={catKey}
                                    permissions={
                                      permissionCategories[catKey]
                                    }
                                    selectedPermissions={selectedPermissions}
                                    onToggle={togglePermission}
                                    expanded={
                                      expandedCategories[catKey] ?? false
                                    }
                                    onToggleExpand={() =>
                                      toggleCategory(catKey)
                                    }
                                  />
                                ))}
                              </ScrollView>
                            </View>
                          )}

                          {/* Selected Tags */}
                          {selectedPermissions.length > 0 &&
                            !permissionsDropdownOpen && (
                              <View className="flex-row flex-wrap gap-1.5 mt-1">
                                {selectedPermissions.map((token) => (
                                  <TouchableOpacity
                                    key={token}
                                    onPress={() => togglePermission(token)}
                                    activeOpacity={0.7}
                                    className="flex-row items-center px-2.5 py-1 rounded-lg"
                                    style={{ backgroundColor: '#6e226e15' }}
                                  >
                                    <Text
                                      className="text-[11px] font-medium mr-1"
                                      style={{ color: BRAND }}
                                    >
                                      {getPermissionLabel(token)}
                                    </Text>
                                    <X size={10} color={BRAND} />
                                  </TouchableOpacity>
                                ))}
                              </View>
                            )}
                        </>
                      )}
                  </View>
                </ScrollView>

                {/* Footer */}
                <View className="flex-row px-5 py-4 border-t border-slate-100 gap-3">
                  <TouchableOpacity
                    onPress={onClose}
                    activeOpacity={0.7}
                    className="flex-1 py-3 rounded-xl items-center border border-slate-200 bg-white"
                  >
                    <Text className="text-sm font-semibold text-slate-500">
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving || isLoading}
                    activeOpacity={0.7}
                    className="flex-1 py-3 rounded-xl items-center flex-row justify-center"
                    style={{
                      backgroundColor:
                        saving ||
                        isLoading ||
                        !roleName.trim() ||
                        selectedPermissions.length === 0
                          ? '#6e226e60'
                          : BRAND,
                    }}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        {isEditMode ? (
                          <Pencil
                            size={16}
                            color="#ffffff"
                            strokeWidth={2.5}
                          />
                        ) : (
                          <Plus
                            size={16}
                            color="#ffffff"
                            strokeWidth={2.5}
                          />
                        )}
                        <Text className="text-sm font-semibold text-white ml-1.5">
                          {isEditMode ? 'Update Role' : 'Create Role'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const DeleteRoleModal = ({ visible, role, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (visible) setDeleting(false);
  }, [visible]);

  const handleDelete = async () => {
    if (!role) return;
    setDeleting(true);
    try {
      const result = await deleteRole(role._id);
      if (result.success) {
        // Alert.alert('Success', `Role "${role.name}" deleted successfully!`);
        onDeleted(role._id);
        onClose();
      } else {
        Alert.alert('Error', result.message || 'Failed to delete role.');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    }
    setDeleting(false);
  };

  if (!role) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/50 justify-center items-center px-5"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          className="bg-white rounded-2xl w-full max-w-sm overflow-hidden"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          {/* Header */}
          <View className="items-center pt-6 pb-4 px-6">
            <View className="w-14 h-14 rounded-full bg-red-50 items-center justify-center mb-4">
              <Trash2 size={24} color="#EF4444" />
            </View>
            <Text className="text-lg font-bold text-slate-800 text-center">
              Delete Role
            </Text>
            <Text className="text-sm text-slate-400 text-center mt-2 px-2">
              Are you sure you want to delete{' '}
              <Text className="font-semibold text-slate-600">
                "{role.name}"
              </Text>
              ? This action cannot be undone.
            </Text>
          </View>

          {/* Role Info */}
          <View className="mx-6 mb-4 bg-red-50 rounded-xl p-3 flex-row items-center">
            <Shield size={16} color="#EF4444" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-slate-700">
                {role.name}
              </Text>
              <Text className="text-[10px] text-slate-400 mt-0.5">
                {role.permissions?.length || 0} permission
                {(role.permissions?.length || 0) !== 1 ? 's' : ''} •{' '}
                {role.created_by ? 'Custom role' : 'System role'}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View className="flex-row px-6 pb-6 gap-3">
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="flex-1 py-3 rounded-xl items-center border border-slate-200 bg-white"
            >
              <Text className="text-sm font-semibold text-slate-500">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleting}
              activeOpacity={0.7}
              className="flex-1 py-3 rounded-xl items-center flex-row justify-center"
              style={{
                backgroundColor: deleting ? '#ef444480' : '#EF4444',
              }}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Trash2 size={16} color="#ffffff" />
                  <Text className="text-sm font-semibold text-white ml-1.5">
                    Delete
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const RoleCard = ({ role, isActive, onEdit, onDelete, onPress }) => {
  const isSystem = !role.created_by;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="bg-white rounded-xl p-4 mb-3 border flex-row items-center justify-between"
      style={{ borderColor: isActive ? BRAND : '#e2e8f0' }}
    >
      <View className="flex-1 flex-row items-center">
        <View
          className="w-10 h-10 rounded-lg items-center justify-center mr-3"
          style={{ backgroundColor: isActive ? '#6e226e15' : '#f1f5f9' }}
        >
          <Shield size={18} color={isActive ? BRAND : '#94A3B8'} />
        </View>

        <View className="flex-1">
          <Text
            className="text-[15px] font-semibold"
            style={{ color: isActive ? BRAND : '#1e293b' }}
          >
            {role.name}
          </Text>
          {isSystem ? (
            <Text className="text-[10px] text-slate-400 mt-0.5">
              System role
            </Text>
          ) : (
            <Text className="text-[10px] text-slate-400 mt-0.5">
              Custom role
            </Text>
          )}
        </View>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => onEdit(role)}
          activeOpacity={0.7}
          className="w-9 h-9 rounded-lg items-center justify-center"
          style={{ backgroundColor: isActive ? '#6e226e15' : '#f1f5f9' }}
        >
          <Pencil size={16} color={isActive ? BRAND : '#64748B'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDelete(role)}
          activeOpacity={0.7}
          className="w-9 h-9 rounded-lg items-center justify-center"
          style={{ backgroundColor: isActive ? '#fef2f2' : '#f1f5f9' }}
        >
          <Trash2 size={16} color={isActive ? '#EF4444' : '#64748B'} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};


const RolesManagementScreen = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLargeScreen = width >= 1024;
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCount, setShowCount] = useState('10');
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingRole, setDeletingRole] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getRoles();
      if (result.success) {
        setRoles(result.roles);
        if (result.roles.length > 0 && !selectedRoleId) {
          setSelectedRoleId(result.roles[0]._id);
        }
      } else {
        setError(result.message || 'Failed to load roles');
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const filteredRoles = useMemo(() => {
    let result = roles;

    if (searchInput.trim()) {
      const q = searchInput.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(q));
    }

    const limit = parseInt(showCount, 10);
    if (limit && result.length > limit) {
      result = result.slice(0, limit);
    }

    return result;
  }, [roles, searchInput, showCount]);

  const handleAddRole = () => {
    setEditingRole(null);
    setRoleModalVisible(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleModalVisible(true);
  };

  const handleDeleteRole = (role) => {
    setDeletingRole(role);
    setDeleteModalVisible(true);
  };

  const handleRoleSaved = (savedRole, isEdit) => {
    if (isEdit) {
      setRoles((prev) =>
        prev.map((r) => (r._id === savedRole._id ? { ...r, ...savedRole } : r))
      );
    } else {
      setRoles((prev) => [savedRole, ...prev]);
      setSelectedRoleId(savedRole._id);
    }
  };

  const handleRoleDeleted = (deletedRoleId) => {
    setRoles((prev) => prev.filter((r) => r._id !== deletedRoleId));
    if (selectedRoleId === deletedRoleId) {
      setSelectedRoleId(null);
    }
  };

  const handleRolePress = (role) => {
    setSelectedRoleId(role._id);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View className={`flex-1 ${isLargeScreen ? 'items-center' : ''}`}>
        <View
          className={`flex-1 bg-white ${
            isLargeScreen ? 'max-w-lg w-full shadow-xl' : 'w-full'
          }`}
        >
          {isTablet && (
            <View className="items-center py-4 bg-slate-50">
              <Text
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: BRAND }}
              >
                Roles Management
              </Text>
            </View>
          )}

          <Header />

          <ScrollView
            className="flex-1 bg-slate-50"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: isTablet ? 24 : 20,
              paddingTop: 20,
              paddingBottom: 100,
            }}
          >
            <View className="flex-row justify-between items-center mb-5">
              <View className="flex-row items-center flex-1">
                <TouchableOpacity
                  onPress={() => router.back()}
                  activeOpacity={0.7}
                  className="p-1 -ml-1 mr-3"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ArrowLeft size={24} color="#64748B" strokeWidth={2} />
                </TouchableOpacity>
                <View>
                  <Text className="text-xl font-semibold text-slate-800">
                    Roles
                  </Text>
                  {!loading && roles.length > 0 && (
                    <Text className="text-xs text-slate-400 mt-0.5">
                      {roles.length} role{roles.length !== 1 ? 's' : ''}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={handleAddRole}
                activeOpacity={0.7}
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: BRAND }}
              >
                <Plus size={20} color="#ffffff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center bg-white rounded-lg px-3 py-2 mb-4 border border-slate-200">
              <Search size={18} color="#94A3B8" />
              <TextInput
                value={searchInput}
                onChangeText={setSearchInput}
                placeholder="Search roles..."
                placeholderTextColor="#94A3B8"
                className="flex-1 ml-2 text-sm text-slate-800"
              />
            </View>

            {loading && (
              <View className="items-center justify-center py-20">
                <ActivityIndicator size="large" color={BRAND} />
                <Text className="text-slate-500 text-sm mt-3">
                  Loading roles...
                </Text>
              </View>
            )}

            {!loading && error && roles.length === 0 && (
              <View className="items-center justify-center py-20 px-6">
                <Text className="text-red-500 text-base font-medium text-center mb-2">
                  Failed to load roles
                </Text>
                <Text className="text-slate-400 text-sm text-center mb-4">
                  {error}
                </Text>
                <TouchableOpacity
                  onPress={fetchRoles}
                  activeOpacity={0.7}
                  className="px-6 py-2.5 rounded-lg"
                  style={{ backgroundColor: BRAND }}
                >
                  <Text className="text-white text-sm font-semibold">
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading &&
              filteredRoles.map((role) => (
                <RoleCard
                  key={role._id}
                  role={role}
                  isActive={selectedRoleId === role._id}
                  onEdit={handleEditRole}
                  onDelete={handleDeleteRole}
                  onPress={() => handleRolePress(role)}
                />
              ))}

            {!loading &&
              !error &&
              filteredRoles.length === 0 &&
              roles.length > 0 && (
                <View className="items-center justify-center py-16">
                  <Text className="text-4xl mb-4">🔍</Text>
                  <Text className="text-slate-400 text-base">
                    No roles match your search
                  </Text>
                </View>
              )}

            {!loading && !error && roles.length === 0 && (
              <View className="items-center justify-center py-20">
                <Text className="text-4xl mb-4">🛡️</Text>
                <Text className="text-slate-400 text-base">
                  No roles found
                </Text>
                <Text className="text-slate-400 text-sm mt-1 text-center px-8">
                  Create roles to manage team permissions
                </Text>
              </View>
            )}

            {!loading &&
              filteredRoles.length > 0 &&
              filteredRoles.length < roles.length && (
                <View
                  className="rounded-lg p-3 mt-2 flex-row items-center"
                  style={{ backgroundColor: '#6e226e08' }}
                >
                  <Text className="text-xs text-slate-400">
                    Showing {filteredRoles.length} of {roles.length} roles
                  </Text>
                </View>
              )}
          </ScrollView>
        </View>
      </View>

      <RoleModal
        visible={roleModalVisible}
        onClose={() => {
          setRoleModalVisible(false);
          setEditingRole(null);
        }}
        onSaved={handleRoleSaved}
        editRole={editingRole}
      />

      <DeleteRoleModal
        visible={deleteModalVisible}
        role={deletingRole}
        onClose={() => {
          setDeleteModalVisible(false);
          setDeletingRole(null);
        }}
        onDeleted={handleRoleDeleted}
      />
    </SafeAreaView>
  );
};

export default RolesManagementScreen;