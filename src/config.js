// @ts-check

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { fromIni } = require("@aws-sdk/credential-provider-ini");

const { region, profile } = require("./constants");

const credentials = fromIni({ profile });
const client = new DynamoDBClient({
  region,
  credentials,
});

module.exports = {
  credentials,
  client,
};
