import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Eye, X, ExternalLink, Users, FileText, Zap, TrendingUp, BarChart3, MessageSquare, Share2, ThumbsUp } from 'lucide-react-native';
import { getCompetitorsData, getCompetitorsTopPosts } from '@/Api/api';

const BRAND = '#6e226e';
const DEFAULT_COLORS = ['#EF4444', '#F59E0B', '#8B5CF6', '#10B981', '#3B82F6', '#EC4899', '#14B8A6', '#F97316'];
const CIRCUMFERENCE = 2 * Math.PI * 35;

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(Math.round(num));
};

const formatNumberFull = (num) => {
  if (num === null || num === undefined) return '0';
  return Math.round(num).toLocaleString();
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const getColor = (competitor, index) =>
  competitor.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];

const getPictureUrl = (pic) => {
  if (!pic) return null;
  if (typeof pic === 'string') return pic;
  return pic.url ?? null;
};

const buildDonutSegments = (items) => {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (total === 0) return [];
  let offset = 0;
  return items.map((item) => {
    const dash = (item.value / total) * CIRCUMFERENCE;
    const seg = { ...item, dashArray: dash, offset: -offset };
    offset += dash;
    return seg;
  });
};

const hasDataForKey = (competitors, key) =>
  competitors.some((c) => {
    const val = c[key];
    return val !== null && val !== undefined && val !== 0;
  });

const hasDataForAnyKey = (competitors, keys) =>
  keys.some((key) => hasDataForKey(competitors, key));

const InsightCard = ({ title, children }) => (
  <View className="bg-white rounded-xl p-4 mb-4 border border-slate-200">
    {title && <Text className="text-base font-semibold text-slate-800 mb-4">{title}</Text>}
    {children}
  </View>
);

const CompetitorDetailModal = ({ visible, competitor, index, onClose }) => {
  const [imgErr, setImgErr] = useState(false);

  if (!competitor) return null;

  const color = getColor(competitor, index);
  const picUrl = getPictureUrl(competitor.picture);
  const followers = competitor.followers_count ?? competitor.fan_count ?? 0;

  const statItems = [];

  if (followers) {
    statItems.push({
      icon: Users,
      label: 'Followers',
      value: formatNumberFull(followers),
      shortValue: formatNumber(followers),
      color: '#3B82F6',
      bg: '#EFF6FF',
    });
  }

  if (competitor.published_posts_count) {
    statItems.push({
      icon: FileText,
      label: 'Published Posts',
      value: formatNumberFull(competitor.published_posts_count),
      shortValue: formatNumber(competitor.published_posts_count),
      color: '#8B5CF6',
      bg: '#F5F3FF',
    });
  }

  if (competitor.overall_interactions) {
    statItems.push({
      icon: Zap,
      label: 'Overall Interactions',
      value: formatNumberFull(competitor.overall_interactions),
      shortValue: formatNumber(competitor.overall_interactions),
      color: '#EF4444',
      bg: '#FEF2F2',
    });
  }

  if (competitor.overall_reach) {
    statItems.push({
      icon: Eye,
      label: 'Overall Reach',
      value: formatNumberFull(competitor.overall_reach),
      shortValue: formatNumber(competitor.overall_reach),
      color: '#10B981',
      bg: '#ECFDF5',
    });
  }

  if (competitor.avgInteractionsPerPost) {
    statItems.push({
      icon: BarChart3,
      label: 'Avg Interactions / Post',
      value: formatNumberFull(competitor.avgInteractionsPerPost),
      shortValue: formatNumber(competitor.avgInteractionsPerPost),
      color: '#F59E0B',
      bg: '#FFFBEB',
    });
  }

  if (competitor.engagementRatePer1KFan) {
    statItems.push({
      icon: TrendingUp,
      label: 'Engagement Rate / 1K Fan',
      value: `${Number(competitor.engagementRatePer1KFan).toFixed(2)}%`,
      shortValue: `${Number(competitor.engagementRatePer1KFan).toFixed(2)}%`,
      color: '#EC4899',
      bg: '#FDF2F8',
    });
  }

  if (competitor.engagementRatePerPost) {
    statItems.push({
      icon: TrendingUp,
      label: 'Engagement Rate / Post',
      value: `${Number(competitor.engagementRatePerPost).toFixed(2)}%`,
      shortValue: `${Number(competitor.engagementRatePerPost).toFixed(2)}%`,
      color: '#14B8A6',
      bg: '#F0FDFA',
    });
  }

  if (competitor.reactions) {
    statItems.push({
      icon: ThumbsUp,
      label: 'Reactions',
      value: formatNumberFull(competitor.reactions),
      shortValue: formatNumber(competitor.reactions),
      color: '#3B82F6',
      bg: '#EFF6FF',
    });
  }

  if (competitor.comments) {
    statItems.push({
      icon: MessageSquare,
      label: 'Comments',
      value: formatNumberFull(competitor.comments),
      shortValue: formatNumber(competitor.comments),
      color: '#F59E0B',
      bg: '#FFFBEB',
    });
  }

  if (competitor.shares) {
    statItems.push({
      icon: Share2,
      label: 'Shares',
      value: formatNumberFull(competitor.shares),
      shortValue: formatNumber(competitor.shares),
      color: '#10B981',
      bg: '#ECFDF5',
    });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center px-4"
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          className="bg-white rounded-2xl w-full overflow-hidden"
          style={{
            maxWidth: 420,
            maxHeight: '85%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          <View
            className="px-5 py-4 border-b border-slate-100"
            style={{ backgroundColor: '#6e226e08' }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-14 h-14 rounded-2xl bg-slate-100 items-center justify-center mr-4 overflow-hidden">
                  {picUrl && !imgErr ? (
                    <Image
                      source={{ uri: picUrl }}
                      style={{ width: 56, height: 56 }}
                      resizeMode="cover"
                      onError={() => setImgErr(true)}
                    />
                  ) : (
                    <View
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: color }}
                    />
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    className="text-lg font-bold text-slate-800"
                    numberOfLines={1}
                  >
                    {competitor.name}
                  </Text>
                  {competitor.category && (
                    <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>
                      {competitor.category}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                className="w-8 h-8 rounded-lg items-center justify-center bg-slate-100"
              >
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {statItems.length > 0 && (
              <View className="px-5 pt-4">
                {/* <Text className="text-sm font-semibold text-slate-700 mb-3">
                  Statistics
                </Text> */}
                <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                  {statItems.map((stat, i) => {
                    const IconComp = stat.icon;
                    return (
                      <View
                        key={i}
                        className="rounded-xl p-3 mb-2"
                        style={{
                          backgroundColor: stat.bg,
                          width: '48%',
                          marginHorizontal: '1%',
                        }}
                      >
                        <View className="flex-row items-center mb-2">
                          <View
                            className="w-7 h-7 rounded-lg items-center justify-center mr-2"
                            style={{ backgroundColor: `${stat.color}20` }}
                          >
                            <IconComp size={14} color={stat.color} />
                          </View>
                          <Text
                            className="text-[11px] text-slate-500 font-medium flex-1"
                            numberOfLines={1}
                          >
                            {stat.label}
                          </Text>
                        </View>
                        <Text
                          className="text-lg font-bold text-slate-800"
                          numberOfLines={1}
                        >
                          {stat.shortValue}
                        </Text>
                        <Text className="text-[10px] text-slate-400 mt-0.5">
                          {stat.value}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {statItems.length === 0 && (
              <View className="px-5 pt-6 pb-2 items-center">
                <Text className="text-slate-400 text-sm">
                  No detailed statistics available
                </Text>
              </View>
            )}

            {competitor.link && (
              <View className="px-5 pt-4">
                <TouchableOpacity
                  onPress={() => Linking.openURL(competitor.link).catch(() => {})}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-center py-3 rounded-xl border"
                  style={{ borderColor: '#6e226e30', backgroundColor: '#6e226e08' }}
                >
                  <ExternalLink size={16} color={BRAND} />
                  <Text
                    className="text-sm font-semibold ml-2"
                    style={{ color: BRAND }}
                  >
                    Visit Page
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <View className="px-5 py-4 border-t border-slate-100">
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="w-full py-3 rounded-xl items-center border border-slate-200 bg-white"
            >
              <Text className="text-sm font-semibold text-slate-500">Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};


const CompetitorListItem = ({ competitor, index, onPress }) => {
  const [imgErr, setImgErr] = useState(false);
  const color = getColor(competitor, index);
  const picUrl = getPictureUrl(competitor.picture);

  const stats = [];
  if (competitor.followers_count || competitor.fan_count) {
    stats.push(`👥 ${formatNumber(competitor.followers_count ?? competitor.fan_count)}`);
  }
  if (competitor.published_posts_count) {
    stats.push(`📝 ${formatNumber(competitor.published_posts_count)} posts`);
  }
  if (competitor.overall_interactions) {
    stats.push(`🔥 ${formatNumber(competitor.overall_interactions)} interactions`);
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center py-3 border-b border-slate-100"
    >
      <View className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center mr-3 overflow-hidden">
        {picUrl && !imgErr ? (
          <Image source={{ uri: picUrl }} style={{ width: 40, height: 40 }} resizeMode="cover" onError={() => setImgErr(true)} />
        ) : (
          <View className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
        )}
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-slate-700">{competitor.name}</Text>
        {stats.length > 0 && (
          <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>
            {stats.join('  •  ')}
          </Text>
        )}
      </View>
      <View
        className="w-8 h-8 rounded-lg items-center justify-center"
        style={{ backgroundColor: '#6e226e15' }}
      >
        <Eye size={14} color={BRAND} />
      </View>
    </TouchableOpacity>
  );
};

const CompetitorBarItem = ({ name, value, percentage, color }) => (
  <View className="mb-4">
    <View className="flex-row justify-between mb-2">
      <Text className="text-sm text-slate-600">{name}</Text>
      <Text className="text-sm font-semibold text-slate-800">{value}</Text>
    </View>
    <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <View className="h-full rounded-full" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: color }} />
    </View>
  </View>
);

const DonutChart = ({ segments, size = 100 }) => (
  <View className="items-center my-4">
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {segments.map((seg, i) => (
        <Circle
          key={i}
          cx="50" cy="50" r="35"
          fill="none" stroke={seg.color} strokeWidth="20"
          strokeDasharray={`${seg.dashArray} ${CIRCUMFERENCE}`}
          strokeDashoffset={seg.offset}
          transform="rotate(-90 50 50)"
        />
      ))}
    </Svg>
  </View>
);


const ChartLegendItem = ({ color, label, value, isLast = false }) => (
  <View className={`flex-row justify-between items-center py-2 ${!isLast ? 'border-b border-slate-100' : ''}`}>
    <View className="flex-row items-center">
      <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }} />
      <Text className="text-xs text-slate-500">{label}</Text>
    </View>
    <Text className="text-xs font-semibold text-slate-800">{value}</Text>
  </View>
);


const MetricBar = ({ name, value, percentage, color }) => (
  <View className="flex-row items-center mb-3">
    <Text className="text-[11px] text-slate-500 w-20" numberOfLines={1}>{name}</Text>
    <View className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden mx-3">
      <View className="h-full rounded-full" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: color }} />
    </View>
    <Text className="text-xs font-semibold text-slate-800 w-12 text-right">{value}</Text>
  </View>
);

const TopPostItem = ({ post }) => {
  const competitorName = post.competitor_page_id?.name ?? 'Unknown';
  const competitorColor = post.competitor_page_id?.color ?? '#94A3B8';
  const picUrl = getPictureUrl(post.competitor_page_id?.picture);
  const [imgErr, setImgErr] = useState(false);

  const handleOpen = () => {
    if (post.link) Linking.openURL(post.link).catch(() => {});
  };

  const stats = [];
  if (post.reactions) stats.push(`👍 ${formatNumber(post.reactions)}`);
  if (post.comments) stats.push(`💬 ${formatNumber(post.comments)}`);
  if (post.shares) stats.push(`📤 ${formatNumber(post.shares)}`);
  if (post.views) stats.push(`👁 ${formatNumber(post.views)}`);
  if (post.total_interactions) stats.push(`🔥 ${formatNumber(post.total_interactions)}`);

  return (
    <TouchableOpacity onPress={handleOpen} activeOpacity={0.8} className="py-3 border-b border-slate-100">
      <View className="flex-row items-center mb-2">
        <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-2 overflow-hidden">
          {picUrl && !imgErr ? (
            <Image source={{ uri: picUrl }} style={{ width: 32, height: 32 }} resizeMode="cover" onError={() => setImgErr(true)} />
          ) : (
            <View className="w-3 h-3 rounded" style={{ backgroundColor: competitorColor }} />
          )}
        </View>
        <Text className="text-xs font-semibold text-slate-700 flex-1" numberOfLines={1}>{competitorName}</Text>
        {post.created_time && (
          <Text className="text-[10px] text-slate-400">{formatDate(post.created_time)}</Text>
        )}
      </View>

      {post.message ? (
        <Text className="text-xs text-slate-500 mb-2" numberOfLines={2}>{post.message}</Text>
      ) : null}

      {stats.length > 0 && (
        <View className="flex-row gap-4">
          {stats.map((stat, i) => (
            <Text key={i} className="text-xs text-slate-600">{stat}</Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};


const DonutSection = ({ title, competitors, valueKey, size = 120 }) => {
  if (!hasDataForKey(competitors, valueKey)) return null;

  const items = competitors.map((c, i) => ({
    color: getColor(c, i),
    value: c[valueKey] ?? 0,
    name: c.name,
  }));
  const segments = buildDonutSegments(items);

  return (
    <View>
      {title && <Text className="text-sm font-semibold text-slate-800 text-center mb-3">{title}</Text>}
      <DonutChart segments={segments} size={size} />
      {items.map((item, i) => (
        <ChartLegendItem
          key={i}
          color={item.color}
          label={item.name}
          value={formatNumber(item.value)}
          isLast={i === items.length - 1}
        />
      ))}
    </View>
  );
};


const MetricSection = ({ title, competitors, valueKey }) => {
  if (!hasDataForKey(competitors, valueKey)) return null;

  const maxVal = Math.max(...competitors.map((c) => c[valueKey] ?? 0), 1);

  return (
    <View>
      <Text className="text-sm font-semibold text-slate-800 mb-3">{title}</Text>
      {competitors.map((c, i) => (
        <MetricBar
          key={c._id || i}
          name={c.name}
          value={formatNumber(c[valueKey] ?? 0)}
          percentage={((c[valueKey] ?? 0) / maxVal) * 100}
          color={getColor(c, i)}
        />
      ))}
    </View>
  );
};


const CompetitorsTab = ({ pageId, pageName, platform = 'facebook' }) => {
  const { width } = useWindowDimensions();
  const [competitors, setCompetitors] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [pageId, platform]);

  const fetchAll = async () => {
    setLoading(true);
    setError('');

    try {
      const [compResult, postsResult] = await Promise.all([
        getCompetitorsData({ pageId, platform }),
        getCompetitorsTopPosts({ pageId, platform }),
      ]);

      if (compResult.success) {
        setCompetitors(compResult.competitors);
      } else {
        setError(compResult.message || 'Failed to load competitors');
      }

      if (postsResult.success) {
        setTopPosts(postsResult.posts);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }

    setLoading(false);
  };

  const handleCompetitorPress = (competitor, index) => {
    setSelectedCompetitor(competitor);
    setSelectedIndex(index);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color={BRAND} />
        <Text className="text-slate-500 text-sm mt-3">Loading competitors...</Text>
      </View>
    );
  }

  if (error && competitors.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-6">
        <Text className="text-red-500 text-base font-medium text-center mb-2">Failed to load competitors</Text>
        <Text className="text-slate-400 text-sm text-center mb-4">{error}</Text>
        <TouchableOpacity onPress={fetchAll} activeOpacity={0.7} className="px-6 py-2.5 rounded-lg" style={{ backgroundColor: BRAND }}>
          <Text className="text-white text-sm font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (competitors.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-4xl mb-4">📊</Text>
        <Text className="text-slate-400 text-base">No competitors found</Text>
        <Text className="text-slate-400 text-sm mt-1 text-center px-8">
          Add competitors to start comparing performance
        </Text>
      </View>
    );
  }

  const hasAvgInteractions = hasDataForKey(competitors, 'avgInteractionsPerPost');
  const hasDonutData = hasDataForAnyKey(competitors, ['overall_reach', 'published_posts_count']);
  const hasOverallReach = hasDataForKey(competitors, 'overall_reach');
  const hasPublishedPosts = hasDataForKey(competitors, 'published_posts_count');
  const hasEngagementData = hasDataForAnyKey(competitors, ['reactions', 'comments', 'shares']);

  const engagementKeys = ['reactions', 'comments', 'shares'].filter((k) => hasDataForKey(competitors, k));

  const performanceItems = [
    { title: 'Followers Count', key: 'followers_count', fallbackKey: 'fan_count' },
    { title: 'Engagement Rate Per 1K Fan', key: 'engagementRatePer1KFan' },
    { title: 'Engagement Rate Per Post', key: 'engagementRatePerPost' },
  ].filter((item) => {
    if (item.fallbackKey) {
      return hasDataForKey(competitors, item.key) || hasDataForKey(competitors, item.fallbackKey);
    }
    return hasDataForKey(competitors, item.key);
  });

  const competitorsWithFollowers = competitors.map((c) => ({
    ...c,
    followers_count: c.followers_count ?? c.fan_count ?? 0,
  }));

  return (
    <View className="flex-1">
      <InsightCard title={`Competitors (${competitors.length})`}>
        {competitors.map((c, i) => (
          <CompetitorListItem
            key={c._id || i}
            competitor={c}
            index={i}
            onPress={() => handleCompetitorPress(c, i)}
          />
        ))}
      </InsightCard>

      {hasAvgInteractions && (() => {
        const maxVal = Math.max(...competitors.map((c) => c.avgInteractionsPerPost ?? 0), 1);
        return (
          <InsightCard title="AVG Interactions per Post">
            {competitors.map((c, i) => (
              <CompetitorBarItem
                key={c._id || i}
                name={c.name}
                value={formatNumber(c.avgInteractionsPerPost ?? 0)}
                percentage={((c.avgInteractionsPerPost ?? 0) / maxVal) * 100}
                color={getColor(c, i)}
              />
            ))}
          </InsightCard>
        );
      })()}

      {hasDonutData && (
        <View className="flex-row gap-3 mb-4">
          {hasOverallReach && (
            <View className="flex-1 bg-white rounded-xl p-4 border border-slate-200">
              <DonutSection title="Overall Reach" competitors={competitors} valueKey="overall_reach" size={80} />
            </View>
          )}
          {hasPublishedPosts && (
            <View className="flex-1 bg-white rounded-xl p-4 border border-slate-200">
              <DonutSection title="Published Posts" competitors={competitors} valueKey="published_posts_count" size={80} />
            </View>
          )}
        </View>
      )}

      {hasEngagementData && (
        <InsightCard title="Engagement Breakdown">
          {engagementKeys.map((key, idx) => (
            <View key={key}>
              {idx > 0 && <View className="my-4 border-t border-slate-100" />}
              <DonutSection
                title={key.charAt(0).toUpperCase() + key.slice(1)}
                competitors={competitors}
                valueKey={key}
              />
            </View>
          ))}
        </InsightCard>
      )}

      {performanceItems.length > 0 && (
        <InsightCard title="Performance Metrics">
          {performanceItems.map((item, idx) => (
            <View key={item.key}>
              {idx > 0 && <View className="my-4 border-t border-slate-100" />}
              <MetricSection
                title={item.title}
                competitors={item.key === 'followers_count' ? competitorsWithFollowers : competitors}
                valueKey={item.key}
              />
            </View>
          ))}
        </InsightCard>
      )}

      {hasDataForKey(competitors, 'overall_interactions') && !hasEngagementData && (() => {
        const maxVal = Math.max(...competitors.map((c) => c.overall_interactions ?? 0), 1);
        return (
          <InsightCard title="Overall Interactions">
            {competitors.map((c, i) => (
              <CompetitorBarItem
                key={c._id || i}
                name={c.name}
                value={formatNumber(c.overall_interactions ?? 0)}
                percentage={((c.overall_interactions ?? 0) / maxVal) * 100}
                color={getColor(c, i)}
              />
            ))}
          </InsightCard>
        );
      })()}

      {topPosts.length > 0 && (
        <InsightCard title={`Top Performing Posts (${topPosts.length})`}>
          {topPosts.map((post, i) => (
            <TopPostItem key={post._id || i} post={post} />
          ))}
        </InsightCard>
      )}

      {!hasAvgInteractions && !hasDonutData && !hasEngagementData && performanceItems.length === 0 && topPosts.length === 0 && (
        <View className="rounded-xl p-4 mb-4 flex-row items-center" style={{ backgroundColor: '#6e226e10' }}>
          <Text className="text-lg mr-2">ℹ️</Text>
          <Text className="text-sm flex-1 text-slate-500">
            Limited data available for these competitors. More insights will appear as data is collected.
          </Text>
        </View>
      )}

      <CompetitorDetailModal
        visible={modalVisible}
        competitor={selectedCompetitor}
        index={selectedIndex}
        onClose={() => {
          setModalVisible(false);
          setSelectedCompetitor(null);
        }}
      />
    </View>
  );
};

export default CompetitorsTab;