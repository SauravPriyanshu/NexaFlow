const { globalSearch } = require('./search.service');
const ApiResponse = require('../../shared/utils/ApiResponse');

async function search(req, res, next) {
  try {
    const { q, types, limit } = req.query;
    const { orgId } = req.params;
    const results = await globalSearch(
      q,
      req.user._id,
      orgId,
      { types: types ? types.split(',') : undefined, limit: parseInt(limit) || 5 }
    );
    res.json(new ApiResponse(200, results, 'Search completed'));
  } catch (err) {
    next(err);
  }
}

module.exports = { search };
