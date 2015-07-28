

	var   Class        = require('ee-class')
		, log          = require('ee-log')
		, EventEmitter = require('ee-event-emitter')
		, assert       = require('assert');


	var Target = new Class({inherits: EventEmitter})
		target = new Target();


	var   Request  		= require('../')
		, EasyRequest  	= Request(target)
		, req;



	describe('The Request', function(){
		it('should not throw when instantiated', function(){
			req = new EasyRequest();
		});

		it('should parse a simple filter statement', function(done){
			target.off().on('request', function(req, res){
				assert.equal(JSON.stringify(req.filters), '{\"name\":[{\"operator\":\"=\",\"value\":3}]}');
				done();
			});

			req = new EasyRequest({
				filter: 'name=3'
			}).send();
		});

		it('should parse an advanced filter statement', function(done){
			target.off().on('request', function(req, res){
				assert.equal(JSON.stringify(req.filters), '{"name":[{"operator":"=","value":3}],"eventdata":{"tag":{"name":[{"operator":"=","value":"hui"}]}}}');
				done();
			});

			req = new EasyRequest({
				filter: 'name=3, eventdata.tag.name="hui"'
			}).send();
		});

		it('should parse a select statement', function(done){
			target.off().on('request', function(req, res){
				assert.equal(JSON.stringify(req), '{"action":1,"formats":{"0":{"type":"application","subtype":"json"},"length":1},"filters":{},"relatedTo":{"model":null,"id":null},"options":{},"parameters":{},"fields":["*"],"accessToken":{"type":null,"value":null},"requestToken":{"type":null,"value":null},"range":{"from":0,"to":null},"version":"0.0.1","accessTokens":[],"collection":null,"resourceId":null,"languages":["en"],"contentType":{"type":"application","subtype":"json"},"subRequests":[{"action":1,"formats":{"0":{"type":"application","subtype":"json"},"length":1},"filters":{},"relatedTo":{"model":null,"id":null},"options":{},"parameters":{},"fields":["*"],"accessToken":{"type":null,"value":null},"requestToken":{"type":null,"value":null},"range":{"from":0,"to":null},"version":"0.0.1","accessTokens":[],"collection":"eventdata","resourceId":null,"languages":["en"],"contentType":{"type":"application","subtype":"json"},"tenant":null,"subRequests":[{"action":1,"formats":{"0":{"type":"application","subtype":"json"},"length":1},"filters":{},"relatedTo":{"model":null,"id":null},"options":{},"parameters":{},"fields":["*"],"accessToken":{"type":null,"value":null},"requestToken":{"type":null,"value":null},"range":{"from":0,"to":null},"version":"0.0.1","accessTokens":[],"collection":"tag","resourceId":null,"languages":["en"],"contentType":{"type":"application","subtype":"json"},"tenant":null,"subRequests":[]}]}]}');
				done();
			});

			req = new EasyRequest({
				select: '*, eventdata.*, eventdata.tag.*'
			}).send();

		});

		it('should parse a complex select statement', function(done){
			target.off().on('request', function(req, res){
				assert.equal(JSON.stringify(req), '{"action":1,"formats":{"0":{"type":"application","subtype":"json"},"length":1},"filters":{},"relatedTo":{"model":null,"id":null},"options":{},"parameters":{},"fields":["*"],"accessToken":{"type":null,"value":null},"requestToken":{"type":null,"value":null},"range":{"from":0,"to":null},"version":"0.0.1","accessTokens":[],"collection":null,"resourceId":null,"languages":["en"],"contentType":{"type":"application","subtype":"json"},"subRequests":[{"action":1,"formats":{"0":{"type":"application","subtype":"json"},"length":1},"filters":{},"relatedTo":{"model":null,"id":null},"options":{},"parameters":{},"fields":["*"],"accessToken":{"type":null,"value":null},"requestToken":{"type":null,"value":null},"range":{"from":0,"to":null},"version":"0.0.1","accessTokens":[],"collection":"eventdata","resourceId":null,"languages":["en"],"contentType":{"type":"application","subtype":"json"},"tenant":null,"subRequests":[{"action":1,"formats":{"0":{"type":"application","subtype":"json"},"length":1},"filters":{},"relatedTo":{"model":null,"id":null},"options":{},"parameters":{},"fields":["*"],"accessToken":{"type":null,"value":null},"requestToken":{"type":null,"value":null},"range":{"from":0,"to":null},"version":"0.0.1","accessTokens":[],"collection":"venue","resourceId":null,"languages":["en"],"contentType":{"type":"application","subtype":"json"},"tenant":null,"subRequests":[]},{"action":1,"formats":{"0":{"type":"application","subtype":"json"},"length":1},"filters":{},"relatedTo":{"model":null,"id":null},"options":{},"parameters":{},"fields":["*"],"accessToken":{"type":null,"value":null},"requestToken":{"type":null,"value":null},"range":{"from":0,"to":null},"version":"0.0.1","accessTokens":[],"collection":"tag","resourceId":null,"languages":["en"],"contentType":{"type":"application","subtype":"json"},"tenant":null,"subRequests":[]}]}]}');
				done();
			});

			req = new EasyRequest({
				select: '*, eventdata.*, eventdata.venue.*, eventdata.tag.*'
			}).send();

		});

		it('should parse a range statement', function(done){
			target.off().on('request', function(req, res){
				assert.equal(JSON.stringify(req.range), '{"from":0,"to":10}');
				done();
			});

			req = new EasyRequest({
				range: '0-10'
			}).send();
		});

		it('should parse a simple order statement', function(done){
			target.off().on('request', function(req, res){
				assert.equal(JSON.stringify(req.order), '{"startdate":"DESC"}');
				done();
			});

			req = new EasyRequest({
				order: 'startdate DESC'
			}).send();
		});

		it('should parse an order statement', function(done){
			target.off().on('request', function(req, res){
				assert.equal(JSON.stringify(req.order), '{"startdate":"DESC","eventData":{"id":"ASC","venue":{"id":"ASC"}}}');
				done();
			});

			req = new EasyRequest({
				order: 'startdate DESC, eventData.id, eventData.venue.id'
			}).send();
		});

		it('emit the request event with the correct configured requests', function(done){
			target.off().on('request', function(req, res){
				assert.equal(JSON.stringify(req), '{"action":1,"formats":{"0":{"type":"application","subtype":"json"},"length":1},"filters":{"name":[{"operator":"=","value":3}],"eventdata":{"tag":{"name":[{"operator":"=","value":"hui"}]}}},"relatedTo":{"model":null,"id":null},"options":{},"parameters":{},"fields":["*"],"accessToken":{"type":null,"value":null},"requestToken":{"type":null,"value":null},"range":{"from":0,"to":null},"version":"0.0.1","accessTokens":[],"collection":"event","resourceId":null,"languages":["en"],"contentType":{"type":"application","subtype":"json"},"subRequests":[{"action":1,"formats":{"0":{"type":"application","subtype":"json"},"length":1},"filters":{},"relatedTo":{"model":null,"id":null},"options":{},"parameters":{},"fields":["*"],"accessToken":{"type":null,"value":null},"requestToken":{"type":null,"value":null},"range":{"from":0,"to":null},"version":"0.0.1","accessTokens":[],"collection":"eventdata","resourceId":null,"languages":["en"],"contentType":{"type":"application","subtype":"json"},"tenant":null,"subRequests":[{"action":1,"formats":{"0":{"type":"application","subtype":"json"},"length":1},"filters":{},"relatedTo":{"model":null,"id":null},"options":{},"parameters":{},"fields":["*"],"accessToken":{"type":null,"value":null},"requestToken":{"type":null,"value":null},"range":{"from":0,"to":null},"version":"0.0.1","accessTokens":[],"collection":"tag","resourceId":null,"languages":["en"],"contentType":{"type":"application","subtype":"json"},"tenant":null,"subRequests":[]}]}]}');
				res.send(1, {});
			});

			req = new EasyRequest({
				  select: '*, eventdata.*, eventdata.tag.*'
				, filter: 'name=3, eventdata.tag.name="hui"'
			}).send('event', function(status, data){
				assert.equal(status, 1);
				done();
			});
		});

		it('should set the accesstoken correctly', function(done){
			target.off().on('request', function(req, res){
				assert.equal(JSON.stringify(req.accessTokens), '["abcdefg"]');
				assert.equal(JSON.stringify(req.subRequests[0].accessTokens), '["abcdefg"]');
				done();
			});

			req = new EasyRequest({
				  token: 'abcdefg'
				, select: 'x, x.y'
			}).send();
		});
	});
