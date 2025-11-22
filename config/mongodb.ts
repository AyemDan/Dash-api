import * as mongoose from "mongoose"

async function connect(uri?: string) {
    const connectionString =  "mongodb://localhost:27017/test";
    if (!connectionString) {
        throw new Error('MongoDB connection string is missing');
    }
    await mongoose.connect(connectionString);
    console.log('MongoDB connected to', connectionString);
}

// add a default export so other modules can `import connect from './config/mongodb'`
export default connect;
