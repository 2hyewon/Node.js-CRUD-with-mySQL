var url = require('url');
var qs = require('querystring');
var template = require('./template.js');
var db = require('./db');
var sanitizeHtml = require('sanitize-html');

exports.list = function(response){
  db.query('SELECT * FROM topic', function(error, topics){
      if(error) {
          throw error;
      }
      db.query('SELECT * FROM author', function(error2, authors){
        var title = 'Authors';
        var listTopics = template.list(topics);
        var listAuthors = template.authorListTable(authors);
        var html = template.HTML(title, listTopics,
          `<h2>${title}</h2>${listAuthors}`,
          `<a href="/author/create">create</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
  });
}
exports.create = function(response){
  db.query('SELECT * FROM topic', function(error, topics){
    if(error){
      throw error;
    }
    db.query('SELECT * FROM author', function(error2, authors){
      var title = 'Author - create';
      var listTopics = template.list(topics);
      var listAuthors = template.authorListTable(authors);
      var html = template.HTML(title, listTopics,
        `${listAuthors}
        <form action="/author/create_process" method="post">
          <p><input type="text" name="name" placeholder="author name"></p>
          <p><input type="text" name="profile" placeholder="profile"></p>
          <p>
            <input type="submit">
          </p>
        </form>
      `, '');
      response.writeHead(200);
      response.end(html);
    });
  });
}
exports.create_process = function(request, response){
  var body = '';
  request.on('data', function(data){
      body = body + data;
  });
  request.on('end', function(){
      var post = qs.parse(body);
      db.query(`
        INSERT INTO author (name, profile)
        VALUES(?, ?)`,
        [post.name, post.profile],
       function(error, result){
         if(error){
           throw error;
         }
         response.writeHead(302, {Location: `/author`});
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
      db.query(`SELECT * FROM author where id=?`,[queryId], function(error3, author){
          if(error3){
            throw error3;
          }
          var title = 'Author - update';
          var listTopics = template.list(topics);
          var listAuthors = template.authorListTable(authors);
          var html = template.HTML(title, listTopics,
            `${listAuthors}
            <form action="/author/update_process" method="post">
              <input type="hidden" name="id" value="${author[0].id}">
              <p><input type="text" name="name" placeholder="name" value="${sanitizeHtml(author[0].name)}"></p>
              <p><input type="text" name="profile" placeholder="profile" value="${sanitizeHtml(author[0].profile)}"></p>
              <p><input type="submit"></p>
            </form>
            `,
            `<a href="/author/create">create</a> <a href="/author/update?id=${author[0].id}">update</a>`
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
    db.query(`UPDATE author SET name=?, profile=? where id=?`, [post.name, post.profile, post.id], function(error, result){
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
    db.query(`DELETE FROM author WHERE id=?`,[post.id],function(error, result){
      if(error){
        throw error;
      }
      console.log('post.id: ',post.id);
      response.writeHead(302, {Location: `/author`});
      response.end();
    })
  });
}
