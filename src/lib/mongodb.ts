// This approach is taken from the Next.js example for using MongoDB.
// It creates a cached connection promise to avoid creating a new connection on every server-side render.
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    if (!uri) {
      // In development, we want to fail fast if the dev forgot the .env file.
      throw new Error('Please define the MONGODB_URI environment variable inside .env.local for development');
    }
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode (including Vercel builds), it's best to not use a global variable.
  // We must not throw here if the URI is missing, to allow the build to pass.
  if (!uri) {
    // If there is no URI, we create a promise that will reject.
    // This allows the build to continue, and our data services will handle the rejection gracefully.
    console.error("MONGODB_URI is not configured in the production environment. The application will not be able to connect to the database at runtime.");
    clientPromise = Promise.reject(new Error("MONGODB_URI is not configured in the production environment."));
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
