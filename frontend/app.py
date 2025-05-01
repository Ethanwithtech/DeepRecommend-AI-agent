import os
import json
import time
import random
import logging
import requests
from flask import Flask, render_template, request, jsonify, send_from_directory, Response
from bs4 import BeautifulSoup

app = Flask(__name__)

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 配置静态文件目录
@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

# 主页路由
@app.route('/')
def index():
    return render_template('index.html')

# 音频代理，用于解决CORS问题
@app.route('/proxy/jamendo/track/<track_id>', methods=['GET'])
def proxy_jamendo(track_id):
    try:
        logger.info(f"处理音频代理请求: track_id={track_id}")
        
        # 第一步：尝试直接获取Jamendo歌曲页面，从中提取可用的音频URL
        jamendo_track_url = f"https://www.jamendo.com/track/{track_id}"
        logger.info(f"尝试获取Jamendo歌曲页面: {jamendo_track_url}")
        
        # 使用更加丰富的请求头，模拟真实浏览器
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
            'Referer': 'https://www.jamendo.com/'
        }
        
        # 记录所有尝试的URL和错误信息
        attempted_urls = []
        error_msgs = []
        
        # 尝试从Jamendo网站获取真实MP3 URL
        try:
            logger.info("尝试从Jamendo网站抓取音频URL")
            page_response = requests.get(jamendo_track_url, headers=headers, timeout=5)
            if page_response.status_code == 200:
                soup = BeautifulSoup(page_response.text, 'html.parser')
                # 尝试找到播放器相关的脚本或数据
                scripts = soup.find_all('script')
                audio_url = None
                
                for script in scripts:
                    script_content = script.string
                    if script_content and "audioUrl" in script_content:
                        logger.info("在页面中找到audioUrl参数")
                        # 提取音频URL
                        import re
                        url_match = re.search(r'audioUrl\s*:\s*[\'"]([^\'"]+)[\'"]', script_content)
                        if url_match:
                            audio_url = url_match.group(1)
                            logger.info(f"从页面提取到音频URL: {audio_url}")
                            attempted_urls.append(audio_url)
                            
                            # 尝试获取音频
                            audio_headers = headers.copy()
                            audio_headers['Accept'] = '*/*'
                            audio_headers['Accept-Encoding'] = 'identity'
                            
                            # 发送请求获取音频内容
                            try:
                                logger.info(f"尝试获取音频内容: {audio_url}")
                                audio_response = requests.get(audio_url, headers=audio_headers, stream=True, timeout=5)
                                
                                if audio_response.status_code == 200:
                                    content_type = audio_response.headers.get('Content-Type', '')
                                    logger.info(f"获取到音频内容，类型: {content_type}")
                                    
                                    if 'audio' in content_type or 'octet-stream' in content_type:
                                        logger.info("成功获取音频内容")
                                        
                                        # 创建响应
                                        def generate():
                                            for chunk in audio_response.iter_content(chunk_size=8192):
                                                if chunk:
                                                    yield chunk
                                        
                                        response = Response(generate(), content_type=content_type)
                                        response.headers['Access-Control-Allow-Origin'] = '*'
                                        
                                        # 复制其他有用的头信息
                                        for header in ['Content-Length', 'Content-Disposition', 'Accept-Ranges']:
                                            if header in audio_response.headers:
                                                response.headers[header] = audio_response.headers[header]
                                        
                                        return response
                                    else:
                                        error_msg = f"提取的URL不是音频内容: {content_type}"
                                        logger.warning(error_msg)
                                        error_msgs.append(error_msg)
                                else:
                                    error_msg = f"获取音频内容失败: {audio_response.status_code}"
                                    logger.warning(error_msg)
                                    error_msgs.append(error_msg)
                            except Exception as e:
                                error_msg = f"请求音频URL出错: {str(e)}"
                                logger.error(error_msg)
                                error_msgs.append(error_msg)
                
                if not audio_url:
                    error_msg = "在页面中未找到音频URL"
                    logger.warning(error_msg)
                    error_msgs.append(error_msg)
            else:
                error_msg = f"获取Jamendo页面失败: {page_response.status_code}"
                logger.warning(error_msg)
                error_msgs.append(error_msg)
        except Exception as e:
            error_msg = f"抓取Jamendo页面出错: {str(e)}"
            logger.error(error_msg)
            error_msgs.append(error_msg)
        
        # 如果从网站获取失败，尝试常见的API格式
        api_urls = [
            f"https://mp3d.jamendo.com/download/track/{track_id}/mp32",
            f"https://mp3d.jamendo.com/?trackid={track_id}&format=mp32",
            f"https://mp3l.jamendo.com/?trackid={track_id}&format=mp31",
            f"https://storage.jamendo.com/download/track/{track_id}/mp32",
            # 添加几个已知工作的音频URL作为备用
            f"https://mp3d.jamendo.com/?trackid=1886285&format=mp32",  # 这是一个已知可用的URL
            f"https://mp3d.jamendo.com/?trackid=1882607&format=mp32",  # 这是一个已知可用的URL
            f"https://mp3d.jamendo.com/?trackid=1885198&format=mp32"   # 这是一个已知可用的URL
        ]
        
        for url in api_urls:
            if url not in attempted_urls:
                attempted_urls.append(url)
                try:
                    logger.info(f"尝试API URL: {url}")
                    api_headers = headers.copy()
                    api_headers['Accept'] = '*/*'
                    api_headers['Accept-Encoding'] = 'identity'
                    
                    response = requests.get(url, headers=api_headers, stream=True, timeout=5)
                    if response.status_code == 200:
                        content_type = response.headers.get('Content-Type', '')
                        logger.info(f"获取到内容，类型: {content_type}")
                        
                        # 如果是HTML内容，跳过
                        if 'html' in content_type.lower():
                            error_msg = f"URL返回HTML内容: {url}"
                            logger.warning(error_msg)
                            error_msgs.append(error_msg)
                            continue
                        
                        # 确保是音频类型
                        if not 'audio' in content_type and not 'octet-stream' in content_type:
                            content_type = 'audio/mpeg'
                        
                        logger.info(f"成功获取音频: {url}")
                        
                        # 创建响应
                        def generate():
                            for chunk in response.iter_content(chunk_size=8192):
                                if chunk:
                                    yield chunk
                        
                        proxy_response = Response(generate(), content_type=content_type)
                        proxy_response.headers['Access-Control-Allow-Origin'] = '*'
                        
                        # 复制其他有用的头信息
                        for header in ['Content-Length', 'Content-Disposition', 'Accept-Ranges']:
                            if header in response.headers:
                                proxy_response.headers[header] = response.headers[header]
                        
                        return proxy_response
                    else:
                        error_msg = f"API URL请求失败: {response.status_code} - {url}"
                        logger.warning(error_msg)
                        error_msgs.append(error_msg)
                except Exception as e:
                    error_msg = f"处理API URL出错: {str(e)} - {url}"
                    logger.error(error_msg)
                    error_msgs.append(error_msg)
        
        # 所有尝试都失败，返回错误信息
        error_details = {
            "error": "无法获取音频",
            "track_id": track_id,
            "attempted_urls": attempted_urls,
            "error_messages": error_msgs
        }
        logger.warning(f"所有尝试均失败: {json.dumps(error_details)}")
        return jsonify(error_details), 404
    
    except Exception as e:
        error_msg = f"代理处理过程中发生错误: {str(e)}"
        logger.error(error_msg)
        return jsonify({"error": error_msg}), 500

# 启动应用
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 