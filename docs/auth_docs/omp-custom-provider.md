Custom models & providers
Add a model to a built-in provider, declare a new provider that speaks one of the supported transports, and wire OAuth in when the upstream supports it.

Where it lives
Custom providers and models go in ~/.omp/agent/models.yml. The legacy models.json at the same path is migrated on first load. See Settings for how this file relates to config.yml.

Add a model entry
A provider block with a models: list declares full model metadata. Anything you list shows up in /model (see Slash commands) and is available to model roles.

# ~/.omp/agent/models.yml
providers:
  myco:
    baseUrl: https://llm.internal.myco.dev/v1
    apiKey: MYCO_API_KEY
    api: openai-responses
    auth: apiKey
    models:
      - id: myco-large
        name: MyCo Large
        reasoning: true
        input: [text, image]
        contextWindow: 200000
        maxTokens: 32000
        cost: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 }
apiKey: is checked as an env-var name first, then treated as a literal token. With this block in place and MYCO_API_KEY exported (see Environment variables), the model appears as myco/myco-large in the picker.

Model fields
id
The upstream model id. Used in the wire request.
name
Display label in the picker.
reasoning
true if the model accepts a thinking level. Enables the :level suffix and Shift+Tab cycling.

input
Modalities — any of text, image.

contextWindow / maxTokens

Tokens. Used for the live context budget.
cost
Per-million-token rates. Surfaced in /usage.

contextPromotionTarget
Optional. When a turn would exceed contextWindow, omp swaps to this model id before any fallback chain runs.

Override a built-in provider
A provider entry without a models: list is override-only — useful for repointing a built-in provider at a proxy or patching one model’s metadata without redeclaring the catalog.

providers:
  anthropic:
    baseUrl: https://gateway.internal/anthropic
    headers:
      X-Org-Id: myco
    modelOverrides:
      claude-sonnet-4-6:
        contextPromotionTarget: anthropic/claude-opus-4-6
    disableStrictTools: true
baseUrl / headers

Point a provider at a proxy or gateway.
compat
Adjust the OpenAI-compat dialect (thinkingFormat, reasoningContentField, tool-id shape).

disableStrictTools: true
Required by some third-party Anthropic-compatible endpoints that reject the strict tool-schema field.

modelOverrides
Per-model patches to contextWindow, maxTokens, cost, contextPromotionTarget.

discovery
Live model listing on a built-in provider. Types: ollama, llama.cpp, lm-studio, openai-models-list, proxy.

Implement a custom provider
A provider block declares the wire transport, the auth scheme, and (optionally) where to discover models live.

Transports (api:)
openai-completions — classic chat-completions.
openai-responses — the Responses API.
openai-codex-responses — Codex variant.
azure-openai-responses — Azure-hosted Responses.
anthropic-messages — Anthropic Messages API.
google-generative-ai — Gemini public API.
google-vertex — Gemini via Vertex.
Auth schemes (auth:)
apiKey
Reads from apiKey:, the resolution order in Providers, and --api-key. Default for cloud endpoints.

none
No credential is sent. Right choice for local servers like llama.cpp, Ollama, LM Studio when they run unauthenticated.

oauth
omp drives a browser or device-code flow on /login <provider> (see Slash commands) and stores the refreshable token in agent.db. The token is refreshed before every call. To wire OAuth in, the provider needs a registered client id and authorization endpoint — today this is reserved for built-in providers and select gateway integrations.

Discovery (discovery:)
When the upstream exposes a models endpoint, declare it once and drop the models: list:

providers:
  llama.cpp:
    baseUrl: http://127.0.0.1:8080
    api: openai-responses
    auth: none
    discovery:
      type: llama.cpp
Discovery hits the endpoint on startup and caches the result. If the server is offline at launch, omp falls back to whatever is in models.yml. Supported types: ollama, llama.cpp, lm-studio, openai-models-list, proxy.

Equivalence and tie-breaking
A canonical id (claude-sonnet-4-6, gpt-5.3-codex) groups gateways and forks of the same underlying model. Map your custom provider into a canonical group so a single role assignment can route to whichever provider you have credentials for:

equivalence:
  overrides:
    myco/myco-large: claude-sonnet-4-6

modelProviderOrder:
  - anthropic
  - myco
modelProviderOrder in config.yml breaks ties when several providers offer the same canonical id — earliest entry wins; unauthenticated providers are skipped.