const BaseAIStrategy = require('./BaseStrategy');

class SummarizeStrategy extends BaseAIStrategy {
  constructor(groq) {
    super(groq);
    this.maxTokens = 500;
  }

  buildSystemPrompt() {
    return 'You are a meeting summarizer. Return a concise, structured summary.';
  }

  buildUserPrompt({ text, type }) {
    if (type === 'meeting_notes') {
      return `Summarize these meeting notes into:
1. Key decisions made
2. Action items (with owner if mentioned)  
3. Main discussion points

Notes: ${text}`;
    } else if (type === 'chat_thread') {
      return `Summarize this chat conversation into key points and any decisions made:
${text}`;
    } else if (type === 'document') {
      return `Provide a concise summary of this document:
${text}`;
    }
    return `Summarize this text: ${text}`;
  }

  parseResponse(content) {
    // Determine type from input (store in instance or calculate wordcount)
    return { summary: content, wordCount: content.split(' ').length };
  }
  
  async execute(input) {
    this.currentInput = input;
    const result = await super.execute(input);
    result.type = input.type;
    return result;
  }
}

module.exports = SummarizeStrategy;
