import { Chat } from "./server"; // Import the DO class
export { Chat }; // Re-export it for wrangler

// This file is a simple 'hello world' test for the AI binding.
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    try {
      // Call the simplest, fastest text model
      const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        prompt: "What is 2+2?",
      });

      return Response.json(response);
    } catch (e: any) {
      return Response.json(
        { success: false, error: e.message, stack: e.stack },
        { status: 500 }
      );
    }
  },
};
