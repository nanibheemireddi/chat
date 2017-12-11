"use strict";

var request = require('request');
var jsdom = require('jsdom');
var _ = require('lodash');

module.exports = function (videoUrl, callback) {

    if  (!/^https:/i.test(videoUrl)) {
        callback(new Error('Url is not Https: ' + videoUrl), null);
        return;
    }

    if (videoUrl.search("vimeo") > -1) {
        getVimeoThumb(videoUrl, function (err, thumb) {
            callback(err, thumb);
        });
        return;
    }

    if (videoUrl.search("youtube") > -1) {
        var youtubeUrlMatch = /^https:\/\/www\.youtube\.com\/watch\?.*&?v=([\w\-]+)&?.*$/.exec(videoUrl);
        if (youtubeUrlMatch) {
            callback(null, "https://img.youtube.com/vi/" + youtubeUrlMatch[1] + "/hqdefault.jpg");
            return;
        }
    }

    if (videoUrl.search("facebook") > -1) {
        getFacebookThumb(videoUrl, function (err, thumb) {
            callback(err, thumb);
        });
        return;
    }

    callback("Video is neither vimeo, facebook or youtube... ("+ videoUrl +")", videoUrl);
};

function getVimeoThumb(vimeoUrl, callback) {
    request.get({url: "http://vimeo.com/api/v2/video/" + vimeoUrl.match(/^https:\/\/vimeo.com\/(.*)$/)[1] + ".json", json: true}, function (error, response, body) {

        var innerError = null;

        if (error) {
            innerError = _.merge(new Error("Request error"), {
                code: "E_REQUEST_ERROR",
                error: error,
                response: body,
                url: vimeoUrl
            });
        } else if (response.status < 200 || response.status >= 400) {
            innerError = _.merge(new Error("Wrong response status code"), {
                code: "E_REQUEST_ERROR",
                status: response.status,
                response: body,
                url: vimeoUrl
            });
        }
        callback(innerError, (innerError ? undefined : body[0].thumbnail_large));
    });
}

function getFacebookThumb(facebookUrl, callback) {
    jsdom.env(facebookUrl, function (err, window) {

        var backgroundImage = '';

        if (err) {
            callback(_.merge(new Error("Request error"), {
                code: "E_REQUEST_ERROR",
                error: err,
                url: facebookUrl
            }), null);
            return;
        }

        if (window.document.getElementById('photoborder')) {

            var imgTags = window
                .document.getElementById('photoborder')
                .getElementsByTagName('img');

            var tags = _(imgTags)
                    .toArray()
                    .filter((tag) => tag.hasAttribute('style'))
        .value();

            backgroundImage = tags.map(tag => tag.style.backgroundImage.match(/^url\((.*)\)$/)[1])[0];
        } else {
            callback(_.merge(new Error("Thumb not found in the document"), {
                code: "E_THUMB_NOT_FOUND",
                url: facebookUrl
            }));
            return;
        }
        callback(null, backgroundImage);
    });
}