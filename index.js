let cheerio = require('cheerio'),
    request = require('request'),
    fs = require('fs');


let DATA;


// Wednesdays
getNumbers(new Date("01/03/2001"), "wednesdays2002.csv");

//Saturday
//getNumbers(new Date("01/06/2001"), "saturdays2002.csv");


function getMth(i) {
    let month = [];
    month[0] = "Jan";
    month[1] = "Feb";
    month[2] = "Mar";
    month[3] = "Apr";
    month[4] = "May";
    month[5] = "Jun";
    month[6] = "Jul";
    month[7] = "Aug";
    month[8] = "Sep";
    month[9] = "Oct";
    month[10] = "Nov";
    month[11] = "Dec";
    return month[i];
}

function shortYear(fullYear) {
    fullYear = fullYear.toString();
    return fullYear.slice(-2, -1) + fullYear.slice(-1)
}

function padNumber(number) {
    return (number < 10 ? '0' : '') + number
}


function getNumbers(init, fileName) {
    if (init.getTime() < new Date().getTime()) {
        let strDate = padNumber(init.getDate()) + "-" + getMth(init.getMonth()) + "-" + shortYear(init.getFullYear());
        getLottoOnDay("http://www.nlcbplaywhelotto.com/nlcb-lotto-plus-results/?date=", strDate, function (data) {
            let str = (init.getMonth() + 1) + "/" + init.getDate() + "/" + init.getFullYear();
            if (data.balls.length > 0) {
                for (let i = 0; i < data.balls.length; i++) {
                    str += "," + data.balls[i];
                }
                for (let i = 0; i < data.power.length; i++) {
                    str += "," + data.power[i] + "\n";
                }
                console.log(str);
                DATA += str;
            }
            init.setDate(init.getDate() + 7);
            setTimeout(function () {
                getNumbers(init, fileName);
            }, 10);
        });
    } else {
        console.log(fileName);
        fs.writeFile(fileName, DATA, (err) => {
            if (err) throw err;
            console.log('DATA saved!');
        });
    }
}

function getLottoOnDay(url, date, callback) {
    request(url + date, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            let $ = cheerio.load(body);
            let obj = {
                balls: [],
                power: [],
                date: ""
            };
            obj.date = date;
            $('div.lotto-balls').each(function () {
                obj.balls.push(this.children[0].data);
            });
            $('div.yellow-ball').each(function () {
                obj.power.push(this.children[0].data);
            });

            setTimeout(function () {
                callback(obj);
            }, 50);
        }
    })
}