const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');

const catchAsync = require('../utils/catchAsync');

const { isAdmin } = require('../middleware/authMiddleware');

/*
 * Get products models
 */

const Product = require('../models/Product');
const Category = require('../models/Category');


/*
 * Get products  index
 */

router.get('/', isAdmin, (req, res) => {
    let count;

    Product.count(function (err, c) {
        count = c;
    })
    Product.find(function (err, products) {
        res.render('admin/products', {
            products: products,
            count: count
        })
    });
});



/*
 * Get Add products 
 */

router.get('/add-product', isAdmin, catchAsync(async (req, res) => {
    let title = "";
    let desc = "";
    let price = "";
    let brand = "";
    let stock = "";
    let ingredients = "";
    let details = "";


    Category.find(function (err, categories) {
        res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price,
            brand: brand,
            stock: stock,
            ingredients: ingredients,
            details: details
        });
    })

}));

/*
 * Get All Products By Category 
 */

router.get('/:category', (req, res) => {
    const categorySlug = req.params.category;


    Category.findOne({ slug: categorySlug }, function (err, c) {

        Product.find({ category: categorySlug }, function (err, products) {
            if (err) {
                console.log('error in router.get("/:category") in products.js ' + err);
            }
            res.render('admin/cat_products', {
                products: products,
                title: c.title
            });
        })
    });
});

/*
 * POST Add products 
 */

router.post('/add-product', isAdmin, catchAsync(async (req, res) => {

    const imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : '';
    const title = req.body.title;
    const slug = title.replace(/\s+/g, '-').toLowerCase();
    const brand = req.body.brand;
    const desc = req.body.desc;
    const ingredients = req.body.ingredients;
    const details = req.body.details;
    const price = req.body.price;
    const stock = req.body.stock;
    const category = req.body.category;

    const product = new Product({
        title: title,
        slug: slug,
        desc: desc,
        brand: brand,
        ingredients: ingredients,
        details: details,
        price: price,
        stock: stock,
        category: category,
        image: imageFile
    });

    // check slug if exists 
    const productCheck = await Product.findOne({ slug: slug });
    if (productCheck) {

        req.flash('error', 'Product title exists try another one!');
        Category.find(function (err, categories) {
            if (err) {
                return console.log(err);
            } else {
                res.render('admin/add_product', {
                    title: title,
                    desc: desc,
                    categories: categories,
                    price: price,
                    brand: brand,
                    stock: stock,
                    ingredients: ingredients,
                    details: details
                });
            }
        });
    } else {
        product.save(function (err) {
            if (err) return console.log(err);
            else {
                // Create product folder with name of product {id}
                fs.mkdirSync('public/product_images/' + product._id, function (err) {
                    if (err) {
                        return console.log('error at first mkdir ' + err);
                    } else {
                        console.log('dir created in first mkdir');
                    }
                });

                // Create product gallery folder
                fs.mkdirSync('public/product_images/' + product._id + '/gallery', function (err) {
                    if (err) {
                        return console.log('error at 2 mkdir ' + err);
                    } else {
                        console.log('dir created in 2 mkdir');
                    }
                });

                // Create product thumbs folder
                fs.mkdirSync('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
                    if (err) {
                        return console.log('error at 3 mkdir ' + err);
                    } else {
                        console.log('dir created in 3 mkdir');
                    }
                });

                if (imageFile != '') {
                    const productImage = req.files.image;

                    const path = 'public/product_images/' + product._id + '/' + imageFile;
                    productImage.mv(path, function (err) {
                        if (err) {
                            return console.log('ERROR IN PRODUCT IMAGE MV' + err);
                        } else {
                            console.log('no error in productImage mv');
                        }
                    });
                }

                req.flash('success', 'Successfully made a new product');
                res.redirect('/admin/products');
            }
        })
    }
}));

/*
 * GET Edit product
 */

router.get('/edit-product/:id', isAdmin, catchAsync(async (req, res) => {
    var errors;

    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;

    Category.find(function (err, categories) {

        Product.findById(req.params.id, function (err, p) {
            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                let galleryDir = 'public/product_images/' + p._id + '/gallery';
                let galleryImages = null;

                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log('error in fs.readdir ' + err);
                    } else {
                        galleryImages = files;

                        res.render('admin/edit_product', {
                            title: p.title,
                            errors: errors,
                            desc: p.desc,
                            brand: p.brand,
                            ingredients: p.ingredients,
                            details: p.details,
                            price: parseFloat(p.price).toFixed(2),
                            stock: p.stock,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        });
                    }
                });
            }
        });
    });
}));

/*
 * POST Edit product
 */

router.post('/edit-product/:id', isAdmin, catchAsync(async (req, res) => {

    const id = req.params.id;
    const title = req.body.title;
    const slug = title.replace(/\s+/g, '-').toLowerCase();
    const { brand, desc, ingredients, details, price, stock, category, pimage } = req.body;
    const imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : '';


    Product.findOne({ slug: slug, _id: { '$ne': id } }, async function (err, p) {
        if (err) console.log('error in post edit product ' + err);
        if (p) {
            req.flash('error', 'Product title exists try another');
            res.redirect('/admin/products/edit-product/' + id);
        } else {
            Product.findById(id, function (err, p) {
                if (err) console.log(err);

                p.title = title;
                p.slug = slug;
                p.desc = desc;
                p.brand = brand;
                p.ingredients = ingredients;
                p.details = details;
                p.price = parseFloat(price).toFixed(2);
                p.stock = stock;
                p.category = category;

                if (imageFile != '') {
                    p.image = imageFile;
                }
                p.save(function (err) {
                    if (err) console.log(err);

                    if (imageFile != '') {
                        if (pimage != '') {
                            fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                if (err) console.log(err);
                            });
                            let productImage = req.files.image;
                            let path = 'public/product_images/' + id + '/' + imageFile;
                            productImage.mv(path, function (err) {
                                if (err) { return console.log('error at mv in post edit ' + err); }
                                else { console.log('Uploaded'); }
                            });
                        }
                    }
                    req.flash('success', 'Product edited');
                    res.redirect('/admin/products/edit-product/' + id)
                });
            })
        }
    })
}));

/*
 * POST add product gallery
 */

router.post('/product-gallery/:id', isAdmin, catchAsync(async (req, res) => {
    const productImage = req.files.file;
    const id = req.params.id;

    const path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    const thumbPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function (err) {
        if (err) {
            return console.log('error in mv in post product gallery ' + err);
        }
        resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then(function (buf) {
            console.log('in resize image');
            fs.writeFileSync(thumbPath, buf);
        });
    });
    res.sendStatus(200);
}));

/*
 * GET delete product gallery
 */

router.get('/delete-image/:image', isAdmin, catchAsync(async (req, res) => {
    const originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    const thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log('error in delete gallery image ' + err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    console.log('error in get delete gallery thumb image ' + err);
                } else {
                    req.flash('success', 'Image Successfully deleted');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }

    });
}));

/*
 * GET delete product
 */

router.get('/delete-product/:id', isAdmin, catchAsync(async (req, res) => {
    const id = req.params.id;
    const path = 'public/product_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log('error in delete-product/:id ' + err);
        } else {
            Product.findByIdAndDelete(id, function (err) {
                if (err) {
                    console.log('error in product.findByIdAndDelete ' + err)
                } else {
                    console.log('Product Deleted');
                }
            });
            req.flash('success', 'Product Deleted');
            res.redirect('/admin/products');
        }
    });
}));


module.exports = router;