import { createWorkersAI } from "workers-ai-provider";
// We must import and re-export the Durable Object class from our main server
import { Chat } from "./server";
export { Chat };

// Define our custom knowledge base
const documents = [
  {
    id: "p1",
    text: "This project is an AI-powered application built for a Cloudflare assignment.",
  },
  {
    id: "p2",
    text: "The application uses a full-stack architecture: a React frontend on Cloudflare Pages, and a backend using Cloudflare Agents, Workers AI, Durable Objects for state, and Vectorize for RAG memory.",
  },
  {
    id: "p3",
    text: "The main LLM is Llama 3.3, and the embedding model is 'bge-large-en-v1.5' to support a 1024-dimension vector index.",
  },
  {
    id: "p4",
    text: "The repository for this project is named 'cf_ai_rag_chatbot' and includes a README.md and a PROMPTS.md file.",
  },
];

// This default script handles the embedding and ingestion
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    try {
      const workersAI = createWorkersAI({ binding: env.AI });
      const vectors = [];

      // 1. Create embeddings for all documents
      const embeddingModel = workersAI.textEmbedding("@cf/baai/bge-large-en-v1.5");
      const embeddingsResult = await embeddingModel.doEmbed({
        values: documents.map((doc) => doc.text),
      });

      // 2. Map documents to Vectorize 'insert' format
      for (let i = 0; i < documents.length; i++) {
        vectors.push({
          id: documents[i].id,
          values: embeddingsResult.embeddings[i],
          metadata: { text: documents[i].text },
        });
      }

      // 3. Insert all vectors into the index
      // Note: We use env.VECTORIZE because our 'wrangler.jsonc' set remote: true
      await env.VECTORIZE.insert(vectors);

      return Response.json({
        success: true,
        message: `Successfully ingested ${vectors.length} documents.`,
      });
    } catch (e: any) {
      return Response.json(
        { success: false, error: e.message, stack: e.stack },
        { status: 500 }
      );
    }
  },
};
