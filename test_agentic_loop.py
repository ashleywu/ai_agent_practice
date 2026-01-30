"""
测试 Agentic Loop 功能
"""
import requests
import json
import time
import sys
import io

# 设置 UTF-8 编码以支持中文输出
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"

def test_chat_with_search():
    """测试需要搜索的场景"""
    print("=" * 60)
    print("测试 1: 需要搜索的场景")
    print("=" * 60)
    
    url = f"{BASE_URL}/v1/chat/completions"
    payload = {
        "model": "gpt-5",
        "messages": [
            {"role": "user", "content": "最新的 Python FastAPI 版本是什么？"}
        ]
    }
    
    print(f"请求: {json.dumps(payload, indent=2, ensure_ascii=False)}")
    print("\n发送请求...")
    
    start_time = time.time()
    response = requests.post(url, json=payload)
    elapsed_time = time.time() - start_time
    
    print(f"\n响应状态码: {response.status_code}")
    print(f"响应时间: {elapsed_time:.2f} 秒")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n响应结构:")
        print(f"  - id: {data.get('id', 'N/A')}")
        print(f"  - model: {data.get('model', 'N/A')}")
        
        choice = data.get("choices", [{}])[0]
        message = choice.get("message", {})
        content = message.get("content", "")
        tool_calls = message.get("tool_calls")
        
        print(f"\n消息内容:")
        print(f"  - content: {content[:200] if content else 'None'}...")
        print(f"  - tool_calls: {'有' if tool_calls else '无'}")
        
        if tool_calls:
            print(f"\n工具调用数量: {len(tool_calls)}")
            for i, tc in enumerate(tool_calls, 1):
                print(f"  工具调用 {i}:")
                print(f"    - id: {tc.get('id', 'N/A')}")
                print(f"    - function: {tc.get('function', {}).get('name', 'N/A')}")
        
        print(f"\n最终答案:")
        print(f"  {content}")
        print("\n✅ 测试通过")
    else:
        print(f"\n❌ 测试失败")
        print(f"错误信息: {response.text}")
    
    return response.status_code == 200


def test_chat_without_search():
    """测试不需要搜索的场景"""
    print("\n" + "=" * 60)
    print("测试 2: 不需要搜索的场景")
    print("=" * 60)
    
    url = f"{BASE_URL}/v1/chat/completions"
    payload = {
        "model": "gpt-5",
        "messages": [
            {"role": "user", "content": "1+1 等于多少？"}
        ]
    }
    
    print(f"请求: {json.dumps(payload, indent=2, ensure_ascii=False)}")
    print("\n发送请求...")
    
    start_time = time.time()
    response = requests.post(url, json=payload)
    elapsed_time = time.time() - start_time
    
    print(f"\n响应状态码: {response.status_code}")
    print(f"响应时间: {elapsed_time:.2f} 秒")
    
    if response.status_code == 200:
        data = response.json()
        choice = data.get("choices", [{}])[0]
        message = choice.get("message", {})
        content = message.get("content", "")
        tool_calls = message.get("tool_calls")
        
        print(f"\n消息内容:")
        print(f"  - content: {content}")
        print(f"  - tool_calls: {'有' if tool_calls else '无'}")
        
        if tool_calls:
            print(f"\n⚠️  警告: 不应该有工具调用")
        else:
            print(f"\n✅ 正确: 没有工具调用")
        
        print(f"\n最终答案:")
        print(f"  {content}")
        print("\n✅ 测试通过")
    else:
        print(f"\n❌ 测试失败")
        print(f"错误信息: {response.text}")
    
    return response.status_code == 200


def test_empty_messages():
    """测试空消息的错误处理"""
    print("\n" + "=" * 60)
    print("测试 3: 空消息错误处理")
    print("=" * 60)
    
    url = f"{BASE_URL}/v1/chat/completions"
    payload = {
        "model": "gpt-5",
        "messages": []
    }
    
    print(f"请求: {json.dumps(payload, indent=2, ensure_ascii=False)}")
    print("\n发送请求...")
    
    response = requests.post(url, json=payload)
    
    print(f"\n响应状态码: {response.status_code}")
    
    if response.status_code == 400:
        print(f"错误信息: {response.json().get('detail', 'N/A')}")
        print("\n✅ 测试通过: 正确返回 400 错误")
        return True
    else:
        print(f"\n❌ 测试失败: 应该返回 400 错误")
        print(f"实际响应: {response.text}")
        return False


def test_multi_round_tool_calls():
    """测试多轮工具调用场景"""
    print("\n" + "=" * 60)
    print("测试 4: 多轮工具调用场景")
    print("=" * 60)
    
    url = f"{BASE_URL}/v1/chat/completions"
    # 使用一个可能需要多轮搜索的复杂问题
    payload = {
        "model": "gpt-5",
        "messages": [
            {"role": "user", "content": "请搜索 Python FastAPI 的最新版本，然后搜索它的主要特性"}
        ]
    }
    
    print(f"请求: {json.dumps(payload, indent=2, ensure_ascii=False)}")
    print("\n发送请求...")
    print("注意: 这个测试验证多轮工具调用功能（最多3轮，前2轮可调用工具）")
    
    start_time = time.time()
    response = requests.post(url, json=payload)
    elapsed_time = time.time() - start_time
    
    print(f"\n响应状态码: {response.status_code}")
    print(f"响应时间: {elapsed_time:.2f} 秒")
    
    if response.status_code == 200:
        data = response.json()
        choice = data.get("choices", [{}])[0]
        message = choice.get("message", {})
        content = message.get("content", "")
        tool_calls = message.get("tool_calls")
        
        print(f"\n最终响应:")
        print(f"  - content: {content[:300] if content else 'None'}...")
        print(f"  - tool_calls: {'有' if tool_calls else '无'}")
        
        if tool_calls:
            print(f"\n⚠️  警告: 第三轮不应该有工具调用（应该被强制切断）")
            print(f"工具调用数量: {len(tool_calls)}")
        else:
            print(f"\n✅ 正确: 第三轮没有工具调用（已强制生成答案）")
        
        print(f"\n最终答案:")
        print(f"  {content[:500]}")
        print("\n✅ 测试通过")
    else:
        print(f"\n❌ 测试失败")
        print(f"错误信息: {response.text}")
    
    return response.status_code == 200


if __name__ == "__main__":
    print("开始测试 Agentic Loop 功能...")
    print("请确保 FastAPI 服务正在运行: uvicorn main:app --reload")
    print("\n等待 2 秒后开始测试...")
    time.sleep(2)
    
    results = []
    
    # 测试需要搜索的场景
    try:
        results.append(("需要搜索", test_chat_with_search()))
    except Exception as e:
        print(f"\n❌ 测试异常: {e}")
        results.append(("需要搜索", False))
    
    # 测试不需要搜索的场景
    try:
        results.append(("不需要搜索", test_chat_without_search()))
    except Exception as e:
        print(f"\n❌ 测试异常: {e}")
        results.append(("不需要搜索", False))
    
    # 测试错误处理
    try:
        results.append(("错误处理", test_empty_messages()))
    except Exception as e:
        print(f"\n❌ 测试异常: {e}")
        results.append(("错误处理", False))
    
    # 测试多轮工具调用
    try:
        results.append(("多轮工具调用", test_multi_round_tool_calls()))
    except Exception as e:
        print(f"\n❌ 测试异常: {e}")
        results.append(("多轮工具调用", False))
    
    # 总结
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    for name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{name}: {status}")
    
    all_passed = all(result for _, result in results)
    print(f"\n总体结果: {'✅ 所有测试通过' if all_passed else '❌ 部分测试失败'}")
