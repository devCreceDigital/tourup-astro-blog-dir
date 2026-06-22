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
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\agente-hermes\cli.py", line 11394, in run_agent
    result = self.agent.run_conversation(
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\agente-hermes\run_agent.py", line 5314, in run_conversation
    return run_conversation(
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\agente-hermes\agent\conversation_loop.py", line 1860, in run_conversation
    logger.info(
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
Message: 'API call #%d: model=%s provider=%s in=%d out=%d total=%d latency=%.1fs%s'
Arguments: (48, 'openai/gpt-5.4-nano', 'openrouter', 52922, 100, 53022, 3.846613645553589, ' cache=51712/52922 (98%)')
  🐍 import subprocess, sys cmd=[sys.executable,'scripts/run_pipeline.py','--input','CSV/prompts_test_row2_only.csv','--write'] res=subprocess.run(cmd,capt
ure_output=True,text=True) print('returncode',res.returncode) print('stdout_last',res.stdout[-2000:]) print('stderr_last',res.stderr[-2000:])  (  6.8s)



    result = self.handler(event)
  File "C:\Users\Juna Calos\OneDrive\Documentos\GitHub\totem-mvp1-remote\agente-hermes\cli.py", line 13153, in handle_paste
    logger.info("Collapsed paste #%d: %d lines, %d chars -> %s", _paste_counter[0], line_count + 1, len(pasted_text), paste_file)
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
Message: 'Collapsed paste #%d: %d lines, %d chars -> %s'
Arguments: (1, 34, 2624, WindowsPath('C:/Users/Juna Calos/OneDrive/Documentos/GitHub/totem-mvp1-remote/hermes/pastes/paste_1_022621.txt'))
╭─ Hermes needs your input ────────────────────────────────────────╮
│                                                                  │
│ La fila 2 en CSV tiene Brands = '-' (vacío). ¿Cómo quieres que   │
│ proceda con las páginas Company/ExternalBrand?                   │
│                                                                  │
│ ❯ 1. Solo generar promptLanding y no crear pages de marcas       │
│     (porque no hay Brands en la fila).                           │
│   2. Inferir marcas a partir de destino/categoría del prompt     │
│     (usando el pipeline existente) y crear pages faltantes.      │
│   3. Reemplazar el prompt existente para que no incluya marcas y │
│     dejar marcas sin cambios en el repo.                         │
│   4. Other (type your answer)                                    │
│                                                                  │
╰──────────────────────────────────────────────────────────────────╯

  ❓ La fila 2 en CSV tiene Brands = '-' (vacío). ¿Cómo quieres que proceda con las páginas Company/ExternalBrand?  ( 13.3s)
  ↑/↓ to select, Enter to confirm  (106s)
  