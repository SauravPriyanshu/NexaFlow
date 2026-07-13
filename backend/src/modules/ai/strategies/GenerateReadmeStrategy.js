const BaseAIStrategy = require('./BaseStrategy');

class GenerateReadmeStrategy extends BaseAIStrategy {
  constructor(groq) {
    super(groq);
    this.maxTokens = 2000;
  }

  buildUserPrompt({ projectName, description, techStack = [], features = [], setupSteps }) {
    return `Generate a professional GitHub README.md for:
Project: ${projectName}
Description: ${description}
Tech: ${techStack.join(', ')}
Features: ${features.join(', ')}
Setup: ${setupSteps || 'standard npm install and npm start'}

Include badges, clear sections, and a features list.
Format in Markdown.`;
  }

  parseResponse(content) {
    return { readme: content, format: 'markdown' };
  }
}

module.exports = GenerateReadmeStrategy;
