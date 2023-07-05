const mongoose = require("mongoose")
let projectSchema = new mongoose.Schema({
    project: String,
    loaner: String,
    StartingLoan: Number,
    date: String,
});

module.exports= mongoose.model("Loan", projectSchema);