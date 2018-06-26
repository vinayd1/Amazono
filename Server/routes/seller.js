const router = require('express').Router();
const Product = require('../models/product');
const config = require('../config');

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = new aws.S3(config.s3);

const checkJWT = require('../middlewares/check-jwt');

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: config.bucket,
        metadata: function(req, file, cb) {
            console.log(file.fieldname);
            cb(null, { fieldName: file.fieldname });
        },
        key: function(req, file, cb) {
            cb(null, Date.now().toString());
        }
    })
});

router.route('/products')
    .get()
    .post([checkJWT, upload.single('productPicture')], (req, res, next) => {
        let product = new Product();
        console.log("3");
        product.owner = req.decoded.user._id;
        product.category = req.body.categoryId;
        product.title = req.body.title;
        product.price = req.body.price;
        product.description = req.body.description;
        product.image = req.file.location;
        let save = product.save();
        save.then(() => {
            res.json({
                success: true,
                message: 'Successfully Added the Product'
            });
        }).catch((error) => {
            res.json({
                success: false,
                message: error.message
            });
        })
    });

module.exports = router;