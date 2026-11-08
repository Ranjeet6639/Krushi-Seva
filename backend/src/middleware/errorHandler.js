/*
   one place that turns errors into responses.
  - problems caused by the request (bad JSON, bad upload, duplicate value...) -> 4xx with a clear message
  - unexpected server errors -> logged on the server, but the client only sees a generic message
    (before, error.message was sent to the browser and could leak internals)
*/

export function notFound(_req, res) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = err.statusCode || err.status || 500;
  let message = err.message;

  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON in request body";
  } else if (err.type === "entity.too.large") {
    status = 413;
    message = "Request body is too large";
  } else if (err.name === "MulterError") {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller" : "Image upload failed";
  } else if (err.code === 11000) {
    status = 409;
    message = "That value is already in use (for example an email or mobile number)";
  } else if (err.name === "ValidationError" && err.errors) {
    status = 400;
    message = "Some of the data you sent is invalid";
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid value in request";
  }

  if (status >= 500) {
    // full details stay in the server log only
    console.error(`[${req.method} ${req.originalUrl}]`, err);
    message = "Internal server error";
  }

  res.status(status).json({ message });
}
