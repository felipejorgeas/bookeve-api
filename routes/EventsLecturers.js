module.exports = function (sequelize, models, Utils) {
    var EventsLecturers = {
        insert: function (req, res) {
            var eventId = req.body.eventId;
            var lecturers = req.body.lecturers;
            lecturers = lecturers.map(function (item) {
                item.eventId = eventId;
                return item;
            });
            models.EventsLecturers.saveLecturers(lecturers, EventsLecturers.insertCallback, res);
        },
        insertCallback: function(data, res, err){
            if(err){
                res.send(Utils.setResponse(err));
            } else {
                res.send(Utils.setResponse(200, data));
            }
        },
        remove: function (req, res) {
            var params = req.params;
            var lecturer = {
                id: params.id
            };
            var where = {
                where: lecturer
            };
            models.EventsLecturers.destroy(where).then(function (lecturer) {
                if (lecturer) {
                    res.send(Utils.setResponse(200, lecturer));
                } else {
                    throw 'Não foi possível excluir o palestrante!';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        }
    };
    return EventsLecturers;
};
