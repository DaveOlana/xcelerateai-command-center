import { PYODIDE_MODULE_URL } from './registry.js';

let runtimePromise;
const loadRuntime = async () => {
  if (!runtimePromise) runtimePromise = import(/* @vite-ignore */ PYODIDE_MODULE_URL).then(({ loadPyodide }) => loadPyodide({ indexURL: PYODIDE_MODULE_URL.replace(/pyodide\.mjs$/, '') }));
  return runtimePromise;
};

self.onmessage = async ({ data }) => {
  if (data?.type !== 'run' || data.specId !== 'PYAE-W03-E01-service-structure' || typeof data.source !== 'string') return self.postMessage({ outcome: 'error', checks: [] });
  try {
    const pyodide = await loadRuntime();
    pyodide.globals.set('learner_source', data.source);
    const json = await pyodide.runPythonAsync(`
import ast, json

check_ids = ${JSON.stringify(['python-syntax', 'create-task-function', 'complete-task-function', 'filter-priority-function', 'explicit-returns', 'service-io-separation'])}
checks = []
try:
    tree = ast.parse(learner_source)
    checks.append({"id": check_ids[0], "passed": True, "message": "Python syntax parsed successfully."})
    functions = {node.name: node for node in tree.body if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
    required = ["create_task", "complete_task", "filter_by_priority"]
    labels = ["create_task is defined.", "complete_task is defined.", "filter_by_priority is defined."]
    for index, (name, label) in enumerate(zip(required, labels), start=1):
        checks.append({"id": check_ids[index], "passed": name in functions, "message": label if name in functions else f"Define {name} as a top-level function."})
    found = [functions[name] for name in required if name in functions]
    returns = bool(found) and all(any(isinstance(node, ast.Return) for node in ast.walk(function)) for function in found)
    checks.append({"id": check_ids[4], "passed": returns, "message": "Required service functions have explicit return paths." if returns else "Each required service function needs an explicit return path."})
    forbidden = []
    for function in found:
        for node in ast.walk(function):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in {"input", "print"}:
                forbidden.append(f"{function.name}:{node.func.id}")
    separated = not forbidden
    checks.append({"id": check_ids[5], "passed": separated, "message": "Service functions do not call input() or print()." if separated else "Keep input() and print() outside service functions."})
except SyntaxError:
    checks = [{"id": check_id, "passed": False, "message": "Fix Python syntax before running service checks."} for check_id in check_ids]
outcome = "passed" if all(check["passed"] for check in checks) else "failed"
json.dumps({"outcome": outcome, "checks": checks})
`);
    self.postMessage(JSON.parse(json));
  } catch {
    self.postMessage({ outcome: 'error', checks: data.expectedCheckIds.map((id) => ({ id, passed: false, message: 'The isolated Python runtime could not complete this check.' })) });
  }
};
