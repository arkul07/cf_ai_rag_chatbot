import {
  AIChatAgent,
  type CoreMessage,
} from "agents/ai-chat-agent";

export class Chat extends AIChatAgent {
  async onChatMessage(
    this: this,
    { messages, tools, tool_choice, functions, function_call, ...rest }
  ) {
    // We don't need to import or create 'ai'.
    // 'this.env.AI' is the native AI client.
    let contextText = "";

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "user") {
      try {
        // 1. Create embedding using the native env.AI.run()
        const embeddingResponse = await this.env.AI.run(
          "@cf/baai/bge-large-en-v1.5",
          { text: [lastMessage.content] }
        );
        const embedding = embeddingResponse.data[0];
        // 2. Query Vectorize
        const vectorResponse = await this.env.VECTORIZE.query(embedding, {
          topK: 3,
          returnMetadata: true,
        });
        // 3. Get context text
        contextText = vectorResponse.matches
          .map((match) => match.metadata?.text)
          .join("\n\n");
      } catch (e) {
        console.error("Vectorize query failed:", e);
        contextText = "Error: Could not retrieve context.";
      }
    }
    const systemPrompt = {
      role: "system",
      content: `You are a helpful assistant. Answer the user's question using the chat history and the following context.
CONTEXT: ${contextText}
---`,
    } as CoreMessage;

    // 4. Call LLM using the native env.AI.run()
    return this.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: [systemPrompt, ...messages],
      stream: true,
    });
  }
}

export default Chat;
