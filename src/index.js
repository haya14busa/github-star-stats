import { starsForRepo, user } from './github.js';

import { OAuth } from 'oauthio-web';

const OAUTHIO_PUBLIC_KEY = 'WdRy6SeDOWC_jbVGvM4caPaHSQQ';

let GITHUB_ACCESS_TOKEN = '';
const GITHUB_ACCESS_TOKEN_KEY = 'GITHUB_ACCESS_TOKEN';

const DOM_CHART_CONTAINER = document.getElementById('js-chart-div');
const DOM_AUTHORIZE_INFO = document.getElementById('authorize-info');
const DOM_AUTHORIZE_INFO_USERNAME = document.getElementById('authorize-info--username');
const DOM_AUTHORIZE_INFO_ICON = document.getElementById('authorize-info--icon');
const DOM_AUTHORIZE_BUTTON = document.getElementById('authorize-button');

OAuth.initialize(OAUTHIO_PUBLIC_KEY);

// Load the Visualization API and the linechart package.
google.charts.load('current', {packages: ['line']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(onLoadGoogleChartAPI);

function onLoadGoogleChartAPI() {

  let maybe_valid_access_token = localStorage.getItem(GITHUB_ACCESS_TOKEN_KEY);
  if (maybe_valid_access_token) {
    prosessAuthorization(maybe_valid_access_token).then(_ => {
      loadGitHubStarStats();
    });
  } else {
    loadGitHubStarStats();
  }

}

// XXX: better naming...
function prosessAuthorization(access_token) {
  return user(access_token).then(response => {
    GITHUB_ACCESS_TOKEN = access_token;
    localStorage.setItem(GITHUB_ACCESS_TOKEN_KEY, GITHUB_ACCESS_TOKEN);
    console.log(response);
    console.log(DOM_AUTHORIZE_INFO);
    console.log(DOM_AUTHORIZE_BUTTON);
    showAuthorizationInfo(response);
  }).catch(error => {
    localStorage.removeItem(GITHUB_ACCESS_TOKEN_KEY);
  });
}

function showAuthorizationInfo(user) {
  DOM_AUTHORIZE_INFO.style.display = 'block';
  DOM_AUTHORIZE_BUTTON.style.display = 'none';
  DOM_AUTHORIZE_INFO_USERNAME.innerText = user.login;
  DOM_AUTHORIZE_INFO_ICON.src = user.avatar_url;
}

function authorizeGitHub() {
  OAuth.popup('github')
    .done(function(result) {
      console.log(result);
      prosessAuthorization(result.access_token);
    })
  .fail(function (err) {
    console.log(err);
  });
}

function githubStarDataToGraphData(githubStarData) {
  return githubStarData.map((d, i) => {
    return [
      /* date:  */ new Date(d.starred_at),
      /* stars: */ i + 1,
      /* user: */ d.user.login,
    ];
  });
}

function drawChart(chart, data, options) {
  let dataTable = new google.visualization.DataTable();
  dataTable.addColumn('date', 'Date');
  dataTable.addColumn('number', 'stars');

  // Material design chart does not support this now (2016-06-06)
  // ref: https://developers.google.com/chart/interactive/docs/gallery/linechart#creating-material-line-charts
  dataTable.addColumn({type: 'string', role: 'annotationText'});

  dataTable.addRows(data);

  chart.draw(dataTable, options);
}

function loadGitHubStarStats() {
  let chart = new google.charts.Line(DOM_CHART_CONTAINER);

  //  /#/{author}/{repository}
  let [_, author, repository] = window.location.hash.split('/', 3);

  if (!author || !repository) {
    [author, repository] = window.prompt('Input {author}/{repository}').split('/', 2);
    window.location.href = `/#/${author}/${repository}`;
    window.location.reload();
    return;
  }

  starsForRepo(author, repository, GITHUB_ACCESS_TOKEN).then((stars) => {
    const options = {
      chart: {
        title: `GitHub stargazers stats ${author}/${repository}`
      },
      width: 1200,
      height: 500
    };
    drawChart(chart, githubStarDataToGraphData(stars), options);
  }).catch(error => {
    console.log(error);
    DOM_CHART_CONTAINER.innerText = error;
  });
}

window.loadGitHubStarStats = loadGitHubStarStats;
window.authorizeGitHub = authorizeGitHub;
