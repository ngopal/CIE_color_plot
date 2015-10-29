
Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}


function XYZtoXYY(arg) {
  var sum, X, Y, Z;
  X = arg[0]; Y = arg[1]; Z = arg[2];
  sum = X + Y + Z;
  if (sum === 0) {
    return [0, 0, Y];
  }
  return [X / sum, Y / sum, Y];
};

function RGBtoXYZ(rgb) {
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255;

  // assume sRGB
  r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
  g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
  b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

  var x = (r * 0.41239079926595) + (g * 0.35758433938387) + (b * 0.18048078840183);
  var y = (r * 0.21263900587151) + (g * 0.71516867876775) + (b * 0.072192315360733);
  var z = (r * 0.019330818715591) + (g * 0.11919477979462) + (b * 0.95053215224966);

  return [x * 100, y *100, z * 100];
};

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgbarray) {
    return "#" + componentToHex(rgbarray[0]) + componentToHex(rgbarray[1]) + componentToHex(rgbarray[2]);
}

// Dark2 from ColorBrewer
var RGBdata = [[102,194,165],
              [252,141,98],
              [141,160,203],
              [231,138,195],
              [166,216,84],
              [255,217,47],
              [229,196,148],
              [179,179,179]];

var hexColors = ["#66C2A5", "#FC8D62", "#8DA0CB", "#E78AC3", "#A6D854", "#FFD92F", "#E5C494", "#B3B3B3"];

var userSelectedColors = [];

var Yxydata = RGBdata.map(function(rgbValue) { 
  console.log(rgbValue);
  return XYZtoXYY(RGBtoXYZ(rgbValue)); 
});

var colorCodeMap = {"xyy":Yxydata, "rgb": RGBdata};

var Xscale = d3.scale.linear()
              .domain([0,0.8])
              .range([60,470]);
  
var Yscale = d3.scale.linear()
              .domain([0.9,0])
              .range([0,475]);

var networkWidth = 600;
var networkHeight = 600;
var gjson;
var networkfiles = [
        'samples/game-ws.edgelist',
        'samples/game-rand-10.edgelist',
        'samples/game-rand-50.edgelist',
        'samples/game-ring.edgelist',
        'samples/game-star-100.edgelist',
        'samples/game-star-50.edgelist',
        'samples/game-kreg-5.edgelist',
        'samples/game-tree-50.edgelist']
var randomNetworkFile = networkfiles[getRandomInt(0,networkfiles.length-1)];

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

var randomNodeIndex;

var linecoords = [{"x1":0, "y1":0, "x2":0, "y2":0}];
var num = 1;
var minmaxlinecoords = {"xmin":10000, "ymin":10000, "xmax":0, "ymax":0};

function findLineCoordMinMax() {
  var xmin = 10000;
  var ymin = 10000;
  var xmax = 0;
  var ymax = 0;
  linecoords.forEach(function(item) {
    locaxlMin = d3.min([item.x1,item.x2]);
    locaylMin = d3.min([item.y1,item.y2]);
    locaxlMax = d3.max([item.x1,item.x2]);
    locaylMax = d3.max([item.y1,item.y2]);
    if (locaxlMin !== 0 & locaylMin !== 0) {
      if (locaxlMin < xmin) {
        xmin = locaxlMin;
      }
      if (locaylMin < ymin) {
        ymin = locaylMin;
      }
      if (locaxlMax > xmax) {
        xmax = locaxlMax;
      }
      if (locaylMax > ymax) {
        ymax = locaylMax;
      }
    }
  });
  return [xmin, ymin, xmax, ymax];
}

d3.xml("CIE1931xy_blank.svg", "image/svg+xml", function(xml) {
  document.body.appendChild(xml.documentElement);

  var groups = d3.select("svg")
            .selectAll("g .nikhil")
            .data(Yxydata)
            .enter()
            .append("g")

  var rects = d3.select("svg")
            .selectAll("rect")
            .data(RGBdata)
            .enter()
            .append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .attr("x", 470)
            .attr("y", function(d,i) {
              return 10+i*20+10;
            })
            .style("fill", function(d) {
              // console.log(d)
              return rgbToHex(d);
            })

  var texts = groups
          .append("text")
          .attr("x", 390)
          .attr("y", function(d,i) {
            return 25+i*20+10;
          })
          .text(function(d) {
            return "("+d[0].toFixed(2)+", "+d[1].toFixed(2)+")";
          })
          .attr("fill", "black");

  var circles = groups
            .append("circle")
              .attr("cx", function(d) {
                return Xscale(d[0]);
              })
              .attr("cy", function(d) {
                return Yscale(d[1]);
              })
              .attr("r", 5)
              .style("fill", "black")
              .on('mouseover', function() {
                d3.select(this).style("fill", "white");

                var thisData = d3.select(this).data()[0];

                texts.each(function(d,i) {
                  var used = "("+d[0].toFixed(2)+", "+d[1].toFixed(2)+")";
                  var cli = "("+thisData[0].toFixed(2)+", "+thisData[1].toFixed(2)+")";
                  if (used===cli) {
                    var coordText = d3.select(this)
                    if (coordText.attr("fill") === "gray") {
                    }
                    else {
                      coordText.attr("fill", "red");
                    }
                  }
                });

                // select a random dot to change color to
                var x_scan = thisData[0];
                var y_scan = thisData[1];
                var thisColor;

                colorCodeMap.xyy.map(function(vals) {
                  if (vals[0] === x_scan) {
                    if (vals[1] === y_scan) {
                      thisColor = colorCodeMap.xyy.indexOf(vals);
                    }
                  }
                });

                d3.selectAll(".outlier")
                  .style("fill", function(d) {
                  return hexColors[thisColor];
                });

              })
              .on('mouseout', function() {
                d3.select(this).style("fill", "black");

                var thisData = d3.select(this).data()[0];

                texts.each(function(d,i) {
                  var used = "("+d[0].toFixed(2)+", "+d[1].toFixed(2)+")";
                  var cli = "("+thisData[0].toFixed(2)+", "+thisData[1].toFixed(2)+")";
                  if (used===cli) {
                    var coordText = d3.select(this)
                    if (coordText.attr("fill") === "gray") {
                    }
                    else {
                      coordText.attr("fill", "black");
                    }
                  }
                });

              })
              .on('mousedown', function() {
                var thisData = d3.select(this).data()[0];

                var x_scan = thisData[0];
                var y_scan = thisData[1];

                // update dots
                colorCodeMap.xyy.map(function(vals) {
                  if (vals[0] === x_scan) {
                    if (vals[1] === y_scan) {
                      userSelectedColors.push(colorCodeMap.xyy.indexOf(vals));
                    }
                  }
                });

                d3.selectAll(".node").style("fill", function(d) {
                  var randNumber = getRandomInt(0,userSelectedColors.getUnique().length-1);
                  return hexColors[userSelectedColors.getUnique()[randNumber]];
                });

                //real code

                function updateLineCoords(mouseCoords) {
                  var temp = linecoords[linecoords.length-1];
                  var updated = {"x1":0, "y1":0, "x2":0, "y2":0};
                  updated.x1 = temp.x2;
                  updated.y1 = temp.y2;
                  updated.x2 = mouseCoords[0];
                  updated.y2 = mouseCoords[1];
                  num = num+1;
                  linecoords.push(updated);

                }

                updateLineCoords(d3.mouse(this));
                //updateLineCoords(thisData);

                d3.select("svg").selectAll("g .user")
                .data(linecoords)
                .enter()
                .append("line")
                .attr("x1", function(d) {
                  if (d.x1 === 0) {
                    return d.x2;
                  }
                  return d.x1;
                })
                .attr("y1", function(d) {
                  if (d.y1 === 0) {
                    return d.y2;
                  }
                  return d.y1;
                })
                .attr("x2", function(d) {
                  return d.x2;
                })
                .attr("y2", function(d) {
                  return d.y2;
                })
                .attr("stroke", "white")
                .attr("stroke-width", 2);

                //update text color
                var clicked = [Xscale.invert(d3.mouse(this)[0]),Yscale.invert(d3.mouse(this)[1])];

                texts.each(function(d,i) {
                  var used = "("+d[0].toFixed(2)+", "+d[1].toFixed(2)+")";
                  var cli = "("+thisData[0].toFixed(2)+", "+thisData[1].toFixed(2)+")";
                  if (used===cli) {
                    d3.select(this).attr("fill", "gray")
                  }
                });
 
              });

  // start force-directed graph code

  var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([networkWidth, networkHeight]);

  function readEdgeList(edgelist) {
    var graph = {nodes:[], edges:[]};
    var nodestemp = [];
    edgearray = edgelist.split(/\r\n|\r|\n/g);
    edgearray.forEach(function(edge) {
      var edgescoupled = edge.split(' ');
      if (edgescoupled.length !== 2) {
        return true; // this just skips the last blank line in the file
      }
      var edgeline = {"source":+edgescoupled[0], "target":+edgescoupled[1]};
      var edgefound = graph.edges.some(function(el) {
        return (el.source === edgescoupled[0]) & (el.target === edgescoupled[1]);
      });
      if (!edgefound) {
        graph.edges.push(edgeline);
        nodestemp.push(edgescoupled[0]);
        nodestemp.push(edgescoupled[1]);
      }

    });
    graph.nodes = nodestemp.getUnique()
      .filter(isNumeric)
      .sort(function(a,b){return a - b})
      .map(function(eachnode) {
        return {id:eachnode};
      });
    return graph;
  }

  d3.text(randomNetworkFile, function(json) {
    console.log(randomNetworkFile);

    graph = readEdgeList(json);
    randomNodeIndex = getRandomInt(0,graph.nodes.length-1);
    gjson = graph; // for debugging

    var networkSVG = d3.select("body")
              .append("svg")
              .attr("width", networkWidth)
              .attr("height", networkHeight);     

    force
      .nodes(graph.nodes)
      .links(graph.edges)
      .start();


    var link = networkSVG.selectAll(".link")
        .data(graph.edges)
      .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", 1)
        .style("stroke", "gray");

    var node = networkSVG.selectAll(".node")
        .data(graph.nodes)
      .enter().append("circle")
        .attr("class", function(d, i) {
          if (randomNodeIndex===i) {
            return "node outlier";
          }
          else {
            return "node normal";
          }
        })
        .attr("r", 5)
        .style("fill", function(d) {
            var randNumber = getRandomInt(0,userSelectedColors.getUnique().length-1);
            return hexColors[userSelectedColors.getUnique()[randNumber]];
        }) 
        .call(force.drag);

    node.append("title")
        .text(function(d) { return d.id; });

    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    });
    
  });
  
  
  
});


function dist(x1,y1,x2,y2) {
  return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}




