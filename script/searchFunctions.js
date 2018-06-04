var showForm = function(id) {
  document.getElementById('Enseignant').style.display = 'none';
  document.getElementById('live-preview').style.display = 'none';
  document.getElementById('Specialite').style.display = 'none';
  document.getElementById('Module').style.display = 'none';
  document.getElementById(id).style.display = 'block';
}

var showdiv = function(id) {
  document.getElementById(id).style.display = 'block';
}

var hidediv = function(id) {
  document.getElementById(id).style.display = 'none';
}
function timemin(event) {
  document.getElementById("timemin").value = event.target.innerHTML;
}

function timemax(event) {
  if (document.getElementById("timemin").value > event.target.innerHTML) {
    alert("Veuillez ressaisir la plage horaire.");
  } else {
    document.getElementById("timemax").value = event.target.innerHTML;
  }
}

function Day(event) {
  document.getElementById("day").value = event.target.innerHTML;
}

function Annee(event) {
  document.getElementById("annee").value = event.target.innerHTML;
}
