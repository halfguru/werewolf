import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './createGame.html';
var xd = require('./gamelogic');

Template.createGame.rendered = function (event) {
  $("#player-name").focus();
};

Template.createGame.events({
  'submit #create-game': function (event) {
    var playerName = event.target.playerName.value;

    if (!playerName || Session.get('loading')) {
      return false;
    }

    var game = xd.generateNewGame();
    var player = xd.generateNewPlayer(game, playerName);

    Meteor.subscribe('games', game.accessCode);
    Session.set("loading", true);
    Meteor.subscribe('players', game._id, function onReady(){
      Session.set("loading", false);
      Session.set("gameID", game._id);
      Session.set("playerID", player._id);
      Session.set("currentView", "lobby");

    Games.update(game._id, {$set: {owner: player._id}});
    });

    return false;
  },
  'click .btn-back': function () {
    Session.set("currentView", "startMenu");
    return false;
  }
});

Template.createGame.helpers({
  isLoading: function() {
    return Session.get('loading');
  }
});
