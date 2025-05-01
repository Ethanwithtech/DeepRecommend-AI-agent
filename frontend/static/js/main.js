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
      let ratedCount = 0;
      this.sampleSongs.forEach(song => {
        if (song.rating > 0) ratedCount++;
      });
      console.log('已评分歌曲数量:', ratedCount);
      return ratedCount >= 5; // 至少需要评分5首歌曲
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
            'chatWelcome': '你好！我是AI音乐助手，可以帮你找到你喜欢的音乐。试着告诉我你喜欢什么类型的音乐或者你喜欢的歌手吧！',
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
            'chatWelcome': 'Hello! I\'m the AI Music Assistant. I can help you find music you\'ll love. Try telling me what genres or artists you like!',
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
      if (!this.hasRatedEnoughSongs) {
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
          // 调用AI助手接口
          const response = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  user_id: this.userId || 'guest',
                  message: userMessage
              })
          });
          
          if (!response.ok) {
              throw new Error('网络请求失败');
          }
          
          const result = await response.json();
          
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
              
              // 处理推荐数据
              const recommendedSongs = result.recommendations.map(song => ({
                  ...song,
                  emotion_color: emotionColor,
                  // 保留预览链接
                  preview_links: song.preview_links || {
                      netease: `https://music.163.com/#/search/m/?s=${encodeURIComponent(song.title)}+${encodeURIComponent(song.artist)}&type=1`,
                      spotify: `https://open.spotify.com/search/${encodeURIComponent(song.title)}%20${encodeURIComponent(song.artist)}`
                  }
              }));
              
              // 构建推荐消息
              let recommendMessage = `根据你的情绪和喜好，我为你推荐这些歌曲：`;
              
              // 添加带有推荐的消息
              this.chatMessages.push({
                  content: recommendMessage,
                  isUser: false,
                  timestamp: new Date(),
                  songs: recommendedSongs,
                  has_preview_links: result.has_preview_links || true
              });
              
              // 同时更新推荐页面
              this.recommendations = recommendedSongs.map(song => {
                  return {
                      ...song,
                      recommendationReason: `这首歌曲的风格与你当前的${this.emotionNames[emotion] || emotion}情绪很匹配`,
                      preview_links: song.preview_links
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
    
    // 播放歌曲预览
    async playSongPreview(song, songTitle, songArtist) {
        // 获取音频元素
        const audioPlayer = document.getElementById('audioPlayer');
        const audioTitle = document.getElementById('audioTitle');
        const audioArtist = document.getElementById('audioArtist');
        const audioPlayerContainer = document.getElementById('audioPlayerContainer');
        const playPauseBtn = document.getElementById('playPauseBtn');
        const playPauseIcon = playPauseBtn.querySelector('i');
        
        // 设置歌曲信息
        audioTitle.textContent = songTitle || song.title || '未知歌曲';
        audioArtist.textContent = songArtist || song.artist || '未知艺术家';
        
        // 清除之前的音频URL
        audioPlayer.src = '';
        
        // 显示播放器
        audioPlayerContainer.classList.remove('hidden');
        
        // 尝试从song对象获取预览URL
        let previewUrl = '';
        
        try {
            // 如果是试听链接
            if (song.preview_links) {
                // 打开网易云音乐或Spotify链接
                const neaseLink = song.preview_links.netease;
                const spotifyLink = song.preview_links.spotify;
                
                // 在新标签页打开网易云音乐
                window.open(neaseLink, '_blank');
                
                // 设置提醒消息
                this.addNotification(`已在新标签页打开"${songTitle}"的试听链接`, 'is-info');
                return;
            }
            
            // 如果有直接预览URL
            if (song.preview_url) {
                previewUrl = song.preview_url;
            } 
            // 如果没有预览URL，尝试使用API获取
            else {
                audioTitle.textContent = `加载中: ${songTitle}`;
                
                // 替换为实际的API端点
                const response = await fetch(`/api/song_preview?title=${encodeURIComponent(songTitle)}&artist=${encodeURIComponent(songArtist)}`);
                
                if (!response.ok) {
                    throw new Error('无法获取预览');
                }
                
                const data = await response.json();
                previewUrl = data.preview_url;
                
                if (!previewUrl) {
                    throw new Error('没有可用的预览');
                }
            }
            
            // 设置音频来源
            audioPlayer.src = previewUrl;
            
            // 播放音频
            const playPromise = audioPlayer.play();
            
            if (playPromise) {
                playPromise.then(() => {
                    // 播放成功
                    playPauseIcon.classList.remove('fa-play');
                    playPauseIcon.classList.add('fa-pause');
                    this.trackPlayStart(song.id || 'unknown', songTitle, songArtist);
                }).catch(err => {
                    console.error('播放失败:', err);
                    // 如果无法自动播放，显示播放按钮
                    playPauseIcon.classList.remove('fa-pause');
                    playPauseIcon.classList.add('fa-play');
                    this.addNotification('无法自动播放，请点击播放按钮', 'is-warning');
                });
            }
        } catch (error) {
            console.error('预览播放失败:', error);
            audioTitle.textContent = `${songTitle} (无法预览)`;
            this.addNotification('无法获取歌曲预览，请尝试其他歌曲', 'is-danger');
        }
    },
    
    // 播放模拟音频文件
    generateAndPlayAudio(songId, title, artist) {
      console.log(`使用模拟音频: [${title} - ${artist}]`);
      
      try {
        const audioPlayer = document.getElementById('audioPlayer');
        if (!audioPlayer) return;
        
        // 使用默认音频文件
        const defaultAudioPath = "/static/audio/default.mp3";
        
        // 根据歌曲ID选择示例音频
        const sampleAudioPath = `/static/audio/sample${(songId % 15) + 1}.mp3`;
        
        // 设置音频元素
        audioPlayer.src = sampleAudioPath;
        
        // 尝试播放音频
        console.log(`正在播放模拟音频: ${sampleAudioPath}`);
        
        audioPlayer.play().catch(err => {
          console.error('播放失败，尝试通过用户交互触发播放:', err);
          this.addNotification('请点击播放按钮开始播放', 'is-info');
        });
        
        this.addNotification(`正在播放 "${title} - ${artist}" (模拟音频)`, 'is-info');
        
        // 更新播放按钮状态
        this.updatePlayButtonState();
      } catch (error) {
        console.error('播放模拟音频失败:', error);
        this.handleAudioError(error);
      }
    },
    
    // 记录开始播放的行为数据
    trackPlayStart(songId, title, artist) {
      // 初始化播放行为数据
      this.playBehavior.currentSongId = songId;
      this.playBehavior.startTime = new Date();
      this.playBehavior.playDuration = 0;
      
      // 确保行为数据对象存在
      if (!this.playBehavior.behaviors[songId]) {
        this.playBehavior.behaviors[songId] = {
          playCount: 0,
          skipCount: 0,
          totalDuration: 0,
          avgDuration: 0,
          completionCount: 0,
          title,
          artist
        };
      }
      
      // 为当前播放歌曲增加播放次数
      this.playBehavior.behaviors[songId].playCount++;
      
      console.log(`开始播放歌曲: ${title} - ${artist} [ID: ${songId}]`);
    },
    
    // 跟踪播放结束，更新用户向量
    trackPlayEnd() {
      if (!this.currentPlayingSong) return;
      
      const songId = this.currentPlayingSong.id;
      const audioPlayer = document.getElementById('audioPlayer');
      const playedTime = audioPlayer ? audioPlayer.currentTime : 0;
      const totalTime = audioPlayer ? audioPlayer.duration : 0;
      
      // 如果开始时间存在，计算总播放时长
      if (this.playBehavior.startTime) {
        const endTime = new Date();
        const playDuration = (endTime - this.playBehavior.startTime) / 1000; // 毫秒转秒
        this.playBehavior.playDuration = playDuration;
        
        console.log(`结束播放，总时长: ${playDuration.toFixed(1)}秒`);
        
        // 如果有歌曲ID，更新歌曲的行为数据
        if (songId && this.playBehavior.behaviors[songId]) {
          const songStats = this.playBehavior.behaviors[songId];
          
          // 更新统计数据
          songStats.totalDuration += playDuration;
          songStats.avgDuration = songStats.totalDuration / songStats.playCount;
          
          // 检查是否是完整播放（播放超过90%视为完整播放）
          const isFullPlay = (playedTime / totalTime) > 0.9;
          if (isFullPlay) {
            songStats.completionCount++;
          }
          
          // 计算完成百分比
          const completionPercentage = totalTime > 0 ? 
            Math.min(Math.round((playedTime / totalTime) * 100), 100) : 0;
          
          // 发送播放数据
          this.sendPlaybackData(songId, playDuration, completionPercentage);
          
          // 更新用户向量
          this.updateUserVectorFromPlayBehavior(songId, playDuration, isFullPlay);
        }
      }
      
      // 检查是否需要持久化播放行为数据
      this.checkAndPersistPlayBehavior();
      
      // 重置当前播放歌曲
      this.currentPlayingSong = null;
      this.playBehavior.currentSongId = null;
      this.playBehavior.startTime = null;
      this.playBehavior.playDuration = 0;
    },
    
    // 检查播放里程碑，随着播放进度更新用户向量
    checkPlayMilestone(currentTime) {
      if (!this.currentPlayingSong) return;
      
      const songId = this.currentPlayingSong.id;
      
      // 初始化该歌曲的里程碑记录
      if (!this.reachedMilestones[songId]) {
        this.reachedMilestones[songId] = {
          reached10s: false,
          reached30s: false,
          reached60s: false,
          reached120s: false
        };
      }
      
      // 检查不同的里程碑
      if (currentTime >= 10 && !this.reachedMilestones[songId].reached10s) {
        console.log(`歌曲 ${songId} 达到10秒里程碑`);
        this.reachedMilestones[songId].reached10s = true;
        this.updateUserVector(songId, 0.1);
      }
      
      if (currentTime >= 30 && !this.reachedMilestones[songId].reached30s) {
        console.log(`歌曲 ${songId} 达到30秒里程碑`);
        this.reachedMilestones[songId].reached30s = true;
        this.updateUserVector(songId, 0.2);
      }
      
      if (currentTime >= 60 && !this.reachedMilestones[songId].reached60s) {
        console.log(`歌曲 ${songId} 达到60秒里程碑`);
        this.reachedMilestones[songId].reached60s = true;
        this.updateUserVector(songId, 0.3);
      }
      
      if (currentTime >= 120 && !this.reachedMilestones[songId].reached120s) {
        console.log(`歌曲 ${songId} 达到120秒里程碑`);
        this.reachedMilestones[songId].reached120s = true;
        this.updateUserVector(songId, 0.4);
        this.showNotification('您在专注聆听！音乐品味已更新', 'info');
      }
    },
    
    // 发送播放数据到服务器
    sendPlaybackData(songId, playedTime, completionPercentage) {
      // 构建要发送的数据
      const playbackData = {
        song_id: songId,
        played_time: playedTime,
        completion_percentage: completionPercentage,
        timestamp: new Date().toISOString()
      };
      
      console.log('记录播放数据:', playbackData);
      
      // 使用localStorage来存储播放数据，避免API不可用的404错误
      try {
        const playbackRecords = JSON.parse(localStorage.getItem('playbackRecords') || '[]');
        playbackRecords.push(playbackData);
        localStorage.setItem('playbackRecords', JSON.stringify(playbackRecords));
        console.log('播放数据已记录到本地存储');
        
        // 已登录用户显示通知
        if (this.isLoggedIn && completionPercentage > 50) {
          this.addNotification('您的听歌数据已记录，有助于提升推荐精准度', 'is-success');
        }
      } catch (error) {
        console.error('记录播放数据失败:', error);
      }
    },
    
    // 从播放行为更新用户向量
    updateUserVectorFromPlayBehavior(songId, duration, isFullPlay) {
      // 获取对应的歌曲对象
      const allSongs = [...this.sampleSongs, ...this.recommendations];
      const song = allSongs.find(s => s.id === songId);
      if (!song) return;
      
      let delta = 0;
      
      // 根据播放时长和完整播放状态计算偏好调整值
      if (isFullPlay) {
        // 完整播放，明显提高偏好
        delta = 0.15;
      } else if (duration >= 15) {
        // 播放超过15秒但不完整，略微提高偏好
        delta = 0.08;
      } else if (duration < 5) {
        // 播放不到5秒就跳过，降低偏好
        delta = -0.1;
      } else if (duration < 10) {
        // 播放不到10秒，轻微降低偏好
        delta = -0.05;
      }
      
      // 调整力度较小于显式反馈
      if (delta !== 0) {
        this.updateUserVector(song, delta);
      }
    },
    
    // 检查是否需要持久化播放行为数据
    checkAndPersistPlayBehavior() {
      // 计算行为数据总量
      const behaviorCount = Object.keys(this.playBehavior.behaviors).length;
      
      // 如果已经积累了足够多的行为数据，或者有完整播放的歌曲，则持久化
      const hasFullPlays = Object.values(this.playBehavior.behaviors)
        .some(behavior => behavior.completionCount > 0);
      
      if (behaviorCount >= 3 || hasFullPlays) {
        this.persistPlayBehavior();
      }
    },
    
    // 持久化播放行为数据
    persistPlayBehavior() {
      console.log('尝试持久化播放行为数据');
      
      // 如果没有API，直接保存到本地
      if (!this.apiBaseUrl) {
        console.log('API不可用，保存到localStorage');
        localStorage.setItem('playBehavior', JSON.stringify(this.playBehavior.behaviors));
        return;
      }
      
      // 如果API可用，尝试发送到服务器
      // 注意：在模拟环境中，我们不发送真实请求，避免404错误
      try {
        console.log('模拟环境：保存播放行为数据到本地存储');
        localStorage.setItem('playBehavior', JSON.stringify(this.playBehavior.behaviors));
        
        // 模拟成功响应
        console.log('播放行为数据保存成功（模拟）');
        
        // 为演示目的，可以添加一个通知
        this.addNotification('播放行为数据已更新', 'is-success');
      } catch (error) {
        console.error('播放行为数据保存失败:', error);
        // 如果保存失败，添加错误通知
        this.addNotification('播放行为数据保存失败', 'is-danger');
      }
    },
    
    // 跟踪播放行为
    trackPlayBehavior(songObj, action) {
      if (!songObj) {
        console.warn('trackPlayBehavior: 无效的歌曲对象');
        return;
      }
      
      const songId = songObj.id;
      
      // 确保存在行为记录
      if (!this.playBehavior) {
        this.playBehavior = {
          behaviors: {},
          currentSongId: null,
          startTime: null,
          playDuration: 0
        };
      }
      
      if (!this.playBehavior.behaviors[songId]) {
        this.playBehavior.behaviors[songId] = {
          playCount: 0,
          skipCount: 0,
          totalDuration: 0,
          avgDuration: 0,
          completionCount: 0,
          title: songObj.title || '未知歌曲',
          artist: songObj.artist || '未知艺术家'
        };
      }
      
      // 根据动作类型记录不同行为
      if (action === 'start') {
        this.playBehavior.behaviors[songId].playCount++;
        console.log(`开始跟踪歌曲行为: ${songObj.title} - ${songObj.artist}`);
      } else if (action === 'skip') {
        this.playBehavior.behaviors[songId].skipCount++;
        console.log(`歌曲被跳过: ${songObj.title} - ${songObj.artist}`);
      } else if (action === 'complete') {
        this.playBehavior.behaviors[songId].completionCount++;
        console.log(`歌曲完整播放: ${songObj.title} - ${songObj.artist}`);
      }
    },
    
    // 初始化音乐游戏
    initMusicGame() {
      if (this.currentTab === 'game') {
        // 清除先前的游戏
        if (musicGame) {
          musicGame.stopGame();
        }
        
        // 初始化新游戏
        musicGame = initMusicGame('game-canvas-container', this.handleGameComplete);
      }
    },
    
    // 处理游戏完成
    handleGameComplete(results) {
      console.log('游戏结果:', results);
      this.gameResults = results;
      this.showGameResults = true;
      
      // 添加情感分析
      const dominantGenre = Object.entries(results)
          .sort((a, b) => b[1] - a[1])[0][0];
          
      // 使用情感检测器将音乐风格映射到情感
      const emotionResult = this.emotionDetector.mapGenreToEmotion(dominantGenre);
      this.userEmotion = emotionResult;
      
      this.addNotification(`根据您喜欢的${dominantGenre}音乐，分析出您可能的情绪是: ${emotionResult.emotion}`, 'is-info');
    },
    
    // 使用游戏结果获取推荐
    useGameResultsForRecommendations() {
      if (!this.gameResults) {
          this.addNotification('请先完成音乐游戏', 'is-warning');
          return;
      }
      
      this.loading = true;
      this.currentTab = 'recommend'; // 确保切换到推荐页面
      
      // 如果已经有情绪分析，使用它来获取推荐
      if (this.userEmotion) {
          // 获取最受欢迎的流派
          const genres = Object.entries(this.gameResults)
              .sort((a, b) => b[1] - a[1])
              .map(entry => entry[0]);
              
          // 前端模拟实现：基于随机挑选歌曲并添加推荐理由
          setTimeout(() => {
              this.recommendations = this.sampleSongs
                  .sort(() => 0.5 - Math.random())
                  .slice(0, 6)
                  .map(song => {
                      return {
                          ...song,
                          // 加入游戏收集到的流派信息
                          recommendationReason: `根据您在游戏中喜欢的${genres[0]}音乐，以及检测到的"${this.userEmotion.emotion}"情绪，${this.emotionDetector.generateRecommendationReason(this.userEmotion.emotion)}`
                      };
                  });
              
              this.loading = false;
              this.addNotification('根据游戏结果生成了新推荐', 'is-success');
          }, 1000);
      } else {
          // 如果没有情绪分析，使用原本的游戏结果获取推荐
          setTimeout(() => {
              this.recommendations = this.sampleSongs
                  .sort(() => 0.5 - Math.random())
                  .slice(0, 6);
              this.loading = false;
              this.addNotification('根据游戏结果生成了新推荐', 'is-success');
          }, 1000);
      }
      
      this.showGameResults = false;
    },
    
    // 添加通知
    addNotification(message, type = 'is-info') {
      const id = Date.now();
      const icon = this.getNotificationIcon(type);
      
      this.notifications.push({
        id,
        message,
        type,
        icon
      });
      
      // 5秒后自动移除
      setTimeout(() => {
        this.removeNotification(id);
      }, 5000);
    },
    
    // 获取通知图标
    getNotificationIcon(type) {
      switch (type) {
        case 'is-success': return 'check-circle';
        case 'is-danger': return 'exclamation-circle';
        case 'is-warning': return 'exclamation-triangle';
        default: return 'info-circle';
      }
    },
    
    // 移除通知
    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id);
    },
    
    // 初始化情感检测器
    initEmotionDetector() {
      this.emotionDetector = new EmotionDetector();
    },
    
    // 切换情感输入界面
    toggleEmotionInput() {
      this.showEmotionDetector = !this.showEmotionDetector;
      if (this.showEmotionDetector) {
          // 如果打开了情感输入，滚动到该区域
          this.$nextTick(() => {
              const container = document.querySelector('.emotion-input-container');
              if (container) {
                  container.scrollIntoView({ behavior: 'smooth' });
              }
          });
      }
    },
    
    // 处理情感输入
    async detectEmotion() {
      if (!this.emotionInput.trim()) {
          this.addNotification('请输入您当前的心情', 'is-warning');
          return;
      }
      
      this.addNotification('正在分析您的情绪...', 'is-info');
      const result = await this.emotionDetector.detectFromText(this.emotionInput);
      
      this.userEmotion = result;
      this.addNotification(`检测到您当前的情绪: ${result.emotion}`, 'is-success');
      
      // 自动获取情感推荐
      this.getEmotionBasedRecommendations();
    },
    
    // 获取基于情感的音乐推荐
    async getEmotionBasedRecommendations() {
      if (!this.userEmotion) {
          this.addNotification('请先输入您的心情', 'is-warning');
          return;
      }
      
      this.isLoadingRecommendations = true;
      const emotion = this.userEmotion.emotion;
      
      try {
        // 这里可以添加实际的API调用
        // const response = await axios.get(`/api/emotion_recommendations?emotion=${emotion}`);
          // this.recommendations = response.data.recommendations;
          
        // 模拟推荐结果
        setTimeout(() => {
          // 情感推荐理由模板
          const emotionReasons = {
            "开心": [
              "这首欢快的歌曲会让您的好心情持续更久",
              "旋律轻快，完美匹配您当前的开心情绪",
              "节奏明快，适合您现在愉悦的心情",
              "这首歌会让您的笑容更灿烂"
            ],
            "伤心": [
              "这首温柔的歌曲能够抚慰您的伤感情绪",
              "歌词中的共鸣或许能给您带来一些安慰",
              "舒缓的旋律会帮助您平静下来",
              "情感丰富的音乐，适合在您感到低落时聆听"
            ],
            "平静": [
              "这首舒缓的音乐会维持您内心的平静",
              "温和的旋律与您当前的平静心情相得益彰",
              "这首歌的节奏可以帮助您保持内心的宁静",
              "轻柔优美的曲调，适合您现在恬静的心境"
            ],
            "兴奋": [
              "这首节奏强劲的歌曲会让您的兴奋感持续",
              "动感的节拍会让您的热情更加澎湃",
              "这首歌的能量完美匹配您现在的兴奋状态",
              "激昂的旋律，让您的热情继续高涨"
            ],
            "疲惫": [
              "这首轻松的曲子会帮助您舒缓疲劳",
              "平缓的旋律能让您放松紧绷的神经",
              "这首歌能够为您创造一个放松的氛围",
              "舒适的音乐，帮您缓解疲惫感"
            ],
            "焦虑": [
              "这首歌的平稳节奏有助于缓解您的焦虑",
              "舒缓的旋律能够帮助您找回内心的平静",
              "这首歌的和声能够减轻您的紧张情绪",
              "温柔的音乐，让您的担忧慢慢消散"
            ],
            "愤怒": [
              "这首歌的力量感能够帮您宣泄内心的愤怒",
              "强烈的节奏与您的情绪产生共鸣",
              "这首歌可以帮助您释放压抑的情感",
              "有力的旋律，帮您转化负面情绪"
            ],
            "怀念": [
              "这首充满回忆感的音乐适合您怀旧的心情",
              "柔和的旋律会唤起美好的回忆",
              "这首歌的情感与您的怀念之情相呼应",
              "恬静的音乐，让您沉浸在美好的回忆中"
            ],
            "浪漫": [
              "这首浪漫的歌曲会让您的心情更加甜蜜",
              "温馨的旋律与您当前的浪漫情绪相得益彰",
              "这首歌的优美旋律会增添您的浪漫情怀",
              "柔情的音乐，为您的浪漫心情锦上添花"
            ],
            "孤独": [
              "这首歌的情感能够陪伴您度过孤独时光",
              "深沉的旋律与您的情绪产生共鸣",
              "这首歌仿佛在诉说着您内心的感受",
              "细腻的音乐，让您在孤独中感受温暖"
            ]
          };
          
          // 获取当前情感的推荐理由，如果没有匹配的情感，使用默认理由
          const currentEmotionReasons = emotionReasons[emotion] || [
            `这首歌非常适合您现在"${emotion}"的心情`,
            `歌曲的情感与您的"${emotion}"心情相呼应`,
            `为您的"${emotion}"心情量身打造的音乐体验`,
            `这首歌会让您的"${emotion}"情绪得到共鸣`
          ];
          
          // 基于情绪推荐歌曲
          this.recommendations = this.sampleSongs
              .sort(() => 0.5 - Math.random())
              .slice(0, 8)
              .map((song, index) => {
                  // 随机选择一个当前情感的推荐理由
                  const reasonIndex = Math.floor(Math.random() * currentEmotionReasons.length);
                  const recommendReason = currentEmotionReasons[reasonIndex];
                  
                  return {
                      ...song,
                      id: 200 + index,  // 为了避免ID冲突
                      source: 'emotion',  // 标记为情感推荐
                      preview_url: song.preview_url || 'https://p.scdn.co/mp3-preview/3eb16018c2a700240e9dfb8817b6f2d041f15eb1',
                      recommendationReason: recommendReason,
                      likeCount: Math.floor(Math.random() * 1000) + 100,
                      dislikeCount: Math.floor(Math.random() * 100),
                  };
              });
          
          this.isLoadingRecommendations = false;
          this.currentTab = 'recommend';
          this.addNotification(`已为您生成 "${emotion}" 情绪下的个性化推荐`, 'is-success');
          
          // 默认选择情感推荐分类
          this.recommendationCategory = 'emotion';
          
          // 重置加载更多状态
          this.hasMoreRecommendations = true;
          this.currentPage = 1;
        }, 1500);
      } catch (error) {
        console.error('获取情感推荐失败:', error);
        this.isLoadingRecommendations = false;
        this.addNotification('获取情感推荐失败', 'is-danger');
      }
    },
    
    // 导航到情感推荐页面
    navigateToEmotionRecommend() {
      this.currentTab = 'recommend'; // 切换到推荐标签页
      this.$nextTick(() => {
        this.showEmotionDetector = true; // 显示情感输入界面
        // 滚动到情感输入区域
        setTimeout(() => {
          const container = document.querySelector('.emotion-input-container');
          if (container) {
            container.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      });
    },
    
    // 使用建议的聊天提示
    useSuggestion(suggestion) {
      this.currentMessage = suggestion;
      this.sendMessage();
    },
    
    // 初始化页面按钮事件绑定
    initButtonEvents() {
      console.log('初始化导航事件...');
      
        // 为所有带有data-tab属性的元素添加点击事件
      const tabButtons = document.querySelectorAll('[data-tab]');
      console.log(`找到 ${tabButtons.length} 个标签按钮`);
      
      tabButtons.forEach(el => {
        el.removeEventListener('click', this.tabClickHandler); // 先移除可能存在的事件处理器
        
          el.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = el.getAttribute('data-tab');
            if (tab) {
            console.log(`切换到标签页: ${tab}`);
              this.currentTab = tab;
            
            // 添加样式变化反馈
            tabButtons.forEach(btn => btn.classList.remove('is-active'));
            el.classList.add('is-active');
            }
          });
        });
        
      // 初始化音乐游戏预览区域的开始游戏按钮
      const gameStartBtn = document.querySelector('#music-game-container button');
      if (gameStartBtn) {
        gameStartBtn.addEventListener('click', () => {
          this.currentTab = 'game';
          console.log('切换到游戏标签页');
        });
      }
      
      // 初始化推荐刷新按钮动画效果
      const refreshBtn = document.querySelector('button[title="刷新推荐"]');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
          refreshBtn.classList.add('refresh-pulse');
          setTimeout(() => {
            refreshBtn.classList.remove('refresh-pulse');
          }, 1000);
          
          this.refreshRecommendations(false);
        });
      }
    },
    
    // 通过ID查找歌曲
    findSongById(id) {
      // 在sampleSongs和recommendations中查找
      const allSongs = [...this.sampleSongs, ...this.recommendations];
      return allSongs.find(song => song.id === parseInt(id));
    },
    
    // 添加新的方法用于保存心情
    submitMood() {
      if (this.emotionInput) {
        // 保存用户心情数据
        this.userEmotion = {
          emotion: this.emotionInput,
          timestamp: new Date().toISOString()
        };
        this.addNotification(
          this.currentLanguage === 'zh' ? 
          '已记录您的心情！' : 
          'Your mood has been recorded!', 
          'is-success'
        );
      }
    },
    
    // 保存用户偏好设置
    saveUserPreferences() {
      // 收集表单数据
      const preferences = {
        musicStyles: this.selectedMusicStyles,
        musicScenes: this.selectedMusicScenes,
        musicLanguages: this.selectedMusicLanguages,
        musicEras: this.selectedMusicEras,
        favoriteArtists: this.favoriteArtists,
        dailyListeningTime: this.dailyListeningTime
      };
      
      // 保存到本地存储或发送到服务器
      localStorage.setItem('userMusicPreferences', JSON.stringify(preferences));
      
      // 添加通知
      this.addNotification(
        this.currentLanguage === 'zh' ? 
        '偏好设置已保存！' : 
        'Preferences saved!', 
        'is-success'
      );
    },
    
    // 获取当前问题步骤
    getCurrentQuestionStep() {
        // 确保questionSteps存在
        if (!this.questionSteps || !this.questionSteps.length) {
            return {
                title: '音乐风格偏好',
                subtitle: '请选择您喜欢的音乐风格 (可多选)',
                dataCategory: 'genres',
                options: this.musicStyleOptions || []
            };
        }
        return this.questionSteps.find(step => step.id === this.currentQuestionStep) || this.questionSteps[0];
    },
    
    // 检查选项是否被选中
    isOptionSelected(category, value) {
        if (!this.questionnaireAnswers[category]) {
            return false;
        }
        return this.questionnaireAnswers[category].indexOf(value) !== -1;
    },
    
    // 切换问卷选项选择状态
    toggleSelection(category, value) {
        if (!this.questionnaireAnswers[category]) {
            this.questionnaireAnswers[category] = [];
        }
        
        const index = this.questionnaireAnswers[category].indexOf(value);
        if (index === -1) {
            this.questionnaireAnswers[category].push(value);
        } else {
            this.questionnaireAnswers[category].splice(index, 1);
        }
    },
    
    // 下一个问题
    nextQuestionStep() {
        if (this.currentQuestionStep < this.totalQuestionSteps) {
            this.currentQuestionStep++;
            this.questionnaireProgress = (this.currentQuestionStep / this.totalQuestionSteps) * 100;
        } else {
            // 提交问卷
            this.submitQuestionnaire();
        }
    },
    
    // 上一个问题
    prevQuestionStep() {
        if (this.currentQuestionStep > 1) {
            this.currentQuestionStep--;
            this.questionnaireProgress = (this.currentQuestionStep / this.totalQuestionSteps) * 100;
        }
    },
    
    // 提交问卷
    submitQuestionnaire() {
        // 显示成功消息
        this.addNotification(
            this.currentLanguage === 'zh' ? 
            '问卷提交成功！感谢您的参与。' : 
            'Questionnaire submitted successfully! Thank you for your participation.',
            'is-success'
        );
        
        // 重置问卷状态
        this.showQuestionnaireUI = false;
        this.currentQuestionStep = 1;
    },
    
    // 更新用户向量
    updateUserVector(song, delta) {
      if (!this.userVector.lastUpdated) {
        this.userVector.lastUpdated = new Date();
      }
      
      // 标记向量已修改
      this.userVector.dirtyFlag = true;
      
      // 1. 更新艺术家偏好
      if (song.artist) {
        if (!this.userVector.artists[song.artist]) {
          this.userVector.artists[song.artist] = 0.5; // 初始中性值
        }
        
        // 更新艺术家偏好值，确保在0-1范围内
        this.userVector.artists[song.artist] = Math.max(0, Math.min(1, 
          this.userVector.artists[song.artist] + delta
        ));
        
        console.log(`艺术家[${song.artist}]偏好更新为: ${this.userVector.artists[song.artist]}`);
      }
      
      // 2. 更新流派偏好
      if (song.genre) {
        if (!this.userVector.genres[song.genre]) {
          this.userVector.genres[song.genre] = 0.5; // 初始中性值
        }
        
        // 更新流派偏好值，确保在0-1范围内
        this.userVector.genres[song.genre] = Math.max(0, Math.min(1, 
          this.userVector.genres[song.genre] + delta
        ));
        
        console.log(`流派[${song.genre}]偏好更新为: ${this.userVector.genres[song.genre]}`);
      }
      
      // 3. 根据歌曲特征更新音乐特征偏好（如果有）
      if (song.features) {
        Object.keys(song.features).forEach(feature => {
          if (!this.userVector.features[feature]) {
            this.userVector.features[feature] = 0.5; // 初始中性值
          }
          
          // 更新特征偏好值，确保在0-1范围内
          this.userVector.features[feature] = Math.max(0, Math.min(1, 
            this.userVector.features[feature] + (delta * 0.5) // 特征影响较小
          ));
        });
      }
      
      // 更新变化计数
      this.userVectorChangeCount++;
      
      // 检查是否需要自动刷新推荐
      if (this.autoRefreshEnabled && 
          this.userVectorChangeCount >= this.minUserVectorChangesForRefresh &&
          this.currentTab === 'recommend') {
        this.refreshRecommendations(true);
        // 重置计数
        this.userVectorChangeCount = 0;
      }
    },
    
    // 检查是否需要持久化用户向量（当有一定量的更改或经过一定时间）
    checkAndPersistUserVector() {
      // 如果向量已被修改
      if (this.userVector.dirtyFlag) {
        const now = new Date();
        const timeSinceLastUpdate = this.userVector.lastUpdated ? 
          (now - this.userVector.lastUpdated) / 1000 : 0; // 转换为秒
        
        // 如果距离上次更新超过2分钟，或者这是第一次更新，则持久化
        if (!this.userVector.lastUpdated || timeSinceLastUpdate > 120) {
          this.persistUserVector();
        }
      }
    },
    
    // 持久化用户向量到数据库
    persistUserVector() {
      console.log('持久化用户向量到数据库:', this.userVector);
      
      // 更新最后更新时间
      this.userVector.lastUpdated = new Date();
      // 重置脏标记
      this.userVector.dirtyFlag = false;
      
      // 直接保存到本地存储
      try {
        const userData = {
          user_id: this.currentUser ? this.currentUser.id : 'anonymous',
          vector: {
            artists: this.userVector.artists,
            genres: this.userVector.genres,
            features: this.userVector.features
          },
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('user_vector', JSON.stringify(userData));
        console.log('用户向量已保存到本地存储');
        
        // 用户向量保存后，考虑刷新推荐
        if (this.currentTab === 'recommend' && this.autoRefreshEnabled) {
          // 检查是否有显著变化需要刷新
          if (this.userVectorChangeCount >= this.minUserVectorChangesForRefresh) {
            this.refreshRecommendations(true);
            this.userVectorChangeCount = 0;
          }
        }
        
        return Promise.resolve();
      } catch (error) {
        console.error('用户向量保存失败:', error);
        // 恢复脏标记，以便下次尝试保存
        this.userVector.dirtyFlag = true;
        
        // 添加错误通知
        this.addNotification('用户偏好数据保存失败，请稍后再试', 'is-danger');
        
        return Promise.reject(error);
      }
    },
    
    // 处理音频播放事件
    handleAudioPlay() {
      console.log("音频播放开始:", this.currentPlayingSong.title);
      this.isPlaying = true;
      
      // 添加进度条更新定时器
      this.progressUpdateInterval = setInterval(() => {
        this.updateAudioProgress();
      }, 1000);
      
      // 记录播放开始时间
      this.playStartTime = new Date().getTime();
    },
    
    // 处理音频暂停事件
    handleAudioPause() {
      console.log("音频播放暂停:", this.currentPlayingSong?.title);
      this.isPlaying = false;
      
      // 清除进度条更新定时器
      clearInterval(this.progressUpdateInterval);
      
      // 当音频暂停时更新按钮状态
      this.updatePlayButtonState();
      
      // 累计播放时间
      if (this.playStartTime) {
        const pauseTime = new Date().getTime();
        this.totalPlayTime += (pauseTime - this.playStartTime) / 1000;
        console.log(`累计播放时间: ${this.totalPlayTime}秒`);
      }
    },
    
    updateAudioProgress() {
      const audio = document.getElementById('audioPlayer');
      const progressBar = document.getElementById('audioProgressBar');
      const durationElement = document.getElementById('audioDuration');
      
      if (!audio || !progressBar) {
        return;
      }
      
      try {
        // 计算当前进度百分比
        const currentTime = audio.currentTime || 0;
        const duration = audio.duration || 0;
        
        if (!isNaN(duration) && duration > 0) {
          // 更新进度条
          this.progressPercentage = (currentTime / duration) * 100;
          progressBar.style.width = `${this.progressPercentage}%`;
          
          // 更新时间显示
          if (durationElement) {
            const formatTimeDigits = (time) => {
              const minutes = Math.floor(time / 60);
              const seconds = Math.floor(time % 60);
              return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            };
            
            durationElement.textContent = `${formatTimeDigits(currentTime)} / ${formatTimeDigits(duration)}`;
          }
          
          // 检查播放里程碑
          this.checkPlayMilestone(currentTime);
        }
      } catch (e) {
        console.error('更新进度条失败:', e);
      }
    },
    
    setProgress(event) {
      const audio = document.getElementById('audioPlayer');
      const progressContainer = document.getElementById('audioProgressContainer');
      
      if (!audio || !progressContainer) {
        return;
      }
      
      try {
        // 获取点击位置相对于进度条容器的位置
        const rect = progressContainer.getBoundingClientRect();
        const clickPos = event.clientX - rect.left;
        const containerWidth = rect.width;
        
        // 计算百分比
        const percentage = (clickPos / containerWidth);
        
        // 设置音频当前播放位置
        if (!isNaN(audio.duration) && audio.duration > 0) {
          audio.currentTime = percentage * audio.duration;
          
          // 立即更新进度条显示
          this.updateAudioProgress();
          
          console.log(`设置播放进度: ${Math.round(percentage * 100)}%`);
        }
      } catch (e) {
        console.error('设置播放进度失败:', e);
      }
    },
    
    // 处理音频结束事件
    handleAudioEnded() {
      console.log('音频播放结束');
      
      // 更新播放按钮状态
      this.updatePlayButtonState();
      
      // 获取目前正在播放的歌曲ID来记录行为
      if (this.currentPlayingSong) {
        this.trackPlayEnd();
        
        // 清除当前播放歌曲信息
        this.currentPlayingSong = null;
        
        // 重置已达到的里程碑
        this.reachedMilestones = [];
      }
      
      // 隐藏播放器（可选，根据UI需求）
      // document.getElementById('audioPlayerContainer').classList.add('hidden');
    },

    // 处理音频错误
    handleAudioError(error) {
      console.error('音频播放错误:', error);
      
      // 设置默认错误信息
      let errorMessage = '音频播放出错，请稍后再试';
      let errorType = 'is-warning';
      
      // 检查错误类型
      if (error) {
        if (error.name) {
          switch (error.name) {
            case 'NotSupportedError':
              errorMessage = '您的浏览器不支持此音频格式，将为您生成替代音频';
              // 不显示给用户，由playSongPreview处理
              return;
            case 'NotAllowedError':
              errorMessage = '浏览器阻止了自动播放，请点击播放按钮开始播放';
              errorType = 'is-info';
              break;
            case 'NotFoundError':
              errorMessage = '找不到音频资源，正在为您生成音乐预览';
              errorType = 'is-info';
              break;
            case 'NetworkError':
              errorMessage = '网络连接问题，正在使用离线模式';
              break;
            case 'AbortError':
              // 用户手动中止，不显示错误
              return;
            default:
              // Edge和Safari可能报告不同的错误
              if (error.message && error.message.includes('source')) {
                errorMessage = '无法加载音频源，将为您生成替代音频';
                return; // 不显示给用户
              }
          }
        } else if (error.type === 'error') {
          // 媒体元素错误事件
          errorMessage = '音频加载失败，正在为您生成音乐预览';
          return; // 不显示给用户
        }
      }
      
      // 显示错误通知（如果需要）
      if (errorType !== 'is-info') {
        this.addNotification(errorMessage, errorType);
      }
      
      // 更新播放统计
      if (this.playBehavior.currentSongId) {
        const songId = this.playBehavior.currentSongId;
        if (this.playBehavior.behaviors[songId]) {
          this.playBehavior.behaviors[songId].errorCount = 
            (this.playBehavior.behaviors[songId].errorCount || 0) + 1;
        }
      }
      
      // 重置播放状态
      this.isPlaying = false;
      this.updatePlayButtonState();
    },

    // 检查播放里程碑，用于隐式反馈
    checkPlayMilestone(currentTime) {
      // 检查是否达到播放里程碑并更新用户向量
      if (!this.currentPlayingSong || !this.currentPlayingSong.id) return;
      
      const milestones = [
        { time: 10, reached: false, weight: 0.1 },
        { time: 30, reached: false, weight: 0.3 },
        { time: 60, reached: false, weight: 0.6 },
        { time: 120, reached: false, weight: 1.0 }
      ];
      
      // 找到当前达到的最高里程碑
      let highestMilestone = null;
      for (const milestone of milestones) {
        if (currentTime >= milestone.time && !this.reachedMilestones.includes(milestone.time)) {
          highestMilestone = milestone;
          this.reachedMilestones.push(milestone.time);
        }
      }
      
      // 如果达到新的里程碑，更新用户向量
      if (highestMilestone) {
        console.log(`达到播放里程碑: ${highestMilestone.time}秒，权重: ${highestMilestone.weight}`);
        
        // 查找对应的歌曲信息
        const allSongs = [...this.sampleSongs, ...this.recommendations];
        const song = allSongs.find(s => s.id === this.currentPlayingSong.id);
        
        // 更新用户向量（隐式反馈）
        if (song) {
          // 创建向量信息
          const songVector = {
            artist: song.artist,
            genre: song.genre,
            features: song.features || {}
          };
          
          // 更新用户向量
          this.updateUserVector(songVector, highestMilestone.weight);
          
          // 发送隐式反馈到服务器
          this.sendImplicitFeedback(this.currentPlayingSong.id, "play_milestone", highestMilestone.time);
        }
      }
    },
    
    sendImplicitFeedback(songId, action, value) {
      // 向服务器发送隐式反馈数据
      if (!songId) return;
      
      const feedbackData = {
        song_id: songId,
        action: action,
        value: value,
        timestamp: new Date().toISOString()
      };
      
      console.log("发送隐式反馈:", feedbackData);
      
      // 在模拟环境中，总是存储到本地
      try {
        const implicitFeedback = JSON.parse(localStorage.getItem('implicitFeedback') || '[]');
        implicitFeedback.push(feedbackData);
        localStorage.setItem('implicitFeedback', JSON.stringify(implicitFeedback));
        console.log('隐式反馈已保存到本地存储');
      } catch (error) {
        console.error('保存隐式反馈失败:', error);
      }
    },
    
    // 添加刷新推荐的方法
    refreshRecommendations(isAutoRefresh = false) {
      if (this.isLoadingRecommendations) {
        console.log('已经在加载推荐中，忽略此次刷新请求');
        return;
      }
      
      console.log(`${isAutoRefresh ? '自动' : '手动'}刷新推荐开始`);
      
      // 如果没有评分过足够的歌曲，则不刷新
      if (!this.hasRatedEnoughSongs) {
        if (!isAutoRefresh) {
          this.addNotification('请至少对5首歌曲进行评分', 'is-warning');
        }
        return;
      }
      
      this.isLoadingRecommendations = true;
      
      // 首先切换到推荐页面（如果不是自动刷新）
      if (!isAutoRefresh) {
        this.currentTab = 'recommend';
      }
      
      // 生成基于最新用户向量的推荐
      setTimeout(() => {
        // 保存当前推荐的前3首，以便展示算法如何调整推荐
        const previousTopRecommendations = this.recommendations.slice(0, 3);
        
        // 根据用户向量生成新的推荐
        this.generateRecommendationsFromUserVector();
        
        // 标记最后更新时间
        this.recommendationsLastUpdated = new Date();
        
        this.isLoadingRecommendations = false;
        
        // 显示通知（如果不是静默刷新）
        if (!isAutoRefresh) {
          this.addNotification('已根据您的最新偏好刷新推荐', 'is-success');
        } else {
          // 如果是自动刷新且推荐有明显变化，通知用户
          const newTopSongs = this.recommendations.slice(0, 3);
          const hasSignificantChanges = newTopSongs.some(newSong => 
            !previousTopRecommendations.some(oldSong => oldSong.id === newSong.id)
          );
          
          if (hasSignificantChanges) {
            this.addNotification('基于您的最新偏好，推荐已自动更新', 'is-info');
          }
        }
      }, isAutoRefresh ? 1000 : 1500); // 自动刷新速度稍快
    },
    
    // 生成基于用户向量的推荐
    generateRecommendationsFromUserVector() {
      console.log('生成基于用户向量的推荐...');
      
      // 确保用户向量数据存在
      if (!this.userVector || 
          !this.userVector.artists || 
          !this.userVector.genres || 
          !this.userVector.features) {
        // 初始化用户向量
        this.userVector = {
          artists: {},
          genres: {},
          features: {}
        };
        
        console.log('初始化用户向量');
      }
      
      // 分析用户向量数据
      const favoriteGenres = Object.entries(this.userVector.genres)
        .filter(([_, score]) => score > 0.5) // 筛选高分流派
        .sort((a, b) => b[1] - a[1]) // 按分数从高到低排序
        .map(([genre]) => genre); // 只保留流派名称
      
      const favoriteArtists = Object.entries(this.userVector.artists)
        .filter(([_, score]) => score > 0.5) // 筛选高分艺术家
        .sort((a, b) => b[1] - a[1]) // 按分数从高到低排序
        .map(([artist]) => artist); // 只保留艺术家名称
      
      // 收集可能的低评分特征（用于排除不喜欢的音乐特征）
      const dislikedFeatures = Object.entries(this.userVector.features)
        .filter(([_, score]) => score < 0.3) // 筛选低分特征
        .map(([feature]) => feature);
      
      console.log('推荐基于:', {
        favoriteGenres, 
        favoriteArtists, 
        dislikedFeatures
      });
      
      // 这里仅是模拟，实际项目应调用后端API
      // 模拟不同来源的推荐（算法、基于情感等）
      const algorithmRecommendations = this.mockAlgorithmRecommendations(
        favoriteGenres, 
        favoriteArtists, 
        dislikedFeatures
      );
      
      // 如果已有情感推荐，保留它们但放到推荐列表后面
      const emotionRecommendations = this.recommendations
        .filter(song => song.source === 'emotion');
      
      // 合并推荐结果，确保不重复
      const combinedRecommendations = [...algorithmRecommendations];
      
      // 合并后添加情感推荐（确保不重复）
      emotionRecommendations.forEach(song => {
        if (!combinedRecommendations.some(rec => rec.id === song.id)) {
          combinedRecommendations.push(song);
        }
      });
      
      // 更新推荐列表
      this.recommendations = combinedRecommendations;
      this.hasMoreRecommendations = true;
      this.currentPage = 1;
      this.recommendationCategory = 'all'; // 默认显示所有推荐
    },
    
    // 模拟算法推荐（模拟基于用户向量的算法）
    mockAlgorithmRecommendations(favoriteGenres, favoriteArtists, dislikedFeatures) {
      // 从样本歌曲中筛选出匹配用户偏好的歌曲
      let candidateSongs = this.sampleSongs.filter(song => {
        // 排除已评分的歌曲
        if (song.rating) return false;
        
        // 如果艺术家匹配用户喜好，增加推荐概率
        const isArtistMatch = favoriteArtists.includes(song.artist);
        
        // 如果流派匹配用户喜好，增加推荐概率
        const isGenreMatch = song.genre && favoriteGenres.includes(song.genre);
        
        // 基础概率 + 匹配因素
        const baseChance = 0.2;
        const matchChance = (isArtistMatch ? 0.4 : 0) + (isGenreMatch ? 0.3 : 0);
        
        // 决定是否推荐这首歌
        return Math.random() < (baseChance + matchChance);
      });
      
      // 确保至少有4首歌
      if (candidateSongs.length < 4) {
        // 如果候选歌曲不足，添加一些随机歌曲（但排除已评分的）
        const additionalSongs = this.sampleSongs
          .filter(song => !song.rating && !candidateSongs.some(c => c.id === song.id))
          .sort(() => 0.5 - Math.random())
          .slice(0, 6 - candidateSongs.length);
        
        candidateSongs = [...candidateSongs, ...additionalSongs];
      }
      
      // 最多选择6首歌
      candidateSongs = candidateSongs.slice(0, 6);
      
      // 丰富的推荐理由模板
      const reasonTemplates = {
        artist: [
          `基于您对 {artist} 的喜爱`,
          `为您推荐 {artist} 的更多作品`,
          `符合您欣赏的艺术家 {artist} 的风格`,
          `与您喜欢的艺术家 {artist} 音乐风格相似`
        ],
        genre: [
          `匹配您偏爱的 {genre} 风格`,
          `为您精选的 {genre} 类型音乐`,
          `根据您的听歌习惯，您可能会喜欢这首 {genre}`,
          `这首 {genre} 与您的音乐品味相符`
        ],
        general: [
          `基于您的历史播放数据推荐`,
          `与您近期欣赏的歌曲有相似元素`,
          `多数与您有相似偏好的用户也喜欢这首歌`,
          `这首歌的音乐特征符合您的个人品味`
        ]
      };
      
      // 为每首歌添加推荐原因
      return candidateSongs.map(song => {
        // 决定推荐理由
        let reason;
        if (favoriteArtists.includes(song.artist)) {
          // 随机选择一个艺术家相关的理由模板
          const template = reasonTemplates.artist[Math.floor(Math.random() * reasonTemplates.artist.length)];
          reason = template.replace('{artist}', song.artist);
        } else if (song.genre && favoriteGenres.includes(song.genre)) {
          // 随机选择一个流派相关的理由模板
          const template = reasonTemplates.genre[Math.floor(Math.random() * reasonTemplates.genre.length)];
          reason = template.replace('{genre}', song.genre);
        } else {
          // 随机选择一个通用理由
          reason = reasonTemplates.general[Math.floor(Math.random() * reasonTemplates.general.length)];
        }
        
        // 在歌曲中添加随机点赞和点踩数
        return {
          ...song,
          explanation: reason,
          source: "algorithm",
          likeCount: Math.floor(Math.random() * 500) + 300,
          dislikeCount: Math.floor(Math.random() * 50)
        };
      });
    },
    
    // 添加用户向量相关的辅助方法
    topUserPreferences(category, limit = 5) {
      // 根据类别（艺术家、流派、特征）获取top N的偏好
      const preferences = this.userVector[category];
      
      if (!preferences || Object.keys(preferences).length === 0) {
        return {};
      }
      
      // 按偏好得分从高到低排序
      return Object.fromEntries(
        Object.entries(preferences)
          .filter(([_, score]) => score > 0.5) // 只显示偏好大于0.5的项
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
      );
    },

    // 根据偏好得分返回合适的标签颜色
    getPreferenceTagColor(score) {
      if (score >= 0.8) return 'is-success'; // 很喜欢
      if (score >= 0.65) return 'is-primary'; // 喜欢
      if (score >= 0.5) return 'is-info'; // 稍微喜欢
      if (score <= 0.3) return 'is-danger'; // 不喜欢
      if (score <= 0.4) return 'is-warning'; // 稍微不喜欢
      return 'is-light'; // 中性
    },
    
    // 切换自动刷新功能
    toggleAutoRefresh() {
      console.log('触发toggleAutoRefresh方法');
      console.log('自动刷新之前状态:', this.autoRefreshEnabled);
      
      this.autoRefreshEnabled = !this.autoRefreshEnabled;
      
      console.log('自动刷新之后状态:', this.autoRefreshEnabled);
      
      this.addNotification(
        this.autoRefreshEnabled ? 
          '已开启推荐自动刷新' : 
          '已关闭推荐自动刷新', 
        'is-info'
      );
      
      // 保存用户偏好
      localStorage.setItem('autoRefreshEnabled', this.autoRefreshEnabled.toString());
    },
    
    // 设置自动刷新计时器
    setupAutoRefreshTimer() {
      // 每5分钟检查一次是否需要刷新
      setInterval(() => {
        // 如果自动刷新被禁用，则跳过
        if (!this.autoRefreshEnabled) return;
        
        // 如果当前不在推荐页面，则跳过
        if (this.currentTab !== 'recommend') return;
        
        // 检查是否距离上次更新已经过了足够的时间
        if (this.recommendationsLastUpdated) {
          const now = new Date();
          const timeSinceLastUpdate = now - this.recommendationsLastUpdated;
          
          if (timeSinceLastUpdate >= this.recommendationRefreshInterval) {
            this.refreshRecommendations(true);
          }
        } else if (this.hasRatedEnoughSongs) {
          // 如果从未更新过且有足够评分，则更新
          this.refreshRecommendations(true);
        }
      }, 60000); // 每分钟检查一次
    },

    // 更新播放按钮状态
    updatePlayButtonState() {
      const playPauseBtn = document.getElementById('playPauseBtn');
      if (playPauseBtn) {
        playPauseBtn.innerHTML = this.isPlaying ? 
          '<span class="icon"><i class="fas fa-pause"></i></span>' : 
          '<span class="icon"><i class="fas fa-play"></i></span>';
      }
    },

    // 添加聊天欢迎消息
    addChatWelcomeMessage() {
      const welcomeMessage = this.currentLanguage === 'zh' ? 
        '你好！我是AI音乐助手，可以帮你找到你喜欢的音乐。试着告诉我你喜欢什么类型的音乐或者你喜欢的歌手吧！' : 
        'Hello! I\'m the AI Music Assistant. I can help you find music you\'ll love. Try telling me what genres or artists you like!';
      
      this.chatMessages.push({
        isUser: false,
        content: welcomeMessage,
        timestamp: new Date()
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
        } else if (newTab === 'chat' && this.chatMessages.length === 0) {
          // 如果进入聊天页面且没有消息，添加欢迎消息
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
      
      // 4. 初始化按钮事件
      this.initButtonEvents();
      
      // 5. 设置自动保存用户向量的计时器
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
