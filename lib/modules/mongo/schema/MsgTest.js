var mongoose = require('mongoose');
var MsgTestScema = mongoose.Schema({
    content: String
});
var MsgTest = mongoose.model('MsgTest', MsgTestScema);
module.exports = MsgTest
