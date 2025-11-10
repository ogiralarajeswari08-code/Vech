const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://ogiralarajeswari08_db_user:RajiReddy@cluster0.68omnlq.mongodb.net/?appName=Cluster0";
const MONGO_LOCAL_URI = "mongodb://localhost:27017/car_portal";

// Establish two connections
const atlasConnection = mongoose.createConnection(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const localConnection = mongoose.createConnection(MONGO_LOCAL_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = { atlasConnection, localConnection };
