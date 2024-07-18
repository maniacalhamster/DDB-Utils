// @ts-check
// TODO: Wipe dev_tables and fill with data from prod tables

const {
  ScanCommand,
  AttributeValue,
  DescribeTableCommand,
  BatchWriteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { client } = require("./config");
const { DescribeTables } = require("./DescribeTables");

/**
 * @param {import("@aws-sdk/client-dynamodb").TableDescription | undefined} Table
 * @returns {Promise<Record<string, AttributeValue>[]>}
 */
async function FetchAll(Table) {
  if (Table === undefined) {
    return [];
  }

  const { TableName, KeySchema } = Table;
  let items = [];
  let ExclusiveStartKey = undefined;

  do {
    const { Items, LastEvaluatedKey } = await client.send(
      new ScanCommand({
        TableName,
        ExclusiveStartKey,
      })
    );

    items = items.concat(Items);
    ExclusiveStartKey = LastEvaluatedKey;
  } while (ExclusiveStartKey);

  return items;
}

/**
 *
 * @param {Record<string, AttributeValue>[]} items
 * @param {import('@aws-sdk/client-dynamodb').KeySchemaElement[]} KeySchema
 * @param {'delete' | 'put'} type
 * @returns {import('@aws-sdk/client-dynamodb').WriteRequest[]}
 */
function GenerateWriteRequests(items, KeySchema, type) {
  return items.map((Item) => {
    if (type === "put") {
      return {
        PutRequest: { Item },
      };
    }

    const Key = KeySchema.reduce(
      (Key, { AttributeName }) =>
        AttributeName
          ? {
              ...Key,
              [AttributeName]: Item[AttributeName],
            }
          : Key,
      {}
    );

    return { DeleteRequest: { Key } };
  });
}

/**
 * @param {import("@aws-sdk/client-dynamodb").TableDescription} DevTable dev_table
 */
async function ResetDevTable(DevTable) {
  const { TableName, KeySchema } = DevTable;
  const prodTableName = TableName?.replace(/^dev_/, "");

  const ProdTable = await client
    .send(new DescribeTableCommand({ TableName: prodTableName }))
    .then((resp) => resp.Table);

  const prodItems = await FetchAll(ProdTable);
  const devItems = await FetchAll(DevTable);

  const WriteRequests = [
    ...GenerateWriteRequests(devItems, KeySchema ?? [], "delete"),
    ...GenerateWriteRequests(prodItems, KeySchema ?? [], "put"),
  ];

  const BATCH_SIZE = 25; // DDB Batch Limit

  for (let i = 0; i < WriteRequests.length; i += BATCH_SIZE) {
    const batch = WriteRequests.slice(i, i + BATCH_SIZE);
    await client.send(
      new BatchWriteItemCommand({
        RequestItems: {
          [TableName ?? ""]: batch,
        },
      })
    );
  }
}

DescribeTables()
  .then((tables) => tables.filter((table) => table !== undefined))
  .then((tables) =>
    tables.filter(({ TableName }) => /^dev_/.test(TableName ?? ""))
  )
  .then((devTables) =>
    devTables.forEach((devTable) => {
      console.log(`Resetting ${devTable.TableName}`);
      // ResetDevTable(devTable);
    })
  );
