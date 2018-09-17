const mongoose = require('mongoose');
const redis = require('redis'); 
const util = require('util'); 
const keys = require('../config/keys');

const client = redis.createClient(keys.redisUrl);
//overwrite to use promise instead of callback 
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec; 

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this;  // makes it chainable 
}
// intercept origional query.exec (monkey patch)
mongoose.Query.prototype.exec = async function () {

    if (!this.useCache) {
        // run origional query.exec
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify(
        Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name
        })
    );
    
    // JSON Object
    const cacheValue = await client.hget(this.hashKey, key); 

    if (cacheValue) {
        // javascript Object
        const doc = JSON.parse(cacheValue); 

        // hydrate value(s) back to mongo models
       return  Array.isArray(doc) 
        ? doc.map(d => new this.model(d))
        : new this.model(doc); 

    }

    // run origional query.exec
    const result = await exec.apply(this, arguments); 
    // auto cache expiration of 10 sec 
    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10); 
    return result;  
}

module.exports = {
    clearHash(hashKey) {
      client.del(JSON.stringify(hashKey));
    }
  }