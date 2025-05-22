
import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;
if (!uri) {
  throw new Error("Please define the DATABASE_URL environment variable inside .env.local");
}

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export default clientPromise;