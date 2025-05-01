"""
音乐推荐代理，用于处理用户请求，生成个性化推荐
"""
import sys
import os
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# 导入本项目模块
try:
    from backend.models.recommendation_engine import MusicRecommender
except ImportError:
    logger.warning("无法导入MusicRecommender，使用简化版推荐引擎")
    class MusicRecommender:
        def __init__(self, *args, **kwargs):
            pass
        def recommend(self, user_id, top_n=5, context=None):
            return []

class MusicRecommenderAgent:
    """音乐推荐代理类，处理用户交互和个性化推荐"""
    
    def __init__(self, data_dir="data", use_msd=False, load_pretrained=False, pretrained_model_path=None, recommender=None):
        """
        初始化推荐代理
        
        参数:
            data_dir: 数据目录
            use_msd: 是否使用百万歌曲数据集
            load_pretrained: 是否加载预训练模型
            pretrained_model_path: 预训练模型路径
            recommender: 外部传入的推荐器实例
        """
        # 如果外部传入了推荐器实例，直接使用它
        if recommender is not None:
            self.hybrid_recommender = recommender
            logger.info("使用外部传入的推荐器实例")
        else:
            # 初始化内部推荐引擎
            self.hybrid_recommender = MusicRecommender(
                data_dir=data_dir,
                use_msd=use_msd,
                force_retrain=False
            )
            logger.info("创建了新的推荐器实例")
        
        # 用户数据存储
        self.user_data = {}
        
        # 用户模型版本记录
        self.user_model_versions = {}
        
        # 创建数据目录（如果不存在）
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
        
        # 尝试加载用户数据
        self.load_user_data()
    
    def process_message(self, user_id, message):
        """
        处理用户消息
        
        参数:
            user_id: 用户ID
            message: 用户消息
            
        返回:
            回复消息和推荐
        """
        # 初始化用户数据
        self._initialize_user_data(user_id)
        
        # 记录消息
        self.user_data[user_id]['messages'].append({
            'text': message,
            'timestamp': datetime.now().isoformat()
        })
        
        # 提取用户偏好
        preferences = self._extract_preferences_from_message(message)
        if preferences:
            self._update_user_preferences(user_id, preferences)
        
        # 分析情感
        emotion_data = self._analyze_emotion_detailed(message)
        emotion = emotion_data.get('emotion', 'neutral')
        intensity = emotion_data.get('intensity', 0.5)
        description = emotion_data.get('description', '')
        music_suggestion = emotion_data.get('music_suggestion', '')
        secondary_emotion = emotion_data.get('secondary_emotion', '')
        comfort_strategy = emotion_data.get('comfort_strategy', '')
        
        # 记录详细情感数据
        if emotion != 'neutral':
            self.user_data[user_id]['mood_data'].append({
                'primary_mood': emotion,
                'secondary_mood': secondary_emotion,
                'intensity': intensity,
                'description': description,
                'timestamp': datetime.now().isoformat()
            })
            
            # 分析用户情绪变化趋势
            self._analyze_mood_trends(user_id)
        
        # 生成安慰消息
        comfort_message = self._generate_comfort_message(emotion, intensity, description)
        
        # 如果消息包含请求推荐的内容，或情绪强度高，生成推荐
        need_recommendation = any(keyword in message.lower() for keyword in ['推荐', '建议', '喜欢什么', '听什么', '听歌', 'recommend', 'music'])
        
        if need_recommendation or intensity > 0.7:
            # 获取情感和上下文
            context = {
                'emotion': emotion, 
                'secondary_emotion': secondary_emotion,
                'intensity': intensity,
                'music_suggestion': music_suggestion
            }
            
            try:
                # 获取情感匹配的音乐推荐
                recommendations = self._get_mood_specific_songs(emotion, music_suggestion, count=5)
                
                # 补充个性化推荐
                if len(recommendations) < 5:
                    personal_recs = self.hybrid_recommender.recommend(user_id, top_n=(5-len(recommendations)), context=context)
                    recommendations.extend(personal_recs)
                
                # 确保我们得到了一些推荐
                if not recommendations:
                    recommendations = self._get_fallback_recommendations(emotion)
                
                # 添加试听链接
                recommendations = self._add_preview_links_to_recommendations(recommendations)
                
            except Exception as e:
                logger.error(f"生成推荐时出错: {e}")
                recommendations = self._get_fallback_recommendations(emotion)
            
            # 构建响应
            response = {
                'emotion': emotion,
                'emotion_data': emotion_data,
                'recommendations': recommendations,
                'message': comfort_message,
                'has_preview_links': True
            }
            
            return response
        
        # 没有特定推荐需求的回复
        return {
            'emotion': emotion,
            'emotion_data': emotion_data,
            'recommendations': [],
            'message': comfort_message
        }
    
    def process_game_data(self, user_id, game_data):
        """
        处理游戏交互数据
        
        参数:
            user_id: 用户ID
            game_data: 游戏数据
            
        返回:
            处理结果
        """
        # 确保用户数据存在
        self._initialize_user_data(user_id)
        
        # 提取游戏中的偏好数据
        preferences = self._extract_preferences_from_game(game_data)
        
        # 更新用户偏好
        self._update_user_preferences(user_id, preferences)
        
        # 更新用户模型
        self._update_user_model(user_id)
        
        # 返回处理结果
        return {
            'status': 'success',
            'message': '游戏数据处理成功',
            'user_id': user_id,
            'preferences': preferences
        }
    
    def process_questionnaire(self, user_id, questionnaire_data):
        """
        处理问卷数据
        
        参数:
            user_id: 用户ID
            questionnaire_data: 问卷数据
            
        返回:
            处理结果
        """
        # 确保用户数据存在
        self._initialize_user_data(user_id)
        
        # 提取问卷中的偏好数据
        preferences = self._extract_preferences_from_questionnaire(questionnaire_data)
        
        # 更新用户偏好
        self._update_user_preferences(user_id, preferences)
        
        # 更新用户模型
        self._update_user_model(user_id)
        
        # 返回处理结果
        return {
            'status': 'success',
            'message': '问卷数据处理成功',
            'user_id': user_id,
            'preferences': preferences
        }
    
    def handle_new_user_feedback(self, user_id, song_id, rating):
        """
        处理新的用户反馈
        
        参数:
            user_id: 用户ID
            song_id: 歌曲ID
            rating: 评分
            
        返回:
            处理结果
        """
        # 确保用户数据存在
        self._initialize_user_data(user_id)
        
        # 更新用户评分
        self.user_data[user_id]['ratings'][song_id] = {
            'rating': rating,
            'timestamp': datetime.now().isoformat()
        }
        
        # 更新用户模型 (实时更新)
        self._update_user_model(user_id, real_time=True)
        
        # 返回处理结果
        return {
            'status': 'success',
            'message': '用户反馈处理成功',
            'user_id': user_id,
            'song_id': song_id,
            'rating': rating
        }
    
    def get_mood_based_recommendations(self, user_id, mood, top_n=5):
        """
        获取基于情绪的推荐
        
        参数:
            user_id: 用户ID
            mood: 情绪
            top_n: 推荐数量
            
        返回:
            推荐结果
        """
        # 获取上下文信息
        context = self._get_current_context(user_id)
        context['mood'] = mood
        
        # 使用情绪上下文生成推荐
        try:
            recommendations = self.hybrid_recommender.recommend(user_id, top_n=top_n, context=context)
            return recommendations
        except Exception as e:
            logger.error(f"情绪推荐出错: {str(e)}")
            return []
    
    def get_activity_based_recommendations(self, user_id, activity, top_n=5):
        """
        获取基于活动的推荐
        
        参数:
            user_id: 用户ID
            activity: 活动类型
            top_n: 推荐数量
            
        返回:
            推荐结果
        """
        # 记录活动信息
        self._initialize_user_data(user_id)
        self.user_data[user_id]['activity_data'].append({
            'activity': activity,
            'timestamp': datetime.now().isoformat()
        })
        
        # 获取上下文信息
        context = self._get_current_context(user_id)
        context['activity'] = activity
        
        # 使用活动上下文生成推荐
        try:
            recommendations = self.hybrid_recommender.recommend(user_id, top_n=top_n, context=context)
            # 对推荐结果进行后处理，例如根据活动类型调整顺序
            if activity == 'workout':
                # 对于锻炼，优先推荐节奏感强的歌曲
                pass
            elif activity == 'study':
                # 对于学习，优先推荐平静的歌曲
                pass
            
            return recommendations
        except Exception as e:
            logger.error(f"活动推荐出错: {str(e)}")
            return []
    
    def get_artist_based_recommendations(self, user_id, artist_name, top_n=5):
        """
        获取基于艺术家的推荐
        
        参数:
            user_id: 用户ID
            artist_name: 艺术家名称
            top_n: 推荐数量
            
        返回:
            推荐结果
        """
        # 更新用户的艺术家偏好
        self._initialize_user_data(user_id)
        if 'artists' not in self.user_data[user_id]['preferences']:
            self.user_data[user_id]['preferences']['artists'] = []
        
        # 添加艺术家到用户偏好
        artists = self.user_data[user_id]['preferences']['artists']
        if artist_name not in artists:
            artists.append(artist_name)
        
        # 获取基于艺术家的推荐
        try:
            # 如果可能，使用专用的基于艺术家的推荐方法
            if hasattr(self.hybrid_recommender, 'recommend_by_artist'):
                return self.hybrid_recommender.recommend_by_artist(artist_name, top_n)
            
            # 否则使用一般推荐，带有艺术家上下文
            context = {'artist': artist_name}
            return self.hybrid_recommender.recommend(user_id, top_n=top_n, context=context)
        except Exception as e:
            logger.error(f"艺术家推荐出错: {str(e)}")
            return []
    
    def save_user_data(self, output_dir="user_data"):
        """
        保存用户数据到磁盘
        
        参数:
            output_dir: 输出目录
        
        返回:
            成功标志
        """
        try:
            # 确保目录存在
            if not os.path.exists(output_dir):
                os.makedirs(output_dir)
            
            # 保存每个用户的数据
            for user_id, data in self.user_data.items():
                user_file = os.path.join(output_dir, f"user_{user_id}.json")
                with open(user_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
            
            # 保存用户模型版本信息
            version_file = os.path.join(output_dir, "model_versions.json")
            with open(version_file, 'w', encoding='utf-8') as f:
                json.dump(self.user_model_versions, f, ensure_ascii=False, indent=2)
            
            logger.info(f"用户数据已保存到 {output_dir}")
            return True
        except Exception as e:
            logger.error(f"保存用户数据失败: {str(e)}")
            return False
    
    def load_user_data(self, input_dir="user_data"):
        """
        从磁盘加载用户数据
        
        参数:
            input_dir: 输入目录
            
        返回:
            成功标志
        """
        try:
            # 如果目录不存在，返回
            if not os.path.exists(input_dir):
                logger.info(f"用户数据目录不存在: {input_dir}")
                return False
            
            # 加载所有用户文件
            loaded = False
            for filename in os.listdir(input_dir):
                if filename.startswith("user_") and filename.endswith(".json"):
                    user_id = filename[5:-5]  # 提取用户ID
                    user_file = os.path.join(input_dir, filename)
                    
                    try:
                        with open(user_file, 'r', encoding='utf-8') as f:
                            self.user_data[user_id] = json.load(f)
                        loaded = True
                    except Exception as e:
                        logger.error(f"加载用户数据文件失败 {user_file}: {str(e)}")
            
            # 加载模型版本信息
            version_file = os.path.join(input_dir, "model_versions.json")
            if os.path.exists(version_file):
                try:
                    with open(version_file, 'r', encoding='utf-8') as f:
                        self.user_model_versions = json.load(f)
                except Exception as e:
                    logger.error(f"加载模型版本信息失败: {str(e)}")
            
            if loaded:
                logger.info(f"成功加载用户数据从 {input_dir}")
            else:
                logger.info(f"目录中没有找到用户数据: {input_dir}")
            
            return loaded
        except Exception as e:
            logger.error(f"加载用户数据失败: {str(e)}")
            return False
    
    def _initialize_user_data(self, user_id):
        """初始化用户数据"""
        if user_id not in self.user_data:
            self.user_data[user_id] = {
                'messages': [],
                'ratings': {},
                'preferences': {},
                'mood_data': [],
                'activity_data': [],
                'created_at': datetime.now().isoformat()
            }
    
    def _calculate_user_data_completeness(self, user_id):
        """
        计算用户数据完整度
        
        参数:
            user_id: 用户ID
            
        返回:
            完整度分数 (0.0-1.0)
        """
        if user_id not in self.user_data:
            return 0.0
        
        # 初始得分
        score = 0.0
        max_score = 4.0  # 总分
        
        user_data = self.user_data[user_id]
        
        # 1. 评分数据
        rating_count = len(user_data['ratings'])
        if rating_count > 0:
            # 根据评分数量给分，最高1分
            rating_score = min(1.0, rating_count / 10.0)
            score += rating_score
        
        # 2. 偏好数据
        if user_data['preferences']:
            # 根据不同类型的偏好给分
            pref_score = 0.0
            if 'genres' in user_data['preferences'] and user_data['preferences']['genres']:
                pref_score += 0.5
            if 'moods' in user_data['preferences'] and user_data['preferences']['moods']:
                pref_score += 0.25
            if 'artists' in user_data['preferences'] and user_data['preferences']['artists']:
                pref_score += 0.25
            
            score += min(1.0, pref_score)
        
        # 3. 情感数据
        if user_data['mood_data']:
            # 根据情感记录数量给分
            mood_score = min(1.0, len(user_data['mood_data']) / 5.0)
            score += mood_score
        
        # 4. 交互数据
        message_count = len(user_data['messages'])
        if message_count > 0:
            # 根据消息数量给分
            interaction_score = min(1.0, message_count / 10.0)
            score += interaction_score
        
        # 返回归一化分数
        return score / max_score
    
    def _adjust_algorithm_weights_for_incomplete_data(self, user_id, completeness):
        """
        根据数据完整度调整算法权重
        
        参数:
            user_id: 用户ID
            completeness: 数据完整度得分
        """
        if not hasattr(self.hybrid_recommender, 'set_weights'):
            return
        
        # 基于数据完整度调整权重
        if completeness < 0.2:
            # 数据非常有限，主要使用基于内容的推荐
            weights = {
                'content': 0.6,
                'cf': 0.2,
                'context': 0.1,
                'deep': 0.1
            }
        elif completeness < 0.5:
            # 数据较少，减少协同过滤权重
            weights = {
                'content': 0.4,
                'cf': 0.3,
                'context': 0.2,
                'deep': 0.1
            }
        else:
            # 数据丰富，使用平衡权重
            weights = {
                'content': 0.3,
                'cf': 0.4,
                'context': 0.2,
                'deep': 0.1
            }
        
        # 设置权重
        self.hybrid_recommender.set_weights(weights)
    
    def _extract_preferences_from_message(self, message):
        """从消息中提取用户偏好"""
        preferences = {}
        
        # 解析消息，提取偏好信息
        # 以下是简单示例，实际系统应使用更复杂的NLP技术
        
        # 1. 提取流派偏好
        genre_keywords = {
            'pop': ['流行', '流行音乐', 'pop', '大众'],
            'rock': ['摇滚', '摇滚乐', 'rock'],
            'classical': ['古典', '古典音乐', '交响乐', 'classical'],
            'jazz': ['爵士', '爵士乐', 'jazz'],
            'electronic': ['电子', '电子音乐', 'EDM', 'electronic'],
            'folk': ['民谣', '民歌', 'folk'],
            'hip-hop': ['嘻哈', '说唱', 'hip-hop', 'rap'],
            'r&b': ['R&B', 'rnb', '节奏蓝调']
        }
        
        message_lower = message.lower()
        
        genres = {}
        for genre, keywords in genre_keywords.items():
            for keyword in keywords:
                if keyword.lower() in message_lower:
                    genres[genre] = 1.0
                    break
        
        if genres:
            preferences['genres'] = genres
        
        # 2. 提取情绪偏好
        mood_keywords = {
            'happy': ['开心', '快乐', '欢快', '高兴', 'happy', 'joyful'],
            'sad': ['伤心', '悲伤', '难过', 'sad', 'depressed'],
            'calm': ['平静', '放松', '安静', 'calm', 'relaxed', 'peaceful'],
            'energetic': ['活力', '动感', '兴奋', 'energetic', 'excited']
        }
        
        moods = {}
        for mood, keywords in mood_keywords.items():
            for keyword in keywords:
                if keyword.lower() in message_lower:
                    moods[mood] = 1.0
                    break
        
        if moods:
            preferences['moods'] = moods
        
        # 3. 提取艺术家偏好
        # 需要更复杂的NER来准确提取艺术家名称
        # 简化示例:
        artist_pattern = r'我喜欢(.*?)的歌' # 简单模式
        
        # 4. 提取活动偏好
        activity_keywords = {
            'workout': ['健身', '运动', '跑步', 'workout', 'running'],
            'study': ['学习', '工作', '阅读', 'study', 'working'],
            'relax': ['休息', '睡觉', '放松', 'relax', 'sleeping'],
            'party': ['聚会', '派对', '社交', 'party', 'social']
        }
        
        activities = {}
        for activity, keywords in activity_keywords.items():
            for keyword in keywords:
                if keyword.lower() in message_lower:
                    activities[activity] = 1.0
                    break
        
        if activities:
            preferences['activities'] = activities
        
        return preferences
    
    def _extract_preferences_from_game(self, game_data):
        """从游戏数据中提取用户偏好"""
        preferences = {}
        
        # 根据游戏类型提取不同偏好
        game_type = game_data.get('game_type', '')
        
        if game_type == 'genre_collector' and 'collected_genres' in game_data:
            # 流派收集游戏
            genres = {}
            for genre_info in game_data['collected_genres']:
                genre_id = genre_info.get('id', '')
                count = genre_info.get('count', 1)
                if genre_id:
                    genres[genre_id] = float(count)
            
            if genres:
                preferences['genres'] = genres
        
        elif game_type == 'mood_matcher' and 'matched_moods' in game_data:
            # 情绪匹配游戏
            moods = {}
            for mood_info in game_data['matched_moods']:
                mood_id = mood_info.get('id', '')
                score = mood_info.get('score', 1.0)
                if mood_id:
                    moods[mood_id] = float(score)
            
            if moods:
                preferences['moods'] = moods
        
        elif game_type == 'activity_selection' and 'activity' in game_data:
            preferences['activities'] = {game_data['activity']: game_data.get('relevance', 1.0)}
        
        return preferences
    
    def _extract_preferences_from_questionnaire(self, questionnaire_data):
        """从问卷数据中提取用户偏好"""
        preferences = {}
        
        # 直接映射问卷中的偏好字段
        # 注意，实际问卷结构可能会有所不同
        
        # 流派偏好
        if 'favorite_genres' in questionnaire_data:
            genres = questionnaire_data['favorite_genres']
            if isinstance(genres, list):
                preferences['genres'] = {genre: 1.0 for genre in genres}
            elif isinstance(genres, dict):
                preferences['genres'] = genres
        
        # 情绪偏好
        if 'mood_preferences' in questionnaire_data:
            preferences['moods'] = questionnaire_data['mood_preferences']
        
        # 艺术家偏好
        if 'favorite_artists' in questionnaire_data:
            preferences['artists'] = questionnaire_data['favorite_artists']
        
        # 活动场景偏好
        if 'activity_preferences' in questionnaire_data:
            preferences['activities'] = questionnaire_data['activity_preferences']
        
        return preferences
    
    def _update_user_preferences(self, user_id, new_preferences):
        """更新用户偏好"""
        # 确保用户数据存在
        self._initialize_user_data(user_id)
        
        # 获取当前偏好
        current_prefs = self.user_data[user_id].get('preferences', {})
        
        # 合并各类偏好
        for pref_type, values in new_preferences.items():
            if pref_type not in current_prefs:
                current_prefs[pref_type] = {}
            
            # 根据不同的偏好类型采用不同的合并策略
            if pref_type in ['genres', 'moods', 'activities'] and isinstance(values, dict):
                # 数值型偏好，累加权重
                for key, value in values.items():
                    current_prefs[pref_type][key] = current_prefs[pref_type].get(key, 0) + value
            
            elif pref_type == 'artists' and isinstance(values, list):
                # 列表型偏好，去重合并
                if 'artists' not in current_prefs:
                    current_prefs['artists'] = []
                
                # 合并列表并去重
                artists_set = set(current_prefs['artists']) | set(values)
                current_prefs['artists'] = list(artists_set)
        
        # 保存更新后的偏好
        self.user_data[user_id]['preferences'] = current_prefs
    
    def _get_current_context(self, user_id):
        """获取用户当前上下文"""
        if user_id not in self.user_data:
            return {}
        
        context = {}
        user_data = self.user_data[user_id]
        
        # 添加最近情绪
        if user_data['mood_data']:
            latest_mood = user_data['mood_data'][-1]
            context['mood'] = {
                'primary_emotion': latest_mood['primary_mood'],
                'intensity': latest_mood['intensity']
            }
        
        # 添加最近活动
        if user_data['activity_data']:
            latest_activity = user_data['activity_data'][-1]
            context['activity'] = latest_activity['activity']
        
        # 添加用户偏好
        if 'preferences' in user_data:
            context['preferences'] = user_data['preferences']
        
        # 添加时间上下文
        current_hour = datetime.now().hour
        if 5 <= current_hour < 12:
            context['time_of_day'] = 'morning'
        elif 12 <= current_hour < 18:
            context['time_of_day'] = 'afternoon'
        elif 18 <= current_hour < 22:
            context['time_of_day'] = 'evening'
        else:
            context['time_of_day'] = 'night'
        
        return context
    
    def _generate_response(self, emotion, recommendations):
        """根据情感和推荐生成回复"""
        if emotion == 'happy':
            return f"看起来您心情不错！这里有一些欢快的歌曲推荐给您。"
        elif emotion == 'sad':
            return f"感觉您有点低落，这些歌曲可能会让您感觉好些。"
        elif emotion == 'calm':
            return f"为您的平静时光准备了这些轻松的曲目。"
        else:
            return f"这是一些您可能喜欢的歌曲。"
    
    def _update_user_model(self, user_id, real_time=False):
        """更新用户推荐模型"""
        # 增加版本号
        if user_id in self.user_model_versions:
            self.user_model_versions[user_id] += 1
        else:
            self.user_model_versions[user_id] = 1
        
        # 获取用户完整度
        completeness = self._calculate_user_data_completeness(user_id)
        
        # 根据完整度调整推荐策略
        self._adjust_algorithm_weights_for_incomplete_data(user_id, completeness)
        
        # 如果是实时更新，并且有足够的数据，执行增量学习
        if real_time and completeness > 0.3:
            # 收集用户的评分数据
            ratings = []
            for song_id, rating_info in self.user_data[user_id]['ratings'].items():
                ratings.append((user_id, song_id, rating_info['rating']))
            
            # 增量更新协同过滤模型
            if hasattr(self.hybrid_recommender, 'update_cf_model') and len(ratings) > 0:
                self.hybrid_recommender.update_cf_model(ratings)
            
            # 更新基于内容的模型
            if hasattr(self.hybrid_recommender, 'update_content_model') and self.user_data[user_id]['preferences']:
                self.hybrid_recommender.update_content_model(user_id, self.user_data[user_id]['preferences'])
        
        logger.info(f"用户 {user_id} 模型已更新到版本 {self.user_model_versions[user_id]}")
        return self.user_model_versions[user_id]
    
    def _analyze_emotion_detailed(self, message):
        """
        使用AI服务分析文本的详细情绪状态
        
        参数:
            message: 用户消息
            
        返回:
            详细的情绪分析结果
        """
        try:
            # 初始化AI服务（如果尚未初始化）
            if not hasattr(self, 'ai_service'):
                from backend.utils.ai_service import AIService
                self.ai_service = AIService()
            
            # 调用AI服务分析情绪
            emotion_data = self.ai_service.analyze_emotion(message)
            return emotion_data
            
        except Exception as e:
            logger.error(f"情绪分析失败: {e}")
            return {
                'emotion': 'neutral',
                'intensity': 0.5,
                'description': '无法分析情绪状态',
                'music_suggestion': '流行音乐',
                'secondary_emotion': '',
                'comfort_strategy': '友好交流'
            }
    
    def _generate_comfort_message(self, emotion, intensity, description):
        """
        生成针对用户情绪的安慰消息
        
        参数:
            emotion: 情绪类型
            intensity: 情绪强度
            description: 情绪描述
            
        返回:
            安慰消息
        """
        try:
            # 确保AI服务已初始化
            if not hasattr(self, 'ai_service'):
                from backend.utils.ai_service import AIService
                self.ai_service = AIService()
            
            # 调用AI服务生成安慰消息
            comfort_message = self.ai_service.get_comfort_message(emotion, intensity, description)
            return comfort_message
            
        except Exception as e:
            logger.error(f"生成安慰消息失败: {e}")
            
            # 默认安慰消息
            default_messages = {
                'happy': '看到你这么开心真好！音乐可以让美好的心情持续更久，我为你精选了一些适合现在情绪的歌曲，希望你喜欢~',
                'sad': '我能感受到你的心情有些低落。音乐有时能成为心灵的慰藉，让我为你找一些能够共鸣或治愈的歌曲，愿它们能温暖你的心。',
                'angry': '理解你现在感到烦躁。音乐可以帮助释放和转化情绪，我找了一些特别的歌曲，它们或许能帮你平静下来，或表达出内心的感受。',
                'anxious': '焦虑的感觉确实不好受，就像心里有只小鹿在乱撞。舒缓的旋律能像温柔的手抚平内心的波澜，我为你挑选了一些助你放松的音乐。',
                'excited': '你的热情真是会传染人！这种充满活力的状态值得用同样充满能量的音乐来配合，我为你准备了一些节奏感强的歌曲，一起high起来吧！',
                'neutral': '不管是想放松还是找点新鲜感，音乐总能满足你的需求。我为你精选了一些有质量的歌曲，希望能为你的日常增添一抹色彩。'
            }
            
            return default_messages.get(emotion, '音乐是人类情感的镜子，也是疗愈心灵的良药。让我为你推荐几首歌，希望能与你当下的心情产生共鸣，带给你一些温暖和力量。')
    
    def _get_mood_specific_songs(self, emotion, music_suggestion, count=5):
        """
        获取与特定情绪匹配的歌曲推荐
        
        参数:
            emotion: 情绪类型
            music_suggestion: 推荐的音乐类型  
            count: 推荐数量
            
        返回:
            歌曲推荐列表
        """
        try:
            # 情绪与音乐风格映射表
            emotion_genre_map = {
                'happy': ['Pop', 'Dance', 'Electronic', 'R&B'],
                'sad': ['Classical', 'Jazz', 'Folk', 'Rock'],
                'angry': ['Rock', 'Hip-Hop', 'Electronic', 'Jazz'],
                'anxious': ['Classical', 'Electronic', 'Jazz', 'Folk'],
                'excited': ['Electronic', 'Pop', 'Rock', 'Hip-Hop'],
                'neutral': ['Pop', 'Rock', 'Jazz', 'Electronic'],
                'nostalgic': ['Rock', 'Folk', 'Classical', 'Jazz'],
                'lonely': ['Folk', 'Jazz', 'Classical', 'Rock'],
                'hopeful': ['Pop', 'Rock', 'Classical', 'Folk'],
                'calm': ['Classical', 'Jazz', 'Folk', 'Electronic']
            }
            
            # 获取与情绪相关的音乐风格
            genres = emotion_genre_map.get(emotion, ['Pop', 'Rock', 'Jazz', 'Electronic'])
            
            # 如果有具体的音乐建议，优先使用
            if music_suggestion:
                # 将音乐建议转换为对应的数据库音乐类型
                suggestion_mapping = {
                    '流行': 'Pop', '摇滚': 'Rock', '古典': 'Classical', '爵士': 'Jazz',
                    '电子': 'Electronic', '民谣': 'Folk', '说唱': 'Hip-Hop', '蓝调': 'R&B',
                    '重金属': 'Rock', '朋克': 'Rock', '轻音乐': 'Classical',
                    '纯音乐': 'Classical', '环境音乐': 'Electronic', '舞曲': 'Dance'
                }
                
                for key, value in suggestion_mapping.items():
                    if key in music_suggestion:
                        genres.insert(0, value)  # 将匹配的风格放在首位
            
            # 使用情绪和音乐类型过滤歌曲
            recommendations = []
            for genre in genres:
                songs = self.hybrid_recommender.get_songs_by_genre(genre, limit=count)
                for song in songs:
                    if song not in recommendations:
                        recommendations.append(song)
                        if len(recommendations) >= count:
                            break
                
                if len(recommendations) >= count:
                    break
            
            return recommendations[:count]
                
        except Exception as e:
            logger.error(f"获取情绪匹配歌曲失败: {e}")
            return []
    
    def _analyze_mood_trends(self, user_id):
        """
        分析用户情绪变化趋势
        
        参数:
            user_id: 用户ID
        """
        try:
            # 获取用户情绪历史数据
            mood_data = self.user_data[user_id].get('mood_data', [])
            
            # 如果数据少于2条，无法分析趋势
            if len(mood_data) < 2:
                return
            
            # 提取最近5条情绪数据
            recent_moods = mood_data[-5:]
            
            # 分析情绪强度变化
            intensities = [m['intensity'] for m in recent_moods]
            
            # 保存情绪趋势数据
            self.user_data[user_id]['mood_trends'] = {
                'recent_primary_moods': [m['primary_mood'] for m in recent_moods],
                'intensity_trend': 'increasing' if intensities[-1] > intensities[0] else 'decreasing',
                'average_intensity': sum(intensities) / len(intensities),
                'mood_variety': len(set([m['primary_mood'] for m in recent_moods]))
            }
            
        except Exception as e:
            logger.error(f"分析情绪趋势失败: {e}")
    
    def _add_preview_links_to_recommendations(self, recommendations):
        """
        为推荐的歌曲添加试听链接
        
        参数:
            recommendations: 推荐的歌曲列表
            
        返回:
            添加了试听链接的推荐列表
        """
        try:
            for rec in recommendations:
                # 构建试听链接
                artist = rec.get('artist', '').replace(' ', '+')
                title = rec.get('title', '').replace(' ', '+')
                
                # 添加网易云音乐和Spotify搜索链接
                rec['preview_links'] = {
                    'netease': f"https://music.163.com/#/search/m/?s={title}+{artist}&type=1",
                    'spotify': f"https://open.spotify.com/search/{title}%20{artist}"
                }
                
            return recommendations
                
        except Exception as e:
            logger.error(f"添加试听链接失败: {e}")
            return recommendations
    
    def _get_fallback_recommendations(self, emotion):
        """
        获取备用推荐，当主要推荐方法失败时使用
        
        参数:
            emotion: 情绪类型
            
        返回:
            备用推荐列表
        """
        # 热门歌曲备选（按情绪分类）
        fallback_songs = {
            'happy': [
                {'id': 'happy1', 'title': 'Happy', 'artist': 'Pharrell Williams', 'genre': 'Pop'},
                {'id': 'happy2', 'title': "Can't Stop the Feeling!", 'artist': 'Justin Timberlake', 'genre': 'Pop'},
                {'id': 'happy3', 'title': 'Good as Hell', 'artist': 'Lizzo', 'genre': 'Pop'}
            ],
            'sad': [
                {'id': 'sad1', 'title': 'Someone Like You', 'artist': 'Adele', 'genre': 'Pop'},
                {'id': 'sad2', 'title': 'Fix You', 'artist': 'Coldplay', 'genre': 'Rock'},
                {'id': 'sad3', 'title': 'Skinny Love', 'artist': 'Bon Iver', 'genre': 'Folk'}
            ],
            'angry': [
                {'id': 'angry1', 'title': 'Till I Collapse', 'artist': 'Eminem', 'genre': 'Hip-Hop'},
                {'id': 'angry2', 'title': 'Numb', 'artist': 'Linkin Park', 'genre': 'Rock'},
                {'id': 'angry3', 'title': 'Break Stuff', 'artist': 'Limp Bizkit', 'genre': 'Rock'}
            ],
            'anxious': [
                {'id': 'anxious1', 'title': 'Weightless', 'artist': 'Marconi Union', 'genre': 'Electronic'},
                {'id': 'anxious2', 'title': 'Clair de Lune', 'artist': 'Claude Debussy', 'genre': 'Classical'},
                {'id': 'anxious3', 'title': 'Breathe Me', 'artist': 'Sia', 'genre': 'Pop'}
            ]
        }
        
        # 返回对应情绪的歌曲，或默认返回热门歌曲
        return fallback_songs.get(emotion, fallback_songs['happy'])

# API接口，可集成到Flask应用中
def handle_agent_request(user_id, message):
    """
    处理API请求
    
    参数:
        user_id: 用户ID
        message: 用户消息
        
    返回:
        推荐和回复
    """
    # 初始化代理
    agent = MusicRecommenderAgent()
    
    # 处理消息
    result = agent.process_message(user_id, message)
    return result

if __name__ == "__main__":
    # 测试代码
    agent = MusicRecommenderAgent()
    
    test_messages = [
        "你好，我是新用户",
        "我喜欢周杰伦的歌",
        "能推荐一些歌曲给我吗？",
        "我给《七里香》打4分",
        "我不喜欢摇滚乐",
        "谢谢你的推荐"
    ]
    
    for msg in test_messages:
        print(f"\n用户: {msg}")
        response = agent.process_message("test_user_123", msg)
        print(f"AI: {response}") 