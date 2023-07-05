const mongoose = require("mongoose")
let projectSchema = new mongoose.Schema({
    project: String,
    abaaLoan: Number,
    umiLoan: Number,
    rageebLoan: Number,
    omarLoan: Number,
    date: String
});

module.exports= mongoose.model("Project", projectSchema);