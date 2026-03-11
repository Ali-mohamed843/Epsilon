import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { getPageRecommendations } from '@/Api/api';

const BRAND_COLOR = '#6e226e';

const getIconForName = (name) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('time') || lower.includes('posting time')) return '⏰';
  if (lower.includes('performance') || lower.includes('content')) return '📈';
  if (lower.includes('sentiment') || lower.includes('comment')) return '💬';
  if (lower.includes('consistency') || lower.includes('frequency')) return '🏆';
  if (lower.includes('engagement') || lower.includes('audience')) return '🎯';
  if (lower.includes('visual') || lower.includes('image') || lower.includes('photo')) return '✨';
  if (lower.includes('mix') || lower.includes('balance') || lower.includes('distribution')) return '📊';
  if (lower.includes('video')) return '🎬';
  if (lower.includes('hashtag') || lower.includes('tag')) return '#️⃣';
  if (lower.includes('reach') || lower.includes('growth')) return '🚀';
  if (lower.includes('trend') || lower.includes('topic')) return '🔥';
  return '💡';
};

const colorPalettes = [
  {
    cardBg: '#6e226e10',
    iconBg: '#6e226e20',
    titleColor: BRAND_COLOR,
    borderColor: '#6e226e30',
  },
  {
    cardBg: '#f5f3ff',
    iconBg: '#6e226e18',
    titleColor: '#4a1a4a',
    borderColor: '#6e226e25',
  },
  {
    cardBg: '#fdf4ff',
    iconBg: '#6e226e15',
    titleColor: '#5c1d5c',
    borderColor: '#6e226e20',
  },
  {
    cardBg: '#6e226e08',
    iconBg: '#6e226e22',
    titleColor: BRAND_COLOR,
    borderColor: '#6e226e28',
  },
  {
    cardBg: '#faf5fa',
    iconBg: '#6e226e1a',
    titleColor: '#3d123d',
    borderColor: '#6e226e22',
  },
];

const RecommendationCard = ({ name, recommendation, index }) => {
  const icon = getIconForName(name);
  const palette = colorPalettes[index % colorPalettes.length];

  const descriptionText =
    typeof recommendation === 'string'
      ? recommendation
      : recommendation?.recommendation || recommendation?.text || '';

  return (
    <View
      className="rounded-xl p-4 mb-4"
      style={{
        backgroundColor: palette.cardBg,
        borderWidth: 1,
        borderColor: palette.borderColor,
      }}
    >
      <View className="flex-row">
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mr-4"
          style={{ backgroundColor: palette.iconBg }}
        >
          <Text className="text-2xl">{icon}</Text>
        </View>

        <View className="flex-1">
          <Text
            className="text-base font-semibold mb-2"
            style={{ color: palette.titleColor }}
          >
            {name}
          </Text>
          {descriptionText ? (
            <Text className="text-sm text-slate-600 leading-5">
              {descriptionText}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const RecommendationsTab = ({ pageId, pageName, platform = 'facebook' }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, [pageId, platform]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getPageRecommendations(pageId, platform);
      console.log('getPageRecommendations result:', result.success, 'count:', result.recommendations?.length);

      if (result.success) {
        const sorted = (result.recommendations || []).sort(
          (a, b) => (a.order ?? 999) - (b.order ?? 999)
        );
        setRecommendations(sorted);
      } else {
        setError(result.message || 'Failed to load recommendations');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color={BRAND_COLOR} />
        <Text className="text-slate-500 text-sm mt-3">Loading recommendations...</Text>
      </View>
    );
  }

  if (error && recommendations.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-6">
        <Text className="text-red-500 text-base font-medium text-center mb-2">
          Failed to load recommendations
        </Text>
        <Text className="text-slate-400 text-sm text-center mb-4">{error}</Text>
        <TouchableOpacity
          onPress={fetchRecommendations}
          activeOpacity={0.7}
          className="px-6 py-2.5 rounded-lg"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          <Text className="text-white text-sm font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {recommendations.map((rec, index) => (
        <RecommendationCard
          key={rec._id || rec.id || index}
          name={rec.name}
          recommendation={rec.recommendation}
          index={index}
        />
      ))}

      {recommendations.length === 0 && (
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-4xl mb-4">🔍</Text>
          <Text className="text-slate-400 text-base">No recommendations yet</Text>
          <Text className="text-slate-400 text-sm mt-1 text-center px-8">
            Keep posting content to receive AI-powered recommendations
          </Text>
        </View>
      )}
    </View>
  );
};

export default RecommendationsTab;