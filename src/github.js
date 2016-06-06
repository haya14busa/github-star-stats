// curl -v -H "Accept: application/vnd.github.v3.star+json" 'https://api.github.com/repos/haya14busa/incsearch.vim/stargazers' 
import 'whatwg-fetch';
import q from 'q';
import parseLinkHeader from 'parse-link-header';

const BASE_URL = 'https://api.github.com';

let headers = new Headers();
headers.set('Accept', 'application/vnd.github.v3.star+json');

const options = {
  method: 'GET',
  headers: headers,
}

export function starsForRepo(author, repoName) {
  let request_url = `${BASE_URL}/repos/${author}/${repoName}/stargazers?per_page=100`;
  return allPagenatedResult(request_url).then((ps) => {
    return q.all(ps).then((starsList) => {
      return starsList.reduce((a, b) => a.concat(b));
    });
  });
}

function allPagenatedResult(first_page_url) {
  let go = (url, ps) => {
    return fetch(url, options).then(handleErrors).then(res => {
      let link = parseLinkHeader(res.headers.get('Link'));
      let promises = ps.concat(res.json());
      return link.next ? go(link.next.url, promises) : promises;
    });
  };
  return go(first_page_url, []);
}

function handleErrors(response) {
  if (!response.ok) {
    return response.json().then(json => {
      throw Error(json.message);
    });
  }
  return response;
}
