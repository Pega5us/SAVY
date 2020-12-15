// Client

let initialUrl = "https://sync-player666.herokuapp.com";

function create() {
  let response = httpGet(`${initialUrl}/getRoomNumber`);
  let url = `${initialUrl}/room/${response}`;
  window.location.href = url;
}

function join() {
  const input = document.getElementById("input");
  const response = input.value;
  let url = `${initialUrl}/room/${response}`;
  window.location.href = url;
}

function httpGet(theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, false); // false for synchronous request
  xmlHttp.send(null);
  return xmlHttp.responseText;
}
