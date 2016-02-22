'use strict';

var hiredis = require('hiredis');

function HiredisReplyParser(returnBuffers) {
    this.name = 'hiredis';
    this.returnBuffers = returnBuffers;
    this.reader = new hiredis.Reader({
        return_buffers: returnBuffers
    });
}

HiredisReplyParser.prototype.parseData = function () {
    try {
        return this.reader.get();
    } catch (err) {
        console.log('PARSEDATA EXCEPTION', err);
        // Protocol errors land here
        // Reset the parser. Otherwise new commands can't be processed properly
        this.reader = new hiredis.Reader({
            return_buffers: this.returnBuffers
        });
        this.returnFatalError(err);
        return void 0;
    }
};

HiredisReplyParser.prototype.execute = function (data) {
    this.reader.feed(data);
    var reply = this.parseData();

    console.log('HiRedis reply', JSON.stringify(data), typeof reply, reply);
    while (reply !== undefined) {
        if (reply && reply.name === 'Error') {
            console.log('Erroring');
            this.returnError(reply);
        } else {
            console.log('Replying');
            this.returnReply(reply);
        }
        reply = this.parseData();
        console.log('Another reply', typeof reply, reply);
    }
    console.log('--------------------------------------------');
};

module.exports = HiredisReplyParser;
