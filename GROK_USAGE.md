# 使用 Grok-4-Fast 获取笑话

我已经为你添加了一个新的 API 端点，可以使用 grok-4-fast 模型来获取笑话。

## 方法 1: 通过 FastAPI 端点调用

### 启动服务器
```bash
uvicorn main:app --reload
```

### 调用端点
访问以下 URL 获取笑话：
```
GET http://localhost:8000/api/joke
```

或者使用 curl:
```bash
curl http://localhost:8000/api/joke
```

### 响应示例
```json
{
  "joke": "笑话内容...",
  "model": "grok-4-fast",
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 150,
    "total_tokens": 170
  }
}
```

## 方法 2: 直接调用 AI Builder API

你也可以使用 `test_grok_joke.py` 脚本直接调用 API（需要网络连接正常）：

```bash
python test_grok_joke.py
```

## 方法 3: 使用 OpenAI SDK 格式调用

如果你想使用 OpenAI 兼容的格式，可以调用 `/v1/chat/completions` 端点：

```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-4-fast",
    "messages": [
      {
        "role": "user",
        "content": "请给我讲一个有趣的笑话，用中文回答。"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 500
  }'
```

## 注意事项

1. 确保 `.env` 文件中已正确配置 `AI_BUILDER_API_KEY`
2. grok-4-fast 是一个 passthrough 模型，直接路由到 X.AI 的 Grok API
3. 如果遇到网络连接问题，请检查你的网络设置和代理配置
