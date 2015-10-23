

// Code borrowed from https://github.com/dfcreative/color-space

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

d3.xml("CIE1931xy_blank.svg", "image/svg+xml", function(xml) {
  document.body.appendChild(xml.documentElement);

  // var circle4 = d3.select("svg").append("circle")
  //             .attr("cx", Xscale(0.26))
  //             .attr("cy", Yscale(0.37))
  //             .attr("r", 10);
  
  var circles = d3.select("svg")
            .selectAll("circle")
            .data(Yxydata)
            .enter()
            .append("circle")
              .attr("cx", function(d) {
                console.log(["x", d[0], Xscale(d[0])])
                return Xscale(d[0]);
              })
              .attr("cy", function(d) {
                console.log(["y", d[1], Yscale(d[1])])
                return Yscale(d[1]);
              })
              .attr("r", 5)
              .style("fill", "black")
            .selectAll("text")
            .append("text");

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

    // var texts = d3.select("svg")
    //         .selectAll("text")
    //         .data(Yxydata)
    //         .enter()
    //         .append("text");
            
  
});



