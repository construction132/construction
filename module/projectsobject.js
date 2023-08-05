const mongoose = require("mongoose")
let projectSchema = new mongoose.Schema({
    project: String,
    loans: Object,
    date: String
});

module.exports= mongoose.model("ProjectObject", projectSchema);