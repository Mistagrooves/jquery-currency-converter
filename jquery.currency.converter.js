/*
Copyright (c) 2011 Eric Boyer

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function($){

	var knownCurrencies = { 'USD':{t:",", d:".", s:"$"}, 'CAD':{t:",", d:".", s:"$"}, 'EUR':{t:" ", d:",", s:" €", e:true}, 'GBP':{t:",", d:".", s:"\u00A3"}, 'JPY':{t:",", c:0, s:"\u00A5" }};
	var YQLString = "http://query.yahooapis.com/v1/public/yql?q=use%20%22https%3A%2F%2Fgithub.com%2Fspullara%2Fyql-tables%2Fraw%2Fmaster%2Fyahoo%2Ffinance%2Fyahoo.finance.xchange.xml%22%20as%20exchange%3B%0Aselect%20*%20from%20exchange%20where%20pair%20%3D%20%22??????%22&format=json&diagnostics=false&callback=?";

	//adapted from http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
	function formatMoney(n, c, d, t, s, e){
		var c = isNaN(c = Math.abs(c)) ? 2 : c, 
			d = d == undefined ? "," : d, 
			t = t == undefined ? "." : t, 
			si = n < 0 ? "-" : "", 
			i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
			j = (j = i.length) > 3 ? j % 3 : 0;
	   
			return (e ? "" : s) + si + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "") + (e ? s : "");
	};
	
	function formatCurrency(region){
		var opt = region.region;
		this.text(formatMoney(parseFloat(this.text()), opt.c, opt.d, opt.t, opt.s, opt.e));
	}
	
	$.fn.convertCurrency = function(options){
		
		//from is the currency to convert from
		//to is the currency to convert to
		//region is either a region string or region options
		//
		//formatCurrency is a function if the formatting should be overwritten
		var $this = this,
			settings = {'from':null, 'to':null, 'region':null, 'formatCurrency': $this.formatCurrency || formatCurrency},
			overlay = null;
		
		if(options){
			$.extend(settings, options);
		}
		var t = null;
		
		if((!settings.to in knownCurrencies) && !$.isPlainObject(settings.region) && !$.formatCurrency)
			throw "Invalid Config";
		
		var currencyAjax = $.ajax({
			url:YQLString.replace("??????", settings.from + settings.to), 
			dataType: 'jsonp'
		});
		
		//don't do much yet on error
		currencyAjax.error(function(jqXHR, textStatus, errorThrown){
			
		});
		
		//on success iterate all the dom elements to change their value to 
		//a converted value
		currencyAjax.success(function(result, textStatus, jqXHR){
			$this.each(function(){
				var $lthis = $(this),
					value = parseFloat($lthis.data('cur-value'));
				
				$lthis.text(value * parseFloat(result.query.results.rate.Rate));
				settings.formatCurrency.apply($lthis, [{region: settings.region || knownCurrencies[settings.to]}]);
			});
		});
		
		return this;
	}
})(jQuery);
