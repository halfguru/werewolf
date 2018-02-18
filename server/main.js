import { Meteor } from 'meteor/meteor';

function cleanUpGamesAndPlayers() {
  var cutOff = moment().subtract(2, 'hours').toDate().getTime();

  var numGamesRemoved = Games.remove({
    createdAt: {$lt: cutOff}
  });

  var numPlayersRemoved = Players.remove({
    createdAt: {$lt: cutOff}
  });
}

function assignRoles(players){
  var roles = characters.slice(); //shallow copy
  var shuffled_roles = shuffleArray(roles);
  var role = null;

  players.forEach(function(player){
    role = shuffled_roles.pop();
    Players.update(player._id, {$set: {role: role.name}});
    }
  });
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

Meteor.startup(() => {
  // Delete all games and players at startup
  Games.remove({});
  Players.remove({});
});

//remove old games and players
var MyCron = new Cron(60000);
MyCron.addJob(5, cleanUpGamesAndPlayers);

Meteor.publish('games', function(accessCode) {
  return Games.find({"accessCode": accessCode});
});

Meteor.publish('players', function(gameID) {
  return Players.find({"gameID": gameID});
});


//WHen lobby is ready, assign roles to everyone
Games.find({"state": 'lobby'}).observeChanges({
  added: function (id, game) {
    var players = Players.find({gameID: id});
    assignRoles(players);
    Games.update(id, {$set: {state: 'inProgress'}});
  }
});

