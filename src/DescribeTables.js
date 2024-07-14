// @ts-check

const {
  ListTablesCommand,
  DescribeTableCommand,
} = require("@aws-sdk/client-dynamodb");

const { client } = require("./config");

async function DescribeTables() {
  const tables =
    (await client
      .send(new ListTablesCommand())
      .then((resp) => resp.TableNames)) ?? [];

  const tableDefs = [];

  for (let TableName of tables) {
    tableDefs.push(
      await client
        .send(new DescribeTableCommand({ TableName }))
        .then((resp) => resp.Table)
    );
  }

  return tableDefs;
}

DescribeTables()
  .then((tableDefs) => JSON.stringify(tableDefs, undefined, 2))
  .then((json) => console.log(json));

module.exports = {
  DescribeTables,
};
