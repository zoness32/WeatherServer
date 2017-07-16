let express = require('express');
let router = express.Router();
let _ = require('lodash');
let http = require('http');
let querystring = require('querystring');
let moment = require('moment');

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

router.get('/info_in_range', function(req, res) {
    let collection = weather_db.get('weather_data');
    let min = req.query.min;
    let max = req.query.max;
    let unitId = req.query.unitId;

    if (min !== undefined && unitId !== undefined) {
        if (max === undefined) {
            max = moment().format('x');
        }
        collection.find({unitId: unitId, date: {$gt: min, $lt: max}}, function(err, data) {
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
    } else {
        res.json({
            error: "missing min or unitId parameter",
            data: {
                unitId: unitId,
                min: min,
                max: max
            }
        });
    }
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

router.get('/createMockData', function createMockData(req, res) {
    let collection = weather_db.get('weather_data');
    let temp, humidity, pressure, unitId, date, now;
    let successful = true;
    now = moment(1490813006000);

    let duration = moment.duration({'minutes' : 2});

    for (let i = 0; i < 64800; i++ && successful) {
        temp = Math.floor(Math.random() * (100 - 32)) + 32;
        humidity = Math.floor(Math.random() * (60 - 20)) + 20;
        pressure = Math.floor(Math.random() * (34 - 25)) + 25;
        unitId = '2';
        date = now;

        now = moment(now).add(duration);

        collection.insert({
            humidity: humidity,
            temp: temp,
            pressure: pressure,
            date: date.format('x'),
            unitId: unitId
        }, function(err) {
            if (err) {
                console.log('error inserting');
                successful = false;
            }
        });
    }

    res.json({
        success: successful
    })
});

router.get('/update_dates', function(req, res) {
    let collection = weather_db.get('weather_data');
    collection.find({}, function(err, data) {
        if (err) throw err;

        for (let i = 0; i < data.length; i++) {
            let oldDate = data[i].date;
            let newDate = moment(oldDate).format('x');
            // console.log(newDate);
            collection.update({date: oldDate}, {$set: {date: newDate }}, function() {
                // console.log('updated ' + i + '; oldDate: ' + oldDate + '; newDate: ' + newDate);
            });
        }


        res.json({
            success: true
        });
    });
});

router.post('/weather_info', function(req, res) {
    let collection = weather_db.get('weather_data');
    let humi = req.query.humidity;
    let temperature = req.query.temp;
    let pressure = req.query.pressure;
    let unitId = req.query.unitId;
    let date = moment().format('x');

    if (humi && humi !== null &&
        temperature && temperature !== null &&
        pressure && pressure !== null &&
        date && date !== null) {

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