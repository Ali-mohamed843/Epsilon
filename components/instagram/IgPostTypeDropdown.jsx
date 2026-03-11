import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown, ImageIcon, BookOpen, Video, LayoutGrid } from 'lucide-react-native';

const TYPES = [
  { value: 'post',     label: 'Post',     icon: ImageIcon  },
  { value: 'story',    label: 'Story',    icon: BookOpen   },
  { value: 'reel',     label: 'Reel',     icon: Video      },
  { value: 'carousel', label: 'Carousel', icon: LayoutGrid },
];

const BRAND = '#6e226e';

const IgPostTypeDropdown = ({ selectedType, onSelect }) => {
  const [open, setOpen] = useState(false);
  const selected = TYPES.find(t => t.value === selectedType) || TYPES[0];
  const SelectedIcon = selected.icon;

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-slate-700 mb-1.5">Post Type</Text>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
        className="flex-row items-center justify-between border border-slate-300 rounded-lg px-3 py-3 bg-white"
      >
        <View className="flex-row items-center">
          <SelectedIcon size={18} color={BRAND} />
          <Text className="text-sm text-slate-800 ml-2">{selected.label}</Text>
        </View>
        <ChevronDown size={18} color="#64748B" />
      </TouchableOpacity>

      {open && (
        <View className="border border-slate-200 rounded-lg mt-1 bg-white overflow-hidden">
          {TYPES.map(type => {
            const Icon = type.icon;
            const isActive = type.value === selectedType;
            return (
              <TouchableOpacity
                key={type.value}
                onPress={() => { onSelect(type.value); setOpen(false); }}
                activeOpacity={0.7}
                className="flex-row items-center px-3 py-3 border-b border-slate-100"
                style={isActive ? { backgroundColor: '#6e226e10' } : {}}
              >
                <Icon size={18} color={isActive ? BRAND : '#64748B'} />
                <Text className="text-sm ml-2" style={{ color: isActive ? BRAND : '#334155', fontWeight: isActive ? '600' : '400' }}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default IgPostTypeDropdown;