const {clearHash} = require('../services/cache'); 

module.exports = async (req, res, next) => {
    //  wait for route handler to run first 
    await next(); 

    clearHash(req.user.id); 
};

