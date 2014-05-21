
	
	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, EventEmitter 	= require('ee-event-emitter')
		, assert 		= require('assert');


	var Target = new Class({inherits: EventEmitter})
		target = new Target();


	var   Request  		= require('../')	
		, EasyRequest  	= Request(target)
		, req;



	describe('The Request', function(){
		it('should not throw when instantiated', function(){
			req = new EasyRequest();
		});

		it('should parse a simple filter statement', function(){
			req = new EasyRequest({
				filter: 'name=3'
			});

			assert.equal(JSON.stringify(req.filters), '{\"name\":[{\"operator\":\"=\",\"value\":\"3\"}]}');
		});	

		it('should parse an advanced filter statement', function(){
			req = new EasyRequest({
				filter: 'name=3, eventdata.tag.name=>"hui"'
			});

			assert.equal(JSON.stringify(req.filters), '{"name":[{"operator":"=","value":"3"}],"eventdata":{"tag":{"name":[{"operator":"=>","value":"hui"}]}}}');
		});

		it('should parse a select statement', function(){
			req = new EasyRequest({
				select: '*, eventdata.* eventdata.tag.*'
			});
		});

		it('should parse a select statement', function(){
			req = new EasyRequest({
				range: '0-10'
			});
			assert.equal(JSON.stringify(req._request.range), '{"to":"10","from":"0"}');
		});

		it('emit the request event with the corect configured requests', function(done){
			target.on('request', function(req, res){
				assert.equal(JSON.stringify(req), '{"formats":{},"filters":{"name":[{"operator":"=","value":"3"}],"eventdata":{"tag":{"name":[{"operator":"=>","value":"hui"}]}}},"relatedTo":{"model":null,"id":null},"accessToken":{"type":null,"value":null},"requestToken":{"type":null,"value":null},"fields":"*","collection":"event","subRequests":[{"formats":{"0":{"type":"application","subtype":"json"},"1":{"type":"application","subtype":"json"},"length":2},"filters":{},"relatedTo":{"model":null,"id":null},"accessToken":{"type":null,"value":null},"requestToken":{"type":null,"value":null},"collection":"eventdata","version":"0.0.1","action":1,"fields":"*","subRequests":[{"formats":{"0":{"type":"application","subtype":"json"},"length":1},"filters":{},"relatedTo":{"model":null,"id":null},"accessToken":{"type":null,"value":null},"requestToken":{"type":null,"value":null},"collection":"tag","version":"0.0.1","action":1,"fields":"*"}]}]}');
				res.send(1, {});
			});

			req = new EasyRequest({
				  select: '*, eventdata.*, eventdata.tag.*'
				, filter: 'name=3, eventdata.tag.name=>"hui"'
			}).send('event', function(status, data){
				assert.equal(status, 1);
				done();
			});
		});
	});
	