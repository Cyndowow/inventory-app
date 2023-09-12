const Category = require("../models/category");
const Item = require("../models/item");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

// /category/:id
exports.getCategory = asyncHandler(async (req, res, next) => {
    const [items, category] = await Promise.all([
        Item.find({ category: req.params.id }),
        Category.find({ _id: req.params.id })
    ])
    res.render("getCategory", {
        title: "Category",
        items: items,
        category: category.name,
        description: category.description,
    })
})

// /category/create
exports.getCreateCategory = (req, res, next) => {
    res.render("getCreateCategory", { title: "Create Category" })
}

// /category/create
exports.postCreateCategory = [
    body("name", "Category must contain a name")
        .trim()
        .exists()
        .escape(),

    body("description", "Description must not be empty")
        .trim()
        .exists()
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const category = new Category({ 
            name: req.body.name,
            description: req.body.description,
        })

        if (!errors.isEmpty()) {
            res.render("getCreateCategory", {
                title: "Create Category",
                category: category.name,
                description: category.description,
                errors: errors.array(),
            })
            return;
        } else {
            const categoryExists = await Category.findOne({ name: req.body.name })
                .collation({ locale: "en", strength: 2})
                .exec();
            if (categoryExists) {
                res.redirect(categoryExists.url)
            } else {
                await category.save();
                res.redirect(category.url)
            }
        }
    })
]

// /category/:id/update
exports.getUpdateCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    res.render("getUpdateCategory", {
        title: "Update Category",
        category: category,
    })
})

exports.postUpdateCategory = [
    body("name", "Category must contain a name")
    .trim()
    .exists()
    .escape(),

    body("description", "Description must not be empty")
        .trim()
        .exists()
        .escape(),
        
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const category = new Category({
            name: req.body.name,
            description: req.body.description,
            _id: req.params.id,
        })

        if(!errors.isEmpty()) {
            res.render("getUpdateCategory", {
            title: "Create Category",
            category: category.name,
            description: category.description,
            errors: errors.array(),
            });
            return;
        } else {
            await Category.findByIdAndUpdate(req.params.id, category);
            res.redirect(category.url)
        }
    })
]

// /category/:id/delete
exports.getDeleteCategory = asyncHandler(async (req, res, next) => {
    const [category, itemsInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }, "name description").exec()
    ])
    if (genre === null) {
        res.redirect("/")
    }

    res.render("getDeleteCategory", {
        title: "Delete Category",
        category: category,
        category_items: itemsInCategory,
    })
})

exports.postDeleteCategory = asyncHandler(async (req, res, next) => {
    const [category, itemsInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }, "name description").exec()
    ]);

    if (itemsInCategory.length > 0) {
        res.render("getDeleteCategory", {
            title: "Delete Category",
            category: category.name,
            description: category.description,
            category_items: itemsInCategory,
        });
        return;
    } else {
        await Category.findByIdAndRemove(req.body.id);
        res.redirect("/");
    }
})