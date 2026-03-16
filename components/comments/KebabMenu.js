import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { MoreVertical } from 'lucide-react-native';

const getMenuItems = (platform) => {
  if (platform === 'instagram') {
    return [
      { key: 'view_history', label: 'View History' },
      { key: 'user_comments', label: 'User Comments' },
      { key: 'view_post', label: 'View Post' },
      { key: 'comment_thread', label: 'Comment Thread' },
    ];
  }

  return [
    { key: 'view_history', label: 'View History' },
    { key: 'view_platform', label: 'View On Facebook' },
    { key: 'comment_thread', label: 'Comment Thread' },
    { key: 'user_comments', label: 'User Comments' },
    { key: 'view_post', label: 'View Post' },
    { key: 'block', label: 'Block', danger: true },
  ];
};

const KebabMenu = ({ onSelect, disabled = false, platform = 'facebook' }) => {
  const [visible, setVisible] = useState(false);
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  const menuItems = getMenuItems(platform);

  const handleOpen = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setButtonPos({ x: x - 130, y: y + height + 4 });
      setVisible(true);
    });
  };

  const handleSelect = (key) => {
    setVisible(false);
    onSelect?.(key);
  };

  return (
    <View>
      <TouchableOpacity
        ref={buttonRef}
        onPress={handleOpen}
        disabled={disabled}
        activeOpacity={0.7}
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <MoreVertical size={18} color="#64748B" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable
          style={{ flex: 1 }}
          onPress={() => setVisible(false)}
        >
          <View
            style={{
              position: 'absolute',
              top: buttonPos.y,
              left: buttonPos.x,
              backgroundColor: '#fff',
              borderRadius: 12,
              paddingVertical: 6,
              minWidth: 180,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => handleSelect(item.key)}
                activeOpacity={0.7}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                  borderBottomColor: '#F1F5F9',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: item.danger ? '#DC2626' : '#334155',
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default KebabMenu;