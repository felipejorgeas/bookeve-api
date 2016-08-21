module.exports = function (sequelize, models) {
    var Users = {
        register: function (req, res) {
            var data = req.body;
            var user = {
                name: data.nome,
                email: data.email,
                pswd: data.senha
            };
            sequelize.transaction(function (t) {
                return models.Users.create(user).then(function (result) {
                    return result.dataValues;
                });
            }).then(function (result) {
                res.send(result);
            }).catch(function (err) {
                res.send(err);
            });
        },
        login: function (req, res) {
            var params = req.params;
            var user = {
                email: params.email,
                pswd: params.pswd
            };
            models.Users.findOne({
                where: user,
                attributes: ['id', 'email', 'name', 'accessLevel']
            }).then(function (result) {
                res.send(result);
            });
        }
    };
    return Users;
};
