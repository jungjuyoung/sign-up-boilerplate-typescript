import mongoose from 'mongoose';
import config from 'config';

const connect = async () => {
  const dbURI = config.get<string>('URI');

  try {
    await mongoose.connect(dbURI);
    console.log('Connected to DB...');
  } catch (error) {
    console.error(`Could not connected to DB...`);
    process.exit(1);
  }
};

export default connect;
