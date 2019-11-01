// var url = require('url');
var qs = require('querystring');
var template = require('./template.js');
var sanitizeHtml = require('sanitize-html');
var db = require('./db');


exports.home = function(request, response, limit, pathname, queryPage, querySort){
  db.query('SELECT id from topic', function(error, topics){
    if(error){
      throw error;
    }
    const offset = (queryPage*limit)-limit;
    const totalPageNum = topics.length/limit;
    var rowNum = offset+1;
    var boardSql = 'SELECT topic.id,title,description,created,name,profile FROM topic LEFT JOIN author ON topic.author_id=author.id ';
    if(querySort != ''){
      var sortSql = template.sort_sql(querySort);
      boardSql += `${sortSql} LIMIT ? OFFSET ?`;
    } else {
      boardSql += 'LIMIT ? OFFSET ?';
    }
    db.query(boardSql, [limit, offset], function(error2, results){
      if(error2) {
        throw error2;
      }
      db.query('SELECT * from author', function(error3, authors){
        if(error3){
          throw error3;
        }
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var search = `<form action="/search_process" method="post">
        <p><input type="text" name="title" placeholder="title">
        ${template.authorList(authors)}
        <input type="submit" value="search"></p></form>
        `;
        var author = `<p><a href="/author">author</a></p>`;
        var listSorts = template.sort_title_date(pathname,'','','',queryPage);
        var list = template.list(results, totalPageNum, queryPage, '', rowNum, querySort);
        var html = template.HTML(title, search, `${listSorts} ${list}`, author,
          `<a href="/create?page=${queryPage}">create</a>`,
          `<h2>${title}</h2>${description}`,
        );
        response.writeHead(200);
        response.end(html);
      })
    });
  });
}

exports.page = function(request, response, queryPage, queryId, limit, pathname, querySort){
  console.log('second querySort?', querySort);
  db.query('SELECT id FROM topic', function(error, topics){
    if(error){
      throw error;
    }
    var offset = (queryPage*limit)-limit;
    var totalPageNum = topics.length/limit;
    var boardSql = 'SELECT topic.id,title,description,created,name,profile FROM topic LEFT JOIN author ON topic.author_id=author.id ';
    if(querySort != '' && querySort !== undefined){
      var sortSql = template.sort_sql(querySort);
      boardSql += `${sortSql} LIMIT ? OFFSET ?`;
    } else {
      boardSql += 'LIMIT ? OFFSET ?';
    }
    db.query(boardSql, [limit, offset], function(error2, results) {
      if(error2){
        throw error2;
      }
      //id 쿼리로 페이지를 열어야 하는데 * 은 id가 중복돼서 아래와 같은 쿼리문을 사용함.
      db.query(`SELECT topic.id,title,description,created,name,profile FROM topic LEFT JOIN author ON topic.author_id=author.id where topic.id=?`,[queryId], function(error3, topic){
        if(error3){
          throw(error3);
        }
        db.query('SELECT * from author', function(error4, authors){
          if(error4){
            throw error4
          }
          var sanitizedTitle = sanitizeHtml(topic[0].title);
          var sanitizedDescription = sanitizeHtml(topic[0].description, {allowedTags:['h1']});
          var search = `<form action="/search_process" method="post">
          <p><input type="text" name="title" placeholder="title">
          ${template.authorList(authors)}
          <input type="submit" value="search"></p></form>
          `;
          var author = `<p><a href="/author">author</a></p>`;
          var rowNum = offset+1;
          var list = template.list(results, totalPageNum, queryPage, queryId, rowNum, querySort);
          var html = template.HTML(sanitizedTitle, search,
            `${template.sort_title_date(pathname,'','',queryId, queryPage)} ${list}`, author,
            ` <a href="/create?page=${queryPage}">create</a>
            <a href="/update?page=${queryPage}&id=${topic[0].id}">update</a>
            <form action="delete_process" method="post">
            <input type="hidden" name="queryPage" value="${queryPage}">
            <input type="hidden" name="id" value="${topic[0].id}">
            <input type="submit" value="delete">
            </form>`,
            `<h2>${sanitizedTitle}</h2>
            ${sanitizedDescription}
            <p>by ${topic[0].name}</p>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    });
  })
}

exports.create = function(request, response, queryPage){
  console.log('create.pageNum: ',queryPage);
  db.query('SELECT * FROM author', function(error2, authors){
    if(error2){
      throw error2;
    }
    var title = 'WEB - create';
    //var list = template.list(results, totalPageNum, queryPage, queryId, pathname);
    var html = template.HTML(title, '', '', '', '', `
    <form action="/create_process" method="post">
    <input type="hidden" name="queryPage" value=${queryPage}>
    <p><input type="text" name="title" placeholder="title"></p>
    <p>
    <textarea name="description" placeholder="description"></textarea>
    </p>
    <p>${template.authorList(authors)}</p>
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
    db.query(`SELECT id FROM author where name='${post.authorSelect}'`, function(error, author_id){
      if(error){
        throw error;
      }
      db.query(`
        INSERT INTO topic (title, description, created, author_id)
        VALUES(?, ?, NOW(), ?)`,
        [post.title, post.description, author_id[0].id],
        function(error2, result){
          if(error2){
            throw error2;
          }
          response.writeHead(302, {Location: `/?page=${post.queryPage}&id=${result.insertId}`});
          response.end();
        })
      });
    });
  }

  exports.update = function(request, response, queryPage, queryId){
    db.query(`SELECT * FROM author`, function(error2, authors){
      if(error2){
        throw error2;
      }
      db.query(`SELECT * FROM topic where id=?`,[queryId], function(error3, topic){
        if(error3){
          throw error3;
        }
        var title = sanitizeHtml(topic[0].title);
        var description = sanitizeHtml(topic[0].description);
        //var list = template.list(topics);
        var html = template.HTML(title, '', '',  '',
        `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">rewrite</a>`,
        `
        <form action="/update_process" method="post">
        <input type="hidden" name="id" value="${topic[0].id}">
        <input type="hidden" name="queryPage" value="${queryPage}">
        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
        <p>
        <textarea name="description" placeholder="description">${description}</textarea>
        </p>
        <p>${template.authorListForUpdate(authors, topic)}</p>
        <p>
        <input type="submit">
        </p>
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
    db.query(`UPDATE topic SET title=?, description=?, author_name=? where id=?`, [post.title, post.description, post.authorSelect, post.id], function(error, result){
      if(error){
        throw error;
      }
      response.writeHead(302, {Location: `/?page=${post.queryPage}&id=${post.id}`});
      response.end();
    })
  });
}

exports.delete_process = function(request, response, limit){
  var body ='';
  request.on('data', function(data){
    body = body + data;
  });
  request.on('end', function(){
    var post = qs.parse(body);
    db.query(`DELETE FROM topic WHERE id=?`,[post.id],function(error, result){
      if(error){
        throw error;
      }
      db.query('SELECT id from topic', function(error2,topics){
        if(error2){
          throw error2;
        }
        var pageMinusOne = post.queryPage - 1;
        if(topics.length%limit==0){
          response.writeHead(302, {Location: `/?page=${pageMinusOne}`});
          response.end();
        }
        else{
          response.writeHead(302, {Location: `/?page=${post.queryPage}`});
          response.end();
        }

      });
    });
  });
}

exports.search_process = function (request, response){
  var body ='';
  request.on('data', function(data){
    body = body + data;
  });
  request.on('end', function(){
    var post = qs.parse(body);
    if(post.title == '' && post.authorSelect == 'author_all'){
      response.writeHead(302, {Location: `/author`});
      response.end();
    } else if(post.title == ''){
      response.writeHead(302, {Location: `/author/search_result?author=${post.authorSelect}`});
      response.end();
    } else if(post.title === undefined && post.authorSelect != 'author_all'){
      response.writeHead(302, {Location: `/author/search_result?author=${post.authorSelect}`});
      response.end();
    } else if(post.authorSelect != 'author_all'){
      response.writeHead(302, {Location: `/author/search_result_articles_for_this_author?title=${post.title}&author=${post.authorSelect}`});
      response.end();
    } else{
      response.writeHead(302, {Location: `search_result?title=${post.title}`});
      response.end();
    }
  });
}

exports.search_result = function(request, response, queryTitle, queryAuthor){
  //id 쿼리로 페이지를 열어야 하는데 * 은 id가 중복돼서 아래와 같은 쿼리문을 사용함.
  db.query(`SELECT topic.id,title,description,created,name,profile FROM topic LEFT JOIN author ON topic.author_id=author.id where topic.title LIKE '%${queryTitle}%'`, function(error, results){
    if(error){
      throw error;
    }
    db.query('SELECT * from author', function(error2, authors){
      if(error2){
        throw error2;
      }
      var title = `search - ${queryTitle}`;
      var search = `<form action="/search_process" method="post">
      <p><input type="text" name="title" placeholder="title">
      ${template.authorList(authors)}
      <input type="submit" value="search"></p></form>
      `;
      var author = `<p><a href="/author">author</a></p>`;
      var list = template.listForTitleSearchResult(results, queryTitle);
      var html = template.HTML(title, search, list, author, '', '');
      response.writeHead(200);
      response.end(html);
    })
  });
}

exports.sort_process = function(request, response, queryTitle, queryAuthor, queryId, queryPage){
  var body ='';
  request.on('data', function(data){
    body = body + data;
  });
  request.on('end', function(){
    var post = qs.parse(body);
    var pathname = post.pathname;
    var sort = post.sort;
    if(pathname == '/'){
      if(queryId != '' && queryPage != ''){
        response.writeHead(302, {Location: `/?page=${queryPage}&id=${queryId}&sort=${sort}`});
        response.end();
      } else if(queryId == '' && queryPage != ''){
        response.writeHead(302, {Location: `/?page=${queryPage}&sort=${sort}`});
        response.end();
      } else{
        response.writeHead(302, {Location: `/?sort=${sort}`});
        response.end();
      }
    } else{
      if(queryAuthor !== undefined && queryAuthor != '') {
        response.writeHead(302, {Location: `${pathname}?sort=${sort}&author=${queryAuthor}`});
        response.end();
      } else{
        response.writeHead(302, {Location: `${pathname}?sort=${sort}`});
        response.end();
      }
    }
  });
}
