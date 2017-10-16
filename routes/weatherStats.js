let express = require('express');
let router = express.Router();
let _ = require('lodash');
let http = require('http');
let https = require('https');
let querystring = require('querystring');
let moment = require('moment');

let monk = require('monk');
let weather_db = monk('localhost:27017/weather_stats');
let reminders_db = monk('localhost:27017/reminders');

const admin = require('firebase-admin');

let serviceCert = require("./firestore.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceCert)
});

let fdb = admin.firestore();

router.get('/', function(req, res) {
    res.json({message: "You've hit the endpoint!"});
});

router.get('/highs', function(req, res) {
    let fcollection = fdb.collection('weather_data');
    let unitId = req.query.unitId;
    let now = moment();
    let beginning = moment([now.year(), now.month(), now.date()]);

    if (unitId && unitId >= 0) {
        fcollection
            .where('date', '>', beginning.format('x'))
            .where('date', '<=', now.format('x'))
            .get()
            .then(docs => {
                let docArray = [];
                docs.forEach(doc => {
                    docArray.push(doc.data());
                });

                let t = _.maxBy(docArray, 'temp');
                let p = _.maxBy(docArray, 'pressure');
                let h = _.maxBy(docArray, 'humidity');

                res.json({
                    temp: {temp: t.temp, date: t.date},
                    humidity: {humidity: h.humidity, date: h.date},
                    pressure: {pressure: p.pressure, date: p.date}
                })
            });
    } else {
        res.json({success: false, error: 'A unitId must be provided.'});
    }
});

router.get('/lows', function(req, res) {
    let fcollection = fdb.collection('weather_data');
    let unitId = req.query.unitId;
    let now = moment();
    let beginning = moment([now.year(), now.month(), now.date()]);

    if (unitId && unitId >= 0) {
        fcollection
            .where('date', '>', beginning.format('x'))
            .where('date', '<=', now.format('x'))
            .get()
            .then(docs => {
                let docArray = [];
                docs.forEach(doc => {
                    docArray.push(doc.data());
                });

                let t = _.minBy(docArray, 'temp');
                let p = _.minBy(docArray, 'pressure');
                let h = _.minBy(docArray, 'humidity');

                res.json({
                    temp: {temp: t.temp, date: t.date},
                    humidity: {humidity: h.humidity, date: h.date},
                    pressure: {pressure: p.pressure, date: p.date}
                })
            });
    } else {
        res.json({success: false, error: 'A unitId must be provided.'});
    }
});

router.get('/info_in_range', function(req, res) {
    let fcollection = fdb.collection('weather_data');
    let min = req.query.min;
    let max = req.query.max;
    let unitId = req.query.unitId;

    // TODO: optimize for multiple data collectors; different collections for each? Custom indexes (slower)?

    if (min && unitId) {
        fcollection
            .where('date', '>', min)
            .where('date', '<=', max)
            .orderBy('date')
            .get()
            .then(docs => {
                let result = [];
                docs.forEach(doc => {
                    let data = doc.data();
                    if (data.unitId === unitId) {
                        result.push({
                            date: data.date,
                            humidity: data.humidity,
                            temperature: data.temp,
                            pressure: data.pressure
                        });
                    }
                });
                res.json(result);
            }).catch(err => {
            console.log('Error getting documents', err);
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

router.post('/delete_documents', function(req, res) {
    let collection = weather_db.get('weather_data');
    let pass = req.query.password;
    let num = req.query.num;
    let numRemoved = 0;
    if (pass === 'password' && num >= 1) {
        collection.find({}, {limit: 159650}, function(err, data) {
            if (err) throw err;
            let array = data.map(function(doc) {
                return doc._id;
            });

            collection.remove({_id: {$in: array}}, function(err, numOfRemovedDocs) {
                numRemoved = numOfRemovedDocs;
            });

            res.json({success: true, numRemoved: numRemoved});
        });

    } else {
        res.json({success: false, error: 'Invalid password or number'});
    }
});

router.get('/all_outside', function(req, res) {
    let fcollection = fdb.collection('weather_data');

    fcollection.where('unitId', '==', '1').get()
        .then(docs => {
            let result = [];
            docs.forEach(doc => {
                let data = doc.data();
                result.push({
                    date: data.date,
                    humidity: data.humidity,
                    temperature: data.temp,
                    pressure: data.pressure
                });
            });
            res.json(result);
        }).catch(err => {
        console.log('Error getting documents', err);
        res.json({error: err});
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
    let fcollection = fdb.collection('weather_data');

    fcollection.where('unitId', '==', '1').limit(1).get()
        .then(docs => {
            docs.forEach(doc => {
                let data = doc.data();
                let result = {
                    temp: data.temp,
                    humidity: data.humidity,
                    pressure: data.pressure,
                    date: data.date
                };
                res.json(result);
            });
        }).catch(err => {
        console.log('Error getting latest outside: ' + err);
        res.json({error: err});
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

        res.json(data);
    });
});

router.get('/createMockData', function createMockData(req, res) {
    let collection = weather_db.get('weather_data');
    let temp, humidity, pressure, unitId, date, now;
    let successful = true;
    now = moment().subtract(10000, 'minutes');

    for (let i = 0; i < 5000; i++ && successful) {
        temp = Math.floor(Math.random() * (100 - 32)) + 32;
        humidity = Math.floor(Math.random() * (60 - 20)) + 20;
        pressure = Math.floor(Math.random() * (34 - 25)) + 25;
        unitId = '1';
        date = now;

        now = moment(now).add(2, 'minutes');

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
            collection.update({date: oldDate}, {$set: {date: newDate}}, function() {
                // console.log('updated ' + i + '; oldDate: ' + oldDate + '; newDate: ' + newDate);
            });
        }


        res.json({
            success: true
        });
    });
});

router.get('/dark_sky', function(req, res) {
    https.get('https://api.darksky.net/forecast/38c87f88243c729b8e60e95fbe41a8c2/43.586439,-116.610291?extend=hourly', (response) => {
        const {statusCode} = response;
        const contentType = response.headers['content-type'];

        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                `Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
                `Expected application/json but received ${contentType}`);
        }
        if (error) {
            console.error(error.message);
            // consume response data to free up memory
            response.resume();
            return;
        }

        response.setEncoding('utf8');
        let rawData = '';
        response.on('data', (chunk) => {
            rawData += chunk;
        });
        response.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                res.json(parsedData);
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
});

router.post('/weather_info', function(req, res) {
    let collection = weather_db.get('weather_data');
    let humi = req.query.humidity;
    let temperature = req.query.temp;
    let pressure = req.query.pressure;
    let unitId = req.query.unitId;
    let test = req.query.test;
    let date = moment().format('x');
    let dateName = moment(parseInt(date)).format('MMDDYY-HHmmss');
    let fcollection = fdb.collection('weather_data').doc(dateName);

    if (humi && temperature && pressure && date) {
        if (!test) {
            https.get('https://weatherstation.wunderground.com/weatherstation/updateweatherstation.php?ID=KIDNAMPA52&PASSWORD=7f46akpk&dateutc=now&tempf=' + temperature + '&baromin=' + pressure + '&humidity=' + humi, (response) => {
                const {statusCode} = response;
                const contentType = response.headers['content-type'];

                let error;
                if (statusCode !== 200) {
                    error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
                } else if (!/^text\/html/.test(contentType)) {
                    error = new Error('Invalid content-type.\n' +
                        `Expected text/html but received ${contentType}`);
                }
                if (error) {
                    console.error(error.message);
                }
            }).on('error', (e) => {
                console.error(`Got error: ${e.message}`);
            });
        }

        if (!test) {
            fcollection.set({
                humidity: humi,
                temp: temperature,
                pressure: pressure,
                date: date,
                unitId: unitId
            });
        }

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

router.post('/test', function(req, res) {
    let collection = weather_db.get('weather_data');
    let humi = req.query.humidity;
    let temperature = req.query.temp;
    let pressure = req.query.pressure;
    let light = req.query.light;
    let unitId = req.query.unitId;
    let date = moment().format('x');
    let dateName = moment(parseInt(date)).format('MMDDYY-HHmmss');
    let fcollection = fdb.collection('weather_test').doc(dateName);

    if (humi && temperature && pressure && date) {
            fcollection.set({
                humidity: humi,
                light: light,
                temp: temperature,
                pressure: pressure,
                date: date,
                unitId: unitId
            });

        res.json({
            humidity: humi,
            temp: temperature,
            pressure: pressure,
            light: light,
            date: date
        })
    } else {
        res.json({
            error: "invalid data",
            data: {
                h: humi,
                t: temperature,
                p: pressure,
                l: light,
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