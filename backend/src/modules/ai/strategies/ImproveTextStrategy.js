const BaseAIStrategy = require('./BaseStrategy');

class ImproveTextStrategy extends BaseAIStrategy {
  constructor(groq) {
    super(groq);
    this.maxTokens = 600;
  }

  buildUserPrompt({ text, type }) {
    return `Improve this ${type}. Fix grammar, clarity, and professionalism.
Keep the same meaning. Return ONLY the improved text, no explanations.

Original: ${text}`;
  }

  async execute(input) {
    this.currentInput = input;
    const result = await super.execute(input);
    result.original = input.text;
    return result;
  }

  parseResponse(content) {
    return { improved: content };
  }
}

module.exports = ImproveTextStrategy;
