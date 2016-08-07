module.exports = function(models){
    var Contents = {
        get: function(req, res){
            models.Contents.findAll().then(function(contents){
                res.send(contents);
            });
        },
        getOne: function(req, res){
            var id = parseInt(req.params.id);
            if(!(id > 0)){
                res.send({msg: 'Id de usuário inválido!'});
            } else {
                models.Contents.findOne({
                    where: {
                        id: id
                    }
                }).then(function(contents){
                    res.send(contents);
                });
            }
        }
    }
    return Contents;
}
