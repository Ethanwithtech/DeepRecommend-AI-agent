#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
用户向量管理模块

提供用户向量和播放行为的存储和检索功能
"""

import sqlite3
import json
import datetime
import os
import logging
from pathlib import Path

# 配置日志
logger = logging.getLogger(__name__)

class UserVectorManager:
    """用户向量管理类，提供用户向量和播放行为的存储和检索功能"""
    
    def __init__(self, db_path=None):
        """
        初始化用户向量管理器
        
        参数:
            db_path: 数据库文件路径，默认为项目根目录下的music_recommender.db
        """
        if db_path is None:
            # 使用相对路径或者绝对路径
            current_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
            db_path = os.path.join(project_root, 'music_recommender.db')
        
        self.db_path = db_path
        logger.info(f"初始化用户向量管理器，数据库路径: {db_path}")
        
        # 确保数据库表存在
        self._ensure_tables()
    
    def _ensure_tables(self):
        """确保用户向量相关的数据库表存在"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 创建用户向量表
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_vectors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                artists TEXT,  -- JSON 格式存储
                genres TEXT,   -- JSON 格式存储
                features TEXT, -- JSON 格式存储
                timestamp TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
            ''')
            
            # 创建播放行为表
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS play_behaviors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                song_id TEXT NOT NULL,
                title TEXT,
                artist TEXT,
                play_count INTEGER DEFAULT 0,
                skip_count INTEGER DEFAULT 0,
                avg_duration REAL DEFAULT 0,
                completion_count INTEGER DEFAULT 0,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("用户向量和播放行为数据库表初始化完成")
        except Exception as e:
            logger.error(f"初始化用户向量表时出错: {e}")
    
    def save_user_vector(self, user_id, vector_data):
        """
        保存用户向量数据
        
        参数:
            user_id: 用户ID
            vector_data: 向量数据字典，包含artists, genres, features
            
        返回:
            成功返回True，失败返回False
        """
        try:
            # 验证vector_data格式
            if not isinstance(vector_data, dict):
                logger.error(f"保存用户向量格式错误: {type(vector_data)}")
                return False
            
            # 提取向量组件
            artists = vector_data.get('artists', {})
            genres = vector_data.get('genres', {})
            features = vector_data.get('features', {})
            
            # 序列化为JSON字符串
            artists_json = json.dumps(artists)
            genres_json = json.dumps(genres)
            features_json = json.dumps(features)
            
            # 时间戳
            timestamp = datetime.datetime.now().isoformat()
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 插入或更新用户向量
            cursor.execute('''
            INSERT INTO user_vectors (user_id, artists, genres, features, timestamp)
            VALUES (?, ?, ?, ?, ?)
            ''', (user_id, artists_json, genres_json, features_json, timestamp))
            
            conn.commit()
            conn.close()
            
            logger.info(f"成功保存用户向量: {user_id}")
            return True
        except Exception as e:
            logger.error(f"保存用户向量时出错: {e}")
            return False
    
    def get_user_vector(self, user_id):
        """
        获取用户最新的向量数据
        
        参数:
            user_id: 用户ID
            
        返回:
            用户向量字典，失败返回None
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 查询最新的用户向量
            cursor.execute('''
            SELECT artists, genres, features, timestamp 
            FROM user_vectors 
            WHERE user_id = ? 
            ORDER BY timestamp DESC 
            LIMIT 1
            ''', (user_id,))
            
            result = cursor.fetchone()
            conn.close()
            
            if not result:
                logger.warning(f"用户向量不存在: {user_id}")
                return None
            
            # 解析JSON数据
            artists = json.loads(result[0]) if result[0] else {}
            genres = json.loads(result[1]) if result[1] else {}
            features = json.loads(result[2]) if result[2] else {}
            
            # 构建返回结果
            return {
                'user_id': user_id,
                'artists': artists,
                'genres': genres,
                'features': features,
                'timestamp': result[3]
            }
        except Exception as e:
            logger.error(f"获取用户向量时出错: {e}")
            return None
    
    def save_play_behavior(self, user_id, behaviors):
        """
        保存用户的播放行为数据
        
        参数:
            user_id: 用户ID
            behaviors: 播放行为列表，每个元素为字典，包含song_id, title, artist等信息
            
        返回:
            成功返回True，失败返回False
        """
        try:
            if not isinstance(behaviors, list):
                logger.error(f"播放行为数据格式错误，应为列表: {type(behaviors)}")
                return False
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 当前时间戳
            timestamp = datetime.datetime.now().isoformat()
            
            # 批量插入播放行为
            for behavior in behaviors:
                song_id = behavior.get('song_id')
                if not song_id:
                    continue
                
                # 检查是否已存在该用户对该歌曲的行为记录
                cursor.execute('''
                SELECT id, play_count, skip_count, avg_duration, completion_count 
                FROM play_behaviors 
                WHERE user_id = ? AND song_id = ?
                ''', (user_id, song_id))
                
                existing = cursor.fetchone()
                
                if existing:
                    # 更新现有记录
                    existing_id = existing[0]
                    new_play_count = existing[1] + behavior.get('play_count', 0)
                    new_skip_count = existing[2] + behavior.get('skip_count', 0)
                    
                    # 计算新的平均时长
                    old_avg = existing[3]
                    old_count = existing[1]
                    new_avg = behavior.get('avg_duration', 0)
                    new_count = behavior.get('play_count', 0)
                    
                    if old_count + new_count > 0:
                        avg_duration = (old_avg * old_count + new_avg * new_count) / (old_count + new_count)
                    else:
                        avg_duration = old_avg
                    
                    new_completion_count = existing[4] + behavior.get('completion_count', 0)
                    
                    cursor.execute('''
                    UPDATE play_behaviors
                    SET play_count = ?, skip_count = ?, avg_duration = ?, completion_count = ?, timestamp = ?
                    WHERE id = ?
                    ''', (new_play_count, new_skip_count, avg_duration, new_completion_count, timestamp, existing_id))
                
                else:
                    # 插入新记录
                    cursor.execute('''
                    INSERT INTO play_behaviors 
                    (user_id, song_id, title, artist, play_count, skip_count, avg_duration, completion_count, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        user_id, 
                        song_id, 
                        behavior.get('title', '未知歌曲'),
                        behavior.get('artist', '未知艺术家'),
                        behavior.get('play_count', 0),
                        behavior.get('skip_count', 0),
                        behavior.get('avg_duration', 0),
                        behavior.get('completion_count', 0),
                        timestamp
                    ))
            
            conn.commit()
            conn.close()
            
            logger.info(f"成功保存用户播放行为: {user_id}, {len(behaviors)}条记录")
            return True
        except Exception as e:
            logger.error(f"保存用户播放行为时出错: {e}")
            return False
    
    def get_user_play_behaviors(self, user_id, limit=50):
        """
        获取用户的播放行为数据
        
        参数:
            user_id: 用户ID
            limit: 返回的最大记录数
            
        返回:
            播放行为记录列表，失败返回空列表
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 查询用户的播放行为
            cursor.execute('''
            SELECT song_id, title, artist, play_count, skip_count, avg_duration, completion_count, timestamp
            FROM play_behaviors
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
            ''', (user_id, limit))
            
            results = cursor.fetchall()
            conn.close()
            
            # 构建返回结果
            behaviors = []
            for row in results:
                behaviors.append({
                    'song_id': row[0],
                    'title': row[1],
                    'artist': row[2],
                    'play_count': row[3],
                    'skip_count': row[4],
                    'avg_duration': row[5],
                    'completion_count': row[6],
                    'timestamp': row[7]
                })
            
            return behaviors
        except Exception as e:
            logger.error(f"获取用户播放行为时出错: {e}")
            return []

# 使用示例
if __name__ == "__main__":
    # 配置日志
    logging.basicConfig(level=logging.INFO)
    
    # 创建用户向量管理器
    vector_manager = UserVectorManager()
    
    # 测试数据
    test_user_id = "test_user_1"
    test_vector = {
        "artists": {
            "周杰伦": 0.8,
            "林俊杰": 0.7,
            "Taylor Swift": 0.6
        },
        "genres": {
            "华语流行": 0.85,
            "R&B": 0.75,
            "流行": 0.65
        },
        "features": {
            "upbeat": 0.7,
            "acoustic": 0.6,
            "energetic": 0.8
        }
    }
    
    # 保存用户向量
    success = vector_manager.save_user_vector(test_user_id, test_vector)
    print(f"保存用户向量: {'成功' if success else '失败'}")
    
    # 获取用户向量
    retrieved_vector = vector_manager.get_user_vector(test_user_id)
    print(f"获取用户向量: {retrieved_vector}")
    
    # 测试播放行为数据
    test_behaviors = [
        {
            "song_id": "song123",
            "title": "晴天",
            "artist": "周杰伦",
            "play_count": 3,
            "skip_count": 0,
            "avg_duration": 180.5,
            "completion_count": 2
        },
        {
            "song_id": "song456",
            "title": "Blank Space",
            "artist": "Taylor Swift",
            "play_count": 1,
            "skip_count": 1,
            "avg_duration": 45.2,
            "completion_count": 0
        }
    ]
    
    # 保存播放行为
    success = vector_manager.save_play_behavior(test_user_id, test_behaviors)
    print(f"保存播放行为: {'成功' if success else '失败'}")
    
    # 获取播放行为
    behaviors = vector_manager.get_user_play_behaviors(test_user_id)
    print(f"获取播放行为: 共{len(behaviors)}条记录") 