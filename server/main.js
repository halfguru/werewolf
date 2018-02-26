import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

function cleanUpGamesAndPlayers() {
  var cutOff = moment().subtract(2, 'hours').toDate().getTime();

  var numGamesRemoved = Games.remove({
    createdAt: {$lt: cutOff}
  });

  var numPlayersRemoved = Players.remove({
    createdAt: {$lt: cutOff}
  });
}

function assignRoles(players, gameID, roles){
  //var roles = characters.slice(); //shallow copy
  playerRoles = [];

  //Old logic to add villagers if not enough roles
  /*

  villager = {
    name: 'Villager',
    description:
    'They dont have any special power except thinking and the right to vote.'
  };
  var diff = Players.find({'gameID': gameID}).count() - characters.length;
  if (Players.find({'gameID': gameID}).count() != characters.length){
    for (var i = 0; i < diff; i++) {
      roles.push(villager);
    }
  }
  */

  var shuffled_roles = shuffleArray(roles);
  players.forEach(function(player){
    role = shuffled_roles.pop();
    Players.update(player._id, {$set: {role: role.name}});
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


//When lobby is ready, assign roles to everyone
Games.find({"state": 'lobby'}).observeChanges({
  added: function (id, game) {
    var players = Players.find({gameID: id});
    assignRoles(players, id, game.roles);
    Games.update(id, {$set: {state: 'inProgress'}});
  }
});

