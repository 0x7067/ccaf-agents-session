# Foundational topics

These topics will make the main topic of agents and orchestration easier to understand

## Subjects

### 1.1 API Request Structure

The Claude API follows a request–response model. Each request to the Claude Messages API includes:

```json
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 1024,
  "system": "You are a helpful assistant.",
  "messages": [
    {"role": "user", "content": "Hi!"},
    {"role": "assistant", "content": "Hello!"},
    {"role": "user", "content": "How are you?"}
  ],
  "tools": [...],
  "tool_choice": {"type": "auto"}
}
```

### 1.2 Message Roles

The messages array uses two conversational roles plus one instructional role:

user — user messages, including tool results (sent as a tool_result content block within a user-role message, not as a separate tool role)
assistant — model responses (included when sending history), including tool use requests (tool_use content blocks)
system — can be set via the top-level system field (applies from the first turn) or inline in messages as {"role": "system", ...} (applies from that point onward, subject to placement rules — see below)
Tool results are not sent as a role: "tool" message. They're sent as a user-role message whose content includes a tool_result content block:

```json
{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_01...",
      "content": "..."
    }
  ]
}
```  

system can also appear as a role directly in the messages array, not just via the top-level system parameter. This is meant for adding instructions mid-conversation without invalidating the cached prefix from the top-level system field. It has specific placement rules:

Must immediately follow a user turn (including one with tool_result blocks) or an assistant turn ending in server tool use.
Must precede an assistant turn or end the array.
Cannot sit between a tool_use block and its tool_result—doing so returns a 400 error.
Later system messages (including mid-conversation ones) take precedence over earlier ones and over the top-level system field for turns that follow.
Critically important: on every API request you must send the full conversation history. The model does not persist state between requests—each call is independent.

### 1.3 The `stop_reason` Field in the Response

The Claude API response includes `stop_reason`, which indicates why the model stopped generating:

| Value | Description | Action |
| --- | --- | --- |
| `"end_turn"` | The model finished its response | Show the result to the user |
| `"tool_use"` | The model wants to call a tool | Execute the tool and return the result |
| `"max_tokens"` | Token limit reached | The response is truncated; you may need to increase the limit |
| `"stop_sequence"` | A stop sequence was encountered | Handle based on your application logic |

For agentic systems, `"tool_use"` and `"end_turn"` are the most important—they control the agent loop.

## 1.4 System Prompt

The system prompt is a special instruction that defines context and behavioral rules. It:

- Is not part of the `messages` array; it is passed separately in the `system` field
- Has priority over user messages
- Is loaded once and applies throughout the conversation
- Is used to define role, constraints, and output format

**Important for the exam:** system prompt wording can create unintended tool associations. For example, an instruction like “always verify the customer” can cause the model to overuse `get_customer`, even when it is unnecessary.

### 2.4 JSON Schemas for Structured Output

Using tool_use with JSON schemas is the most reliable way to obtain structured output from Claude. It:

Guarantees syntactically valid JSON (no missing braces, no trailing commas)
Enforces the required structure (required fields are present)
Does not guarantee semantic correctness (values can still be wrong)
Schema design — key principles:

```json
{
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "enum": ["bug", "feature", "docs", "unclear", "other"]
    },
    "category_detail": {
      "type": ["string", "null"],
      "description": "Details if category = 'other' or 'unclear'"
    },
    "severity": {
      "type": "string",
      "enum": ["critical", "high", "medium", "low"]
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    },
    "optional_field": {
      "type": ["string", "null"],
      "description": "Null if the information was not found in the source"
    }
  },
  "required": ["category", "severity"]
}
```

Schema design rules:

- Required vs optional: mark fields as required only if the information is always available. Required fields push the model to fabricate values when data is missing.
- Nullable fields: use "type": ["string", "null"] for information that may be absent. The model can return null instead of hallucinating.
- Enums with "other": add "other" + a detail string to avoid losing data outside your predefined categories.
- Enum "unclear": for cases where the model cannot confidently pick a category—honest "unclear" is better than a wrong category.
