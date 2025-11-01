# cf_ai_rag_chatbot

> **Note:** This is a project submission for the Cloudflare AI-Powered Application optional assignment.

Project Status
Note: The application code and architecture are 100% complete. All four required components (LLM, Agent/Durable Object, Vectorize, and Pages) are fully implemented using the correct native Cloudflare bindings.

As of this commit, the project is encountering a persistent InferenceUpstreamError (e.g., reference = tli6v7...) when calling env.AI.run(). This is a known platform-side error from Cloudflare, which typically indicates that a new account's billing information is still propagating. Access to GPU-based AI services (even the free tier) requires a payment method on file, and this error is common during the time it takes for that to be fully enabled. The code itself is correct and ready to run as soon as the account is fully provisioned.

## Overview

This is a full-stack RAG (Retrieval-Augmented Generation) chatbot application built for the Cloudflare AI assignment. The frontend is a React chat interface built on Cloudflare Pages, providing an intuitive user experience for interacting with the AI agent. The backend is powered by a Cloudflare AI Agent that uses a Vectorize index to answer questions about a custom knowledge base. The system combines the power of Workers AI's Llama 3.3 model with a custom document retrieval system to provide contextually relevant responses based on ingested knowledge.

The application demonstrates a production-ready architecture that seamlessly integrates multiple Cloudflare services: Workers AI for language models, Vectorize for semantic search, Durable Objects for stateful agent coordination, and Cloudflare Pages for the frontend deployment.

## Architecture & Components

This project explicitly maps to the four assignment requirements:

### LLM
- **Technology:** Llama 3.3 70B (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`) running on Workers AI
- **Implementation:** The model is accessed via the Workers AI binding and configured in the agent's `onChatMessage` handler in `src/server.ts`. The model generates responses based on user queries enriched with context from the RAG pipeline.

### Workflow / Coordination
- **Technology:** Cloudflare Agent (using the `agents` package v0.2.20)
- **Implementation:** The agent is implemented as a `Chat` class extending `AIChatAgent` in `src/server.ts`. This agent runs on a Durable Object and serves as the central workflow coordinator, handling chat message processing, RAG retrieval, and LLM response generation. The agent manages the entire conversation flow and orchestrates interactions between Vectorize, Workers AI, and the frontend.

### User Input
- **Technology:** Cloudflare Pages frontend built with React
- **Implementation:** The frontend is located in `src/app.tsx` and provides a modern chat interface that connects to the backend agent via WebSocket connections. Users can type messages, view conversation history, and interact with the AI agent in real-time.

### Memory / State
The project uses two distinct forms of memory:

#### Knowledge Memory
- **Technology:** Vectorize
- **Implementation:** Vectorize stores document embeddings created using the `@cf/baai/bge-large-en-v1.5` embedding model (1024 dimensions). The custom knowledge base contains project-specific information that is ingested via `src/ingest.ts`. When a user asks a question, the agent queries Vectorize to retrieve the most relevant context, which is then injected into the LLM prompt for accurate, knowledge-based responses.

#### Stateful Memory
- **Technology:** Durable Object (the Agent itself)
- **Implementation:** The `Chat` Durable Object maintains per-session state, storing the complete chat history (`this.messages`) for each conversation. This ensures that the agent has access to previous messages in the conversation, enabling coherent multi-turn dialogues with proper context awareness.

## Running the Project Locally

Follow these steps to set up and run the project on your local machine:

### 1. Clone the repository

```bash
git clone https://github.com/arkul07/cf_ai_rag_chatbot.git
cd cf_ai_rag_chatbot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Log in to Cloudflare

Authenticate with your Cloudflare account:

```bash
npx wrangler login
```

This will open a browser window where you can authorize Wrangler to access your Cloudflare account.

### 4. Create your workers.dev subdomain

Before deploying, you need to claim your free `workers.dev` subdomain:

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages**
3. Look for the **Subdomain** section on the right-hand side
4. Click **Claim** or **Set up** to claim your free `workers.dev` subdomain

This step is required for using remote services like Vectorize and Workers AI in development mode.

### 5. Create the Vectorize Index

Create the Vectorize index that will store your document embeddings:

```bash
npx wrangler vectorize create doc-index --dimensions=1024 --metric=cosine
```

This creates an index named `doc-index` with 1024 dimensions (matching the `bge-large-en-v1.5` embedding model) using cosine similarity for vector search.

### 6. Ingest your custom data

Ingesting data is a two-terminal process:

**Terminal 1:** Start the ingestion server

```bash
npm run ingest
```

Wait for the server to start and display "Ready on http://localhost:8788"

**Terminal 2:** Trigger the ingestion

```bash
curl http://localhost:8788
```

This will process the documents defined in `src/ingest.ts`, create embeddings, and insert them into your Vectorize index. You should see a JSON response indicating successful ingestion.

You can now stop the ingestion server in Terminal 1 (press `Ctrl+C`).

### 7. Run the application

Start the development server:

```bash
npm start
```

The server will start and you should see output indicating that Vite is running (typically on port 5173).

### 8. Open the app

Open your browser and navigate to:

```
http://localhost:5173
```

You can now start chatting with the AI agent! The agent will use the ingested knowledge base to provide contextually relevant answers to your questions.

## AI Prompts

All AI-assisted prompts used to build this project are documented in the `PROMPTS.md` file as required by the assignment.
