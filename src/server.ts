import { routeAgentRequest } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import {
  streamText,
  type StreamTextOnFinishCallback,
  type ToolSet,
  type CoreMessage,
} from "ai";
import { createWorkersAI } from "workers-ai-provider";

export class Chat extends AIChatAgent<Env> {
  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    _options?: { abortSignal?: AbortSignal }
  ) {
    // 1. Get the last user message to use as a query
    const lastMessage = this.messages[this.messages.length - 1];
    let contextText = "";

    // 2. Perform RAG only on user messages
    if (lastMessage?.role === "user") {
      try {
        // 3. Create an embedding for the user's message
        const workersAI = createWorkersAI({ binding: this.env.AI });
        const embeddingModel = workersAI.textEmbedding("@cf/baai/bge-large-en-v1.5");
        
        const lastMessageText = lastMessage.parts?.find((p) => p.type === "text")?.text || "";
        const embeddingResult = await embeddingModel.doEmbed({
          values: [lastMessageText],
        });

        // 4. Query the Vectorize index
        // response.data is an array of embedding vectors (number[])
        const query = embeddingResult.embeddings[0];
        const vectorResponse = await this.env.VECTORIZE.query(query, {
          topK: 3,
          returnMetadata: true,
        });

        // 5. Get the text from the matching vectors
        contextText = vectorResponse.matches
          .map((match) => match.metadata?.text)
          .filter(Boolean)
          .join("\n\n");
      } catch (e) {
        console.error("Vectorize query failed:", e);
        contextText = "Error: Could not retrieve context.";
      }
    }

    // 6. Create the final system prompt with the RAG context
    const systemPrompt: CoreMessage = {
      role: "system",
      content: `You are a helpful assistant. Answer the user's question using the chat history and the following context.

CONTEXT: ${contextText}

---`,
    };

    // 7. Call the LLM with the new system prompt and history
    const workersAI = createWorkersAI({ binding: this.env.AI });
    const model = workersAI("@cf/meta/llama-3.3-70b-instruct-fp8-fast");

    // Convert messages to the format expected by streamText
    const convertedMessages: CoreMessage[] = [
      systemPrompt,
      ...this.messages.map((msg) => ({
        role: msg.role,
        content: msg.parts?.find((p) => p.type === "text")?.text || "",
      })),
    ];

    const result = streamText({
      model,
      messages: convertedMessages,
      onFinish,
    });

    return result.toDataStreamResponse();
  }
}

// Export default handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
