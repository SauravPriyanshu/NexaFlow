const ApiError = require('../../shared/utils/ApiError');

const validateAI = (req, res, next) => {
  const { type, input } = req.body;
  
  if (!['summarize', 'generate', 'explain', 'improve', 'convert'].includes(type)) {
    return next(new ApiError(400, 'Validation failed: Invalid AI action type'));
  }
  
  if (!input || typeof input !== 'object') {
    return next(new ApiError(400, 'Validation failed: Input must be an object'));
  }

  if (type === 'summarize' && !input.text) {
    return next(new ApiError(400, 'Validation failed: Input text required'));
  }
  
  if (type === 'convert' && !input.content) {
    return next(new ApiError(400, 'Validation failed: Content required'));
  }
  
  if (type === 'explain') {
    if (!input.code) {
      return next(new ApiError(400, 'Validation failed: Code required'));
    }
    if (typeof input.code === 'string' && input.code.length > 8000) {
      return next(new ApiError(400, 'Validation failed: Code max 8000 chars'));
    }
  }
  
  if (type === 'improve' && !input.text) {
    return next(new ApiError(400, 'Validation failed: Text required'));
  }
  
  if (type === 'generate' && !Array.isArray(input.features)) {
    return next(new ApiError(400, 'Validation failed: Features array required'));
  }

  next();
};

module.exports = { validateAI };
