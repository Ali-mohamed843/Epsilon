import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import Svg, { Rect, Circle } from 'react-native-svg';
import {
  getPageInsights,
  getStatisticsCounters,
  getInteractionsPerDay,
  getTopPosts,
  getSentimentGraph,
} from '@/Api/api';
import Filters from '@/components/Filters';
import DailyBarChart from './Dailybarchart';
import SentimentWordCloud from './Sentimentwordcloud';

const BRAND = '#6e226e';
const CIRCUMFERENCE = 2 * Math.PI * 80;

const formatNumber = (num) => {
  if (num === null || num === undefined) return null;
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1_000_000)     return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000)         return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(Math.round(num));
};

const hasValue = (val) => val !== null && val !== undefined && val !== 0;

const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const toISO = (date) => {
  if (!date) return undefined;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const DEFAULT_GRANULARITY = 'day';
const getDefaultRange = () => {
  const to   = new Date(); to.setHours(0, 0, 0, 0);
  const from = new Date(); from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - 29);
  return { from, to };
};

const isDefaultFilter = (fromDate, toDate, granularity) => {
  const def = getDefaultRange();
  return (
    granularity === DEFAULT_GRANULARITY &&
    fromDate?.toDateString() === def.from.toDateString() &&
    toDate?.toDateString()   === def.to.toDateString()
  );
};

const StatCard = ({ icon, label, value }) => (
  <View className="flex-1 rounded-xl p-4 min-w-[45%]" style={{ backgroundColor: 'rgba(110,34,110,0.06)' }}>
    <Text className="text-2xl mb-2">{icon}</Text>
    <Text className="text-xs text-slate-500 mb-1">{label}</Text>
    <Text className="text-xl font-bold text-slate-800">{value}</Text>
  </View>
);

const ReactionItem = ({ emoji, name, count, isLast = false }) => (
  <View className={`flex-row items-center justify-between py-3 ${!isLast ? 'border-b border-slate-100' : ''}`}>
    <View className="flex-row items-center">
      <Text className="text-xl mr-3">{emoji}</Text>
      <Text className="text-sm text-slate-700">{name}</Text>
    </View>
    <Text className="text-sm font-semibold text-slate-800">{count}</Text>
  </View>
);

const ProgressBar = ({ label, value, percentage, type }) => {
  const isPositive = type === 'positive';
  return (
    <View className="mb-4">
      <View className="flex-row justify-between mb-2">
        <Text className="text-sm text-slate-600">{label}</Text>
        <Text className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>{value}</Text>
      </View>
      <View className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: isPositive ? '#10B981' : '#EF4444' }}
        />
      </View>
    </View>
  );
};

const InsightCard = ({ title, children }) => (
  <View className="bg-white rounded-xl p-4 mb-4 border border-slate-200">
    {title && <Text className="text-base font-semibold text-slate-800 mb-4">{title}</Text>}
    {children}
  </View>
);

const LegendItem = ({ color, label, value, isLast = false }) => (
  <View className={`flex-row items-center justify-between py-2 ${!isLast ? 'border-b border-slate-100' : ''}`}>
    <View className="flex-row items-center flex-1">
      <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: color }} />
      <Text className="text-sm text-slate-600 flex-1">{label}</Text>
    </View>
    <Text className="text-sm font-semibold text-slate-800">{value}</Text>
  </View>
);

// const DailyBarChart = ({ data, valueKey = 'total_interactions' }) => {
//   if (!data || data.length === 0) return null;
//   const values = data.map((d) => d[valueKey] ?? 0);
//   const maxVal = Math.max(...values, 1);
//   const barW = Math.max(1, Math.min(3, 90 / data.length));
//   const gap = Math.max(0.5, (100 - data.length * barW) / (data.length + 1));
//   return (
//     <View className="h-40 justify-end">
//       <Svg width="100%" height="150" viewBox="0 0 100 30" preserveAspectRatio="none">
//         {values.map((val, i) => {
//           const h = Math.max(0.5, (val / maxVal) * 28);
//           return <Rect key={i} x={gap + i * (barW + gap)} y={30 - h} width={barW} height={h} fill={BRAND} rx={0.5} opacity={0.7} />;
//         })}
//       </Svg>
//     </View>
//   );
// };

const DonutChart = ({ items, size = 180 }) => {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (total === 0) return null;
  let offset = 0;
  const segments = items.map((item) => {
    const dash = (item.value / total) * CIRCUMFERENCE;
    const seg = { ...item, dash, offset: -offset };
    offset += dash;
    return seg;
  });
  return (
    <View className="items-center my-5">
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {segments.map((seg, i) => (
          <Circle key={i} cx="100" cy="100" r="80" fill="none" stroke={seg.color} strokeWidth="40"
            strokeDasharray={`${seg.dash} ${CIRCUMFERENCE}`} strokeDashoffset={seg.offset}
            transform="rotate(-90 100 100)" />
        ))}
      </Svg>
    </View>
  );
};

const MetricRow = ({ label, value, icon }) => (
  <View className="flex-row items-center justify-between py-3 border-b border-slate-100">
    <View className="flex-row items-center">
      <Text className="text-lg mr-3">{icon}</Text>
      <Text className="text-sm text-slate-600">{label}</Text>
    </View>
    <Text className="text-sm font-bold text-slate-800">{value}</Text>
  </View>
);

const TopPostItem = ({ post, index }) => {
  const [imgErr, setImgErr] = useState(false);
  const mediaUrl = post.screenshotUrl || post.thumbnail || null;
  const stats = [];
  if (hasValue(post.reactions))          stats.push(`👍 ${formatNumber(post.reactions)}`);
  if (hasValue(post.total_interactions)) stats.push(`🔥 ${formatNumber(post.total_interactions)}`);
  if (hasValue(post.number_of_comments)) stats.push(`💬 ${formatNumber(post.number_of_comments)}`);
  if (hasValue(post.shares))             stats.push(`📤 ${formatNumber(post.shares)}`);
  if (hasValue(post.views))              stats.push(`👁 ${formatNumber(post.views)}`);
  if (hasValue(post.reach))              stats.push(`📡 ${formatNumber(post.reach)}`);
  return (
    <TouchableOpacity onPress={() => post.permalink && Linking.openURL(post.permalink).catch(() => {})} activeOpacity={0.8} className="py-3 border-b border-slate-100">
      <View className="flex-row items-start">
        <View className="w-7 h-7 rounded-full items-center justify-center mr-3" style={{ backgroundColor: 'rgba(110,34,110,0.08)' }}>
          <Text className="text-xs font-bold" style={{ color: BRAND }}>#{index + 1}</Text>
        </View>
        {mediaUrl && !imgErr && (
          <View className="w-14 h-14 rounded-lg bg-slate-100 mr-3 overflow-hidden">
            <Image source={{ uri: mediaUrl }} style={{ width: 56, height: 56 }} resizeMode="cover" onError={() => setImgErr(true)} />
          </View>
        )}
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-[10px] text-slate-400 mr-2">{formatDate(post.created_time)}</Text>
            {post.post_type && (
              <View className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(110,34,110,0.06)' }}>
                <Text className="text-[9px] capitalize" style={{ color: BRAND }}>{post.post_type}</Text>
              </View>
            )}
          </View>
          {post.message && <Text className="text-xs text-slate-500 mb-1.5" numberOfLines={2}>{post.message}</Text>}
          <View className="flex-row flex-wrap gap-3">
            {stats.map((s, i) => <Text key={i} className="text-[11px] text-slate-600">{s}</Text>)}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SentimentWordChip = ({ word }) => {
  const pos = word.sentiment === 'positive';
  return (
    <View className="px-3 py-1.5 rounded-full mr-2 mb-2" style={{ backgroundColor: pos ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
      <Text className="text-xs font-medium" style={{ color: pos ? '#10B981' : '#EF4444' }}>
        {word.text} ({word.value})
      </Text>
    </View>
  );
};

const InsightsTab = ({ pageId, pageName, platform = 'facebook' }) => {

  const initial = getDefaultRange();
  const [fromDate, setFromDate]       = useState(initial.from);
  const [toDate, setToDate]           = useState(initial.to);
  const [granularity, setGranularity] = useState(DEFAULT_GRANULARITY);

  const filtersAreDefault = isDefaultFilter(fromDate, toDate, granularity);

  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [insights, setInsights]             = useState(null);
  const [statistics, setStatistics]         = useState(null);
  const [dailyData, setDailyData]           = useState([]);
  const [topPosts, setTopPosts]             = useState([]);
  const [sentiment, setSentiment]           = useState(null);
  const [sentimentWords, setSentimentWords] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    const from = toISO(fromDate);
    const to   = toISO(toDate);

    try {
      const results = await Promise.allSettled([
        getPageInsights({ pageId, platform, from, to }),
        getStatisticsCounters({ pageId, platform, from, to }),
        getInteractionsPerDay({ pageId, platform, from, to, granularity }),
        getTopPosts({ pageId, platform, from, to }),
        getSentimentGraph({ pageId, platform, from, to }),
      ]);

      const [insR, statR, dailyR, topR, sentR] = results;
      if (insR.status   === 'fulfilled' && insR.value.success)   setInsights(insR.value.metrics);
      if (statR.status  === 'fulfilled' && statR.value.success)  setStatistics(statR.value.counters);
      if (dailyR.status === 'fulfilled' && dailyR.value.success) setDailyData(dailyR.value.counters);
      if (topR.status   === 'fulfilled' && topR.value.success)   setTopPosts(topR.value.topPosts);
      if (sentR.status  === 'fulfilled' && sentR.value.success) {
        setSentiment(sentR.value.percentage);
        setSentimentWords(sentR.value.words);
      }
      const allFailed = results.every((r) => r.status === 'rejected' || !r.value?.success);
      if (allFailed) setError('Failed to load insights data');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
    setLoading(false);
  }, [pageId, platform, fromDate, toDate, granularity]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDateRangeChange = useCallback(({ from, to }) => {
    setFromDate(from);
    setToDate(to);
  }, []);

  const handleGranularityChange = useCallback((val) => {
    setGranularity(val);
  }, []);

  const handleClearFilters = useCallback(() => {
    const def = getDefaultRange();
    setFromDate(def.from);
    setToDate(def.to);
    setGranularity(DEFAULT_GRANULARITY);
  }, []);

  const filterBar = (
    <Filters
      granularity={granularity}
      onGranularityChange={handleGranularityChange}
      fromDate={fromDate}
      toDate={toDate}
      onDateRangeChange={handleDateRangeChange}
      onClear={handleClearFilters}
      isDefault={filtersAreDefault}
    />
  );

  if (loading) {
    return (
      <View className="flex-1">
        {filterBar}
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color={BRAND} />
          <Text className="text-slate-500 text-sm mt-3">Loading insights…</Text>
        </View>
      </View>
    );
  }

  if (error && !statistics && !insights) {
    return (
      <View className="flex-1">
        {filterBar}
        <View className="flex-1 items-center justify-center py-20 px-6">
          <Text className="text-red-500 text-base font-medium text-center mb-2">Failed to load insights</Text>
          <Text className="text-slate-400 text-sm text-center mb-4">{error}</Text>
          <TouchableOpacity onPress={fetchAll} activeOpacity={0.7} className="px-6 py-2.5 rounded-lg" style={{ backgroundColor: BRAND }}>
            <Text className="text-white text-sm font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statCards = [];
  if (hasValue(statistics?.totalViews))       statCards.push({ icon: '👁️', label: 'Total Views',        value: formatNumber(statistics.totalViews) });
  if (hasValue(statistics?.totalPosts))       statCards.push({ icon: '📊', label: 'Total Posts',        value: formatNumber(statistics.totalPosts) });
  if (hasValue(statistics?.totalReach))       statCards.push({ icon: '📈', label: 'Total Reach',        value: formatNumber(statistics.totalReach) });
  if (hasValue(statistics?.interactions?.avgInteractions?.value))
    statCards.push({ icon: '👍', label: 'AVG Interactions', value: formatNumber(statistics.interactions.avgInteractions.value) });
  if (hasValue(statistics?.totalInteractions)) statCards.push({ icon: '🔥', label: 'Total Interactions', value: formatNumber(statistics.totalInteractions) });
  if (hasValue(statistics?.totalReactions))    statCards.push({ icon: '❤️', label: 'Total Reactions',    value: formatNumber(statistics.totalReactions) });
  if (hasValue(statistics?.totalComments))     statCards.push({ icon: '💬', label: 'Total Comments',     value: formatNumber(statistics.totalComments) });
  if (hasValue(statistics?.totalShares))       statCards.push({ icon: '📤', label: 'Total Shares',       value: formatNumber(statistics.totalShares) });

  const reactionsMap = [];
  const rt = insights?.page_actions_post_reactions_total;
  if (rt) {
    if (hasValue(rt.like))  reactionsMap.push({ emoji: '👍', name: 'Like',  count: formatNumber(rt.like) });
    if (hasValue(rt.love))  reactionsMap.push({ emoji: '❤️', name: 'Love',  count: formatNumber(rt.love) });
    if (hasValue(rt.wow))   reactionsMap.push({ emoji: '😮', name: 'Wow',   count: formatNumber(rt.wow) });
    if (hasValue(rt.haha))  reactionsMap.push({ emoji: '😂', name: 'Haha',  count: formatNumber(rt.haha) });
    if (hasValue(rt.sorry)) reactionsMap.push({ emoji: '😢', name: 'Sad',   count: formatNumber(rt.sorry) });
    if (hasValue(rt.anger)) reactionsMap.push({ emoji: '😡', name: 'Angry', count: formatNumber(rt.anger) });
  }

  const contentTypes = [];
  if (hasValue(statistics?.totalVideos)) contentTypes.push({ color: BRAND,     label: 'Videos', value: statistics.totalVideos });
  if (hasValue(statistics?.totalImages)) contentTypes.push({ color: '#F59E0B', label: 'Images', value: statistics.totalImages });
  if (hasValue(statistics?.totalStatus)) contentTypes.push({ color: '#10B981', label: 'Status', value: statistics.totalStatus });

  const engagementMetrics = [];
  if (hasValue(statistics?.engOver1KFollowers))
    engagementMetrics.push({ icon: '📊', label: 'Eng. per 1K Followers',     value: formatNumber(statistics.engOver1KFollowers) });
  if (hasValue(statistics?.engAndViewOver1KReach))
    engagementMetrics.push({ icon: '📡', label: 'Eng. & Views per 1K Reach', value: statistics.engAndViewOver1KReach.toFixed(2) });
  if (hasValue(statistics?.engOver1KReach))
    engagementMetrics.push({ icon: '🎯', label: 'Eng. per 1K Reach',         value: statistics.engOver1KReach.toFixed(4) });
  if (hasValue(statistics?.sentimentScore))
    engagementMetrics.push({ icon: statistics.sentimentScore >= 0 ? '😊' : '😟', label: 'Sentiment Score', value: String(statistics.sentimentScore) });

  const hasSentiment    = sentiment && (hasValue(sentiment.positive) || hasValue(sentiment.negative));
  const fanAdds         = insights?.page_fan_adds_by_paid_non_paid_unique;
  const hasFanAdds      = fanAdds && (hasValue(fanAdds.paid) || hasValue(fanAdds.unpaid));
  const hasContentTypes = contentTypes.length > 0;
  const interactionTitle = granularity === 'month' ? 'Interactions per Month' : 'Interactions per Day';
  const viewsTitle       = granularity === 'month' ? 'Views per Month'       : 'Views per Day';
  const periodLabel      = granularity === 'month' ? 'months' : 'days';

  return (
    <View className="flex-1">
      {filterBar}

      {statCards.length > 0 && (
        <View className="flex-row flex-wrap gap-3 mb-4">
          {statCards.map((s, i) => <StatCard key={i} {...s} />)}
        </View>
      )}

      {engagementMetrics.length > 0 && (
        <InsightCard title="Engagement Rates">
          {engagementMetrics.map((m, i) => <MetricRow key={i} {...m} />)}
        </InsightCard>
      )}

      {reactionsMap.length > 0 && (
        <InsightCard title="Reactions Breakdown">
          {reactionsMap.map((r, i) => <ReactionItem key={i} {...r} isLast={i === reactionsMap.length - 1} />)}
        </InsightCard>
      )}
      {hasSentiment && (
        <SentimentWordCloud
          percentage={sentiment}
          words={sentimentWords}
          height={480}
        />
      )}

      {dailyData.length > 0 && (
        <InsightCard title={interactionTitle}>
          <DailyBarChart data={dailyData} valueKey="total_interactions" />
          <Text className="text-xs text-slate-500 mt-3">
            {dailyData.length} {periodLabel} • Avg:{' '}
            {formatNumber(dailyData.reduce((s, d) => s + (d.total_interactions ?? 0), 0) / dailyData.length)}{' '}
            interactions/{granularity === 'month' ? 'mo' : 'day'}
          </Text>
        </InsightCard>
      )}

      {dailyData.length > 0 && dailyData.some((d) => hasValue(d.views)) && (
        <InsightCard title={viewsTitle}>
          <DailyBarChart data={dailyData} valueKey="views" />
          <Text className="text-xs text-slate-500 mt-3">
            Avg: {formatNumber(dailyData.reduce((s, d) => s + (d.views ?? 0), 0) / dailyData.length)}{' '}
            views/{granularity === 'month' ? 'mo' : 'day'}
          </Text>
        </InsightCard>
      )}

      {hasContentTypes && (
        <InsightCard title="Content Type Breakdown">
          <DonutChart items={contentTypes} size={160} />
          <View className="mt-2">
            {contentTypes.map((item, i) => (
              <LegendItem key={i} color={item.color} label={item.label} value={String(item.value)} isLast={i === contentTypes.length - 1} />
            ))}
          </View>
        </InsightCard>
      )}

      {hasFanAdds && (
        <InsightCard title="New Fans: Paid vs Organic">
          <DonutChart items={[{ color: BRAND, label: 'Paid', value: fanAdds.paid ?? 0 }, { color: '#10B981', label: 'Organic', value: fanAdds.unpaid ?? 0 }]} size={140} />
          <LegendItem color={BRAND} label="Paid" value={formatNumber(fanAdds.paid ?? 0)} />
          <LegendItem color="#10B981" label="Organic" value={formatNumber(fanAdds.unpaid ?? 0)} isLast />
          {hasValue(fanAdds.total) && <Text className="text-xs text-slate-400 mt-2 text-center">Total new fans: {formatNumber(fanAdds.total)}</Text>}
        </InsightCard>
      )}

      {topPosts.length > 0 && (
        <InsightCard title={`Top Posts (${topPosts.length})`}>
          {topPosts.map((post, i) => <TopPostItem key={post._id || i} post={post} index={i} />)}
        </InsightCard>
      )}

      {hasValue(insights?.page_post_engagements?.value) && (
        <InsightCard title="Page Post Engagements">
          <View className="flex-row items-center">
            <Text className="text-3xl mr-3">📈</Text>
            <View>
              <Text className="text-2xl font-bold text-slate-800">{formatNumber(insights.page_post_engagements.value)}</Text>
              <Text className="text-xs text-slate-400 mt-1">Likes, comments, shares & more</Text>
            </View>
          </View>
        </InsightCard>
      )}

      {statCards.length === 0 && reactionsMap.length === 0 && !hasSentiment && dailyData.length === 0 && topPosts.length === 0 && engagementMetrics.length === 0 && (
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-4xl mb-4">📊</Text>
          <Text className="text-slate-400 text-base">No insights available yet</Text>
          <Text className="text-slate-400 text-sm mt-1 text-center px-8">
            Insights will appear as your page collects more data
          </Text>
        </View>
      )}
    </View>
  );
};

export default InsightsTab;