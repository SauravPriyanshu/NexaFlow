const { executeAI } = require('./ai.service');
const ApiResponse = require('../../shared/utils/ApiResponse');

async function runAI(req, res, next) {
  try {
    const { type, input } = req.body;
    const result = await executeAI(type, input, req.user._id);
    res.json(new ApiResponse(200, result, 'AI request completed'));
  } catch (err) {
    next(err);
  }
}

module.exports = { runAI };
