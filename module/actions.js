const mongoose = require("mongoose")
let projectSchema = new mongoose.Schema({
    actionNumber: Number,
    actionType: String,
    owner: String,
    abaaLoan: Number, 
    umiLoan: Number,
    omarLoan:Number,
    rageebLoan:Number,
    value: Number,
    source:String,
    taker:String,
    giver: String,
    purpose: String,
    remainingAbaa: Number,
    remainingUmi: Number, 
    remainingOmar: Number,
    remainingRageeb: Number,  
    remainingTotal: Number, 
    totalPaid: Number, 
    shlingFactor: Number,
    date: String
});

module.exports = mongoose.model("Action", projectSchema);