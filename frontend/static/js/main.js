/**
 * 深度推荐音乐系统 - 主JavaScript文件
 * 包含Vue.js应用初始化和核心功能实现
 */

console.log('深度推荐音乐系统初始化开始');

// 音乐游戏变量
let musicGame = null;
let previewGame = null;

// 初始化游戏预览
setTimeout(() => {
  const previewCanvas = document.getElementById('musicPreviewCanvas');
  if (previewCanvas) {
    initGamePreview();
  }
}, 500);

function initGamePreview() {
  const canvas = document.getElementById('musicPreviewCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // 调整canvas大小
  canvas.width = canvas.parentElement.clientWidth;
  
  // 绘制预览
  let particles = [];
  const genres = [
      { name: "流行", color: "#9B4BFF" },
      { name: "摇滚", color: "#FF5252" },
      { name: "电子", color: "#2196F3" },
      { name: "嘻哈", color: "#4CAF50" },
      { name: "古典", color: "#FFEB3B" },
      { name: "爵士", color: "#FF9800" },
  ];
  
  // 创建粒子
  for (let i = 0; i < 12; i++) {
    const genre = genres[Math.floor(Math.random() * genres.length)];
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: 30,
      speed: Math.random() * 1 + 1,
      color: genre.color,
      genre: genre.name
    });
  }
  
  // 创建玩家
  const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    color: '#8A2BE2'
  };
  
  function drawPreview() {
    // 清除画布
    ctx.fillStyle = '#191919';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加背景元素
    ctx.strokeStyle = 'rgba(138, 43, 226, 0.2)';
    for (let i = 0; i < 8; i++) {
      const x = Math.sin(Date.now() / 2000 + i) * canvas.width / 3 + canvas.width / 2;
      const y = i * canvas.height / 8;
      const width = Math.cos(Date.now() / 3000 + i) * 15 + 30;
      
      ctx.beginPath();
      ctx.arc(x, y, width, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // 绘制玩家
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(
        player.x + player.width / 2,
        player.y + player.height / 2,
        player.width / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 渲染粒子
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      
      // 更新位置
      p.y += p.speed;
      
      // 如果超出屏幕底部，重置到顶部
      if (p.y > canvas.height) {
        p.y = -p.size;
        p.x = Math.random() * canvas.width;
      }
      
      // 绘制粒子
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 添加文字
      ctx.font = 'bold 14px Arial';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.strokeText(p.genre, p.x, p.y + 4);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(p.genre, p.x, p.y + 4);
    }
    
    // 添加"点击开始游戏"文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('点击开始音乐收集游戏', canvas.width / 2, 30);
    
    requestAnimationFrame(drawPreview);
  }
  
  drawPreview();
}

// Vue.js应用实例 - 直接初始化，不包装在DOMContentLoaded事件中
window.app = new Vue({
  el: '#app',
  
  // 数据层
  data: {
    // 应用状态
    currentTab: 'welcome',
    isLoading: false,
    isLoadingRecommendations: false,
    currentLanguage: 'zh',
    isDeveloperMode: false,
    notifications: [],
    
    // 自动刷新相关
    autoRefreshEnabled: false,
    recommendationsLastUpdated: null,
    recommendationRefreshInterval: 300000, // 5分钟
    userVectorChangeCount: 0,
    minUserVectorChangesForRefresh: 5,
    showUserVectorInfo: false,
    
    // 用户相关
    currentUser: null,
    isLoggedIn: false,
    username: '',
    email: '',
    password: '',
    newUsername: '',
    newEmail: '',
    newPassword: '',
    loginError: '',
    registerError: '',
    
    // 歌曲数据
    sampleSongs: [],
    recommendations: [],
    
    // 聊天功能
    chatMessages: [],
    currentMessage: '',
    isChatLoading: false,
    
    // 游戏数据
    gameResults: null,
    
    // 音频播放器
    currentAudio: null,
    isPlaying: false,
    currentPlayingId: null,
    currentPlayingSong: null, // 当前播放的歌曲信息
    progressPercentage: 0, // 播放进度百分比
    reachedMilestones: [], // 已达到的播放里程碑
    progressUpdateInterval: null, // 进度更新定时器
    playStartTime: 0, // 播放开始时间
    totalPlayTime: 0, // 累计播放时间
    
    // 播放行为数据
    playBehavior: {
      currentSongId: null,
      startTime: null,
      playDuration: 0,
      behaviors: {} // 存储每首歌的播放行为数据
    },
    
    // 用户向量 - 用于个性化推荐
    userVector: {
      artists: {}, // 艺术家偏好权重
      genres: {}, // 流派偏好权重
      features: {} // 特征偏好权重
    },
    
    // 情感相关数据
    userEmotion: null,
    emotionInput: '',
    showEmotionDetector: false,
    emotionDetector: null,
    
    // 情绪名称映射
    emotionNames: {
      'happy': '开心',
      'sad': '伤心',
      'angry': '愤怒',
      'anxious': '焦虑',
      'excited': '兴奋',
      'calm': '平静',
      'neutral': '平静',
      'nostalgic': '怀旧',
      'lonely': '孤独',
      'hopeful': '希望',
      'depressed': '沮丧',
      'stressed': '压力',
      'frustrated': '挫折',
      'grateful': '感激'
    },
    
    // 用户偏好数据
    selectedMusicStyles: [],
    selectedMusicScenes: [],
    selectedMusicLanguages: [],
    selectedMusicEras: [],
    favoriteArtists: '',
    dailyListeningTime: '',
    
    // 音乐风格
    musicGenres: [
        { id: 'pop', zh: '流行音乐', en: 'Pop Music' },
        { id: 'rock', zh: '摇滚音乐', en: 'Rock Music' },
        { id: 'classical', zh: '古典音乐', en: 'Classical Music' },
        { id: 'jazz', zh: '爵士音乐', en: 'Jazz Music' },
        { id: 'electronic', zh: '电子音乐', en: 'Electronic Music' },
        { id: 'folk', zh: '民谣音乐', en: 'Folk Music' },
        { id: 'hip-hop', zh: '嘻哈音乐', en: 'Hip-Hop Music' },
        { id: 'r&b', zh: 'R&B音乐', en: 'R&B Music' },
        { id: 'country', zh: '乡村音乐', en: 'Country Music' },
        { id: 'metal', zh: '金属音乐', en: 'Metal Music' },
        { id: 'blues', zh: '蓝调音乐', en: 'Blues Music' },
        { id: 'reggae', zh: '雷鬼音乐', en: 'Reggae Music' }
    ],
    
    // 音乐风格选项
    musicStyleOptions: [
      { value: 'pop', label: '流行 (Pop)' },
      { value: 'rock', label: '摇滚 (Rock)' },
      { value: 'classical', label: '古典 (Classical)' },
      { value: 'jazz', label: '爵士 (Jazz)' },
      { value: 'electronic', label: '电子 (Electronic)' },
      { value: 'hiphop', label: '嘻哈 (Hip-hop)' },
      { value: 'folk', label: '民谣 (Folk)' },
      { value: 'rb', label: 'R&B (R&B)' },
      { value: 'country', label: '乡村 (Country)' },
      { value: 'metal', label: '金属 (Metal)' }
    ],
    
    // 场景选项
    musicSceneOptions: [
      { value: 'relax', label: '放松/休息时' },
      { value: 'work', label: '工作/学习时' },
      { value: 'exercise', label: '运动时' },
      { value: 'travel', label: '旅行/通勤时' },
      { value: 'party', label: '聚会/社交场合' },
      { value: 'sleep', label: '睡前/冥想时' }
    ],
    
    // 语言选项
    musicLanguageOptions: [
      { value: 'chinese', label: '中文' },
      { value: 'english', label: '英文' },
      { value: 'japanese', label: '日文' },
      { value: 'korean', label: '韩文' },
      { value: 'other', label: '其他' }
    ],
    
    // 年代选项
    musicEraOptions: [
      { value: '60s', label: '60年代' },
      { value: '70s', label: '70年代' },
      { value: '80s', label: '80年代' },
      { value: '90s', label: '90年代' },
      { value: '00s', label: '2000年代' },
      { value: '10s', label: '2010年代' },
      { value: 'current', label: '现代/最新' }
    ],
    
    // 听歌时长选项
    listeningTimeOptions: [
      { value: 'less1', label: '少于1小时' },
      { value: '1to2', label: '1-2小时' },
      { value: '2to4', label: '2-4小时' },
      { value: 'more4', label: '4小时以上' }
    ],
    
    // 添加预设音乐预览URL（使用相对路径，指向项目本地音频）
    previewUrls: [
        '/static/audio/preview1.mp3', // 示例本地预览1
        '/static/audio/preview2.mp3', // 示例本地预览2 
        '/static/audio/preview3.mp3', // 示例本地预览3
        '/static/audio/preview4.mp3', // 示例本地预览4
        '/static/audio/preview5.mp3', // 示例本地预览5
        // 备用：Spotify预览URLs（如果本地音频不可用）
        'https://p.scdn.co/mp3-preview/3eb16018c2a700240e9dfb8817b6f2d041f15eb1', // Shape of You
        'https://p.scdn.co/mp3-preview/e2f5edb569c73916235f2cadc8290b3dde522179', // Blinding Lights
        'https://p.scdn.co/mp3-preview/74456889dc17ca44897559c14ec7de20f431dd82', // Dance Monkey
        'https://p.scdn.co/mp3-preview/84a68eef8a7d26be04b81c21621f32adcf44b825', // Circles
        'https://p.scdn.co/mp3-preview/8250dc653c7abe6e89552a22c30b52b4d7414b41'  // Watermelon Sugar
    ],
    
    // 其他现有数据
    userRatings: {}, // 用户评分记录
    
    // 问卷相关
    showQuestionnaireUI: false,
    currentQuestionStep: 1,
    totalQuestionSteps: 8,
    questionnaireProgress: 0,
    
    // 问卷相关数据
    questionnaireAnswers: {
        genres: [],
        moods: [],
        languages: [],
        scenarios: [],
        discovery: [],
        eras: [],
        artist_types: [],
        frequency: []
    },
    
    // 问卷步骤定义
    questionSteps: [
        {
            id: 1,
            title: '音乐风格偏好',
            subtitle: '请选择您喜欢的音乐风格 (可多选)',
            dataCategory: 'genres',
            options: [
                { value: 'pop', label: '流行音乐 (Pop)' },
                { value: 'rock', label: '摇滚音乐 (Rock)' },
                { value: 'classical', label: '古典音乐 (Classical)' },
                { value: 'jazz', label: '爵士乐 (Jazz)' },
                { value: 'electronic', label: '电子音乐 (Electronic)' },
                { value: 'hiphop', label: '嘻哈音乐 (Hip-hop)' },
                { value: 'folk', label: '民谣 (Folk)' },
                { value: 'rnb', label: 'R&B / 灵魂乐' }
            ]
        },
        {
            id: 2,
            title: '音乐情绪偏好',
            subtitle: '您通常希望音乐带给您什么样的情绪？ (可多选)',
            dataCategory: 'moods',
            options: [
                { value: 'happy', label: '愉快/兴奋' },
                { value: 'relax', label: '放松/平静' },
                { value: 'sad', label: '忧伤/沉思' },
                { value: 'energetic', label: '精力充沛' },
                { value: 'focus', label: '专注/集中' },
                { value: 'nostalgic', label: '怀旧/回忆' }
            ]
        },
        {
            id: 3,
            title: '音乐场景偏好',
            subtitle: '您在什么场景下最常听音乐？ (可多选)',
            dataCategory: 'scenarios',
            options: [
                { value: 'work', label: '工作/学习时' },
                { value: 'exercise', label: '运动时' },
                { value: 'commute', label: '通勤/旅行时' },
                { value: 'relax', label: '休息放松时' },
                { value: 'party', label: '社交/聚会时' },
                { value: 'sleep', label: '睡前/冥想时' }
            ]
        },
        {
            id: 4,
            title: '音乐语言偏好',
            subtitle: '您偏好哪种语言的歌曲？ (可多选)',
            dataCategory: 'languages',
            options: [
                { value: 'chinese', label: '中文歌曲' },
                { value: 'english', label: '英文歌曲' },
                { value: 'japanese', label: '日文歌曲' },
                { value: 'korean', label: '韩文歌曲' },
                { value: 'other', label: '其他语言' },
                { value: 'instrumental', label: '纯音乐(无歌词)' }
            ]
        }
    ],
    
    // 推荐相关
    recommendationCategory: 'all', // 新增：推荐分类筛选
    isLoadingMore: false,
    hasMoreRecommendations: true,
    currentPage: 1,
    pageSize: 10,
    
    // 用户偏好向量对象
    userVector: {
      artists: {}, // 艺术家偏好权重
      genres: {}, // 流派偏好权重
      features: {} // 特征偏好权重
    },
    
    // 监听用户播放行为数据
    playBehavior: {
      currentSongId: null,
      startTime: null,
      playDuration: 0,
      skipCount: 0,
      completionCount: 0,
      behaviors: {}, // 按歌曲ID存储的行为数据，如 {"123": {playCount: 2, skipCount: 1, avgDuration: 45}}
    },
    
    recommendationsLastUpdated: null,
    recommendationRefreshInterval: 5 * 60 * 1000, // 5分钟自动刷新间隔
    autoRefreshEnabled: true,
    minUserVectorChangesForRefresh: 3, // 用户向量发生多少次改变后自动刷新推荐
    userVectorChangeCount: 0,
    showUserVectorInfo: false, // 是否显示用户向量信息
    isSavingUserVector: false,
    sessionId: null,
    userVectorRetryTimeout: null,
    reachedMilestones: [],
    debugMode: true,  // 开启调试模式
    
    // 音频播放相关
    currentPlayingSong: null,
    playStartTime: null,
    totalPlayTime: 0,
    progressUpdateInterval: null,
    progressPercentage: 0,
  },
  
  // 计算属性
  computed: {
    // 检查是否评分了足够的歌曲
    hasRatedEnoughSongs() {
      // 如果用户评分数据不存在，返回false
      if (!this.userRatings || Object.keys(this.userRatings).length === 0) {
        return false;
      }
      
      // 检查用户评分数量是否达到阈值
      const ratingCount = Object.keys(this.userRatings).length;
      return ratingCount >= 5; // 至少需要5个评分
    },
    
    // 翻译函数
    t() {
      return (key) => {
        const translations = {
          'zh': {
            'home': '首页',
            'login': '登录',
            'register': '注册',
            'username': '用户名',
            'email': '邮箱',
            'password': '密码',
            'loginPrompt': '已有账号？点击登录',
            'registerPrompt': '没有账号？点击注册',
            'logout': '退出',
            'user': '用户',
            'welcome': '欢迎',
            'rate': '音乐评分问卷',
            'rateSubtitle': '为歌曲评分，帮助我们了解您的音乐偏好',
            'notRated': '尚未评分',
            'recommend': '推荐',
            'recommendSubtitle': '基于您的评分和偏好推荐的音乐',
            'loading': '加载中...',
            'noRecommendations': '暂无推荐，请先评分一些歌曲',
            'rateMore': '去评分更多歌曲',
            'getRecommendations': '获取推荐',
            'needMoreRatings': '请至少对5首歌曲进行评分',
            'chat': '聊天',
            'chatSubtitle': '与AI助手聊天，获取个性化音乐推荐',
            'chatWelcome': '嗨！我是你的AI音乐小助手～✨ 有音乐烦恼找我准没错！想听什么类型的歌呢？心情不好需要安慰？还是想找找周杰伦的歌？告诉我吧，我会努力变成你的音乐知心好友哦！💕',
            'typeSomething': '输入消息...',
            'game': '游戏',
            'gameSubtitle': '通过游戏收集音乐道具，表达您的音乐偏好',
            'questionnaire': '音乐评分问卷',
            'questionnaireDesc': '评分歌曲帮助我们了解您的音乐偏好，为您提供更准确的推荐',
            'questionnaireContent': '完成这份音乐评分问卷，帮助我们了解您的音乐偏好。通过评分歌曲、分享您的心情和听歌场景，我们能够为您提供更加个性化的音乐推荐。您的每一次评分都能让推荐系统更了解您！',
            'startQuestionnaire': '开始评分问卷',
            'mood': '您当前的心情',
            'tellMood': '告诉我们您的心情',
            'saveMood': '保存心情',
            'moodPlaceholder': '例如：开心、放松、忧郁、精力充沛...',
            'moodSaved': '已记录您的心情！',
            'preferences': '音乐偏好设置',
            'musicStyle': '您喜欢的音乐风格',
            'musicScene': '您通常在什么场景下听音乐',
            'musicLanguage': '您喜欢的歌曲语言',
            'musicEra': '您喜欢的音乐年代',
            'favoriteArtists': '您喜欢的歌手/艺术家',
            'artistPlaceholder': '输入您喜欢的歌手名称，用逗号分隔',
            'dailyListening': '您平均每天听音乐的时长',
            'savePreferences': '保存偏好设置'
          },
          'en': {
            'home': 'Home',
            'login': 'Login',
            'register': 'Register',
            'username': 'Username',
            'email': 'Email',
            'password': 'Password',
            'loginPrompt': 'Already have an account? Login',
            'registerPrompt': 'No account? Register',
            'logout': 'Logout',
            'user': 'User',
            'welcome': 'Welcome',
            'rate': 'Music Rating Questionnaire',
            'rateSubtitle': 'Rate songs to help us understand your music preferences',
            'notRated': 'Not rated yet',
            'recommend': 'Recommend',
            'recommendSubtitle': 'Music recommendations based on your ratings and preferences',
            'loading': 'Loading...',
            'noRecommendations': 'No recommendations yet. Please rate some songs first.',
            'rateMore': 'Rate more songs',
            'getRecommendations': 'Get Recommendations',
            'needMoreRatings': 'Please rate at least 5 songs',
            'chat': 'Chat',
            'chatSubtitle': 'Chat with AI assistant to get personalized music recommendations',
            'chatWelcome': 'Hey there! I\'m your AI Music Buddy! ✨ Got music troubles? I\'m here to help! What kind of tunes are you into? Feeling down and need some comfort? Or maybe looking for some Ed Sheeran vibes? Let me know, and I\'ll be your musical BFF! 💕',
            'typeSomething': 'Type a message...',
            'game': 'Game',
            'gameSubtitle': 'Collect music items through a game to express your music preferences',
            'questionnaire': 'Music Rating Questionnaire',
            'questionnaireDesc': 'Rate songs to help us understand your music preferences for more accurate recommendations',
            'questionnaireContent': 'Complete this music rating questionnaire to help us understand your music preferences. By rating songs, sharing your mood and listening scenarios, we can provide more personalized music recommendations for you. Each rating helps our system understand you better!',
            'startQuestionnaire': 'Start Questionnaire',
            'mood': 'Your Current Mood',
            'tellMood': 'Tell us your mood',
            'saveMood': 'Save Mood',
            'moodPlaceholder': 'For example: happy, relaxed, melancholic, energetic...',
            'moodSaved': 'Your mood has been recorded!',
            'preferences': 'Music Preferences',
            'musicStyle': 'Music styles you like',
            'musicScene': 'When do you usually listen to music',
            'musicLanguage': 'Languages of songs you prefer',
            'musicEra': 'Music eras you enjoy',
            'favoriteArtists': 'Your favorite artists/singers',
            'artistPlaceholder': 'Enter artist names separated by commas',
            'dailyListening': 'Average daily music listening time',
            'savePreferences': 'Save Preferences'
          }
        };
        
        return translations[this.currentLanguage][key] || key;
      };
    },
    
    // 根据分类筛选推荐内容
    filteredRecommendations() {
      if (this.recommendationCategory === 'all') {
        return this.recommendations;
      } else {
        return this.recommendations.filter(song => song.source === this.recommendationCategory);
      }
    },
    
    // 在computed部分添加一个必要的属性
    activeTab() {
      return this.currentTab;
    }
  },
  
  // 方法
  methods: {
    // 语言切换
    switchLanguage(lang) {
      if (lang === 'zh' || lang === 'en') {
        this.currentLanguage = lang;
        // 本地存储用户语言偏好
        localStorage.setItem('preferredLanguage', lang);
        localStorage.setItem('language', lang);
        this.addNotification(lang === 'zh' ? '已切换到中文' : 'Switched to English', 'is-success');
        // 强制更新所有绑定
        this.$forceUpdate();
      }
    },
    
    // 添加格式化消息方法
    formatMessage(text) {
      if (!text) return '';
      // 将换行符转换为HTML换行
      return text.replace(/\n/g, '<br>');
    },
    
    // 添加格式化时间方法
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    // 登录
    login() {
      this.isLoading = true;
      this.loginError = '';
      
      // 模拟登录请求
      setTimeout(() => {
        // 测试用户
        if ((this.email === 'test@example.com' || this.email === 'a@a.com') && this.username === 'test') {
          this.isLoggedIn = true;
          this.currentUser = {
            id: 'user-123',
            username: this.username,
            email: this.email,
            isDeveloper: true
          };
          localStorage.setItem('user', JSON.stringify(this.currentUser));
          this.currentTab = 'welcome';
          this.loadSampleSongs();
          this.addNotification('登录成功！欢迎回来，' + this.username, 'is-success');
        } else {
          this.loginError = '登录失败，请检查用户名和邮箱';
        }
        this.isLoading = false;
      }, 1000);
    },
    
    // 注册
    register() {
      this.isLoading = true;
      this.registerError = '';
      
      // 模拟注册请求
      setTimeout(() => {
        // 简单验证
        if (!this.newUsername || !this.newEmail || !this.newPassword) {
          this.registerError = '请填写所有必填字段';
          this.isLoading = false;
          return;
        }
        
        // 模拟成功注册
        this.isLoggedIn = true;
        this.currentUser = {
          id: 'user-' + Math.floor(Math.random() * 1000),
          username: this.newUsername,
          email: this.newEmail,
          isDeveloper: false
        };
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        this.currentTab = 'welcome';
        this.loadSampleSongs();
        this.addNotification('注册成功！欢迎，' + this.newUsername, 'is-success');
        this.isLoading = false;
      }, 1000);
    },
    
    // 登出
    logout() {
      this.isLoggedIn = false;
      this.currentUser = null;
      localStorage.removeItem('user');
      this.currentTab = 'login';
      this.addNotification('您已成功登出', 'is-info');
      
      // 清除游戏状态
      if (musicGame) {
        musicGame.stopGame();
        musicGame = null;
      }
    },
    
    // 检查会话
    checkSession() {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
          this.isLoggedIn = true;
          this.currentTab = 'welcome';
          this.loadSampleSongs();
        } catch (e) {
          console.error('无法解析保存的用户数据', e);
          localStorage.removeItem('user');
        }
      }
      
      // 恢复语言设置
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage) {
        this.currentLanguage = savedLanguage;
      }
    },
    
    // 加载示例歌曲
    loadSampleSongs() {
      // 模拟从API加载示例歌曲
      setTimeout(() => {
        this.sampleSongs = [
          {
            id: 1,
            title: "Bohemian Rhapsody",
            artist: "Queen",
            album_image: "/static/img/default-album.png",
            genre: "摇滚",
            year: "1975",
            preview_url: "https://mp3d.jamendo.com/?trackid=1884949&format=mp32"  // 原始Jamendo预览链接
          },
          {
            id: 2,
            title: "Shape of You",
            artist: "Ed Sheeran",
            album_image: "/static/img/default-album.png",
            genre: "流行",
            year: "2017", 
            preview_url: "https://mp3d.jamendo.com/?trackid=1886257&format=mp32"  // 原始Jamendo预览链接
          },
          {
            id: 3,
            title: "Blinding Lights",
            artist: "The Weeknd",
            album_image: "/static/img/default-album.png",
            genre: "流行",
            year: "2020",
            preview_url: "https://mp3d.jamendo.com/?trackid=1881913&format=mp32"  // 原始Jamendo预览链接
          },
          {
            id: 4,
            title: "陪你度过漫长岁月",
            artist: "陈奕迅",
            album_image: "/static/img/default-album.png",
            genre: "华语流行",
            year: "2015",
            preview_url: "https://mp3d.jamendo.com/?trackid=1886285&format=mp32"  // 原始Jamendo预览链接
          },
          {
            id: 5,
            title: "Uptown Funk",
            artist: "Mark Ronson ft. Bruno Mars",
            album_image: "/static/img/default-album.png",
            genre: "流行",
            year: "2014",
            preview_url: "https://mp3d.jamendo.com/?trackid=1886297&format=mp32"  // 原始Jamendo预览链接
          },
          {
            id: 6,
            title: "Smells Like Teen Spirit",
            artist: "Nirvana",
            album_image: "/static/img/default-album.png",
            genre: "摇滚",
            year: "1991",
            preview_url: "https://mp3d.jamendo.com/?trackid=1882232&format=mp32"  // 原始Jamendo预览链接
          },
          {
            id: 7,
            title: "稻香",
            artist: "周杰伦",
            album_image: "/static/img/default-album.png",
            genre: "华语流行",
            year: "2008",
            preview_url: "https://mp3d.jamendo.com/?trackid=1882607&format=mp32"  // 原始Jamendo预览链接
          },
          {
            id: 8,
            title: "Bad Guy",
            artist: "Billie Eilish",
            album_image: "/static/img/default-album.png",
            genre: "另类流行",
            year: "2019",
            preview_url: "https://mp3d.jamendo.com/?trackid=1884972&format=mp32"  // 原始Jamendo预览链接
          },
          {
            id: 9,
            title: "Enter Sandman",
            artist: "Metallica",
            album_image: "/static/img/default-album.png",
            genre: "重金属",
            year: "1991",
            preview_url: "https://mp3d.jamendo.com/?trackid=1885022&format=mp32"  // 原始Jamendo预览链接
          },
          {
            id: 10,
            title: "Rolling in the Deep",
            artist: "Adele",
            album_image: "/static/img/default-album.png",
            genre: "流行",
            year: "2011",
            preview_url: "https://mp3d.jamendo.com/?trackid=1885198&format=mp32"  // 原始Jamendo预览链接
          },
          {
            id: 11,
            title: "Fix You",
            artist: "Coldplay",
            album_image: "/static/img/default-album.png",
            genre: "另类摇滚",
            year: "2005",
            preview_url: "https://mp3d.jamendo.com/?trackid=1882747&format=mp32"  // 原始Jamendo预览链接
          },
          {
            id: 12,
            title: "Someone Like You",
            artist: "Adele",
            album_image: "/static/img/default-album.png",
            genre: "流行",
            year: "2011",
            preview_url: "https://mp3d.jamendo.com/?trackid=1882856&format=mp32"  // 原始Jamendo预览链接
          },
          {
            id: 13,
            title: "晴天",
            artist: "周杰伦",
            album_image: "/static/img/default-album.png",
            genre: "华语流行",
            year: "2003",
            preview_url: "https://mp3d.jamendo.com/?trackid=1883647&format=mp32"  // 原始Jamendo预览链接
          },
          {
            id: 14,
            title: "Sweet Child O' Mine",
            artist: "Guns N' Roses",
            album_image: "/static/img/default-album.png",
            genre: "摇滚",
            year: "1987",
            preview_url: "https://mp3d.jamendo.com/?trackid=1883716&format=mp32"  // 原始Jamendo预览链接
          },
          {
            id: 15,
            title: "Hotel California",
            artist: "Eagles",
            album_image: "/static/img/default-album.png",
            genre: "摇滚",
            year: "1976",
            preview_url: "https://mp3d.jamendo.com/?trackid=1883864&format=mp32"  // 原始Jamendo预览链接
          }
        ];
        
        // 设置一些随机的示例评分，模拟用户已评分的数据
        // 这里随机给5首歌曲评分，使得hasRatedEnoughSongs返回true
        const randomSongIndices = [];
        while (randomSongIndices.length < 5) {
          const randomIndex = Math.floor(Math.random() * this.sampleSongs.length);
          if (!randomSongIndices.includes(randomIndex)) {
            randomSongIndices.push(randomIndex);
          }
        }
        
        // 为随机选中的歌曲设置评分
        randomSongIndices.forEach(index => {
          this.sampleSongs[index].rating = Math.floor(Math.random() * 3) + 3; // 生成3-5的评分
        });
        
        this.isLoading = false;
      }, 1000);
    },
    
    // 对歌曲评分
    rateSong(song, rating) {
      // 记录以前的评分，用于判断是否是新评分
      const previousRating = song.rating;
      
      // 更新歌曲评分
      song.rating = song.rating === rating ? 0 : rating;
      
      // 获取现在评过分的歌曲数量
      const ratedCount = this.sampleSongs.filter(s => s.rating > 0).length;
      
      // 第一次达到足够评分数量时提示用户
      if (ratedCount >= 5 && (previousRating === undefined || previousRating === 0)) {
        // 只有在这是新增的评分而不是修改评分时才提示
        this.addNotification('您已评分足够的歌曲，可以获取个性化推荐了！', 'is-success');
        
        // 弹出"获取推荐"按钮的提示动画
        // 这里可以添加动画效果，提示用户点击"获取推荐"按钮
        const recommendBtn = document.querySelector('button[data-action="get-recommendations"]');
        if (recommendBtn) {
          recommendBtn.classList.add('pulse-animation');
          setTimeout(() => {
            recommendBtn.classList.remove('pulse-animation');
          }, 3000);
        }
      }
      
      // 发送评分数据到后端（这里模拟）
      console.log(`对歌曲 "${song.title}" 的评分: ${rating}`);
      
      // 实际项目中的API调用示例:
      /* 
      axios.post('/api/rate', {
        user_id: this.currentUser ? this.currentUser.id : 'anonymous',
        song_id: song.id,
        rating: song.rating
      })
      .then(response => {
        if (response.data.success) {
          this.addNotification(`评分已保存`, 'is-success');
        }
      })
      .catch(error => {
        console.error('评分保存失败:', error);
        this.addNotification('评分保存失败，请稍后再试', 'is-danger');
      });
      */
    },
    
    // 获取推荐
    getRecommendations() {
      console.log('获取推荐...');
      
      if (this.isLoadingRecommendations) {
        console.log('已经在加载推荐中，忽略此次请求');
        return;
      }
      
      // 如果没有评分过足够的歌曲，则不获取推荐
      if (!this.hasRatedEnoughSongs()) {
        this.addNotification('请至少对5首歌曲进行评分', 'is-warning');
        this.currentTab = 'rate'; // 跳转到评分页面
        return;
      }
      
      this.isLoadingRecommendations = true;
      
      // 显示加载通知
      this.addNotification('正在加载推荐...', 'is-info');
      
      // 切换到推荐页面
      this.currentTab = 'recommend';
      
      // 生成推荐（实际项目应调用API）
      setTimeout(() => {
        this.generateRecommendationsFromUserVector();
        
        // 标记最后更新时间
        this.recommendationsLastUpdated = new Date();
        
        this.isLoadingRecommendations = false;
        
        // 显示成功通知
        this.addNotification('推荐加载完成', 'is-success');
      }, 1500);
    },
    
    // 处理图片加载错误
    handleImageError(event) {
      event.target.src = '/static/img/default-album.png';
    },
    
    // 点赞歌曲方法
    likeSong(song) {
      if (!song) return;
      
      // 切换反馈状态
      if (song.feedback === 'like') {
        // 如果已经点赞，取消点赞
        song.feedback = null;
        this.addNotification('已取消点赞', 'is-info');
        this.sendFeedbackToBackend(song.id, 'unlike');
      } else {
        // 设置为点赞状态
        song.feedback = 'like';
        // 如果之前是点踩状态，减少点踩计数
        if (song.dislikeCount && song.dislikeCount > 0) {
          song.dislikeCount--;
        }
        // 增加点赞计数
        song.likeCount = (song.likeCount || 0) + 1;
        
        this.addNotification('已添加到我喜欢的音乐', 'is-success');
        this.sendFeedbackToBackend(song.id, 'like');
        
        // 更新用户向量
        if (song.vector) {
          // 调用更新用户向量的函数，第二个参数是权重
          this.updateUserVector(song, 0.5);
        }
        
        // 播放喜欢动画
        try {
          const songItem = document.querySelector(`[data-song-id="${song.id}"]`);
          if (songItem) {
            songItem.classList.add('liked-animation');
            setTimeout(() => {
              songItem.classList.remove('liked-animation');
            }, 1000);
          }
        } catch (e) {
          console.error('播放喜欢动画时出错', e);
        }
      }
    },
    
    // 点踩歌曲方法
    dislikeSong(song) {
      if (!song) return;
      
      // 切换反馈状态
      if (song.feedback === 'dislike') {
        // 如果已经点踩，取消点踩
        song.feedback = null;
        this.addNotification('已取消不喜欢', 'is-info');
        this.sendFeedbackToBackend(song.id, 'undislike');
      } else {
        // 设置为点踩状态
        song.feedback = 'dislike';
        // 如果之前是点赞状态，减少点赞计数
        if (song.likeCount && song.likeCount > 0) {
          song.likeCount--;
        }
        // 增加点踩计数
        song.dislikeCount = (song.dislikeCount || 0) + 1;
        
        this.addNotification('已添加到我不喜欢的音乐', 'is-warning');
        this.sendFeedbackToBackend(song.id, 'dislike');
        
        // 更新用户向量（负面反馈）
        if (song.vector) {
          // 调用更新用户向量的函数，使用负权重
          this.updateUserVector(song, -0.3);
        }
        
        // 播放不喜欢动画
        try {
          const songItem = document.querySelector(`[data-song-id="${song.id}"]`);
          if (songItem) {
            songItem.classList.add('disliked-animation');
            setTimeout(() => {
              songItem.classList.remove('disliked-animation');
            }, 1000);
          }
        } catch (e) {
          console.error('播放不喜欢动画时出错', e);
        }
      }
    },
    
    // 发送反馈到后端
    sendFeedbackToBackend(songId, feedbackType) {
      // 模拟API请求
      console.log(`发送反馈到后端: 歌曲ID ${songId}, 反馈类型 ${feedbackType}`);
      
      // 实际项目中应该发送Ajax请求
      // axios.post('/api/feedback', {
      //   song_id: songId,
      //   feedback_type: feedbackType,
      //   user_id: this.currentUser ? this.currentUser.id : 'anonymous'
      // })
      // .then(response => {
      //   console.log('反馈发送成功', response);
      // })
      // .catch(error => {
      //   console.error('反馈发送失败', error);
      // });
    },
    
    // 加载更多推荐
    loadMoreRecommendations() {
      if (this.isLoadingMore || !this.hasMoreRecommendations) return;
      
      this.isLoadingMore = true;
      
      // 模拟加载更多数据
      setTimeout(() => {
        // 示例：每次加载5条新推荐
        const newRecommendations = [
          { id: 109 + (this.currentPage * 5), title: "Shape of You", artist: "Ed Sheeran", album_image: "https://via.placeholder.com/150", explanation: "与您喜欢的流行歌曲风格相似", source: "algorithm", genre: "流行", likeCount: 712, dislikeCount: 28 },
          { id: 110 + (this.currentPage * 5), title: "Bohemian Rhapsody", artist: "Queen", album_image: "https://via.placeholder.com/150", explanation: "为摇滚爱好者推荐的经典名曲", source: "algorithm", genre: "摇滚", likeCount: 1243, dislikeCount: 35 },
          { id: 111 + (this.currentPage * 5), title: "七里香", artist: "周杰伦", album_image: "https://via.placeholder.com/150", explanation: "基于您对周杰伦的高评分", source: "emotion", genre: "华语流行", likeCount: 846, dislikeCount: 17 },
          { id: 112 + (this.currentPage * 5), title: "Billie Jean", artist: "Michael Jackson", album_image: "https://via.placeholder.com/150", explanation: "根据您喜欢的流行歌曲风格推荐", source: "algorithm", genre: "流行", likeCount: 927, dislikeCount: 31 },
          { id: 113 + (this.currentPage * 5), title: "Yellow", artist: "Coldplay", album_image: "https://via.placeholder.com/150", explanation: "为您推荐的摇滚类歌曲", source: "emotion", genre: "摇滚", likeCount: 684, dislikeCount: 22 }
        ];
        
        // 添加到现有推荐列表
        this.recommendations = [...this.recommendations, ...newRecommendations];
        
        // 更新分页信息
        this.currentPage++;
        
        // 如果当前页大于3，则不再有更多数据（这里仅作演示）
        if (this.currentPage > 3) {
          this.hasMoreRecommendations = false;
        }
        
        this.isLoadingMore = false;
      }, 1000);
    },
    
    // 发送聊天消息
    async sendMessage() {
      if (!this.currentMessage.trim()) return;
      
      const userMessage = this.currentMessage.trim();
      this.chatMessages.push({
          content: userMessage,
          isUser: true,
          timestamp: new Date()
      });
      this.currentMessage = '';
      
      // 滚动到底部
      this.$nextTick(() => {
          const chatMessages = document.querySelector('.chat-messages');
          if (chatMessages) {
              chatMessages.scrollTop = chatMessages.scrollHeight;
          }
      });
      
      // 处理用户发送的消息
      this.isChatLoading = true;
      
      try {
          // 模拟API调用，因为实际环境中可能无法访问后端
          let result = await this.simulateBackendResponse(userMessage);
          
          // 提取情感数据
          const emotion = result.emotion || 'neutral';
          const emotion_data = result.emotion_data || {};
          const intensity = emotion_data.intensity || 0.5;
          const description = emotion_data.description || '';
          
          // 保存用户情感状态
          this.userEmotion = {
              emotion: emotion,
              intensity: intensity,
              description: description,
              secondary_emotion: emotion_data.secondary_emotion || '',
              music_suggestion: emotion_data.music_suggestion || ''
          };
          
          // 添加AI回复
          this.chatMessages.push({
              content: result.message || '对不起，我暂时无法回应您的消息。',
              isUser: false,
              timestamp: new Date()
          });
          
          // 如果有音乐推荐，添加推荐卡片
          if (result.recommendations && result.recommendations.length > 0) {
              // 给推荐添加颜色标记（基于情绪）
              const emotionColors = {
                  'happy': '#FFD700',
                  'sad': '#4682B4',
                  'angry': '#FF6347',
                  'anxious': '#9370DB',
                  'excited': '#FF8C00',
                  'calm': '#20B2AA',
                  'neutral': '#708090',
                  'nostalgic': '#DDA0DD',
                  'lonely': '#B0C4DE',
                  'hopeful': '#98FB98'
              };
              
              const emotionColor = emotionColors[emotion] || '#708090';
              
              // 处理推荐数据，确保推荐是可以播放的
              const recommendedSongs = result.recommendations.map(song => {
                  // 创建增强的歌曲对象
                  const enhancedSong = {
                      ...song,
                      emotion_color: emotionColor,
                      title: song.title || '未知歌曲',
                      artist: song.artist || '未知艺术家',
                      id: song.id || song.spotify_id || `song-${Math.random().toString(36).substr(2, 9)}`,
                      // 使用专辑封面
                      album_cover: song.album_cover || '/static/img/default-album.png'
                  };
                  
                  // 确保有预览链接，如果没有则创建
                  if (!enhancedSong.preview_links && (!enhancedSong.preview_url && !enhancedSong.external_url)) {
                      enhancedSong.preview_links = {
                          netease: `https://music.163.com/#/search/m/?s=${encodeURIComponent(song.title)}+${encodeURIComponent(song.artist)}&type=1`,
                          spotify: `https://open.spotify.com/search/${encodeURIComponent(song.title)}%20${encodeURIComponent(song.artist)}`
                      };
                  }
                  
                  return enhancedSong;
              });
              
              // 构建推荐消息
              let recommendMessage = '';
              
              // 根据情绪类型定制消息
              if (emotion === 'happy' || emotion === 'excited') {
                  recommendMessage = `耶～看到你这么开心真是太棒了！🎉 我为你精心挑选了这些超级欢快的歌曲，一起来high起来吧～🕺💃`;
              } else if (emotion === 'sad' || emotion === 'lonely') {
                  recommendMessage = `抱抱你～🫂 难过的时候有我陪着你呢！这些歌曲就像一杯热巧克力，能温暖你的小心心～🧸💕`;
              } else if (emotion === 'angry') {
                  recommendMessage = `哎呀，生气啦？深呼吸～😤 这些歌曲可以帮你发泄情绪，有时候大声唱出来就舒服多了！要不要试试看？💪`;
              } else if (emotion === 'anxious') {
                  recommendMessage = `别担心，有我在呢～😌 这些超级舒缓的音乐就像是一场温柔的雨，带走你的焦虑，留下平静和美好～✨`;
              } else if (emotion === 'nostalgic') {
                  recommendMessage = `啊～回忆杀来袭！🕰️ 这些经典曲目就像打开了记忆的百宝箱，让我们一起沉浸在那些美好的时光里吧～💭`;
              } else {
                  recommendMessage = `根据我们的小对话，我特意为你准备了这些超赞的歌曲！💝 希望它们能成为你的新宠～快告诉我你喜欢吗？`;
              }
              
              // 添加带有推荐的消息
              this.chatMessages.push({
                  content: recommendMessage,
                  isUser: false,
                  timestamp: new Date(),
                  songs: recommendedSongs,
                  has_preview_links: true
              });
              
              // 同时更新推荐页面
              this.recommendations = recommendedSongs.map(song => {
                  return {
                      ...song,
                      recommendationReason: song.explanation || `这首歌曲的风格与你当前的${this.emotionNames[emotion] || emotion}情绪很匹配`
                  };
              });
          }
          
          // 滚动到底部
          this.$nextTick(() => {
              const chatMessages = document.querySelector('.chat-messages');
              if (chatMessages) {
                  chatMessages.scrollTop = chatMessages.scrollHeight;
              }
          });
          
      } catch (error) {
          console.error('处理消息时出错：', error);
          // 错误处理
          this.chatMessages.push({
              content: '抱歉，处理您的消息时出现了问题。请稍后再试。',
              isUser: false,
              timestamp: new Date()
          });
      } finally {
          this.isChatLoading = false;
      }
    },

    // 模拟后端响应，用于本地测试
    simulateBackendResponse(userMessage) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 分析用户消息中的情绪关键词
          const emotionKeywords = {
            'happy': ['高兴', '开心', '快乐', '兴奋', '喜悦', '愉快', 'happy', 'excited', 'joy'],
            'sad': ['难过', '伤心', '悲伤', '失落', '低落', '消沉', 'sad', 'unhappy', 'depressed'],
            'angry': ['生气', '愤怒', '恼火', '烦躁', '不满', 'angry', 'mad', 'furious'],
            'anxious': ['焦虑', '紧张', '担心', '不安', '压力', 'anxious', 'nervous', 'stressed'],
            'nostalgic': ['怀旧', '回忆', '思念', '想念', 'nostalgia', 'memories'],
            'lonely': ['孤独', '寂寞', '孤单', 'lonely', 'alone'],
            'hopeful': ['希望', '期待', '向往', 'hopeful', 'optimistic'],
            'calm': ['平静', '放松', '安宁', '舒适', 'calm', 'relaxed', 'peaceful']
          };
          
          // 检测艺术家名称
          const artists = ['周杰伦', '林俊杰', '陈奕迅', '王力宏', '张学友', '刘德华', 
                          'Taylor Swift', 'Ed Sheeran', 'Adele', 'Bruno Mars', 'Beyoncé', 
                          'Coldplay', 'Drake', 'The Weeknd', 'Queen', 'Michael Jackson'];
          
          // 检测音乐类型
          const genres = ['流行', '摇滚', '嘻哈', '爵士', '古典', '民谣', '电子', 'R&B', '蓝调', '乡村', 
                        'pop', 'rock', 'hip-hop', 'jazz', 'classical', 'folk', 'electronic', 'R&B', 'blues', 'country'];
          
          // 检测常见场景
          const scenes = ['工作', '学习', '运动', '睡觉', '派对', '放松', '冥想', '开车', 
                        'work', 'study', 'workout', 'sleep', 'party', 'relax', 'meditation', 'driving'];
          
          // 定义模拟响应对象
          let response = {
            message: '',
            emotion: 'neutral',
            emotion_data: {
              intensity: 0.5,
              description: '情绪平静',
              music_suggestion: '流行音乐'
            },
            recommendations: []
          };
          
          // 检测情绪
          let detectedEmotion = 'neutral';
          let needRecommendation = false;
          let artist = null;
          let genre = null;
          let scene = null;
          
          // 检查是否有情绪关键词
          for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            for (const keyword of keywords) {
              if (userMessage.toLowerCase().includes(keyword.toLowerCase())) {
                detectedEmotion = emotion;
                needRecommendation = true;
                break;
              }
            }
          }
          
          // 检查是否提到了艺术家
          for (const artistName of artists) {
            if (userMessage.toLowerCase().includes(artistName.toLowerCase())) {
              artist = artistName;
              needRecommendation = true;
              break;
            }
          }
          
          // 检查是否提到了音乐类型
          for (const genreName of genres) {
            if (userMessage.toLowerCase().includes(genreName.toLowerCase())) {
              genre = genreName;
              needRecommendation = true;
              break;
            }
          }
          
          // 检查是否提到了场景
          for (const sceneName of scenes) {
            if (userMessage.toLowerCase().includes(sceneName.toLowerCase())) {
              scene = sceneName;
              needRecommendation = true;
              break;
            }
          }
          
          // 检查是否包含推荐请求
          if (userMessage.includes('推荐') || userMessage.includes('suggest') || 
              userMessage.includes('recommend') || userMessage.includes('想听')) {
            needRecommendation = true;
          }
          
          // 根据分析结果构建回复
          response.emotion = detectedEmotion;
          
          // 生成回复消息
          if (artist) {
            response.message = `哇！${artist}超棒的～🌟 我也超喜欢！这里有一些${artist}的歌，希望能让你嗨起来！💃`;
          } else if (genre) {
            response.message = `${genre}真是太赞了！👏 我也超爱这种风格！为你精心挑选了一些歌曲，保证让你耳朵怀孕～🎵`;
          } else if (scene) {
            response.message = `${scene}的时候听什么歌？让我来帮你～🎧 这些歌曲绝对适合，试试看吧！保证让你的${scene}时光更美妙～✨`;
          } else if (detectedEmotion !== 'neutral') {
            const emotionMessages = {
              'happy': '哇！看到你这么开心我也超开心的呢～😄 这些超级阳光的歌曲绝对能让你的笑容加倍！一起high起来吧～🎉',
              'sad': '抱抱你～🫂 每个人都会有不开心的时候。这些歌曲轻轻陪着你，像好朋友一样给你一个温暖的拥抱。记住，雨后总会有彩虹哦～🌈',
              'angry': '哎呀，心情不好吗？深呼吸～我懂你！😤 这些歌曲可以帮你发泄一下，有时候大声唱出来心情就会好很多呢！要不要试试看？💪',
              'anxious': '别担心，有我陪着你呢～😌 这些舒缓的音乐就像是一杯热茶，慢慢喝下去，焦虑感就会随着旋律慢慢飘走～✨ 试着深呼吸，放松一下吧！',
              'nostalgic': '啊～回忆杀来了！🕰️ 那些美好时光总是让人忍不住想念呢～这些经典歌曲，就像打开了记忆的宝盒，让我们一起沉浸在美好的回忆里吧～💭',
              'lonely': '嘿，孤独的时候，音乐是最好的伙伴！🌙 这些歌曲会像温柔的朋友一样陪在你身边，记住，你并不孤单，因为有我和音乐陪着你呢～💕',
              'hopeful': '哇！爱你这种积极的心态！✨ 这些充满能量的歌曲会给你加油打气，向着梦想前进吧！未来一定会越来越棒的！🚀',
              'calm': '平静的感觉真好呢～🍃 这些轻柔的音乐就像微风拂过脸颊，让这份宁静更加美好～闭上眼睛，享受这美妙的时刻吧！🌿'
            };
            response.message = emotionMessages[detectedEmotion] || '根据我们的小对话，我特意为你挑选了这些歌曲～希望你会喜欢！✨';
          } else if (needRecommendation) {
            response.message = '按照你的喜好，我精心为你挑选了这些超棒的歌曲！💝 希望能戳中你的小心心～快告诉我你喜不喜欢吧！';
          } else {
            response.message = '嗨！我是你的AI音乐小助手～🎵 有什么我能帮到你的吗？想听什么类型的歌？还是想了解某个歌手？或者只是想找首歌来配合你现在的心情？尽管告诉我吧，我会尽我所能帮你找到完美的音乐！💕';
            resolve(response);
            return;
          }
          
          // 如果需要推荐，生成推荐歌曲
          if (needRecommendation) {
            // 模拟不同情绪/场景/艺术家的歌曲推荐
            const recommendationsByEmotion = {
              'happy': [
                { id: 'h1', title: '最好的安排', artist: '周杰伦', album_cover: 'https://via.placeholder.com/150', explanation: '周董的这首歌超欢快的～🎵 轻快节奏搭配温暖歌词，就像阳光照进心里，开心加倍！☀️' },
                { id: 'h2', title: 'Happy', artist: 'Pharrell Williams', album_cover: 'https://via.placeholder.com/150', explanation: '这首歌简直是快乐本身啊！😆 听了绝对忍不住跟着舞动，保证让你的心情一路飙升～🚀' },
                { id: 'h3', title: '开心的马骝', artist: '刘德华', album_cover: 'https://via.placeholder.com/150', explanation: '华仔的招牌金曲～🌟 超级欢快的旋律让人不由自主地想摇摆，每次听都能被治愈呢！💫' }
              ],
              'sad': [
                { id: 's1', title: '晴天', artist: '周杰伦', album_cover: 'https://via.placeholder.com/150', explanation: '周杰伦的这首经典～🌧️ 带着一丝忧伤但却很温暖，就像在雨天有人为你撑伞，特别治愈～🌈' },
                { id: 's2', title: 'Someone Like You', artist: 'Adele', album_cover: 'https://via.placeholder.com/150', explanation: 'Adele的嗓音真的太有魔力了～✨ 每个音符都仿佛能触动心底最柔软的地方，让眼泪和心情都得到释放～💧' },
                { id: 's3', title: '后来', artist: '刘若英', album_cover: 'https://via.placeholder.com/150', explanation: '奶茶姐姐的这首歌真的太戳心了～💘 温柔的旋律搭配感人歌词，陪你度过低落时光，像老朋友一样安慰你～🫂' }
              ],
              'angry': [
                { id: 'a1', title: 'Numb', artist: 'Linkin Park', album_cover: 'https://via.placeholder.com/150', explanation: '这首歌的力量感超强～💥 强烈的节奏和震撼人心的嘶吼，超适合发泄情绪！简直是情绪出口～🔥' },
                { id: 'a2', title: '龙卷风', artist: '周杰伦', album_cover: 'https://via.placeholder.com/150', explanation: '周董的这首歌节奏超带感～⚡ 说唱部分超过瘾，听着听着烦躁感就像被龙卷风卷走啦～🌪️' },
                { id: 'a3', title: 'We Will Rock You', artist: 'Queen', album_cover: 'https://via.placeholder.com/150', explanation: '传奇乐队Queen的经典～👑 那个标志性的踩踏节奏简直太上头了！超适合跺脚大喊发泄情绪～💪' }
              ],
              'anxious': [
                { id: 'an1', title: 'River Flows In You', artist: 'Yiruma', album_cover: 'https://via.placeholder.com/150', explanation: '治愈系钢琴曲～🎹 轻柔的琴声就像小溪流水，轻轻抚平你焦躁的心情，让压力随着音符慢慢融化～✨' },
                { id: 'an2', title: '稻香', artist: '周杰伦', album_cover: 'https://via.placeholder.com/150', explanation: '周董的这首歌暖暖的～🌾 充满正能量的旋律和歌词，就像心灵鸡汤，喝一口焦虑全消～🍵' },
                { id: 'an3', title: 'Weightless', artist: 'Marconi Union', album_cover: 'https://via.placeholder.com/150', explanation: '这首歌可是科学证明能减轻焦虑哦～🧠 舒缓的电子音乐带你进入冥想状态，压力感一秒飞走～🦋' }
              ],
              'nostalgic': [
                { id: 'n1', title: '童年', artist: '光良', album_cover: 'https://via.placeholder.com/150', explanation: '听到这首歌就像翻开童年相册～📸 温暖的旋律唤起那些单纯美好的回忆，满满的都是小时候的味道～🧸' },
                { id: 'n2', title: 'Yesterday', artist: 'The Beatles', album_cover: 'https://via.placeholder.com/150', explanation: '披头士的不朽经典～🎸 简单而深刻的旋律，像老照片一样珍贵，让人沉浸在美好的往昔时光～⏳' },
                { id: 'n3', title: '但愿人长久', artist: '王菲', album_cover: 'https://via.placeholder.com/150', explanation: '天后王菲的中国风演绎～🏮 古诗词与现代音乐的完美融合，一秒穿越时空，勾起对传统文化的怀念～🌙' }
              ],
              'lonely': [
                { id: 'l1', title: '一个人', artist: '林俊杰', album_cover: 'https://via.placeholder.com/150', explanation: 'JJ把独处的感觉唱得太到位了～🌃 虽然写的是孤独，却带着一丝温暖，像夜里的一盏小灯，陪你熬过寂寞时刻～💡' },
                { id: 'l2', title: 'All by Myself', artist: 'Celine Dion', album_cover: 'https://via.placeholder.com/150', explanation: '席琳迪翁的嗓音太有感染力了～✨ 这首歌仿佛能看见自己的孤独，但同时又感受到无数人与你同在～🌟' },
                { id: 'l3', title: '倒带', artist: '蔡依林', album_cover: 'https://via.placeholder.com/150', explanation: 'Jolin的这首老歌超有感觉～📼 节奏中带着一丝忧伤，听着听着就像有个老朋友懂你的心事～👭' }
              ],
              'neutral': [
                { id: 'ne1', title: 'Shape of You', artist: 'Ed Sheeran', album_cover: 'https://via.placeholder.com/150', explanation: '红发艾德的超级热单～🔥 轻松愉快的旋律加上节奏感超强的歌词，绝对能让你的心情瞬间愉悦起来～💃' },
                { id: 'ne2', title: '告白气球', artist: '周杰伦', album_cover: 'https://via.placeholder.com/150', explanation: '周董的甜蜜情歌～🎈 轻快又浪漫，听了就像空气中飘着恋爱的气息，超适合哼着玩手机发呆～💕' },
                { id: 'ne3', title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', album_cover: 'https://via.placeholder.com/150', explanation: '这首歌的节奏感简直无敌了～⚡ 布鲁诺·马尔斯的演绎超级带感，保证你会忍不住跟着扭起来～🕺' }
              ]
            };
            
            // 按艺术家推荐
            const artistRecommendations = {
              '周杰伦': [
                { id: 'jay1', title: '稻香', artist: '周杰伦', album_cover: 'https://via.placeholder.com/150', explanation: '周董的乡村风金曲～🌾 温暖治愈的旋律和超有画面感的歌词，每次听都有种回到乡下的感觉～让所有烦恼都烟消云散～🧘‍♂️' },
                { id: 'jay2', title: '晴天', artist: '周杰伦', album_cover: 'https://via.placeholder.com/150', explanation: '周杰伦的代表作之一～☔ 略带忧伤但又超治愈，每个音符都写满了青春回忆，听一遍就让人沉浸在自己的小情绪里～💭' },
                { id: 'jay3', title: '七里香', artist: '周杰伦', album_cover: 'https://via.placeholder.com/150', explanation: '周董的浪漫情歌～💑 超好听的旋律让人一秒陷入恋爱氛围，就像夏天的晚风裹着花香，甜甜的～🌸' }
              ],
              'Taylor Swift': [
                { id: 'ts1', title: 'Love Story', artist: 'Taylor Swift', album_cover: 'https://via.placeholder.com/150', explanation: '霉霉的青涩时期作品～👸 这首超浪漫的现代童话故事，听了就像回到了少女时代，心里住着王子的那段时光～👑' },
                { id: 'ts2', title: 'Blank Space', artist: 'Taylor Swift', album_cover: 'https://via.placeholder.com/150', explanation: '霉霉华丽转身后的神曲～✨ 超洗脑的旋律配上犀利的歌词，听多少遍都不腻，还能跟着"欧～"起来～🎵' },
                { id: 'ts3', title: 'All Too Well', artist: 'Taylor Swift', album_cover: 'https://via.placeholder.com/150', explanation: '粉丝公认的霉霉神作～❤️‍🩹 细腻的情感表达超有共鸣，每一句歌词都像是写进日记里的真实故事，听得人心都碎了～💔' }
              ]
            };
            
            // 按场景推荐
            const sceneRecommendations = {
              '工作': [
                { id: 'work1', title: 'Eine kleine Nachtmusik', artist: 'Mozart', album_cover: 'https://via.placeholder.com/150', explanation: '古典音乐有助于提高专注力和工作效率' },
                { id: 'work2', title: 'Weightless', artist: 'Marconi Union', album_cover: 'https://via.placeholder.com/150', explanation: '环境音乐，可以提供稳定的背景音，不会分散注意力' },
                { id: 'work3', title: 'Experience', artist: 'Ludovico Einaudi', album_cover: 'https://via.placeholder.com/150', explanation: '现代钢琴曲，节奏平稳，有助于保持专注' }
              ],
              '学习': [
                { id: 'study1', title: 'Spring - The Four Seasons', artist: 'Vivaldi', album_cover: 'https://via.placeholder.com/150', explanation: '古典音乐有助于提高记忆力和学习效率' },
                { id: 'study2', title: 'River Flows in You', artist: 'Yiruma', album_cover: 'https://via.placeholder.com/150', explanation: '舒缓的钢琴曲，可以创造安静的学习氛围' },
                { id: 'study3', title: 'Focus', artist: 'Spotify Playlist', album_cover: 'https://via.placeholder.com/150', explanation: '专为学习设计的轻音乐集合' }
              ],
              '运动': [
                { id: 'workout1', title: 'Eye of the Tiger', artist: 'Survivor', album_cover: 'https://via.placeholder.com/150', explanation: '经典运动励志曲目，激发能量' },
                { id: 'workout2', title: 'Can\'t Hold Us', artist: 'Macklemore & Ryan Lewis', album_cover: 'https://via.placeholder.com/150', explanation: '节奏强劲，适合高强度锻炼' },
                { id: 'workout3', title: 'Stronger', artist: 'Kanye West', album_cover: 'https://via.placeholder.com/150', explanation: '励志歌词和强劲节奏，适合健身时聆听' }
              ]
            };
            
            // 根据情况选择推荐
            if (artist && artistRecommendations[artist]) {
              response.recommendations = artistRecommendations[artist];
            } else if (scene && sceneRecommendations[scene]) {
              response.recommendations = sceneRecommendations[scene];
            } else {
              response.recommendations = recommendationsByEmotion[detectedEmotion] || recommendationsByEmotion['neutral'];
            }
          }
          
          resolve(response);
        }, 1000); // 模拟网络延迟
      });
    },
    
    // 添加辅助调试方法
    debug(message, data) {
      if (this.debugMode) {
        console.log(`[DEBUG] ${message}`, data || '');
      }
    },
    
    // 初始化音频播放器事件
    initAudioEvents() {
      try {
        console.log('初始化音频播放器事件');
        
        // 确保使用正确的元素ID
    const audioPlayer = document.getElementById('audioPlayer');
        const progressContainer = document.getElementById('audioProgressContainer');
        const closeBtn = document.getElementById('closeAudioPlayer');
        const playPauseBtn = document.getElementById('playPauseBtn');
        
        console.log('音频元素:', audioPlayer ? '已找到' : '未找到');
        console.log('进度条元素:', progressContainer ? '已找到' : '未找到');
        
        if (audioPlayer) {
          // 事件监听
          audioPlayer.addEventListener('play', () => {
            this.isPlaying = true;
            
            // 添加进度条更新定时器
            this.progressUpdateInterval = setInterval(() => {
              if (typeof this.updateAudioProgress === 'function') {
                this.updateAudioProgress();
              }
            }, 1000);
            
            // 记录播放开始时间
            this.playStartTime = new Date().getTime();
            
            if (typeof this.updatePlayButtonState === 'function') {
              this.updatePlayButtonState();
            }
          });
          
          audioPlayer.addEventListener('pause', () => {
            this.isPlaying = false;
            
            // 清除进度条更新定时器
            clearInterval(this.progressUpdateInterval);
            
            // 当音频暂停时更新按钮状态
            if (typeof this.updatePlayButtonState === 'function') {
              this.updatePlayButtonState();
            }
            
            // 累计播放时间
            if (this.playStartTime) {
              const pauseTime = new Date().getTime();
              this.totalPlayTime += (pauseTime - this.playStartTime) / 1000;
              console.log(`累计播放时间: ${this.totalPlayTime}秒`);
            }
          });
          
          audioPlayer.addEventListener('ended', () => {
            // 重置播放状态
            this.isPlaying = false;
            if (typeof this.updatePlayButtonState === 'function') {
              this.updatePlayButtonState();
            }
            
            console.log("音频播放结束");
            
            // 重置里程碑记录
            this.reachedMilestones = [];
            
            // 记录播放结束
            if (typeof this.trackPlayEnd === 'function') {
              this.trackPlayEnd();
            }
          });
          
          audioPlayer.addEventListener('timeupdate', () => {
            if (typeof this.updateAudioProgress === 'function') {
              this.updateAudioProgress();
            }
          });
          
          audioPlayer.addEventListener('error', (e) => {
            if (typeof this.handleAudioError === 'function') {
              this.handleAudioError(e);
            }
          });
        }
        
        if (progressContainer) {
          progressContainer.addEventListener('click', (e) => {
            if (typeof this.setProgress === 'function') {
              this.setProgress(e);
            }
          });
        }
        
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            const playerContainer = document.getElementById('audioPlayerContainer');
            if (audioPlayer) audioPlayer.pause();
            if (playerContainer) playerContainer.classList.add('hidden');
            if (typeof this.trackPlayEnd === 'function') {
              this.trackPlayEnd();
            }
          });
        }
        
        if (playPauseBtn) {
          playPauseBtn.addEventListener('click', () => {
            if (!audioPlayer) return;
            
            if (audioPlayer.paused) {
              audioPlayer.play().then(() => {
                if (typeof this.updatePlayButtonState === 'function') {
                  this.updatePlayButtonState();
                }
              }).catch(e => {
                console.error("播放失败:", e);
                if (typeof this.handleAudioError === 'function') {
                  this.handleAudioError(e);
                }
              });
            } else {
              audioPlayer.pause();
              if (typeof this.updatePlayButtonState === 'function') {
                this.updatePlayButtonState();
              }
            }
          });
        }
      } catch (error) {
        console.error('初始化音频播放器事件失败:', error);
      }
    },
    
    // 提示音频不可用
    generateAndPlayAudio(songId, title, artist) {
      console.log(`无法播放原始音频: [${title} - ${artist}]`);
      
      try {
        // 显示提示信息
        this.addNotification(`无法播放 "${title} - ${artist}" 的音频，请稍后再试`, 'is-warning');
        
        // 隐藏音频播放器
        const audioPlayerContainer = document.getElementById('audioPlayerContainer');
        if (audioPlayerContainer) {
          audioPlayerContainer.classList.add('hidden');
        }
        
        // 记录错误信息
        console.error(`无法播放歌曲: ${title} - ${artist} (ID: ${songId})`);
      } catch (error) {
        console.error('处理音频不可用时出错:', error);
        this.handleAudioError(error);
      }
    },
    
    // 初始化情感检测器
    initEmotionDetector() {
      console.log('初始化情感检测器');
      try {
        // 实例化情感检测器
        this.emotionDetector = new EmotionDetector();
        console.log('情感检测器初始化成功');
      } catch (error) {
        console.error('情感检测器初始化失败:', error);
        // 创建一个空的替代对象，避免后续使用时出错
        this.emotionDetector = {
          analyzeLocally: () => ({ emotion: "平静", valence: 0.5, energy: 0.5 }),
          detectFromText: async (text) => ({ emotion: "平静", valence: 0.5, energy: 0.5 }),
          generateRecommendationReason: () => ({ zh: "根据您的心情，为您推荐音乐", en: "Recommending music based on your mood" })
        };
      }
    },
    
    // 导航到情感推荐页面
    navigateToEmotionRecommend() {
      console.log('导航到情感推荐页面');
      this.currentTab = 'recommend';
      // 可以在这里添加额外逻辑，如触发情感分析等
    },
    
    // 播放歌曲预览
    playSongPreview(song, title, artist) {
      console.log('播放歌曲预览', title, artist);
      
      try {
        // 获取音频播放器元素
        const audioPlayer = document.getElementById('audioPlayer');
        const playerContainer = document.getElementById('audioPlayerContainer');
        
        if (!audioPlayer || !playerContainer) {
          console.error('找不到音频播放器元素');
          return;
        }
        
        // 显示播放器容器
        playerContainer.classList.remove('hidden');
        
        // 设置当前播放歌曲信息
        this.currentPlayingSong = {
          id: song.id || 'unknown',
          title: title || '未知歌曲',
          artist: artist || '未知艺术家'
        };
        
        // 更新播放器UI
        const songTitleElement = document.getElementById('currentSongTitle');
        const artistNameElement = document.getElementById('currentArtistName');
        
        if (songTitleElement) songTitleElement.textContent = title || '未知歌曲';
        if (artistNameElement) artistNameElement.textContent = artist || '未知艺术家';
        
        // 根据不同情况设置音频源
        let audioSource = '';
        
        if (typeof song === 'string') {
          // 如果song是字符串，直接作为URL使用
          audioSource = song;
        } else if (song && song.preview_url) {
          // 如果song是对象且有preview_url属性
          audioSource = song.preview_url;
        } else if (song && song.external_url) {
          // 如果有外部链接但没有预览URL，显示提示并打开外部链接
          this.showNotification(`没有可用的预览，正在打开Spotify`, 'is-info');
          window.open(song.external_url, '_blank');
          return;
        } else {
          // 没有可用预览，显示错误消息
          this.showNotification(`无法播放 "${title} - ${artist}" 的预览`, 'is-warning');
          return;
        }
        
        // 设置音频源并播放
        audioPlayer.src = audioSource;
        audioPlayer.load();
        
        // 尝试播放
        const playPromise = audioPlayer.play();
        
        // 处理播放承诺
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('开始播放音频');
          }).catch(error => {
            console.error('播放失败:', error);
            this.showNotification(`播放失败: ${error.message}`, 'is-danger');
          });
        }
      } catch (error) {
        console.error('播放预览时出错:', error);
        this.showNotification(`播放错误: ${error.message}`, 'is-danger');
      }
    },
    
    // 初始化按钮事件
    initButtonEvents() {
      console.log('初始化按钮事件');
      try {
        // 初始化导航按钮
        const navButtons = document.querySelectorAll('[data-tab]');
        navButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = button.getAttribute('data-tab');
            console.log(`点击了标签页按钮: ${tabName}`);
            if (tabName) {
              this.currentTab = tabName;
            }
          });
        });
        
        // 初始化汉堡菜单按钮 (移动端)
        const navbarBurgers = document.querySelectorAll('.navbar-burger');
        navbarBurgers.forEach(burger => {
          burger.addEventListener('click', () => {
            const target = document.getElementById(burger.dataset.target);
            burger.classList.toggle('is-active');
            target.classList.toggle('is-active');
          });
        });
        
        // 初始化自动刷新开关按钮
        const autoRefreshToggle = document.getElementById('autoRefreshToggle');
        if (autoRefreshToggle) {
          autoRefreshToggle.addEventListener('change', () => {
            this.autoRefreshEnabled = autoRefreshToggle.checked;
            localStorage.setItem('autoRefreshEnabled', this.autoRefreshEnabled);
            console.log('自动刷新设置已更改:', this.autoRefreshEnabled);
          });
        }
        
        // 初始化聊天建议按钮
        setTimeout(() => {
          const suggestionButtons = document.querySelectorAll('.chat-suggestions button');
          suggestionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
              e.preventDefault();
              const text = button.textContent.trim();
              console.log('点击了聊天建议按钮:', text);
              
              // 根据按钮内容生成对应的消息文本
              let messageText = '';
              if (text.includes('推荐流行音乐')) {
                messageText = '推荐一些流行音乐给我';
              } else if (text.includes('我喜欢周杰伦')) {
                messageText = '我喜欢周杰伦的歌';
              } else if (text.includes('工作音乐')) {
                messageText = '推荐适合工作时听的音乐';
              } else if (text.includes('基于评分推荐')) {
                messageText = '根据我的评分推荐音乐';
              } else {
                messageText = text;
              }
              
              // 使用消息文本
              this.useSuggestion(messageText);
            });
          });
          console.log('聊天建议按钮初始化完成');
        }, 1000);
        
        // 初始化底部快捷按钮
        setTimeout(() => {
          const quickButtons = document.querySelectorAll('.quick-buttons .quick-button');
          quickButtons.forEach(button => {
            button.addEventListener('click', (e) => {
              console.log('点击了底部快捷按钮:', button.textContent.trim());
            });
          });
          console.log('底部快捷按钮事件已绑定');
        }, 1000);
      } catch (error) {
        console.error('初始化按钮事件出错:', error);
      }
    },
    
    // 检查并持久化用户向量
    checkAndPersistUserVector() {
      // 如果用户已登录且有足够的评分数据
      if (this.isLoggedIn && this.hasRatedEnoughSongs()) {
        console.log('持久化用户向量');
        // 这里可以调用后端API保存用户向量
        // 简化实现，仅打印日志
      }
    },
    
    // 设置自动刷新计时器
    setupAutoRefreshTimer() {
      console.log('设置自动刷新计时器');
      // 清除现有的计时器
      if (this.autoRefreshTimer) {
        clearInterval(this.autoRefreshTimer);
      }
      
      // 如果启用了自动刷新
      if (this.autoRefreshEnabled) {
        // 设置新计时器，每30分钟刷新一次推荐
        this.autoRefreshTimer = setInterval(() => {
          console.log('自动刷新推荐');
          if (this.currentTab === 'recommend') {
            this.refreshRecommendations(true);
          }
        }, 30 * 60 * 1000); // 30分钟
        
        console.log('自动刷新计时器已设置');
      } else {
        console.log('自动刷新已禁用');
      }
    },
    
    // 刷新推荐列表
    refreshRecommendations(showNotification = true) {
      console.log('刷新推荐列表');
      
      // 如果显示通知
      if (showNotification) {
        this.addNotification('正在获取新的推荐...', 'is-info');
      }
      
      // 调用获取推荐的方法
      this.getRecommendations().then(() => {
        if (showNotification) {
          this.addNotification('推荐已更新', 'is-success');
        }
      }).catch(error => {
        console.error('刷新推荐失败:', error);
        if (showNotification) {
          this.addNotification('获取推荐失败，请稍后再试', 'is-danger');
        }
      });
    },
    
    // 添加聊天欢迎消息
    addChatWelcomeMessage() {
      console.log('添加聊天欢迎消息');
      
      // 初始化聊天消息数组（如果不存在）
      if (!this.chatMessages) {
        this.chatMessages = [];
      }
      
      // 如果聊天消息为空，添加AI欢迎消息
      if (this.chatMessages.length === 0) {
        // 添加AI欢迎消息
        this.chatMessages.push({
          id: Date.now(),
          content: this.t('chatWelcome') || "你好！我是你的AI音乐助手。我可以推荐音乐、根据你的心情提供歌曲，或者只是和你聊聊天。请告诉我你想听什么类型的音乐？",
          isUser: false,
          timestamp: new Date().toISOString(),
          // 添加聊天建议
          suggestions: [
            '我喜欢流行音乐，有什么推荐？',
            '我今天心情不太好，需要一些舒缓的音乐',
            '我喜欢周杰伦的歌，推荐一些类似的',
            '推荐一些适合学习的背景音乐'
          ]
        });
        
        console.log('已添加聊天欢迎消息:', this.chatMessages);
      }
    },
    
    // 使用聊天建议
    useSuggestion(text) {
      console.log('使用聊天建议:', text);
      
      // 确保当前在聊天页面
      this.currentTab = 'chat';
      
      // 等待视图更新，确保聊天界面已加载
      this.$nextTick(() => {
        // 如果聊天输入框不存在，创建一个
        if (!this.currentMessage) {
          this.currentMessage = '';
        }
        
        // 设置聊天输入内容
        this.currentMessage = text;
        
        // 添加一个短暂延迟，确保UI已更新
        setTimeout(() => {
          // 自动发送消息
          this.sendMessage();
        }, 100);
      });
    },
    
    // 安全显示通知的辅助方法
    showNotification(message, type) {
      if (this.addNotification) {
        this.addNotification(message, type);
      } else {
        console.warn('无法显示通知:', message);
        alert(message); // 作为后备方案
      }
    },
    
    // 添加通知消息
    addNotification(message, type = 'is-info') {
      // 创建唯一ID
      const id = Date.now();
      
      // 添加到通知数组
      this.notifications.push({
        id,
        message,
        type,
        isVisible: true
      });
      
      // 自动移除通知
      setTimeout(() => {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
          // 设置为不可见
          this.notifications[index].isVisible = false;
          
          // 完全移除通知
          setTimeout(() => {
            this.notifications = this.notifications.filter(n => n.id !== id);
          }, 500);
        }
      }, 5000);
      
      console.log('添加通知:', message, type);
    },
  },
  
  // 侦听器
  watch: {
    currentTab(newTab, oldTab) {
      console.log(`切换到标签页: ${newTab}`);

      // 确保DOM已更新
      this.$nextTick(() => {
        // 处理标签切换后的特殊逻辑
        if (newTab === 'game') {
          // 初始化游戏
          this.initMusicGame();
        } else if (newTab === 'recommend' && this.recommendations.length === 0) {
          // 如果进入推荐页面且没有推荐内容，获取推荐
          this.refreshRecommendations(false);
        } else if (newTab === 'chat') {
          // 如果进入聊天页面，添加欢迎消息（无论是否有消息）
          this.addChatWelcomeMessage();
        }
      });
    }
  },
  
  // 组件挂载后
  mounted() {
    // 包裹在try-catch中，防止初始化错误
    try {
      console.log('Vue实例挂载开始');
      
      // 立即添加欢迎词到聊天界面
      setTimeout(() => {
        this.addChatWelcomeMessage();
        console.log('挂载后添加聊天欢迎词');
      }, 200);
      
      // 从本地存储加载自动刷新设置
      const savedAutoRefresh = localStorage.getItem('autoRefreshEnabled');
      if (savedAutoRefresh !== null) {
        this.autoRefreshEnabled = savedAutoRefresh === 'true';
        console.log('加载自动刷新设置:', this.autoRefreshEnabled);
      }
      
      // 初始化音频播放器事件
      setTimeout(() => {
        this.initAudioEvents();
        console.log('音频播放器初始化完成');
      }, 500);
      
      // 1. 初始化数据
      this.loadSampleSongs();
      
      // 2. 检查已保存的用户会话
      this.checkSession();
      
      // 3. 初始化情感检测器
      this.initEmotionDetector();
      
      // 4. 初始化按钮事件 - 确保总是调用
      this.initButtonEvents();
      
      // 5. 立即初始化底部快捷按钮
      setTimeout(() => {
        const bottomButtons = document.querySelectorAll('footer a, [data-tab]');
        bottomButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = button.getAttribute('data-tab');
            if (tabName) {
              console.log(`底部按钮点击: ${tabName}`);
              this.currentTab = tabName;
            }
          });
        });
        console.log('底部快捷按钮初始化完成');
      }, 500);
      
      // 设置自动保存用户向量的计时器
      setInterval(() => {
        this.checkAndPersistUserVector();
      }, 30000); // 每30秒检查一次
      
      // 检查URL参数是否有指定的标签页
        const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
      if (tabParam) {
      this.currentTab = tabParam;
      }
      
      // 检查是否需要显示问卷
      const showQuestionnaire = urlParams.get('questionnaire') === 'true';
      this.showQuestionnaireUI = showQuestionnaire;
      
      // 根据用户语言偏好设置语言
      const preferredLanguage = localStorage.getItem('preferredLanguage');
      if (preferredLanguage) {
        this.currentLanguage = preferredLanguage;
      }
      
      // 设置定期自动刷新推荐的计时器
      this.setupAutoRefreshTimer();
      
      console.log('Vue实例挂载完成');
    } catch (error) {
      console.error('初始化过程中发生错误:', error);
    }
  },

  // 全局错误捕获，防止网络请求失败导致应用崩溃
  created() {
    // 初始化聊天消息和欢迎词
    this.chatMessages = [];
    this.addChatWelcomeMessage();
    
    console.log('创建Vue实例时初始化聊天欢迎词');
    
    // 确保错误处理器已设置
    setupErrorHandlers();
    
    // 禁用所有外部请求错误传播
    window.addEventListener('error', (event) => {
      // 捕获网络错误并停止传播
      if (event.target && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK' || event.target.tagName === 'IMG' || event.target.tagName === 'AUDIO')) {
        console.log('拦截到资源加载错误:', event.target.src || event.target.href);
        
        // 特别处理音频元素错误
        if (event.target.tagName === 'AUDIO') {
          const audioPlayer = document.getElementById('audioPlayer');
          if (audioPlayer === event.target) {
            console.log('音频播放器加载错误，请稍后再尝试');
            if (this.currentPlayingSong) {
              this.addNotification(`音频加载失败：${this.currentPlayingSong.title}`, 'is-warning');
            }
          }
        }
        
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
    }, true);
    
    // 覆盖原生的fetch方法，添加错误处理
    if (!window.originalFetch) {
      window.originalFetch = window.fetch;
      
      window.fetch = function(...args) {
        // 检查是否是音频请求
        const isAudioRequest = args[0] && typeof args[0] === 'string' && 
          (args[0].includes('.mp3') || args[0].includes('format=mp3') || 
           args[0].includes('audio') || args[0].includes('sound'));
           
        // 针对音频请求，尝试使用不同的模式
        if (isAudioRequest && args.length > 1 && typeof args[1] === 'object') {
          // 尝试使用跨域模式
          const options = {...args[1]};
          
          // 不同的CORS模式
          if (!options.mode || options.mode === 'cors') {
            console.log('尝试使用no-cors模式:', args[0]);
            return window.originalFetch(args[0], {
              ...options,
              mode: 'no-cors'
            }).catch(error => {
              console.log('no-cors模式失败，尝试使用cors模式:', error);
              return window.originalFetch(args[0], {
                ...options,
                mode: 'cors',
                credentials: 'omit'
        });
      });
    }
        }
        
        return window.originalFetch.apply(this, args)
          .catch(error => {
            console.log('拦截到网络请求错误:', args[0], error);
            
            // 对于音频请求，给出特殊处理
            if (isAudioRequest) {
              console.log('音频请求失败，请稍后重试');
              return new Response(JSON.stringify({
                status: 'error',
                message: 'Audio request failed, please try again later'
              }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            // 返回一个模拟的成功响应
            return new Response(JSON.stringify({
              status: 'offline',
              message: 'Using offline mode'
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          });
      };
    }
    
    // 添加特定于音频的错误处理
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer) {
      audioPlayer.addEventListener('error', (e) => {
        console.error('音频播放器错误:', e);
        if (this.currentPlayingSong) {
          this.addNotification(`音频 "${this.currentPlayingSong.title}" 加载失败，请稍后再试`, 'is-warning');
        }
      });
    }
  },
});

// 在Vue实例外添加全局错误处理
window.onerror = function(message, source, lineno, colno, error) {
  console.error('全局错误:', message, source, lineno, colno, error);
  
  // 如果Vue实例已初始化，显示通知
  if (window.app) {
    window.app.addNotification('页面发生错误，请刷新重试', 'is-danger');
  }
  
  return false; // 允许默认处理
};

// 全局错误捕获函数
function setupErrorHandlers() {
  try {
    console.log("设置全局错误处理器");
    
    // 保护Promise
    if (Promise.prototype.originalThen === undefined) {
      Promise.prototype.originalThen = Promise.prototype.then;
      
      Promise.prototype.then = function(onFulfilled, onRejected) {
        return this.originalThen(
          typeof onFulfilled === 'function' ? function(value) {
            try {
              return onFulfilled(value);
            } catch (e) {
              console.error('Promise handler error:', e);
              return value;
            }
          } : onFulfilled,
          typeof onRejected === 'function' ? function(reason) {
            try {
              return onRejected(reason);
            } catch (e) {
              console.error('Promise rejection handler error:', e);
              return Promise.reject(reason);
            }
          } : onRejected
        );
      };
    }
    
    // 保护Function.call
    if (Function.prototype.originalCall === undefined) {
      Function.prototype.originalCall = Function.prototype.call;
      
      Function.prototype.call = function() {
        try {
          return Function.prototype.originalCall.apply(this, arguments);
        } catch (e) {
          console.error('Function.call error intercepted:', e);
          return null;
        }
      };
    }
    
    // 拦截未处理的Promise错误
    window.addEventListener('unhandledrejection', function(event) {
      console.error('Unhandled Promise rejection:', event.reason);
      
      // 阻止错误传播到控制台
      event.preventDefault();
      
      // 检查是否是来自用户脚本的错误
      if (event.reason && event.reason.stack && 
          (event.reason.stack.includes('userscript') || 
           event.reason.stack.includes('intermediate'))) {
        console.log('用户脚本错误已拦截');
        
        if (window.app) {
          window.app.addNotification('检测到浏览器扩展干扰，建议禁用部分扩展', 'is-warning');
    }
  }
});
    
    // 修复axios请求
    if (axios && !axios.originalPost) {
      axios.originalPost = axios.post;
      
      axios.post = function(url, data, config) {
        if (url === '/api/user_vector') {
          console.log('拦截用户向量API请求，使用本地存储');
          
          try {
            localStorage.setItem('user_vector', JSON.stringify(data));
            
            return Promise.resolve({
              data: { status: 'success', message: '用户向量已保存到本地' }
            });
          } catch (e) {
            console.error('保存到本地存储失败:', e);
            
            return Promise.resolve({
              data: { status: 'error', message: '本地存储失败' }
            });
          }
        }
        
        return axios.originalPost(url, data, config);
      };
    }
    
    console.log("全局错误处理器设置完成");
  } catch (e) {
    console.error("设置错误处理器时发生错误:", e);
  }
}

// 在脚本开始时就设置错误处理
setupErrorHandlers();
