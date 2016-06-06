// curl -v -H "Accept: application/vnd.github.v3.star+json" 'https://api.github.com/repos/haya14busa/incsearch.vim/stargazers'
import 'whatwg-fetch';
import q from 'q';
import parseLinkHeader from 'parse-link-header';

const BASE_URL = 'https://api.github.com';

export function user(access_token) {
  // curl -i -H "Authorization: token ${access_token}" https://api.github.com/user
  let request_url = `${BASE_URL}/user`;
  let headers = new Headers();
  headers.set('Authorization', `token ${access_token}`);

  const options = {
    method: 'GET',
    headers: headers,
  }

  return fetch(request_url, options).then(r => r.json());
}

export function starsForRepo(author, repoName, access_token) {
  let request_url = `${BASE_URL}/repos/${author}/${repoName}/stargazers?per_page=100`;
  return allPagenatedResult(request_url, access_token).then((ps) => {
    return q.all(ps).then((starsList) => {
      return starsList.reduce((a, b) => a.concat(b));
    });
  });
}

function allPagenatedResult(first_page_url, access_token) {
  let headers = new Headers();
  headers.set('Accept', 'application/vnd.github.v3.star+json');
  if (access_token) {
    headers.set('Authorization', `token ${access_token}`);
  }

  const options = {
    method: 'GET',
    headers: headers,
  }

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
    if (response.status === 403) {
      const resetTime = new Date(response.headers.get('X-RateLimit-Reset') * 1000);
      const mes = `GitHub API Limit Exceeded: Try again after ${resetTime}`;
      throw Error(mes);
    } else {
      throw Error(response.statusText);
    }
  }
  return response;
}
