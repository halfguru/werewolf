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
    var game = xd.getCurrentGame();
    return game.roles;
  },
  description: function () {
    return characters[xd.getIndex()].description;
  },
  char_img: function(){
    return characters[xd.getIndex()].img;
  },
  char_height: function(){
    return characters[xd.getIndex()].height;
  },
  char_width: function(){
    return characters[xd.getIndex()].width;
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

  if (Players.findOne({role: 'Werewolf' }) && Players.findOne({role: 'Werewolf'}).state == "alive"){
    Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "werewolf"}});
  }
  /*
  else if (Players.findOne({role: 'Seer' }) && Players.findOne({role: 'Seer'}).state == "alive"){
    Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "seer"}});
  }
  else if (Players.findOne({role: 'Witch' }) && Players.findOne({role: 'Witch'}).state == "alive"){
    Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "witch"}});
  }
  */
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
    var game = xd.getCurrentGame();
    return game.roles;
  },
  char_img: function(){
    return characters[xd.getIndex()].img;
  },

  char_height: function(){
    return characters[xd.getIndex()].height;
  },
  char_width: function(){
    return characters[xd.getIndex()].width;
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
    if (Players.findOne({killedby: 'Werewolf'})){
      return Players.find({'gameID': game._id, 'killedby': 'Werewolf'}).fetch()[0].name;
    }
    else{
      return "No one"
    }
}});

Template.night.events({
  'click .btn-leave': xd.leaveGame,
  'click .btn-werewolf-turn': function () {
    $(".btn-werewolf-turn").attr('disabled', true);
    let playerID = Session.get("playerID");
    let game = Games.findOne(Session.get("gameID"));
    player = Players.findOne(playerID);
    player_selected = this._id;
    //Players.update(player._id, {$set: {vote: true}});
    Players.update(player_selected, {$set: {state: "dead"}});
    Players.update(player_selected, {$set: {killedby: "Werewolf"}});

    if (Players.findOne({role: 'Seer' }) && Players.findOne({role: 'Seer'}).state == "alive"){
        Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "seer"}});
    }
    else if (Players.findOne({role: 'Witch' }) && Players.findOne({role: 'Witch'}).state == "alive"){
        Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "witch"}});
    }
    else{
        Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {state: "day"}});
        Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "day"}});
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
    if (Players.findOne({role: 'Witch'}).state == "dead"){
      Games.update(game._id, {$set: {turn: 'day'}});
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

  if (playerID === game.owner){
      Games.update(game._id, {$set: {round: game.round+1}});
    }

  if (Players.findOne({role: 'Hunter' })){
      if (Players.findOne({role: 'Hunter'}).state == "dead" && game.hunterKill != 1){
        Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "hunter"}});
        Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {hunterKill: 1}});
      }
      else{
        xd.tts("It's daytime, the village wakes up, everyone raise their heads, open their eyes. The village will now vote for who to kill.");
      }
    }

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
    var game = xd.getCurrentGame();
    return game.roles;
  },

  char_img: function(){
    return characters[xd.getIndex()].img;
  },

  char_height: function(){
    return characters[xd.getIndex()].height;
  },
  char_width: function(){
    return characters[xd.getIndex()].width;
  },

  dead: function() {
    player = xd.getCurrentPlayer();
    //If player is hunter
    if (Players.findOne({role: 'Hunter' }) && player.role == 'Hunter'){
      return Games.findOne(Session.get("gameID")).turn != "hunter" && player.state == "dead";
    }
    else{
      return xd.dead();
    }
  },

  hunter: function() {
    playerID = Session.get("playerID");
    player = Players.findOne(playerID);
    return player.role == "Hunter";
  },

  hunter_turn: function(){
    if (Players.findOne({role: 'Hunter' })){
      return Games.findOne(Session.get("gameID")).turn == "hunter";
    }
  },

  hunter_dead: function(){
    return Players.findOne({role: 'Hunter' }).name;
  },

  deadNight: function(){
    var dead = [];
    game = Games.findOne(Session.get("gameID"));
    deadWerewolf =  Players.find({'gameID': game._id, 'state': 'dead', 'killedby': 'Werewolf'}).fetch();
    deadWitch =  Players.find({'gameID': game._id, 'state': 'dead', 'killedby': 'Witch'}).fetch();
    deadHunter =  Players.find({'gameID': game._id, 'state': 'dead', 'killedby': 'Hunter'}).fetch();
    if (deadWerewolf!=undefined && deadWerewolf.length > 0){
      dead.push(deadWerewolf[0].name);
    }
    if (deadWitch!=undefined && deadWitch.length > 0){
      dead.push(deadWitch[0].name);
    }
    if (deadHunter!=undefined && deadHunter.length > 0){
      dead.push(deadHunter[0].name);
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

  all_voted: function () {
    var game = xd.getCurrentGame();
    var nbPlayers = Players.find({'gameID': game._id, 'state': 'alive'}).count();
    var nbPlayersVoted = Players.find({'gameID': game._id, 'vote': true}).count();
    var players = Players.find({'gameID': game._id, 'vote': true}).fetch();
    if (nbPlayers == nbPlayersVoted){
      if (xd.voteProcess(game.dayVote) == 0){
        //put every vote to false
        for (var i = 0; i < players.length; i++) {
          Players.update(players[i]._id, {$set: {vote: false}});
        }
        Games.update(game._id, {$set: {dayState: 'draw'}});
        Games.update(game._id, {$set: {dayVote: []}});

        for (var i = 0; i < players.length; i++) {
          Players.update(players[i]._id, {$set: {dayVoteButton: 'enable'}});
        }
      }
      else{
        Games.update(game._id, {$set: {dayState: null}});
        Players.update(xd.voteProcess(game.dayVote), {$set: {state: 'dead'}});
        Players.update(xd.voteProcess(game.dayVote), {$set: {killedby: 'Village'}});
        if (xd.win() == 1){
          Games.update(game._id, {$set: {state: 'win'}});
        }
        else if (xd.win() == 0){
          Games.update(game._id, {$set: {state: 'lose'}});
        }
        else{
          Games.update(game._id, {$set: {state: 'dayEnd'}});
        }
      }


      return true;
    }
    else{
      return false;
    }
  },
  vote_was_equal: function () {
    var game = xd.getCurrentGame();
    var player = xd.getCurrentPlayer();
    if (player.dayVoteButton == 'enable'){
      $(".btn-day-vote").attr('disabled', false);
      Players.update(player._id, {$set: {dayVoteButton: 'disable'}});
    }
    return game.dayState == "draw";
  }

});
Template.day.events({
  'click .btn-toggle-status': function () {
    $(".status-container-content").toggle();
  },

  'click .btn-hunter-turn': function () {
    var player = xd.getCurrentPlayer();
    Players.update(this._id, {$set: {state: 'dead'}});
    Players.update(this._id, {$set: {killedby: 'Hunter'}});
    Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "day"}});
  },

  'click .btn-day-vote': function () {
    $(".btn-day-vote").attr('disabled', true);
    var player = xd.getCurrentPlayer();
    var game = Games.findOne(Session.get("gameID"));
    Players.update(player._id, {$set: {vote: true}});
    Games.update(game._id, {$push: {dayVote: this._id}});
    console.log("pushed this id: " + this._id);
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

Template.dayEnd.rendered = function (event) {

  if (xd.win() == 1){
    Games.update(game._id, {$set: {state: 'win'}});
  }
  else if (xd.win() == 0){
    Games.update(game._id, {$set: {state: 'lose'}});
  }
  else{
  if (Players.findOne({role: 'Hunter' })){
      if (Players.findOne({role: 'Hunter'}).state == "dead" && game.hunterKill != 1){
        Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {turn: "hunter"}});
        Games.update(Games.findOne(Session.get("gameID"))._id, {$set: {hunterKill: 1}});
      }
    else{
      xd.tts("The village chose their victim. Press continue and close your eyes.");
      }
    }
  }
};

Template.dayEnd.helpers({
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
    var game = xd.getCurrentGame();
    return game.roles;
  },

  char_img: function(){
    return characters[xd.getIndex()].img;
  },

  char_height: function(){
    return characters[xd.getIndex()].height;
  },
  char_width: function(){
    return characters[xd.getIndex()].width;
  },

  dead: function() {
    player = xd.getCurrentPlayer();
    //If player is hunter
    if (Players.findOne({role: 'Hunter' }) && player.role == 'Hunter'){
      return Games.findOne(Session.get("gameID")).turn != "hunter" && player.state == "dead";
    }
    else{
      return xd.dead();
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

  hunter: function() {
    var player = xd.getCurrentPlayer();
    return player.role == "Hunter";
  },

  hunter_turn: function(){
    var game = xd.getCurrentGame();
    if (Players.findOne({role: 'Hunter' })){
      return game.turn == "hunter";
    }
  },

  village_vote: function(){
    var game = xd.getCurrentGame();
    deadVillage = Players.find({'gameID': game._id, 'state': 'dead', 'killedby': 'Village'}).fetch();
    if (deadVillage!=undefined && deadVillage.length > 0){
      return deadVillage[0].name
    }
    else{
      return "no one"
    }

  },
  });
Template.dayEnd.events({

    'click .btn-hunter-turn': function () {
      var player = xd.getCurrentPlayer();
      var game = xd.getCurrentGame();
      Players.update(this._id, {$set: {state: 'dead'}});
      Players.update(this._id, {$set: {killedby: 'Hunter'}});
      if (xd.win() == 1){
        Games.update(game._id, {$set: {state: 'win'}});
      }
      else if (xd.win() == 0){
        Games.update(game._id, {$set: {state: 'lose'}});
      }
      else{
        Games.update(game._id, {$set: {turn: "day"}});
      }
    },

    'click .btn-continue': function () {
    $(".btn-continue").attr('disabled', true);
    var game = xd.getCurrentGame();
    var player = xd.getCurrentPlayer();
    var players = Players.find({'state': 'alive'}, {'sort': {'createdAt': 1}}).fetch();
    Players.update(player._id, {$set: {stateDay: 'waitingGameDay'}});
    var nbPlayers = Players.find({stateDay: 'waitingGameDay'}).count();
    if (nbPlayers == players.length){
      //put every vote to false
      var players = Players.find({'gameID': game._id, 'vote': true}).fetch();
      for (var i = 0; i < players.length; i++) {
        Players.update(players[i]._id, {$set: {vote: false}});
        Players.update(players[i]._id, {$set: {stateDay: null}});
      }

      Games.update(game._id, {$set: {dayVote: []}});
      Games.update(game._id, {$set: {state: 'night'}});

      deadWerewolf = Players.find({'gameID': game._id, 'state': 'dead', 'killedby': 'Werewolf'}).fetch();
      deadWitch = Players.find({'gameID': game._id, 'state': 'dead', 'killedby': 'Witch'}).fetch();
      deadHunter = Players.find({'gameID': game._id, 'state': 'dead', 'killedby': 'Hunter'}).fetch();
      deadVillage = Players.find({'gameID': game._id, 'state': 'dead', 'killedby': 'Village'}).fetch();

      if (deadWerewolf!=undefined && deadWerewolf.length > 0){
        Players.update(deadWerewolf[0]._id, {$set: {killedby: null}});
     }
      if (deadWitch!=undefined && deadWitch.length > 0){
        Players.update(deadWitch[0]._id, {$set: {killedby: null}});
      }
      if (deadHunter!=undefined && deadHunter.length > 0){
        Players.update(deadHunter[0]._id, {$set: {killedby: null}});
      }
      if (deadVillage!=undefined && deadVillage.length > 0){
        Players.update(deadVillage[0]._id, {$set: {killedby: null}});
      }


    }
  },
});
