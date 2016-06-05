// curl -v -H "Accept: application/vnd.github.v3.star+json" 'https://api.github.com/repos/haya14busa/incsearch.vim/stargazers'

import 'whatwg-fetch';

const BASE_URL = 'https://api.github.com';

let headers = new Headers();
headers.set('Accept', 'application/vnd.github.v3.star+json');

const options = {
  method: 'GET',
  headers: headers,
}

fetch(BASE_URL + '/repos/haya14busa/incsearch.vim/stargazers', options)
  .then((response) => {
    return response.json()
  }).then((json) => {
    console.log(json);
  }).catch((error) => {
    console.log(error);
  });
