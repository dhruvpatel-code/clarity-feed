const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Rate limiting
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
let lastRequestTime = 0;

async function respectRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => 
      setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
}

// Analyze single feedback
async function analyzeFeedback(feedbackText) {
  try {
    await respectRateLimit();

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Analyze this customer feedback and provide a structured response.

Feedback: "${feedbackText}"

Provide your analysis in the following JSON format:
{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "sentimentScore": number between -1 and 1 (negative to positive),
  "category": "product" | "service" | "pricing" | "support" | "delivery" | "other",
  "themes": ["theme1", "theme2", "theme3"],
  "urgency": "low" | "medium" | "high" | "critical",
  "keyPoints": ["point1", "point2", "point3"],
  "reasoning": "brief explanation of your analysis"
}

Guidelines:
- sentiment: Overall emotional tone
- sentimentScore: -1 (very negative) to 1 (very positive), 0 is neutral
- category: Primary topic of feedback
- themes: 2-4 specific topics mentioned (e.g., "quality", "shipping speed", "customer service")
- urgency: How quickly this needs attention (critical = immediate action needed)
- keyPoints: 2-4 main takeaways
- reasoning: 1-2 sentences explaining the analysis

Be specific and actionable in your analysis.`
        }
      ]
    });

    // Extract the response text
    const responseText = message.content[0].text;
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Claude response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (!analysis.sentiment || !analysis.category || !analysis.urgency) {
      throw new Error('Invalid analysis response from Claude');
    }
    
    return analysis;

  } catch (error) {
    console.error('Claude API Error:', error);
    throw new Error('Failed to analyze feedback with AI');
  }
}

// Batch analyze multiple feedback items
async function batchAnalyzeFeedback(feedbackArray) {
  const results = [];
  
  console.log(`Starting batch analysis of ${feedbackArray.length} feedback items...`);
  
  for (let i = 0; i < feedbackArray.length; i++) {
    const feedback = feedbackArray[i];
    
    try {
      console.log(`Analyzing feedback ${i + 1}/${feedbackArray.length}...`);
      const analysis = await analyzeFeedback(feedback.original_text);
      
      results.push({
        feedbackId: feedback.id,
        analysis,
        success: true
      });
      
    } catch (error) {
      console.error(`Failed to analyze feedback ${feedback.id}:`, error.message);
      results.push({
        feedbackId: feedback.id,
        error: error.message,
        success: false
      });
    }
  }
  
  console.log(`Batch analysis complete. Success: ${results.filter(r => r.success).length}/${results.length}`);
  
  return results;
}

module.exports = {
  analyzeFeedback,
  batchAnalyzeFeedback
};