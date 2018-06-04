var mymap = L.map('map', {
  zoomControl: false
}).setView([36.71367, 3.18031], 15.5);

var defaultColor = "#006bb7";
var roadColor = "#9485bf";

var width = document.getElementById('map').offsetWidth;
var height = document.getElementById('map').offsetHeight;


L.svg().addTo(mymap);

var svg = d3.select("#map").select("svg"),
  g = svg.append("g"),
  typeRecherche,
  valeur,
  anneeEtudes,
  sectionChoisie,
  groupe,
  time = [],
  day,
  today,
  now,
  free = 0,
  live;

  function Switch(id) {
    live = 1;

    if (id.id == "libres") {
      free = 1;
    } else {
      free = 0;
    }
    Today(free);
  }




function Today(free) {
  var d = new Date();
  var hour = d.getHours();
  var minutes = d.getMinutes();

  if (Math.floor(minutes / 10) == 0) {
    minutes = "0" + minutes;
  }
  if (Math.floor(hour / 10) == 0) {
    hour = "0" + hour;
  }
  now = hour + ":" + minutes;

  today = d.getDay();

  live = 1;



  switch (today) {
    case 0:
      today = "Dimanche";
      break;
    case 1:
      today = "Lundi";
      break;
    case 2:
      today = "Mardi";
      break;
    case 3:
      today = "Mercredi";
      break;
    case 4:
      today = "Jeudi";
      break;
    case 5:
      today = "Vendredi";
      break;
    case 6:
      today = "Samedi";
      break;
  }


  go(free);

}

// Designer le type de recherche
function searchType(event) {

  if (event.target.id == "ch1") {
    typeRecherche = "Enseignant";
  }

  if (event.target.id == "ch2") {
    typeRecherche = "Specialite";
  }

  if (event.target.id == "ch3") {
    typeRecherche = "Module";
  }

}



function Click() {

  free = 0;
//Recuperer le temps et le jour des input
  time = [document.getElementById("timemin").value, document.getElementById("timemax").value];
  day = document.getElementById("day").value;



  if (!typeRecherche && time == "," && !day) {
    alert("Veuillez choisir au moins un champs.");
  } else{

    if (!day) {
      alert("Veuillez choisir la journée.")
    } else {

      if (typeRecherche == "Enseignant") {

        valeur = document.getElementById("searchbarEnseignant").value;

        if (!valeur) {
          alert("Veuillez introduire le nom de l'enseignant.");
        }

        document.getElementById("searchbarEnseignant").value = "";
      }


      if (typeRecherche == "Specialite") {

        valeur = document.getElementById("searchbarSpecialite").value;


        if (!valeur) {

          alert("Veuillez introduire la spécialité.");

        } else {

          if (!document.getElementById("annee").value && document.getElementById("section").value) {

            alert("Veuillez introduire l'année d'étude de la section choisie.")

          } else {

            if (document.getElementById("groupe").value && !document.getElementById("section").value) {

              alert("Veuillez introduire la section du groupe choisi.")

            } else {

              anneeEtudes = document.getElementById("annee").value;
              sectionChoisie = document.getElementById("section").value;
              groupe = document.getElementById("groupe").value;

              document.getElementById("searchbarSpecialite").value = "";
              document.getElementById("annee").value = "";
              document.getElementById("section").value = "";
              document.getElementById("groupe").value = "";

            }

          }
        }
      }


      if (typeRecherche == "Module") {
        valeur = document.getElementById("searchbarModule").value;
        if (!valeur) {

          alert("Veuillez introduire le module.");

        }
        document.getElementById("searchbarModule").value = "";
      }

// Si tout va bien, vider les autres champs
      document.getElementById("day").value = "";
      document.getElementById("timemin").value = "";
      document.getElementById("timemax").value = "";
      go(free);


    }
  }

}


function Free() {

   free = 1;

  //Recuperer le temps et le jour des input
    time = [document.getElementById("timemin").value, document.getElementById("timemax").value];
    day = document.getElementById("day").value;



    if (time == "," && !day) {
      alert("Veuillez choisir au moins un champs.");
    } else{

      if (!day) {
        alert("Veuillez choisir la journée.")
      } else {
        document.getElementById("day").value = "";
        document.getElementById("timemin").value = "";
        document.getElementById("timemax").value = "";
        go(free);

      }
      }


}

var marker = [];

L.geoJSON(usthb, {

  style: function(feature) {
    //  la couleur du fond
    switch (feature.properties.osm_way_id) {
      case "226879808":
        return {
          color: "#fff"
        };
    }

    //style des routes
    if (feature.geometry.type == "LineString") {
      return {
        weight: 5,
        color: "#48a9a6",
        dashArray: '6',
        opacity: 0.3

      };
    }

    //style par default des autres elements
    return {
      weight: 0.3,
      color: "#006bb7",

    };
  },

  onEachFeature: function(feature, layer) {
    if (feature.properties.name != "") {
      //definition du text de tooltip
      var tooltip = "<img src ='" + feature.properties.icon + "'width = '40px' /> <br> " + feature.properties.name;

      //placer l'icone de chaque element/layer
      var bounds = layer.getBounds();

      var p1 = mymap.latLngToLayerPoint(bounds.getNorthWest());
      var p2 = mymap.latLngToLayerPoint(bounds.getSouthEast());
      var h = p2.y - p1.y;
      var w = p2.x - p1.x;
      var r = Math.max(h, w);

      var inconPosition = bounds.getCenter();

      marker.push(L.marker(inconPosition, {
          opacity: (feature.properties.icon) ? 0.7 : 0,
          icon: L.icon({
            iconUrl: "icons/gps.svg",
            iconSize: [(r < 40) ? 0 : 20, (r < 40) ? 0 : 30],
          })
        }).bindTooltip(tooltip, {
          className: "tooltipClass"
        })
        .on("dblclick", function(event) {
          mymap.fitBounds(layer.getBounds());
        }).addTo(mymap));

      // marker.bounds = layer.getBounds());

    } //end if name != ""
  }, //end onEachFeature

  pane: "tilePane" //mettre les formes de geoJSON en arriere (tilePane)
}).addTo(mymap); //end L.geoJSON



function go(free) {

  var salles = [],
  salles1 = [],
  circles,
  dataset = [];
console.log(free);

  //Enlever les marqueurs des batiments
  for (i = 0; i < marker.length; i++) {
    mymap.removeLayer(marker[i]);
  }


  var infoContenu;
  var popup = L.popup();
  var dispo;
  //vider le dataset
  dataset = [];

  //Enlever les anciens cercles
  g.selectAll("circle")
    .data(dataset)
    .exit()
    .remove();


  d3.json('data/data.json', function(data) {


    data.forEach(function(data) {
      data.Specialite.forEach(function(specialite) {
        specialite.Sections.forEach(function(section) {
          section.Semaine.forEach(function(semaine) {
            semaine.Programme.forEach(function(programme) {



              L.geoJSON(usthb, {
                style: function(feature) {
                  //  la couleur du fond
                  switch (feature.properties.osm_way_id) {
                    case "226879808":
                      return {
                        stroke : "#fff",
                        color: "#E4E4E4"
                        //opacity : 0.1
                      };
                  }

                  //style des routes
                  if (feature.geometry.type == "LineString") {
                    return {
                      weight: 3,
                      color: "#9BC9C7",
                      dashArray: '6',
                    //  opacity: 0.3

                    };
                  }

                  //style par default des autres elements
                  return {
                    weight: 0.5, //le poids du contour
                    color : "#28549c", //couleur du contour
                    fillColor: "#72A6CE", //couleur de l'objet
                    fillOpacity: 0.2 // opacité de l'objet


                  };
                },

                onEachFeature: function(feature, layer) {

                  if (feature.properties.name != "" ) {




                    // Live preview : PERFECT

                    if (live == 1) {

                      var h = programme.Heure.substring(0, 2);
                      var m = programme.Heure.substring(3, 5);
                      h = +h + 1;
                      m = +m + 40;
                      h = h + Math.floor(m / 60);
                      m = m % 60;
                      if (Math.floor(h / 10) == 0) {
                        h = "0" + h;
                      };

                      if (Math.floor(m / 10) == 0) {
                        m = "0" + m;
                      };
                      var k = h + ":" + m;
                      if (feature.properties.name == programme.Salle &&
                        today == semaine.Jour && now >= programme.Heure && now <= k) {
                        dataset.push([data.Année, specialite.Nom, section.Nom, semaine.Jour, programme, layer.getBounds().getCenter()]);

                      }
                      else {

                        if (!salles1.includes(feature.properties.name) && feature.properties.pere == "Département Informatique") {
                          salles1.push(feature.properties.name);
                          salles.push([feature.properties.name, layer.getBounds().getCenter()] );

                        }
                      }


                    } //End Live Preview
                    else {

                      //Si la recherche est seulement par plage horaire
                      if (!typeRecherche) {

                        if (time == ",") { // Seulement par jour

                          if (feature.properties.name == programme.Salle &&
                            day == semaine.Jour) {

                            dataset.push([data.Année, specialite.Nom, section.Nom, semaine.Jour, programme, layer.getBounds().getCenter()]);

                          }
                          else {

                          if (!salles1.includes(feature.properties.name) && feature.properties.pere == "Département Informatique") {
                                  salles1.push(feature.properties.name);
                                  salles.push([feature.properties.name, layer.getBounds().getCenter()] );

                                                        }
                          }
                        }
                        else { //PAr plage horaire
                          if (feature.properties.name == programme.Salle && day == semaine.Jour &&
                            programme.Heure <= time[1] &&
                            programme.Heure >= time[0]) {
                            dataset.push([data.Année, specialite.Nom, section.Nom, semaine.Jour, programme, layer.getBounds().getCenter()]);

                          } else {

                                                        if (!salles1.includes(feature.properties.name) && feature.properties.pere == "Département Informatique") {
                                                          salles1.push(feature.properties.name);
                                                          salles.push([feature.properties.name, layer.getBounds().getCenter()] );

                                                        }
                          }

                        }
                      } else { // On a un type de recherche

                        if (typeRecherche == "Enseignant") {
                          if (time == ",") { // Seulement le jour

                            if (valeur.toUpperCase() == programme.Enseignant.toUpperCase() &&
                              feature.properties.name == programme.Salle &&
                              day.toUpperCase() == semaine.Jour.toUpperCase()) {

                              dataset.push([data.Année, specialite.Nom, section.Nom, semaine.Jour, programme, layer.getBounds().getCenter()]);
                            }

                          }else{
                            if (valeur.toUpperCase() == programme.Enseignant.toUpperCase() &&
                              feature.properties.name == programme.Salle &&
                              programme.Heure <= time[1] &&
                              programme.Heure >= time[0] &&
                              day.toUpperCase() == semaine.Jour.toUpperCase()){

                                dataset.push([data.Année, specialite.Nom, section.Nom, semaine.Jour, programme, layer.getBounds().getCenter()]);
                              }
                            }
                          }else {
                                  if (typeRecherche == "Specialite") {
                                    if (time == ",") { // Seulement le jour

                                      if (!anneeEtudes) {
                                        if (valeur.toUpperCase() == specialite.Nom.toUpperCase() &&
                                          feature.properties.name == programme.Salle &&
                                          day.toUpperCase() == semaine.Jour.toUpperCase()) {

                                          dataset.push([data.Année, specialite.Nom, section.Nom, semaine.Jour, programme, layer.getBounds().getCenter()]);
                                        }
                                      }else{
                                          if (!sectionChoisie){
                                            if (valeur.toUpperCase() == specialite.Nom.toUpperCase() &&
                                              anneeEtudes == data.Année &&
                                              feature.properties.name == programme.Salle &&
                                              day.toUpperCase() == semaine.Jour.toUpperCase()) {

                                              dataset.push([data.Année, specialite.Nom, section.Nom, semaine.Jour, programme, layer.getBounds().getCenter()]);
                                            }
                                          } else {
                                            if (!groupe) {
                                              if (valeur.toUpperCase() == specialite.Nom.toUpperCase() &&
                                                anneeEtudes == data.Année &&
                                                sectionChoisie.toUpperCase() == section.Nom.toUpperCase() &&
                                                feature.properties.name == programme.Salle &&
                                                day.toUpperCase() == semaine.Jour.toUpperCase()) {

                                                dataset.push([data.Année, specialite.Nom, section.Nom, semaine.Jour, programme, layer.getBounds().getCenter()]);
                                              }
                                            }
                                            else {
                                              if (valeur.toUpperCase() == specialite.Nom.toUpperCase() &&
                                                anneeEtudes == data.Année &&
                                                sectionChoisie.toUpperCase() == section.Nom.toUpperCase() &&
                                                groupe == programme.Groupe &&
                                                feature.properties.name == programme.Salle &&
                                                day.toUpperCase() == semaine.Jour.toUpperCase()) {

                                                dataset.push([data.Année, specialite.Nom, section.Nom, semaine.Jour, programme, layer.getBounds().getCenter()]);
                                              }
                                            }
                                            }
                                            }
                                          }
                                          else{ //avec plage horaire
                                            if (!anneeEtudes) {

                                              if (valeur.toUpperCase() == specialite.Nom.toUpperCase() &&
                                                feature.properties.name == programme.Salle &&
                                                day.toUpperCase() == semaine.Jour.toUpperCase() &&
                                                programme.Heure <= time[1] &&
                                                programme.Heure >= time[0])
                                                {

                                                dataset.push([data.Année, specialite.Nom, section.Nom, semaine.Jour, programme, layer.getBounds().getCenter()]);
                                              }

                                            }else{
                                                if (!sectionChoisie){
                                                  if (valeur.toUpperCase() == specialite.Nom.toUpperCase() &&
                                                    anneeEtudes == data.Année &&
                                                    feature.properties.name == programme.Salle &&
                                                    day.toUpperCase() == semaine.Jour.toUpperCase() &&
                                                    programme.Heure <= time[1] &&
                                                    programme.Heure >= time[0]) {

                                                    dataset.push([data.Année,specialite.Nom, section.Nom, semaine.Jour, programme, layer.getBounds().getCenter()]);
                                                  }
                                                } else {
                                                  if (!groupe) {
                                                    if (valeur.toUpperCase() == specialite.Nom.toUpperCase() &&
                                                      anneeEtudes == data.Année &&
                                                      sectionChoisie.toUpperCase() == section.Nom.toUpperCase() &&
                                                      feature.properties.name == programme.Salle &&
                                                      day.toUpperCase() == semaine.Jour.toUpperCase() &&
                                                      programme.Heure <= time[1] &&
                                                      programme.Heure >= time[0]) {

                                                      dataset.push([data.Année, specialite.Nom, section.Nom, semaine.Jour, programme, layer.getBounds().getCenter()]);
                                                    }
                                                  }
                                                  else {
                                                    if (valeur.toUpperCase() == specialite.Nom.toUpperCase() &&
                                                      anneeEtudes == data.Année &&
                                                      sectionChoisie.toUpperCase() == section.Nom.toUpperCase() &&
                                                      groupe == programme.Groupe &&
                                                      feature.properties.name == programme.Salle &&
                                                      day.toUpperCase() == semaine.Jour.toUpperCase() &&
                                                      programme.Heure <= time[1] &&
                                                      programme.Heure >= time[0]) {

                                                      dataset.push([data.Année, specialite.Nom, section.Nom, semaine.Jour, programme, layer.getBounds().getCenter()]);
                                                    }
                                                  }
                                                  }
                                                  }
                                          }
                                      } // end specialite
                                      else {
                                        if (typeRecherche == "Module") {
                                          if (time == ",") { // Seulement le jour

                                            if (valeur.toUpperCase() == programme.Module.toUpperCase() &&
                                              feature.properties.name == programme.Salle &&
                                              day.toUpperCase() == semaine.Jour.toUpperCase()) {

                                              dataset.push([data.Année, specialite.Nom, section.Nom, semaine.Jour, programme, layer.getBounds().getCenter()]);
                                            }

                                          }else{ // avec plage horaire
                                            if (valeur.toUpperCase() == programme.Module.toUpperCase() &&
                                              feature.properties.name == programme.Salle &&
                                              programme.Heure <= time[1] &&
                                              programme.Heure >= time[0] &&
                                              day.toUpperCase() == semaine.Jour.toUpperCase()){

                                                dataset.push([data.Année, specialite.Nom, section.Nom, semaine.Jour, programme, layer.getBounds().getCenter()]);
                                              }
                                            }
                                      } //end module
                                    }

                      }
                    } // end type de recherche

                  }




                  } //end if name != ""
                }, //end onEachFeature

                pane: "tilePane" //mettre les formes de geoJSON en arriere (tilePane)
              }).addTo(mymap); //end L.geoJSON

            }); // end programme
          }); //end semaine
        }); //end section
      }); //end specialite
    }); // end temp.foreach










if (free == 0 && dataset.length == 0) {
  alert("Il n'y a pas de résultat à votre recherche");
}
if (free == 1 && salles.length == 0) {
  alert("Il n'y a pas de résultat à votre recherche");
}





    dataBind();
    update();

  }); //end json






  function colors(Type) {
    if (Type == "Cours") {
      return "#f56329";
    }
    if (Type == "TP") {
      return "#ee4266";
    }
    if (Type == "TD") {
      return "#2a1e5c";
    }
  }

  function dataBind() {

    //enlever les salles occupées
        dataset.forEach(function(d){
          salles.forEach(function(s){
              if (s[0] == d[4].Salle ) {
                var index = salles.indexOf(s);
                salles.splice(index,1);
              }
          });
        });

    if (free == 0) {
      circles = g.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
    }
    else if (free == 1) {
      circles = g.selectAll("circle")
        .data(salles)
        .enter()
        .append("circle")
    }





  }

  mymap.on("zoomend", update);



  //Placer les cercles sur chaque salle
  function update() {



    var infobulle = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("opacity", "0")
      .style("z-index", "999")
      .style("padding", "0 10px");

      if (free == 0) {
        circles.attr("cx",
            function(d) {
              return mymap.latLngToLayerPoint([d[5].lat, d[5].lng]).x;
            }
          ).attr("cy",
            function(d) {
              return mymap.latLngToLayerPoint([d[5].lat, d[5].lng]).y;
            }
          )
          .attr("pointer-events", "visible")
          .style("opacity", 0.8)
          .attr("r", 0)
          .style("fill", function(d, i) {
            return colors(d[4].Type);
          })
          .on("click", function(d) {
            infobulle.transition()
              .style("opacity", .9)
            infobulle.html("<img src='icons/red.svg' height='15' width='15'> Salle <span style='font-weight:bold'>" +  d[4].Salle + "</span> <br>" +  d[4].Heure + "<br>" +
              "<span style='font-weight:bold'>" + d[0] +" " + d[1] + "</span> | Sec <span style='font-weight:bold'>" + d[2] +
               "</span> Groupe <span style='font-weight:bold'>" + d[4].Groupe + "</span>  <br> <center>" + d[4].Module + " | " + d[4].Enseignant )
              .style("left", (d3.event.pageX - 35 + "px"))
              .style("top", (d3.event.pageY - 30 + "px"))
          });


      } else if (free == 1) {


        circles.attr("cx",
            function(d) {
              return mymap.latLngToLayerPoint([d[1].lat, d[1].lng]).x;
            }
          ).attr("cy",
            function(d) {
              return mymap.latLngToLayerPoint([d[1].lat, d[1].lng]).y;
            }
          )
          .attr("pointer-events", "visible")
          .style("opacity", 0.8)
          .attr("r", 0)
          .style("fill", "#03c03c")
          .on("click", function(d) {
            infobulle.transition()
              .style("opacity", .9)
            infobulle.html("<img src='icons/green.svg' height='15' width='15'> Salle <span style='font-weight:bold'>" +  d[0] + "</span> libre <br>" )
              .style("left", (d3.event.pageX - 35 + "px"))
              .style("top", (d3.event.pageY - 30 + "px"))
          });

      }

      circles.transition()
      .ease(d3.ease("elastic"))
      .duration(2000)
      .attr("r", 6);

      infobulle.on("click", function(d) {
        infobulle.transition()
          .style("opacity", 0)
      });




  }


}
