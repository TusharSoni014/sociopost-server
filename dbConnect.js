const mongoose = require("mongoose");

module.exports = async () => {
  const mongoUri = process.env.MONGO_URI;

  try {
    const connect = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("database connected", connect.connection.host);
  } catch (error) {
    console.log("server error: " + error);
    process.exit(1);
  }
};
