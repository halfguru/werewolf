class gl {

  static tts(speech){
  var msg = new SpeechSynthesisUtterance(speech);
  //window.speechSynthesis.speak(msg);
  }

  static getIndex(){
  playerID =  Players.findOne(Session.get("playerID"));
  for (var i = 0; i < characters.length; ++i) {
    if (characters[i].name === playerID.role) {
      return i;
    }
   }
   return -1;
 }

  static getCurrentPlayer(){
  var playerID = Session.get("playerID");

  if (playerID) {
    return Players.findOne(playerID);
  }
}

  static resetUserState() {
  var player = Players.findOne(Session.get("playerID"));

  if (player){
    Players.remove(player._id);
  }

  Session.set("gameID", null);
  Session.set("playerID", null);
  }

  static getCurrentGame(){
  var gameID = Session.get("gameID");

  if (gameID) {
    return Games.findOne(gameID);
  }
}

  static getAccessLink(){
  var game = Games.findOne(Session.get("gameID"));

  if (!game){
    return;
  }

  return Meteor.settings.public.url + game.accessCode + "/";
}

  static leaveGame () {
    var playerID = Session.get("playerID");

    if (playerID) {
      player=Players.findOne(playerID);
    }

    Session.set("currentView", "startMenu");
    Players.remove(player._id);

    Session.set("playerID", null);
  }

  static generateAccessCode(){
  var code = "";
  var dict = "abcdefghijklmnopqrstuvwxyz";

    for(var i=0; i < 4; i++){
      code += dict.charAt(Math.floor(Math.random() * dict.length));
    }

    return code;
}

  static generateNewGame(){
  var game = {
    accessCode: this.generateAccessCode(),
    state: "waitingForPlayers",
    owner: null,
    round: 0,
    turn: null
  };

  var gameID = Games.insert(game);
  game = Games.findOne(gameID);

  return game;
}

  static generateNewPlayer(game, name){
    var player = {
      gameID: game._id,
      name: name,
      role: null,
      state: null,
      vote: false
    };

    var playerID = Players.insert(player);

    return Players.findOne(playerID);
  }

  static trackGameState () {
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
}

};

export default gl;
