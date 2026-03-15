import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native';
const BASE_URL = 'https://backend.epsilonfinder.com/api';
const INSIGHTS_BASE_URL = 'https://insights.epsilonfinder.com/api';

export const loginUser = async ({ email, password, remember = false, token = null }) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember, token }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getFacebookPages = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/user/${userId}/fb_pages`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Failed to fetch pages');
    return { success: true, pages: data.data.pages };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getInstagramPages = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const response = await fetch(`${BASE_URL}/manage/instapages?page=1&perPage=50`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Failed to fetch Instagram pages');
    return { success: true, pages: data.pages ?? data.data?.pages ?? data.data ?? [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getTiktokPages = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const response = await fetch(`${BASE_URL}/manage/tiktokpages?page=1&perPage=10`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Failed to fetch TikTok pages');
    return { success: true, pages: data.pages ?? data.data?.pages ?? data.data ?? [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getSnapchatPages = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const response = await fetch(`${BASE_URL}/manage/snapchatpages?page=1&perPage=50`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Failed to fetch Snapchat pages');
    return { success: true, pages: data.pages ?? data.data?.pages ?? data.data ?? [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getPageComments = async ({ pageId, platform = 'facebook', page = 1, perPage = 30, search = '', sort = 'desc' }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const platformPrefix = getPlatformPrefix(platform);
    const url = `${BASE_URL}/${platformPrefix}/${pageId}/comments?page=${page}&perPage=${perPage}&search=${search}&sort=${sort}`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Failed to fetch comments');
    return { success: true, comments: data.comments ?? data.data ?? [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getPagePosts = async ({ pageId, platform = 'facebook', page = 1, perPage = 20 }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const platformPrefix = getPlatformPrefix(platform);
    const url = `${BASE_URL}/${platformPrefix}/${pageId}/posts?page=${page}&perPage=${perPage}`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch posts');
    return { success: true, posts: data.posts ?? data.data?.posts ?? data.data ?? [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getPageRecommendations = async (pageId, platform = 'facebook') => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const platformPrefix = getPlatformPrefix(platform);
    const url = `${BASE_URL}/${platformPrefix}/${pageId}/recommendations`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch recommendations');
    return { success: true, recommendations: data.data ?? data.recommendations ?? [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getCompetitorsData = async ({ pageId, platform = 'facebook', limit = 10 }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const prefix = getCompetitorPrefix(platform);
    const to = new Date().toISOString();
    const url = `${BASE_URL}/${prefix}/${pageId}/all?limit=${limit}&to=${to}&pageFbid=${pageId}`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch competitors');
    return { success: true, competitors: data.competitorsData ?? [], pageData: data.pageData ?? {} };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getCompetitorsTopPosts = async ({ pageId, platform = 'facebook', limit = 10 }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const prefix = getCompetitorPrefix(platform);
    const to = new Date().toISOString();
    const url = `${BASE_URL}/${prefix}/${pageId}/all/posts/top?all=true&limit=${limit}&to=${to}`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch top posts');
    return { success: true, posts: data.competitorPosts ?? [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getCompetitorsInteractions = async ({ pageId, platform = 'facebook' }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const prefix = getCompetitorPrefix(platform);
    const url = `${BASE_URL}/${prefix}/${pageId}/graph/interactions`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch interactions');
    return { success: true, counters: data.counters ?? [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getPageAgents = async ({ pageId, platform = 'facebook' }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const platformPrefix = getPlatformPrefix(platform);
    const url = `${BASE_URL}/${platformPrefix}/${pageId}/agents`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch agents');
    return { success: true, agents: data.agents ?? [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getPageInfo = async ({ pageId, platform = 'facebook' }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const platformPrefix = getPlatformPrefix(platform);
    let infoEndpoint = 'fbinfo';
    if (platform === 'instagram') infoEndpoint = 'iginfo';
    else if (platform === 'tiktok') infoEndpoint = 'tiktokinfo';
    else if (platform === 'snapchat') infoEndpoint = 'snapchatinfo';
    const url = `${BASE_URL}/${platformPrefix}/${pageId}/${infoEndpoint}`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch page info');
    return { success: true, pageInfo: data.data?.Page ?? data.data ?? data.Page ?? {} };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getPageAnalysis = async ({ pageId, platform = 'facebook' }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const platformPrefix = getPlatformPrefix(platform);
    const url = `${BASE_URL}/${platformPrefix}/${pageId}/page_analysis`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch page analysis');
    return { success: true, counters: data.counters ?? {} };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getPageInsights = async ({ pageId, platform = 'facebook', from, to }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const insightsPrefix = getInsightsPlatformPrefix(platform);
    const url = `${INSIGHTS_BASE_URL}/${insightsPrefix}/pages/${pageId}/insights?_from=${from}&_to=${to}&per=Day`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch insights');
    return { success: true, metrics: data.data?.[0]?.metrics ?? {} };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getStatisticsCounters = async ({ pageId, platform = 'facebook', from, to }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const platformPrefix = getPlatformPrefix(platform);
    const url = `${BASE_URL}/${platformPrefix}/${pageId}/statistics/counters?_from=${from}&_to=${to}`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch statistics');
    return { success: true, counters: data.counters ?? {} };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getInteractionsPerDay = async ({ pageId, platform = 'facebook', from, to }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const platformPrefix = getPlatformPrefix(platform);
    const url = `${BASE_URL}/${platformPrefix}/${pageId}/statistics/posts/interactions_per_day?_from=${from}&_to=${to}&per=Day`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch interactions per day');
    return { success: true, counters: data.counters ?? [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getTopPosts = async ({ pageId, platform = 'facebook', from, to, limit = 10 }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const platformPrefix = getPlatformPrefix(platform);
    const url = `${BASE_URL}/${platformPrefix}/${pageId}/statistics/posts/top?limit=${limit}&_from=${from}&_to=${to}`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch top posts');
    return { success: true, topPosts: data.topPosts ?? [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getSentimentGraph = async ({ pageId, platform = 'facebook', from, to }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const platformPrefix = getPlatformPrefix(platform);
    const url = `${BASE_URL}/${platformPrefix}/${pageId}/posts/sentiment/graph?_from=${from}&_to=${to}`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch sentiment');
    return { success: true, percentage: data.data?.percentage ?? {}, words: data.data?.words ?? [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getPageChats = async ({ pageId, platform = 'facebook', page = 1 }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const platformPrefix = getPlatformPrefix(platform);
    const url = `${BASE_URL}/${platformPrefix}/${pageId}/chats?currentPage=${page}&totalItems=0&page=${page}`;
    console.log('=== getPageChats ===');
    console.log('Fetching URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    console.log('Chats response status:', response.status);
    if (!response.ok) throw new Error(data.message || 'Failed to fetch chats');

    return {
      success: true,
      chats: data.data ?? [],
      pageInfo: data.pageInfo ?? {},
    };
  } catch (error) {
    console.log('getPageChats ERROR:', error.message);
    return { success: false, message: error.message };
  }
};


export const getChatMessages = async (chatId, platform = 'facebook') => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');

    const chatPrefix = platform === 'instagram' ? 'ig-chats' : 'chats';
    const url = `${BASE_URL}/${chatPrefix}/${chatId}/messages/?seen=true`;

    console.log('=== getChatMessages ===');
    console.log('Fetching URL:', url);
    console.log('Platform:', platform);
    console.log('Chat ID:', chatId);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });

    const responseText = await response.text();
    console.log('Messages response status:', response.status);
    console.log('Messages raw response (first 500 chars):', responseText.substring(0, 500));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { messages: [] };
    }

    if (!response.ok) throw new Error(data.message || 'Failed to fetch messages');

    const messages = data.messages ?? data.data ?? [];
    console.log('Messages count:', messages.length);
    if (messages.length > 0) {
      console.log('First message keys:', Object.keys(messages[0]).join(', '));
      console.log('First message:', JSON.stringify(messages[0]).substring(0, 300));
    }

    return { success: true, messages };
  } catch (error) {
    console.log('getChatMessages ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const sendChatMessage = async ({ chatId, pageId, platform = 'facebook', text }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const url = `${BASE_URL}/chats/${chatId}/reply`;
    console.log('=== sendChatMessage ===');
    console.log('Sending to URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ message: text }),
    });
    const data = await response.json();
    console.log('Send message response status:', response.status);
    if (!response.ok) throw new Error(data.message || 'Failed to send message');

    return { success: true, data };
  } catch (error) {
    console.log('sendChatMessage ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

const getPlatformPrefix = (platform) => {
  switch (platform?.toLowerCase()) {
    case 'instagram': return 'ig-page';
    case 'tiktok': return 'tiktok-page';
    case 'snapchat': return 'snapchat-page';
    case 'facebook': default: return 'fb-page';
  }
};

const getCompetitorPrefix = (platform) => {
  switch (platform?.toLowerCase()) {
    case 'instagram': return 'ig-competitors';
    case 'tiktok': return 'tiktok-competitors';
    case 'snapchat': return 'snapchat-competitors';
    case 'facebook': default: return 'fb-competitors';
  }
};

const getInsightsPlatformPrefix = (platform) => {
  switch (platform?.toLowerCase()) {
    case 'instagram': return 'ig';
    case 'tiktok': return 'tiktok';
    case 'snapchat': return 'snapchat';
    case 'facebook': default: return 'fb';
  }
};

export const getTeamMembers = async ({ page = 1, perPage = 10 }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const url = `${BASE_URL}/user/me/team?page=${page}&perPage=${perPage}`;
    console.log('=== getTeamMembers ===');
    console.log('Fetching URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    console.log('Team response status:', response.status);
    if (!response.ok) throw new Error(data.message || 'Failed to fetch team');

    return {
      success: true,
      users: data.users ?? [],
      pageInfo: data.pageInfo ?? {},
    };
  } catch (error) {
    console.log('getTeamMembers ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const getRoles = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const url = `${BASE_URL}/roles`;
    console.log('=== getRoles ===');
    console.log('Fetching URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    console.log('Roles response status:', response.status);
    if (!response.ok) throw new Error(data.message || 'Failed to fetch roles');

    return { success: true, roles: data.roles ?? [] };
  } catch (error) {
    console.log('getRoles ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const createRole = async ({ name, permissions }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const url = `${BASE_URL}/roles/create`;
    console.log('=== createRole ===');
    console.log('POST URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name, permissions }),
    });
    const data = await response.json();
    console.log('Create role response status:', response.status);
    if (!response.ok) throw new Error(data.message || 'Failed to create role');

    return { success: true, role: data.role ?? {} };
  } catch (error) {
    console.log('createRole ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const getPermissions = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const url = `${BASE_URL}/permissions`;
    console.log('=== getPermissions ===');
    console.log('Fetching URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log('Permissions response status:', response.status);
    if (!response.ok) throw new Error(data.message || 'Failed to fetch permissions');

    return { success: true, permissions: data.permissions ?? {} };
  } catch (error) {
    console.log('getPermissions ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const getRoleById = async (roleId) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const url = `${BASE_URL}/roles/${roleId}`;
    console.log('=== getRoleById ===');
    console.log('Fetching URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log('Get role response status:', response.status);
    if (!response.ok) throw new Error(data.message || 'Failed to fetch role');

    return { success: true, role: data.role ?? {} };
  } catch (error) {
    console.log('getRoleById ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const updateRole = async (roleId, { name, permissions }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const url = `${BASE_URL}/roles/${roleId}/update`;
    console.log('=== updateRole ===');
    console.log('POST URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name, permissions }),
    });
    const data = await response.json();
    console.log('Update role response status:', response.status);
    if (!response.ok) throw new Error(data.message || 'Failed to update role');

    return { success: true, role: data.role ?? {} };
  } catch (error) {
    console.log('updateRole ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const deleteRole = async (roleId) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const url = `${BASE_URL}/roles/${roleId}/delete`;
    console.log('=== deleteRole ===');
    console.log('POST URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log('Delete role response status:', response.status);
    if (!response.ok) throw new Error(data.message || 'Failed to delete role');

    return { success: true, message: data.message ?? 'Role deleted!' };
  } catch (error) {
    console.log('deleteRole ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const createUser = async ({ name, email, password, password_confirmation, company_name, role }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const url = `${BASE_URL}/user/create`;
    console.log('=== createUser ===');
    console.log('POST URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email, password, password_confirmation, company_name, role }),
    });
    const data = await response.json();
    console.log('Create user response status:', response.status);
    if (!response.ok) throw new Error(data.message || 'Failed to create user');

    return { success: true, user: data.data ?? {} };
  } catch (error) {
    console.log('createUser ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const url = `${BASE_URL}/user/${userId}/profile`;
    console.log('=== getUserProfile ===');
    console.log('Fetching URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log('Get user profile response status:', response.status);
    if (!response.ok) throw new Error(data.message || 'Failed to fetch user profile');

    return { success: true, user: data.data?.user ?? {} };
  } catch (error) {
    console.log('getUserProfile ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const updateUser = async (userId, { name, email, password, password_confirmation, company_name, role }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const url = `${BASE_URL}/user/${userId}`;
    console.log('=== updateUser ===');
    console.log('PATCH URL:', url);

    const body = { name, email, company_name, role };
    if (password && password.trim()) {
      body.password = password;
      body.password_confirmation = password_confirmation;
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    console.log('Update user response status:', response.status);
    if (!response.ok) throw new Error(data.message || 'Failed to update user');

    return { success: true, user: data.data ?? {} };
  } catch (error) {
    console.log('updateUser ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const deleteUser = async (userId) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    const url = `${BASE_URL}/user/${userId}`;
    console.log('=== deleteUser ===');
    console.log('DELETE URL:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true, message: 'User deleted!' };
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      if (response.ok) {
        return { success: true, message: 'User deleted!' };
      }
      throw new Error('Failed to delete user');
    }

    const data = JSON.parse(text);
    console.log('Delete user response status:', response.status);
    if (!response.ok) throw new Error(data.message || 'Failed to delete user');

    return { success: true, message: data.message ?? 'User deleted!' };
  } catch (error) {
    console.log('deleteUser ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const getUserDayStats = async (userId, platform = null) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');
    let url = `${BASE_URL}/user/${userId}/day_stats`;
    if (platform) {
      url += `?platform=${platform}`;
    }
    console.log('=== getUserDayStats ===');
    console.log('Fetching URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log('Day stats response status:', response.status);
    if (!response.ok) throw new Error(data.message || 'Failed to fetch day stats');

    return {
      success: true,
      user: data.user ?? {},
      data: data.data ?? {},
    };
  } catch (error) {
    console.log('getUserDayStats ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const assignPagesToUser = async ({ pages, userId, platform = 'facebook' }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');

    const platformPrefix = getPlatformPrefix(platform);
    const platformShort = { facebook: 'fb', instagram: 'ig', tiktok: 'tiktok', snapchat: 'snapchat' }[platform] ?? 'fb';

    const url = `${BASE_URL}/${platformPrefix}/assign`;
    const body = { userId, platform: platformShort, pageIds: pages };

    console.log('=== assignPagesToUser ===');
    console.log('POST URL:', url);
    console.log('Sending body:', JSON.stringify(body));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    console.log('Raw response:', responseText);
    console.log('Response status:', response.status);

    let data;
    try { data = JSON.parse(responseText); } catch { data = { message: responseText }; }
    if (!response.ok) throw new Error(data.message || `Failed (Status: ${response.status})`);

    return { success: true, data: data.data ?? {} };
  } catch (error) {
    console.log('assignPagesToUser ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const createFacebookPost = async ({ pageId, type, message, file }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');

    console.log('=== createFacebookPost ===');
    const postUrl = `${BASE_URL}/fb-post/create/${pageId}?type=${type}`;
    console.log('URL:', postUrl);
    console.log('Type:', type);
    console.log('File URI:', file?.uri);

    if (type === 'status') {
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create post');
      return { success: true, data: data.data ?? {} };
    }

    console.log('Uploading file to media server...');
    const uploadFormData = new FormData();
    uploadFormData.append('file[]', {
      uri: file.uri,
      type: file.mimeType,
      name: file.fileName ?? `upload.${type === 'video' ? 'mp4' : 'jpg'}`,
    });
    uploadFormData.append('prefix', 'posts');

    const uploadResponse = await fetch(
      'https://media.epsilonfinder.com/media/upload-files?needsType=false',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      }
    );

    const uploadText = await uploadResponse.text();
    console.log('Upload status:', uploadResponse.status);
    console.log('Upload response:', uploadText);

    if (!uploadResponse.ok) throw new Error('Failed to upload file to media server');

    const uploadData = JSON.parse(uploadText);
    const fileUrl = uploadData.data?.[0];
    if (!fileUrl) throw new Error('No file URL returned from media server');
    console.log('File URL:', fileUrl);

    console.log('Creating post with file URL...');
    const postFormData = new FormData();
    postFormData.append('message', message ?? '');
    postFormData.append('urls[]', fileUrl);
    postFormData.append('thumb', 'null');

    const response = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: postFormData,
    });

    const responseText = await response.text();
    console.log('Post status:', response.status);
    console.log('Post response:', responseText);

    const data = JSON.parse(responseText);
    if (!response.ok) throw new Error(data.message || 'Failed to create post');
    return { success: true, data: data.data ?? {} };

  } catch (error) {
    console.log('createFacebookPost ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const uploadMediaFile = async (token, file, isInstagram = false) => {
  const uploadFormData = new FormData();
  uploadFormData.append('file[]', {
    uri: file.uri,
    type: file.mimeType,
    name: file.fileName ?? `upload_${Date.now()}.${file.mimeType?.split('/')[1] ?? 'jpg'}`,
  });
  uploadFormData.append('prefix', isInstagram ? 'instagram' : 'posts');

  const response = await fetch(
    `https://media.epsilonfinder.com/media/upload-files?needsType=${isInstagram}`,
    { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: uploadFormData }
  );

  const text = await response.text();
  if (!response.ok) throw new Error('Failed to upload file');
  const data = JSON.parse(text);

  if (isInstagram) {
    const item = data.data?.[0];
    return { url: item?.link, mimeType: item?.type };
  }
  return { url: data.data?.[0] };
};

export const createInstagramPost = async ({ pageId, type, message, file, files }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found.');

    const postUrl = `${BASE_URL}/ig-post/create/${pageId}`;
    console.log('=== createInstagramPost ===', { pageId, type, postUrl });

    const isVideo = file?.mimeType?.startsWith('video');

    let photoUrls = [];
    let videoUrls = [];

    if (type === 'carousel') {
      for (const f of files) {
        const uploaded = await uploadMediaFile(token, f, true);
        if (f.mimeType?.startsWith('video')) videoUrls.push(uploaded.url);
        else photoUrls.push(uploaded.url);
      }
    } else if (file) {
      const uploaded = await uploadMediaFile(token, file, true);
      console.log('Uploaded:', uploaded);
      if (isVideo) videoUrls.push(uploaded.url);
      else photoUrls.push(uploaded.url);
    }

    const body = {
      type,
      message: message ?? '',
      photoUrls,
      videoUrls,
    };

    console.log('Sending body:', JSON.stringify(body));

    const response = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    console.log('IG Post status:', response.status);
    console.log('IG Post response:', text);

    const data = JSON.parse(text);
    if (!response.ok) throw new Error(data.message || 'Failed to create post');
    return { success: true, data: data.data ?? {} };
  } catch (error) {
    console.log('createInstagramPost ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const updateFacebookPost = async ({ pageId, postId, message, file, existingUrl }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found.');

    const numericPostId = postId.includes('_') ? postId.split('_')[1] : postId;

    let fileUrl = existingUrl ?? null;
    if (file) {
      const uploaded = await uploadMediaFile(token, file, false);
      fileUrl = uploaded.url;
    }

    const body = { message: message ?? null, urls: fileUrl ? [fileUrl] : [] };
    const endpoint = `${BASE_URL}/fb-post/${numericPostId}/update/${pageId}`;

    console.log('Update URL:', endpoint);
    console.log('Update body:', JSON.stringify(body));

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    console.log('Update status:', response.status);
    console.log('Update response:', text);

    const data = JSON.parse(text);
    if (!response.ok) throw new Error(data.message || 'Failed to update post');
    return { success: true, data: data.data ?? {} };
  } catch (error) {
    console.log('updateFacebookPost ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const deleteFacebookPost = async ({ pageId, postId }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found.');

    const numericPostId = postId.includes('_') ? postId.split('_')[1] : postId;

    const endpoint = `${BASE_URL}/fb-post/${numericPostId}/delete/${pageId}`;
    console.log('Delete URL:', endpoint);

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const text = await response.text();
    console.log('Delete status:', response.status);
    console.log('Delete response:', text);

    const data = JSON.parse(text);
    if (!response.ok) throw new Error(data.message || 'Failed to delete post');
    return { success: true };
  } catch (error) {
    console.log('deleteFacebookPost ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

const getPlatformCommentPrefix = (platform) => {
  switch (platform) {
    case 'facebook': return 'fb-comments';
    case 'instagram': return 'ig-comments';
    case 'tiktok': return 'tiktok-comments';
    case 'snapchat': return 'snapchat-comments';
    default: return 'fb-comments';
  }
};

export const deleteComment = async ({ pageId, commentId, platform = 'facebook' }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');

    const prefix = getPlatformCommentPrefix(platform);
    const url = `${BASE_URL}/${prefix}/${pageId}/${commentId}/delete`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to delete comment');
    }

    return { success: true, comment: data.comment };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const hideComment = async ({ pageId, commentId, platform = 'facebook' }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');

    const prefix = getPlatformCommentPrefix(platform);
    const url = `${BASE_URL}/${prefix}/${pageId}/${commentId}/hide`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to hide comment');
    }

    return { success: true, comment: data.comment };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const likeComment = async ({ pageId, commentId, platform = 'facebook', isLiked = false }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');

    const prefix = getPlatformCommentPrefix(platform);
    const url = `${BASE_URL}/${prefix}/${pageId}/${commentId}/like`;

    const response = await fetch(url, {
      method: isLiked ? 'DELETE' : 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to update like');
    }

    return { success: true, comment: data.comment };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getAssignTeam = async ({ search = '', page = 1, perPage = 10 }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');

    const url = `${BASE_URL}/user/assign_team?page=${page}&perPage=${perPage}&search=${search}`;

    console.log('=== getAssignTeam ===');
    console.log('URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log('Assign team status:', response.status);
    console.log('Assign team users count:', data.users?.length);

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch team');
    }

    return { success: true, users: data.users ?? [], pageInfo: data.pageInfo ?? {} };
  } catch (error) {
    console.log('getAssignTeam ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const assignCommentToUser = async ({ userId, commentIds, platform = 'facebook' }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');

    const prefix = getPlatformCommentPrefix(platform);
    const platformShort = { facebook: 'fb', instagram: 'ig', tiktok: 'tiktok', snapchat: 'snapchat' }[platform] ?? 'fb';
    const url = `${BASE_URL}/${prefix}/assign`;

    const body = { userId, platform: platformShort, commentIds };

    console.log('=== assignCommentToUser ===');
    console.log('URL:', url);
    console.log('Body:', JSON.stringify(body));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Assign comment status:', response.status);
    console.log('Assign comment response:', JSON.stringify(data));

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to assign comment');
    }

    return { success: true };
  } catch (error) {
    console.log('assignCommentToUser ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const markCommentDone = async ({ pageId, commentId, platform = 'facebook' }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');

    const prefix = getPlatformCommentPrefix(platform);
    const url = `${BASE_URL}/${prefix}/${pageId}/${commentId}/done`;

    console.log('=== markCommentDone ===');
    console.log('URL:', url);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log('Done response status:', response.status);
    console.log('Done response:', JSON.stringify(data).substring(0, 300));

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to mark comment as done');
    }

    return { success: true, comment: data.comment };
  } catch (error) {
    console.log('markCommentDone ERROR:', error.message);
    return { success: false, message: error.message };
  }
};

export const getInquiryTypes = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');

    const url = `${BASE_URL}/inquiry-types`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch inquiry types');
    }

    return { success: true, inquiryTypes: data.data?.inquiryTypes ?? [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getSavedReplies = async ({ pageId, platform = 'facebook', type = 'comment', page = 1, perPage = 30 }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');

    const platformShort = { facebook: 'fb', instagram: 'ig', tiktok: 'tiktok', snapchat: 'snapchat' }[platform] ?? 'fb';
    const url = `${BASE_URL}/saved_replies?page=${page}&perPage=${perPage}&pageId=${pageId}&platform=${platformShort}&type=${type}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch saved replies');
    }

    return { success: true, replies: data.data?.replies ?? [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
};


const getUserPlatformPrefix = (platform) => {
  switch (platform) {
    case 'facebook': return 'fb-users';
    case 'instagram': return 'ig-users';
    case 'tiktok': return 'tiktok-users';
    case 'snapchat': return 'snapchat-users';
    default: return 'fb-users';
  }
};

export const getUserComments = async ({ userId, pageId, platform = 'facebook', page = 1 }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');

    const prefix = getUserPlatformPrefix(platform);
    const url = `${BASE_URL}/${prefix}/${userId}/page/${pageId}/comments?page=${page}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch user comments');
    }

    return { success: true, comments: data.comments ?? [], pageInfo: data.pageInfo ?? {} };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getCommentThread = async ({ pageId, commentId, platform = 'facebook', page = 1 }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');

    const prefix = getPlatformCommentPrefix(platform);
    const url = `${BASE_URL}/${prefix}/${pageId}/${commentId}?page=${page}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch comment thread');
    }

    return { success: true, comments: data.comments ?? [], pageInfo: data.pageInfo ?? {} };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const blockUser = async ({ pageId, userId, platform = 'facebook' }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');

    const platformPrefix = getPlatformPrefix(platform);
    const url = `${BASE_URL}/${platformPrefix}/${pageId}/users/${userId}/block`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to block user');
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getPlatformPostPrefix = (platform) => {
  switch (platform) {
    case 'facebook': return 'fb-post';
    case 'instagram': return 'ig-post';
    case 'tiktok': return 'tiktok-post';
    case 'snapchat': return 'snapchat-post';
    default: return 'fb-post';
  }
};
export const getSinglePost = async ({ postId, platform = 'facebook' }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found. Please log in again.');

    const prefix = getPlatformPostPrefix(platform);
    const url = `${BASE_URL}/${prefix}/${postId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch post');
    }

    return { success: true, post: data.data ?? {} };
  } catch (error) {
    return { success: false, message: error.message };
  }
};