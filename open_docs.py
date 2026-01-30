import webbrowser
import sys

# 使用系统默认浏览器打开 Swagger UI
url = "http://127.0.0.1:8000/docs"
print(f"正在在默认浏览器中打开: {url}")
webbrowser.open(url)
