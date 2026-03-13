import React from 'react';
import { TouchableOpacity } from 'react-native';

const IconButton = ({ icon: Icon, color = '#64748B', bgColor = 'bg-slate-100', onPress, disabled = false, style = {} }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    disabled={disabled}
    className={`w-7 h-7 rounded-lg ${bgColor} items-center justify-center`}
    style={[disabled ? { opacity: 0.5 } : {}, style]}
  >
    <Icon size={15} color={color} />
  </TouchableOpacity>
);

export default IconButton;