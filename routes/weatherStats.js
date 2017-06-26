let express = require('express');
let router = express.Router();
let _ = require('lodash');
let http = require('http');
let querystring = require('querystring');

let monk = require('monk');
let weather_db = monk('localhost:27017/weather_stats');
let reminders_db = monk('localhost:27017/reminders');

router.get('/', function(req, res) {
    let collection = weather_db.get('weather_data');
    collection.find({}, function(err, data) {
        if (err) throw err;
        res.json(data);
    });
});

router.get('/all_outside', function(req, res) {
    let collection = weather_db.get('weather_data');
    collection.find({unitId: "1"}, function(err, data) {
        if (err) throw err;
        let result = _.map(data, function(datum) {
            return {
                date: datum.date,
                humidity: datum.humidity,
                temperature: datum.temp,
                pressure: datum.pressure
            };
        });

        res.json(result);
    });
});

router.get('/all_inside', function(req, res) {
    let collection = weather_db.get('weather_data');
    collection.find({unitId: "2"}, function(err, data) {
        if (err) throw err;
        let result = _.map(data, function(datum) {
            return {
                date: datum.date,
                humidity: datum.humidity,
                temperature: datum.temp,
                pressure: datum.pressure
            };
        });

        res.json(result);
    });
});

router.get('/latest_outside', function getLatest(req, res) {
    let collection = weather_db.get('weather_data');
    collection.find({unitId: "1"}, {sort: {$natural: -1}, limit: 1}, function(err, data) {
        if (err) throw err;
        res.json(data);
    });
});

router.get('/latest_inside', function getLatest(req, res) {
    let collection = weather_db.get('weather_data');
    collection.find({unitId: "2"}, {sort: {$natural: -1}, limit: 1}, function(err, data) {
        if (err) throw err;
        res.json(data);
    });
});

router.get('/extreme', function getExtreme(req, res) {
    let collection = weather_db.get('weather_data');
    collection.aggregate([{$group: {_id: 278, temp: {$max: "$temp"}}}], function(err, data) {
        if (err) throw err;
        console.log(data);
        res.json(data);
    });
});

router.post('/weather_info', function(req, res) {
    let collection = weather_db.get('weather_data');
    // console.log(req);
    let humi = req.query.humidity;
    let temperature = req.query.temp;
    let pressure = req.query.pressure;
    let unitId = req.query.unitId;
    // let date = req.params.date;

    let date = new Date();

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
        }, function(err, data) {
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


router.get('/current_time', function getCurrentTime(req, res) {
    res.json({time: Date.now()});
});

router.get('/reminders', function getCurrentReminders(req, res) {
    let collection = reminders_db.get('reminders');
    collection.find({}, function(err, data) {
        if (err) throw err;
        res.json({reminders: data});
    });
});

router.delete('/delete_reminder', function(req, res) {
    let collection = reminders_db.get('reminders');
    let reminder = req.query.reminder.trim();

    if (reminder != null && reminder != "") {
        collection.findOneAndDelete({reminder: req.query.reminder}, function(err, data) {
            if (!_.isUndefined(data._id)) {
                let postData = JSON.stringify({
                    id: data._id
                });

                let options = {
                    hostname: '192.168.1.7',
                    port: 5001,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(postData),
                        'Connection': 'close'
                    }
                };

                let req = http.request(options, (res) => {
                    console.log(`STATUS: ${res.statusCode}`);
                    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
                    res.setEncoding('utf8');
                    res.on('data', (chunk) => {
                        console.log(`BODY: ${chunk}`);
                    });
                    res.on('end', () => {
                        console.log('No more data in response.');
                    });
                });

                req.on('error', (e) => {
                    console.log(`problem with request: ${e.message}`);
                });

                req.write(postData);
                req.end();

                res.json({
                    reminder: reminder,
                    id: data._id
                })
            } else {
                res.json({
                    error: "reminder does not exist",
                    data: {
                        reminder: reminder
                    }
                })
            }
        });
    } else {
        res.json({
            error: "invalid data",
            data: {
                reminder: reminder
            }
        });
    }
});

router.post('/add_reminder', function addReminder(req, res) {
    let collection = reminders_db.get('reminders');
    let reminder = req.query.reminder.trim();
    let date = Date.now();

    if (reminder != null && reminder != "") {
        collection.find({reminder: reminder}, function(err, data) {
            if (data.length == 0) {
                let newId = 0;
                let objectToInsert = {
                    reminder: reminder,
                    date: date
                };

                collection.insert(objectToInsert, function(err, data) {
                    if (err) throw err;

                    newId = objectToInsert._id;
                    res.json(data);
                });


                let postData = JSON.stringify({
                    reminder: reminder,
                    date: date,
                    id: newId
                });

                let options = {
                    hostname: '192.168.1.7',
                    port: 5000,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                };

                let req = http.request(options, (res) => {
                    console.log(`STATUS: ${res.statusCode}`);
                    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
                    res.setEncoding('utf8');
                    res.on('data', (chunk) => {
                        console.log(`BODY: ${chunk}`);
                    });
                    res.on('end', () => {
                        console.log('No more data in response.');
                    });
                });

                req.on('error', (e) => {
                    console.log(`problem with request: ${e.message}`);
                });

                req.write(postData);
                req.end();

                res.json({
                    reminder: reminder,
                    date: date
                })
            } else {
                res.json({
                    error: "reminder already exists",
                    data: {
                        reminder: reminder,
                        d: date,
                        found: data
                    }
                })
            }
        });
    } else {
        res.json({
            error: "invalid data",
            data: {
                reminder: reminder,
                d: date
            }
        });
    }
});

router.post('/add_shopping_item', function addShoppingItem(req, res) {
    console.log(req.query.item);
    res.json({success: true});
});

module.exports = router;