/**
 * @module smhi
 * @author Peter Stark <peterstark72@gmail.com>
 *
 * @license
 * The MIT License (MIT)
 * Copyright (c) 2017 Peter Stark
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to 
 * deal in the Software without restriction, including without limitation the * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
*/

const
    url             = require('url'),
    http            = require('http'),
    https           = require('https'),
    EventEmitter    = require('events').EventEmitter;

const
    API_HOST = "opendata-download-metfcst.smhi.se",
    API_CATEGORY = "pmp3g",
    API_VERSION = "2";

/** 
 * Loads JSON data
 * @param {urlObj} urlObj - The URL object representing the JSON-formatted data
 * @return {EventEmitter} 
 * @emits 'loaded' when data is loaded 
 * @emits 'error' when there is an error
*/
function loadJSON(urlObj) {
    var emitter = new EventEmitter();

    var body = "",
        obj,
        req;

    //console.log("Requesting: ", url.format(urlObj));

    if (urlObj.protocol === "https:") {
        req = https.get(url.format(urlObj));
    } else {
        req = http.get(url.format(urlObj));
    }

    req.on('response', function (res) {

        res.setEncoding('utf-8');

        res.on('data', function (data) {
            body += data;
        });

        res.on('end', function () {
            try {
                obj = JSON.parse(body);
                emitter.emit('loaded', obj);
            } catch (err) {
                emitter.emit('error', err);
            }
        });
    });

    req.on('error', function (e) {
        emitter.emit('error', e);
    });

    return emitter;
}


module.exports.GetForecast = function(latitude, longitude) {

    var emitter = new EventEmitter();
    
    var path = `/api/category/${API_CATEGORY}/version/${API_VERSION}/geotype/point/lon/${longitude}/lat/${latitude}/data.json`;

    var urlObj = {
        'protocol': "https:",
        'host': API_HOST,
        'pathname': path
    };

    loadJSON(urlObj)
        .on('loaded', function(data) {
            emitter.emit("loaded", data);
        })
        .on('error', function(err) {
            emitter.emit("error", err);
        });

    return emitter;
}

