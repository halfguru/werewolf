import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './game.html';
var xd = require('./gamelogic');

//////////////
//Game Roles//
//////////////

Template.gameRole.rendered = function (event) {
    xd.tts("Read your role attentively, press continue and close your eyes.");
};

Template.gameRole.helpers({
  game: xd.getCurrentGame,
  player: xd.getCurrentPlayer,

  players: function () {
    var game = xd.getCurrentGame();
    var currentPlayer = xd.getCurrentPlayer();

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
    return characters[xd.getIndex()].description;
  },
  char_img: function(){
    return characters[xd.getIndex()].img;
  }
});

Template.gameRole.events({
  'click .btn-leave': xd.leaveGame,
  'click .btn-continue': function () {
    $(".btn-continue").attr('disabled', true);
    var game = xd.getCurrentGame();
    var player = xd.getCurrentPlayer();
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
  let player = Players.findOne(Session.get("playerID"));
  let gameID = Session.get("gameID");
  let game = Games.findOne(gameID);
  Players.update(player._id, {$set: {vote: false}});

  if(game.round == 1){
    Players.update(player._id, {$set: {state: 'alive'}});
  }
  xd.tts("It's the night, everyone is sleeping and has closed their eyes. Werewolves, wake up and look for other werewolves. Now choose your victim.");
  Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "werewolf"}});
};

Template.night.helpers({
  game: xd.getCurrentGame,
  player: xd.getCurrentPlayer,

  room: function() {
    let gameID = Session.get("gameID");
    let game = Games.findOne("gameID");
    return game;
  },

  round: function() {
    let gameID = Session.get("gameID");
    let game = Games.findOne(gameID);
    return game.round;
  },

  characters: function () {
    return characters;
  },
  char_img: function(){
    console.log("image taken");
    return characters[xd.getIndex()].img;
  },

  players: function () {
    var game = xd.getCurrentGame();
    var currentPlayer = xd.getCurrentPlayer();
    if (!game) {
      return null;
    }
    var players = Players.find({'gameID': game._id}, {'sort': {'createdAt': 1}}).fetch();
    return players;
  },

  alive_players: function(){
    var game = xd.getCurrentGame();
    var currentPlayer = xd.getCurrentPlayer();

    if (!game) {
      return null;
   }

    var players = Players.find({'gameID': game._id, 'state': 'alive'}, {'sort': {'createdAt': 1}}).fetch();
    return players;
  },

  dead: function() {
    return xd.dead();
  },

  voted: function() {
    playerID = Session.get("playerID");
    player = Players.findOne(playerID);
    return player.vote == true;
  },

  werewolf: function() {
    playerID = Session.get("playerID");
    player = Players.findOne(playerID);
    return player.role == "Werewolf";
  },
  werewolf_turn: function(){
    return Games.findOne(Session.get("gameID")).turn == "werewolf";
  },

  seer: function() {
    playerID = Session.get("playerID");
    player = Players.findOne(playerID);
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
  },

   seer_dead: function(){
      return seer_dead = Players.findOne({role: 'Seer'}).state == "dead";

   },

  witch_turn: function(){
    return Games.findOne(Session.get("gameID")).turn == "witch";
  },
  witch: function() {
    playerID = Session.get("playerID");
    player = Players.findOne(playerID);
    return player.role == "Witch";
  },

  witch_dead: function(){
    return witch_dead = Players.findOne({role: 'Witch'}).state == "dead";
  },

  potion_save: function() {
    playerID = Session.get("playerID");
    player = Players.findOne(playerID);
    return player.potion_save == null;
  },

   potion_kill: function() {
    playerID = Session.get("playerID");
    player = Players.findOne(playerID);
    return player.potion_kill == null;
  },

  killed_werewolf: function() {
    let game = xd.getCurrentGame();
    return Players.find({'gameID': game._id, 'killedby': 'Werewolf'}).fetch()[0].name;
  }
});

Template.night.events({
  'click .btn-leave': xd.leaveGame,
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
        Players.update(player_selected, {$set: {killedby: "Werewolf"}});
        seer_dead = Players.findOne({role: 'Seer'}).state == "dead";
        witch_dead = Players.findOne({role: 'Witch'}).state == "dead";
        if (seer_dead){
          if (witch_dead){
             Games.update(game._id, {$set: {state: 'day'}});
          }
          else{
             Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "witch"}})
            }
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
    var witch_dead = Players.findOne({role: 'Witch'}).state == "dead";
    var game = Games.findOne(Session.get("gameID"));
    if (witch_dead){
      Games.update(game._id, {$set: {state: 'day'}});
    }
    else{
      Games.update(game._id, {$set: {turn: 'witch'}});
    }
  },

  'click .btn-witch-kill': function () {
    Players.update(player._id, {$set: {vote: true}});

  },

  'click .btn-witch-kill-who': function () {
    var player = xd.getCurrentPlayer();
    Players.update(this._id, {$set: {state: 'dead'}});
    Players.update(this._id, {$set: {killedby: 'Witch'}});
    Players.update(player._id, {$set: {potion_kill: true}});
    Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {state: "day"}});
    Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "day"}});

  },

  'click .btn-witch-save': function () {
      var player = xd.getCurrentPlayer();
      var game = Games.findOne(Session.get("gameID"));
      var player_ww = Players.find({'gameID': game._id, 'killedby': 'Werewolf'}).fetch()[0];
      Players.update(player_ww._id, {$set: {state: "alive"}});
      Players.update(player._id, {$set: {potion_save: true}});
      Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {state: "day"}});
      Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "day"}});

  },

  'click .btn-witch-nothing': function () {
    Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {state: "day"}});
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

  let playerID = Session.get("playerID");
  let gameID = Session.get("gameID");
  let game = Games.findOne(gameID);

  if (xd.win() == 1){
      Games.update(game._id, {$set: {state: 'win'}});
    }
  else if (xd.win() == 0){
      Games.update(game._id, {$set: {state: 'lose'}});
    }
  Players.update(player._id, {$set: {vote: false}});
  xd.tts("It's daytime, the village wakes up, everyone raise their heads, open their eyes. The village will now vote for who to kill.");
  if (playerID === game.owner){
      Games.update(game._id, {$set: {round: game.round+1}});
    }


  //Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "werewolf"}});
};

Template.day.helpers({
  game: xd.getCurrentGame,
  player: xd.getCurrentPlayer,

  room: function() {
    let gameID = Session.get("gameID");
    let game = Games.findOne("gameID");
    return game;
  },

  round: function() {
    let gameID = Session.get("gameID");
    let game = Games.findOne(gameID);
    return game.round;
  },

  characters: function () {
    return characters;
  },

  char_img: function(){
    console.log("image taken");
    return characters[xd.getIndex()].img;
  },

  dead: function() {
    return xd.dead();
  },

  deadNight: function(){
    var dead = [];
    game = Games.findOne(Session.get("gameID"));
    deadLength =  Players.find({'gameID': game._id, 'state': 'dead'}).fetch().length;
    for (var i = 0; i < deadLength; i++) {
      dead.push(Players.find({'gameID': game._id, 'state': 'dead'}, {'sort': {'createdAt': 1}}).fetch()[i].name);
    }
     if (dead!=undefined && dead.length > 0){
        return dead;
     }
     else{
      return "nobody";
     }
  },

  alive_players: function(){
    var game = xd.getCurrentGame();
    var currentPlayer = xd.getCurrentPlayer();

    if (!game) {
      return null;
    }

    var players = Players.find({'gameID': game._id, 'state': 'alive'}, {'sort': {'createdAt': 1}}).fetch();
    return players;
  },

  players: function () {
    var game = xd.getCurrentGame();
    var currentPlayer = xd.getCurrentPlayer();

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
    var player = xd.getCurrentPlayer();
    Players.update(player._id, {$set: {vote: true}});
    var game = Games.findOne(Session.get("gameID"));
    var players = Players.find({'gameID': game._id}, {'sort': {'createdAt': 1}}).fetch();
    var nbPlayers = Players.find({'gameID': game._id, 'state': 'alive'}).count();
    var nbPlayersVoted = Players.find({'gameID': game._id, 'vote': true}).count();
    if (nbPlayers == nbPlayersVoted){
      Players.update(player._id, {$set: {vote: false}});




      Players.update(this._id, {$set: {state: 'dead'}});
      if (xd.win() == 1){
          Games.update(game._id, {$set: {state: 'win'}});
        }
        else if (xd.win() == 0){
          Games.update(game._id, {$set: {state: 'lose'}});
        }
        else{
          Games.update(game._id, {$set: {state: 'night'}});
      }
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
