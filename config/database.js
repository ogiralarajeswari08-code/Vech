const mongoose = require('mongoose');

// Use environment variables or default URIs
const MONGO_ATLAS_URI = process.env.MONGO_ATLAS_URI || 
  "mongodb+srv://ogiralarajeswari08_db_user:RajiReddy@cluster0.68omnlq.mongodb.net/car_portal?retryWrites=true&w=majority";

const MONGO_LOCAL_URI = process.env.MONGO_LOCAL_URI || 
  "mongodb://localhost:27017/car_portal";

// ✅ Always connect to MongoDB Atlas
const atlasConnection = mongoose.createConnection(MONGO_ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ Only connect to local MongoDB in development mode
let localConnection = null;
if (process.env.NODE_ENV !== 'production') {
  localConnection = mongoose.createConnection(MONGO_LOCAL_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

module.exports = { atlasConnection, localConnection };
