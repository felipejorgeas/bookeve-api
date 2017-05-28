module.exports = function (sequelize, models, Utils) {
    var EventsVideos = {
        insert: function (req, res) {
            var eventId = req.body.eventId;
            var videos = req.body.videos;
            videos = videos.map(function(item){
                item.eventId = eventId;
                return item;
            });
            models.EventsVideos.saveVideos(videos, EventsVideos.insertCallback, res);
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
            var video = {
                id: params.id
            };
            var where = {
                where: video
            };
            models.EventsVideos.destroy(where).then(function (video) {
                if (video) {
                    res.send(Utils.setResponse(200, video));
                } else {
                    throw 'Não foi possível excluir o vídeo!';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        }
    };
    return EventsVideos;
};
