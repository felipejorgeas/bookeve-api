module.exports = function (models) {
    var routes = {
        Users: require(__dirname + '/routes/Users.js')(models),
        Contents: require(__dirname + '/routes/Contents.js')(models),
    }
    return routes;
}
