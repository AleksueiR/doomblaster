var file = require('fs');
var CronJob = require('cron').CronJob;
var moment = require('moment');
var Download = require('download');

var sprintf = require('sprintf').sprintf;
var vsprintf = require('sprintf').vsprintf;

var exec = require('child_process').exec;

var snap = require('./snap.js');

/*
setTimeout(
    function () {
    file.readFile('t.txt', 'utf8', function (err, data) {
        if (err) {
            console.log(err);
        }
        //console.log(data);
        
        var colors = {};
        var count = 0;
        
        var myregexp = /(\d*?):.*?(#[\d\w]{6})/g;
        var match = myregexp.exec(data);
        while (match != null) {
            // matched text: match[0]
            // match start: match.index
            // capturing group n: match[n]
            colors[match[2]] = match[1];
            
            count += parseInt(match[1], 10);
            
            match = myregexp.exec(data);
        }
        
        console.log(colors, count);
    })
}, 500);
*/

//var cp = '*/5 * * * * *';
//var cp = '59 10-60/30 * * * *';


var cp = '30 */10 * * * *';

try {
    new CronJob(cp, function () {
        console.log('this should not be printed');
    })
} catch (ex) {
    console.log("cron pattern not valid");5
}

snap()
    .then(function (res) {
        console.log('Success!', res);
    }
);

var job = new CronJob(cp, function () {
    var m = moment
        .utc()
        .subtract(10, 'minutes')
        .format("YYYY MM DD HH mm")
        .replace(/ /g, '_');
    var filename = 'WKR_PRECIP_RAIN_' + m + '.GIF';
    
    //var filename = 'WKR_PRECIP_RAIN_2015_06_12_14_10.GIF';
    console.log('--> Time ', moment.utc().format("YYYY MM DD HH mm"));
    //console.log('Downloading ', filename);
    
    /*
    saveCover({
        url: 'http://weather.gc.ca/data/radar/detailed/temp_image/WKR/' + filename,
        filename: filename
    });*/

    /*snap(m)
        .then(function (res) {
            console.log(res);
        }
    );*/
}, function () {
    // This function is executed when the job stops
    console.log("stop!");
},
  true /* Start the job right now */,
  "UTC" /* Time zone of this job. */
);

function saveCover(cover) {
    
    new Download()
        .get(cover.url)
        .dest('rain')
        .run(
            function (err, files) {
        console.log(err, files);
        hist(cover.filename);
            //=> [{path: 'foo.zip', url: 'http://example.com/foo.zip', contents: <Buffer 50 4b 03>, ...}, ...] 
    }
);
    
    /*download({
        url: cover.coverUrl,
        name: cover.fileName
    },
    './rain');*/
    
    //console.log('           Saved to disk', cover.fileName);
};

function hist(filename) {
    var filename_crop = filename.replace('.GIF', '_crop.GIF');
    //convert map.gif -crop 478x460+1+18 map_crop.gif
    
    exec('convert ' + filename + ' -crop 478x460+1+18 ' + filename_crop + ' | convert ' + filename_crop + ' -colors 64 -format %c histogram:info:- > ' + filename + '.txt',
        {
        cwd: 'rain'
    },
        function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    }
);
}
/*
function getDateTime() {
    
    var date = new Date();
    
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    
    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    
    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    
    var year = date.getFullYear();
    
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    
    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    
    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}*/