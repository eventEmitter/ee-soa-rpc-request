!function(){

    var   Class            = require('ee-class')
        , log              = require('ee-log')
        , argv             = require('ee-argv')
        , type             = require('ee-types')
        , debug            = argv.has('dev-sideloading')
        , EventEmitter     = require('ee-event-emitter')
        , SOARequest       = require('ee-soa-request')
        , SOAResponse      = require('ee-soa-response')
        
        , WebserverRequest = require('ee-webserver').Request
        , Parser           = require('ee-rest-headers')
        , factory          = require('ee-soa-transport-rest').factory;

	module.exports = function(target) {
		var RPCRequest = new Class({
			inherits: EventEmitter

			, language: 'en'

			, init: function(options) {
                this._requestFactory = new factory.HTTPRequestFactory();
                this._restHeaders    = new Parser.Middleware(); 
                this._response       = new SOAResponse();
                this._request        = {
                    headers: {
                        host : 'rpcrequest.intern'
                    }
                }

                this._setDefaults(this._request);

				if(options) {
					if(options.language)      this._request.headers['accept-language'] = options.language;
					if(options.languages)     this._request.headers['accept-language'] = options.languages.join(',');
					if(options.filter)        this._request.headers['filter']          = options.filter;
					if(options.select)        this._request.headers['select']          = options.select;
					if(options.order)         this._request.headers['order']           = options.order;
					if(options.range)         this._request.headers['range']           = options.range;
                }
			}

			, _setDefaults: function(request) {
                request.headers['accept-language'] = this.language;
                request.headers['api-version']     = '0.0.1';
                request.headers['accept']          = 'application/json';
                request.method                     = 'GET';
			}

			, send: function(endpoint, callback) {
                this._request.url = '/' + endpoint;

                var webRequest = new WebserverRequest({
                    request: this._request
                });

                var request = this._restHeaders.request(webRequest, { send: callback }
                    , function() {
                        this._requestFactory.createUnifiedRequest(webRequest, function(err, request) {
                            if(err) return callback(err);

                            try {
                                request.validate();
                            } catch (err) {
                                return callback(err);
                            }
                            
                            this._response.on('end', function(status, data) {
                                if(debug) {
                                    log.highlight('Got data from template API call. Status «' + status + '».');
                                    if(data && type.function(data.dir)) data.dir();
                                    else log(data);
                                }

                                if(callback) callback(status, data);
                            }.bind(this));

                            target.emit('request', request, this._response);

                        }.bind(this));
                    }.bind(this)
                );
                
				return this;
			}
		});

		return RPCRequest;
	};
}();
