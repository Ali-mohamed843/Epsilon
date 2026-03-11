import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import PostsTab from '@/components/PostsTab';
import InsightsTab from '@/components/InsightsTab';
import CompetitorsTab from '@/components/CompetitorsTab';
import RecommendationsTab from '@/components/RecommendationsTab';
import TeamTab from '@/components/TeamTab';
import CommentsTab from '@/components/CommentsTab';
import MessagesTab from '@/components/MessagesTab';

const TabButton = ({ title, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={isActive ? { backgroundColor: '#6e226e', borderColor: '#6e226e' } : {}}
    className={`px-4 py-2 rounded-lg mr-2 border ${isActive ? '' : 'bg-white border-slate-200'}`}
  >
    <Text className={`text-[13px] font-medium ${isActive ? 'text-white' : 'text-slate-500'}`}>
      {title}
    </Text>
  </TouchableOpacity>
);

const getTabsForPlatform = (platform) => {
  switch (platform?.toLowerCase()) {
    case 'tiktok':
    case 'snapchat':
      return ['Insights', 'Competitors'];
    case 'instagram':
      return ['Posts', 'Insights', 'Competitors', 'Recommendations', 'Comments', 'Messages'];
    case 'facebook':
    default:
      return ['Posts', 'Insights', 'Competitors', 'Recommendations', 'Team', 'Comments', 'Messages'];
  }
};

const PageDetailsScreen = () => {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();

  const isTablet = width >= 768;
  const isLargeScreen = width >= 1024;

  const pageId = params?.pageId || '1';
  const pageName = params?.pageName || 'Page';
  const platform = params?.platform || 'facebook';
  const tabs = useMemo(() => getTabsForPlatform(platform), [platform]);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [refreshing, setRefreshing] = useState(false);

  const postTabRefreshRef = useRef(null);

  const registerRefresh = useCallback((fn) => {
    postTabRefreshRef.current = fn;
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (postTabRefreshRef.current) {
      await postTabRefreshRef.current();
    }
    setRefreshing(false);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Posts':
        return (
          <PostsTab
            onRegisterRefresh={registerRefresh}
            pageId={pageId}
            pageName={pageName}
            platform={platform}
          />
        );
      case 'Insights':
        return <InsightsTab pageId={pageId} pageName={pageName} platform={platform} />;
      case 'Competitors':
        return <CompetitorsTab pageId={pageId} pageName={pageName} platform={platform} />;
      case 'Recommendations':
        return <RecommendationsTab pageId={pageId} pageName={pageName} platform={platform} />;
      case 'Team':
        return <TeamTab pageId={pageId} pageName={pageName} platform={platform} />;
      case 'Comments':
        return <CommentsTab pageId={pageId} pageName={pageName} platform={platform} />;
      case 'Messages':
        return <MessagesTab pageId={pageId} pageName={pageName} platform={platform} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View className={`flex-1 ${isLargeScreen ? 'items-center' : ''}`}>
        <View className={`flex-1 bg-white ${isLargeScreen ? 'max-w-lg w-full shadow-xl' : 'w-full'}`}>
          {isTablet && (
            <View className="items-center py-4 bg-slate-50">
              <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6e226e' }}>
                Page Details
              </Text>
            </View>
          )}

          <Header />

          <View className="flex-1 bg-slate-50">
            <View className="px-5 pt-5 pb-4">
              <View className="flex-row items-center mb-4">
                <TouchableOpacity
                  onPress={() => router.push('/tabs/(social)')}
                  activeOpacity={0.7}
                  className="p-1 -ml-1 mr-3"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ArrowLeft size={24} color="#64748B" strokeWidth={2} />
                </TouchableOpacity>
                <View className="flex-1">
                  <Text className="text-xl font-semibold text-slate-800">{pageName}</Text>
                  <Text className="text-xs font-medium mt-0.5 capitalize" style={{ color: '#6e226e' }}>
                    {platform}
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="pb-2"
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {tabs.map((tab) => (
                  <TabButton
                    key={tab}
                    title={tab}
                    isActive={activeTab === tab}
                    onPress={() => setActiveTab(tab)}
                  />
                ))}
              </ScrollView>
            </View>

            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: isTablet ? 24 : 20,
                paddingBottom: 40,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#6e226e']}
                  tintColor="#6e226e"
                />
              }
            >
              {renderTabContent()}
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PageDetailsScreen;