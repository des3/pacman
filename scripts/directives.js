'use strict';

// Zoomable Sunburst - http://bl.ocks.org/mbostock/4348373
angular.module('pacmanApp').directive('sunburstChart', function () {

  var link = function ($scope, $el, $attrs) {
    
    var width = 720,
        height = width,
        radius = width / 2,
        x = d3.scale.linear().range([0, 2 * Math.PI]),
        y = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, radius]),
        padding = 5,
        duration = 1000;

    var color = d3.scale.category20();

    var div = d3.select($el[0]);

    var vis = div.append("svg")
        .attr("width", width + padding * 2)
        .attr("height", height + padding * 2)
        .append("g")
        .attr("transform", "translate(" + [radius + padding, radius + padding] + ")");

    var partition = d3.layout.partition()
        .sort(null)
        .value(function(d) { return 5.8 - d.depth; });

    var arc = d3.svg.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
        .innerRadius(function(d) { return Math.max(0, d.y ? y(d.y) : d.y); })
        .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

    // data should be in the $scope
    d3.json("data/issues.json", function(error, json) {
      var nodes = partition.nodes(json);

      var path = vis.selectAll("path").data(nodes);
      path.enter().append("path")
          .attr("id", function(d, i) { return "path-" + i; })
          .attr("d", arc)
          .attr("fill-rule", "evenodd")
          .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
          .on("click", click);

      var text = vis.selectAll("text").data(nodes);
      var textEnter = text.enter().append("text")
          .style("fill-opacity", 1)
          .attr("text-anchor", function(d) {
            return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
          })
          .attr("dy", ".2em")
          .attr("transform", function(d) {
            var multiline = (d.name || "").split(" ").length > 1,
                angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                rotate = angle + (multiline ? -.5 : 0);
            return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
          })
          .on("click", click);
      textEnter.append("tspan")
          .attr("x", 0)
          .text(function(d) { return d.depth ? d.name : ""; });
      textEnter.append("tspan")
          .attr("x", 0)
          .attr("dy", "1em")
          .text(function(d) { return d.depth ? d.size : ""; });

      function click(d) {
        path.transition()
          .duration(duration)
          .attrTween("d", arcTween(d));

        // Somewhat of a hack as we rely on arcTween updating the scales.
        text.style("visibility", function(e) { return isParentOf(d, e) ? null : d3.select(this).style("visibility"); })
          .transition()
            .duration(duration)
            .attrTween("text-anchor", function(d) {
              return function() {
                return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
              };
            })
            .attrTween("transform", function(d) {
              var multiline = (d.name || "").split(" ").length > 1;
              return function() {
                var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                    rotate = angle + (multiline ? -.5 : 0);
                return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
              };
            })
            .style("fill-opacity", function(e) { return isParentOf(d, e) ? 1 : 1e-6; })
            .each("end", function(e) {
              d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
            });
        }
    });

    resize();

    function isParentOf(p, c) {
      if (p === c) return true;
      if (p.children) {
        return p.children.some(function(d) {
          return isParentOf(d, c);
        });
      }
      return false;
    }

    // Interpolate the scales!
    function arcTween(d) {
      var my = maxY(d),
          xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
          yd = d3.interpolate(y.domain(), [d.y, my]),
          yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
      return function(d) {
        return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
      };
    }

    function maxY(d) {
      return d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
    }

    function resize() {
      // console.log("resize");
      vis.attr("width", $el[0].clientWidth);
      vis.attr("height", $el[0].clientWidth); //It's a square
    }

    $scope.$on('windowResize',resize);

  };

  return {
    template: '<div class="chart"></div>',
    replace: true,
    link: link, 
    restrict: 'E' 
  };

});