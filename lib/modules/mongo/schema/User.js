var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var UserSchema = mongoose.Schema({
    userId: Number,
    currentUsername: String,
    usernames: [{ username: String}],
    messages : [{ type: Schema.Types.ObjectId, ref: 'Msg' }]
});
var User = mongoose.model('User', UserSchema);
module.exports = User
