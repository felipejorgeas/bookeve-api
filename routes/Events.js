module.exports = function (sequelize, models, Utils) {
    var Events = {
        insert: function (req, res) {
            var event = req.body.event;
            models.Events.create(event).then(function (event) {
                res.send(event);
            });
        },
        get: function (req, res) {
            var queryString = req.query;
            console.log(queryString);
            var where = {
                where: (queryString ? queryString : {})
            };
            models.Events.scope('eventsActive').findAll(where).then(function (result) {
                if (result) {
                    res.send(Utils.setResponse(200, result));
                } else {
                    res.send(Utils.setResponse(201));
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        },
        getOne: function (req, res) {
            var params = req.params;
            var event = {
                id: params.id
            };
            models.Events.scope('eventsOk').findOne({
                where: event
            }).then(function (result) {
                if (result) {
                    var data = result.dataValues;
                    res.send(Utils.setResponse(200, data));
                } else {
                    throw 'Evento não encontrado!';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        },
        remove: function (req, res) {
            var params = req.params;
            var event = {
                id: params.id
            };
            var where = {
                where: event
            };
            var update = {
                deleted: 1
            };
            models.Events.scope('eventsOk').findOne(where).then(function (data) {
                if (data) {
                    models.Events.update(update, where).then(function (result) {
                        if (result) {
                            models.Events.findOne(where).then(function (data) {
                                res.send(Utils.setResponse(200, data));
                            });
                        } else {
                            throw 'Não foi possível excluir o evento!';
                        }
                    });
                } else {
                    throw 'Evento não encontrado!';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        }
    };
    return Events;
};
