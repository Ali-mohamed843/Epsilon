import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const BRAND = '#6e226e';

const FilterButton = ({ title, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`px-4 py-2 rounded-lg mr-2 border ${isActive ? 'border-0' : 'bg-white border-slate-200'}`}
    style={isActive ? { backgroundColor: BRAND, borderColor: BRAND } : {}}
  >
    <Text className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-500'}`}>
      {title}
    </Text>
  </TouchableOpacity>
);

export default FilterButton;