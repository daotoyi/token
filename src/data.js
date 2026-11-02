export const providers = {
  OpenAI: { color: "#111827", soft: "#eef0f3", mark: "◎" },
  Anthropic: { color: "#c25a3a", soft: "#fae9e2", mark: "A" },
  Google: { color: "#2868e8", soft: "#e8efff", mark: "G" },
  Meta: { color: "#1673e6", soft: "#e5f0ff", mark: "∞" },
  xAI: { color: "#202020", soft: "#ececea", mark: "x" },
  DeepSeek: { color: "#4d62e8", soft: "#e8ebff", mark: "D" },
  Mistral: { color: "#e9541f", soft: "#ffebe4", mark: "M" },
  Qwen: { color: "#5d50ce", soft: "#eeebff", mark: "Q" },
};

export const models = [
  {
    id: "openai/gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
    context: "400K",
    input: 1.25,
    output: 10,
    latency: 0.9,
    throughput: 118,
    category: "Flagship",
    badge: "Popular",
    color: "#74aa9c",
  },
  {
    id: "openai/gpt-5-mini",
    name: "GPT-5 mini",
    provider: "OpenAI",
    context: "400K",
    input: 0.25,
    output: 2,
    latency: 0.6,
    throughput: 186,
    category: "Fast",
    color: "#a5cbbf",
  },
  {
    id: "anthropic/claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    provider: "Anthropic",
    context: "200K",
    input: 3,
    output: 15,
    latency: 1.1,
    throughput: 92,
    category: "Coding",
    badge: "Top pick",
    color: "#d97757",
  },
  {
    id: "anthropic/claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    context: "200K",
    input: 1,
    output: 5,
    latency: 0.7,
    throughput: 151,
    category: "Fast",
    color: "#e5a085",
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    context: "1M",
    input: 1.25,
    output: 10,
    latency: 1.4,
    throughput: 87,
    category: "Multimodal",
    badge: "1M ctx",
    color: "#6c8eef",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    context: "1M",
    input: 0.3,
    output: 2.5,
    latency: 0.5,
    throughput: 214,
    category: "Fast",
    color: "#9eb3f2",
  },
  {
    id: "meta/llama-4-maverick",
    name: "Llama 4 Maverick",
    provider: "Meta",
    context: "1M",
    input: 0.27,
    output: 0.85,
    latency: 0.8,
    throughput: 172,
    category: "Open source",
    color: "#407fd8",
  },
  {
    id: "xai/grok-4",
    name: "Grok 4",
    provider: "xAI",
    context: "256K",
    input: 3,
    output: 15,
    latency: 1.7,
    throughput: 75,
    category: "Reasoning",
    color: "#555555",
  },
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    context: "164K",
    input: 0.55,
    output: 2.19,
    latency: 2.1,
    throughput: 38,
    category: "Reasoning",
    badge: "Best value",
    color: "#6777ec",
  },
  {
    id: "deepseek/deepseek-v3.2",
    name: "DeepSeek V3.2",
    provider: "DeepSeek",
    context: "164K",
    input: 0.27,
    output: 1.1,
    latency: 1.3,
    throughput: 81,
    category: "Open source",
    color: "#8190f1",
  },
  {
    id: "qwen/qwen3-235b",
    name: "Qwen3 235B",
    provider: "Qwen",
    context: "131K",
    input: 0.18,
    output: 0.7,
    latency: 0.7,
    throughput: 196,
    category: "Open source",
    color: "#8678e7",
  },
  {
    id: "mistral/mistral-large",
    name: "Mistral Large 2",
    provider: "Mistral",
    context: "128K",
    input: 0.9,
    output: 2.7,
    latency: 0.9,
    throughput: 132,
    category: "General",
    color: "#f27a4f",
  },
];

export const usageData = [34, 42, 38, 58, 51, 69, 62, 87, 74, 92, 88, 106, 97, 118];

export const codeExamples = {
  curl: `curl https://api.dyinvest.cn/v1/chat/completions \\
  -H "Authorization: Bearer $DYTOKEN_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "openai/gpt-5",
    "messages": [
      { "role": "user", "content": "Explain quantum computing" }
    ]
  }'`,
  typescript: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.dyinvest.cn/v1",
  apiKey: process.env.DYTOKEN_API_KEY,
});

const completion = await client.chat.completions.create({
  model: "anthropic/claude-sonnet-4.5",
  messages: [{ role: "user", content: "Build me a launch plan" }],
});`,
  python: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.dyinvest.cn/v1",
    api_key=os.environ["DYTOKEN_API_KEY"],
)

response = client.chat.completions.create(
    model="google/gemini-2.5-pro",
    messages=[{"role": "user", "content": "Summarize this report"}],
)`,
};
