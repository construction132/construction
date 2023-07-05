const mongoose = require("mongoose")
let projectSchema = new mongoose.Schema({
    project: String,
    loaner: String,
    StartingLoan: Number,
    date: String,
    abaa: Number,
    paid:Number,
    umi: Number,
    UAE: Number,
    house: Number,
    swafia:Number,
    total:Number,
    remaining: Number,
});

module.exports= mongoose.model("loanAction", projectSchema);