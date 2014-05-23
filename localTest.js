
	
	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, EventEmitter 	= require('ee-event-emitter')
		, assert 		= require('assert');


	var Target = new Class({inherits: EventEmitter})
		target = new Target();


	var   Request  		= require('./')	
		, EasyRequest  	= Request(target)
		, req;


	req = new EasyRequest({
		select: ', eventdata.*, eventdata.venue.*, eventdata.tag.*'
	});

	req._collectSubRequests(req.requests);

	log('============================================',req._request, JSON.stringify(req._request));