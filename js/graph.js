function directed_graph(svgContainer) {
  var _chart = {};

  var _svg,
      _width = 960, _height = 600,
      _simulation = d3.forceSimulation(),
      _r = 5, _colors = d3.scaleOrdinal(d3.schemeCategory20c),
      _nodes, _links,
      _graphData;

  if(svgContainer) {
    _svg = svgContainer.append('svg');
  } else {
    _svg = d3.select('body').append('svg');
  }

  _chart.render = function() {
    _svg.attr('height', _height)
        .attr('width', _width);
    
    _simulation.force('link', 
        d3.forceLink().id(function(d) { return d.id; }))
      .force('charge', 
        d3.forceManyBody().strength(-40))
      .force('collision', d3.forceCollide(_r).strength(1))
      .force('center', 
        d3.forceCenter(_width / 2, _height / 2));

    renderContent();

    _simulation
      .nodes(_graphData.nodes)
      .on("tick", tickActions);
  
    _simulation.force("link")
      .links(_graphData.links);
  }

  function renderContent() {
    renderLinks();
    renderData();
  }

  function renderData() {
    _nodes = _svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(_graphData.nodes)
      .enter().append('circle')
        .attr('r', _r)
        .attr('fill', function(d) { return _colors(d.value); })
  }

  function renderLinks() {
    _links = _svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(_graphData.links)
      .enter().append('line');
  }

  function tickActions() {
    _links
        .attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });
    
    _nodes
        .attr('cx', function(d) { 
          return d.x = Math.max(_r, Math.min(_width - _r, d.x)); 
        })
        .attr('cy', function(d) { 
          return d.y = Math.max(_r, Math.min(_height - _r, d.y));
        });
  }

  _chart.width = function(w) {
    if(!arguments.length) {
      return _width;
    }

    _width = w;
    return _chart;
  }

  _chart.height = function(h) {
    if(!arguments.length) {
      return _height;
    }

    _height = h;
    return _chart;
  }

  _chart.r = function(r) {
    if(!arguments.length) {
      return _r;
    }

    _r = r;
    return _chart;
  }

  _chart.colors = function(c) {
    if(!arguments.length) {
      return _colors;
    }

    _colors = c;
    return _chart;
  }

  _chart.data = function(gd) {
    if(!arguments.length) {
      return _graphData;
    }

    _graphData = gd;
    return _chart;
  }

  return _chart;
}

d3.json('data/football.json', function(error, graph) {
  var dg = directed_graph(d3.select('#graph-container'))
            .data(graph);

  dg.render();
});