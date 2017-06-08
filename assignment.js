var margin = {top: 20, right: 30, bottom: 20, left: 40};

// var width = 600,
//     height = width/960*500+100;

var width = 1200,
    height = 422;
    

var projection = d3.geo.albers()
    .translate([width / 2, height / 2])
    .scale(1500 * 500 / 960);

var path = d3.geo.path()
     .projection(projection)
     .pointRadius(1.0);

var voronoi = d3.geom.voronoi()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .clipExtent([[0, 0], [width, height]]);


var svg = d3.select("#maps").append("svg")
    .attr("width", width)
    .attr("height", height+10)
    .attr("class","map")
    .attr("transform","translate(150,0)");

var radius = d3.scale.ordinal()
               .domain(["huge","big","small"])
               .range(["10px", "6px", "3px"]);

var color = d3.scale.ordinal()
               .domain(["huge","big","small"])
              .range(["#2B4162", "#4e76b2", "#62a6db"]);
              //.range(["#fffaf9","#5e5c5c","#e5d495"]);

var calendar_color = d3.scale.threshold()
                       .domain([0.0000001,5,10,15,20])
                       .range(["#66bd63","#d9ef8b","#fee08b","#fdae61","#f46d43","#d73027"]);
                     // .range(["#62a6db","#d9ef8b","#fee08b","#fdae61","#f46d43","#d73027"]);


var data; // create a global data variable to store the flights data after choosing one airport 
var total_data;
var city;

var type1 = "DEFAULT";
var type2 = "default";


queue()
    .defer(d3.json, "us.json")
    .defer(d3.csv, "airports.csv",typeAirport)
    .defer(d3.csv, "flight.csv")
    .await(ready);



function typeAirport(d) {
  d[0] = +d.longitude;
  d[1] = +d.latitude;
  var position = projection(d);
      d.x = position[0];
      d.y = position[1];
  //d.arcs = {type: "MultiLineString",coordinates:[]};
      return d;
}


function ready(error, us, airports, flights) {


  var airportByName = d3.map(),
      positions = [];

  airports.forEach(function(d) {
    airportByName.set(d.name, d);
    d.outgoing = [];
    d.incoming = [];
  });



  flights.forEach(function(flight) {
    var source = airportByName.get(flight.ORIGIN),
        target = airportByName.get(flight.DEST),
        link = {source: source, target: target};

    source.outgoing.push(link);
    target.incoming.push(link);
  });


  voronoi(airports)
      .forEach(function(d) { d.point.cell = d; })
   //   .attr("class","voronoi");



  svg.append("path")
      .datum(topojson.feature(us, us.objects.land))
      .attr("class", "states")
      .attr("d", path);

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a.id !== b.id; }))
      .attr("class", "state-borders")
      .attr("d", path);



  var airport = svg.append("g")
      .attr("class", "airports")
    .selectAll("g")
      .data(airports)
    .enter().append("g")
      .attr("class", "airport");

 airport.append("circle")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .attr("r",function(d){return radius(d.sizes)})
 //   .attr("fill","#DCDCDC")
      .attr("fill",function(d){return color(d.sizes)})


var new_flights = flights;
data = flights;
total_data = flights;

var div = d3.select("#maps").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);



var legend1 = svg.append("text")
     .attr("class","legendtooltip")
     .attr("x",width-300+5)
     .attr("y",50)
     .attr("font-size",20)
     .attr("opacity",0.8);
var legend2 = svg.append("text")
     .attr("class","legendtooltip")
     .attr("x",width-300+5)
     .attr("y",50+15+5)
     .attr("font-size",13)
     .attr("opacity",0.8);
var legend3 = svg.append("text")
     .attr("class","legendtooltip")
     .attr("x",width-300+5)
     .attr("y",50+30+5+3)
     .attr("font-size",13)
     .attr("opacity",0.8);
var legend4 = svg.append("text")
     .attr("class","legendtooltip")
     .attr("x",width-300+5)
     .attr("y",50+45+5+6)
     .attr("font-size",13)
     .attr("opacity",0.8);
var legend5 = svg.append("text")
     .attr("class","legendtooltip")
     .attr("x",width-300+5)
     .attr("y",50+60+5+9)
     .attr("font-size",13)
     .attr("opacity",0.8);
var legend6 = svg.append("text")
     .attr("class","legendtooltip")
     .attr("x",width-300+5)
     .attr("y",50+75+5+12)
     .attr("font-size",13)
     .attr("opacity",0.8);


airport.on('mouseover',function(d){
    d3.select(this)
      .transition()
      .duration(200)
      .attr("fill","black");
    legend1.text(d.name+" Airport");
    legend2.text('Total number of Flights: '+d.flightnum);
    var destdelay = +d.destdelay;
    var origindelay = +d.origindelay;
    var avgdest = +d.avgdest;
    var avgoriginal = +d.avgoriginal;
    legend3.text("Avg. Arrival Delay Rate: " +destdelay.toFixed(2));
    legend4.text("Avg. Departure Delay Rate: " +origindelay.toFixed(2));
    legend5.text("Avg. Arrival Delay Time (min): " +avgdest.toFixed(2));
    legend6.text("Avg. Departure Delay Time (min): " +avgoriginal.toFixed(2));

})
.on('mouseout',function(d){
      d3.select(this)
      .transition()
      .duration(200);
    legend1.text("");
    legend2.text("");
    legend3.text("");
    legend4.text("");
    legend5.text("");
    legend6.text("");

})



 airport
  .on("click",function(d){    
       d3.select(this).attr("fill","red")
                              .attr("r","10px");
        var airport_name = d.name

        var new_data = new_flights.filter(function(a){
            if ((a.ORIGIN == airport_name)||(a.DEST == airport_name))
            {
            return true;
            }
        })
        data = new_data;
        total_data = new_data;
        city = airport_name;
      // createChart(new_data);
       document.getElementById("label").innerHTML = "<center><b><big><big> "+ d.name +" Airport</big></big></b></center>";
     //  createChart(data,type1,type2);
            })

  airport.append("path")
      .attr("class", "airport-cell")
  //    .attr("data-legend",function(d) { return d.sizes})
      .attr("d", function(d) {  return d.cell.length ? "M" + d.cell.join("L") + "Z" : null; });

//append the flight route

  airport.append("g")
      .attr("class", "airport-arcs")
    .selectAll("path")
      .data(function(d) { return d.outgoing; })
    .enter().append("path")
      .attr("d", function(d) { return path({type: "LineString", coordinates: [d.source, d.target]}); });



 airport.append("svg:title")
            .text(function(d) {return  d.name + " Airport"});
  //    .attr("r", function(d, i) { return Math.sqrt(d.count); });


  //add legend to the map
var legend = airport.append("rect")
               .attr("x",20+100+30)
               .attr("y",height-100)
               .attr("width",130)
               .attr("height",90)
          //     .style("fill","blue")
               .style("fill","none")
               .style("stroke","black");

var circle1 = svg.append("circle")
      .attr("cx",35+100+30)
      .attr("cy",height-80)
     // .attr("transform",  "translate(25,"+ height-70+")")
      .attr("r","10")
      .style("fill","#2B4162");

svg.append("text")
   .attr("x",155+30)
   .attr("y",height-80+5)
   .text("Large airport")
   .attr("font-family","sans-serif")
   .attr("font-size","12")
   .attr("fill","#2B4162")



svg.append("circle")
      .attr("cx",135+30)
      .attr("cy",height-55)
      .attr("r","6")
      .style("fill","#4e76b2");

svg.append("text")
   .attr("x",155+30)
   .attr("y",height-55+5)
   .text("Medium airport")
   .attr("font-family","sans-serif")
   .attr("font-size","12")
   .attr("fill","#2B4162")

svg.append("circle")
      .attr("cx",135+30)
      .attr("cy",height-30)
      .attr("r","3")
      .style("fill","#62a6db");

svg.append("text")
   .attr("x",155+30)
   .attr("y",height-30+5)
   .text("Small airport")
   .attr("font-family","sans-serif")
   .attr("font-size","12")
   .attr("fill","#2B4162")

//document.getElementById("maps").classList.add("hidden");
//document.getElementById("container").classList.add("hidden");
document.getElementById("load").style.display = "none";

}





function createChart(data,airport_type,carrier_type){

    d3.selectAll(".svgBar").remove();

width = (window.innerWidth/5 - margin.left - margin.right);
height = window.innerWidth/5 - margin.top - margin.bottom;

var svg2 = d3.select("#analysis1").append("svg")
    .attr("width",width+margin.left+margin.right )
    .attr("height", height+margin.top+margin.bottom)
    .attr('class', 'svgBar')
    .append("g")
    .attr("transform","translate("+margin.left/2+ "," + margin.top/2 +")")

var svg3 = d3.select("#analysis2").append("svg")
             .attr("width",width+margin.left+margin.right)
             .attr("height",height+margin.top+margin.bottom)
             .attr('class', 'svgBar')
             .append("g")
             .attr("transform","translate("+margin.left/2+ "," + margin.top/2 +")")

svg2.append('text').text('Flight number of different carriers');
svg3.append('text').text('Flight delay rate of different carriers');

var carrier = ["AA","AS","B6","DL","EV","F9","HA","NK","OO","UA","VX","WN"];
var flight_num = [["AA",],["AS",],["B6",],["DL",],["EV",],["F9",],["HA",],["NK",],["OO",],["UA",],["VX",],["WN",]];
for (i=0;i<12;i++){
  if (airport_type=="ORIGIN")
  {
  var ndata = total_data.filter(function(d){
  return ((d["CARRIER"]==carrier[i]) && (d["ORIGIN"]== city ));

  })}
  else {
  var ndata = total_data.filter(function(d){
  return ((d["CARRIER"]==carrier[i]) && (d["DEST"]== city));

  })}
  flight_num[i][1]= ndata.length;
}


var flight_num1 = flight_num;


flight_num = flight_num.sort(function(a,b){
    return d3.ascending(a[1],b[1]);
})


//draw the first bar chart

var yScale = d3.scale.ordinal().rangeRoundBands([height,0], .1)
                               .domain(flight_num.map(function(d){
                                   return d[0];
                               }));

var xScale = d3.scale.linear().range([0,(width)])
                              .domain([0,d3.max(flight_num,function(d){return d[1] ;})]);

var xAxis = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(5);

var yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient("left")
                  .tickSize(0);
               //   .tickFormat(function(d,i){return d[0];});
 var gy = svg2.append("g")
            .attr("class", "y axis")
            .call(yAxis)

var bars = svg2.selectAll(".bar")
               .data(flight_num);

bars.enter().append("g");
    bars.append("rect")
        .attr("class","bar")
        .attr("y",function(d){
            return yScale(d[0]);
        })
        .attr("height",yScale.rangeBand())
        .attr("x",0)
        .attr("width",function(d){return xScale(d[1]);})
        .style("fill",function(d){
            if (d[0]==carrier_type){
                return "#2B4162";
               //return "#d73027";
            }
            return "#62a6db";
          // return "#f46d43";
        });
    
bars.append("text")
            .attr("class", "label")
            //y position of the label is halfway down the bar
            .attr("y", function (d) {
                return yScale(d[0]) + yScale.rangeBand() / 2 + 4;
            })
            //x position is 3 pixels to the right of the bar
            .attr("x", function (d) {
                return xScale(d[1]) + 2;
            })
            .text(function (d) {
    
                return d[1];
            });           


//draw the second right bar chart
var delay_rate =[[,],[,],[,],[,],[,],[,],[,],[,],[,],[,],[,],[,]];


for (i=0;i<12;i++){
  var ndata = total_data.filter(function(d){
  return (d["CARRIER"]==flight_num[i][0]);
  });
  delay_rate[i][0] = flight_num[i][0];
  if (flight_num[i][1]==0) {delay_rate[i][1]=0;}
  else
  {

  if (airport_type == "ORIGIN") 
  {   
      var nndata = ndata.filter(function(d){
          return (d["DEP_DELAY_STATUS"]==1);
              })
      delay_rate[i][1] = nndata.length/(flight_num[i][1]);
  }
  else{
      var nndata = ndata.filter(function(d){
          return (d["ARR_DELAY_STATUS"]==1);
      })
      delay_rate[i][1] = nndata.length/(flight_num[i][1]);
  }
  }
}


delay_rate = delay_rate.sort(function(a,b){
    return d3.ascending(a[1],b[1]);
})


var yScale = d3.scale.ordinal().rangeRoundBands([height,0], .1)
                               .domain(delay_rate.map(function(d){
                                   return d[0];
                               }));

var xScale = d3.scale.linear().range([0,(width)])
                              .domain([0,d3.max(delay_rate,function(d){return d[1] ;})]);
// svg2.append('text').text('Flight number of different carriers');
// svg3.append('text').text('Flight delay rate of different carriers');

var xAxis = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(5);

var yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient("left")
                  .tickSize(0);
               //   .tickFormat(function(d,i){return d[0];});
 var gy = svg3.append("g")
            .attr("class", "y axis")
            .call(yAxis)

var bars = svg3.selectAll(".bar")
               .data(delay_rate);
//bars.exit().remove();

bars.enter().append("g");
    bars.append("rect")
        .attr("class","bar")
        .attr("y",function(d){
            return yScale(d[0]);
        })
        .attr("height",yScale.rangeBand())
        .attr("x",0)
        .attr("width",function(d){return xScale(d[1]);})
        .style("fill",function(d){
            if (d[0]==carrier_type){
                return "#2B4162";
                //return "#d73027";
            }
            return "#62a6db";
             // return "#f46d43";
        });
    
bars.append("text")
            .attr("class", "label")
            //y position of the label is halfway down the bar
            .attr("y", function (d) {
                return yScale(d[0]) + yScale.rangeBand() / 2 + 4;
            })
            //x position is 3 pixels to the right of the bar
            .attr("x", function (d) {
                return xScale(d[1]) + 2;
            })
            .text(function (d) {
                return d[1].toFixed(2);
            }); 

//draw calendar view of delay time at each time interval from January 1st to 31st 

var delay_rate_week1 = [[1,],[2,],[3,],[4,],[5,],[6,],[7,]];    
var delay_rate_week2 = [[1,],[2,],[3,],[4,],[5,],[6,],[7,]];   
var delay_rate_week3 = [[1,],[2,],[3,],[4,],[5,],[6,],[7,]];
var delay_rate_week4 = [[1,],[2,],[3,],[4,],[5,],[6,],[7,]];
var delay_rate_week5 = [[1,],[2,],[3,],[4,],[5,],[6,],[7,]];
var delay_rate_week6 = [[1,],[2,],[3,],[4,],[5,],[6,],[7,]];


//for each week, there are seven days
//for each day, there are 19 time intervals
var delay_type;
var delay_time;
if (airport_type=="ORIGIN"){
    delay_type="DEP_TIME_BLK";
    delay_time="DEP_DELAY";
}
else {
    delay_type="ARR_TIME_BLK";
    delay_time="ARR_DELAY";
}

function get_delay(delay_week,num_week){
    var up,down;
    if (num_week ==1){
        up =1; down=3;
    }
    else if (num_week==2){
        up=4; down=10;
    }
    else if (num_week ==3){
        up =11; down=17;
    }
    else if (num_week==4){
        up=18; down=24;
    }
    else if (num_week ==5)
    {up=25;down=30;}
    else {up=31; down=31;};
    var output = [[1,],[2,],[3,],[4,],[5,],[6,],[7,]]; 
    for (j=0;j<=18;j++)
          {
              var nnndata = data.filter(function(d){return (+d[delay_type]==j) && (+d["DAY_OF_WEEK"]==7) && (+d["DAY_OF_MONTH"]>=up) && (+d["DAY_OF_MONTH"]<=down);});
              var num_cases = nnndata.length;
              if (num_cases == 0 || nnndata == null)
                { output[[1,j]]=0;}
                 else {
                  var total = 0; 
                    nnndata.forEach(function(d){
                      var delay = +d[delay_time];
                      total = total + delay;
                       })
         
                  output[[1,j]]=total/num_cases;
                 }
          }

      for (i =2;i<=7;i++){
          for (j=0;j<=18;j++)
          {
              var nnndata = data.filter(function(d){return (+d[delay_type]==j) && (+d["DAY_OF_WEEK"]==i-1) && (+d["DAY_OF_MONTH"]>=up) && (+d["DAY_OF_MONTH"]<=down);});
              var num_cases = nnndata.length;
              if (num_cases == 0 || nnndata == null)
                { output[[i,j]]=0;}
                 else {
                  var total = 0; 
                    nnndata.forEach(function(d){
                      var delay = +d[delay_time];
                      total = total + delay;
                       })
             
                  output[[i,j]]=total/num_cases;
                 }
          }
      }
  return output;
}

var w = 500;
var h = w/960*500+100;

delay_rate_week1 = get_delay(delay_rate_week1,1);
delay_rate_week2 = get_delay(delay_rate_week2,2);
delay_rate_week3 = get_delay(delay_rate_week3,3);
delay_rate_week4 = get_delay(delay_rate_week4,4);
delay_rate_week5 = get_delay(delay_rate_week5,5);
delay_rate_week6 = get_delay(delay_rate_week6,6);


var time_interval = ["00:01-05:59","06:00-06:59","07:00-07:59","08:00-08:59","09:00-09:59","10:00-10:59","11:00-11:59","12:00-12:59","13:00-13:59","14:00-14:59",
                     "15:00-15:59","16:00-16:59","17:00-17:59","18:00-18:59","19:00-19:59","20:00-20:59","21:00-21:59","22:00-22:59","23:00-23:59"];


var svg4 = d3.select("#calendar").append("svg")
    .attr("width",w+100 )
    .attr("height",h+100)
    .attr('class', 'svgBar')
    .append("g")
    .attr("transform","translate(0,0)")
var wid_rect = w/(5*7);
var hei_rect = h/(6*4);


    for (j=0;j<7;j++){
        for (k=0;k<19;k++){
            var time = time_interval[k];
            var delay_time = delay_rate_week1[[j+1,k]];
            
            var rectangle = svg4.append("rect")
                                .attr("x",0+Math.floor(k/4)*wid_rect+j*5*wid_rect)
                                .attr("y",25+Math.floor(k%4)*hei_rect)
                                .attr("width",wid_rect)
                                .attr("height",hei_rect)
                                .style("fill",function(d){return calendar_color(delay_rate_week1[[j+1,k]]);})
                                .style("stroke","#DCDCDC");
   
    
                 rectangle.append("svg:title")
                         .text("Time: "+time_interval[k]  + "\nAverage Delay Time: " + delay_rate_week1[[j+1,k]].toFixed(2) );
 
    
        }
    }
    for (j=0;j<7;j++){
        for (k=0;k<19;k++){
            var rectangle = svg4.append("rect")
                                .attr("x",0+Math.floor(k/4)*wid_rect+j*5*wid_rect)
                                .attr("y",25+h/24*4+Math.floor(k%4)*h/24)
                                .attr("width",wid_rect)
                                .attr("height",hei_rect)
                                .style("fill",function(d){return calendar_color(delay_rate_week2[[j+1,k]]);})
                                 .style("stroke","#DCDCDC");
                  rectangle.append("svg:title")
                         .text("Time: "+time_interval[k]  + "\nAverage Delay Time: " + delay_rate_week2[[j+1,k]].toFixed(2) );

    
        }
    }    
    for (j=0;j<7;j++){
        for (k=0;k<19;k++){
            var rectangle = svg4.append("rect")
                                .attr("x",0+Math.floor(k/4)*wid_rect+j*5*wid_rect)
                                .attr("y",25+h/24*8+Math.floor(k%4)*h/24)
                                .attr("width",wid_rect)
                                .attr("height",hei_rect)
                                .style("fill",function(d){return calendar_color(delay_rate_week3[[j+1,k]]);})
                                 .style("stroke","#DCDCDC");
      rectangle.append("svg:title")
                         .text("Time: "+time_interval[k]  + "\nAverage Delay Time: " + delay_rate_week3[[j+1,k]].toFixed(2) );

        }
    }    
    for (j=0;j<7;j++){
        for (k=0;k<19;k++){
            var rectangle = svg4.append("rect")
                                .attr("x",0+Math.floor(k/4)*wid_rect+j*5*wid_rect)
                                .attr("y",25+h/24*12+Math.floor(k%4)*h/24)
                                .attr("width",wid_rect)
                                .attr("height",hei_rect)
                                .style("fill",function(d){return calendar_color(delay_rate_week4[[j+1,k]]);})
                                 .style("stroke","#DCDCDC");
     rectangle.append("svg:title")
                         .text("Time: "+time_interval[k]  + "\nAverage Delay Time: " + delay_rate_week4[[j+1,k]].toFixed(2) );

        }
    }    
    for (j=0;j<7;j++){
        for (k=0;k<19;k++){
            var rectangle = svg4.append("rect")
                                .attr("x",0+Math.floor(k/4)*wid_rect+j*5*wid_rect)
                                .attr("y",25+h/24*16+Math.floor(k%4)*h/24)
                                .attr("width",wid_rect)
                                .attr("height",hei_rect)
                                .style("fill",function(d){return calendar_color(delay_rate_week5[[j+1,k]]);})
                                 .style("stroke","#DCDCDC");
     rectangle.append("svg:title")
                         .text("Time: "+time_interval[k]  + "\nAverage Delay Time: " + delay_rate_week5[[j+1,k]].toFixed(2) );

        }
    }
       for (k=0;k<19;k++){
            var rectangle = svg4.append("rect")
                                .attr("x",0+Math.floor(k/4)*wid_rect)
                                .attr("y",25+h/24*20+Math.floor(k%4)*h/24)
                                .attr("width",wid_rect)
                                .attr("height",hei_rect)
                                .style("fill",function(d){return calendar_color(delay_rate_week6[[7,k]]);})
                                 .style("stroke","#DCDCDC");
     rectangle.append("svg:title")
                         .text("Time: "+time_interval[k]  + "\nAverage Delay Time: " + delay_rate_week6[[7,k]].toFixed(2) );
        }

    for (j=1;j<7;j++){
        for (k=0;k<19;k++){
            var rectangle = svg4.append("rect")
                                .attr("x",0+Math.floor(k/4)*wid_rect+j*5*wid_rect)
                                .attr("y",25+h/24*20+Math.floor(k%4)*h/24)
                                .attr("width",wid_rect)
                                .attr("height",hei_rect)
                                .style("fill","#FFFFFF")
                                .style("stroke","#DCDCDC");
      rectangle.append("svg:title")
                         .text("Time: "+time_interval[k]  );

        }
    }

       for (j=0;j<5;j++){
        for (k=0;k<19;k++){
          draw_blank(j,k,1);
        }
    }

function draw_blank(j,k,num_week){
    var rectangle = svg4.append("rect")
                                .attr("x",0+Math.floor(k/4)*wid_rect+j*5*wid_rect)
                                .attr("y",25+h/24*(num_week-1)*4+Math.floor(k%4)*h/24)
                                .attr("width",wid_rect)
                                .attr("height",hei_rect)
                                .style("fill","#FFFFFF")
                                .style("stroke","#DCDCDC");
                                rectangle.append("svg:title")
                         .text("Time: "+time_interval[k] );

}

for (j=0;j<7;j++){
    for (k=0;k<6;k++){
           draw_blank(j,19,k+1);
    }
        
}

function draw_line(x1,x2,y1,y2){
    svg4.append("line")
        .style("stroke","black")
        .attr("stroke-width","1.5px")
        .attr("x1",x1)
        .attr("y1",y1)
        .attr("x2",x2)
        .attr("y2",y2)
}

for (i=0;i<8;i++){
    var x = 0+i*5*wid_rect;
    draw_line(x,x,25,h+25);
}
for (i=0;i<7;i++){
    var y = 25+h/24*i*4;
    draw_line(0,w,y,y)
}


svg4.append("text")
    .attr("x",0)
    .attr("y",15)
    .attr("font-size","12px")

    .text("Sunday");
   // .attr("fron-size","20px");

svg4.append("text")
    .attr("x",wid_rect*5)
    .attr("y",15)
    .attr("font-size","12px")
    .text("Monday");

svg4.append("text")
    .attr("x",wid_rect*10)
    .attr("y",15)
    .attr("font-size","12px")
    .text("Tuesday");

svg4.append("text")
    .attr("x",wid_rect*15)
    .attr("y",15)
    .attr("font-size","12px")
    .text("Wednesday");

svg4.append("text")
    .attr("x",wid_rect*20)
    .attr("y",15)
    .attr("font-size","12px")
    .text("Thursday");

svg4.append("text")
    .attr("x",wid_rect*25)
    .attr("y",15)
    .attr("font-size","12px")
    .text("Friday");
    
svg4.append("text")
    .attr("x",wid_rect*30)
    .attr("y",15)
    .attr("font-size","12px")
    .text("Saturday");

//add legend 
 
svg4.append("text")
    .attr("x",0)
    .attr("y",h+50-5-2+5)
    .attr("font-size","12px")
    .text("Average Delay Time: ");

svg4.append("rect")
    .attr("x",0)
    .attr("y",h+50+5)
    .attr("width",wid_rect)
    .attr("height",hei_rect)
    .style("fill","#66bd63")
    .style("stroke","#DCDCDC");

svg4.append("text")
    .attr("x",0+wid_rect+5)
    .attr("y",h+50+hei_rect/2+5+5)
    .attr("font-size","12px")
    .text("<=0");

svg4.append("rect")
    .attr("x",0+wid_rect+60)
    .attr("y",h+50+5)
    .attr("width",wid_rect)
    .attr("height",hei_rect)
    .style("fill","#d9ef8b")
    .style("stroke","#DCDCDC");

svg4.append("text")
    .attr("x",0+wid_rect*2+60+5)
    .attr("y",h+50+hei_rect/2+5+5)
    .attr("font-size","12px")
    .text("0-5");

svg4.append("rect")
    .attr("x",0+wid_rect*2+60*2)
    .attr("y",h+50+5)
    .attr("width",wid_rect)
    .attr("height",hei_rect)
    .style("fill","#fee08b")
    .style("stroke","#DCDCDC");

svg4.append("text")
    .attr("x",0+wid_rect*3+60*2+5)
    .attr("y",h+50+hei_rect/2+5+5)
    .attr("font-size","12px")
    .text("5-10");

svg4.append("rect")
    .attr("x",0+wid_rect*3+60*3)
    .attr("y",h+50+5)
    .attr("width",wid_rect)
    .attr("height",hei_rect)
    .style("fill","#fdae61")
    .style("stroke","#DCDCDC");

svg4.append("text")
    .attr("x",0+wid_rect*4+60*3+5)
    .attr("y",h+50+hei_rect/2+5+5)
    .attr("font-size","12px")
    .text("10-15");

svg4.append("rect")
    .attr("x",0+wid_rect*4+60*4)
    .attr("y",h+50+5)
    .attr("width",wid_rect)
    .attr("height",hei_rect)
    .style("fill","#f46d43")
    .style("stroke","#DCDCDC");

svg4.append("text")
    .attr("x",0+wid_rect*5+60*4+5)
    .attr("y",h+50+hei_rect/2+5+5)
    .attr("font-size","12px")
    .text("15-20");

svg4.append("rect")
    .attr("x",0+wid_rect*5+60*5)
    .attr("y",h+50+5)
    .attr("width",wid_rect)
    .attr("height",hei_rect)
    .style("fill","#d73027")
    .style("stroke","#DCDCDC");

svg4.append("text")
    .attr("x",0+wid_rect*6+60*5+5)
    .attr("y",h+50+hei_rect/2+5+5)
    .attr("font-size","12px")
    .text(">20");    

}




function filterType(airport_type,carrier_type) {
	//add code to filter to mytype and rerender vis here
  
    type1 = airport_type;
    type2 = carrier_type;
    if (carrier_type == "all"){
       createChart(data,airport_type,carrier_type);   
    }else{
      if(airport_type == "ORIGIN"){
        var ndata = data.filter(function(d){
        return ((d["CARRIER"] == carrier_type) &&(d["ORIGIN"]== city));
        });
        createChart(ndata,airport_type,carrier_type);
      
      }
      else{
        var ndata = data.filter(function(d){
        return ((d["CARRIER"] == carrier_type) &&(d["DEST"] == city));
        });
        createChart(ndata,airport_type,carrier_type);
      
      }
       
    }
}