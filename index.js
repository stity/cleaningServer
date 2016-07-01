/* jshint node : true */

var firebase = require("firebase");
var chalk = require("chalk");

var complete = chalk.green.bold;
var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
var done = {};

firebase.initializeApp({
    serviceAccount: "credentials.json",
    databaseURL: "https://atlas-viewer.firebaseio.com"
});

function finish () {
    if (done.views && done.users && done.bookmarks && done.authors) {
        process.exit();
    }
}

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = firebase.database();


db.ref("views").transaction(function(val) {
    var id;
    for(id in val){
        if (!val[id].viewers || Object.keys(val[id].viewers).length === 0 || Date.now()-val[id].lastModifiedAt > 24*60*60*1000) {
            val[id] = null;
            console.log('delete unused view: '+id);
        }
    }
    return val;
}, function () {
    console.log(complete('Views have been cleaned !'));
    done.views = true;
    finish();
});

db.ref("users").once("value", function (s) {
    var users = s.val(),
        userId,
        bookmarks = {},
        bookmarkId;
    for (userId in users) {
        for (bookmarkId in users[userId].bookmarks) {
            bookmarks[bookmarkId] = true;
        }
    }

    if (users) {
        db.ref('bookmarks').transaction(function (currentBookmarks) {
            var id;
            if (currentBookmarks) {
                for (id in currentBookmarks) {
                    if (!bookmarks[id]) {
                        currentBookmarks[id] = null;
                        console.log('delete unused bookmark: '+id);
                    }
                }
                return currentBookmarks;
            }
        }, function () {
            done.bookmarks = true;
            console.log(complete('Bookmarks have been cleaned !'));
            finish();
        });
    }
    else {
        done.bookmarks = true;
    }
});

db.ref("views").once("value", function (s) {
    var views = s.val();

    if (views) {
        db.ref('authors').transaction(function (authors) {
            var id;
            console.log('views ids : '+ Object.keys(views));
            for (id in authors) {
                if (!views[id]) {
                    authors[id] = null;
                    console.log('delete unused authors list : ' + id);
                }
            }
            return authors;
        }, function () {
            done.authors = true;
            console.log(complete('Authors have been cleaned !'));
            finish();
        });
    }
    else {
        done.authors = true;
    }
});


db.ref('users').transaction(function (users) {
    var id;
    for (id in users) {
        //delete user if anonymous (match UUIDV4) and has last been modified more than 24 hours ago.
        if (id.match(uuidRegex) && (!users[id].lastModifiedAt || Date.now() - users[id].lastModifiedAt < 24*60*60*1000)) {
            users[id] = null;
            console.log('delete old anonymous user : '+id);
        }
    }
    return users;
}, function () {
    done.users = true;
    console.log(complete('Users have been cleaned !'));
    finish();
});
