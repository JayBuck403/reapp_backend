// middlewares/paginate.js
function paginate(req, res, next) {
  // Set a default limit if none is provided in the query
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = parseInt(req.query.startIndex, 10) || 0;

  req.pagination = {
    limit,
    startIndex,
  };

  next();
}

module.exports = paginate;
