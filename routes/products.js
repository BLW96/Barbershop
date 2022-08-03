const express = require('express');
const router = express.Router({ mergeParams: true });
const fs = require('fs-extra');

const { isAdmin } = require('../middleware/authMiddleware');
const catchAsync = require('../utils/catchAsync');

// models

const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');



/*
 * Get All Products 
 */

router.get('/:page', catchAsync(async (req, res, next) => {
    let perPage = 9;
    let page = req.params.page || 1;

    Product
        .find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function (err, products) {
            Product.count().exec(function (err, count) {
                if (err) return next(err);
                res.render('shop/products', {
                    products,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    title: 'All Products'
                });
            });
        });

    // const products = await Product.find({});
    // try {
    //     res.render('shop/products', { products, title: 'All Products' });
    // } catch (err) {
    //     console.log(err);
    // }
}));

/*
 * Get All Products By Category 
 */

router.get('/cate/:category', (req, res, next) => {
    const categorySlug = req.params.category;

    // const perPage = 9;
    // const page = req.params.page || 1;

    //     Category.findOne({ slug: categorySlug }, function (err, c) {
    // 
    //         Product
    //             .find({ category: categorySlug })
    //             .skip((perPage * page) - perPage)
    //             .limit(perPage)
    //             .exec(function (err, products) {
    //                 if (err) {
    //                     console.log(err);
    //                 } else {
    // 
    //                     Product.count().exec(function (err, count) {
    //                         if (err) return next(err);
    //                         res.render('shop/cat_products', {
    //                             products: products,
    //                             current: page,
    //                             categorySlug,
    //                             pages: Math.ceil(count / perPage),
    //                             title: c.title
    //                         });
    //                     });
    //                 }
    //             });
    //     })


    Category.findOne({ slug: categorySlug }, function (err, c) {
        Product.find({ category: categorySlug }, function (err, products) {
            if (err) {
                console.log('error in router.get(/:category) in products.js ' + err);
            }
            res.render('shop/cat_products', { products: products, title: c.title, categorySlug });
        });
    });
});


/*
 * Get Product Details
 */

router.get('/:category/:product', (req, res) => {
    let galleryImages = null;

    Product
        .findOne({ slug: req.params.product })
        .populate('reviews')
        .exec(function (err, product) {
            if (err) {
                console.log('error in router.get(/:category/:product) in product.js ' + err);
            } else {
                const galleryDir = 'public/product_images/' + product._id + '/gallery';
                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;
                        res.render('shop/product', {
                            title: product.title,
                            product: product,
                            galleryImages: galleryImages
                        });
                    }
                })
            }
        });
});

/*
 * POST add review
*/
router.post('/:category/:product/reviews', catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.product);
    const review = new Review(req.body);
    product.reviews.push(review);
    await review.save();
    await product.save();
    req.flash('success', 'Created new review!');
    res.redirect('back');
}));

router.get('/:category/:product/delete-review/:reviewId', isAdmin, catchAsync(async (req, res) => {
    const { reviewId } = req.params;
    const product = await Product.findById(req.params.product);

    console.log('this is product id: ' + product.id, 'this is review id: ' + reviewId);
    await Product.findByIdAndUpdate(product.id, { $pull: { reviews: reviewId } }, { new: true });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect('back');
}));


module.exports = router;
