function directed_graph(svgContainer) {
  var _chart = {};

  var _svg,
      _width = 960, _height = 600,
      _simulation = d3.forceSimulation(),
      _isHighlighted = false, // Is a node and it's children highlighted
      _listOfLinks = {}, // Tracks what each node is linked to
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
        .attr('width', _width)
        .on('dblclick', unHighlightNodes);
    
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
      .on('dblclick', highlightNodes)
      .call(d3.drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded));
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

  function dragStarted(d) {
    if (!d3.event.active) {
      _simulation.alphaTarget(0.3).restart();
    }

    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  function dragEnded(d) {
    if (!d3.event.active) {
      _simulation.alphaTarget(0);
    }

    d.fx = null;
    d.fy = null;
  }

  function generateListOfLinks() {
    var temp = {};

    // All nodes are linked to themselves
    for(i = 0; i < _graphData.nodes.length; i++) {
      temp[i + ',' + i] = true;
    }

    // All links the a nodes direct children
    _graphData.links.forEach(function(el) {
      temp[el.source + ',' + el.target] = true;      
    }, this);
    _listOfLinks = temp;
  }

  function neighboring(a, b) {
    return _listOfLinks[a.id + "," + b.id];
  }

  function highlightNodes(d) {
    d3.event.stopPropagation();

    if(!_isHighlighted) {
      _isHighlighted = true;

      _links.style("opacity", function (o) {
        return d.index == o.source.index | d.index === o.target.index ? 1 : 0.1;
      });

      _nodes.style("opacity", function (o) {
        return neighboring(d, o) || neighboring(o, d) ? 1 : 0.1;
      });

    } else {
      unHighlightNodes();
    }
  }

  function unHighlightNodes(d) {
    console.log(d)
    if(_isHighlighted) {
      _isHighlighted = false;
      _nodes.style("opacity", 1);
      _links.style("opacity", 1);
    }
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
    generateListOfLinks();
    return _chart;
  }

  return _chart;
}

function uniqueConference(arr) {
  var hash = {};
  var newArr = [];

  for(var i = 0; i < arr.length; i++) {
    if(!hash[arr[i].value]) {
      hash[arr[i].value] = arr[i].value;
      newArr.push(arr[i].value);
    }
  }

  return newArr.sort();
}

function renderSelection(container, id, content) {
  var label = document.createElement('label');
  label.innerHTML = 'Sort by Conference:'
  label.htmlFor = id;
  container.appendChild(label);

  var selectList = document.createElement('select');
  selectList.id = id;
  container.appendChild(selectList);
  
  var option = document.createElement('option');
  option.value = 'none';
  option.text = 'None';
  selectList.appendChild(option);

  for(var i = 0; i < content.length; i++) {
    option = document.createElement('option');
    option.value = content[i];
    option.text = content[i];
    selectList.appendChild(option);
  }
}

d3.json('data/football.json', function(error, graph) {
  renderSelection(
    document.getElementById('graph-container'),
    'select-conference',
    uniqueConference(graph.nodes));

  var dg = directed_graph(d3.select('#graph-container'))
            .data(graph);

  dg.render();
});