var mongoose = require('mongoose'), Schema = mongoose.Schema;
var ChannelSchema = mongoose.Schema({
    name: String,
    channelId: Number,
    _guild: {type: String, ref: 'Guild' },
    messages: [{ type: Schema.Types.ObjectId, ref: 'Msg' }]
});
var Channel = mongoose.model('Channel', ChannelSchema);
module.exports = Channel
