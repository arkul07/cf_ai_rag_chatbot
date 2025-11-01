# AI Prompts Used to Build cf_ai_rag_chatbot

This document contains all AI-assisted prompts that were used to build this Cloudflare AI RAG chatbot application. All prompts were made to an AI coding assistant (Cursor/Auto) during development.

## Project Initialization

### Prompt 1: Initialize Repository
```
initialize this repository @https://github.com/arkul07/cf_ai_rag_chatbot.git here
```

### Prompt 2: Initialize Cloudflare AI Agent Project
```
Initialize a new Cloudflare AI Agent project using the official starter template. Run this in my terminal: npm create cloudflare@latest cf_ai_rag_chatbot -- --template=agents-starter

After setup, cd into the cf_ai_rag_chatbot directory and run npm install. This template provides:
- A React (User Input) frontend in the /app directory.
- An (LLM)-powered Agent defined in src/index.ts.
- The Agent itself, which runs on a Durable Object (Memory/State).
- The Agent logic, which is the (Workflow / coordination).
```

## Configuration Setup

### Prompt 3: Configure LLM and Vectorize for RAG
```
Now, let's customize the agent. In wrangler.toml, make sure the AI binding is present:
[[ai]]
binding = "AI"

In src/index.ts, find the createAIAgent call. Change the model property to the required LLM:
model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast'

Next, I need to create the Vectorize index for RAG. I will run this in my terminal:
npx wrangler vectorize create doc-index --dimensions=1024 --metric=cosine

Now, update wrangler.toml to use this new index. Find the [[vectorize]] binding (it's already there) and change its index_name to 'doc-index'.

Finally, in src/index.ts, find the RAG.with call. Make sure the embedding model matches the dimensions (1024) of my index:
model: '@cf/baai/bge-large-en-v1.5'
```

### Prompt 4: Complete Wrangler Configuration
```
First, I need to create the Vectorize database. Please execute this command in my terminal:
npx wrangler vectorize create doc-index --dimensions=1024 --metric=cosine

Next, please open the wrangler.toml file at the root of my project. I need you to modify it to ensure all my services are correctly configured. Please ensure the file contains the following:
- An [ai] binding.
- The [[durable_objects.bindings]] section for the Agent (this should already exist).
- The [[vectorize]] binding, which we need to update.

Here is the complete, final content I want for my wrangler.toml file. Please replace the entire file with this:

name = "cf_ai_rag_chatbot"
compatibility_date = "2024-05-27"

# This is the AI binding for the LLM
[ai]
binding = "AI"

# This is the Durable Object (State/Workflow)
[[durable_objects.bindings]]
name = "AGENT"
class_name = "Agent"

# This is the Vectorize (Memory) binding
# We are updating this to use the 'doc-index' we just created.
[[vectorize]]
binding = "VECTORIZE"
index_name = "doc-index"

[vars]
# This must be set to true for the 'agents-starter' template
AI_DEBUG = true
```

## Code Implementation - Agent Logic

### Prompt 5: Fix Server Implementation with Correct APIs
```
My last instruction was incorrect. Please disregard the prompt to create src/index.ts. The correct files already exist. I need you to modify src/server.ts and src/ingest.ts.

1. Modify src/server.ts:
Please open src/server.ts. This file defines the agent. I need to change the LLM and the RAG configuration. Replace the entire content of src/server.ts with this corrected code:

[Code snippet with createAIAgent, RAG, defineAIAgent]

2. Modify src/ingest.ts:
This file also has imports that need to be correct. Please open src/ingest.ts and replace its entire content with this:

[Code snippet with createAIAgent and ingest function]
```

### Prompt 6: Revert to Correct API Version
```
My apologies, my previous prompts were based on a newer, incompatible version of the agents SDK. Cursor is correct.

Please revert any changes to the package.json (we must stay on version 0.2.20).

We will now fix all the files to use the available APIs and manually build our RAG workflow.

1. Update wrangler.jsonc
[Provide correct wrangler.jsonc configuration]

2. Update src/server.ts (The Main Agent)
Replace the entire content of src/server.ts. This new code uses the AIChatAgent class and manually performs the RAG workflow (embedding, vector search, and context-stuffing) inside the onChatMessage handler.

[Code snippet with AIChatAgent and manual RAG implementation]

3. Update src/ingest.ts (The Ingestion Script)
Replace the entire content of src/ingest.ts. This is a new "manual" ingestion script that doesn't rely on the non-existent helpers.

[Code snippet with manual embedding and ingestion]
```

### Prompt 7: Fix Wrangler Configuration
```
My last wrangler.jsonc was incorrect. Please replace the entire contents of wrangler.jsonc with this new, correct version.

This version adds the required migrations block for the Chat class (as your error log requests) and removes the invalid "remote": true flag from the durable object.

[Provide corrected wrangler.jsonc]
```

### Prompt 8: Fix Durable Object Export
```
Now, let's fix the fatal error: Durable Objects... not exported in your entrypoint file: Chat.

Please open src/ingest.ts and replace its entire contents with this.

This new code does two things:
1. It keeps all the correct data-ingestion logic from before.
2. It adds import { Chat } from "src/server"; and export { Chat }; to satisfy wrangler.

[Code snippet with Chat import/export]
```

## Data Ingestion

### Prompt 9: Customize Knowledge Base
```
Please open the ingestion script located at src/ingest.ts. I need to replace the default documents array with my custom set of facts. This will be the 'memory' for my RAG. Please replace the entire content of src/ingest.ts with this:

[Custom documents array with project-specific facts]
```

## Documentation

### Prompt 10: Create README.md
```
Please generate a complete README.md file for my project. The project is a submission for the Cloudflare AI-powered application assignment.

Please use the following structure and include all the specified details:
- Title: Use the project's repository name: cf_ai_rag_chatbot
- Assignment Note: Add a blockquote right under the title
- Overview: A brief, 1-2 paragraph description
- Architecture & Components: Map project's technology to the four assignment requirements
- Running the Project Locally: Clear, step-by-step guide
- AI Prompts: Reference to PROMPTS.md file
```

## Repository Management

### Prompt 11: Push to Repository
```
ok now let us push this code to the repo
```

## Summary

All development was done through iterative conversations with an AI coding assistant. The prompts focused on:

1. **Project Setup**: Initializing the Cloudflare AI Agent starter template
2. **Configuration**: Setting up wrangler.jsonc with correct bindings for AI, Durable Objects, and Vectorize
3. **API Compatibility**: Adapting code to work with agents SDK v0.2.20 APIs (AIChatAgent, routeAgentRequest, manual RAG implementation)
4. **RAG Implementation**: Manually implementing the RAG workflow using Workers AI for embeddings and Vectorize for storage/retrieval
5. **Documentation**: Creating comprehensive README.md and PROMPTS.md files

The assistant helped resolve multiple configuration issues, API compatibility problems, and provided guidance on implementing the RAG pipeline using the correct Cloudflare APIs.

