var csv = require('csv');
var request = require('request');
var cheerio = require('cheerio');

var targetFolder = "nodejs-datamining-examples/nodes/";
var targetWebsite = "http://www.google.com/";
var searchQueryParameterPrefix = "search?hl=en&output=search&q=";
var pagingPrefix = "&start=";
var termToSearchFor = "Cider";

var pagesToProcess = 10;
var linkRankings = [];

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

		var currentRank = 1;

		$('#search h3.r a').each(function(key, value) {		
			var calculatedRank = parseInt(currentPageStart + currentRank);
			
			linkRankings[calculatedRank] = new Object();
			linkRankings[calculatedRank].Link = $(value).attr('href');
			linkRankings[calculatedRank].Title = $(value).text();
			
			currentRank++;
		});
	}
	pagesToProcess--;
};

var csvStream = csv.createFile(targetFolder + "GoogleScraperSearchRankings_" + termToSearchFor + ".csv");
		
csvStream.writeField("RANK");
csvStream.writeField("LINK");
csvStream.writeField("TITLE");
csvStream.endLine();

for(var i = 0; i != 10; i++) {

	var targetUrl = 
			targetWebsite+
			searchQueryParameterPrefix+
			termToSearchFor+
			pagingPrefix+
			(i * 10);
		
	request.get(targetUrl, scrapeLinksFromPage);
	console.log(targetUrl);
 };

var timedFileCompilingCheck = setInterval(function() {
	if (pagesToProcess == 0) {
		linkRankings = linkRankings.sort();
		
		if (linkRankings.length == 0) {
			console.log("No results found");
		}
	
		cheerio.each(linkRankings, function(key, value) {
			if (value) {
				csvStream.writeField(key);
				csvStream.writeField(value.Link);
				csvStream.writeField(value.Title);
				csvStream.endLine();
			}
		});
		clearInterval(timedFileCompilingCheck);
	}
}, 500);
