'use strict';

var url          = require('url'),
	http         = require('http'),
	EventEmitter = require('events').EventEmitter;

var ImageFile = function(fileInfo) {
		EventEmitter.call(this);

		this.dataChunk = '';
		this.fileInfo  = JSON.parse(fileInfo);
	},
	onData = function(chunk) {
		this.dataChunk += chunk;
		this.emit('data', chunk);
	},
	onDownload = function() {
		this.emit('end', this.dataChunk, this.fileInfo);
	},
	onRequest = function(response) {
		response.setEncoding('binary');
		response
			.on('data', onData.bind(this))
			.on('end', onDownload.bind(this));
	};

ImageFile.prototype = Object.create(EventEmitter.prototype);

ImageFile.prototype.request = function() {
	var urlData  = url.parse(this.fileInfo.dest),
		options  = {
			host: urlData.host,
			port: urlData.port,
			path: urlData.pathname
		},
		request = http.get(options, onRequest.bind(this));

	request.on('error', this.emit.bind(this, 'error'));
};

ImageFile.prototype.get = function() {
	if (this.fileInfo.error) {
		return this.emit('error', this.fileInfo.error);
	}

	return this.request();
};

module.exports = ImageFile;
