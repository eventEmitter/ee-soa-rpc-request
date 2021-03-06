!function(){

    var   Class            = require('ee-class')
        , log              = require('ee-log')
        , argv             = require('ee-argv')
        , debug            = argv.has('debug-sideloading')
        , EventEmitter     = require('ee-event-emitter')
        , SOAResponse      = require('ee-soa-response')
        , HTTPRequest      = require('ee-webserver').Request
        , Parser           = require('ee-rest-headers')
        , factory          = require('ee-soa-transport-rest').factory;




    /**
     * the exported funtion binds a custom request class
     * to the passed externalContext
     */
    module.exports = function(externalContext) {
        var   requestFactory = new factory.HTTPRequestFactory()
            , headerParser   = new Parser.Middleware();




        // this class gets instantiated once per request
        return new Class({
              inherits: EventEmitter



            , init: function(options) {
                var request = {headers: {}};

                // returns the body data
                request.getForm = this.getForm.bind(request);


                // set default headers, they are required
                this._setDefaults(request);

                // set options like they are coming from a http request
                if (options) {
                    if (options.language)      request.headers['accept-language']   = options.language;
                    if (options.languages)     request.headers['accept-language']   = options.languages.join(',');
                    if (options.language)      request.headers['content-language']  = options.language;
                    if (options.accept)        request.headers.accept               = options.accept;
                    if (options.filter)        request.headers.filter               = options.filter;
                    if (options.select)        request.headers.select               = options.select;
                    if (options.order)         request.headers.order                = options.order;
                    if (options.range)         request.headers.range                = options.range;
                    if (options.token)         request.headers.authorization        = 'internal '+options.token;
                    if (options.accessToken)   request.headers.authorization        = 'internal '+options.accessToken;

                    // additional accessTokens for internal request?
                    if (options.accessTokens)  this.accessTokens                  = options.accessTokens;

                    // the url may be passed here
                    if (options.url)        this.endPoint = options.url;
                    if (options.endPoint)   this.endPoint = options.endPoint;


                    // allow setting other methods
                    if (options.method) request.method = options.method.toUpperCase().trim();

                    // set the body on the request
                    if (options.data) request.data = options.data;
                    if (options.body) request.data = options.body;


                    // hmm, what?
                    if(options.parameters) this.parameters = options.parameters;
                }

                // store for later use
                this.request = request;
                this.request.url = this.endPoint;
            }




            /**
             * method is added to the request, returns the body
             */
            , getForm: function(callback) {
                callback(this.data);
            }




            /**
             * sets default headers on the fake webrequest
             */
            , _setDefaults: function(request) {
                request.headers['accept-language'] = 'en';
                request.headers['api-version']     = '0.0.1';
                request.headers['content-type']    = 'application/json';
                request.headers.accept             = 'application/json';
                request.method                     = 'GET';
                request.host                       = 'rpcrequest.intern';
            }







            , convert: function() {

                // convert, dont do anything else
                return new Promise((resolve, reject) => {
                    let executed = false;


                    // used for some crzyness going on here
                    const callback = (status, data) => {
                        if (!executed) {
                            executed = true;
                            reject(new Error(`Converting the request failed: ${data.message}`));
                        }
                    }


                    // get a fake http request
                    const httpRequest = new HTTPRequest({request: this.request});


                    // parse the headers on the http request. this
                    // modeule is a ee-webservice mifddleware, so we
                    // need to satisfy that interface
                    headerParser.request(httpRequest, this.convertHTTPintoInternalResponse(callback), function() {
                        // if we're arrived here we got some valid http headers

                        // convert this to an internal request
                        requestFactory.createUnifiedRequest(httpRequest, function(err, internalRequest) {
                            if (err) this.convertErrToInteralResponse(err, callback);
                            else {
                                var internalRespone = new SOAResponse();


                                // set parameters if required (who know what this is?)
                                if (this.parameters) internalRequest.setParameters(this.parameters);

                                // add additional tokens?
                                if(this.accessTokens && this.accessTokens.length) {
                                    this.accessTokens.forEach((token) => {
                                        internalRequest.addAccessToken(token);
                                    });
                                }


                                // lets randomly try the third error pattern. holy ...
                                try {
                                    internalRequest.validate();
                                } catch (err) {
                                    this.convertErrToInteralResponse(err, callback);
                                    return;
                                }


                                // add data
                                if (this.request.data) internalRequest.setContent(this.request.data);


                                if (!executed) {
                                    resolve({
                                        request: internalRequest
                                        , response: internalRespone
                                    });
                                }
                            }
                        }.bind(this));
                    }.bind(this));
                });
            }







            /**
             * send the request into the soa
             *
             * @param {string} endPoint like /event
             * @param {function} callback optional callback
             *
             * @returns {Promise} if the callback was omitted
             */
            , send: function(endPoint, callback) {
                var cb, httpRequest, promise, rejectPromise, resolvePromise;

                if (typeof endPoint === 'function') {
                    callback = endPoint;
                    endPoint = this.endPoint;
                }
                else if (!endPoint) endPoint = this.endPoint;


                // add the endpoint to the request
                if (endPoint) this.request.url = (endPoint[0] === '/' ? endPoint : ('/' + endPoint));

                // get a fake http request
                httpRequest = new HTTPRequest({request: this.request});

                // there may be an acesstoken on the external externalContext
                // add it to our fake http request
                if (externalContext.token) httpRequest.accessToken = externalContext.token;


                // return a promise if the callback is omitted!
                if (!callback) {
                    callback = function(statusCode, data) {
                        if (statusCode !== 1 && statusCode !== 2) rejectPromise({status: statusCode, data: data});
                        else resolvePromise(data);
                    };

                    // convert callback to a promise, what an awful magic :/
                    promise = new Promise(function(resolve, reject) {
                        rejectPromise = reject;
                        resolvePromise = resolve;
                    });
                }




                // not good but somewhat helpful debugging stuff
                // highjacking the callback
                if (debug) {
                    log.info('Outgoing RPC request on «'+endPoint+'» ...');

                    // intercept request
                    cb = callback;
                    callback = function(status, data) {
                        log.highlight('RPC request on «'+endPoint+'» got a response with the status «'+status+'» ...');
                        if (status !== 1 && status !== 2) log(data);

                        cb.apply(null, Array.prototype.slice.call(arguments, 0))
                    }.bind(this);
                }






                // parse the headers on the http request. this
                // modeule is a ee-webservice mifddleware, so we
                // need to satisfy that interface
                headerParser.request(httpRequest, this.convertHTTPintoInternalResponse(callback), function() {
                    // if we're arrived here we got some valid http headers

                    // convert this to an internal request
                    requestFactory.createUnifiedRequest(httpRequest, function(err, internalRequest) {
                        if (err) this.convertErrToInteralResponse(err, callback);
                        else {
                            var internalRespone = new SOAResponse();


                            // set parameters if required (who know what this is?)
                            if (this.parameters) internalRequest.setParameters(this.parameters);

                            // add additional tokens?
                            if(this.accessTokens && this.accessTokens.length) {
                                this.accessTokens.forEach((token) => {
                                    internalRequest.addAccessToken(token);
                                });
                            }

                            // lets randomly try the third error pattern. holy ...
                            try {
                                internalRequest.validate();
                            } catch (err) {
                                this.convertErrToInteralResponse(err, callback);
                                return;
                            }


                            // add data
                            if (this.request.data) internalRequest.setContent(this.request.data);


                            // wait for the response
                            internalRespone.on('end', callback);



                            // and some logs again
                            if (debug) log.debug('Emitting RPC request on «'+endPoint+'» on parent class ...');


                            // emit the request on the external externalContext
                            externalContext.emit('request', internalRequest, internalRespone);
                        }
                    }.bind(this));
                }.bind(this));



                // we want to be backwards compatible, returning this
                // if no promise is returned
                return promise || this;
            }




            /**
             * some methods return error object but we need
             * a valid internal response. this converst it!
             */
            , convertErrToInteralResponse: function(err, callback) {
                callback(SOAResponse.statusCodes.SERVICE_EXCEPTION, {message: err.message, stack: err.stack});
            }



            /**
             * the http header parser middleware responds with
             * http statuscodes, but we're working with internal
             * request and need thus to convert into that sort
             * of response
             */
            , convertHTTPintoInternalResponse: function(callback) {
                return {
                    send: function(status, message) {
                        // the parameters are not fixed, but
                        // we expect them to be in this order and type

                        callback(SOAResponse.statusCodes.ACCESS_MALFORMED, {message: message, httpStatus: status});
                    }
                }
            }
        });
    };
}();
