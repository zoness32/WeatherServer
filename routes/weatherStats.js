var express = require('express');
var router = express.Router();
var _ = require('lodash');

var monk = require('monk');
var db = monk('localhost:27017/weather_stats');

router.get('/', function (req, res) {
    var collection = db.get('weather_data');
    collection.find({}, function (err, data) {
        if (err) throw err;
        res.json(data);
    })
});

router.get('/all_outside', function (req, res) {
    var collection = db.get('weather_data');
    collection.find({unitId: "1"}, function (err, data) {
        if (err) throw err;
        var result = _.map(data, function(datum) {
            return { date: datum.date,
                humidity: datum.humidity,
                temperature: datum.temp,
                pressure: datum.pressure
            };
        });

        res.json(result);
    })
});

router.get('/all_inside', function (req, res) {
    var collection = db.get('weather_data');
    collection.find({unitId: "2"}, function (err, data) {
        if (err) throw err;
        var result = _.map(data, function(datum) {
            return { date: datum.date,
                humidity: datum.humidity,
                temperature: datum.temp,
                pressure: datum.pressure
            };
        });

        res.json(result);
    })
});

router.get('/latest_outside', function getLatest(req, res) {
    var collection = db.get('weather_data');
    collection.find({unitId: "1"}, {sort: {$natural: -1}, limit: 1}, function (err, data) {
        if (err) throw err;
        console.log(data);
        res.json(data);
    });
});

router.get('/latest_inside', function getLatest(req, res) {
    var collection = db.get('weather_data');
    collection.find({unitId: "2"}, {sort: {$natural: -1}, limit: 1}, function (err, data) {
        if (err) throw err;
        res.json(data);
    });
});

router.post('/weather_info', function (req, res) {
    var collection = db.get('weather_data');
    // console.log(req);
    var humi = req.query.humidity;
    var temperature = req.query.temp;
    var pressure = req.query.pressure;
    var unitId = req.query.unitId;
    // var date = req.params.date;

    var date = new Date();

    if (humi && humi != null &&
        temperature && temperature != null &&
        pressure && pressure != null &&
        date && date != null) {

        collection.insert({
            humidity: humi,
            temp: temperature,
            pressure: pressure,
            date: date,
            unitId: unitId
        }, function (err, data) {
            if (err) throw err;
            res.json(data);
        });

        res.json({
            humidity: humi,
            temp: temperature,
            pressure: pressure,
            date: date
        })
    } else {
        res.json({
            error: "invalid data",
            data: {
                h: humi,
                t: temperature,
                p: pressure,
                d: date
            }
        });
    }
});

module.exports = router;