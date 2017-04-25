var scope = "http://open.tan.fr/ewp/horairesarret.json/LCAR/2/2";
var mongoose = require('mongoose');
var Msg = require('../mongo/schema/Msg');
var Channel = require('../mongo/schema/Channel');
var Guild = require('../mongo/schema/Guild');
var User = require('../mongo/schema/User');
var dateFormat = require('dateformat');

mongoose.Promise = require('bluebird');


var Manager = {
    getLastMessages: function(number){
        return new Promise(
            function (fulfill, reject) {
                 return Msg.find({}).sort({msgId: -1}).populate('_user').limit(number)
                    .exec(function (err, msgs) {
                        var messageResponse = ['Messages supprimés :\n '];
                        for (var i = 0; i < msgs.length; i++) {
                            var result = ''
                            var msg = msgs[i];
                            var attachment = "";
                            if (msg.attachments.length > 0) {
                                attachment = attachment + " Image(s) :"
                                for (var j = 0; j < msg.attachments.length; j++) {
                                    attachment = attachment + msg.attachments[j].url + ' '

                                }
                            }
                            result = result + /*"Guild : " + msg.channel.guild.name + " Channel : " + msg.channel.name +*/" Contenu : ```" + msg.content +"```"+ attachment ;
                            if(msg._user)
                            {
                                result = result +" De : " + msg._user.currentUsername;
                            }
                            messageResponse.push(result + " le " +dateFormat(msg.createdAt,  "dd mmm")+ " à " + dateFormat(msg.createdAt,  "h:MM:ss"))

                        }
                        fulfill(messageResponse)
                    })
            }
        )

    },
    getGuild: function(msgGuild){

        return new Promise(
            function (resolve, reject) {
                return Guild.findOne({ 'guildId': msgGuild.id }, function (err, guild) {
                    if (err|| guild == null) {
                        guild = new Guild({
                            guildId: msgGuild.id,
                            name: msgGuild.name
                        });
                        guild.save();
                    }
                    resolve(guild)
            })
        })
    },
    getChannel: function(msgChannel, guild){

        return new Promise(
            function (resolve, reject) {
                return Channel.findOne({ 'channelId': msgChannel.id }, function (err, channel) {
                    if (err|| channel == null) {
                        channel = new Channel({
                            channelId: msgChannel.id,
                            name: msgChannel.name,
                            _guild: guild._id
                        });
                        channel.save();
                    }
                    resolve(channel);
                })
        })
    },
    getUser: function(msgUser){

        return new Promise(
            function (resolve, reject) {
                return User.findOne({ 'userId': msgUser.id }, function (err, user) {
                    if (err || user == null) {
                        user = new User({
                            userId: msgUser.id,
                            currentUsername: msgUser.username,
                            usernames: []
                        });
                        user.save();
                    }else{
                        if(user.currentUsername != msgUser.username)
                        {
                            user.usernames.push(user.currentUsername);
                            user.currentUsername = msgUser.username;
                            user.save();
                        }
                    }
                    resolve(user)
                })
            })
    },
    save : function(msg){
        return this.getGuild(msg.guild)
            .then(function(guild){
                var channelPro = Manager.getChannel(msg.channel, guild)

                var userPro = Manager.getUser(msg.member.user);
                return Promise.all([channelPro, userPro]).then(([channel, user]) => {
                    var attachments = [];
                    var contentMsg = "message \"" + msg.content + "\"";
                    var attachment = msg.attachments.first();
                    if(attachment)
                    {
                        if(msg.content == ''){
                            contentMsg = 'picture'
                        }else{
                            contentMsg = contentMsg + ' with picture';
                        }
                        attachments.push({
                            url: attachment.url,
                            filename: attachment.filename
                        })
                    }

                    var msgToSave = new Msg({
                        msgId: msg.id,
                        content: msg.content,
                        attachments: attachments,
                        createdAt: new Date(),
                        _user: user._id,
                        _channel: channel._id
                    });
                    msgToSave.save(function (err, msgsaved) {
                        if (err) {
                            console.log("Cannot save deleted " + contentMsg + " from " + msg.member.user.username + " on channel \"#" + msg.channel.name + "\" from server \"" + msg.guild.name + "\"");
                            return;
                        }
                        console.log("Saved deleted " + contentMsg + " from " + msg.member.user.username + " on channel \"#" + msg.channel.name + "\" from server \"" + msg.guild.name + "\"");
                    });
                });
            });

    }
}
module.exports = {
    save: function(msg) {
       Manager.save(msg)
    },
    getLastMessages: function (nb) {
        return Manager.getLastMessages(nb)
    }
}