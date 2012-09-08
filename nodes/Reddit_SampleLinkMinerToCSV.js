
var csv = require('csv');
var request = require('request');
var cheerio = require('cheerio');

var scrapeLinksFromPage = function(error, response, body) {
	if (error || response.statusCode != 200) {
		console.log(error);
	}
	else {
		$ = cheerio.load(body);
		
		var csvStream = csv.createFile("redditLinks.csv");
		
		csvStream.writeField("LINK");
		csvStream.writeField("TITLE");
		csvStream.endLine();
		
		$('#siteTable a.title').each(function(key, value) {
			var link = $(value).attr('href');
			var title = $(value).text();
			
			csvStream.writeField(link);
			csvStream.writeField(title);
			csvStream.endLine();
		});
		
	}
};

request.get("http://www.reddit.com", scrapeLinksFromPage);