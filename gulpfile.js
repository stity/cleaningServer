/*jshint node : true */
var gulp = require('gulp');

var encrypt = require("gulp-simplecrypt").encrypt;
var decrypt = require("gulp-simplecrypt").decrypt;
var prompt = require("gulp-prompt");
var password = require("./password.json");
var exec = require('child_process').exec;

var options = {
    method : "aes192",
    encoding : "utf8",
    digestEncoding : 'hex'
};

gulp.task('askPassword', function () {
    var stream = gulp.src('encrypted/credentials.json');
    if (password) {
        options.password = password.password;
        options.salt = password.salt;
        return stream;
    }
    console.log('If you want to avoid to avoid this step, simply write your password and salt in password.json (will be ignored by git)');
    return stream.pipe(prompt.prompt([{
        type: 'password',
        name: 'pass',
        message: 'Please enter the password'
    },{
        type: 'password',
        name: 'salt',
        message: 'Please enter the password'
    }], function(res){
        options.password = res.pass;
        options.salt = res.salt;
    }));
});


gulp.task('encrypt', ['askPassword'], function () {
    return gulp.src('credentials.json')
        .pipe(encrypt(options))
        .pipe(gulp.dest('encrypted/'));
});

gulp.task('decrypt', ['askPassword'], function () {
    return gulp.src('encrypted/credentials.json')
        .pipe(decrypt(options))
        .pipe(gulp.dest('/'));
});

gulp.task('default', ['decrypt'], function (cb) {
    return exec('node index.js', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

