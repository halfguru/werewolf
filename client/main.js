import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './werewolf.html';
import gl from './gamelogic.js';

Meteor.setInterval(function () {
  Session.set('time', new Date());
}, 1000);

//Converts game code to uppercase in html
Handlebars.registerHelper('toCapitalCase', function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
});

//Whenever dependencies changes, rerun.
Tracker.autorun(gl.trackGameState);

//Indicate if game code is correct or no
FlashMessages.configure({
  autoHide: true,
  autoScroll: false
});


//////////////
/////MAIN/////
//////////////

Template.main.rendered = function() {
  $.getScript("//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", function() {
    var ads, adsbygoogle;
    ads = '<ins class="adsbygoogle" style="display:block;" data-ad-client="ca-pub-3450817379541922" data-ad-slot="4101511012" data-ad-format="auto"></ins>';
    $('.adspace').html(ads);
    return (adsbygoogle = window.adsbygoogle || []).push({});
  });
};

Template.main.helpers({
  whichView: function() {
    return Session.get('currentView');
  },
  language: function() {
    //return getUserLanguage();
  },
  textDirection: function() {
    //return getLanguageDirection();
  }
});
//////////////
//START MENU//
//////////////

Template.startMenu.rendered = function () {
  gl.resetUserState();
};

Template.startMenu.events({
  'click #btn-new-game': function () {
    Session.set("currentView", "createGame");
  },
  'click #btn-join-game': function () {
    Session.set("currentView", "joinGame");
  }
});

Template.startMenu.helpers({
  announcement: function() {
    return Meteor.settings.public.announcement;
  },
  alternativeURL: function() {
    return Meteor.settings.public.alternative;
  }
});

//////////////
//CREATE GAME/
//////////////

Template.createGame.rendered = function (event) {
  $("#player-name").focus();
};

Template.createGame.events({
  'submit #create-game': function (event) {
    var playerName = event.target.playerName.value;

    if (!playerName || Session.get('loading')) {
      return false;
    }

    var game = gl.generateNewGame();
    var player = gl.generateNewPlayer(game, playerName);

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

//////////////
////LOBBY/////
//////////////

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

//////////////
//JOIN GAME///
//////////////

Template.joinGame.rendered = function (event) {
  gl.resetUserState();

  var urlAccessCode = Session.get('urlAccessCode');

  if (urlAccessCode){
    $("#access-code").val(urlAccessCode);
    $("#access-code").hide();
    $("#player-name").focus();
  } else {
    $("#access-code").focus();
  }
};

Template.joinGame.events({
  'submit #join-game': function (event) {

    var accessCode = event.target.accessCode.value;
    var playerName = event.target.playerName.value;

    if (!playerName || Session.get('loading')) {
      return false;
    }

    accessCode = accessCode.trim();
    accessCode = accessCode.toLowerCase();

    Session.set("loading", true);

    Meteor.subscribe('games', accessCode, function onReady(){
      Session.set("loading", false);

      var game = Games.findOne({
        accessCode: accessCode
      });

      if (game) {
        Meteor.subscribe('players', game._id);
        player = gl.generateNewPlayer(game, playerName);

        if (game.state === "inProgress") {
        }

        Session.set('urlAccessCode', null);
        Session.set("gameID", game._id);
        Session.set("playerID", player._id);
        Session.set("currentView", "lobby");
      } else {
        FlashMessages.sendError("Invalid access code");
      }
    });

    return false;
  },
  'click .btn-back': function () {
    Session.set('urlAccessCode', null);
    Session.set("currentView", "startMenu");
    return false;
  }
});

Template.joinGame.helpers({
  isLoading: function() {
    return Session.get('loading');
  }

});

//////////////
//Game Roles//
//////////////

Template.gameRole.rendered = function (event) {
  gl.tts("Read your role attentively, press continue and close your eyes.");

};

Template.gameRole.helpers({
  game: gl.getCurrentGame,
  player: gl.getCurrentPlayer,

  players: function () {
    var game = gl.getCurrentGame();
    var currentPlayer = gl.getCurrentPlayer();

    if (!game) {
      return null;
    }

    var players = Players.find({'gameID': game._id}, {'sort': {'createdAt': 1}}).fetch();
    return players;
  },


  characters: function () {
    return characters;
  },
  description: function () {
    return characters[gl.getIndex()].description;
  },
  gameFinished: function () {
  }
});

Template.gameRole.events({
  'click .btn-leave': gl.leaveGame,
  'click .btn-continue': function () {
    $(".btn-continue").attr('disabled', true);
    var game = gl.getCurrentGame();
    var player = gl.getCurrentPlayer();
    var players = Players.find({'gameID': game._id}, {'sort': {'createdAt': 1}}).fetch();
    Players.update(player._id, {$set: {state: 'waitingForPlayersInGame'}});
    var nbPlayers = Players.find({state: 'waitingForPlayersInGame'}).count();
    if (nbPlayers == players.length){
      Games.update(game._id, {$set: {state: 'night'}});
    }
  },
  'click .btn-toggle-status': function () {
    $(".status-container-content").toggle();
  },
  'click .player-name': function (event) {
    event.currentTarget.className = 'player-name-striked';
  },
  'click .player-name-striked': function(event) {
    event.currentTarget.className = 'player-name';
  },
  'click .location-name': function (event) {
    event.target.className = 'location-name-striked';
  },
  'click .location-name-striked': function(event) {
    event.target.className = 'location-name';
  }
});



//////////////
////Night/////
//////////////

Template.night.rendered = function (event) {
  gl.tts("Werewolves, wake up and look for other werewolves");
  Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "werewolf"}});
};

Template.night.helpers({
  game: gl.getCurrentGame,
  player: gl.getCurrentPlayer,

  room: function() {
    let roomId = Session.get("gameID");
    let room = Games.findOne("gameID");
    return room;
  },

  round: function() {
    let roomId = Session.get("gameID");
    let room = Games.findOne(roomId);
    return room.round;
  },

  characters: function () {
    return characters;
  },

  players: function () {
    var game = gl.getCurrentGame();
    var currentPlayer = gl.getCurrentPlayer();

    if (!game) {
      return null;
    }

    var players = Players.find({'gameID': game._id}, {'sort': {'createdAt': 1}}).fetch();
    return players;
  },

  dead: function() {
    playerId = Session.get("playerID");
    player = Players.findOne(playerId);
    return player.state == "dead";
  },

  voted: function() {
    playerId = Session.get("playerID");
    player = Players.findOne(playerId);
    return player.voted == true;
  },

  werewolf: function() {
    playerId = Session.get("playerID");
    player = Players.findOne(playerId);
    return player.role == "Werewolf";
  },
  werewolf_turn: function(){
    return Games.findOne(Session.get("gameID")).turn == "werewolf";
  },

  seer: function() {
    playerId = Session.get("playerID");
    player = Players.findOne(playerId);
    return player.role == "Seer";
  },
  seer_turn: function(){
    return Games.findOne(Session.get("gameID")).turn == "seer";
  },

   seer_name: function(){
    return Session.get("seer_name");
  },

   seer_role: function(){
    return Session.get("seer_role");
  }
});

Template.night.events({
  'click .btn-leave': gl.leaveGame,
  'click .btn-werewolf-turn': function () {
    $(".btn-werewolf-turn").attr('disabled', true);
    let playerID = Session.get("playerID");
    let game = Games.findOne(Session.get("gameID"));
    player = Players.findOne(playerID);
    player_selected = this._id;
    Players.update(player._id, {$set: {voted: true}});
    if (1){
      if (1){
        Players.update(player_selected, {$set: {state: "dead"}});
        seer_dead = Players.findOne({role: 'Seer'}).state == "dead";
        if (seer_dead){
          Games.update(game._id, {$set: {state: 'day'}});
        }
        else{
          Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "seer"}})
        }

      }
      else{
        FlashMessages.sendError("Werewolves didnt vote for the same person!");

      }
    }
  },

  'click .btn-seer-turn': function () {
    $(".btn-seer-turn").attr('disabled', true);
    var playerID = Session.get("playerID");
    player = Players.findOne(playerID);
    Session.set("seer_name",this.name);
    Session.set("seer_role",this.role);

    if (1){
      if (1){
        Players.update(player._id, {$set: {voted: true}});
      }
      else{
        FlashMessages.sendError("Seers didnt vote for the same person!");

      }
    }
  },

  'click .btn-seer': function () {
    var game = Games.findOne(Session.get("gameID"));
    Games.update(game._id, {$set: {state: 'day'}})
  },



  'click .btn-toggle-status': function () {
    $(".status-container-content").toggle();
  },
  'click .player-name': function (event) {
    event.currentTarget.className = 'player-name-striked';
  },
  'click .player-name-striked': function(event) {
    event.currentTarget.className = 'player-name';
  },
  'click .location-name': function (event) {
    event.target.className = 'location-name-striked';
  },
  'click .location-name-striked': function(event) {
    event.target.className = 'location-name';
  }
});

//////////////
/////Day//////
//////////////

Template.day.rendered = function (event) {
  let playerId = Session.get("playerID");
  let roomId = Session.get("gameID");
  let room = Games.findOne(roomId);

  if (playerId === room.owner){
      Games.update(room._id, {$set: {round: room.round+1}});
      gl.tts("It's the day");
    }

  //Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "werewolf"}});
};

Template.day.helpers({
  game: gl.getCurrentGame,
  player: gl.getCurrentPlayer,

  room: function() {
    let roomId = Session.get("gameID");
    let room = Games.findOne("gameID");
    return room;
  },

  round: function() {
    let roomId = Session.get("gameID");
    let room = Games.findOne(roomId);
    return room.round;
  }
});
Template.day.events({
  'click .btn-toggle-status': function () {
    $(".status-container-content").toggle();
  }
});

//////////////
////FOOTER////
//////////////
/*
Template.footer.helpers({
 // languages: getLanguageList
})

Template.footer.events({
  'click .btn-set-language': function (event) {
    //var language = $(event.target).data('language');
    //setUserLanguage(language);
  },
  'change .language-select': function (event) {
    //var language = event.target.value;
    //setUserLanguage(language);
  }
})
*/
