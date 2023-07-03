const mongoose = require("mongoose")
let projectSchema = new mongoose.Schema({
    actionNumber: Number,
    owner: String,
    abaaLoan: Number, 
    umiLoan: Number,
    abaaIn: Number,
    umiIn: Number,
    rent: Number,
    cash: Number, 
    cashShling: Number, 
    abaaPercentage: Number, 
    umiPercentage: Number, 
    total: Number, 
    abaaOut: Number,
    umiOut: Number, 
    abaaTotal: Number,
    umiTotal: Number,
    remainingAbaa: Number,
    remainingUmi: Number, 
    remainingTotal: Number, 
    shlingFactor: Number,
    date: String
});

module.exports = mongoose.model("Action", projectSchema);