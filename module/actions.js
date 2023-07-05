const mongoose = require("mongoose")
let projectSchema = new mongoose.Schema({
    actionNumber: Number,
    owner: String,
    abaaLoan: Number, 
    umiLoan: Number,
    abaaIn: Number,
    abaaSource:String,
    umiIn: Number,
    umiSource:String,
    rent: Number,
    cash: Number, 
    cashShling: Number, 
    abaaLoneDecrease: Number, 
    umiLoneDecrease: Number, 
    total: Number, 
    abaaOut: Number,
    umiOut: Number, 
    outSource:String,
    abaaTotal: Number,
    umiTotal: Number,
    remainingAbaa: Number,
    remainingUmi: Number, 
    remainingTotal: Number, 
    shlingFactor: Number,
    date: String
});

module.exports = mongoose.model("Action", projectSchema);