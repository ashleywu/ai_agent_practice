"""
测试 /chat 端点
演示如何使用 /chat 端点（直接 HTTP 调用和 OpenAI SDK 兼容方式）
"""
import sys
import io

# 设置输出编码为 UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import httpx
from openai import OpenAI

print("=" * 60)
print("测试 /chat 端点")
print("=" * 60)

# 方法 1: 直接使用 httpx 调用 /chat 端点
print("\n方法 1: 直接 HTTP 调用 /chat 端点")
print("-" * 60)

try:
    with httpx.Client(timeout=60.0) as client:
        response = client.post(
            "http://127.0.0.1:8000/chat",
            json={
                "model": "gpt-5",
                "messages": [
                    {"role": "user", "content": "你好，请用中文回答：1+1等于几？"}
                ],
                "temperature": 0.7,
                "max_tokens": 100
            },
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        result = response.json()
        
        print(f"模型: {result.get('model', 'N/A')}")
        print(f"回答: {result['choices'][0]['message']['content']}")
        print(f"使用 token: {result['usage']['total_tokens']}")
        print("\n✓ 方法 1 测试成功！")
        
except Exception as e:
    print(f"✗ 错误: {e}")
    print("\n请确保:")
    print("1. FastAPI 服务正在运行 (uvicorn main:app --reload)")
    print("2. .env 文件中配置了正确的 AI_BUILDER_API_KEY")

# 方法 2: 使用 OpenAI SDK（需要自定义路径）
print("\n\n方法 2: 使用 OpenAI SDK 调用 /v1/chat/completions")
print("-" * 60)
print("注意: OpenAI SDK 默认调用 /v1/chat/completions，")
print("      如果要使用 /chat 端点，需要使用 httpx 直接调用")

try:
    # OpenAI SDK 默认调用 /v1/chat/completions
    client = OpenAI(
        api_key="dummy",
        base_url="http://127.0.0.1:8000/v1"  # 这会调用 /v1/chat/completions
    )
    
    response = client.chat.completions.create(
        model="gpt-5",
        messages=[
            {"role": "user", "content": "你好，请用中文回答：2+2等于几？"}
        ],
        temperature=0.7,
        max_tokens=100
    )
    
    print(f"模型: {response.model}")
    print(f"回答: {response.choices[0].message.content}")
    print(f"使用 token: {response.usage.total_tokens}")
    print("\n✓ 方法 2 测试成功！")
    
except Exception as e:
    print(f"✗ 错误: {e}")

print("\n" + "=" * 60)
print("测试完成！")
print("=" * 60)
