const API_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = `You are a senior software architect. When given a feature or project description, break it down into clear, actionable developer tasks.

Respond with a single valid JSON object — no markdown fences, no explanation, just raw JSON.

Use exactly this structure:
{
  "summary": "one sentence summary of the feature",
  "tasks": [
    {
      "title": "task title",
      "description": "what needs to be done and why",
      "estimate": "X–Y hours",
      "subtasks": ["subtask 1", "subtask 2", "subtask 3"]
    }
  ],
  "totalEstimate": "X–Y hours"
}

Guidelines:
- 4–8 tasks ordered by implementation sequence
- Each task should have 2–4 subtasks
- Estimates should be realistic for a competent developer
- Tailor task details to the specified language/context`;

// ── Tool definition ────────────────────────────────────────────────────────

const ESTIMATE_COMPLEXITY_TOOL = {
  name: 'estimate_complexity',
  description:
    'Estimates the complexity of a project based on the number of tasks and whether it involves authentication or database work.',
  input_schema: {
    type: 'object',
    properties: {
      taskCount: {
        type: 'number',
        description: 'Total number of tasks generated',
      },
      hasAuthentication: {
        type: 'boolean',
        description: 'Whether any task involves auth, login, or user management',
      },
      hasDatabase: {
        type: 'boolean',
        description: 'Whether any task involves a database, storage, or data persistence',
      },
    },
    required: ['taskCount', 'hasAuthentication', 'hasDatabase'],
  },
};

// ── Local complexity scorer ────────────────────────────────────────────────

function estimateComplexity(taskCount, hasAuthentication, hasDatabase) {
  const base = taskCount * 2;
  const authScore = hasAuthentication ? 8 : 0;
  const dbScore = hasDatabase ? 6 : 0;
  const total = base + authScore + dbScore;
  let level, recommendation;
  if (total <= 10) {
    level = 'Low';
    recommendation = 'Suitable for a junior developer or a 1-week sprint.';
  } else if (total <= 20) {
    level = 'Medium';
    recommendation = 'Needs a mid-level developer. Plan for 2–3 week sprint.';
  } else {
    level = 'High';
    recommendation = 'Senior developer recommended. Break into multiple sprints.';
  }
  return { score: total, level, recommendation };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function buildHeaders(apiKey) {
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  };
}

async function callAPI(headers, body) {
  let response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Network error — check your connection and try again.');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message ?? `Anthropic API returned ${response.status}`);
  }

  return response.json();
}

function parseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) {
      try {
        return JSON.parse(fenced[1]);
      } catch {
        // fall through
      }
    }
    throw new Error('Claude returned an unexpected response format. Please try again.');
  }
}

// ── Main export ────────────────────────────────────────────────────────────

export async function getTaskBreakdown(description, language) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_API_KEY is not set. Add it to your .env file.');
  }

  const headers = buildHeaders(apiKey);
  const userMessage = {
    role: 'user',
    content: `Language / context: ${language}\n\nFeature description:\n${description}`,
  };

  // ── Step 1: first call, tools enabled ─────────────────────────────────

  const firstData = await callAPI(headers, {
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [userMessage],
    tools: [ESTIMATE_COMPLEXITY_TOOL],
    tool_choice: { type: 'auto' },
  });

  console.log('[claude.js] first response:', JSON.stringify(firstData, null, 2));

  // ── Step 2: check whether Claude called the tool ───────────────────────

  const toolUseBlock = firstData.content?.find((b) => b.type === 'tool_use');

  if (!toolUseBlock) {
    // Claude chose not to call the tool — parse and return the text directly
    const text = firstData.content?.find((b) => b.type === 'text')?.text ?? '';
    return parseJSON(text);
  }

  // ── Step 3: run the local scorer with Claude's chosen arguments ─────────

  const { taskCount, hasAuthentication, hasDatabase } = toolUseBlock.input;
  const complexity = estimateComplexity(taskCount, hasAuthentication, hasDatabase);

  // ── Step 4: second call — return the tool result and get the final JSON ─

  // tools must be present (history contains a tool_use assistant turn).
  // tool_choice "none" prevents Claude from calling the tool again and
  // ensures this turn always produces a plain text response to parse.
  const secondData = await callAPI(headers, {
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: [ESTIMATE_COMPLEXITY_TOOL],
    tool_choice: { type: 'none' },
    messages: [
      userMessage,
      // The full first-response content (may include text + tool_use blocks)
      { role: 'assistant', content: firstData.content },
      // Tool result sent back as a user turn
      {
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: toolUseBlock.id,
            content: JSON.stringify(complexity),
          },
        ],
      },
    ],
  });

  // ── Step 5: parse Claude's final text response and attach complexity ────

  console.log('[claude.js] second response:', JSON.stringify(secondData, null, 2));

  const finalText = secondData.content?.find((b) => b.type === 'text')?.text ?? '';
  const breakdown = parseJSON(finalText);

  return { ...breakdown, complexity };
}
