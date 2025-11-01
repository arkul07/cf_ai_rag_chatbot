import { Chat } from "./server"; // Import the DO class
export { Chat }; // Re-export it for wrangler

const documents = [
  {
    id: "p1",
    text: "This project is an AI-powered application built for a Cloudflare assignment.",
  },
  {
    id: "p2",
    text: "The application uses Cloudflare Agents, Workers AI, Durable Objects, and Vectorize.",
  },
  {
    id: "p3",
    text: "The main LLM is Llama 3.3 and the embedding model is 'bge-large-en-v1.5'.",
  },
  {
    id: "p4",
    text: "The repository for this project is 'cf_ai_rag_chatbot' and includes a README.md and PROMPTS.md.",
  },
];

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    try {
      // 'env.AI' is the native AI client.

      // 1. Create embeddings using env.AI.run()
      const { data } = await env.AI.run("@cf/baai/bge-large-en-v1.5", {
        text: documents.map((doc) => doc.text),
      });
      // 2. Map to Vectorize format
      const vectors = documents.map((doc, i) => ({
        id: doc.id,
        values: data[i],
        metadata: { text: doc.text },
      }));
      // 3. Insert into Vectorize
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
