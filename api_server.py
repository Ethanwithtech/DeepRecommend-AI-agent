#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
API服务器，用于处理前端请求并提供音乐推荐
"""

import os
import sys
import json
import logging
import time
from flask import Flask, request, jsonify, render_template, send_from_directory

# 添加当前目录到路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 引入推荐系统及相关类
# 从backend导入推荐引擎
from backend.models.recommendation_engine import MusicRecommender
from backend.models.hybrid_music_recommender import HybridMusicRecommender
from backend.models.user_vector_manager import UserVectorManager

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('RecommenderAPI')

# 创建Flask应用，配置静态资源和模板路径
app = Flask(__name__, 
            static_folder='frontend/static',
            template_folder='frontend/templates')

# 允许跨域请求的配置（开发环境中有用）
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# 全局推荐器实例
recommender = None
# 用户向量管理器
user_vector_manager = None

def load_recommender():
    """加载推荐模型"""
    global recommender, user_vector_manager
    
    # 初始化用户向量管理器
    try:
        user_vector_manager = UserVectorManager()
        logger.info("成功初始化用户向量管理器")
    except Exception as e:
        logger.error(f"初始化用户向量管理器失败: {str(e)}")
    
    model_path = 'models/trained/hybrid_recommender_10k.pkl'
    
    if not os.path.exists(model_path):
        logger.error(f"模型文件不存在: {model_path}")
        return False
    
    try:
        # 使用HybridMusicRecommender直接加载模型
        recommender = HybridMusicRecommender()
        success = recommender.load_model(model_path)
        if success:
            logger.info(f"成功加载模型: {model_path}")
            return True
        else:
            logger.error(f"加载模型失败: {model_path}")
            return False
    except Exception as e:
        logger.error(f"加载模型出错: {str(e)}")
        logger.error("尝试创建新的推荐器实例...")
        
        # 如果加载失败，创建一个新的实例
        try:
            # 尝试使用简化的推荐器
            recommender = MusicRecommender()
            logger.info("创建了新的推荐器实例")
            return True
        except Exception as e2:
            logger.error(f"创建推荐器实例失败: {str(e2)}")
            return False

# 前端路由
@app.route('/', methods=['GET'])
def index():
    """渲染首页"""
    return render_template('index.html')

@app.route('/static/<path:path>')
def serve_static(path):
    """提供静态文件"""
    return send_from_directory('frontend/static', path)

# API路由
@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'status': 'ok',
        'model_loaded': recommender is not None,
        'user_vector_manager': user_vector_manager is not None
    })

@app.route('/api/user_vector', methods=['POST'])
def update_user_vector():
    """处理用户向量数据"""
    if not user_vector_manager:
        return jsonify({
            'status': 'error',
            'message': '用户向量管理器未初始化'
        }), 500
    
    try:
        data = request.get_json()
        
        # 验证请求数据
        if not data or 'user_id' not in data or 'vector' not in data:
            return jsonify({
                'status': 'error',
                'message': '请求格式错误，需要user_id和vector字段'
            }), 400
        
        user_id = data['user_id']
        vector_data = data['vector']
        
        # 保存用户向量
        success = user_vector_manager.save_user_vector(user_id, vector_data)
        
        if success:
            # 如果推荐引擎可用，尝试更新模型中的用户向量
            if recommender:
                try:
                    if hasattr(recommender, 'process_user_vector'):
                        recommender.process_user_vector(user_id, vector_data)
                    elif hasattr(recommender, 'update_user_preference'):
                        recommender.update_user_preference(user_id, vector_data)
                except Exception as e:
                    logger.warning(f"更新推荐模型中的用户向量失败: {str(e)}")
            
            return jsonify({
                'status': 'success',
                'message': f'成功保存用户 {user_id} 的向量数据',
                'timestamp': data.get('timestamp')
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f'保存用户向量失败'
            }), 500
    
    except Exception as e:
        logger.error(f"处理用户向量出错: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'处理用户向量时出现错误: {str(e)}'
        }), 500

@app.route('/api/play_behavior', methods=['POST'])
def update_play_behavior():
    """处理用户播放行为数据"""
    if not user_vector_manager:
        return jsonify({
            'status': 'error',
            'message': '用户向量管理器未初始化'
        }), 500
    
    try:
        data = request.get_json()
        
        # 验证请求数据
        if not data or 'user_id' not in data or 'behaviors' not in data:
            return jsonify({
                'status': 'error',
                'message': '请求格式错误，需要user_id和behaviors字段'
            }), 400
        
        user_id = data['user_id']
        behaviors = data['behaviors']
        
        # 保存播放行为
        success = user_vector_manager.save_play_behavior(user_id, behaviors)
        
        if success:
            return jsonify({
                'status': 'success',
                'message': f'成功保存用户 {user_id} 的播放行为数据',
                'timestamp': data.get('timestamp')
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f'保存播放行为失败'
            }), 500
    
    except Exception as e:
        logger.error(f"处理播放行为出错: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'处理播放行为时出现错误: {str(e)}'
        }), 500

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations_from_user_vector():
    """根据用户向量获取推荐"""
    if not recommender:
        return jsonify({
            'status': 'error',
            'message': '推荐模型未加载'
        }), 500
    
    try:
        data = request.get_json()
        
        # 验证请求数据
        if not data or 'user_id' not in data:
            return jsonify({
                'status': 'error',
                'message': '请求格式错误，需要user_id字段'
            }), 400
        
        user_id = data['user_id']
        top_n = data.get('top_n', 10)
        context = data.get('context')
        
        # 首先从向量管理器中获取用户向量
        user_vector = None
        if user_vector_manager:
            try:
                user_vector_data = user_vector_manager.get_user_vector(user_id)
                if user_vector_data:
                    user_vector = {
                        'artists': user_vector_data.get('artists', {}),
                        'genres': user_vector_data.get('genres', {}),
                        'features': user_vector_data.get('features', {})
                    }
            except Exception as e:
                logger.warning(f"获取用户向量失败: {str(e)}")
        
        # 如果请求中直接提供了向量数据，使用请求中的数据
        if 'vector' in data:
            user_vector = data['vector']
        
        # 生成推荐
        try:
            if user_vector:
                # 使用用户向量生成推荐
                recommendations = recommender.recommend(
                    user_id, 
                    context=context, 
                    top_n=top_n,
                    user_vector=user_vector
                )
            else:
                # 使用用户ID生成推荐
                recommendations = recommender.recommend(
                    user_id, 
                    context=context, 
                    top_n=top_n
                )
        except Exception as e:
            logger.error(f"生成推荐出错: {str(e)}")
            
            # 如果生成失败，返回模拟数据
            mock_recommendations = [
                {
                    'song_id': f'song{i}',
                    'title': f'模拟歌曲 {i}',
                    'artist': '未知艺术家',
                    'score': 1.0 - (i * 0.1),
                    'source': 'algorithm'
                }
                for i in range(1, top_n + 1)
            ]
            
            return jsonify({
                'status': 'partial',
                'message': '生成推荐失败，返回模拟数据',
                'user_id': user_id,
                'recommendations': mock_recommendations
            })
        
        # 格式化推荐结果
        formatted_recs = []
        for rec in recommendations:
            # 处理不同格式的推荐结果
            if isinstance(rec, tuple):
                song_id, score = rec
                formatted_recs.append({
                    'song_id': song_id,
                    'title': '未知歌曲',
                    'artist': '未知艺术家',
                    'score': score,
                    'source': 'algorithm',
                    'explanation': '基于您的听歌偏好'
                })
            elif isinstance(rec, dict):
                formatted_recs.append({
                    'song_id': rec.get('song_id', ''),
                    'title': rec.get('title', rec.get('track_name', '未知歌曲')),
                    'artist': rec.get('artist_name', rec.get('artist', '未知艺术家')),
                    'score': rec.get('score', 0),
                    'source': rec.get('source', 'algorithm'),
                    'explanation': rec.get('explanation', '基于您的听歌偏好'),
                    'genre': rec.get('genre', '')
                })
        
        return jsonify({
            'status': 'success',
            'user_id': user_id,
            'context': context,
            'recommendations': formatted_recs
        })
    
    except Exception as e:
        logger.error(f"生成推荐出错: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'生成推荐时出现错误: {str(e)}'
        }), 500

# 添加获取用户向量信息的接口
@app.route('/api/user_vector/<user_id>', methods=['GET'])
def get_user_vector(user_id):
    """获取用户向量数据"""
    if not user_vector_manager:
        return jsonify({
            'status': 'error',
            'message': '用户向量管理器未初始化'
        }), 500
    
    try:
        # 获取用户向量
        user_vector = user_vector_manager.get_user_vector(user_id)
        
        if user_vector:
            return jsonify({
                'status': 'success',
                'user_id': user_id,
                'vector': {
                    'artists': user_vector.get('artists', {}),
                    'genres': user_vector.get('genres', {}),
                    'features': user_vector.get('features', {})
                },
                'timestamp': user_vector.get('timestamp')
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f'未找到用户 {user_id} 的向量数据'
            }), 404
    
    except Exception as e:
        logger.error(f"获取用户向量出错: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'获取用户向量时出现错误: {str(e)}'
        }), 500

def main():
    """主函数"""
    # 加载推荐模型
    if load_recommender():
        logger.info("推荐模型加载成功，API服务器准备就绪")
    else:
        logger.warning("推荐模型加载失败，API服务器将使用有限功能")
    
    # 启动Flask应用
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

if __name__ == "__main__":
    main() 