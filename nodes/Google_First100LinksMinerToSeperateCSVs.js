var csv = require('csv');
var request = require('request');
var cheerio = require('cheerio');

var targetFolder = "nodejs-datamining-examples/nodes/";
var targetWebsite = "http://www.google.com/";
var searchQueryParameterPrefix = "search?hl=en&output=search&q=";
var pagingPrefix = "&start=";
var termToSearchFor = "Cider";

var parseQueryString = function(queryString){
    var qs = queryString.split('&');
    for(var i = 0, result = {}; i < qs.length; i++){
        qs[i] = qs[i].split('=');
        result[qs[i][0]] = qs[i][1];
    }
    return result;
};

var scrapeLinksFromPage = function(error, response, body) {
	if (error || response.statusCode != 200) {
		console.log(error || "Response returned status code : " + response.statusCode);
	}
	else {
		$ = cheerio.load(body);
		
		var queryString = parseQueryString(response.request.uri.query);
		var currentPageStart = queryString["start"];
		
		var csvStream = csv.createFile(
							targetFolder+
							response.request.uri.host+
							"_"+termToSearchFor+
							"_"+currentPageStart+
							".csv");
		
		csvStream.writeField("LINK");
		csvStream.writeField("TITLE");
		csvStream.endLine();
		
		var i = 1;
		
		$('#search h3.r a').each(function(key, value) {
			var link = $(value).attr('href');
			var title = $(value).text();
			
			csvStream.writeField(link);
			csvStream.writeField(title);
			csvStream.endLine();
		});

	}
};

for(var i = 0; i != 10; i++) {
	var targetUrl = 
			targetWebsite+
			searchQueryParameterPrefix+
			termToSearchFor+
			pagingPrefix+
			(i * 10);
		
	request.get(targetUrl, scrapeLinksFromPage);
 }

