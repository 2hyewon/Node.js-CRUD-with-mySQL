var http = require('http');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var db = require('./lib/db');
var topic = require('./lib/topic');
var author = require('./lib/author');
var bodyparser = require('body-parser');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    const limit = 5;
    if(pathname === '/'){
      if(queryData.id === undefined && queryData.page === undefined && queryData.sort === undefined){
        topic.home(request, response, limit, pathname, '1', '');
      } else if(queryData.id === undefined && queryData.page === undefined){
        topic.home(request, response, limit, pathname, '1', queryData.sort);
      } else if(queryData.id === undefined && queryData.sort === undefined){
        topic.home(request, response, limit, pathname, queryData.page, '');
      } else if(queryData.id === undefined){
        topic.home(request, response, limit, pathname, queryData.page, queryData.sort);
      } else{
        topic.page(request, response, queryData.page, queryData.id, limit, pathname, queryData.sort);
      }
    } else if(pathname === '/create'){
      topic.create(request, response, queryData.page);
    } else if(pathname === '/create_process'){
      topic.create_process(request, response);
    } else if(pathname === '/update'){
      topic.update(request, response, queryData.page, queryData.id);
    } else if(pathname === '/update_process'){
      topic.update_process(request, response);
    } else if(pathname === '/delete_process'){
      topic.delete_process(request, response, limit);
    } else if(pathname === '/search_result'){
      topic.search_result(request, response, queryData.title, queryData.author);
    } else if(pathname === '/search_process'){ //author와 공유
      topic.search_process(request, response);
    } else if(pathname === '/sort_process'){
      topic.sort_process(request, response, queryData.title, queryData.author, queryData.id, queryData.page);
    }
      else if(pathname === '/author'){
        if(queryData.sort === undefined){
          author.home(response, pathname, queryData.author, '');
        }
        else{
          author.home(response, pathname, queryData.author, queryData.sort);
        }
    } else if(pathname === '/author/create'){
      author.create(response);
    } else if(pathname === '/author/create_process'){
      author.create_process(request, response);
    } else if(pathname === '/author/update'){
      author.update(request, response, queryData.id);
    } else if(pathname === '/author/update_process'){
      author.update_process(request, response);
    } else if(pathname === '/author/delete_process'){
      author.delete_process(request, response);
    } else if(pathname === '/author/search_result'){
      author.search_result(request, response, queryData.author, queryData.sort, pathname);
    } else if(pathname === '/author/search_result_articles_for_this_author'){
      author.search_result_articles_for_this_author(request, response, queryData.author, queryData.title);
    } else if(pathname === '/author/redirect_title_to_topic'){
      author.redirect_title_to_topic(request, response, limit, queryData.id);
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
