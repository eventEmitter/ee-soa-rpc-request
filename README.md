# ee-soa-rpc-request

[![Greenkeeper badge](https://badges.greenkeeper.io/eventEmitter/ee-soa-rpc-request.svg)](https://greenkeeper.io/)

Easy SOA requests

## installation

	npm install ee-soa-rpc-request

## build status

[![Build Status](https://travis-ci.org/eventEmitter/ee-soa-rpc-request.png?branch=master)](https://travis-ci.org/eventEmitter/ee-soa-rpc-request)


## usage


	var rpcRequest = require('ee-soa-rpc-request');

	// you have to bind the rpcRequest class to any object accepting 
	// requets via their request event
	var RPCRequest = rpcRequest(website);


	myRequest = new RPCRequest({
		  select: '*, eventdata.*, eventdata.tag.*'
		, filter: 'name=3, eventdata.tag.name=>"hui"'
	}).send('event', function(status, data) {

	});
