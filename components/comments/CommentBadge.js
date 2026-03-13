import React from 'react';
import { View, Text } from 'react-native';

const BRAND = '#6e226e';

const CommentBadge = ({ type }) => {
  const isReply = type === 'reply';
  return (
    <View className={`px-2.5 py-1 rounded-md ${isReply ? 'bg-purple-100' : 'bg-pink-100'}`}>
      <Text
        className={`text-xs font-medium capitalize ${isReply ? 'text-purple-700' : 'text-pink-700'}`}
        style={!isReply ? { color: BRAND } : {}}
      >
        {type ?? 'direct'}
      </Text>
    </View>
  );
};

export default CommentBadge;