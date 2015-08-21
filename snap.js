var Download = require('download');
var sprintf = require('sprintf').sprintf;
var Promise = require('promise');
var file = require('fs');

var readFile = Promise.denodeify(require('fs').readFile);
//var downloadFile = Promise.denodeify(require('download').get);

var exec = require('child_process').exec;

var createSnap;
var downloadImage;
var processImage;

var snapFolder = 'rain';

downloadImage = function (filename, fileurl) {
    return new Promise(function (fulfill, reject) {
        new Download()
            .get(fileurl)
            .dest(snapFolder)
            .run(
                function (err, files) {
            //=> [{path: 'foo.zip', url: 'http://example.com/foo.zip', contents: <Buffer 50 4b 03>, ...}, ...] 
            if (!err) {
                console.log(filename, 'downloaded');
                files[0].filename = filename;
                fulfill(files);
                        /*processImage(filename).then(
                            function (res) {
                                fulfill(res);
                            });*/
            } else {
                reject(err);
            }
        }
);
    });
};

downloadImage2 = function (filename, fileurl) {
    return downloadFile(fileurl)
        .dest(snapFolder)
        .run(function (err, files) { //=> [{path: 'foo.zip', url: 'http://example.com/foo.zip', contents: <Buffer 50 4b 03>, ...}, ...] 
            if (!err) {
                console.log(filename, 'downloaded');
                files[0].filename = filename;
                fulfill(files);
            } else {
                reject(err);
            }
    });
};


processImage = function (filename) {
    var filenameCrop = filename.replace('.GIF', '_crop.GIF');
    var fileHist = filename + '.txt';
    
    var command = sprintf('convert %1$s -crop 478x460+1+18 %2$s && convert %2$s -colors 64 -format %%c histogram:info:- > %3$s', filename, filenameCrop, fileHist);
    
    return new Promise(function (fulfill, reject) {
        
        exec(command,
            {
            cwd: snapFolder
        },
            function (error, stdout, stderr) {
            //console.log('stdout: ' + stdout);
            //console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
                reject(error);
            } else {
                readFile(snapFolder + '/' + fileHist, 'utf8')
                        .then(function (data) {
                    var colors = {};
                    var count = 0;
                    
                    var myregexp = /(\d*?):.*?(#[\d\w]{6})/g;
                    var match = myregexp.exec(data);
                    
                    /*if (err) {
                                console.log(err);
                            }*/

                            while (match != null) {
                        // matched text: match[0]
                        // match start: match.index
                        // capturing group n: match[n]
                        colors[match[2]] = match[1];
                        count += parseInt(match[1], 10);
                        match = myregexp.exec(data);
                    }
                    
                    //console.log(colors, count);
                    fulfill({ colors: colors, count: count });
                });

                    /*file.readFile(fileHist, 'utf8', function (err, data) {
                        var colors = {};
                        var count = 0;
    
                        var myregexp = /(\d*?):.*?(#[\d\w]{6})/g;
                        var match = myregexp.exec(data);
    
                        if (err) {
                            console.log(err);
                        }
                        
                        while (match != null) {
                            // matched text: match[0]
                            // match start: match.index
                            // capturing group n: match[n]
                            colors[match[2]] = match[1];
                            count += parseInt(match[1], 10);
                            match = myregexp.exec(data);
                        }
    
                        console.log(colors, count);
                    });*/
            }
        }
);
    });
};

createSnap = function (time) {
    
    
    var filename = sprintf('WKR_PRECIP_RAIN_%s.GIF', time);
    //for testing
    var filename = 'WKR_PRECIP_RAIN_2015_06_29_11_00.GIF'; // for testing
    var fileurl = sprintf('http://weather.gc.ca/data/radar/detailed/temp_image/WKR/%s', filename);
    
    console.log('Downloading ', filename);
    
    return new Promise(function (fulfill, reject) {
        downloadImage(filename, fileurl)
            .then(function (files) {
            return processImage(files[0].filename);
        })
            .then(
                function (res) {
            fulfill(res);
        },
                function (err) {
            console.log(err);
        }
);
    });
};


module.exports = createSnap;