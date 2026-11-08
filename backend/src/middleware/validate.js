/*
   runs a Zod schema on req.body.
  - on success: req.body is replaced by the cleaned data (unknown fields removed)
  - on failure: responds 400 with the first problem in plain words
*/
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue.path.join(".") || "request";
      const message =
        !issue.message || issue.message.startsWith("Invalid input")
          ? `${field} is missing or invalid`
          : issue.message;

      return res.status(400).json({ message });
    }

    req.body = result.data;
    next();
  };
}
