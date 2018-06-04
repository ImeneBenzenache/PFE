var dataset = [],
    temp = [],
    modules = [],
    cpt = 0,
    bars,
    spe,
    numg,
    canvas1,
    canvas2,
    margin = {top: 30, right: 20, bottom: 30, left: 50},
    h1 = 300,
    w1 = 800,
    h = h1 - margin.top - margin.bottom,
    w = w1 - margin.right - margin.left;

var xScale = d3.scale.ordinal();
var yScale = d3.scale.linear();

canvas1 = d3.select("#Graph1")
  .append("svg")
  .attr("width", w1)
  .attr("height", h1)
  .append("g")
    .attr("translate", "transform(" + margin.left + "," + margin.top +")");

canvas2 = d3.select("#Graph2")
  .append("svg")
    .attr("width", w1)
    .attr("height", h1)
  .append("g")
    .attr("translate", "transform(" + margin.left + "," + margin.top +")");


function Titre(event, id) {

  spe = event.target.innerHTML;
  if (id.id == "titre1") {
    numg = 1;
    document.getElementById(id.id).innerHTML = "Le module le plus enseigné en " + spe ;
    document.getElementById("Graph1").style.display = 'block';

  }
  if (id.id == "titre2") {
    numg = 2;
    document.getElementById(id.id).innerHTML = "Le module ayant le plus de TP en " + spe ;
    document.getElementById("Graph2").style.display = 'block';
  }

  go(numg,spe);

}

function go(numg, spe) {



  //empty the array
  dataset = [];
  if (numg == 1) {
    //remove old bars
    canvas1.selectAll("rect")
      .data(dataset)
      .exit()
      .remove();

    //remove old axes
    canvas1.selectAll("g")
      .data(dataset)
      .exit()
      .remove();
  }

  if (numg == 2) {
    //remove old bars
    canvas2.selectAll("rect")
      .data(dataset)
      .exit()
      .remove();

      //remove old axes
    canvas2.selectAll("g")
      .data(dataset)
      .exit()
      .remove();
  }


  d3.json('data/data.json', function(data) {
    cpt = 0;


  //put data.json in temp[]
    for (var i = 0; i < data.length; i++) {
      temp.push(data[i]);
    }

    //Commun pour les deux graphes
    //forEach everything
    temp.forEach(function(data){
      data.Specialite.forEach(function(specialite){
        specialite.Sections.forEach(function(section){
          section.Semaine.forEach(function(semaine){
            semaine.Programme.forEach(function(programme){

            if (specialite.Nom == spe) {
              if (!modules.includes(programme.Module)) {
                modules.push(programme.Module);  //remplir modules avec tous les modules enseignés
              }
            }

            }); // fin programme
          }); //fin semaine
        }); // fin section
      }); //fin specialite
    }); //fin temp


    for (var i = 0; i < modules.length; i++) {
      cpt = 0;

      temp.forEach(function(data){
        data.Specialite.forEach(function(specialite){
          specialite.Sections.forEach(function(section){
            section.Semaine.forEach(function(semaine){
              semaine.Programme.forEach(function(programme){

              switch (numg) {
                case 1: if (modules[i] == programme.Module) { cpt++; } //graphe 1 : calcul du nombre des modules
                break;
                case 2: if (modules[i] == programme.Module && programme.Type == "TP") { cpt++; } //graphe 2 : calcul des nombre de tp par module
                break;
              }

              }); // fin programme
            }); //fin semaine
          }); // fin section
        }); //fin specialite
      }); //fin temp


      dataset.push([modules[i], cpt*1.5]); // mettre les pairs (module, heures d'enseignement)


    } // fin for modules

    console.log(dataset);

    // Creating xScale
    xScale.domain(dataset.map(function(d){return d[0]; } ))
      .rangeRoundBands([0 , w], 1, 0.3);


    var yMax = d3.max(dataset.map(function(d){return d[1]; }));

    //Creating yScale
    yScale.domain([0,yMax])
      .range([0,h]);

    // Creating Y Axis scale
    var yAxisScale = d3.scale.linear()
      .domain([0, yMax ])
       .range([h , 0 ]);

     //creating x Axis
    var xAxis = d3.svg.axis()
      .scale(xScale);


    //creating y Axis
    var yAxis = d3.svg.axis()
      .scale(yAxisScale)
      .ticks(5)
      .orient("left");

      //Color scale
      var colorScale = d3.scale.linear()
       .domain([0, yMax*.50 ,yMax])
       .range(["#4fa632","#39901c","#2e7316"]);

       //tooltips
      var tooltip = d3.select("body")
        .append("div")
          .style("position", "absolute")
          .style("background", "white")
          .style("opacity", "0")
          .style("padding", "0 10px");

    if (numg == 1) {

      //Calling x axis
      canvas1.append("g")
       .call(xAxis)
         .attr("transform", "translate(" + margin.left  + "," +(h+margin.top)+")")
         .attr("class", "axis")
       .selectAll("path")
         .style({fill: "none" , stroke : "#000"});


      // Calling Y Axis
      canvas1.append("g")
        .call(yAxis)
          .attr("transform", "translate(" + margin.left  + "," + margin.top +")")
          .attr("class", "axis")
        .selectAll("path")
          .style({fill: "none" , stroke : "#000"});



    // bars
      bars = canvas1.selectAll("rect")
      .data(dataset)
      .enter();
      bars.append("rect")
      .attr("width", 35)
      .attr("height", 0)
      .attr("x", function(d,i){ return xScale(d[0]) + margin.left - 20 ;})
      .attr("y", function(d,i){ return (h-yScale(d[1]) + margin.top);})
      .style("fill", function(d){return colorScale(d[1]);})
      .on("mouseover", function(d){
        tooltip.transition()
          .style("opacity", .9)
          tooltip.html(d[1] +" heures ")
            .style("left", (d3.event.pageX - 35 + "px"))
            .style("top", (d3.event.pageY - 30 + "px"))
      })
      .on("mouseout", function(d){
        tooltip.transition()
          .style("opacity", 0)
        })
      .transition()
      .ease(d3.ease("bounce"))
      .duration(2000)
      .attr("height", function(d) { return yScale(d[1]);});

      console.log(dataset);
    }

    if (numg == 2) {
      //Calling x axis
      canvas2.append("g")
       .call(xAxis)
         .attr("transform", "translate(" + margin.left  + "," +(h+margin.top)+")")
         .attr("class", "axis")
       .selectAll("path")
         .style({fill: "none" , stroke : "#000"});


      // Calling Y Axis
      canvas2.append("g")
        .call(yAxis)
          .attr("transform", "translate(" + margin.left  + "," + margin.top +")")
          .attr("class", "axis")
        .selectAll("path")
          .style({fill: "none" , stroke : "#000"});


    // bars
      bars = canvas2.selectAll("rect")
      .data(dataset)
      .enter();
      bars.append("rect")
      .attr("width", 35)
      .attr("height", 0)
      .attr("x", function(d,i){return  xScale(d[0]) + margin.left - 20;})
      .attr("y", function(d,i){return (h-yScale(d[1]) +margin.top);})
      .style("fill", function(d){return colorScale(d[1]);})
      .on("mouseover", function(d){
        tooltip.transition()
          .style("opacity", .9)
          tooltip.html(d[1] +" heures ")
            .style("left", (d3.event.pageX - 35 + "px"))
            .style("top", (d3.event.pageY - 30 + "px"))
      })
      .on("mouseout", function(d){
        tooltip.transition()
          .style("opacity", 0)
        })
      .transition()
      .ease(d3.ease("elastic"))
      .duration(2000)
      .attr("height", function(d) { return yScale(d[1]);});

    }

  }); // fin json

}
