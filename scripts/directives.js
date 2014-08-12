'use strict';

// Zoomable Sunburst - http://bl.ocks.org/mbostock/4348373
// w labels - http://blog.luzid.com/2013/extending-the-d3-zoomable-sunburst-with-labels/
angular.module('pacmanApp').directive('sunburstChart', function () {

  var link = function ($scope, $el, $attrs) {
    
    var width = 720,
        height = 600,
        radius = Math.min(width, height) / 2;

    var x = d3.scale.linear()
        .range([0, 2 * Math.PI]);

    var y = d3.scale.sqrt()
        .range([0, radius]);

    var color = d3.scale.category20();

    var svg = d3.select($el[0]).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

    var partition = d3.layout.partition()
        .value(function(d) { return d.size; });

    var arc = d3.svg.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
        .innerRadius(function(d) { return Math.max(0, y(d.y)); })
        .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

    d3.json("data/issues.json", function(error, root) {
      var g = svg.selectAll("g")
          .data(partition.nodes(root))
          .enter().append("g");

      var path = g.append("path")
          .attr("d", arc)
          .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
          .on("click", click);

      var text = g.append("text")
          .attr("x", function(d) { return y(d.y); })
          .attr("dx", "5") // margin
          .attr("dy", ".35em") // vertical-align
          .text(function(d) { return d.name + (d.size ? " (" + d.size + ")" : "") })
          .attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })

      function click(d) {
        // fade out all text elements
        text.transition().attr("opacity", 0);
        
        path.transition()
          .duration(750)
          .attrTween("d", arcTween(d))
          .each("end", function(e, i) {
            // check if the animated element's data e lies within the visible angle span given in d
            if (e.x >= d.x && e.x < (d.x + d.dx)) {
              // get a selection of the associated text element
              var arcText = d3.select(this.parentNode).select("text");
              // fade in the text element and recalculate positions
              arcText.transition().duration(750)
                .attr("opacity", 1)
                .attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")" })
                .attr("x", function(d) { return y(d.y); });
            }
          });
      }
    });

    // Interpolate the scales!
    function arcTween(d) {
      var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
          yd = d3.interpolate(y.domain(), [d.y, 1]),
          yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
      return function(d, i) {
        return i
            ? function(t) { return arc(d); }
            : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
      };
    }

    function computeTextRotation(d) {
      var angle = x(d.x + d.dx / 2) - Math.PI / 2;
      return angle / Math.PI * 180;
    }

  };

  return {
    template: '<div class="chart"></div>',
    replace: true,
    link: link, 
    restrict: 'E' 
  };

});