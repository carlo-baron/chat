const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    inUse: Boolean,
    socketId: { type: String, default: null }
});

module.exports = mongoose.model('User', userSchema);
