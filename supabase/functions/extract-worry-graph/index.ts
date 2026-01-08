import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are a cognitive analysis AI that helps people understand their anxiety and worries. 
Given a transcript of someone expressing their thoughts and worries, extract a structured "worry graph" that identifies:

1. Individual worries/thoughts as nodes
2. Causal relationships between them as edges
3. Classification of each node as either "root" (core worry), "noise" (tangential concern), or "linked" (directly connected to root)

Return your analysis as a JSON object with this exact structure:
{
  "nodes": [
    {
      "id": "unique_id",
      "label": "Short description of the worry (max 10 words)",
      "type": "root" | "noise" | "linked",
      "fullText": "Longer explanation of this worry"
    }
  ],
  "edges": [
    {
      "from": "source_node_id",
      "to": "target_node_id",
      "label": "Optional relationship description"
    }
  ]
}

Guidelines:
- Identify 3-7 distinct nodes
- There should be exactly 1 root node (the core underlying worry)
- Mark tangential or less important concerns as "noise"
- Connected worries that stem from or lead to the root should be "linked"
- Create edges to show how worries relate to each other
- Be compassionate and non-judgmental in your labels`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return new Response(
        JSON.stringify({ error: "No transcript provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please analyze this brain dump transcript and extract the worry graph:\n\n"${transcript}"` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_worry_graph",
              description: "Extract structured worry graph from transcript",
              parameters: {
                type: "object",
                properties: {
                  nodes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        label: { type: "string" },
                        type: { type: "string", enum: ["root", "noise", "linked"] },
                        fullText: { type: "string" }
                      },
                      required: ["id", "label", "type", "fullText"],
                      additionalProperties: false
                    }
                  },
                  edges: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        from: { type: "string" },
                        to: { type: "string" },
                        label: { type: "string" }
                      },
                      required: ["from", "to"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["nodes", "edges"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_worry_graph" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI processing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Failed to extract worry graph" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const worryGraph = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(worryGraph), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Extract worry graph error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
