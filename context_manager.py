import tiktoken
from pydantic import BaseModel
from typing import List, Dict

class SessionState(BaseModel):
    model_name: str = "gpt-4o"
    context_limit: int = 128_000
    handoff_threshold: float = 0.85
    system_prompt: str = "Brokerage assistant"
    messages: List[Dict[str, str]] = []

class ContextManager:
    def __init__(self, state: SessionState):
        self.state = state
        self.encoder = tiktoken.encoding_for_model(state.model_name)

    def count_tokens(self, text: str) -> int:
        return len(self.encoder.encode(text))

    def get_context_metrics(self) -> dict:
        total = self.count_tokens(self.state.system_prompt)
        for msg in self.state.messages:
            total += self.count_tokens(msg.get("content", "")) + 4

        ratio = total / self.state.context_limit
        remaining = max(0.0, (1.0 - ratio) * 100)
        return {
            "total_tokens": total,
            "percent_remaining": round(remaining, 1),
            "requires_handoff": (1.0 - ratio) <= (1.0 - self.state.handoff_threshold)
        }

if __name__ == "__main__":
    mgr = ContextManager(SessionState())
    print("Context Monitor Test:", mgr.get_context_metrics())
