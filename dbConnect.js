const mongoose = require("mongoose");

module.exports = async () => {
  const mongoUri =
    "mongodb+srv://tushar:dcsLuBWLCDQV0seO@cluster0.zohxnjb.mongodb.net/?retryWrites=true&w=majority";

  try {
    const connect = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('database connected', connect.connection.host)
  } catch (error) {
    console.log("server error: " + error);
    process.exit(1)
  }
};
