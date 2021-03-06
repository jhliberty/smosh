'use strict';

var http         = require('http'),
	EventEmitter = require('events').EventEmitter;

var WebService = function(serviceInfo) {
		EventEmitter.call(this);

		this.serviceInfo = serviceInfo;

		this.dataChunk  = '';
	},
	onData = function(chunk) {
		this.dataChunk += chunk;
	},
	onEnd = function() {
		this.emit('end', this.dataChunk);
	},
	onRequestCompleted = function(response) {
		response
			.on('data', onData.bind(this))
			.on('end', onEnd.bind(this));
	};

WebService.prototype = Object.create(EventEmitter.prototype);

WebService.prototype.createPostData = function() {
	var doubleDash = '--',
		boundary   = '------multipartformboundary' + (new Date()).getTime();

	return {
		contentType: 'multipart/form-data; boundary=' + boundary,
		builder: [
			[doubleDash, boundary].join(''),
			'Content-Disposition: form-data; name="files"; filename="' + this.vinyl.path + '"',
			'Content-Type: application/octet-stream',
			'',
			this.binaryFile,
			[doubleDash, boundary, doubleDash].join(''),
			''
		].join('\r\n')
	};
};

WebService.prototype.requestData = function() {
	var postData = this.createPostData(),
		options = {
			host: this.serviceInfo.host,
			path: this.serviceInfo.path,
			method: 'POST',
			headers: {
				'Content-Type': postData.contentType,
				'Content-Length': postData.builder.length
			}
		},
		httpRequest = http.request(options, onRequestCompleted.bind(this));

	httpRequest.write(postData.builder, "binary");
	httpRequest.end();
	httpRequest.on('error', this.emit.bind(this, 'error'));
};

WebService.prototype.execute = function(vinyl) {
	if (vinyl.contents) {
		this.binaryFile = vinyl.contents.toString('binary');
		this.vinyl = vinyl;

		this.requestData();	
	}
};

module.exports = WebService;
