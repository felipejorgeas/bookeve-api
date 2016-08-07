var express = require('express')
, bodyParser = require('body-parser')
, Sequelize = require('sequelize')
, dbData = require(__dirname + '/config/db_data.js')
, conn = require(__dirname + '/db.js')(dbData, Sequelize);

var app = express();
var api = '/bookeve-api';

conn.connect(function(db){
    if(!db.isConnected){
        console.log(db.error);
    } else {
        var models = db.models;
        var routes = require(__dirname + '/routes.js')(models);

        app.use(bodyParser.json());
        app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers",
                    "Origin, X-Requested-With, Content-Type, Accept, Authorization");
            next();
        });

        app.get(api + '/users', routes.Users.get);
        app.get(api + '/contents', routes.Contents.get);
        app.get(api + '/contents/:id', routes.Contents.getOne);
        // app.post(api + '/users', routes.Users.post);
        // app.put(api + '/users/:id', routes.Users.put);
        // app.delete(api + '/users/:id', routes.Users.delete);

        app.listen('5555', function () {
            console.log('Servidor escutando na porta 5555.');
        });
    }
});
