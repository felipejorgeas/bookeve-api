var express = require('express')
    , bodyParser = require('body-parser')
    , compression = require('compression')
    , Sequelize = require('sequelize')
    , async = require('async')
    , nodemailer = require('nodemailer')
    , htmlToPdf = require('html-to-pdf')
    , dbData = require(__dirname + '/config/db_data.js')
    , Mails = require(__dirname + '/libs/mails.js')
    , conn = require(__dirname + '/db.js')(dbData, Sequelize);

htmlToPdf.setInputEncoding('UTF-8');
htmlToPdf.setOutputEncoding('UTF-8');
var Utils = require(__dirname + '/libs/utils.js')(nodemailer, htmlToPdf);

var app = express();
var api = '/bookeve-api';

conn.connect(function (db) {
    if (!db.isConnected) {
        console.log(db.error);
    } else {
        var routes = require(__dirname + '/routes.js')(db.sequelize, db.models, Utils, async, Mails);

        app.use(bodyParser.json({ limit: '50mb' }));
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(compression());
        app.use(api + '/events_content', express.static(__dirname + '/events_content'));
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
        app.get(api + '/events/:id/participesList', routes.events.getEventUsersList);
        app.post(api + '/events', routes.events.insert);
        app.put(api + '/events/:id', routes.events.update);
        app.put(api + '/events/:id/participated', routes.events.saveParticipated);
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

        /**
         * Rotas para participantes de eventos.
         */
        app.get(api + '/eventsUsers', routes.eventsUsers.getAll);
        app.get(api + '/eventsUsers/:id', routes.eventsUsers.getOne);
        app.get(api + '/eventsUsers/event/:eventId/user/:userId', routes.eventsUsers.find);
        app.post(api + '/eventsUsers', routes.eventsUsers.insert);
        app.delete(api + '/eventsUsers/:id', routes.eventsUsers.remove);

        /**
         * Rotas para comunicados.
         */
        app.post(api + '/comunicates', routes.comunicates.send);

        app.listen('5555', function () {
            console.log('Servidor escutando na porta 5555.');
        });
    }
});
