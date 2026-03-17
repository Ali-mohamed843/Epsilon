import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { AlertTriangle, Trash2, CheckCircle, X } from 'lucide-react-native';

const BRAND = '#6e226e';

const ICONS = {
  delete: { icon: Trash2, color: '#EF4444', bg: '#FEF2F2' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: '#FFFBEB' },
  success: { icon: CheckCircle, color: '#22C55E', bg: '#F0FDF4' },
  confirm: { icon: AlertTriangle, color: BRAND, bg: '#F5F3FF' },
};

const ConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'confirm',
  loading = false,
}) => {
  const config = ICONS[type] || ICONS.confirm;
  const IconComponent = config.icon;
  const isDestructive = type === 'delete';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center px-5">
        <View
          className="bg-white rounded-2xl w-full max-w-sm"
          style={{ overflow: 'hidden' }}
        >
          <View className="items-center pt-6 pb-4 px-6">
            <View
              className="w-14 h-14 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: config.bg }}
            >
              <IconComponent size={24} color={config.color} />
            </View>
            <Text className="text-lg font-bold text-slate-800 text-center">{title}</Text>
            <Text className="text-sm text-slate-400 text-center mt-2 px-2">{message}</Text>
          </View>

          <View className="flex-row px-6 pb-6 gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.7}
              className="flex-1 py-3 rounded-xl items-center border border-slate-200 bg-white"
            >
              <Text className="text-sm font-semibold text-slate-500">{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.7}
              className="flex-1 py-3 rounded-xl items-center flex-row justify-center"
              style={{
                backgroundColor: loading
                  ? (isDestructive ? '#ef444480' : `${BRAND}80`)
                  : (isDestructive ? '#EF4444' : BRAND),
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-sm font-semibold text-white">{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;