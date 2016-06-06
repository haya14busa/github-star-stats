import { starsForRepo } from './github.js';

// Load the Visualization API and the linechart package.
google.charts.load('current', {packages: ['line']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(onLoadGoogleChartAPI);

function onLoadGoogleChartAPI() {
  const container = document.getElementById('js-chart-div')
  let chart = new google.charts.Line(container);

  //  /#/{author}/{repository}
  let [_, author, repository] = window.location.hash.split('/', 3);

  if (!author || !repository) {
    [author, repository] = window.prompt('Input {author}/{repository}').split('/', 2);
    window.location.href = `/#/${author}/${repository}`;
    return;
  }

  starsForRepo(author, repository).then((stars) => {
    drawChart(chart, githubStarDataToGraphData(stars));
  }).catch(error => {
    console.log(error);
    container.innerText = error;
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

function drawChart(chart, data) {
  let dataTable = new google.visualization.DataTable();
  dataTable.addColumn('date', 'Date');
  dataTable.addColumn('number', 'stars');

  // Material design chart does not support this now (2016-06-06)
  // ref: https://developers.google.com/chart/interactive/docs/gallery/linechart#creating-material-line-charts
  dataTable.addColumn({type: 'string', role: 'annotationText'});

  dataTable.addRows(data);
  chart.draw(dataTable, {});
}
