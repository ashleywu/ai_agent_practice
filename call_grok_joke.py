"""
直接调用 AI Builder API 使用 grok-4-fast 获取笑话（禁用代理）
"""
import os
import sys
import json
import httpx
import asyncio
from dotenv import load_dotenv

# 设置 UTF-8 编码以支持中文输出
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# 加载环境变量
load_dotenv()

# 从环境变量读取配置
AI_BUILDER_API_KEY = os.getenv("AI_BUILDER_API_KEY")
AI_BUILDER_BASE_URL = os.getenv("AI_BUILDER_BASE_URL", "https://space.ai-builders.com/backend")

if not AI_BUILDER_API_KEY:
    raise ValueError("AI_BUILDER_API_KEY 未在环境变量中设置，请检查 .env 文件")

async def get_joke_from_grok():
    """使用 grok-4-fast 模型获取一个笑话"""
    url = f"{AI_BUILDER_BASE_URL}/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {AI_BUILDER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # 构建请求数据
    request_data = {
        "model": "grok-4-fast",
        "messages": [
            {
                "role": "user",
                "content": "请给我讲一个有趣的笑话，用中文回答。"
            }
        ],
        "temperature": 0.7,
        "max_tokens": 500
    }
    
    print("=" * 60)
    print("正在通过 AI Builders API 调用 grok-4-fast 模型...")
    print(f"API URL: {url}")
    print("=" * 60)
    
    # 清除环境变量中的代理设置
    proxy_env_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY', 'all_proxy']
    saved_proxies = {}
    for var in proxy_env_vars:
        if var in os.environ:
            saved_proxies[var] = os.environ[var]
            del os.environ[var]
    
    try:
        # 创建 httpx 客户端
        async with httpx.AsyncClient(
            timeout=60.0,
            verify=True
        ) as client:
            response = await client.post(url, json=request_data, headers=headers)
            response.raise_for_status()
            result = response.json()
            
            # 提取回复内容
            choice = result.get("choices", [{}])[0]
            message = choice.get("message", {})
            content = message.get("content", "")
            
            print("\n🤖 Grok4Fast 讲的笑话:")
            print("-" * 60)
            print(content)
            print("-" * 60)
            
            # 显示使用统计
            usage = result.get("usage", {})
            if usage:
                print(f"\n📊 Token 使用情况:")
                print(f"  - Prompt tokens: {usage.get('prompt_tokens', 0)}")
                print(f"  - Completion tokens: {usage.get('completion_tokens', 0)}")
                print(f"  - Total tokens: {usage.get('total_tokens', 0)}")
            
            return result
    except httpx.HTTPStatusError as e:
        print(f"\n❌ HTTP 错误: {e.response.status_code}")
        print(f"响应内容: {e.response.text}")
        raise
    except Exception as e:
        print(f"\n❌ 错误: {str(e)}")
        raise
    finally:
        # 恢复代理设置
        for var, value in saved_proxies.items():
            os.environ[var] = value

if __name__ == "__main__":
    asyncio.run(get_joke_from_grok())
