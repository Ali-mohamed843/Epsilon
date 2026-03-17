# Epsilon Finder Mobile App

A comprehensive social media management mobile application built with **React Native** and **Expo Router**. Manage Facebook, Instagram, TikTok, and Snapchat pages from a single dashboard.

## Features

### 📱 Multi-Platform Support
- **Facebook** - Full page management with posts, comments, messages
- **Instagram** - Posts, comments, messages, and DMs
- **TikTok** - Insights and competitor analysis
- **Snapchat** - Insights and competitor analysis

### 📝 Posts Management
- View all page posts with media preview
- Create new posts (text, image, video)
- Edit existing posts (Facebook)
- Delete posts with confirmation
- View post engagement metrics (likes, comments, shares, views)
- Navigate to specific posts from comments

### 💬 Comments Management
- View and search comments with sorting (newest/oldest)
- Filter by status (All, Replied, Pending)
- **Actions on comments:**
  - 👍 Like/Unlike (Facebook)
  - 👁️ Hide/Unhide
  - 🗑️ Delete
  - 👤 Assign to team members
  - ✅ Mark as Done
  - 💬 Reply (with reply type, saved replies, inquiry types)
  - 🚫 Block user
- **Kebab menu options:**
  - View action history
  - View on Facebook/Instagram
  - View post
  - Comment thread
  - User comments
  - Block user
- Real-time updates via pull-to-refresh

### 📨 Messages / Chat
- View all conversations with last message preview
- Filter by status (All, Done, Pending)
- Search conversations
- **Real-time chat:**
  - Send and receive messages
  - Optimistic message sending
  - Support for text, images, stickers, emojis
  - Date dividers between messages
  - Message status indicators (Sending, Failed)
  - Manual refresh button
- Platform-specific message handling (Facebook Messenger, Instagram DMs)

### 📊 Insights & Analytics
- Page insights with date range selection
- Statistics counters
- Interactions per day charts
- Top posts analysis
- Sentiment analysis with graphs

### 🏆 Competitors
- Competitor comparison data
- Top competitor posts
- Interaction graphs

### 💡 Recommendations
- AI-powered page recommendations

### 👥 Team Management
- Add, edit, and delete team members
- Assign roles with granular permissions
- Assign pages to team members (per platform)
- View member performance stats
- Track response times and activity

### 🛡️ Roles & Permissions
- Create custom roles
- Categorized permissions (Pages, Comments, Messages, Posts, Users, etc.)
- Select all / per-category permission management

## Tech Stack

### Core
- **React Native** with **Expo SDK**
- **Expo Router** - File-based navigation
- **NativeWind** - Tailwind CSS for React Native

### State Management
- React hooks (`useState`, `useCallback`, `useRef`, `useMemo`)
- Local component state with optimistic updates

### Networking
- **Fetch API** for REST endpoints
- **Socket.IO** for real-time communication (ready for backend support)

### Storage
- **AsyncStorage** for auth tokens and user data

### UI
- **Lucide React Native** - Icon library
- Custom reusable components (ConfirmModal, StatusToast, IconButton, FilterButton)

## Project Structure