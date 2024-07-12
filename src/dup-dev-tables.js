const {
  DynamoDBClient,
  ListTablesCommand,
  DescribeTableCommand,
  CreateTableCommand,
} = require("@aws-sdk/client-dynamodb");
const { fromIni } = require("@aws-sdk/credential-provider-ini");

// Set AWS profile
const credentials = fromIni({ profile: "asingh-lm" });

async function ListAllTables() {
  for (region of ["us-west-1", "us-west-2", "us-east-1", "us-east-2"]) {
    // Create DDB client
    const client = new DynamoDBClient({
      region,
      credentials,
    });

    console.log(`[${region}] DDB tables:`);

    await client
      .send(new ListTablesCommand({}))
      .then((resp) => console.log(resp.TableNames));
  }
}

ListAllTables();
