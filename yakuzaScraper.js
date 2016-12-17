// NEW scraping idea, scrape Reddit!
'use strict';

var Yakuza, job, articleSchema, Gurkha;

Yakuza = require('yakuza');
Gurkha = require('gurkha');

articleSchema = {
  $rule: '.thing',
  title: 'div.entry p.title a.title',
  link: {
    $rule: 'div.entry p.title a.title',
    $sanitizer: function ($elem) {
      return 'http://www.reddit.com' + $elem.attr('href');
    }
  }
}

Yakuza.scraper('Articles');
Yakuza.agent('Articles', 'Reddit').plan([
  'GetArticleLinks',
  'JoinArticleLinks'
]);

Yakuza.task('Articles', 'Reddit', 'GetArticleLinks')
  .builder(function (job) {
    return job.params.subreddits;
  })

  .main(function (task, http, params) {
    var baseUrl, opts;

    baseUrl = 'http://www.reddit.com/r/';
    opts = {
      url: baseUrl + params
    };

    http.get(opts).then(function (result) {
      var linkParser, articles;

      linkParser = new Gurkha(articleSchema);
      articles = linkParser.parse(result.body);

      task.share('articles', articles, {method: function (current, newValue) {
        if (!current) {
          return newValue;
        }

        // Concatenate arrays
        return current.concat(newValue);
      }});

      task.success(articles);
    });
  });

  Yakuza.task('Articles', 'Reddit', 'JoinArticleLinks')
    .builder(function (job) {
      return {articles: job.shared('GetArticleLinks.articles')};
    })

    .main(function (task, http, params) {
      task.success(params.articles);
    });


job = Yakuza.job('Articles', 'Reddit', {subreddits: ['WatchPeopleCode']});

job.on('task:JoinArticleLinks:success', function (result) {
  console.log('--- Final result ---');
  console.log(result.data);
});

job.enqueueTaskArray(['GetArticleLinks', 'JoinArticleLinks']);

job.run();