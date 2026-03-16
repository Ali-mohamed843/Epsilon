import React from 'react';
import { TouchableOpacity } from 'react-native';

const IconButton = ({ icon: Icon, color = '#64748B', bgColor = 'bg-slate-100', onPress, disabled = false, style = {}, size = 18, buttonSize = 9 }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    disabled={disabled}
    className={`rounded-lg ${bgColor} items-center justify-center`}
    style={[
      { width: buttonSize * 4, height: buttonSize * 4 },
      disabled ? { opacity: 0.5 } : {},
      style,
    ]}
  >
    <Icon size={size} color={color} />
  </TouchableOpacity>
);

export default IconButton;