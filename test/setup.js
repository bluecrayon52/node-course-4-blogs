jest.setTimeout(10000);  // update default 5 sec timeout to 10 sec

require('../models/User');

const mongoose = require('mongoose'); 
const keys = require('../config/keys');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient: true });


