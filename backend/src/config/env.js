// import this FIRST in server.js. It loads .env, checks the settings,
// and stops the server with a clear list of problems instead of failing later.
import "dotenv/config";
import { checkEnv } from "./validateEnv.js";
import { logger } from "../utils/logger.js";

const { problems, warnings } = checkEnv(process.env);

warnings.forEach((warning) => logger.warn(`Config warning: ${warning}`));

if (problems.length > 0) {
  problems.forEach((problem) => logger.error(`Config error: ${problem}`));
  logger.error("Server not started. Fix the settings above (locally in .env, on Render under Environment).");
  process.exit(1);
}
