'use strict';

const fs      = require('fs');
const Clapp   = require('./modules/clapp-discord');
const cfg     = require('../config.js');
const pkg     = require('../package.json');
const Discord = require('discord.js');
const bot     = new Discord.Client();
const mongoose = require('mongoose');
var process = require('process');
const url = process.env.MONGOURL;

var app = new Clapp.App({
  name: cfg.name,
  desc: pkg.description,
  prefix: cfg.prefix,
  version: pkg.version,
  onReply: (msg, context) => {
    // Fired when input is needed to be shown to the user.
    context.msg.reply('\n' + msg).then(bot_response => {
      if (cfg.deleteAfterReply.enabled) {
        context.msg.delete(cfg.deleteAfterReply.time)
          .then(msg => console.log(`Deleted message from ${msg.author}`))
          .catch(console.log);
        bot_response.delete(cfg.deleteAfterReply.time)
          .then(msg => console.log(`Deleted message from ${msg.author}`))
          .catch(console.log);
      }
    });
  }
});

mongoose.Promise = require('bluebird');
mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected to mongo db")
});
// Load every command in the commands folder
fs.readdirSync('./lib/commands/').forEach(file => {
  app.addCommand(require("./commands/" + file));
});

bot.on('message', msg => {

  // Fired when someone sends a message
  if (app.isCliSentence(msg.content)) {
    app.parseInput(msg.content, {
      msg: msg,
      guildId : msg.channel.guild.id
      // Keep adding properties to the context as you need them
    });
  }
});
bot.on('messageDelete', msg => {
    app.recordSentence(msg)
})
bot.login(cfg.token).then(() => {
    var http = require('http');

    var server = http.createServer(function(req, res) {
        res.writeHead(200);
        res.end('Running!');
    });
    server.listen(8080);
    console.log('Running!');
});
