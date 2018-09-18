const AWS = require('aws-sdk');
const keys = require('../config/keys');
const uuid = require('uuid/v1');
const requireLogin = require('../middlewares/requireLogin');

const s3 = new AWS.S3({
    accessKeyId: keys.accessKeyId,
    secretAccessKey: keys.secretAccessKey
});

module.exports = app => {
    app.get('/api/upload', requireLogin, (req, res) => {

        // console.log('req.user.id: ', req.user.id);

        const key =`${req.user.id}/${uuid()}.jpeg`;

        // console.log('key: ', key); 

        s3.getSignedUrl('putObject', {
            Bucket: 'blogs-bucket-2018',
            ContentType: 'image/jpeg',
            Key: key

        }, (err, url) => res.send({key, url})
        );
    });
}; 