const express = require('express');
const router = express.Router();

// models
const Cart = require('../models/Cart');
const Product = require('../models/Product');


/*
 * Get Add product to cart
 */

router.get('/add/:product', (req, res) => {
    var slug = req.params.product;

    Product.findOne({ slug: slug }, function (err, p) {
        if (err) {
            console.log('error in add/:product in cart.js ' + err);
        }
        if (typeof req.session.cart == "undefined") {

            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image
            });

            var cart = new Cart({
                title: slug,
                qt: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image,
                username: res.locals.user.username
            });

            cart.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('add to cart mongodb 1st');
                }
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;
            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }
            if (newItem) {

                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image,
                });

                var cart = new Cart({
                    title: slug,
                    qt: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image,
                    username: res.locals.user.username
                });

                cart.save(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('add to cart mongodb');
                    }
                });
            }
        }
        console.log(req.session.cart);
        req.flash('success', 'Product added');
        res.redirect('back');
    });
});

/*
 * Get Checkout Page
 */

router.get('/checkout', (req, res) => {

    Cart.find({ username: res.locals.user.username }, function (err, p) {

        if (err) {
            console.log(err);
        }
        if (p.length == 0) {
            res.render('shop/emptycart', { title: 'Empty Cart', cart: p });
        } else {
            res.render('shop/checkout', { title: 'Checkout', cart: p });
        }
    });
});

/*
 * Get Checkout Page
 */

router.get('/update/:product', (req, res) => {

    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;


    Cart.find({ username: res.locals.user.username }, function (err, p) {
        if (err) {
            console.log(err);
        }
        for (var i = 0; i < p.length; i++) {
            if (p[i].title == slug) {
                // console.log(p[i].id);
                // console.log(p[i].title);
                // console.log(p[i].qt);

                switch (action) {
                    case "add":
                        Cart.findOneAndUpdate({ title: p[i].title }, { qt: p[i].qt + (1) }, { new: true }, function (err) {
                            if (err) {
                                console.log('error in add product func ' + err);
                            }
                            console.log('Product QTY + 1');
                        });
                        break;

                    case "remove":
                        if (p[i].qt <= 1) {
                            Cart.findOneAndDelete({ title: p[i].title }, function (err) {
                                if (err) {
                                    console.log('error in delete product func ' + err);
                                }
                                console.log('Product deleted');
                            });
                        } else {
                            Cart.findOneAndUpdate({ title: p[i].title }, { qt: p[i].qt - (1) }, { new: true }, function (err, pro) {
                                if (err) {
                                    console.log('error in min product func ' + err);
                                }
                                console.log('Product QTY - 1');
                            });
                        }

                        break;
                    case "clear":
                        Cart.findOneAndDelete({ title: p[i].title }, function (err) {
                            if (err) {
                                console.log('error in delete product func ' + err);
                            }
                            console.log('Product deleted');
                        });
                        if (cart.length == 0) {

                            delete req.session.cart;
                        }

                        break;
                    default:
                        console.log('update problem in /update/:product');
                        break;
                }
            }

        }
    });

    console.log(req.session.cart);
    req.flash('success', 'Cart updated');
    res.redirect('/cart/checkout');

});

/*
 * Get Clear cart
 */

router.get('/clear', (req, res) => {
    Cart.deleteMany({ username: res.locals.user.username }, function (err) {
        if (err) {
            console.log('error in delete products' + err);
        }
        console.log('Cart Cleared');
    });
    delete req.session.cart;
    res.redirect('/cart/checkout');
});

/*
 * Get Buy now cart
 */

router.get('/buynow', (req, res) => {
    Cart.deleteMany({ username: res.locals.user.username }, function (err) {
        if (err) {
            console.log('error in delete products' + err);
        }
        console.log('Cart Cleared');
    });
    delete req.session.cart;
    res.sendStatus(200);
});


module.exports = router;
