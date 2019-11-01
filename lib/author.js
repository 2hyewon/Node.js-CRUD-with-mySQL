var url = require('url');
var qs = require('querystring');
var template = require('./template.js');
var db = require('./db');
var sanitizeHtml = require('sanitize-html');

exports.home = function(response, pathname, queryAuthor, querySort){
  var sql = `SELECT * FROM author`;
  var sort = template.sort_sql(querySort);
  if(queryAuthor === undefined || queryAuthor == ''){
    if(querySort){
      sql += ` ${sort}`;
    }
  } else {
    if(querySort){
      sql += ` where name=${queryAuthor} ${sort}`;
    }
    sql += ` where name=${queryAuthor}`;
  }
  db.query(sql, function(error, author){
    if(error){
      throw error;
    }
    db.query(`SELECT * from author`, function(error2, authors){
      var title = 'Authors';
      var search = `<form action="/search_process" method="post">
      <p><input type="text" name="title" placeholder="title">
      ${template.authorList(authors)}
      <input type="submit" value="search"></p></form>
      `;
      var listAuthors = template.authorListTable(author);
      var listSorts = template.sort_name_profile(pathname, queryAuthor);
      var html = template.HTML(title, search, '', '',
      `<a href="/author/create">create</a>`,
      `<h2>${title}</h2>${listSorts} ${listAuthors}`
    );
    response.writeHead(200);
    response.end(html);
  });
});
}
exports.create = function(response){
  db.query('SELECT * FROM author', function(error2, authors){
    var title = 'Author - create';
    var html = template.HTML(title, '', '', '', '',
    `${template.authorListTable(authors)}
    <form action="/author/create_process" method="post">
    <p><input type="text" name="author" placeholder="author name"></p>
    <p><input type="text" name="profile" placeholder="profile"></p>
    <p>
    <input type="submit">
    </p>
    </form>
    `);
    response.writeHead(200);
    response.end(html);
  });
}
exports.create_process = function(request, response){
  var body = '';
  request.on('data', function(data){
    body = body + data;
  });
  request.on('end', function(){
    var post = qs.parse(body);
    console.log('create_process > post: ', post);
    db.query(`SELECT name FROM author WHERE name='${post.author}'`, function(error, author){
      console.log('create_process:', author);
      console.log('create_process:', Boolean(author == ''));
      if(author != ''){
        //중복시 처리 필요
        response.writeHead(302, {Location: `/author`});
        response.end();
      } else {
        db.query(`INSERT INTO author (name, profile) VALUES(?, ?)`,[post.authorSelect, post.profile], function(error2, result){
          if(error2){
            throw error2;
          }
          response.writeHead(302, {Location: `/author`});
          response.end();
        });
      }
    })
  })
}
exports.update = function(request, response, queryId){
  db.query(`SELECT * FROM author`, function(error2, authors){
    if(error2){
      throw error2;
    }
    db.query(`SELECT * FROM author where id=?`,[queryId], function(error3, author){
      if(error3){
        throw error3;
      }
      var title = 'Author - update';
      var listAuthors = template.authorListTable(authors);
      var html = template.HTML(title, '', '', '',
      `<a href="/author/create">create</a> <a href="/author/update?author=${author[0].name}">rewrite</a>`,
      `
      <form action="/author/update_process" method="post">
      <p><input type="hidden" name="authorOrigin" value="${author[0].name}"></p>
      <p><input type="text" name="author" placeholder="name" value="${sanitizeHtml(author[0].name)}"></p>
      <p><input type="text" name="profile" placeholder="profile" value="${sanitizeHtml(author[0].profile)}"></p>
      <p><input type="submit"></p>
      </form>
      `
    );
    response.writeHead(200);
    response.end(html);
  });
});

}
exports.update_process = function(request, response){
  var body = '';
  request.on('data', function(data){
    body = body + data;
  });
  request.on('end', function(){
    var post = qs.parse(body);
    db.query(`UPDATE author SET name=?, profile=? where name=?`, [post.author, post.profile, post.authorOrigin], function(error, result){
      if(error){
        throw error;
      }
      response.writeHead(302, {Location: `/author`});
      response.end();
    })
  });
}
exports.delete_process = function(request, response){
  var body ='';
  request.on('data', function(data){
    body = body + data;
  });
  request.on('end', function(){
    var post = qs.parse(body);
    console.log('delete_process > post: ',post);
    db.query(`DELETE FROM author WHERE name=?`,[post.author],function(error, result){
      if(error){
        throw error;
      }
      response.writeHead(302, {Location: `/author`});
      response.end();
    })
  });
}

exports.search_result = function(request, response, queryAuthor, querySort, pathname){
  var sort = template.sort_sql(querySort);
  var sql = '';
  console.log('querySort?????',querySort);
  if(querySort != '' && querySort !== undefined){
    sql = `SELECT topic.id,title,description,created,name,profile FROM topic LEFT JOIN author ON topic.author_id=author.id where author.name LIKE '${queryAuthor}' ${sort}`
  } else{
    sql = `SELECT topic.id,title,description,created,name,profile FROM topic LEFT JOIN author ON topic.author_id=author.id where author.name LIKE '${queryAuthor}'`
  }
  //id 쿼리로 페이지를 열어야 하는데 * 은 id가 중복돼서 아래와 같은 쿼리문을 사용함.
  db.query(sql, function(error, results){
    if(error){
      throw error;
    }
    db.query('SELECT * FROM author', function(error2,authors){
      if(error2){
        throw error2;
      }
      var title = `search - ${queryAuthor}`;
      var search = `<form action="/search_process" method="post">
      <p><input type="text" name="title" placeholder="title">
      ${template.authorList(authors)}
      <input type="submit" value="search"></p></form>
      `;
      var listResults = template.listForAuthorSearchResult(results, queryAuthor);
      var listSorts = template.sort_title_date_author(pathname, '', queryAuthor, '', querySort);
      var html = template.HTML(title, search, '', `${listSorts} ${listResults}`, '', '');
      response.writeHead(200);
      response.end(html);
    });
  });
}

exports.search_result_articles_for_this_author = function(request, response, queryAuthor, queryTitle, querySort){
  db.query(`SELECT topic.id,title,description,created,name,profile FROM topic LEFT JOIN author ON topic.author_id=author.id where author.name LIKE '${queryAuthor}' AND topic.title LIKE '%${queryTitle}%'`, function(error, results){
    if(error){
      throw error;
    }
    db.query('SELECT * FROM author', function(error2, authors){
      var title = `search - among the ${queryAuthor}s articles`;
      var search = `<form action="/search_process" method="post">
      <p><input type="text" name="title" placeholder="title">
      ${template.authorList(authors)}
      <input type="submit" value="search"></p></form>
      `;
      var resultList = template.listForAuthorSearchResult(results, queryAuthor, queryTitle);
      var html = template.HTML(title, search, '', resultList, '', '');
      response.writeHead(200);
      response.end(html);
    })
  });
}

exports.redirect_title_to_topic = function(request, response, limit, queryId){
  db.query(`SELECT * from topic`,function(error, topics){
    if(error){
      throw error;
    }
    var i = 1;
    var pageNum = 0;
    while(i <= topics.length){
      if(topics[i-1].id == queryId){
        if(i%limit == '0'){
          pageNum = i/limit;
          break;
        } else {
          pageNum = (i/limit)+1;
          break;
        }
      }
      i++;
    }
    response.writeHead(302, {Location: `/?page=${parseInt(pageNum)}&id=${queryId}`});
    response.end();
  })
}
