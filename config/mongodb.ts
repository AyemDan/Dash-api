import * as mongoose from "mongoose"

async function connect(uri?: string) {
    const connectionString =  process.env.MONGO_URI;
    if (!connectionString) {
        throw new Error('MongoDB connection string is missing');
    }
    await mongoose.connect(connectionString);
    console.log('MongoDB connected to', connectionString);
}

// add a default export so other modules can `import connect from './config/mongodb'`
export default connect;
