"""
测试 Chat API 接口
使用 OpenAI SDK 兼容的方式调用本地 FastAPI 服务
"""
import sys
import io

# 设置输出编码为 UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from openai import OpenAI

# 创建 OpenAI 客户端，指向本地服务
client = OpenAI(
    api_key="dummy",  # 这里可以填任意值，实际不会使用
    base_url="http://127.0.0.1:8000/v1"
)

print("正在测试 Chat API 接口...")
print("-" * 50)

try:
    # 调用 chat completions
    response = client.chat.completions.create(
        model="gpt-5",
        messages=[
            {"role": "user", "content": "你好，请用中文回答：1+1等于几？"}
        ],
        temperature=0.7,
        max_tokens=100
    )
    
    print(f"模型: {response.model}")
    print(f"回答: {response.choices[0].message.content}")
    print(f"使用 token: {response.usage.total_tokens}")
    print("\n测试成功！")
    
except Exception as e:
    print(f"错误: {e}")
    print("\n请确保:")
    print("1. FastAPI 服务正在运行 (uvicorn main:app --reload)")
    print("2. .env 文件中配置了正确的 AI_BUILDER_API_KEY")
