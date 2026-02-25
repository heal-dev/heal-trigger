import * as core from "@actions/core";
import * as github from "@actions/github";
import { buildGreeting } from "./utils.js";

/**
 * Main entry point for the action.
 * @returns {Promise<void>}
 */
async function run() {
  try {
    const whoToGreet = core.getInput("who-to-greet");
    const token = core.getInput("github-token");

    core.debug(`Input who-to-greet: ${whoToGreet}`);

    const greeting = buildGreeting(whoToGreet);
    core.info(greeting);

    if (token) {
      const octokit = github.getOctokit(token);
      const { context } = github;
      core.debug(`Running in repo: ${context.repo.owner}/${context.repo.repo}`);
      core.debug(`Octokit client created: ${typeof octokit}`);
    }

    core.setOutput("greeting", greeting);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
