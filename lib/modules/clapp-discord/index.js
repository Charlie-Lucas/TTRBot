"use strict";

const Clapp = require('clapp')
  , Table = require('cli-table2')
  , str   = require('./str-en.js')
    ,parseSentence = require("minimist-string");
var manager = require("../mongo/manager")

class App extends Clapp.App {
  constructor(options) {
    super(options);
  }
  parseInput(input, context) {
      this.context = context;
      var cmdValid = false;
      var argv = parseSentence(input.replace(this.prefix + this.separator, ""));
      var userInputCommand = argv._[0];
      for (var name in this.commands) {
          var command = this.commands[name];
          var validCommandName = command.caseSensitive ? name : name.toLowerCase();
          var validUserInput = command.caseSensitive ? userInputCommand : userInputCommand.toLowerCase();
          if (validCommandName === validUserInput && (command.restrictions == false || (command.restrictions.length > 0 && command.restrictions.includes(context.guildId)))) {
              cmdValid = true;
              break;
          }
      }
      if(cmdValid == false)
      {
          input = this.prefix
      }
      Clapp.App.prototype.parseInput.call(this, input, context)
      delete this.context;
  }

  _getHelp() {
      const LINE_WIDTH = 175;

      var r =
              str.help_usage + this.prefix + this.separator + str.help_command + '\n' +

              str.help_cmd_list
          ;

      // Command list
      var table = new Table({
          chars: {
              'top': '', 'top-mid': '', 'top-left': '', 'top-right': '', 'bottom': '',
              'bottom-mid': '', 'bottom-left': '', 'bottom-right': '', 'left': '',
              'left-mid': '', 'mid': '', 'mid-mid': '', 'right': '', 'right-mid': '',
              'middle': ''
          },
          colWidths: [
              Math.round(0.15 * LINE_WIDTH), // We round it because providing a decimal number would
              Math.round(0.65 * LINE_WIDTH)  // break cli-table2
          ],
          wordWrap: true
      });
      if (this.hasOwnProperty('context'))
      {
          for (var i in this.commands) {
              var command = this.commands[i]
              if (command.restrictions == false || command.restrictions.length == 0 || command.restrictions.includes(this.context.guildId)) {
                  table.push([i, this.commands[i].desc]);
              }
          }
      }else {
          for (var i in this.commands) {
              table.push([i, this.commands[i].desc]);
          }
      }


    r +=
      '```' + table.toString() + '```\n'
    //  str.help_further_help + this.prefix + ' ' + str.help_command + ' --help'
    ;

    return r;
  }
}
App.prototype.recordSentence = function(msg){
    var isBot = false
    if(msg.member != null)
    {
        for (var i = 0; i < msg.member.roles.length; i++) {
            var role = msg.member.roles[i]
            if(role.name.toLowerCase() == "bot")
            {
                isBot = true;
                break;
            }
        }
        if(msg.member.user.bot == true){
            isBot = true;
        }
    }
    if(isBot == false)
    {
        manager.save(msg);
    }
}




class Command extends Clapp.Command {
    constructor(options) {
        super(options);
        this.restrictions = options.restrictions || false;
    }

    _getHelp(app) {
        const LINE_WIDTH = 175;

        var r = str.help_usage + ' ' + app.prefix + ' ' + this.name;

        // Add every argument to the usage (Only if there are arguments)
        if (Object.keys(this.args).length > 0) {
            var args_table = new Table({
                chars: {
                    'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': '', 'bottom': '' ,
                    'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': '', 'left': '' ,
                    'left-mid': '' , 'mid': '' , 'mid-mid': '', 'right': '' , 'right-mid': '' ,
                    'middle': ''
                },
                head: ['Argument', 'Description', 'Default'],
                colWidths: [
                    Math.round(0.10*LINE_WIDTH),
                    Math.round(0.45*LINE_WIDTH),
                    Math.round(0.25*LINE_WIDTH)
                ],
                wordWrap: true
            });
            for (var i in this.args) {
                r += this.args[i].required ? ' (' + i + ')' : ' [' + i + ']';
                args_table.push([
                    i,
                    typeof this.args[i].desc !== 'undefined' ?
                        this.args[i].desc : '',
                    typeof this.args[i].default !== 'undefined' ?
                        this.args[i].default : ''
                ]);
            }
        }

        r += '\n' + this.desc;

        if (Object.keys(this.args).length > 0)
            r += '\n\n' + str.help_av_args + ':\n\n```' + args_table.toString() + '```';

        // Add every flag, only if there are flags to add
        if (Object.keys(this.flags).length > 0) {
            var flags_table = new Table({
                chars: {
                    'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': '', 'bottom': '' ,
                    'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': '', 'left': '' ,
                    'left-mid': '' , 'mid': '' , 'mid-mid': '', 'right': '' , 'right-mid': '' ,
                    'middle': ''
                },
                head: ['Option', 'Description', 'Default'],
                colWidths: [
                    Math.round(0.10*LINE_WIDTH),
                    Math.round(0.45*LINE_WIDTH),
                    Math.round(0.25*LINE_WIDTH)
                ],
                wordWrap: true
            });
            for (i in this.flags) {
                flags_table.push([
                    (typeof this.flags[i].alias !== 'undefined' ?
                        '-' + this.flags[i].alias + ', ' : '') + '--' + i,
                    typeof this.flags[i].desc !== 'undefined' ?
                        this.flags[i].desc : '',
                    typeof this.flags[i].default !== 'undefined' ?
                        this.flags[i].default : ''
                ]);
            }

            r += '\n\n' + str.help_av_options + ':\n\n```' + flags_table.toString() + '```';
        }

        if (Object.keys(this.args).length > 0)
            r += '\n\n' + str.help_args_required_optional;

        return r;
    }
}
Command.prototype.restrictions = [];
//Command.prototype.isAuthorized()

module.exports = {
  App: App,
  Argument: Clapp.Argument,
  Command: Command,
  Flag: Clapp.Flag
};
