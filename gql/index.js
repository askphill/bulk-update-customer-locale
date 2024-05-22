const RUN_BULK_MUTATION = `
  mutation runBulkMutation($stagedUploadPath: String!) {
    bulkOperationRunMutation(mutation: "mutation call($input: CustomerInput!) { customerUpdate(input: $input) { customer { id email locale } userErrors { message field } } }", stagedUploadPath: $stagedUploadPath) {
      bulkOperation {
        id
        url
        status
      }
      userErrors {
        message
        field
      }
    }
  }
`;

const CREATE_WEBHOOK_SUBSCRIPTION = `
  mutation createWebhookSubscription($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
    webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
      userErrors {
        field
        message
      }
      webhookSubscription {
        id
      }
    }
  }
`;

const CREATE_STAGED_UPLOADS = `
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      userErrors {
        field,
        message
      },
      stagedTargets {
        url,
        resourceUrl,
        parameters {
          name,
          value
        }
      }
    }
  }
`;

const GET_BULK_OPERATION_BY_ID = `
  query getBulkOperationById ($id: ID!){
    node(id: $id) {
      ... on BulkOperation {
        url
        partialDataUrl
      }
    }
  }
`;

const GET_CURRENT_BULK_OPERATION = `
  query getCurrentBulkOperation($type: BulkOperationType!) {
    currentBulkOperation(type: $type) {
      id
      status
      errorCode
      createdAt
      completedAt
      objectCount
      fileSize
      url
      partialDataUrl
    }
  }
`;

module.exports = {
  RUN_BULK_MUTATION,
  CREATE_WEBHOOK_SUBSCRIPTION,
  CREATE_STAGED_UPLOADS,
  GET_BULK_OPERATION_BY_ID,
  GET_CURRENT_BULK_OPERATION,
}
