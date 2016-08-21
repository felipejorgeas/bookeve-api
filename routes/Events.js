module.exports = function (sequelize, models, Utils) {
    var Events = {
        insert: function (req, res) {
            var event = req.body.event;
            models.Events.create(event).then(function (event) {
                res.send(event);
            });
        },
        get: function (req, res) {
            models.Events.scope('eventsActive').findAll().then(function (events) {
                res.send(events);
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
