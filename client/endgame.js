import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './endgame.html';
var xd = require('./gamelogic');

Template.endgame.rendered = function (event) {
};

Template.endgame.events({

    'click .btn-back': function () {
    Session.set("currentView", "startMenu");
    return false;
  }

});

Template.endgame.helpers({
    won: function(){
        game = xd.getCurrentGame();
        console.log(game.state);
        if (game.state === 'win'){
            return true;
        }
        if (game.state === 'lose'){
            return false;
        }
        }
});
