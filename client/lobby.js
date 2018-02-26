import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './lobby.html';
var xd = require('./gamelogic');

Template.lobby.rendered = function (event) {
  var url = xd.getAccessLink();
  var qrcodesvg = new Qrcodesvg(url, "qrcode", 250);
  qrcodesvg.draw();
};

Template.lobby.events({
  'click .btn-leave': xd.leaveGame,
  'click .btn-toggle-qrcode': function () {
    $(".qrcode-container").toggle();
  },
  'click .btn-remove-player': function (event) {
    var playerID = $(event.currentTarget).data('player-id');
    Players.remove(playerID);
  },
  'click .btn-edit-player': function (event) {
    var game = xd.getCurrentGame();
    xd.resetUserState();
    Session.set('urlAccessCode', game.accessCode);
    Session.set('currentView', 'joinGame');
  },

   'submit #choose-roles-form': function(event) {

    /*
    var game = xd.getCurrentGame();
    var players = Players.find({'gameID': game._id}).count()
    if (players > 0){
      Games.update(game._id, {$set: {state: 'lobby'}});
    }
    else{
      FlashMessages.sendError("You need at least 2 people!");

    }
    */
    var gameID = xd.getCurrentGame()._id;
    var players = Players.find({'gameID': gameID});

    if ($('#choose-roles-form').find(':checkbox:checked').length >= players.count() + 0) {
      var selectedRoles = $('#choose-roles-form').find(':checkbox:checked').map(function() {
        return characters[this.value];
      }).get();
      Games.update(gameID, {$set: {state: 'lobby', roles: selectedRoles}});
      Session.set('errorMessage', null);
    } else {
      FlashMessages.sendError('Please select at least ' + (players.count() + 0) + ' roles.');
    }

    return false;
  }
});

Template.lobby.helpers({

  roleKeys: function() {
    var roleKeys = [];
    for (key in characters) {
      roleKeys.push({ key : key, name : characters[key].name });
    }
    return roleKeys;
  },
  game: function () {
    return xd.getCurrentGame();
  },
  accessLink: function () {
    return xd.getAccessLink();
  },
  player: function () {
    return xd.getCurrentPlayer();
  },
  players: function () {
    var game = xd.getCurrentGame();
    var currentPlayer = xd.getCurrentPlayer();

    if (!game) {
      return null;
    }

    var players = Players.find({'gameID': game._id}, {'sort': {'createdAt': 1}}).fetch();

    players.forEach(function(player){
      if (player._id === currentPlayer._id){
        player.isCurrent = true;
      }
    });

    return players;
  },
  isLoading: function() {
    var game = xd.getCurrentGame();
    return game.state === 'lobby';
  },

  owner: function() {
    let playerID = Session.get("playerID");
    let gameID = Session.get("gameID");
    let game = Games.findOne(gameID);

    return playerID === game.owner;
  },

  ready: function(players) {
      let attributes = {};
      if (players.length < 1) {
        attributes["disabled"] = true;
      } else {
        attributes["disabled"] = false;
      }
      return attributes;
  }
});
