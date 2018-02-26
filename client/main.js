import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './main.html';
import gl from './gamelogic.js';
var xd = require('./gamelogic');

Meteor.setInterval(function () {
  Session.set('time', new Date());
}, 1000);

//Converts game code to uppercase in html
Handlebars.registerHelper('toCapitalCase', function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
});

//Characters buggy
/*
if (xd.hasHistoryApi()){
  function trackUrlState () {
    var accessCode = null;
    var game = xd.getCurrentGame();
    if (game){
      accessCode = game.accessCode;
    } else {
      accessCode = Session.get('urlAccessCode');
    }

    var currentURL = '/';
    if (accessCode){
      currentURL += accessCode+'/';
    }
    window.history.pushState(null, null, currentURL);
  }
  Tracker.autorun(trackUrlState);
}
*/

window.onbeforeunload = xd.resetUserState;
window.onpagehide = xd.resetUserState;

//Whenever dependencies changes, rerun.
Tracker.autorun(xd.trackGameState);

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
  xd.resetUserState();
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
