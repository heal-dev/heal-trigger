export interface TriggerExecutionRequest {
  teamSlugRegex?: string;
  featureSlugRegex?: string;
  testCaseSlugRegex?: string;
}

export interface ExternalExecutionTriggeredResponse {
  executionId: string;
  healExecutionUrl: string;
}
