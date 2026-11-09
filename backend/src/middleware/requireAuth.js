import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token"
    });
  }

  /*
    a valid signature is no longer enough. The account must still exist,
    and the token must carry the account's current tokenVersion. Resetting the
    password bumps that number, so every older token stops working.
    (Tokens issued before Batch C have no "ver" and count as version 0.)
  */
  try {
    const user = await User.findById(decoded.id).select("tokenVersion role userCode");

    if (!user || (decoded.ver || 0) !== (user.tokenVersion || 0)) {
      return res.status(401).json({
        message: "Your session has ended. Please log in again."
      });
    }

    req.user = {
      ...decoded,
      role: user.role,
      userCode: user.userCode || decoded.userCode
    };

    next();
  } catch (err) {
    // a database problem is a server error, not a bad login
    next(err);
  }
}

/*
  server-side role check.
  Use AFTER requireAuth, e.g. router.get("/", requireAuth, requireRole("trader"), handler)
  The role comes from the database, so it cannot be faked from the browser.
*/
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You are not allowed to do this"
      });
    }
    next();
  };
}
