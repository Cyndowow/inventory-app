const Item = require("../models/item");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");

const asyncHandler = require("express-async-handler");

// /item/:id
exports.getItem = function(req, res, next) {
    Item.find({ _id: req.params.id })
        .populate("category")
        .exec()
        .then((result) => {
            res.render("getItem", { title: "Item", item: result[0]})
        })
}

// /item/create
exports.createItem = function(req, res, next) {
    Category.find({}).then((result) => {
        res.render("getCreateItem", {
            title: "Create Item",
            categories: result,
        })
    })
}

// /item/:id/update
exports.getUpdateItem = function (req, res, next) {
    Promise.all([Item.findById(req.params.id), Category.find({})].then(
        (results) => {
            console.log(results[0]._id);
            res.render("getUpdateItem", {
                title: "Update Item",
                item: results[0],
                categories: results[1],
            })
        }
    ))
}

// /item/:id/delete
exports.getDeleteItem = function(req, res, next) {
    res.render("getDeleteItem", {title: "Delete Item"});
}

// /item/create
exports.postCreateItem = [
    // Validate and sanitize
    body("name", "Name must not be empty")
        .exists()
        .trim()
        .escape(),
    body("description", "Description must not be empty")
        .exists()
        .trim()
        .escape(),
    body("category")
        .escape(),
    body("price", "Price must not be empty")
        .exists()
        .trim()
        .escape(),
    body("number_in_stock", "Stock must not be empty")
        .exists()
        .isNumeric()
        .trim(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            number_in_stock: req.body.number_in_stock,
        })

        if (!errors.isEmpty()) {
            const allCategories = await Promise.all(Category.find().exec())

            for (const category of allCategories) {
                if (item.category.includes(category._id)) {
                    category.checked = "true"
                }
            }
            res.render("getCreateItem", {
                title: "Create Item",
                categories: allCategories,
                item: item,
                errors: errors.array(),
            })
        } else {
            await item.save()
            res.redirect(item.url)

        }

    })
]

// /item/:id/update
exports.postUpdateItem = [
    // Validate and sanitize
    body("name", "Name must not be empty")
        .exists()
        .trim()
        .escape(),
    body("description", "Description must not be empty")
        .exists()
        .trim()
        .escape(),
    body("category")
        .escape(),
    body("price", "Price must not be empty")
        .exists()
        .trim()
        .escape(),
    body("number_in_stock", "Stock must not be empty")
        .exists()
        .isNumeric()
        .trim(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            number_in_stock: req.body.number_in_stock,
            _id: req.params.id,
        })

        if (!errors.isEmpty()) {
            const allCategories = await Promise.all(Category.find().exec())

            for (const category of allCategories) {
                if (item.category.includes(category._id)) {
                    category.checked = "true"
                }
            }
            res.render("getCreateItem", {
                title: "Create Item",
                categories: allCategories,
                item: item,
                errors: errors.array(),
            });
            return;
        } else {
            const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
            res.redirect(updatedItem.url)

        }

    })
]

// /item/:id/delete
exports.postDeleteItem = asyncHandler(async (req, res, next) => {
    await Item.findByIdAndRemove(req.params.id);
    res.redirect("/")
})