var sanitizeHtml = require('sanitize-html');
var http = require('http');
module.exports = {
  HTML:function(title, search, list, author, control, body){
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
  },list:function(results, totalPageNum, queryPage, queryId, rowNum, querySort){
    var list =  `
    <h3>Page '${queryPage}'</h3>
    <tr>
    <th>No.</th>
    <th>Title</th>
    <th>Author</th>
    <th>created date</th>
    </tr>`;
    var i = 0, j = 0;
    var page = '<td colspan="6">'
    var sort = ``;
    if(querySort != '' && querySort !== undefined){
      sort += `&sort=${querySort}`;
    }
    while(i < results.length){
      list += `
      <tr>
      <td>${rowNum}</td>
      <td><a href="/?page=${queryPage}&id=${results[i].id}${sort}">${results[i].title}</a></td>
      <td><a href="/author/search_result?author=${results[i].name}" title ="click if you want to see list of the articles writeen by this author">${results[i].name}</a></td>
      <td>${results[i].created}</td>
      </tr>`;
      i++;
      rowNum++;
    }
    while(j < totalPageNum){
      if(queryId == '' && querySort == ''){
        page += `
        <a href="/?page=${j+1}">[${j+1}]</a>
        `
      } else if(queryId == ''){
        page += `
        <a href="/?page=${j+1}&sort=${querySort}">[${j+1}]</a>
        `
      } else if(queryId != '' && queryPage != '' && querySort != ''){
        page += `
        <a href="/?page=${j+1}&id=${queryId}&sort=${querySort}">[${j+1}]</a>
        `
      } else{
        page += `
        <a href="/?page=${j+1}&id=${queryId}">[${j+1}]</a>
        `
      }
      j++;
    }
    page += '</td>';
    return `<table>${list}${page}</table>`;
  },listForTitleSearchResult:function(results, title){
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
        <td><a href="/author/search_result?author=${results[i].name}" title ="click if you want to see list of the articles writeen by this author">${results[i].name}</a></td>
        <td>${results[i].profile}</td>
        <td>${results[i].created}</td>
        </tr>
        `
      i++;
    }
    return `<table>${list}</table>`;
  }
},authorList:function(authors){
  var tag = `<option value="author_all">Author - all</option>`;
  var i = 0;
  while(i < authors.length){
    tag += `<option value="${authors[i].name}">${sanitizeHtml(authors[i].name)}</option>`;
    i++;
  }
  return `<select name="authorSelect">${tag}</select>`;
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
    <td><form action="/search_process" method="post">
    <input type="hidden" name="authorSelect" value="${authors[i].name}">
    <input type="submit" value="see areticles"></form></td>
    <td><a href="/author/update?id=${authors[i].id}">update</a></td>
    <td><form action="/author/delete_process" method="post">
    <input type="hidden" name="author" value="${authors[i].name}">
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
    return `<select name="authorSelect">${tag}</select>`;
  },listForAuthorSearchResult:function(results, name){
    if(results.length == 0){
      return `<h1>can't find it, try again<h1>`;
    } else{
      var list =  `
      <h3>showing list of articles written by '${name}'</h3>
      <h4>${name}s profile: '${results[0].profile}'</h4>
      <tr>
      <th>title</th>
      <th>author</th>
      <th>created date</th>
      </tr>`;
      var i = 0;
      while(i < results.length){
        list += `
        <tr>
        <td><a href="/author/redirect_title_to_topic?id=${results[i].id}">${results[i].title}</a></td>
        <td>${results[i].name}</td>
        <td>${results[i].created}</td>
        </tr>`
        i++;
      }
      return `<table>${list}</table>`;
    }
  },sort_title_date:function(pathname, queryTitle, queryAuthor, queryId, queryPage){
    var radio =
    `<form action="/sort_process?title=${queryTitle}&author=${queryAuthor}&id=${queryId}&page=${queryPage}" method="post" id="sortForm">
    <p>
      <input type="hidden" name="pathname" value="${pathname}">
      <label><input type="radio" name="sort" value="sortTitleDsc" checked>Title▲</label>
      <label><input type="radio" name="sort" value="sortTitleAsc">Title▼</label>
      <label><input type="radio" name="sort" value="sortDateDsc">Date▲</label>
      <label><input type="radio" name="sort" value="sortDateAsc">Date▼</label>
    <input type="submit" value="Go sort">
    </p></form>`;
    return radio;
  },sort_title_date_author:function(pathname, queryTitle, queryAuthor, queryId, querySort){
    var radio =
    `<form action="/sort_process?title=${queryTitle}&author=${queryAuthor}&id=${queryId}" method="post" id="sortForm">
    <p>
      <input type="hidden" name="pathname" value="${pathname}">
      <input type="radio" name="sort" value="sortTitleDsc" checked>Title▲
      <input type="radio" name="sort" value="sortTitleAsc">Title▼
      <input type="radio" name="sort" value="sortDateDsc">Date▲
      <input type="radio" name="sort" value="sortDateAsc">Date▼
      <input type="radio" name="sort" value="sortNameDsc">Name▲
      <input type="radio" name="sort" value="sortNameAsc">Name▼
    <input type="submit" value="Go sort">
    </p></form>`;
    return radio;
  },sort_name_profile:function(pathname, queryAuthor){
    // var author = '';
    // if(queryAuthor != undefined && queryAuthor != ''){
    //   author = `author=${queryAuthor}`
    // }
    var radio =
    `<form action="/sort_process?/author=${queryAuthor}" method="post" id="sortForm">
    <p>
      <input type="hidden" name="pathname" value="${pathname}">
      <input type="radio" name="sort" value="sortNameDsc" checked>Name▲
      <input type="radio" name="sort" value="sortNameAsc">Name▼
      <input type="radio" name="sort" value="sortProfileDsc">Profile▲
      <input type="radio" name="sort" value="sortProfileAsc">Profile▼
    <input type="submit" value="Go sort">
    </p></form>`;
    return radio;
  },sort_sql:function(sort){ //template.sort_sql(sort)
    if(sort == 'sortTitleDsc'){
      return 'ORDER BY title DESC';
    } else if(sort == 'sortTitleAsc'){
      return 'ORDER BY title ASC';
    } else if(sort == 'sortDateDsc'){
      return 'ORDER BY created DESC '
    } else if(sort == 'sortDateAsc'){
      return 'ORDER BY created ASC';
    } else if(sort == 'sortNameDsc'){
      return 'ORDER BY name DESC';
    } else if(sort == 'sortNameAsc'){
      return 'ORDER BY name ASC';
    } else if(sort == 'sortProfileDsc'){
      return 'ORDER BY profile DESC';
    } else if(sort == 'sortProfileAsc'){
      return 'ORDER BY profile ASC';
    }
  }
}
