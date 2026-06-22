Call stack:
  File "C:\Users\Juna Calos\AppData\Local\Programs\Python\Python313\Lib\threading.py", line 1015, in _bootstrap
    self._bootstrap_inner()
  File "C:\Users\Juna Calos\AppData\Local\Programs\Python\Python313\Lib\threading.py", line 1044, in _bootstrap_inner
    self.run()
  File "C:\Users\Juna Calos\AppData\Local\Programs\Python\Python313\Lib\threading.py", line 995, in run
    self._target(*self._args, **self._kwargs)
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\agente-hermes\cli.py", line 11394, in run_agent
    result = self.agent.run_conversation(
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\agente-hermes\run_agent.py", line 5314, in run_conversation
    return run_conversation(
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\agente-hermes\agent\conversation_loop.py", line 4045, in run_conversation
    agent._execute_tool_calls(assistant_message, messages, effective_task_id, api_call_count)
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\agente-hermes\run_agent.py", line 5201, in _execute_tool_calls
    return self._execute_tool_calls_sequential(
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\agente-hermes\run_agent.py", line 5295, in _execute_tool_calls_sequential
    return execute_tool_calls_sequential(self, assistant_message, messages, effective_task_id, api_call_count)
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\agente-hermes\agent\tool_executor.py", line 1359, in execute_tool_calls_sequential
    logger.warning("Tool %s returned error (%.2fs): %s", function_name, tool_duration, result_preview)
  File "C:\Users\Juna Calos\AppData\Local\Programs\Python\Python313\Lib\logging\__init__.py", line 1532, in warning
    self._log(WARNING, msg, args, **kwargs)
  File "C:\Users\Juna Calos\AppData\Local\Programs\Python\Python313\Lib\logging\__init__.py", line 1665, in _log
    self.handle(record)
  File "C:\Users\Juna Calos\AppData\Local\Programs\Python\Python313\Lib\logging\__init__.py", line 1681, in handle
    self.callHandlers(record)
  File "C:\Users\Juna Calos\AppData\Local\Programs\Python\Python313\Lib\logging\__init__.py", line 1737, in callHandlers
    hdlr.handle(record)
  File "C:\Users\Juna Calos\AppData\Local\Programs\Python\Python313\Lib\logging\__init__.py", line 1027, in handle
    self.emit(record)
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\agente-hermes\hermes_logging.py", line 495, in emit
    super().emit(record)
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\.venv-agente-hermes\Lib\site-packages\concurrent_log_handler\__init__.py", line 477, in emit
    self.handleError(record)
Message: 'Tool %s returned error (%.2fs): %s'
Arguments: ('terminal', 0.13523268699645996, '{"output": "N\\u0000o\\u0000 \\u0000s\\u0000e\\u0000 \\u0000p\\u0000u\\u0000e\\u0000d\\u0000e\\u0000 \\u0000i\\u0000n\\u0000i\\u0000c\\u0000i\\u0000a\\u0000r\\u0000 \\u0000e\\u0000l\\u0000 \\u0000s\\u0000e\\u0000r\\u0000v\\u000')
--- Logging error ---
Traceback (most recent call last):
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\.venv-agente-hermes\Lib\site-packages\concurrent_log_handler\__init__.py", line 456, in emit
    self._do_lock()
    ~~~~~~~~~~~~~^^
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\.venv-agente-hermes\Lib\site-packages\concurrent_log_handler\__init__.py", line 623, in _do_lock
    raise RuntimeError(
        f"Cannot acquire lock after {self.maxLockAttempts} attempts"
    )
RuntimeError: Cannot acquire lock after 20 attempts
Call stack:
  File "C:\Users\Juna Calos\AppData\Local\Programs\Python\Python313\Lib\threading.py", line 1015, in _bootstrap
    self._bootstrap_inner()
  File "C:\Users\Juna Calos\AppData\Local\Programs\Python\Python313\Lib\threading.py", line 1044, in _bootstrap_inner
    self.run()
  File "C:\Users\Juna Calos\AppData\Local\Programs\Python\Python313\Lib\threading.py", line 995, in run
    self._target(*self._args, **self._kwargs)
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\agente-hermes\agent\chat_completion_helpers.py", line 2272, in _call
    result["response"] = _call_chat_completions()
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\agente-hermes\agent\chat_completion_helpers.py", line 1850, in _call_chat_completions
    agent._create_request_openai_client(
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\agente-hermes\run_agent.py", line 3727, in _create_request_openai_client
    return self._create_openai_client(request_kwargs, reason=reason, shared=False)
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\agente-hermes\run_agent.py", line 3601, in _create_openai_client
    return create_openai_client(self, client_kwargs, reason=reason, shared=shared)
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\agente-hermes\agent\agent_runtime_helpers.py", line 1426, in create_openai_client
    _ra().logger.info(
  File "C:\Users\Juna Calos\AppData\Local\Programs\Python\Python313\Lib\logging\__init__.py", line 1520, in info
    self._log(INFO, msg, args, **kwargs)
  File "C:\Users\Juna Calos\AppData\Local\Programs\Python\Python313\Lib\logging\__init__.py", line 1665, in _log
    self.handle(record)
  File "C:\Users\Juna Calos\AppData\Local\Programs\Python\Python313\Lib\logging\__init__.py", line 1681, in handle
    self.callHandlers(record)
  File "C:\Users\Juna Calos\AppData\Local\Programs\Python\Python313\Lib\logging\__init__.py", line 1737, in callHandlers
    hdlr.handle(record)
  File "C:\Users\Juna Calos\AppData\Local\Programs\Python\Python313\Lib\logging\__init__.py", line 1027, in handle
    self.emit(record)
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\agente-hermes\hermes_logging.py", line 495, in emit
    super().emit(record)
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\.venv-agente-hermes\Lib\site-packages\concurrent_log_handler\__init__.py", line 477, in emit
    self.handleError(record)
Message: 'OpenAI client created (%s, shared=%s) %s'
Arguments: ('chat_completion_stream_request', False, 'thread=Thread-68 (_call):9448 provider=openrouter base_url=https://openrouter.ai/api/v1 model=openai/gpt-5.4-nano')