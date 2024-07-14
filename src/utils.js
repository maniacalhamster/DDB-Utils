// @ts-check

/**
 * @param {import("@aws-sdk/client-dynamodb").ProvisionedThroughputDescription | undefined} desc
 * @returns {import("@aws-sdk/client-dynamodb").ProvisionedThroughput | undefined}
 */
function convertProvisionedThroughputDesc(desc) {
  const { ReadCapacityUnits, WriteCapacityUnits } = desc ?? {};

  return desc
    ? {
        ReadCapacityUnits,
        WriteCapacityUnits,
      }
    : undefined;
}

/**
 * @param {import("@aws-sdk/client-dynamodb").SSEDescription | undefined} desc
 * @return {import("@aws-sdk/client-dynamodb").SSESpecification | undefined}
 */
function convertSSEDescription(desc) {
  const { Status, KMSMasterKeyArn, SSEType } = desc ?? {};

  return desc
    ? {
        Enabled: Status === "ENABLED",
        KMSMasterKeyId: KMSMasterKeyArn,
        SSEType: SSEType,
      }
    : undefined;
}

/**
 * @param {import("@aws-sdk/client-dynamodb").GlobalSecondaryIndexDescription[] | undefined} indexes
 * @returns {import("@aws-sdk/client-dynamodb").GlobalSecondaryIndex[] | undefined}
 */
function convertGsiDesc(indexes) {
  return indexes?.map(
    ({
      IndexName,
      KeySchema,
      Projection,
      ProvisionedThroughput,
      OnDemandThroughput,
    }) => ({
      IndexName,
      KeySchema,
      Projection,
      ProvisionedThroughput: convertProvisionedThroughputDesc(
        ProvisionedThroughput
      ),
      OnDemandThroughput,
    })
  );
}

/**
 * @param {import("@aws-sdk/client-dynamodb").LocalSecondaryIndexDescription[] | undefined} indexes
 * @returns {import("@aws-sdk/client-dynamodb").LocalSecondaryIndex[] | undefined}
 */
function convertLsiDesc(indexes) {
  return indexes?.map(({ IndexName, KeySchema, Projection }) => ({
    IndexName,
    KeySchema,
    Projection,
  }));
}

module.exports = {
  convertGsiDesc,
  convertLsiDesc,
  convertProvisionedThroughputDesc,
  convertSSEDescription,
};
