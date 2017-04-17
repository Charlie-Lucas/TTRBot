var mongoose = require('mongoose'), Schema = mongoose.Schema;
var MsgSchema = mongoose.Schema({
    msgId: Number,
    content: String,
    attachments: [{url: String, filename: String}],
    _user: { type: String, ref: 'User' },
    _channel: { type: String, ref: 'Channel' },
    createdAt    : { type: Date, required: true, default: Date.now }
});
var Msg = mongoose.model('Msg', MsgSchema);
module.exports = Msg
