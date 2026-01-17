import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SentimentResult {
  sentiment: "positive" | "neutral" | "negative";
  confidenceScore: number;
}

interface AnalyzeRequest {
  posts: Array<{
    id: string;
    content: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { posts } = (await req.json()) as AnalyzeRequest;
    
    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return new Response(
        JSON.stringify({ error: "Posts array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing sentiment for ${posts.length} posts`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare the prompt for batch sentiment analysis
    const postsText = posts.map((p, i) => `[${i + 1}] "${p.content}"`).join("\n");
    
    const systemPrompt = `You are a sentiment analysis expert. Analyze the sentiment of social media posts and classify each as positive, neutral, or negative. Be accurate and consider context, sarcasm, and subtle emotional cues.`;
    
    const userPrompt = `Analyze the sentiment of these ${posts.length} social media posts. For each post, determine if it's positive, neutral, or negative, and provide a confidence score between 0.7 and 1.0.

Posts to analyze:
${postsText}

Return your analysis using the analyze_sentiment function.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_sentiment",
              description: "Return sentiment analysis results for each post",
              parameters: {
                type: "object",
                properties: {
                  results: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        postIndex: { type: "number", description: "1-based index of the post" },
                        sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
                        confidenceScore: { type: "number", description: "Confidence between 0.7 and 1.0" },
                      },
                      required: ["postIndex", "sentiment", "confidenceScore"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["results"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_sentiment" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received:", JSON.stringify(data).slice(0, 200));

    // Extract the tool call results
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "analyze_sentiment") {
      console.error("Unexpected response format:", JSON.stringify(data));
      throw new Error("Unexpected response format from AI");
    }

    const analysisResults = JSON.parse(toolCall.function.arguments);
    
    // Map results back to post IDs
    const sentimentMap: Record<string, SentimentResult> = {};
    for (const result of analysisResults.results) {
      const postIndex = result.postIndex - 1; // Convert to 0-based
      if (postIndex >= 0 && postIndex < posts.length) {
        sentimentMap[posts[postIndex].id] = {
          sentiment: result.sentiment,
          confidenceScore: Math.min(1, Math.max(0.7, result.confidenceScore)),
        };
      }
    }

    console.log(`Successfully analyzed ${Object.keys(sentimentMap).length} posts`);

    return new Response(
      JSON.stringify({ sentiments: sentimentMap }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
