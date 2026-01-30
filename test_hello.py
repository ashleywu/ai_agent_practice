import requests
import sys
import io

# 设置输出编码为 UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# API 地址
url = "http://127.0.0.1:8000/hello"

# 请求数据
data = {
    "name": "Peiling"
}

print("正在调用 Hello 接口，传入名字: Peiling")
print("-" * 50)

try:
    # 发送 POST 请求
    response = requests.post(url, json=data)
    
    # 打印响应
    print(f"状态码: {response.status_code}")
    print(f"响应内容: {response.json()}")
except requests.exceptions.ConnectionError:
    print("错误: 无法连接到服务器，请确保 FastAPI 服务正在运行")
    print("启动命令: uvicorn main:app --reload")
except Exception as e:
    print(f"发生错误: {e}")
