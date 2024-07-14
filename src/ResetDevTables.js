// @ts-check
// TODO: Wipe dev_tables and fill with data from prod tables

const { ScanCommand, AttributeValue, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { client } = require("./config");

/**
 * @param {import("@aws-sdk/client-dynamodb").TableDescription} Table
 * @returns {Promise<Record<string, AttributeValue>[] | undefined>}
 */
async function FetchAll(Table) {
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
 * @param {import("@aws-sdk/client-dynamodb").TableDescription} Table 
 */
async function DeleteAll(Table) {
  const { TableName, KeySchema } = Table;
  let ExclusiveStartKey = undefined;

  do {
    const { Items, LastEvaluatedKey } = await client.send(
      new ScanCommand({
        TableName,
        ExclusiveStartKey
      })
    );

    for (const item of Items??[]) {
      const Key = {};
      for (const {AttributeName} of KeySchema??[]) {
        if (AttributeName) {
          Key[AttributeName]= item[AttributeName]
        }
      }

      await client.send(new DeleteItemCommand({
        TableName,
        Key
      }))
    }

    ExclusiveStartKey = LastEvaluatedKey;
  } while (ExclusiveStartKey)
}

/**
 * @param {string} TableName dev_table to reset
 */
async function ResetDevTable(TableName) {
  const origTableName = TableName.replace(/^dev_/, "");

  const 
}
