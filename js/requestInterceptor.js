var db = function ($) {

    var names = ["john", "tom", "dan", "maria", "alexandra", "mihai", "vlad", "steve", "elena", "marius"];

    var roles = ["ARCH", "DEV", "PO", "QA", "REV"];

    function genHourlyRate() {
        return Math.floor(Math.random() * Math.floor(15)) + 15;
    }

    function genContractValue() {
        return Math.floor(Math.random() * Math.floor(100)) + 50;
    }

    var db = {};

    for (i = 0; i < names.length; i++) {
        for (j = 0; j < roles.length; j++) {
            db[names[i] + "/" + roles[j]] = {
                id: {
                    username: names[i],
                    role: roles[j],
                },
                hourlyRate: genHourlyRate(),
                value: genContractValue()
            };
        }
    }

    return {
        all: function () { return Object.values(db); },
        updateHourlyRate: function (contributor, role, hourlyRate) {
            var key = contributor + "/" + role;
            db[key] = $.extend({}, db[key], { hourlyRate: hourlyRate });
            return db[key];
        },
    };

}(jQuery);

(function ($, db) {
    $.mockjax({
        url: "/api/john/test/contracts",
        urlParams: ["owner", "name"],
        responseTime: [3000, 5000],
        response: function (settings) {
            var type = settings.type;
            switch (type) {
                case "GET": get.call(this, settings); break;
                case "POST": post.call(this, settings); break;
            }
        }
    });
    function get(settings) {
        this.status = 200;
        this.responseText = db.all();
    }
    function post(settings) {
        var fields = settings.data.split("&");
        var username = fields[0].split('=')[1];
        var role = fields[1].split('=')[1];
        var hourlyRate = fields[2].split('=')[1];
        var updated = db.updateHourlyRate(username, role, hourlyRate);
        this.status = 200;
        this.responseText = updated;
    }
})(jQuery, db);