// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';


// [START gae_node_request_example]
const express = require('express');
const https = require("https");
const API_TOKEN = 'c87dfmaad3i9lkntl8gg';
const app = express();
const axios = require('axios');

app.use(express.static(__dirname + '/static'));
app.all("*", function (req, res, next) {
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin", "*");
    //允许的header类型
    res.header("Access-Control-Allow-Headers", "content-type");
    //跨域允许的请求方式 
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
    if (req.method.toLowerCase() == 'options')
        res.send(200);  //让options尝试请求快速结束
    else
        next();
})

app.get('/', (req, res) => {
    res.redirect('/search/home');
    // res.sendFile(__dirname + '/static/' + 'hw6.html')
});

app.get('/search/home', (req, res) => {
    res.sendFile(__dirname + '/static/' + 'hw6.html')
});

app.get('/search/:ticker', (req, res) => {
    const ticker = req.params.ticker || "";

    https.get(`https://finnhub.io/api/v1/search?q=${ticker}&token=${API_TOKEN}`, (resp) => {
        let result = '';

        resp.on('data', (chunk) => {
            result += chunk
        });

        resp.on('end', () => {
            res.send(JSON.parse(result));
        })
    })
});
app.get('/stock/:symbol', (req, res) => {
    const symbol = req.params.symbol || "";
    console.log(symbol,"===")
    
    const profile = new Promise((resolve, reject) => {
        axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_TOKEN}`)
            .then((data => {
                resolve(data.data);
            }))
    })
    const quote = new Promise((resolve, reject) => {
        axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_TOKEN}`)
            .then(data => {
                resolve(data.data);
            })
    })
    const peers = new Promise((resolve, reject) => {
        axios.get(`https://finnhub.io/api/v1/stock/peers?symbol=${symbol}&token=${API_TOKEN}`)
            .then(data => {
                const companyPeers = data.data.join(",");
                resolve({companyPeers});
            })
    })
    Promise.all([quote, profile, peers]).then(data => {
        const result = Object.assign(data[0], data[1], data[2]);
        res.send(result);
    })
});
app.get('/candles/:symbol', (req, res) => {
    const symbol = req.params.symbol || "";
    axios.get(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=5&from=1631000648&to=1631022248&token=${API_TOKEN}`)
            .then(data => {
                console.log(data.data)
                res.send(data.data);
            })
})
app.get('/watchlist', (req, res) => {

});

app.get('/portfolio', (req, res) => {

});


// Start the server
const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]

module.exports = app;
