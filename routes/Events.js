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
            var id = parseInt(req.params.id);
            if (!(id > 0)) {
                res.send({msg: 'Id de evento inválido!'});
            } else {
                models.Events.findOne({
                    where: {
                        id: id
                    }
                }).then(function (event) {
                    res.send(event);
                });
            }
        }
    };
    return Events;
};
