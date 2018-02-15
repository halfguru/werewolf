Router.route('/', function () {
  this.render('main');
  Session.set("currentView", "startMenu");
});

Router.route('/:accessCode', function () {
  let accessCode = this.params.accessCode;
  this.render('main');
  Session.set("urlAccessCode", accessCode);
  Session.set("currentView", "joinGame");
});


