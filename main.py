import os
import json
import logging
import asyncio
from typing import Optional, Dict, Any, List, Union
from fastapi import FastAPI, HTTPException, Header, Body, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator
from dotenv import load_dotenv
import httpx
import markdown

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# 加载环境变量
load_dotenv()

# 从环境变量读取配置
AI_BUILDER_API_KEY = os.getenv("AI_BUILDER_API_KEY")
AI_BUILDER_BASE_URL = os.getenv("AI_BUILDER_BASE_URL", "https://space.ai-builders.com/backend")

if not AI_BUILDER_API_KEY:
    raise ValueError("AI_BUILDER_API_KEY 未在环境变量中设置，请检查 .env 文件")

app = FastAPI(
    title="Hello API",
    description="一个简单的 FastAPI 示例应用，提供 hello 问候接口和 OpenAI 兼容的 Chat API",
    version="1.0.0"
)


class NameRequest(BaseModel):
    """请求模型：用于接收用户输入的名字"""
    name: str = Field(
        ...,
        description="用户的名字",
        example="张三",
        min_length=1,
        max_length=50
    )

    class Config:
        json_schema_extra = {
            "example": {
                "name": "李四"
            }
        }


class HelloResponse(BaseModel):
    """响应模型：返回问候消息"""
    message: str = Field(
        ...,
        description="问候消息",
        example="hello, 张三"
    )


class SearchRequest(BaseModel):
    """搜索请求模型"""
    keywords: Union[str, List[str]] = Field(
        ...,
        description="搜索关键词，可以是单个字符串或字符串列表",
        example="Python FastAPI"
    )
    max_results: Optional[int] = Field(
        default=6,
        description="每个关键词返回的最大结果数",
        ge=1,
        le=20,
        example=6
    )

    @field_validator('keywords')
    @classmethod
    def normalize_keywords(cls, v):
        """将单个字符串转换为列表，确保始终返回列表格式"""
        if isinstance(v, str):
            return [v]
        if isinstance(v, list):
            if len(v) == 0:
                raise ValueError("关键词列表不能为空")
            return v
        raise ValueError("keywords 必须是字符串或字符串列表")

    class Config:
        json_schema_extra = {
            "example": {
                "keywords": "Python FastAPI",
                "max_results": 6
            }
        }


class ChatMessage(BaseModel):
    """聊天消息模型"""
    role: str = Field(..., description="消息角色: user 或 assistant")
    content: str = Field(..., description="消息内容")


class ChatRequest(BaseModel):
    """聊天请求模型"""
    messages: List[ChatMessage] = Field(..., description="消息列表", min_items=1)


# 搜索工具定义
SEARCH_TOOL = {
    "type": "function",
    "function": {
        "name": "search",
        "description": "使用 Tavily 搜索引擎搜索网络信息。当用户的问题需要最新的信息、事实、数据或需要搜索网络内容时，应该使用此工具。",
        "parameters": {
            "type": "object",
            "properties": {
                "keywords": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "搜索关键词列表，至少包含一个关键词"
                },
                "max_results": {
                    "type": "integer",
                    "description": "每个关键词返回的最大结果数",
                    "default": 6,
                    "minimum": 1,
                    "maximum": 20
                }
            },
            "required": ["keywords"]
        }
    }
}


async def execute_search(keywords: List[str], max_results: int = 6) -> Dict[str, Any]:
    """执行搜索的内部函数"""
    try:
        request_data = {
            "keywords": keywords,
            "max_results": max_results
        }
        
        url = f"{AI_BUILDER_BASE_URL}/v1/search/"
        headers = {
            "Authorization": f"Bearer {AI_BUILDER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        logger.debug(f"    发送搜索请求到: {url}")
        logger.debug(f"    请求数据: {json.dumps(request_data, ensure_ascii=False)}")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=request_data, headers=headers)
            response.raise_for_status()
            result = response.json()
            logger.debug(f"    搜索请求成功，状态码: {response.status_code}")
            return result
    except Exception as e:
        logger.error(f"    搜索失败: {str(e)}")
        return {"error": f"搜索失败: {str(e)}"}


async def call_ai_builder_api(messages: List[Dict[str, Any]], tools: Optional[List[Dict[str, Any]]] = None, extra_params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """调用 AI Builder API 的辅助函数"""
    request_data = {
        "model": "gpt-5",
        "messages": messages,
        "temperature": 1.0  # gpt-5 必须使用 temperature=1.0
    }
    
    # 添加额外参数（如 max_tokens），但排除 temperature（必须保持为 1.0）
    if extra_params:
        filtered_params = {k: v for k, v in extra_params.items() if k != "temperature"}
        request_data.update(filtered_params)
    
    if tools:
        request_data["tools"] = tools
    
    # 如果提供了 max_tokens，转换为 max_completion_tokens
    if "max_tokens" in request_data:
        request_data["max_completion_tokens"] = request_data.pop("max_tokens")
    
    url = f"{AI_BUILDER_BASE_URL}/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {AI_BUILDER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, json=request_data, headers=headers)
        response.raise_for_status()
        return response.json()


# 在启动时预加载 HTML 内容
_html_content = None

def _load_html_content():
    """在启动时加载 HTML 内容"""
    global _html_content
    if _html_content is None:
        import os
        current_dir = os.path.dirname(os.path.abspath(__file__))
        html_path = os.path.join(current_dir, "static", "index.html")
        try:
            with open(html_path, "r", encoding="utf-8") as f:
                _html_content = f.read()
            logger.info(f"HTML 内容已加载: {len(_html_content)} 字符")
        except Exception as e:
            logger.error(f"加载 HTML 文件失败: {e}")
            _html_content = f"<h1>Error loading chat interface</h1><p>{str(e)}</p>"
    return _html_content

# 启动时加载
_load_html_content()

@app.get("/health")
async def health():
    """健康检查端点"""
    return {"status": "ok", "message": "Service is running"}

@app.get("/", response_class=HTMLResponse)
async def root():
    """返回聊天界面主页"""
    content = _load_html_content()
    return HTMLResponse(content=content)


@app.post("/api/chat", summary="聊天 API（简化版）")
async def chat_api(request: ChatRequest):
    """
    简化的聊天 API，用于前端调用
    
    接收消息列表，返回 AI 的回复
    """
    try:
        # 转换为 OpenAI 格式
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # 调用 chat_completions 端点
        chat_request = {
            "model": "gpt-5",
            "messages": messages
        }
        
        # 直接调用内部的 chat_completions 逻辑
        response_data = await chat_completions(chat_request, None)
        
        # 提取回复内容
        choice = response_data.get("choices", [{}])[0]
        message = choice.get("message", {})
        content = message.get("content", "")
        
        return {
            "content": content,
            "role": "assistant"
        }
    except Exception as e:
        logger.error(f"聊天 API 错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"聊天 API 错误: {str(e)}")


@app.post(
    "/hello",
    summary="Hello 问候接口",
    response_model=HelloResponse,
    tags=["问候接口"]
)
async def hello(request: NameRequest):
    """
    Hello 问候接口
    
    - **name**: 用户的名字（必填，1-50个字符）
    
    返回格式化的问候消息。
    """
    return {"message": f"hello, {request.name}"}


@app.get(
    "/api/joke",
    summary="获取笑话 (使用 grok-4-fast)",
    tags=["AI API"]
)
async def get_joke():
    """
    使用 grok-4-fast 模型获取一个中文笑话
    """
    try:
        url = f"{AI_BUILDER_BASE_URL}/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {AI_BUILDER_API_KEY}",
            "Content-Type": "application/json"
        }
        
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
        
        logger.info(f"调用 grok-4-fast 获取笑话...")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=request_data, headers=headers)
            response.raise_for_status()
            result = response.json()
            
            # 提取回复内容
            choice = result.get("choices", [{}])[0]
            message = choice.get("message", {})
            content = message.get("content", "")
            
            usage = result.get("usage", {})
            
            return {
                "joke": content,
                "model": "grok-4-fast",
                "usage": usage
            }
            
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP 错误: {e.response.status_code} - {e.response.text}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"AI Builder API 错误: {e.response.text}"
        )
    except httpx.RequestError as e:
        logger.error(f"连接错误: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail=f"无法连接到 AI Builder API: {str(e)}"
        )
    except Exception as e:
        logger.error(f"服务器错误: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"服务器错误: {str(e)}"
        )


@app.post(
    "/search",
    summary="搜索 API (转发到 AI Builder)",
    tags=["搜索 API"]
)
async def search(request: SearchRequest):
    """
    搜索 API - 转发到 AI Builder Space
    
    接收搜索关键词，转发到 AI Builder Space 的搜索 API。
    """
    try:
        # 构建请求数据
        request_data = {
            "keywords": request.keywords,
            "max_results": request.max_results
        }
        
        # 构建 AI Builder API 的完整 URL
        url = f"{AI_BUILDER_BASE_URL}/v1/search/"
        
        # 准备请求头
        headers = {
            "Authorization": f"Bearer {AI_BUILDER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # 转发请求到 AI Builder API
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                url,
                json=request_data,
                headers=headers
            )
            response.raise_for_status()
            return response.json()
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"AI Builder API 错误: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"无法连接到 AI Builder API: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"服务器错误: {str(e)}"
        )


@app.post(
    "/v1/chat/completions",
    summary="Chat Completions (OpenAI 兼容 + Agentic Loop)",
    tags=["Chat API"]
)
async def chat_completions(
    request: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    """
    Chat Completions 接口 - 支持多轮 Agentic Loop
    
    接收 OpenAI 格式的请求，实现 agentic loop：
    1. 第一轮：提供搜索工具，LLM 决定是否调用
    2. 第二轮：如果第一轮有工具调用，仍然提供工具，可以继续调用
    3. 第三轮：强制不提供工具，生成最终答案
    
    最多执行3轮，前2轮可以调用工具，第3轮强制生成答案。
    """
    # 获取原始消息和其他参数
    messages = request.get("messages", []).copy()
    if not messages:
        raise HTTPException(status_code=400, detail="messages 字段不能为空")
    
    try:
        # 提取其他参数（如 max_tokens），但不包括 messages 和 model
        extra_params = {k: v for k, v in request.items() if k not in ["messages", "model"]}
        
        max_rounds = 3  # 最多3轮
        current_round = 1
        
        logger.info("=" * 60)
        logger.info(f"开始 Agentic Loop，最多 {max_rounds} 轮")
        logger.info("=" * 60)
        
        while current_round <= max_rounds:
            # 决定是否提供工具：前2轮提供工具，第3轮不提供
            provide_tools = current_round < max_rounds
            
            logger.info(f"\n[第 {current_round} 轮]")
            logger.info(f"  提供工具: {'是' if provide_tools else '否（最后一轮，强制生成答案）'}")
            
            # 调用 AI Builder API
            if provide_tools:
                logger.info(f"  调用 AI Builder API（带工具）...")
                response = await call_ai_builder_api(messages, tools=[SEARCH_TOOL], extra_params=extra_params)
            else:
                # 最后一轮：强制不提供工具
                logger.info(f"  调用 AI Builder API（不带工具，强制生成最终答案）...")
                response = await call_ai_builder_api(messages, tools=None, extra_params=extra_params)
            
            # 检查响应
            choice = response.get("choices", [{}])[0]
            message = choice.get("message", {})
            tool_calls = message.get("tool_calls")
            content = message.get("content", "")
            
            logger.info(f"  响应内容预览: {content[:100] if content else 'None'}...")
            logger.info(f"  工具调用数量: {len(tool_calls) if tool_calls else 0}")
            
            # 如果没有工具调用，或者已经是最后一轮，直接返回结果
            if not tool_calls or current_round == max_rounds:
                if not tool_calls:
                    logger.info(f"  没有工具调用，返回结果")
                else:
                    logger.info(f"  第 {max_rounds} 轮有工具调用，但已到最大轮数，强制返回结果")
                logger.info("=" * 60)
                return response
            
            # 有工具调用且不是最后一轮，执行工具并继续下一轮
            logger.info(f"  检测到 {len(tool_calls)} 个工具调用，开始执行...")
            
            # 添加 assistant message（包含所有 tool_calls）
            messages.append({
                "role": "assistant",
                "content": message.get("content"),  # 可能是 None 或空字符串
                "tool_calls": tool_calls
            })
            
            # 定义单个工具调用的执行函数
            async def execute_single_tool_call(tool_call: Dict[str, Any], idx: int) -> Dict[str, Any]:
                """执行单个工具调用并返回结果"""
                tool_name = tool_call.get("function", {}).get("name", "unknown")
                tool_id = tool_call.get("id", "unknown")
                
                logger.info(f"\n  [工具调用 {idx}/{len(tool_calls)}]")
                logger.info(f"    工具名称: {tool_name}")
                logger.info(f"    工具调用 ID: {tool_id}")
                
                if tool_name == "search":
                    # 解析参数
                    function_args = json.loads(tool_call["function"]["arguments"])
                    keywords = function_args.get("keywords", [])
                    max_results = function_args.get("max_results", 6)
                    
                    logger.info(f"    参数:")
                    logger.info(f"      - keywords: {keywords}")
                    logger.info(f"      - max_results: {max_results}")
                    
                    # 执行搜索
                    logger.info(f"    执行搜索...")
                    search_result = await execute_search(keywords, max_results)
                    
                    # 记录搜索结果摘要
                    if "error" in search_result:
                        logger.warning(f"    搜索结果: 错误 - {search_result.get('error', 'Unknown error')}")
                    else:
                        queries = search_result.get("queries", [])
                        combined_answer = search_result.get("combined_answer")
                        logger.info(f"    搜索结果:")
                        logger.info(f"      - 查询数量: {len(queries)}")
                        if combined_answer:
                            logger.info(f"      - 组合答案: {combined_answer[:200]}...")
                        for q_idx, query in enumerate(queries[:2], 1):  # 只显示前2个查询的摘要
                            keyword = query.get("keyword", "unknown")
                            response_data = query.get("response", {})
                            results = response_data.get("results", [])
                            logger.info(f"      - 查询 {q_idx} ({keyword}): {len(results)} 个结果")
                    
                    logger.info(f"    工具调用完成")
                    return {
                        "tool_call_id": tool_call["id"],
                        "result": search_result
                    }
                else:
                    logger.warning(f"    未知工具类型: {tool_name}，跳过执行")
                    return {
                        "tool_call_id": tool_call["id"],
                        "result": {"error": f"未知工具类型: {tool_name}"}
                    }
            
            # 并行执行所有工具调用
            logger.info(f"  开始并行执行 {len(tool_calls)} 个工具调用...")
            tasks = [execute_single_tool_call(tool_call, idx+1) for idx, tool_call in enumerate(tool_calls)]
            tool_results = await asyncio.gather(*tasks)
            
            # 按顺序将结果添加到消息列表（保持工具调用ID的顺序）
            for tool_result in tool_results:
                tool_call_id = tool_result["tool_call_id"]
                result = tool_result["result"]
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call_id,
                    "content": json.dumps(result, ensure_ascii=False)
                })
            
            logger.info(f"  所有工具调用完成，结果已添加到消息历史")
            
            # 进入下一轮
            logger.info(f"\n  第 {current_round} 轮完成，准备进入第 {current_round + 1} 轮...")
            current_round += 1
        
        # 理论上不应该到达这里，但为了安全起见
        return response
            
    except HTTPException:
        # 重新抛出 HTTPException（如 400 错误）
        raise
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"AI Builder API 错误: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"无法连接到 AI Builder API: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"服务器错误: {str(e)}"
        )


# 在所有路由定义之后挂载静态文件目录
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    logger.info(f"静态文件目录已挂载: {static_dir}")
else:
    logger.warning(f"静态文件目录不存在: {static_dir}")
