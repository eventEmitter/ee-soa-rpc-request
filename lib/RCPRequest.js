!function(){

	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, EventEmitter 	= require('ee-event-emitter')
		, SOARequest 	= require('ee-soa-request')
		, SOAResponse 	= require('ee-soa-response');



	



	module.exports = function(target) {
		var RPCRequest = new Class({
			inherits: EventEmitter

			, language: 'en'

			, init: function(options) {
				this._request = new SOARequest();
				this._response = new SOAResponse();

				this._setDefaults(this._request);

				this.filters = {};
				this.requests = {request: this._request};

				if (options) {
					if (options.filter) this._buildFilters(options.filter);
					if (options.select) this._buildSelects(options.select);
					if (options.language) this.language = options.language;
					if (options.range) this._request.setRange(options.range.substr(0, options.range.indexOf('-')), options.range.substr(options.range.indexOf('-')+1));
				}
			}


			, _setDefaults: function(request) {
				request.setLanguages([this.language]);
				request.setVersion('0.0.1');
				request.addFormat('application', 'json');
				request.setAction(request.READ)
			}



			, _buildSelects: function(select) {
				select.split(',').forEach(function(item){
					item = item.trim().split('.');

					this._storeSelect(item[0], item.slice(1), this.requests);
				}.bind(this));
			}


			, _storeSelect: function(key, keys, tree) {
				if (keys && keys.length) {
					if (!tree[key]) tree[key] = {request: new SOARequest()};
					tree[key].request.setCollection(key);
					this._setDefaults(tree[key].request);

					this._storeSelect(keys[0], keys.slice(1), tree[key]);
				}
				else {
					tree.request.setFields([key]);
				}
			}


			, _buildFilters: function(filter) {
				filter.split(',').forEach(this._storeFilter.bind(this));
			}




			, _storeFilter: function(filter) {
				var regResult = /([a-z0-9\.]+)([=<>\!]+)"?([^"]+)"?/gi.exec(filter.trim())
					, key
					, operator
					, value;

				if (regResult) {
					key  		= regResult[1].trim().split('.');
					operator 	= regResult[2];
					value 		= regResult[3];

					this._storeFilterValue(key[0], key.splice(1), this.filters, operator, value);
				}
			}


			, _storeFilterValue: function(key, children, tree, operator, value) {
				if (children && children.length) {
					if (!tree[key]) tree[key] = {};

					this._storeFilterValue(children[0], children.slice(1), tree[key], operator, value);
				}
				else {
					if (!tree[key]) tree[key] = [];

					tree[key].push({
						  operator 	: operator
						, value 	: value
					});
				}
			}


			, _collectSubRequests: function(parent, tree) {
				Object.keys(tree).forEach(function(key){
					if (key !== 'request') {
						parent.setSubRequests([tree[key].request]);
						this._collectSubRequests(tree[key].request, tree[key]);
					}
				}.bind(this));
			}


			, send: function(endpoint, callback) {
				this._request.setCollection(endpoint);
				this._request.setFilters(this.filters);

				this._collectSubRequests(this._request, this.requests);

				this._response.on('end', callback || function(){});

				target.emit('request', this._request, this._response);

				return this;
			}
		});


		return RPCRequest;
	};
}();
