const BaseAIStrategy = require('./BaseStrategy');
const ApiError = require('../../../shared/utils/ApiError');

class ConvertToTasksStrategy extends BaseAIStrategy {
  constructor(groq) {
    super(groq);
    this.maxTokens = 800;
  }

  buildSystemPrompt() {
    return 'You are a project manager AI. Convert content into actionable tasks.\nAlways respond with valid JSON only. No markdown, no explanation.';
  }

  buildUserPrompt({ content, type }) {
    return `Extract actionable tasks from this ${type}:

${content}

Return JSON array only:
[{ "title": "...", "description": "...", "priority": "low|medium|high|urgent", "assigneeName": "..." or null }]`;
  }

  parseResponse(content) {
    try {
      const clean = content.replace(/```json|```/g, '').trim();
      const tasks = JSON.parse(clean);
      return { tasks, count: tasks.length };
    } catch (err) {
      throw new ApiError(500, 'AI returned invalid task format. Try again.');
    }
  }
}

module.exports = ConvertToTasksStrategy;
