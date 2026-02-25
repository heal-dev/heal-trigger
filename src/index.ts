import * as core from '@actions/core';
import type { ExternalExecutionTriggeredResponse, TriggerExecutionRequest } from './types';
import { globToRegex } from './utils';

async function run(): Promise<void> {
  try {
    const apiToken = core.getInput('api-token', { required: true });
    const backendUrl = core.getInput('backend-url') || 'https://backend.heal.dev';
    const team = core.getInput('team');
    const feature = core.getInput('feature');
    const testCase = core.getInput('test-case');

    const body: TriggerExecutionRequest = {};
    if (team) body.teamSlugRegex = globToRegex(team);
    if (feature) body.featureSlugRegex = globToRegex(feature);
    if (testCase) body.testCaseSlugRegex = globToRegex(testCase);

    const response = await fetch(`${backendUrl}/api/v1/executions/trigger`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Heal API error ${response.status}: ${text}`);
    }

    const data = (await response.json()) as ExternalExecutionTriggeredResponse;
    core.info(`Execution triggered: ${data.healExecutionUrl}`);
    core.setOutput('url', data.healExecutionUrl);
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();
