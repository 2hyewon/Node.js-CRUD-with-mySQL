var sanitizeHtml = require('sanitize-html');
module.exports = {
  HTML:function(author, search, title, list, body, control){
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
      <title>${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      <p>${search}</p>
      ${list}
      ${author}
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
  },listForTitleSearchResult:function(results, title){
    console.log(results);
    if(title == ''){
      return `<h1>there no result for 'blank'</h1>`;
    } else if(results.length == 0){
      return `<h1>there no result for '${title}'<h1>`;
    } else{
        var list =  `
        <h3>showing results for '${title}'</h3>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>profile</th>
            <th>created date</th>
          </tr>`;
        var i = 0;
        while(i < results.length){
          list += `
            <tr>
              <td><a href="/?id=${results[i].id}">${results[i].title}</a></td>
              <td><a href="/author/search_result?name=${results[i].name}" title ="click if you want to see list of the articles writeen by this author">${results[i].name}</a></td>
              <td>${results[i].profile}</td>
              <td>${results[i].created}</td>
            </tr>`
            /*
            <script>
            function mouseOver(){
              document.getElementById("author")
            }</script>
            */
          i++;
        }
        return `<table>${list}</table>`;
      }
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
        <th>articles</th>
        <th>update</th>
        <th>delete</th>
      </tr>`;
    var i = 0;
    while(i < authors.length){
      list += `
        <tr>
          <td>${sanitizeHtml(authors[i].name)}</td>
          <td>${sanitizeHtml(authors[i].profile)}</td>
          <td><a href="/author/search_result?name=${authors[i].name}">see articles</a></td>
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
  },listForAuthorSearchResult:function(results, name){
    if(results.length == 0){
      return `<h1>there no article written by '${name}'<h1>`;
    } else{
      var list =  `
      <h3>showing list of articles written by '${name}'</h3>
        <tr>
          <th>title</th>
          <th>author</th>
          <th>profile</th>
          <th>created date</th>
        </tr>`;
      var i = 0;
      while(i < results.length){
        list += `
          <tr>
            <td><a href="/?id=${results[i].id}">${results[i].title}</a></td>
            <td>${results[i].name}</td>
            <td>${results[i].profile}</td>
            <td>${results[i].created}</td>
          </tr>`
        i++;
      }
      return `<table>${list}</table>`;
    }
  }
}
