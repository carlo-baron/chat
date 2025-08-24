const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    inUse: Boolean
});

module.exports = mongoose.model('User', userSchema);
