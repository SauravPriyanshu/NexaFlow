const groq = require('../../config/groq');
const ApiError = require('../../shared/utils/ApiError');

const SummarizeStrategy = require('./strategies/SummarizeStrategy');
const GenerateDocsStrategy = require('./strategies/GenerateDocsStrategy');
const ExplainCodeStrategy = require('./strategies/ExplainCodeStrategy');
const ImproveTextStrategy = require('./strategies/ImproveTextStrategy');
const ConvertToTasksStrategy = require('./strategies/ConvertToTasksStrategy');
const GenerateReadmeStrategy = require('./strategies/GenerateReadmeStrategy');

const strategyMap = {
  summarize: new SummarizeStrategy(groq),
  generate: new GenerateDocsStrategy(groq),
  explain: new ExplainCodeStrategy(groq),
  improve: new ImproveTextStrategy(groq),
  convert: new ConvertToTasksStrategy(groq),
  // generate_readme: new GenerateReadmeStrategy(groq), // Not used by frontend
};

async function executeAI(type, input, userId) {
  const strategy = strategyMap[type];
  if (!strategy) throw new ApiError(400, `Unknown AI action: ${type}`);
  
  try {
    const result = await strategy.execute(input);
    return {
      ...result,
      action: type,
      tokensUsed: null, // populate from response.usage if needed
      generatedAt: new Date().toISOString()
    };
  } catch (err) {
    if (err.status === 429) throw new ApiError(429, 'AI rate limit reached. Try again shortly.');
    if (err.status === 401) throw new ApiError(500, 'AI service configuration error.');
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, `AI request failed: ${err.message}`);
  }
}

module.exports = { executeAI };
