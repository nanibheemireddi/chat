"use strict";

var thumby = require('../src/index.js');
var buster = require('buster');
var expect = buster.referee.expect;

buster.testCase("index", {

    setUp:function(){
        this.ok = 'https://www.youtube.com/watch?v=ANLWMDD6-Ac';
        this.nonHttp = 'http://www.youtube.com/watch?v=ANLWMDD6-Ac';
        this.youtube = 'https://www.youtube.com/watch?t=9&v=EFu7hdEzf7w';
        this.vimeo = 'https://vimeo.com/152362608';
        this.facebook = 'https://www.facebook.com/BuddyRest/videos/vb.182850171790666/825185544223789/?type=2&theater';
    },

    "should unset thumb if it's not HTTPS" : function(done) {
        thumby(this.nonHttp, function (err, res) {
            expect(res).toBeFalsy();
            expect(err.message).toEqual('Url is not Https: http://www.youtube.com/watch?v=ANLWMDD6-Ac');
            done();
        }.bind(this));
    },

    youtube: {
        "should create thumb url with extracted video ID": function(done) {
            thumby(this.youtube, function (err, res) {
                expect(res).toEqual('https://img.youtube.com/vi/EFu7hdEzf7w/hqdefault.jpg');
                done();
            });

        }
    },

    vimeo: {

        setUp: function() {
            this.fakeRequest = this.stub(require("request"), "get");
            this.fakeRequest.yields(null, {status: 200}, [{thumbnail_large: 'http://i.vimeocdn.com/video/552367528_640.jpg'}]);
        },

        "should call vimeo for vimeo URL": function(done) {
            thumby(this.vimeo, function () {
                expect(this.fakeRequest).toHaveBeenCalledOnce();
                expect(this.fakeRequest.getCall(0).args[0].url).toEqual("http://vimeo.com/api/v2/video/152362608.json");
                done();
            }.bind(this));
        },

        "should return url from vimeo response": function(done) {
            thumby(this.vimeo, function (err, res) {
                expect(res).toEqual('http://i.vimeocdn.com/video/552367528_640.jpg');
                done();
            }.bind(this));
        },

        "should return error on request error": function() {
            this.fakeRequest.yields(new Error("some error"), {status: 500}, "error");
            thumby(this.vimeo, function (err) {
                expect(err.code).toEqual("E_REQUEST_ERROR");
                expect(err.error.message).toEqual("some error");
            });
        },

        "should return error wrong status": function() {
            this.fakeRequest.yields(null, {status: 500}, {state: "down"});
            thumby(this.vimeo, function (err) {
                expect(err.code).toEqual("E_REQUEST_ERROR");
                expect(err.status).toEqual(500);
                expect(err.response).toEqual({state: "down"});
            });
        }
    },

    facebook: {

        "should return a thumb url from link": function(done) {
            require('nock')("https://www.facebook.com")
                .get("/BuddyRest/videos/vb.182850171790666/825185544223789/?type=2&theater")
                .reply(200, require('fs').readFileSync('test/fixtures/facebookRequestResponse.txt','utf8'));

            thumby(this.facebook, function(err, res) {
                expect(res).toEqual("thisIsAnUrlFromARequestFixture");
                done();
            });
        },

        "should pass down an error from jsdom if such exists": function (done) {
            var self = this;
            var stubbedError = new Error("Stubbed error!");

            self.fakeDomify=self.stub(require("jsdom"), "env");
            self.fakeDomify.yields(stubbedError);

            thumby(self.facebook, function(err) {
                expect(err).toMatch({
                    code: "E_REQUEST_ERROR",
                    error: stubbedError,
                    url: self.facebook
                });
                done();
            });
        },

        "should return an error if no thumb is found in the html": function(done) {
            var self = this;

            self.fakeDomify=self.stub(require('jsdom'), 'env');
            self.fakeDomify.yields(null, {
                document: {
                    getElementById(){
                        return null;
                    }
                }
            });

            thumby(this.facebook, function (err) {
                expect(err).toMatch({code: "E_THUMB_NOT_FOUND", url: self.facebook});
                done();
            });
        }
    }

});
