"use strict";
var smosh       = require('../'),
    path        = require('path'),
    fs          = require('fs'),
    assert      = require('assert'),
    Vinyl       = require('vinyl'),
    jpg         = new Buffer(fs.readFileSync(path.join(__dirname, 'fixtures/dp.jpg'))),
    jpgExpected = new Buffer(fs.readFileSync(path.join(__dirname, 'expected/dp.jpg'))),
    png         = new Buffer(fs.readFileSync(path.join(__dirname, 'fixtures/dp.png'))),
    pngExpected = new Buffer(fs.readFileSync(path.join(__dirname, 'expected/dp.png'))),
    vJpg        = new Vinyl({contents: jpg}),
    vJpgExp     = new Vinyl({contents: jpgExpected}),
    vPng        = new Vinyl({contents: png}),
    vPngExp     = new Vinyl({contents: pngExpected});

smosh(jpg)
    .on('data', function(chunk) {
        assert(typeof chunk === 'string');
        console.log('JPG chunk', chunk.length);
    })
    .on('end', function(newFile, data) {
        assert(newFile instanceof Buffer);
        assert(newFile.toString() !== '');
        assert.equal(jpgExpected.length, newFile.length);
        assert.equal(data.percent, '2.96');
        console.log('optimized JPG');
    });

smosh(vJpg)
    .on('data', function(chunk) {
        assert(typeof chunk === 'string');
        console.log('JPG chunk', chunk.length);
    })
    .on('end', function(newFile, data) {
        assert(newFile instanceof Vinyl);
        assert.notEqual(newFile.isNull(), true);
        assert.equal(vJpgExp.contents.length, newFile.contents.length);
        assert.equal(data.percent, '2.96');
        console.log('optimized Vinyl JPG');
    });

smosh(png)
    .on('data', function(chunk) {
        assert(typeof chunk === 'string');
        console.log('PNG chunk', chunk.length);
    })
    .on('end', function(newFile, data) {
        assert(newFile instanceof Buffer);
        assert(newFile.toString() !== '');
        assert.equal(pngExpected.length, newFile.length);
        assert.equal(data.percent, '36.46');
        console.log('optimized PNG');
    });

smosh(vPng)
    .on('data', function(chunk) {
        assert(typeof chunk === 'string');
        console.log('PNG chunk', chunk.length);
    })
    .on('end', function(newFile, data) {
        assert(newFile instanceof Vinyl);
        assert.notEqual(newFile.isNull(), true);
        assert.equal(vPngExp.contents.length, newFile.contents.length);
        assert.equal(data.percent, '36.46');
        console.log('optimized Vinyl PNG');
    });

smosh(jpgExpected).on('error', function(msg) {
    assert(typeof msg === 'string');
    assert(msg.length > 0);
    console.log('emit error when JPG is not optimized');
});

smosh(pngExpected).on('error', function(msg) {
    assert(typeof msg === 'string');
    assert(msg.length > 0);
    console.log('emit error when PNG is not optimized');
});
