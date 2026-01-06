import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ComplaintData {
  title: string;
  description: string;
  category: string;
  type: 'civic' | 'anonymous';
}

interface AIAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  fakeProbability: number;
  credibilityScore: number;
  keywords: string[];
  suggestedDepartment: string;
  urgencyScore: number;
  summary: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, category, type }: ComplaintData = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI analyst for a civic complaint management system called CivicGuard. Your job is to analyze complaints and provide structured analysis.

For each complaint, you must determine:
1. Sentiment: Whether the tone is positive, neutral, or negative
2. Fake Probability: Likelihood (0-100) that this complaint is fake/spam based on:
   - Vague descriptions
   - Unrealistic claims
   - Copy-pasted or generic text
   - Inconsistent details
   - Excessive emotional language without specifics
3. Credibility Score: Overall credibility (0-100) considering specificity, coherence, and realistic details
4. Keywords: 3-5 relevant keywords/tags for the complaint
5. Suggested Department: Which government department should handle this
6. Urgency Score: How urgent this issue is (1-10)
7. Summary: A brief one-sentence summary of the complaint

Be fair but vigilant. Real civic complaints tend to have specific locations, observable details, and reasonable concerns.`;

    const userPrompt = `Analyze this ${type} complaint:

Category: ${category}
Title: ${title}
Description: ${description}

Provide your analysis.`;

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
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_complaint",
              description: "Provide structured analysis of a civic complaint",
              parameters: {
                type: "object",
                properties: {
                  sentiment: { 
                    type: "string", 
                    enum: ["positive", "neutral", "negative"],
                    description: "Overall sentiment of the complaint"
                  },
                  fakeProbability: { 
                    type: "number",
                    description: "Likelihood (0-100) that this is a fake or spam complaint"
                  },
                  credibilityScore: { 
                    type: "number",
                    description: "Overall credibility score (0-100)"
                  },
                  keywords: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "3-5 relevant keywords/tags"
                  },
                  suggestedDepartment: { 
                    type: "string",
                    description: "Recommended government department to handle this"
                  },
                  urgencyScore: { 
                    type: "number",
                    description: "Urgency level from 1-10"
                  },
                  summary: { 
                    type: "string",
                    description: "Brief one-sentence summary"
                  }
                },
                required: ["sentiment", "fakeProbability", "credibilityScore", "keywords", "suggestedDepartment", "urgencyScore", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_complaint" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "analyze_complaint") {
      throw new Error("Unexpected AI response format");
    }

    const analysis: AIAnalysis = JSON.parse(toolCall.function.arguments);
    
    // Ensure values are within valid ranges
    analysis.fakeProbability = Math.max(0, Math.min(100, analysis.fakeProbability));
    analysis.credibilityScore = Math.max(0, Math.min(100, analysis.credibilityScore));
    analysis.urgencyScore = Math.max(1, Math.min(10, analysis.urgencyScore));

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error analyzing complaint:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to analyze complaint" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
