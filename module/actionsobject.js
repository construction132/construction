const mongoose = require("mongoose")
let projectSchema = new mongoose.Schema({
    actionNumber: Number,
    actionType: String,
    owner: String,
    loans:Object,
    value: Number,
    source:String,
    taker:String,
    giver: String,
    purpose: String,
    remainingLoans:Object,
    totalPaid: Number, 
    totalRemaining:Number,
    shlingFactor: Number,
    date: String
});

module.exports = mongoose.model("ActionObject", projectSchema);