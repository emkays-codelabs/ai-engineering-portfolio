"""Safe arithmetic evaluation tool.

Uses an AST whitelist instead of eval()/exec() so a malicious or malformed
expression (e.g. attempting to call __import__) can never execute arbitrary
Python — it simply fails as an unsupported node type.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""


import ast
import operator

_ALLOWED_BINARY = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}
_ALLOWED_UNARY = {ast.UAdd: operator.pos, ast.USub: operator.neg}


def _safe_eval(node: ast.AST) -> float | int:
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)) and not isinstance(node.value, bool):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in _ALLOWED_BINARY:
        left = _safe_eval(node.left)
        right = _safe_eval(node.right)
        if isinstance(node.op, ast.Pow) and abs(right) > 100:
            # Guards against extremely large exponents that could hang or exhaust memory.
            raise ValueError("Exponent is too large.")
        return _ALLOWED_BINARY[type(node.op)](left, right)
    if isinstance(node, ast.UnaryOp) and type(node.op) in _ALLOWED_UNARY:
        return _ALLOWED_UNARY[type(node.op)](_safe_eval(node.operand))
    raise ValueError("Only numeric arithmetic operators are allowed.")


def calculator(expression: str) -> str:
    """Safely evaluate basic arithmetic without executing arbitrary Python."""
    expression = expression.strip()
    if not expression:
        return "Calculator error: empty expression."
    if len(expression) > 200:
        return "Calculator error: expression is too long."
    try:
        tree = ast.parse(expression, mode="eval")
        result = _safe_eval(tree.body)
        return str(result)
    except ZeroDivisionError:
        return "Calculator error: division by zero."
    except (SyntaxError, ValueError, TypeError, OverflowError) as exc:
        return f"Calculator error: {exc}"
