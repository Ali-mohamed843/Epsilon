import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { X } from 'lucide-react-native';

const BRAND = '#6e226e';

const getActionColor = (action) => {
  switch (action) {
    case 'reaction': return '#22C55E';
    case 'remove reaction': return '#EF4444';
    case 'hide': return '#F59E0B';
    case 'unhide': return '#22C55E';
    case 'reply': return BRAND;
    case 'assign': return '#3B82F6';
    case 'done': return '#22C55E';
    default: return '#64748B';
  }
};

const getActionBg = (action) => {
  switch (action) {
    case 'reaction': return '#F0FDF4';
    case 'remove reaction': return '#FEF2F2';
    case 'hide': return '#FFFBEB';
    case 'unhide': return '#F0FDF4';
    case 'reply': return '#F5F3FF';
    case 'assign': return '#EFF6FF';
    case 'done': return '#F0FDF4';
    default: return '#F8FAFC';
  }
};

const formatActionLabel = (item) => {
  if (item.action === 'reaction' && item.reaction_type) {
    return `${item.action} (${item.reaction_type})`;
  }
  return item.action;
};

const ActionRow = ({ item, index }) => {
  const color = getActionColor(item.action);
  const bg = getActionBg(item.action);
  const time = item.date_response ? new Date(item.date_response).toLocaleString() : '';

  return (
    <View
      className="flex-row items-center px-4 py-3 border-b border-slate-100"
      style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#FAFAFA' }}
    >
      <View
        className="px-2.5 py-1 rounded-md mr-3"
        style={{ backgroundColor: bg }}
      >
        <Text
          className="text-xs font-semibold capitalize"
          style={{ color }}
        >
          {formatActionLabel(item)}
        </Text>
      </View>
      <View className="flex-1 items-end">
        <Text className="text-xs text-slate-500">{time}</Text>
        {item.source && (
          <Text className="text-[10px] text-slate-400 capitalize mt-0.5">{item.source}</Text>
        )}
        {item.by && (
          <Text className="text-[10px] text-slate-400 mt-0.5">{item.by}</Text>
        )}
      </View>
    </View>
  );
};

const buildHistory = (comment, platform) => {
  const history = [];

  const pageActions = comment?.page_actions ?? [];
  pageActions.forEach((a) => {
    history.push({
      action: a.action,
      reaction_type: a.reaction_type,
      date_response: a.date_response,
      source: a.source,
    });
  });

  const agentResponses = comment?.agents_responses ?? [];
  agentResponses.forEach((a) => {
    history.push({
      action: 'reply',
      date_response: a.date_response ?? a.created_at,
      by: a.agent_name ?? a.name ?? 'Agent',
      source: platform,
    });
  });

  if (comment?.assigned_at && comment?.assigned_to) {
    history.push({
      action: 'assign',
      date_response: comment.assigned_at,
      by: comment.assigned_to?.name ?? 'Admin',
      source: platform,
    });
  }

  if (comment?.done_at && comment?.is_done) {
    history.push({
      action: 'done',
      date_response: comment.done_at,
      source: platform,
    });
  }

  if (platform === 'instagram' && comment?.hidden === true && history.every(h => h.action !== 'hide')) {
    history.push({
      action: 'hide',
      date_response: comment.updated_at ?? comment.created_at,
      source: 'instagram',
    });
  }

  history.sort((a, b) => {
    const da = a.date_response ? new Date(a.date_response).getTime() : 0;
    const db = b.date_response ? new Date(b.date_response).getTime() : 0;
    return da - db;
  });

  return history;
};

const HistoryModal = ({ visible, onClose, comment, platform = 'facebook' }) => {
  const name = comment?.from?.name ?? 'Unknown';
  const history = comment ? buildHistory(comment, platform) : [];

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <View
          className="bg-white rounded-2xl w-[90%]"
          style={{ maxHeight: '70%', overflow: 'hidden' }}
        >
          <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100">
            <View>
              <Text className="text-base font-bold text-slate-800">Action History</Text>
              <Text className="text-xs text-slate-500">{name}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {history.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-slate-400 text-sm">No actions recorded</Text>
            </View>
          ) : (
            <FlatList
              data={history}
              keyExtractor={(item, index) => `${item.action}-${item.date_response}-${index}`}
              renderItem={({ item, index }) => <ActionRow item={item} index={index} />}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default HistoryModal;