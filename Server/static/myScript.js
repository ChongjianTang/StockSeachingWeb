// var localhost = "https://myproj-340712.uw.r.appspot.com"
var localhost = "http://127.0.0.1:5000"
var searchAddress = "/search?";
var searchForCompany = "https://finnhub.io/api/v1/stock/profile2?symbol=";
var searchForStockSummary = "https://finnhub.io/api/v1/quote?symbol=";
var searchForRecommendation = "https://finnhub.io/api/v1/stock/recommendation?symbol="
var companyName = ""
var ticker = ""


var tabList = document.querySelector('.tab_list');
var lis = tabList.querySelectorAll('li');
var items = document.querySelectorAll('.item')
for (var i = 0; i < lis.length; i++) {
    lis[i].setAttribute('index', i);
    lis[i].onclick = function () {
        var index = this.getAttribute('index');
        for (var i = 0; i < lis.length; i++) {
            items[i].style.display = 'none'
            lis[i].className = 'other';
        }
        this.className = 'current';
        items[index].style.display = 'block'
    }
}

function getInfo(searchFor, action) {
    let req = new XMLHttpRequest();
    let urlString = localhost + searchAddress;
    urlString += "urlString="
    urlString += searchFor;
    console.log(urlString);
    req.open("GET", urlString, true);
    req.onreadystatechange = myCode;
    req.send(null);

    function myCode() {
        if (req.readyState == 4 && req.status == 200) {
            action(req.responseText);
        }
    }
}

document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
    companyName = document.getElementById("input_text").value.toUpperCase();
    getInfo(searchForCompany + companyName, showPanel)
})

document.querySelector("form").addEventListener("reset", function () {
    document.getElementById("no_data").style.display = "none";
    document.getElementById("tab").style.display = "none";
})

function showPanel(data) {
    let flag = true;
    data = data.replace(/\r/g, "").replace(/\n/g, "")
    if (data == "{}") {
        flag = false;
        document.getElementById("no_data").style.display = "block";
        document.getElementById("tab").style.display = "none";
        return flag;
    } else {
        document.getElementById("no_data").style.display = "none";
        document.getElementById("tab").style.display = "block";
        console.log(data)
        renderCompanyTab(data);
        getInfo(searchForStockSummary + companyName, renderStockSummaryTab);
        getCharts(renderChartTab)
        getNews(renderNewsTab)
    }
}

function unixTimestampToDate(time) {
    let date = new Date(time);
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    let d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    time = y + '-' + m + '-' + d
    return time;
}

function convertDate(time) {
    let date = new Date(time);
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let result = date.getDate();
    result += " ";
    result += months[date.getMonth()];
    result += ", ";
    result += date.getFullYear();
    return result;
}

function renderCompanyTab(data) {
    let json = JSON.parse(data);

    ticker = json['ticker']

    if (json['logo'] == '') {
        document.getElementById("company_logo").style.display = 'none';
    } else {
        document.getElementById("company_logo").style.display = 'block';
    }
    document.getElementById("company_logo").src = json['logo'];
    document.getElementById("company_name").innerText = json['name'];
    document.getElementById("company_ticker_1").innerText = json['ticker'];
    document.getElementById("company_exchange").innerText = json['exchange'];
    document.getElementById("company_ipo").innerText = json['ipo'];
    document.getElementById("company_finnhubIndustry").innerText = json['finnhubIndustry'];

    document.getElementById("company_ticker_2").innerText = json['ticker'];
}

function renderStockSummaryTab(data) {
    let json = JSON.parse(data);

    document.getElementById("summary_t").innerText = convertDate(json['t'] * 1000)
    document.getElementById("summary_pc").innerText = json['pc'];
    document.getElementById("summary_o").innerText = json['o'];
    document.getElementById("summary_h").innerText = json['h'];
    document.getElementById("summary_l").innerText = json['l'];
    let change = json['d'];
    document.getElementById("summary_d").innerText = json['d'];
    document.getElementById("summary_dp").innerText = json['dp'];

    if (change === 0) {
        document.getElementById("summary_d_arrow").style.display = 'none';
        document.getElementById("summary_dp_arrow").style.display = 'none';
    } else {
        document.getElementById("summary_d_arrow").style.display = 'inline';
        document.getElementById("summary_dp_arrow").style.display = 'inline';
        if (change > 0) {
            document.getElementById("summary_d_arrow").src = "static/img/GreenArrowUp.png";
            document.getElementById("summary_dp_arrow").src = "static/img/GreenArrowUp.png";
        } else {
            document.getElementById("summary_d_arrow").src = "static/img/RedArrowDown.png";
            document.getElementById("summary_dp_arrow").src = "static/img/RedArrowDown.png";
        }
    }
    getInfo(searchForRecommendation + companyName, renderRecommendation);
}

function renderRecommendation(data) {
    let json = JSON.parse(data)[0];
    data = data.replace(/\r/g, "").replace(/\n/g, "")
    if (data == "[]") {
        document.getElementById("strong_sell").innerText = "";
        document.getElementById("sell").innerText = "";
        document.getElementById("hold").innerText = "";
        document.getElementById("buy").innerText = "";
        document.getElementById("strong_buy").innerText = "";
    } else {
        document.getElementById("strong_sell").innerText = json['strongSell'];
        document.getElementById("sell").innerText = json['sell'];
        document.getElementById("hold").innerText = json['hold'];
        document.getElementById("buy").innerText = json['buy'];
        document.getElementById("strong_buy").innerText = json['strongBuy'];
    }
}

function getCharts(renderChartTab) {
    let req = new XMLHttpRequest();
    let urlString = localhost + "/get_charts?";
    urlString += "company="
    urlString += companyName;

    req.open("GET", urlString, true);
    req.onreadystatechange = myCode;
    req.send(null);

    function myCode() {
        if (req.readyState == 4 && req.status == 200) {
            renderChartTab(req.responseText);
        }
    }
}

function renderChartTab(data) {
    let json = JSON.parse(data);

    let priceData = [];
    let volumeData = [];

    let minPrice = Math.min(...json['c'])
    for (let i = 0; i < json['t'].length; i++) {
        priceData[i] = [json['t'][i] * 1000, json['c'][i]];
        volumeData[i] = [json['t'][i] * 1000, json['v'][i]];
    }
    console.log(minPrice)


    new Highcharts.stockChart("charts", {
        title: {
            text: 'Stock Price ' + ticker + " " + json['fd']
        },
        subtitle: {
            useHTML: true,
            text: "<a href='https://finnhub.io/.' target='_blank'>Source: Finnhub</a>"
        },
        chart: {
            height: "500",
            width: "1200"
        },
        plotOptions: {
            column: {
                pointPlacement: 'between',
                maxPointWidth: 5
            },
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
            }
        },
        rangeSelector: {
            buttons: [
                {
                    type: "day",
                    count: 7,
                    text: "7d"
                },
                {
                    type: "day",
                    count: 15,
                    text: "15d"
                },
                {
                    type: "month",
                    count: 1,
                    text: "1m"
                },
                {
                    type: "month",
                    count: 3,
                    text: "3m"
                },
                {
                    type: "month",
                    count: 6,
                    text: "6m"
                },
            ],
            selected: 0,
            inputEnabled: false
        },
        xAxis: [
            {
                crosshair: true
            }
        ],
        yAxis: [
            {
                title: {
                    text: "Stock Price",
                },
                min: minPrice * 0.9,
                opposite: false
            },
            {
                title: {
                    text: "Volume",
                },
            }

        ],
        series: [
            {
                name: "Stock Price",
                type: 'area',
                data: priceData,
            },
            {
                name: "Volume",
                type: 'column',
                data: volumeData,
                pointPlacement: 'on',
                yAxis: 1,
            }

        ]
    })
}

function getNews(renderNewsTab) {
    let req = new XMLHttpRequest();
    let urlString = localhost + "/get_news?";
    urlString += "company=";
    urlString += companyName;

    req.open("GET", urlString, true);
    req.onreadystatechange = myCode;
    req.send(null);

    function myCode() {
        if (req.readyState == 4 && req.status == 200) {
            renderNewsTab(req.responseText);
        }
    }
}

function renderNewsTab(data) {
    let json = JSON.parse(data);
    let newsBox = document.querySelectorAll('.news_box');
    let imgList = document.querySelectorAll('.news_img');
    let headlineList = document.querySelectorAll('.news_headline');
    let dateList = document.querySelectorAll('.news_date');
    let linkList = document.querySelectorAll('.news_link');

    let j = 0;
    for (let i = 0; i < 5 && i < json.length; i++) {
        let event = json[j]
        if (event['image'] == "" || event['url'] == "" || event['headline'] == "") {
            i--;
        } else {
            newsBox[i].style.display = 'block'
            imgList[i].src = event["image"];
            headlineList[i].innerText = event["headline"];
            dateList[i].innerText = convertDate(event["datetime"] * 1000);
            linkList[i].href = event["url"];
        }
        j++;
    }
}