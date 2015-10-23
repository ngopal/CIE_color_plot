

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

var RGBdata = [[102,194,165],
              [252,141,98],
              [141,160,203],
              [231,138,195],
              [166,216,84],
              [255,217,47],
              [229,196,148],
              [179,179,179]];

var Yxydata = RGBdata.map(function(rgbValue) { 
  console.log(rgbValue);
  return XYZtoXYY(RGBtoXYZ(rgbValue)); 
});

var Xscale = d3.scale.linear()
              .domain([0,0.8])
              .range([60,470]);
  
var Yscale = d3.scale.linear()
              .domain([0.9,0])
              .range([0,475]);

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

  // var circle4 = d3.select("svg").append("circle")
  //             .attr("cx", Xscale(0.26))
  //             .attr("cy", Yscale(0.37))
  //             .attr("r", 10);

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
              console.log(d)
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
                  //var cli =  "("+clicked[0].toFixed(2)+", "+clicked[1].toFixed(2)+")";
                  console.log(used, cli, used===cli);
                  if (used===cli) {
                    var coordText = d3.select(this)
                    if (coordText.attr("fill") === "gray") {
                      console.log("already gray");
                    }
                    else {
                      coordText.attr("fill", "red");
                    }
                  }
                });

              })
              .on('mouseout', function() {
                d3.select(this).style("fill", "black");

                var thisData = d3.select(this).data()[0];

                texts.each(function(d,i) {
                  var used = "("+d[0].toFixed(2)+", "+d[1].toFixed(2)+")";
                  var cli = "("+thisData[0].toFixed(2)+", "+thisData[1].toFixed(2)+")";
                  //var cli =  "("+clicked[0].toFixed(2)+", "+clicked[1].toFixed(2)+")";
                  console.log(used, cli, used===cli);
                  if (used===cli) {
                    var coordText = d3.select(this)
                    if (coordText.attr("fill") === "gray") {
                      console.log("already gray");
                    }
                    else {
                      coordText.attr("fill", "black");
                    }
                  }
                });

              })
              .on('mousedown', function() {
                var thisData = d3.select(this).data()[0];
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
                  //var cli =  "("+clicked[0].toFixed(2)+", "+clicked[1].toFixed(2)+")";
                  console.log(used, cli, used===cli);
                  if (used===cli) {
                    d3.select(this).attr("fill", "gray")
                  }
                });
 
              });


            
  
});


function dist(x1,y1,x2,y2) {
  return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
}


