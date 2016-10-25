// modules =================================================
  var express         = require('express');
  var session         = require('express-session');
  var favicon         = require('serve-favicon');
  var app             = express();
  var mongoose        = require('mongoose');
  var bodyParser      = require('body-parser');
  var methodOverride  = require('method-override');
  var morgan          = require('morgan');
  var multipart       = require('connect-multiparty');
  var errorHandler    = require('errorhandler');
  var fs              = require('fs');

  var http   = require('http');
  var https  = require('https');
  var path   = require('path');
// SSL
  var privateKey = fs.readFileSync("ssl/server.key"); // путь к ключу
  var certificate = fs.readFileSync("ssl/server.crt"); // путь к сертификату
  var credentials = { key: privateKey, cert: certificate };
// configuration ===========================================
  var db = require('./config/db');
  mongoose.Promise = global.Promise; // remove warning DeprecationWarning: Mongoose: mpromise ...
  mongoose.connect(db.url); // connect to our mongoDB database (commented out after you enter in your own credentials)
// all environments
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  app.use(favicon(__dirname + '/public/img/26.ico'));
  app.use(session({ resave: true,
                  saveUninitialized: true,
                  secret: 'dsvTjvhFYhbCFDzxFBN',
                  cookie: {maxAge: 3600000}
                }));  // maxAge = hour
  app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
  app.use(morgan('dev'));                                         // log every request to the console
  app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
  app.use(bodyParser.json());                                     // parse application/json
  app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
  app.use(bodyParser.json({ uploadDir: 'public/uploads' }));
  app.use(multipart({uploadDir: 'public/uploads'}));
  app.use(methodOverride());

  var env = process.env.NODE_ENV || 'development';
// development only
  if (env === 'development') {
    app.use(errorHandler());
  }
// production only
  if (env === 'production') {
    // TODO
  }

  var routes     = require('./routes');
  var login      = require('./routes/api.login');
  var users      = require('./routes/api.users');
  var documents  = require('./routes/api.documents');
  var categories = require('./routes/api.categories');
  var comments   = require('./routes/api.comments');
  var goverments = require('./routes/api.goverments');
  var loaduser   = require('./routes/api.auphorize');

app.all("/login", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    return next();
});

// Routes ==================================================
  app.get('/', routes.index);
  app.get('/partials/:name', routes.partials);

// JSON API ================================================
  // login
  app.get('/login', login.login);
  app.get('/logout', login.logout);
  app.get('/SingleLogout', login.singleLogout);
  app.get('/SingleLogoutResponse?', login.singleLogoutResponse);
  app.get('/metadata.xml', login.getMetadata);
  app.post('/assert', login.assert);
  // пользователи
  app.get('/api/users', users.list);
  app.get('/api/users/:id', users.get);
  app.get('/api/session', users.session);
  // app.put('/api/session', users.new_session);
  // органы власти
  app.get('/api/goverments', goverments.list);
  app.get('/api/goverments/:id', goverments.get);
  // категории обращений
  app.get('/api/categories', categories.list);
  app.get('/api/categories/:id', categories.get);
  // обращения
  app.get('/api/documents', loaduser.loadUser, documents.list);
  app.get('/api/mydocuments', loaduser.loadUser, documents.listMyDocuments);
  app.get('/api/docbymoderator', loaduser.loadUser, documents.listDocumentsByModerator);
  app.get('/api/documents/:id', loaduser.loadUser, documents.get);
  app.post('/api/documents', loaduser.loadUser, documents.add);
  app.put('/api/documents/:id', loaduser.loadUser, documents.edit);
  app.post('/api/comments', loaduser.loadUser, comments.add);

  // app.delete('/api/document/:id', documents.delete);

  // загрузка изображений на сервер с записью в документ
  app.post('/api/image/upload', documents.imageUpload);
  // загрузка изображений на сервер без записи в документ(для новых обращений).
  // возвращает имя файла
  app.post('/api/image/fakeupload', documents.imageFakeUpload);
  app.get('*', loaduser.loadUser, routes.index);

// Start Server =============================================
  https.createServer(credentials,app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
  });
