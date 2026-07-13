const BaseAIStrategy = require('./BaseStrategy');

class GenerateDocsStrategy extends BaseAIStrategy {
  constructor(groq) {
    super(groq);
    this.maxTokens = 1500;
  }

  buildUserPrompt({ projectName, description, features = [], techStack = [] }) {
    return `Generate professional project documentation for:
Project: ${projectName}
Description: ${description}
Key features: ${features.join(', ')}
Tech stack: ${techStack.join(', ')}

Include: Overview, Features, Technical Architecture, Getting Started, API Overview sections.
Format in clean Markdown.`;
  }

  parseResponse(content) {
    return { documentation: content, format: 'markdown' };
  }
}

module.exports = GenerateDocsStrategy;
