const mongoose = require("mongoose")
let projectSchema = new mongoose.Schema({
    project: String,
    abaaLoan: Number,
    umiLoan: Number,
    date: String
});

module.exports= mongoose.model("Project", projectSchema);