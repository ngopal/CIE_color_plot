

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

function drawLine(lc) {
            d3.select("svg")
                .selectAll("line .num"+num)
                .data(lc)
                .enter()
                .append("line")
                .attr("x1", function(d) {
                  console.log("INSIDE FUNCT", d)
                  return d.x1;
                })
                .attr("y1", function(d) {
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

  var circles = groups
            .append("circle")
              .attr("cx", function(d) {
                // console.log(["x", d[0], Xscale(d[0])])
                return Xscale(d[0]);
              })
              .attr("cy", function(d) {
                // console.log(["y", d[1], Yscale(d[1])])
                return Yscale(d[1]);
              })
              .attr("r", 5)
              .style("fill", "black")
              .on('mouseover', function() {
                d3.select(this).style("fill", "white");
              })
              .on('mouseout', function() {
                d3.select(this).style("fill", "black");
              })
              .on('mousedown', function() {
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
 
              });

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
            });
            
  
});


