const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: String,
    users: { type: Array, ref: 'user'},
    maxSize: { type: Number, default: 2 }
});

module.exports = mongoose.model('Room', roomSchema);
