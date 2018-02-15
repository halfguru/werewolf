import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './lobby.html';
import gl from './gamelogic.js';

Template.lobby.rendered = function (event) {
  var url = gl.getAccessLink();
  var qrcodesvg = new Qrcodesvg(url, "qrcode", 250);
  qrcodesvg.draw();
};

Template.lobby.events({
  'click .btn-leave': gl.leaveGame,
  'click .btn-start': function () {
    var game = gl.getCurrentGame();
    Games.update(game._id, {$set: {state: 'lobby'}});
  },
  'click .btn-toggle-qrcode': function () {
    $(".qrcode-container").toggle();
  },
  'click .btn-remove-player': function (event) {
    var playerID = $(event.currentTarget).data('player-id');
    Players.remove(playerID);
  },
  'click .btn-edit-player': function (event) {
    var game = gl.getCurrentGame();
    gl.resetUserState();
    Session.set('urlAccessCode', game.accessCode);
    Session.set('currentView', 'joinGame');
  }
});

Template.lobby.helpers({
  game: function () {
    return gl.getCurrentGame();
  },
  accessLink: function () {
    return gl.getAccessLink();
  },
  player: function () {
    return gl.getCurrentPlayer();
  },
  players: function () {
    var game = gl.getCurrentGame();
    var currentPlayer = gl.getCurrentPlayer();

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
    var game = gl.getCurrentGame();
    return game.state === 'lobby';
  },

  owner: function() {
    let playerId = Session.get("playerID");
    let roomId = Session.get("gameID");
    let room = Games.findOne(roomId);

    return playerId === room.owner;
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
