const mongoose = require("mongoose")
let projectSchema = new mongoose.Schema({
    project: String,
    loaner: String,
    StartingLoan: Number,
    date: String,
    source:Object,
    paid:Number,
    remaining: Number,
});

module.exports= mongoose.model("loanAction", projectSchema);