const express = require('express');
const router = express.Router();

const { categorySchema } = require('../schemas');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const { isAdmin } = require('../middleware/authMiddleware');

/*
 * Get Category model
 */

const Category = require('../models/Category');

const validateCategory = (req, res, next) => {
    const { error } = categorySchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


/*
 * Get Category  index
 */
router.get('/', isAdmin, catchAsync(async (req, res) => {
    let count;

    Category.count(function (err, c) {
        count = c;
    })
    Category.find(function (err, categories) {
        if (err) {
            return console.log(err);
        } else {
            res.render('admin/categories', { categories: categories, count: count })
        }
    })
}));

/*
 * Get add Category
 */

router.get('/add-category', isAdmin, catchAsync(async (req, res) => {
    var title = "";
    res.render('admin/add_category', {
        title: title,
    });
}));

/*
 * Post add category
 */

router.post('/add-category', isAdmin, validateCategory, catchAsync(async (req, res, next) => {
    const { title, slug } = req.body.category;
    const id = req.params.id;
    const category = new Category({
        title: title,
        slug: slug,
        id: id,
    });

    category.slug = category.title.replace(/\s+/g, '-').toLowerCase();
    // check slug if exists
    const categoryCheck = await Category.findOne({ slug: category.slug });
    if (categoryCheck) {
        req.flash('error', 'Category title exists try another one!');
        res.render('admin/add_category', {
            title: title,
            slug: slug
        })
    } else {
        // if no err we save and redirect to admin/pages
        category.save();
        req.flash('success', 'Successfully made a new category');
        res.redirect('/admin/categories');
    }
}));
/*
 * Get Edit Pages
 */

router.get('/edit-category/:id', isAdmin, catchAsync(async (req, res) => {
    const category = await Category.findById(req.params.id);
    try {
        res.render('admin/edit_category', {
            title: category.title,
            id: category._id,

        });
    } catch {
        if (!category) {
            req.flash('error', 'Cannot find that category!');
            return res.redirect('/admin/categories');
        }
    }

}));

/*
 * POST edit categories
 */

router.post('/edit-category/:id', isAdmin, catchAsync(async (req, res) => {
    const { title, slug } = req.body.category;
    const id = req.params.id;
    const category = await Category.findById(id);
    try {
        category.title = title
        category.slug = title.replace(/\s+/g, '-');

        const categoryCheck = await Category.findOne({ slug: category.slug, _id: { '$ne': id } });
        if (categoryCheck) {
            req.flash('error', 'Category title exists try another one!');
            res.render('admin/edit_category', {
                title: title,
                slug: slug
            })
        } else {
            await category.save();
            req.flash('success', 'Successfully updated the category');
            res.redirect('/admin/categories');
        }
    } catch {
        if (category == null) {
            res.redirect('/admin/categories');
        } else {
            req.flash('error', 'Error updated category');
            res.redirect('/admin/categories/edit-category/' + id)
        }
    }
}));

router.get('/delete-category/:id', isAdmin, catchAsync(async (req, res) => {
    try {
        const id = req.params.id;
        await Category.findByIdAndDelete(id);
        req.flash('success', 'Successfully Deleted the Category');
        res.redirect('/admin/categories');
    } catch {

        req.flash('error', 'error Deleting category');
        res.redirect('/admin/categories');
    }

}));


module.exports = router;