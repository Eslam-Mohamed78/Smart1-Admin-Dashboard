import mongoose from "mongoose";
import "../src/utils/queryHelpers.js"

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.CONNECTION_URL);

    console.log(`DB Connected Successfully: ${connect.connection.host}`);
    // console.log(connect);
  } catch (error) {
    console.log(`Fail to connect DB...${error}`);
  }
};

export default connectDB;
