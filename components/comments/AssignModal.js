import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { Search, X, Check } from 'lucide-react-native';
import { getAssignTeam, assignCommentToUser } from '@/Api/api';

const BRAND = '#6e226e';

const UserRow = ({ user, isSelected, onToggle }) => (
  <TouchableOpacity
    onPress={onToggle}
    activeOpacity={0.7}
    className="flex-row items-center py-3 px-4 border-b border-slate-100"
  >
    <View className="flex-1">
      <Text className="text-sm font-semibold text-slate-800">{user.name}</Text>
      <Text className="text-xs text-slate-500">{user.role?.name ?? 'No Role'}</Text>
    </View>
    <View
      className="w-6 h-6 rounded border-2 items-center justify-center ml-3"
      style={{
        borderColor: isSelected ? BRAND : '#CBD5E1',
        backgroundColor: isSelected ? BRAND : 'transparent',
      }}
    >
      {isSelected && <Check size={14} color="#fff" />}
    </View>
  </TouchableOpacity>
);

const AssignModal = ({ visible, onClose, commentId, assignedTo, platform = 'facebook' }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const fetchUsers = useCallback(async (search = '') => {
    setLoading(true);
    const result = await getAssignTeam({ search });
    setLoading(false);
    if (result.success) {
      setUsers(result.users);
    } else {
      Alert.alert('Error', result.message);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setSearchInput('');
      setSearchQuery('');
      setInitialLoaded(false);
      setSelectedUserId(assignedTo?._id ?? null);
      fetchUsers('');
      setInitialLoaded(true);
    }
  }, [visible]);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (visible && initialLoaded) fetchUsers(searchQuery);
  }, [searchQuery]);

  const handleAssign = async () => {
    if (!selectedUserId) {
      Alert.alert('Select User', 'Please select a team member to assign.');
      return;
    }
    setAssigning(true);
    const result = await assignCommentToUser({
      userId: selectedUserId,
      commentIds: [commentId],
      platform,
    });
    setAssigning(false);
    if (result.success) {
      const selectedUser = users.find(u => u._id === selectedUserId);
      Alert.alert('Success', 'Comment assigned successfully.');
      onClose(true, selectedUser);
    } else {
      Alert.alert('Failed', result.message);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <View
          className="bg-white rounded-2xl w-[90%]"
          style={{ maxHeight: '70%' }}
        >
          <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
            <Text className="text-lg font-bold text-slate-800">Assign Comment</Text>
            <TouchableOpacity
              onPress={() => onClose(false, null)}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center bg-slate-50 rounded-lg px-3 py-2 mx-4 mb-3 border border-slate-200">
            <Search size={18} color="#94A3B8" />
            <TextInput
              value={searchInput}
              onChangeText={setSearchInput}
              placeholder="Search team members..."
              placeholderTextColor="#94A3B8"
              className="flex-1 ml-2 text-sm text-slate-800"
            />
          </View>

          {loading ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color={BRAND} />
            </View>
          ) : users.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-slate-400 text-sm">No team members found</Text>
            </View>
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <UserRow
                  user={item}
                  isSelected={selectedUserId === item._id}
                  onToggle={() =>
                    setSelectedUserId((prev) => (prev === item._id ? null : item._id))
                  }
                />
              )}
              style={{ maxHeight: 300 }}
            />
          )}

          <View className="px-4 pt-3 pb-4">
            <TouchableOpacity
              onPress={handleAssign}
              disabled={!selectedUserId || assigning}
              activeOpacity={0.8}
              className="py-3 rounded-xl items-center"
              style={{
                backgroundColor: selectedUserId ? BRAND : '#CBD5E1',
              }}
            >
              {assigning ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white text-sm font-semibold">Assign</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AssignModal;