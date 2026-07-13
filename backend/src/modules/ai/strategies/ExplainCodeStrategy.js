const BaseAIStrategy = require('./BaseStrategy');

class ExplainCodeStrategy extends BaseAIStrategy {
  constructor(groq) {
    super(groq);
    this.maxTokens = 800;
  }

  buildSystemPrompt() {
    return 'You are a senior software engineer. Explain code clearly for developers of all levels.';
  }

  buildUserPrompt({ code, language, question }) {
    return `Explain this ${language} code${question ? `. Specifically: ${question}` : ''}:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. What this code does (plain English)
2. How it works step by step
3. Any potential issues or improvements`;
  }

  parseResponse(content) {
    return { explanation: content };
  }
}

module.exports = ExplainCodeStrategy;
