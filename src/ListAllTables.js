// @ts-check

const {
  DynamoDBClient,
  ListTablesCommand,
} = require("@aws-sdk/client-dynamodb");

const { credentials } = require("./config");

const regions = ["us-west-1", "us-west-2", "us-east-1", "us-east-2"];

// old way of checking tables via console.log
// async function logTables() {
//   for (const region of regions) {
//     console.log(`[${region}] DDB tables:`);

//     new DynamoDBClient({
//       region,
//       credentials,
//     })
//       .send(new ListTablesCommand({}))
//       .then((resp) => console.log(resp.TableNames));
//   }
// }

if (require.main === module) {
  // Fetch tables for all regions and generate a JSON result of the form
  // { [region: string]: []string }
  Promise.all(
    regions.map((region) =>
      new DynamoDBClient({
        region,
        credentials,
      })
        .send(new ListTablesCommand({}))
        .then((resp) => ({
          [region]: resp.TableNames,
        }))
    )
  )
    // Had to keep track of region within Promise[]
    // Can reduce results to get it into a more familiar format
    .then((region_array) =>
      region_array.reduce(
        (curr_region, region_obj) => ({ ...curr_region, ...region_obj }),
        {}
      )
    )
    // Prettify JSON results and log to console
    .then((region_tables) => JSON.stringify(region_tables, undefined, 2))
    .then((json) => console.log(json));
}
