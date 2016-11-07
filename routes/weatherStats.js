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

router.get('/all', function (req, res) {
    var collection = db.get('weather_data');
    collection.find({}, function (err, data) {
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

router.get('/latest', function getLatest(req, res) {
    var collection = db.get('weather_data');
    collection.find({}, {sort: {$natural: -1}, limit: 1}, function (err, data) {
        if (err) throw err;
        res.json(data);
    });
});

router.get('/humidity', function getHistoricalHumidity(req, res) {
    var collection = db.get('weather_data');
    collection.find({}, function (err, data) {
        if (err) throw err;
        var result = _.map(data, function(datum) {
            return { date: datum.date, humidity: datum.humidity};
        });

        res.json(result);
    })
});

router.get('/temperature', function getHistoricalHumidity(req, res) {
    var collection = db.get('weather_data');
    collection.find({}, function (err, data) {
        if (err) throw err;
        var result = _.map(data, function(datum) {
            return { date: datum.date, temperature: datum.temp };
        });

        res.json(result);
    })
});

router.get('/pressure', function getHistoricalHumidity(req, res) {
    var collection = db.get('weather_data');
    collection.find({}, function (err, data) {
        if (err) throw err;
        var result = _.map(data, function(datum) {
            return { date: datum.date, pressure: datum.pressure };
        });

        res.json(result);
    })
});

router.post('/weather_info', function (req, res) {
    var collection = db.get('weather_data');
    // console.log(req);
    var humi = req.query.humidity;
    var temperature = req.query.temp;
    var pressure = req.query.pressure;
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
            date: date
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