/*
 * paginate - Middleware function to paginated generated results from server
 *
 * @model: Mongodb model parameter
 * Return: req, res, next
 */


module.exports = function paginate (model) {
  return (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const start = (page - 1) * limit;
    const end = page * limit;
    const results = {};

    if (end < model.count()) {
      results.next = {
        page: page + 1,
	limit: limit
      }
    }

    if (start > 0) {
      results.previous = {
        page: page - 1,
	limit: limit
      }
    }
    results.results = model.find().limit(limit).skip(start);

    res.paginatedResults = results;
    next();
  }
}
