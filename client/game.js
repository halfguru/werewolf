import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './game.html';
import gl from './gamelogic.js';

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
    Players.update(player._id, {$set: {state: 'waitingGameRole'}});
    var nbPlayers = Players.find({state: 'waitingGameRole'}).count();
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
  let roomId = Session.get("gameID");
  let room = Games.findOne(roomId);
  if(room.round == 1){
    Players.update(player._id, {$set: {state: 'alive'}});
  }
  if (playerId === room.owner){
    Games.update(room._id, {$set: {round: room.round+1}});
  }
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
    return player.vote == true;
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
    //Players.update(player._id, {$set: {vote: true}});
    if (1){
      if (1){
        Players.update(player_selected, {$set: {state: "dead"}});
        Session.set("died", this.role)
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
        Players.update(player._id, {$set: {vote: true}});
      }
      else{
        FlashMessages.sendError("Seers didnt vote for the same person!");

      }
    }
  },

  'click .btn-seer': function () {
    var game = Games.findOne(Session.get("gameID"));
    Games.update(game._id, {$set: {state: 'day'}})
    Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "day"}});
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
  Players.update(player._id, {$set: {vote: false}});

  if (playerId === room.owner){
      Games.update(room._id, {$set: {round: room.round+1}});
      gl.tts("It's daytime, the village wakes up, everyone raise their heads, open their eyes.");
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
  },

  characters: function () {
    return characters;
  },

  dead: function() {
    playerId = Session.get("playerID");
    player = Players.findOne(playerId);
    return player.state == "dead";
  },

  deadNight: function(){
    var dead = [];
    game = Games.findOne(Session.get("gameID"));
    deadLength =  Players.find({'gameID': game._id, 'state': 'dead'}).fetch().length;
    for (var i = 0; i < deadLength; i++) {
      dead.push(Players.find({'gameID': game._id, 'state': 'dead'}, {'sort': {'createdAt': 1}}).fetch()[i].name);
    }
    return dead;
  },

  alive_players: function(){
    var game = gl.getCurrentGame();
    var currentPlayer = gl.getCurrentPlayer();

    if (!game) {
      return null;
    }

    var players = Players.find({'gameID': game._id, 'state': 'alive'}, {'sort': {'createdAt': 1}}).fetch();
    return players;
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
});
Template.day.events({
  'click .btn-toggle-status': function () {
    $(".status-container-content").toggle();
  },

  'click .btn-day-vote': function () {
    $(".btn-day-vote").attr('disabled', true);
    var game = gl.getCurrentGame();
    var player = gl.getCurrentPlayer();
    var players = Players.find({'gameID': game._id}, {'sort': {'createdAt': 1}}).fetch();

    Players.update(player._id, {$set: {vote: true}});
    var nbPlayers = Players.find({'gameID': game._id, 'state': 'alive'}).count();
    var nbPlayersVoted = Players.find({'gameID': game._id, 'vote': true}).count();
    if (nbPlayers == nbPlayersVoted){
      Players.update(player._id, {$set: {vote: false}});
      Players.update(this._id, {$set: {state: 'dead'}});
      Games.update(game._id, {$set: {state: 'night'}});
  }
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
