var sanitizeHtml = require('sanitize-html');
module.exports = {
  HTML:function(title, list, body, control){
    return `
    <!doctype html>
    <html>
    <head>
    <style>
    table {
      font-family: arial, sans-serif;
      border-collapse: collapse;
    }
    td, th {
      border: 1px solid #dddddd;
      text-align: left;
      padding: 8px;
    }
    tr:nth-child(even) {
      background-color: #dddddd;
    }
    </style>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      <p><a href="/author">author</a></p>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
  },list:function(topics){
    var list = '<ul>';
    var i = 0;
    while(i < topics.length){
      list = list + `<li><a href="/?id=${topics[i].id}">${sanitizeHtml(topics[i].title)}</a></li>`;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  },authorList:function(authors){
    var tag = '';
    var i = 0;
    while(i < authors.length){
      tag += `<option value="${authors[i].id}">${sanitizeHtml(authors[i].name)}</option>`;
      i++;
    }
    return `<select name="author">${tag}</select>`;
  },authorListTable:function(authors){
    var list = `
      <tr>
        <th>name</th>
        <th>profile</th>
        <th>update</th>
        <th>delete</th>
      </tr>`;
    var i = 0;
    while(i < authors.length){
      list += `
        <tr>
          <td>${sanitizeHtml(authors[i].name)}</td>
          <td>${sanitizeHtml(authors[i].profile)}</td>
          <td><a href="/author/update?id=${authors[i].id}">update</a></td>
          <td><form action="author/delete_process" method="post">
            <input type="hidden" name="id" value="${authors[i].id}">
            <input type="submit" value="delete">
          </form></td>
        </tr>`
      i++;
    }
    return `<table>${list}</table>`;
  },authorListForUpdate:function(authors, topic){
    var tag = '';
    var i = 0;
    while(i < authors.length){
      if(authors[i].id == topic[0].author_id){
        tag += `<option value="${authors[i].id}" selected>${authors[i].name}</option>`;
      } else{
        tag += `<option value="${authors[i].id}">${authors[i].name}</option>`;}
      i++;
    }
    return `<select name="author">${tag}</select>`;
  },
}
