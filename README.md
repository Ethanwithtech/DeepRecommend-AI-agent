# DeepRecommend-AI 智能音乐推荐系统

DeepRecommend-AI是一个基于混合推荐策略的智能音乐推荐系统，结合了协同过滤、内容分析、上下文感知和情感分析技术，提供个性化音乐推荐服务。系统支持使用Million Song Dataset(MSD)数据集训练，可选择性集成Spotify API，并具备AI聊天功能，能够根据用户情绪推荐匹配的音乐。

## 功能特点

### 核心推荐功能
- **混合推荐策略**：结合协同过滤、内容分析和上下文感知推荐
- **情感感知推荐**：根据用户情绪状态智能推荐匹配的音乐
- **个性化用户向量**：接收并处理实时用户行为向量
- **音乐试听功能**：支持在线试听推荐的音乐

### AI交互功能
- **情感分析**：能够分析用户文本，识别情绪类型和强度
- **AI聊天助手**：提供心理支持和情绪疏导
- **用户数据记录**：跟踪并存储用户情绪变化和音乐偏好

### 技术特性
- **可定制训练数据量**：支持使用不同规模的MSD数据子集
- **Spotify API集成**：获取更丰富的音乐信息和试听链接
- **模型序列化**：支持保存和加载训练好的模型
- **REST API接口**：提供标准化HTTP接口供前端调用

## 系统架构

```
DeepRecommend-AI/
├── app.py                    # 主应用入口点
├── api_server.py             # API服务器
├── frontend/                 # 前端代码
│   ├── static/               # 静态资源(CSS,JS,音频)
│   └── templates/            # HTML模板
└── backend/                  # 后端代码
    ├── api/                  # API接口
    ├── models/               # 各类模型实现
    │   ├── ai_music_agent.py # AI音乐代理
    │   ├── emotion_analyzer.py # 情感分析器
    │   └── recommendation_engine.py # 推荐引擎
    └── utils/                # 工具函数
        └── ai_service.py     # AI服务(聊天/情感分析)
```

## 安装

1. 克隆代码库：

```bash
git clone https://github.com/Ethanwithtech/DeepRecommend-AI-agent.git
cd DeepRecommend-AI-agent
```

2. 安装依赖：

```bash
pip install -r requirements.txt
```

3. (可选) 配置API密钥：
   - 创建`.env`文件并添加以下内容：
   ```
   SPOTIFY_CLIENT_ID=你的Spotify客户端ID
   SPOTIFY_CLIENT_SECRET=你的Spotify客户端密钥
   ANTHROPIC_API_KEY=你的Anthropic API密钥(Claude)
   ```

## 使用方法

### 启动系统

使用以下命令启动系统：

```bash
python app.py
```

系统将在 http://localhost:5000 启动，并自动打开浏览器。

### 主要功能区

- **首页**：系统介绍和功能预览
- **推荐**：个性化音乐推荐，支持试听
- **评分**：对歌曲进行评分，改进推荐精度
- **聊天**：与AI助手交流，获取情感支持和音乐推荐
- **偏好**：填写音乐偏好问卷，提升推荐准确性

### API端点

- **健康检查**: `GET /api/health`
- **获取推荐**: `GET /api/recommendations/{user_id}`
- **聊天服务**: `POST /api/chat`
- **情感分析**: `POST /api/emotion/analyze`
- **情感音乐**: `GET /api/emotion/music`

## 数据集与训练

### Million Song Dataset (MSD)

系统支持使用Million Song Dataset进行训练，提供了完整的数据处理和模型训练流程。

#### 获取MSD数据集

从官方网站下载数据集：http://millionsongdataset.com/

主要文件：
- **HDF5数据**：包含所有歌曲的音频特征和元数据
- **Triplet数据集**：包含用户-歌曲-播放次数

#### 数据处理

使用以下命令进行数据处理和模型训练：

```bash
python backend/process_msd_data.py \
    --h5_path <HDF5数据路径> \
    --triplets_path <Triplet数据路径> \
    --output_dir models/trained/processed_data
```

### Spotify集成

系统支持集成Spotify API，获取更丰富的音乐元数据和试听链接：

1. 登录[Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. 创建一个应用获取Client ID和Client Secret
3. 将凭证添加到`.env`文件

### 情感分析与AI聊天

系统使用Claude AI模型提供情感分析和聊天功能：

1. 获取[Anthropic API密钥](https://www.anthropic.com/)
2. 将密钥添加到`.env`文件中
3. 系统将自动使用这些服务进行情感分析和智能对话

## 自定义与扩展

### 修改推荐算法参数

可以通过环境变量调整推荐系统参数：

```
USE_MSD=true              # 是否使用MSD数据集
DATA_DIR=processed_data   # 数据目录
MODEL_TYPE=svd            # 模型类型 (svd, cf, hybrid)
SVD_N_FACTORS=100         # SVD模型的潜在因子数
SVD_N_EPOCHS=20           # SVD模型的训练轮数
CONTENT_WEIGHT=0.3        # 内容推荐的权重
```

### 自定义UI主题

系统使用Vue.js构建前端界面，可以通过修改CSS文件自定义主题：

- 主题颜色：`frontend/static/css/main.css`
- 布局结构：`frontend/templates/index.html`

## 常见问题解答

### Q: 系统启动时报错"找不到模块"怎么办？
A: 确保在项目根目录运行命令，并检查是否正确安装了所有依赖。

### Q: AI聊天功能无法使用？
A: 需要配置有效的Anthropic API密钥，检查`.env`文件和日志输出。

### Q: 推荐结果不精确？
A: 系统需要足够的用户评分数据才能提供精确推荐。尝试对更多歌曲评分，或使用问卷功能提供偏好信息。

### Q: 如何处理内存不足问题？
A: 处理大规模数据时，可以设置较小的`chunk_limit`参数，或使用`--sample`选项生成较小的样本数据集。

### Q: 如何导出训练好的模型？
A: 训练好的模型将自动保存在`models/trained/`目录下，可以复制这些文件到其他部署环境。

## 技术栈

- **后端**：Python, Flask, SQLite
- **AI/ML**：Claude AI, TensorFlow, Scikit-learn
- **前端**：HTML5, CSS3, Vue.js
- **API集成**：Spotify Web API

## 许可证

本项目使用MIT许可证。

## 联系与支持

- 项目维护者：Ethanwithtech
- 邮箱：22256342@life.hkbu.edu.hk
- GitHub：[https://github.com/Ethanwithtech/DeepRecommend-AI-agent](https://github.com/Ethanwithtech/DeepRecommend-AI-agent) 