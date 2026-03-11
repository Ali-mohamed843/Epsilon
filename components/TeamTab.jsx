import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { User, ThumbsUp, MessageSquare, Users, FileText, Clock, Mail, BarChart3 } from 'lucide-react-native';
import { getPageAgents, getPageInfo, getPageAnalysis } from '@/Api/api';

const BRAND = '#6e226e';
const CIRCUMFERENCE = 2 * Math.PI * 35;

const formatNumber = (num) => {
  if (num === null || num === undefined) return null;
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(Math.round(num));
};

const hasValue = (val) => val !== null && val !== undefined && val !== 0 && val !== '';

const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const formatTimeSince = (dateString) => {
  if (!dateString) return null;
  const d = new Date(dateString);
  const now = new Date();
  const diffMs = now - d;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days > 365) return `${Math.floor(days / 365)}y ago`;
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
};

const PageInfoCard = ({ label, value, icon: Icon, iconColor, iconBg }) => (
  <View className="flex-1 bg-white rounded-xl p-4 border border-slate-200 min-w-[45%]">
    <View className="flex-row justify-between items-start">
      <View className="flex-1">
        <Text className="text-xs text-slate-500 mb-1">{label}</Text>
        <Text className="text-lg font-bold text-slate-800">{value}</Text>
      </View>
      <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: iconBg }}>
        <Icon size={20} color={iconColor} strokeWidth={2} />
      </View>
    </View>
  </View>
);

const StatsCard = ({ stats }) => {
  if (!stats || stats.length === 0) return null;
  return (
    <View className="bg-white rounded-xl p-4 mb-4 border border-slate-200">
      <View className="flex-row flex-wrap">
        {stats.map((stat, index) => (
          <View
            key={index}
            className={`w-1/2 py-3 ${index % 2 === 0 ? 'pr-2' : 'pl-2'} ${index < stats.length - 2 ? 'border-b border-slate-100' : ''}`}
          >
            <Text className="text-xs text-slate-500 mb-1">{stat.label}</Text>
            <Text className="text-base font-bold text-slate-800">{stat.value}</Text>
          </View>
        ))}
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

const TeamMemberItem = ({ agent, isLast = false }) => {
  const initials = getInitials(agent.name);
  const lastLogin = formatTimeSince(agent.login_at);

  const stats = [];
  if (hasValue(agent.totalAssignedComments)) stats.push(`📋 ${agent.totalAssignedComments} assigned`);
  if (hasValue(agent.totalDoneComments)) stats.push(`✅ ${agent.totalDoneComments} done`);
  if (hasValue(agent.totalRespondedAndDoneComments)) stats.push(`💬 ${agent.totalRespondedAndDoneComments} responded`);
  if (agent.AHT && agent.AHT !== '0s') stats.push(`⏱ ${agent.AHT}`);
  if (hasValue(agent.performance)) stats.push(`📊 ${agent.performance}%`);

  return (
    <View className={`py-3 ${!isLast ? 'border-b border-slate-100' : ''}`}>
      <View className="flex-row items-center">
        <View className="w-11 h-11 rounded-full items-center justify-center mr-3" style={{ backgroundColor: BRAND }}>
          <Text className="text-white font-semibold text-sm">{initials}</Text>
        </View>

        <View className="flex-1">
          <Text className="text-sm font-semibold text-slate-800 mb-0.5">{agent.name}</Text>
          <View className="flex-row items-center">
            {agent.email && (
              <Text className="text-xs text-slate-400 flex-1" numberOfLines={1}>{agent.email}</Text>
            )}
          </View>
        </View>

        {lastLogin && (
          <View className="px-2 py-1 rounded-md" style={{ backgroundColor: '#6e226e10' }}>
            <Text className="text-[10px]" style={{ color: BRAND }}>{lastLogin}</Text>
          </View>
        )}
      </View>

      {stats.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mt-2 ml-14">
          {stats.map((stat, i) => (
            <Text key={i} className="text-[11px] text-slate-400">{stat}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const ProgressBar = ({ label, current, total, percentage, color = BRAND }) => (
  <View className="mb-4">
    <View className="flex-row justify-between mb-2">
      <Text className="text-sm text-slate-600">{label}</Text>
      <Text className="text-sm font-medium text-slate-800">{current} / {total}</Text>
    </View>
    <View className="h-2 bg-slate-200 rounded-full overflow-hidden">
      <View className="h-full rounded-full" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: color }} />
    </View>
  </View>
);

const DonutChart = ({ segments, size = 80 }) => (
  <View className="items-center my-3">
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

const ChartLegendItem = ({ color, label, value }) => (
  <View className="flex-row justify-between items-center py-1">
    <View className="flex-row items-center">
      <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }} />
      <Text className="text-xs text-slate-500">{label}</Text>
    </View>
    <Text className="text-xs font-semibold text-slate-800">{value}</Text>
  </View>
);

const ChartCard = ({ title, data1, data2, label1, label2, color1 = BRAND, color2 = '#F59E0B' }) => {
  const total = data1 + data2;
  if (total === 0) return null;

  const d1 = (data1 / total) * CIRCUMFERENCE;
  const d2 = (data2 / total) * CIRCUMFERENCE;

  const segments = [
    { color: color1, dashArray: d1, offset: 0 },
    { color: color2, dashArray: d2, offset: -d1 },
  ];

  return (
    <View className="flex-1 bg-white rounded-xl p-3 border border-slate-200 min-w-[45%]">
      <Text className="text-sm font-semibold text-slate-800 mb-1">{title}</Text>
      <DonutChart segments={segments} size={70} />
      <ChartLegendItem color={color1} label={label1} value={formatNumber(data1) ?? '0'} />
      <ChartLegendItem color={color2} label={label2} value={formatNumber(data2) ?? '0'} />
    </View>
  );
};

const TeamTab = ({ pageId, pageName, platform = 'facebook' }) => {
  const [agents, setAgents] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [counters, setCounters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, [pageId, platform]);

  const fetchAll = async () => {
    setLoading(true);
    setError('');

    try {
      const [agentsResult, infoResult, analysisResult] = await Promise.all([
        getPageAgents({ pageId, platform }),
        getPageInfo({ pageId, platform }),
        getPageAnalysis({ pageId, platform }),
      ]);

      if (agentsResult.success) setAgents(agentsResult.agents);
      if (infoResult.success) setPageInfo(infoResult.pageInfo);
      if (analysisResult.success) setCounters(analysisResult.counters);

      if (!agentsResult.success && !infoResult.success && !analysisResult.success) {
        setError(agentsResult.message || 'Failed to load team data');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color={BRAND} />
        <Text className="text-slate-500 text-sm mt-3">Loading team data...</Text>
      </View>
    );
  }

  if (error && !pageInfo && !counters && agents.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-6">
        <Text className="text-red-500 text-base font-medium text-center mb-2">Failed to load data</Text>
        <Text className="text-slate-400 text-sm text-center mb-4">{error}</Text>
        <TouchableOpacity onPress={fetchAll} activeOpacity={0.7} className="px-6 py-2.5 rounded-lg" style={{ backgroundColor: BRAND }}>
          <Text className="text-white text-sm font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pageInfoCards = [];

  if (hasValue(pageInfo?.fan_count)) {
    pageInfoCards.push({ label: 'Fans', value: formatNumber(pageInfo.fan_count), icon: User, iconColor: BRAND, iconBg: '#6e226e15' });
  }
  if (hasValue(pageInfo?.followers_count)) {
    pageInfoCards.push({ label: 'Followers', value: formatNumber(pageInfo.followers_count), icon: ThumbsUp, iconColor: '#14B8A6', iconBg: '#14B8A615' });
  }
  if (hasValue(pageInfo?.talking_about_count)) {
    pageInfoCards.push({ label: 'Talking About', value: formatNumber(pageInfo.talking_about_count), icon: MessageSquare, iconColor: '#F59E0B', iconBg: '#F59E0B15' });
  }
  if (hasValue(pageInfo?.following_count)) {
    pageInfoCards.push({ label: 'Following', value: formatNumber(pageInfo.following_count), icon: Users, iconColor: '#3B82F6', iconBg: '#3B82F615' });
  }
  if (hasValue(pageInfo?.media_count)) {
    pageInfoCards.push({ label: 'Media', value: formatNumber(pageInfo.media_count), icon: FileText, iconColor: '#EC4899', iconBg: '#EC489915' });
  }

  const overallStats = [];

  if (hasValue(counters?.totalComments)) overallStats.push({ label: 'Total Comments', value: formatNumber(counters.totalComments) });
  if (hasValue(counters?.totalChats)) overallStats.push({ label: 'Total Chats', value: formatNumber(counters.totalChats) });
  if (hasValue(counters?.totalSentMessages)) overallStats.push({ label: 'Messages Sent', value: formatNumber(counters.totalSentMessages) });
  if (counters?.AvgResponseTime) overallStats.push({ label: 'AVG Response', value: counters.AvgResponseTime });
  if (hasValue(counters?.totalPosts)) overallStats.push({ label: 'Total Posts', value: formatNumber(counters.totalPosts) });
  if (overallStats.length % 2 !== 0) overallStats.push({ label: '', value: '' });

  const hasCommentBreakdown = hasValue(counters?.doneComments) || hasValue(counters?.pendingComments);
  const hasChatBreakdown = hasValue(counters?.doneChats) || hasValue(counters?.pendingChats);

  const totalCommentsForBar = (counters?.doneComments ?? 0) + (counters?.pendingComments ?? 0);
  const totalChatsForBar = (counters?.doneChats ?? 0) + (counters?.pendingChats ?? 0);

  const commentPercent = totalCommentsForBar > 0 ? ((counters?.doneComments ?? 0) / totalCommentsForBar) * 100 : 0;
  const chatPercent = totalChatsForBar > 0 ? ((counters?.doneChats ?? 0) / totalChatsForBar) * 100 : 0;

  const hasAssignedData = hasValue(counters?.assignedComments) || hasValue(counters?.notAssignedComments);
  const assignedTotal = (counters?.assignedComments ?? 0) + (counters?.notAssignedComments ?? 0);

  return (
    <View className="flex-1">
      {pageInfoCards.length > 0 && (
        <View className="flex-row flex-wrap gap-3 mb-4">
          {pageInfoCards.map((stat, index) => (
            <PageInfoCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              iconColor={stat.iconColor}
              iconBg={stat.iconBg}
            />
          ))}
        </View>
      )}

      {overallStats.length > 0 && <StatsCard stats={overallStats.filter((s) => s.label !== '')} />}

      {agents.length > 0 && (
        <InsightCard title={`Team Members (${agents.length})`}>
          {agents.map((agent, index) => (
            <TeamMemberItem
              key={agent._id || index}
              agent={agent}
              isLast={index === agents.length - 1}
            />
          ))}
        </InsightCard>
      )}

      {(hasCommentBreakdown || hasChatBreakdown) && (
        <InsightCard title="Performance Breakdown">
          {hasCommentBreakdown && (
            <ProgressBar
              label="Handled Comments"
              current={formatNumber(counters?.doneComments ?? 0)}
              total={formatNumber(totalCommentsForBar)}
              percentage={commentPercent}
              color={BRAND}
            />
          )}
          {hasChatBreakdown && (
            <ProgressBar
              label="Handled Chats"
              current={formatNumber(counters?.doneChats ?? 0)}
              total={formatNumber(totalChatsForBar)}
              percentage={chatPercent}
              color="#14B8A6"
            />
          )}
        </InsightCard>
      )}

      {(hasAssignedData || hasCommentBreakdown) && (
        <View className="flex-row gap-3 mb-3">
          {hasAssignedData && assignedTotal > 0 && (
            <ChartCard
              title="Assigned Comments"
              data1={counters?.assignedComments ?? 0}
              data2={counters?.notAssignedComments ?? 0}
              label1="Assigned"
              label2="Not Assigned"
            />
          )}
          {hasCommentBreakdown && totalCommentsForBar > 0 && (
            <ChartCard
              title="Handled Comments"
              data1={counters?.doneComments ?? 0}
              data2={counters?.pendingComments ?? 0}
              label1="Handled"
              label2="Pending"
            />
          )}
        </View>
      )}

      {hasChatBreakdown && totalChatsForBar > 0 && (
        <View className="flex-row gap-3 mb-4">
          <ChartCard
            title="Handled Chats"
            data1={counters?.doneChats ?? 0}
            data2={counters?.pendingChats ?? 0}
            label1="Handled"
            label2="Pending"
            color1="#14B8A6"
          />
          {!hasAssignedData && <View className="flex-1" />}
        </View>
      )}

      {pageInfoCards.length === 0 && overallStats.length === 0 && agents.length === 0 && !hasCommentBreakdown && !hasChatBreakdown && (
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-4xl mb-4">👥</Text>
          <Text className="text-slate-400 text-base">No team data available</Text>
          <Text className="text-slate-400 text-sm mt-1 text-center px-8">
            Team data will appear once agents and page info are configured
          </Text>
        </View>
      )}

      {(pageInfoCards.length > 0 || agents.length > 0) && !counters && (
        <View className="rounded-xl p-4 mb-4 flex-row items-center" style={{ backgroundColor: '#6e226e10' }}>
          <Text className="text-lg mr-2">ℹ️</Text>
          <Text className="text-sm flex-1 text-slate-500">
            Some analytics data is not available for this page yet.
          </Text>
        </View>
      )}
    </View>
  );
};

export default TeamTab;