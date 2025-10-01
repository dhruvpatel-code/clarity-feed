const Anthropic = require('@anthropic-ai/sdk');

// Check if API key exists
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ CRITICAL: ANTHROPIC_API_KEY not set in environment variables!');
  console.error('Please add ANTHROPIC_API_KEY to your .env file');
}

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

    console.log('Calling Claude API...');

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

    console.log('✅ Claude API response received');

    // Extract the response text
    const responseText = message.content[0].text;
    console.log('Raw response:', responseText);
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in response');
      throw new Error('Failed to extract JSON from Claude response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    console.log('✅ Parsed analysis:', analysis);
    
    // Validate required fields
    if (!analysis.sentiment || !analysis.category || !analysis.urgency) {
      console.error('❌ Missing required fields in analysis');
      throw new Error('Invalid analysis response from Claude');
    }
    
    return analysis;

  } catch (error) {
    console.error('❌ Claude API Error Details:');
    console.error('- Error type:', error.constructor.name);
    console.error('- Error message:', error.message);
    console.error('- Status:', error.status);
    
    if (error.status === 401) {
      throw new Error('Invalid API key - check your ANTHROPIC_API_KEY in .env');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded or insufficient credits');
    } else if (error.message.includes('API key')) {
      throw new Error('API key issue - verify ANTHROPIC_API_KEY is set correctly');
    }
    
    throw new Error(`Failed to analyze feedback with AI: ${error.message}`);
  }
}

// Batch analyze multiple feedback items
async function batchAnalyzeFeedback(feedbackArray) {
  const results = [];
  
  console.log(`Starting batch analysis of ${feedbackArray.length} feedback items...`);
  
  for (let i = 0; i < feedbackArray.length; i++) {
    const feedback = feedbackArray[i];
    
    try {
      console.log(`\n📊 Analyzing feedback ${i + 1}/${feedbackArray.length}...`);
      console.log(`Text preview: ${feedback.original_text.substring(0, 50)}...`);
      
      const analysis = await analyzeFeedback(feedback.original_text);
      
      results.push({
        feedbackId: feedback.id,
        analysis,
        success: true
      });
      
      console.log(`✅ Success for feedback ${i + 1}`);
      
    } catch (error) {
      console.error(`❌ Failed feedback ${i + 1}:`, error.message);
      results.push({
        feedbackId: feedback.id,
        error: error.message,
        success: false
      });
    }
  }
  
  console.log(`\n📈 Batch analysis complete. Success: ${results.filter(r => r.success).length}/${results.length}`);
  
  return results;
}

// Generate executive summary for a project
async function generateExecutiveSummary(analyses) {
  try {
    await respectRateLimit();

    if (!analyses || analyses.length === 0) {
      return {
        summary: 'No feedback has been analyzed yet.',
        keyFindings: [],
        recommendations: ['Add and analyze feedback to get insights'],
        positiveHighlights: [],
        areasForImprovement: []
      };
    }

    // Prepare data
    const sentimentCounts = {
      positive: 0,
      negative: 0,
      neutral: 0,
      mixed: 0
    };
    
    const allThemes = [];
    const urgentIssues = [];
    const categories = {};
    
    analyses.forEach(item => {
      sentimentCounts[item.sentiment]++;
      if (item.themes && Array.isArray(item.themes)) {
        allThemes.push(...item.themes);
      }
      if (item.urgency === 'high' || item.urgency === 'critical') {
        urgentIssues.push({
          text: item.original_text,
          urgency: item.urgency,
          sentiment: item.sentiment
        });
      }
      const cat = item.category || 'other';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    
    // Count theme frequencies
    const themeCounts = {};
    allThemes.forEach(theme => {
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    });
    
    const topThemes = Object.entries(themeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);

    const topCategories = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);

    console.log('Generating executive summary...');

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `You are a business analyst creating an executive summary of customer feedback analysis.

Data Summary:
- Total feedback items: ${analyses.length}
- Sentiment: ${sentimentCounts.positive} positive, ${sentimentCounts.negative} negative, ${sentimentCounts.neutral} neutral, ${sentimentCounts.mixed} mixed
- Top themes: ${topThemes.join(', ')}
- Top categories: ${topCategories.join(', ')}
- Urgent issues: ${urgentIssues.length}

Generate a comprehensive executive summary in JSON format:
{
  "summary": "2-3 paragraph executive summary covering overall sentiment, key findings, and main concerns",
  "keyFindings": ["finding 1", "finding 2", "finding 3", "finding 4"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3", "actionable recommendation 4", "actionable recommendation 5"],
  "positiveHighlights": ["positive aspect 1", "positive aspect 2", "positive aspect 3"],
  "areasForImprovement": ["area 1", "area 2", "area 3"]
}

Guidelines:
- Be specific and data-driven
- Focus on actionable insights
- Highlight both strengths and weaknesses
- Use business-appropriate language
- Make recommendations concrete and implementable`
        }
      ]
    });

    const responseText = message.content[0].text;
    console.log('Executive summary response received');
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Claude response');
    }
    
    const summary = JSON.parse(jsonMatch[0]);
    
    return {
      summary: summary.summary,
      keyFindings: summary.keyFindings || [],
      recommendations: summary.recommendations || [],
      positiveHighlights: summary.positiveHighlights || [],
      areasForImprovement: summary.areasForImprovement || []
    };

  } catch (error) {
    console.error('Executive summary generation error:', error);
    throw new Error(`Failed to generate executive summary: ${error.message}`);
  }
}

module.exports = {
  analyzeFeedback,
  batchAnalyzeFeedback,
  generateExecutiveSummary
};