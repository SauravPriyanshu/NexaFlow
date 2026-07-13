class BaseAIStrategy {
  constructor(groq) {
    this.groq = groq;
    this.model = 'llama-3.1-8b-instant'; // cost-efficient and fast for portfolio project
    this.maxTokens = 1000;
  }

  buildSystemPrompt() {
    return 'You are NexaFlow AI, an intelligent assistant for project management teams.';
  }

  buildUserPrompt(input) {
    throw new Error('buildUserPrompt must be implemented by subclass');
  }

  parseResponse(content) {
    return { result: content };
  }

  async execute(input) {
    const response = await this.groq.chat.completions.create({
      model: this.model,
      max_tokens: this.maxTokens,
      messages: [
        { role: 'system', content: this.buildSystemPrompt() },
        { role: 'user', content: this.buildUserPrompt(input) }
      ]
    });
    const content = response.choices[0].message.content;
    return this.parseResponse(content);
  }
}

module.exports = BaseAIStrategy;
