// @ts-check

const { CreateTableCommand } = require("@aws-sdk/client-dynamodb");

const { client } = require("./config");
const { DescribeTables } = require("./DescribeTables");
const {
  convertGsiDesc,
  convertLsiDesc,
  convertProvisionedThroughputDesc,
  convertSSEDescription,
} = require("./utils");

/**
 * Create _dev dup, using a given TableDescription
 *
 * @param {import("@aws-sdk/client-dynamodb").TableDescription | undefined} Table
 */
async function CreateDevDup(Table) {
  const {
    AttributeDefinitions,
    KeySchema,
    TableName,
    DeletionProtectionEnabled,
    GlobalSecondaryIndexes,
    LocalSecondaryIndexes,
    OnDemandThroughput,
    ProvisionedThroughput,
    BillingModeSummary,
    SSEDescription,
    StreamSpecification,
    TableClassSummary,
  } = Table ?? {};

  await client.send(
    new CreateTableCommand({
      AttributeDefinitions,
      KeySchema,
      TableName: `dev_${TableName}`,
      DeletionProtectionEnabled,
      GlobalSecondaryIndexes: convertGsiDesc(GlobalSecondaryIndexes),
      LocalSecondaryIndexes: convertLsiDesc(LocalSecondaryIndexes),
      OnDemandThroughput,
      ProvisionedThroughput: convertProvisionedThroughputDesc(
        ProvisionedThroughput
      ),
      BillingMode: BillingModeSummary?.BillingMode,
      SSESpecification: convertSSEDescription(SSEDescription),
      StreamSpecification,
      TableClass: TableClassSummary?.TableClass,
    })
  );
}

if (require.main === module) {
  DescribeTables().then((Tables) =>
    Tables.forEach((Table) => CreateDevDup(Table))
  );
}
