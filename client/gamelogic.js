
module.exports = {

  hasHistoryApi: function() {
  return !!(window.history && window.history.pushState);
  },

  generateAccessCode: function(){
    var code = "";
    var dict = "abcdefghijklmnopqrstuvwxyz";

      for(var i=0; i < 4; i++){
        code += dict.charAt(Math.floor(Math.random() * dict.length));
      }

      return code;
  },

  generateNewGame: function(){
    var myArray = new Array();
    var game = {
      accessCode: module.exports.generateAccessCode(),
      state: "waitingForPlayers",
      roles: [],
      owner: null,
      round: 1,
      turn: null,
      dayVote: myArray,
      dayState: null,
      dayVoteButton: null,
      hunterKill: null
    };

    var gameID = Games.insert(game);
    game = Games.findOne(gameID);

    return game;
  },

  generateNewPlayer: function(game, name){
    var player = {
      gameID: game._id,
      stateDay: null,
      name: name,
      role: null,
      state: null,
      vote: false,
      killedby: null,
      dayVoteButton: null
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

    highestVote: function(array){
        if(array.length == 0)
            return null;
        var modeMap = {};
        var maxEl = array[0], maxCount = 1;
        for(var i = 0; i < array.length; i++)
        {
            var el = array[i];
            if(modeMap[el] == null)
                modeMap[el] = 1;
            else
                modeMap[el]++;
            if(modeMap[el] > maxCount)
            {
                maxEl = el;
                maxCount = modeMap[el];
            }
        }
        return maxEl;
        },

    voteProcess: function(arr){
        var a = [], b = [], prev;
        arr.sort();
        for (var i = 0; i < arr.length; i++ ) {
            if ( arr[i] !== prev ) {
                a.push(arr[i]);
                b.push(1);
            }
            else {
                b[b.length-1]++;
            }
            prev = arr[i];
        }
        var arr2 = [a, b];
        var j = 0;
        var largest = Math.max.apply(Math, arr2[1]);
        for (var i = 0; i < arr2[1].length; i++) {
            if (arr2[1][i] == largest){
                j++;
            }
        }

        if (j>1){
            return 0;
        }
        else{
            return this.highestVote(arr);
        }
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

     else if (game.turn ==="hunter"){
        tts("The hunter is dead. He will now choose someone to kill.");
    }


    if(game.state === "inProgress"){
      Session.set("currentView", "gameRole");
    }
    else if (game.state === "waitingForPlayers") {
      Session.set("currentView", "lobby");
    }
    else if (game.state ==="night"){
      Session.set("currentView", "night");
    }
    else if (game.state ==="day"){
      Session.set("currentView", "day");
    }
    else if (game.state ==="dayEnd"){
      Session.set("currentView", "dayEnd");
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

