var express = require('express')
    , bodyParser = require('body-parser')
    , compression = require('compression')
    , Sequelize = require('sequelize')
    , async = require('async')
    , dbData = require(__dirname + '/config/db_data.js')
    , Utils = require(__dirname + '/libs/utils.js')
    , conn = require(__dirname + '/db.js')(dbData, Sequelize);

var app = express();
var api = '/bookeve-api';

conn.connect(function (db) {
    if (!db.isConnected) {
        console.log(db.error);
    } else {
        var routes = require(__dirname + '/routes.js')(db.sequelize, db.models, Utils, async);

        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json({limit: '50mb'}));
        app.use(bodyParser());
        app.use(compression());
        app.use(api + '/banners', express.static(__dirname + '/banners'));
        app.use(function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            next();
        });

        /**
         * Rotas para usuarios.
         */
        app.get(api + '/users', routes.users.getAll);
        app.get(api + '/users/:email/:pswd', routes.users.login);
        app.get(api + '/users/:id', routes.users.getOne);
        app.post(api + '/users', routes.users.register);
        app.put(api + '/users/:id', routes.users.update);
        app.delete(api + '/users/:id', routes.users.remove);

        /**
         * Rotas para conteudos.
         */
        app.get(api + '/contents', routes.contents.get);
        app.get(api + '/contents/:id', routes.contents.getOne);

        /**
         * Rotas para eventos.
         */
        app.get(api + '/events', routes.events.get);
        app.get(api + '/events/:id', routes.events.getOne);
        app.post(api + '/events', routes.events.insert);
        app.put(api + '/events/:id', routes.events.update);
        app.delete(api + '/events/:id', routes.events.remove);

        /**
         * Rotas para palestrantes de eventos.
         */
        app.post(api + '/eventsLecturers', routes.eventsLecturers.insert);
        app.delete(api + '/eventsLecturers/:id', routes.eventsLecturers.remove);

        /**
         * Rotas para videos de eventos.
         */
        app.post(api + '/eventsVideos', routes.eventsVideos.insert);
        app.delete(api + '/eventsVideos/:id', routes.eventsVideos.remove);

        app.listen('5555', function () {
            console.log('Servidor escutando na porta 5555.');
        });
    }
});
