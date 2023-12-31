const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: { type: String, required: true, minLength: 1},
    description: { type: String, required: true },
    /*url: { type: String, required: true, minLength: 1} // Needed?*/
})

CategorySchema.virtual("url").get(function () {
    return `/category/${this._id}`
})

module.exports = mongoose.model("Category", CategorySchema)