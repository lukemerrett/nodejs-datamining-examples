

var request = require('request');
var cheerio = require('cheerio');

var parsePage = function(error, response, body) {
	if (error || response.statusCode != 200) {
		console.log(error);
	}
	else {
		$ = cheerio.load(body);
		
		$('#siteTable a.title').each(function(key, value) {
			var link = $(value).attr('href');
			console.log(link);
		});
	}
};

request.get("http://www.reddit.com", parsePage);