import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  conversationHistory?: ChatMessage[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, conversationHistory = [] }: RequestBody = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid message' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          response: "I'm currently unavailable as the OpenAI API key is not configured. However, I can still help guide you through the platform! Here are some things I can assist with:\n\n1. Understanding scholarship eligibility criteria\n2. Tips for writing strong scholarship essays\n3. Document requirements for applications\n4. Timeline planning for scholarship applications\n5. Navigating the SmartScholar platform\n\nTo enable full AI capabilities, please configure the OPENAI_API_KEY environment variable in your Supabase project settings.\n\nWhat would you like help with?"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const systemPrompt = `You are an AI assistant specialized in financial aid and scholarship management. Your role is to help students:

1. Understand scholarship eligibility requirements
2. Find scholarships that match their profile
3. Prepare strong scholarship applications
4. Navigate the application process
5. Meet deadlines and requirements
6. Write compelling essays and personal statements

Be helpful, encouraging, and provide specific, actionable advice. Keep responses concise but informative. If asked about specific scholarships on the platform, provide general guidance as you don't have direct access to the database.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10),
      { role: 'user', content: message },
    ];

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      
      return new Response(
        JSON.stringify({
          response: "I apologize, but I'm having trouble processing your request right now. This might be due to API configuration issues. Please try again later or contact support if the problem persists."
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await openaiResponse.json();
    const aiResponse = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    
    return new Response(
      JSON.stringify({
        response: "I apologize, but I encountered an error processing your request. Please try again."
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});