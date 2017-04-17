var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var GuildSchema = mongoose.Schema({
    guildId: Number,
    name: String,
    channels : [{ type: Schema.Types.ObjectId, ref: 'Channel' }]
});
var Guild = mongoose.model('Guild', GuildSchema);
module.exports = Guild
