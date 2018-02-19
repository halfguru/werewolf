
module.exports = {

  generateAccessCode: function(){
    var code = "";
    var dict = "abcdefghijklmnopqrstuvwxyz";

      for(var i=0; i < 4; i++){
        code += dict.charAt(Math.floor(Math.random() * dict.length));
      }

      return code;
  },

  generateNewGame: function(){
    var game = {
      accessCode: module.exports.generateAccessCode(),
      state: "waitingForPlayers",
      owner: null,
      round: 1,
      turn: null
    };

    var gameID = Games.insert(game);
    game = Games.findOne(gameID);

    return game;
  },

  generateNewPlayer: function(game, name){
    var player = {
      gameID: game._id,
      name: name,
      role: null,
      state: null,
      vote: false,
      killedby: null
    };

    var playerID = Players.insert(player);

    return Players.findOne(playerID);
  },

  getCurrentPlayer: function(){
    var playerID = Session.get("playerID");

    if (playerID) {
      return Players.findOne(playerID);
      }
    },

  resetUserState: function() {
    var player = Players.findOne(Session.get("playerID"));

    if (player){
      Players.remove(player._id);
    }

    Session.set("gameID", null);
    Session.set("playerID", null);
    },

  getCurrentGame: function(){
    var gameID = Session.get("gameID");

    if (gameID) {
      return Games.findOne(gameID);
    }
  },

  leaveGame: function() {
    var playerID = Session.get("playerID");

    if (playerID) {
      player=Players.findOne(playerID);
    }

    Session.set("currentView", "startMenu");
    Players.remove(player._id);

    Session.set("playerID", null);
  },

  tts: function(speech){
    let game = this.getCurrentGame();
    let playerID = Session.get("playerID");
    if (playerID === game.owner){
      var msg = new SpeechSynthesisUtterance(speech);
      window.speechSynthesis.speak(msg);
    }
  },

  getIndex: function(){
    playerID =  Players.findOne(Session.get("playerID"));
    for (var i = 0; i < characters.length; ++i) {
      if (characters[i].name === playerID.role) {
        return i;
      }
     }
     return -1;
   },

    getAccessLink: function(){
    var game = Games.findOne(Session.get("gameID"));

    if (!game){
      return;
    }

      return Meteor.settings.public.url + game.accessCode + "/";
    },

  killedby: function(){
    playerID = Session.get("playerID");
    player = Players.findOne(playerID);
    return player.killedby;
  },

  dead: function(){
    playerID = Session.get("playerID");
    player = Players.findOne(playerID);
    console.log("Is the player dead: " +  player.state);
    console.log(player.state == "dead");
    return player.state == "dead";
  },

  win: function(){
    var lost = null;
    var alive = [];
    game = Games.findOne(Session.get("gameID"));
    aliveLength =  Players.find({'gameID': game._id, 'state': 'alive'}).fetch().length;
    for (var i = 0; i < aliveLength; i++) {
      alive.push(Players.find({'gameID': game._id, 'state': 'alive'}, {'sort': {'createdAt': 1}}).fetch()[i].role);
    }

    for (var i = 0; i < alive.length; i++) {
      if (alive[i] == "Werewolf") {
          lost = true;
      }
      else{
          lost = false;
          break;
        }
      }
    if (lost){
      return 0;
    }

    var j = alive.length;
    while (j--) {
       if (alive[j] === "Werewolf") {
        return;
       }
    }
    return 1;
    },

  trackGameState: function() {
    var gameID = Session.get("gameID");
    var playerID = Session.get("playerID");

    if (!gameID || !playerID){
      return;
    }

    var game = Games.findOne(gameID);
    var player = Players.findOne(playerID);

    if (!game || !player){
      Session.set("gameID", null);
      Session.set("playerID", null);
      Session.set("currentView", "startMenu");
      return;
    }

    function tts(speech){
      let playerID = Session.get("playerID");
      if (playerID === game.owner){
        var msg = new SpeechSynthesisUtterance(speech);
        window.speechSynthesis.speak(msg);
      }
    }

    if (game.turn ==="seer"){
        tts("Werewolves have chosen their victim. Seer, wake up and look for another player role.");
    }

    else if (game.turn ==="witch"){
        tts("Witch, wake up and choose an action.");
    }

    if(game.state === "inProgress"){
      Session.set("currentView", "gameRole");
    } else if (game.state === "waitingForPlayers") {
      Session.set("currentView", "lobby");
    } else if (game.state ==="night"){
      Session.set("currentView", "night");
    }
    else if (game.state ==="day"){
      Session.set("currentView", "day");
    }
     else if (game.state === "win"){
      Session.set("currentView", "endgame");
      tts("The villagers win!");
    }
     else if (game.state === "lose"){
      Session.set("currentView", "endgame");
      tts("The werewolves win!");
    }
  }

}

