const router = require('express').Router();
const Product = require('../models/product');
const config = require('../config');

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = new aws.S3(config.s3);

const faker = require('faker');

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
    .get(checkJWT, (req, res, next) => {
        Product.find({owner: req.decoded.user._id})
            .populate('owner')
            .populate('category')
            .exec((err, products) => {
                if(err) {
                    res.json({
                        success: false,
                        message: err.message
                    });
                }
                if(products) {
                    res.json({
                        success: true,
                        message: "Products",
                        products: products
                    });
                }  else {
                    res.json({
                        success: false,
                        message: "No product found"
                    });
                }
            });
    })
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

/**************************Just For Testing********************************/
/**************************************************************************/
/**/                                                                    /**/
/**/    router.get('/faker/test', (req, res, next) => {                 /**/
/**/        for (i = 0; i < 20; i++) {                                  /**/
/**/            let product = new Product();                            /**/
/**/            product.category = "5b26a066a10b1c54ba724e13";          /**/
/**/            product.owner = "5b269506166b474bae261250";             /**/
/**/            product.image = faker.image.cats();                     /**/
/**/            product.title = faker.commerce.productName();           /**/
/**/            product.description = faker.lorem.words();              /**/
/**/            product.price = faker.commerce.price();                 /**/
/**/            let save = product.save();                              /**/
/**/            save.catch((error) => {                                 /**/ 
/**/                res.json({                                          /**/
/**/                    success: false,                                 /**/
/**/                    message: error.message                          /**/
/**/                });                                                 /**/
/**/            });                                                     /**/
/**/        }                                                           /**/
/**/                                                                    /**/
/**/        res.json({                                                  /**/
/**/            success: true,                                          /**/
/**/            message: "Successfully added 20 products"               /**/
/**/        });                                                         /**/
/**/    });                                                             /**/
/**/                                                                    /**/
/**************************************************************************/
/**************************************************************************/

module.exports = router;