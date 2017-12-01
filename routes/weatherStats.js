let express = require('express');
let router = express.Router();
let _ = require('lodash');
let http = require('http');
let https = require('https');
let querystring = require('querystring');
let moment = require('moment');

let monk = require('monk');
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

router.get('/latest_outside', function getLatest(req, res) {
    let fcollection = fdb.collection('weather_data');

    fcollection.where('unitId', '==', '1')
        .orderBy('date', 'desc')
        .limit(1)
        .get()
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

        res.json({
            humidity: humi,
            temp: temperature,
            pressure: pressure,
            unitId: unitId,
            date: date
        })
    } else {
        res.json({
            error: "invalid data",
            data: {
                h: humi,
                t: temperature,
                p: pressure,
                d: date,
                u: unitId
            }
        });
    }
});

router.post('/garage_temp', function(req, res) {
    let humi = req.query.humidity;
    let temperature = req.query.temp;
    let pressure = req.query.pressure;
    let unitId = req.query.unitId;
    let test = req.query.test;
    let date = moment().format('x');
    let dateName = moment(parseInt(date)).format('MMDDYY-HHmmss');
    let fcollection = fdb.collection('garage_temp').doc(dateName);

    if (humi && temperature && pressure && date) {
        if (!test) {
            fcollection.set({
                humidity: humi,
                temp: temperature,
                pressure: pressure,
                date: date,
                unitId: unitId
            });
        }

        res.json({
            humidity: humi,
            temp: temperature,
            pressure: pressure,
            unitId: unitId,
            date: date
        })
    } else {
        res.json({
            error: "invalid data",
            data: {
                h: humi,
                t: temperature,
                p: pressure,
                d: date,
                u: unitId
            }
        });
    }
});

router.get('/all_garage', function(req, res) {
    let fcollection = fdb.collection('garage_temp');

    fcollection.where('unitId', '==', '2').get()
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

router.get('/latest_garage', function getLatestGarage(req, res) {
    let fcollection = fdb.collection('garage_temp');

    fcollection.where('unitId', '==', '2')
        .orderBy('date', 'desc')
        .limit(1)
        .get()
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

module.exports = router;
