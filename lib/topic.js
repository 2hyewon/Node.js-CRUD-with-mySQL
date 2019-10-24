// var url = require('url');
var qs = require('querystring');
var template = require('./template.js');
var sanitizeHtml = require('sanitize-html');
var db = require('./db');

exports.home = function(request, response){
  db.query('SELECT * FROM topic', function(error, topics){
      if(error) {
          throw error;
      }
      var title = 'Welcome';
      var description = 'Hello, Node.js';
      var list = template.list(topics);
      var html = template.HTML(title, list,
        `<h2>${title}</h2>${description}`,
        `<a href="/create">create</a>`
      );
      response.writeHead(200);
      response.end(html);
  });
}

exports.page = function(request, response, queryId){

  db.query('SELECT * FROM topic', function(error, topics) {
  if(error){
    throw error;
  }
  db.query(`SELECT topic.id,title,description,created,name,profile FROM topic LEFT JOIN author ON topic.author_id=author.id where topic.id=?`,[queryId], function(error2, topic){
    if(error2){
     throw(error2);
    }
    var sanitizedTitle = sanitizeHtml(topic[0].title);
    var sanitizedDescription = sanitizeHtml(topic[0].description, {allowedTags:['h1']});
    var list = template.list(topics);
    var html = template.HTML(sanitizedTitle, list,
      `<h2>${sanitizedTitle}</h2>
      ${sanitizedDescription}
      <p>by ${topic[0].name}</p>`,
      ` <a href="/create">create</a>
        <a href="/update?id=${topic[0].id}">update</a>
        <form action="delete_process" method="post">
          <input type="hidden" name="id" value="${topic[0].id}">
          <input type="submit" value="delete">
        </form>`
      );
      response.writeHead(200);
      response.end(html);
  });
});
}

exports.create = function(request, response){
  db.query('SELECT * FROM topic', function(error, topics){
    if(error){
      throw error;
    }
    db.query('SELECT * FROM author', function(error2, authors){
      var title = 'WEB - create';
      var list = template.list(topics);
      var html = template.HTML(title, list, `
        <form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>${template.authorList(authors)}</p>
          <p>
            <input type="submit">
          </p>
        </form>
      `, '');
      response.writeHead(200);
      response.end(html);
    })
  })
}

exports.create_process = function(request, response){
  var body = '';
  request.on('data', function(data){
      body = body + data;
  });
  request.on('end', function(){
      var post = qs.parse(body);
      db.query(`
        INSERT INTO topic (title, description, created, author_id)
        VALUES(?, ?, NOW(), ?)`,
        [post.title, post.description, post.author],
       function(error, result){
         if(error){
           throw error;
         }
         response.writeHead(302, {Location: `/?id=${result.insertId}`});
         response.end();
       })
  });
}

exports.update = function(request, response, queryId){
  db.query('SELECT * FROM topic', function(error, topics){
    if(error){
      throw error;
    }
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
          var list = template.list(topics);
          var html = template.HTML(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${topic[0].id}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>${template.authorListForUpdate(authors, topic)}</p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
    });
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
    db.query(`UPDATE topic SET title=?, description=?, author_id=? where id=?`, [post.title, post.description, post.author, post.id], function(error, result){
        if(error){
          throw error;
        }
        response.writeHead(302, {Location: `/?id=${post.id}`});
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
  db.query(`DELETE FROM topic WHERE id=?`,[post.id],function(error, result){
    if(error){
      throw error;
    }
    response.writeHead(302, {Location: `/`});
    response.end();
  })
})
}
