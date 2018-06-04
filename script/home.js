livemap();
Chiffres();

function Chiffres() {
  var temp = [];
  var sections = [], enseignants = [], spe = [], heures = [], modules = [], salles =[],
      nbSections = 0, nbEnseignants = 0, nbSpe = 0, nbHeures= 0, nbModules = 0, nbSalles = 0;

  d3.json('data/data.json', function(data) {

    //put data.json in temp[]
      for (var i = 0; i < data.length; i++) {
        temp.push(data[i]);
      }

    temp.forEach(function(data){
      data.Specialite.forEach(function(specialite){

        if (!spe.includes(specialite.Nom)) {
          spe.push(specialite.Nom);
          nbSpe++;
        }

        specialite.Sections.forEach(function(section){

          nbSections++;

          section.Semaine.forEach(function(semaine){
            semaine.Programme.forEach(function(programme){
              nbHeures++;

              if (!enseignants.includes(programme.Enseignant)) {
                enseignants.push(programme.Enseignant);
                nbEnseignants++;
              }

              if (!salles.includes(programme.Salle)) {
                salles.push(programme.Salle);
                nbSalles++;
              }

              if (!modules.includes(programme.Module)) {
                modules.push(programme.Module);
                nbModules++;
              }

            }); // fin programme
          }); //fin semaine
        }); // fin section
      }); //fin specialite
    }); //fin temp

    d3.select('#nbSections').html(nbSections);
    d3.select('#nbEnseignants').html(nbEnseignants);
    d3.select('#nbSpe').html(nbSpe);
    d3.select('#nbModules').html(nbModules);
    d3.select('#nbHeures').html(nbHeures*1.5);
    d3.select('#nbSalles').html(nbSalles);




  });

}

function livemap() {

  var mymap = L.map('map').setView([36.71367, 3.18031], 15.5);

  var defaultColor = "#5c9dca";
  var roadColor = "#48a9a6";

  var width = document.getElementById('map').offsetWidth;
  var height = document.getElementById('map').offsetHeight;


  L.svg().addTo(mymap);

  var svg = d3.select("#map").select("svg"),
   g = svg.append("g"),
   circles,
   dataset = [],
   champs,
   value,
   time = [],
   day,
   today,
   now,
   live;

  //Getting today's data

      var d = new Date();
      var hour = d.getHours();
      var minutes = d.getMinutes();
       if(Math.floor(minutes/10) == 0){minute = "0" + minutes; }
        if (Math.floor(hour/10) == 0) {hour = "0" + hour;}
        now = hour + ":" + minutes;
      today = d.getDay();

      switch (today) {
        case 0: today = "Dimanche"; break;
        case 1: today = "Lundi"; break;
        case 2: today = "Mardi"; break;
        case 3: today = "Mercredi"; break;
        case 4: today = "Jeudi"; break;
        case 5: today = "Vendredi"; break;
        case 6: today = "Samedi"; break;
      }





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


        onEachFeature: function (feature, layer) {

          if (feature.properties.name != "") {

            var h = programme.Heure.substring(0,2);
            var m = programme.Heure.substring(3,5);

              h = +h+1;
              m = +m+40;
              h = h+ Math.floor(m/60);
              m = m%60;
              if (Math.floor(h/10) == 0) {h = "0" + h;};

              if (Math.floor(m/10) == 0) {m = "0" + m;};
                  var k = h + ":" +m;

            if (feature.properties.name == programme.Salle &&
              today == semaine.Jour && now >= programme.Heure && now <= k) {

                dataset.push([data.Année, specialite.Nom, section.Nom, semaine.Jour, programme, layer.getBounds().getCenter()]);
              }

            } //end if name != ""
        }, //end onEachFeature

        pane:"tilePane" //mettre les formes de geoJSON en arriere (tilePane)
      }).addTo(mymap); //end L.geoJSON

            }); // end programme
          }); //end semaine
        }); //end section
      }); //end specialite
    }); // end temp.foreach
   dataBind();
    update();
  }); //end json

  function colors(Type) {
    if(Type == "Cours"){return "#1e31ff";}
    if(Type == "TP"){return "#ee4266";}
    if(Type == "TD"){return "#2a1e5c";}
  }



  function dataBind() {
      circles = g.selectAll("circle")
          .data(dataset)
          .enter()
          .append("circle");

  }

  mymap.on("zoomend", update);

  function update() {

    var infobulle = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("opacity", "0")
      .style("z-index", "999")
      .style("padding", "0 10px");


    circles.attr("cx",
        function(d) {
          return mymap.latLngToLayerPoint([d[5].lat, d[5].lng]).x;
        }
      ).attr("cy",
        function(d) {
          return mymap.latLngToLayerPoint([d[5].lat, d[5].lng]).y;
        }
      )
      .attr("pointer-events","visible")
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
                })
      .transition()
      .ease(d3.ease("elastic"))
      .duration(2000)
      .attr("r", 10)

      infobulle.on("click", function(d) {
        infobulle.transition()
          .style("opacity", 0)
      });

  }

}
