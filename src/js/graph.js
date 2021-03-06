(function() {
  function directed_graph(svgContainer) {
    var _chart = {};

    var _svg, _bodyG, _tooltip, _filterSelector,
        _width = 960, _height = 600,
        _simulation = d3.forceSimulation(),
        _isHighlighted = false, // Is a node and it's children highlighted
        _listOfLinks = {}, // Tracks what each node is linked to
        _r = 8, _colors = d3.scaleOrdinal(d3.schemeCategory20b),
        _nodes, _links, _legendRectSize = 18, _legendSpacing = 4,
        _graphData;

    if(svgContainer) {
      _tooltip = svgContainer.append('div');
      _svg = svgContainer.append('svg');
    } else {
      _tooltip = d3.select('body').append('div');
      _svg = d3.select('body').append('svg');
    }

    _tooltip.attr('class', 'tooltip')
            .style('opacity', 0);

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
      if(!_bodyG) {
        _bodyG = _svg.append('g');
        _bodyG.attr('class', 'body-g');
      }

      renderLinks();
      renderData();
      renderLegend();
    }

    function renderData() {
      _nodes = _bodyG.append('g')
          .attr('class', 'nodes')
        .selectAll('circle')
        .data(_graphData.nodes)
        .enter().append('circle')
          .attr('r', _r)
          .attr('fill', function(d) { return _colors(d.value); })
        .on('mouseover', function(d) {
          var node = d3.select(this);
          if(node.style('opacity') == 1) {
            _tooltip.transition()
              .duration(200)
              .style('opacity', .9);
            _tooltip.html(genTooltipHTML(d.label, d.value))
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 60) + "px");
          }
        })
        .on('mouseout', function(d) {
          _tooltip.transition()
            .duration(500)
            .style('opacity', 0);
        })
        .on('dblclick', highlightNodes)
        .call(d3.drag()
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded));
    }

    function renderLinks() {
      _links = _bodyG.append('g')
          .attr('class', 'links')
        .selectAll('line')
        .data(_graphData.links)
        .enter().append('line');
    }

    function renderLegend() {
      var lContainer = _svg.append('g')
          .attr('class', 'legend-container')
          .attr('transform', function(d) {
            var legRecHeight = _legendRectSize + _legendSpacing;
            var totalVert = _colors.domain().length * legRecHeight;
            // 100 is an arbitrary guess at the text width
            var totalLHorz = _legendRectSize + (2 * _legendRectSize) + 100;
            return 'translate(' + (_width - totalLHorz) +
              ',' + (_height / 2 - (totalVert / 2) + ')')
          });
        
      var lRows = lContainer.selectAll('.legend-row')
        .data(_colors.domain())
        .enter().append('g')
          .attr('class', 'legend-row')
          .attr('transform', function(d, i) {
            var legRecHeight = _legendRectSize + _legendSpacing;
            var vert = i * legRecHeight;
            return 'translate(' + 0 + ',' + vert + ')';
          });

      lRows.append('rect')
        .attr('width', _legendRectSize)
        .attr('height', _legendRectSize)
        .style('fill', _colors)
        .style('stroke', _colors);

      lRows.append('text')
          .attr('x', _legendRectSize + _legendSpacing)
          .attr('y', _legendRectSize - _legendSpacing)
          .text(function(d) { return d; });
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

        // Return the selection form to the 'None' option
        _filterSelector.property('selectedIndex', 0);

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
      if(_isHighlighted) {
        _isHighlighted = false;
        _nodes.style("opacity", 1);
        _links.style("opacity", 1);
      }
    }

    function onSelectChange(d) {
      if(d3.event.type === 'change') {
        var e = d3.event;

        if(_isHighlighted) {
          unHighlightNodes();
        }

        _nodes.style('opacity', 1);
        _links.style('opacity', 1);

        if(e.target.value) {
          filterBy(e.target.value);
        }
      }
    }

    function filterBy(filter) {
      var hiddenNodeIds = [];

      var hiddenNodes = _nodes.filter(function (d, i) {
        if(d.value !== filter) {
          hiddenNodeIds.push(d.index);
          return true;
        }
        return false;
      });

      var hiddenLinks = _links.filter(function(d, i) {
        return hiddenNodeIds.indexOf(d.source.index) >= 0 || 
          hiddenNodeIds.indexOf(d.target.index) >= 0; 
      });

      hiddenNodes.style('opacity', 0);
      hiddenLinks.style('opacity', 0);
    }

    function genTooltipHTML(name, conference) {
      console.log(name)
      return '<p class="school"> <span class="label">School: </span> ' + 
        name + 
        '</p> <p class="school"> <span class="label">Conference:</span> ' + 
        conference + '</p>'
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
    };

    _chart.data = function(gd) {
      if(!arguments.length) {
        return _graphData;
      }
      
      _graphData = gd;
      generateListOfLinks();
      return _chart;
    };

    _chart.filterSelector = function(s) {
      if(!arguments.length) {
        return _filterSelector;
      }

      _filterSelector = s;

      _filterSelector.on('change', onSelectChange);

      return _chart;
    };

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

  function renderTitle(container, content) {
    var containDiv = document.createElement('div');
    containDiv.id = 'graph-title';
    container.appendChild(containDiv);

    var title = document.createElement('h2');
    title.innerHTML = content;
    containDiv.appendChild(title);
  }

  function renderSelection(container, id, content) {
    var containDiv = document.createElement('div');
    containDiv.id = 'select-div'
    container.appendChild(containDiv);

    var label = document.createElement('label');
    label.innerHTML = 'Sort by Conference:'
    label.htmlFor = id;
    containDiv.appendChild(label);

    var selectList = document.createElement('select');
    selectList.id = id;
    containDiv.appendChild(selectList);
    
    var option = document.createElement('option');
    option.value = '';
    option.text = 'None';
    selectList.appendChild(option);

    for(var i = 0; i < content.length; i++) {
      option = document.createElement('option');
      option.value = content[i];
      option.text = content[i];
      selectList.appendChild(option);
    }
  }

  function renderInstructions(container) {
    var containDiv = document.createElement('div');
    containDiv.id = 'instruct-div';
    container.appendChild(containDiv);

    var inst = document.createElement('h3');
    inst.innerHTML = 'Interactions:';
    containDiv.appendChild(inst);

    var list = document.createElement('ul');

    var hover = document.createElement('li');
    hover.innerHTML = '<span class="bold">Hover</span> over a node to see the school\'s name and the conference.';
    list.appendChild(hover);
    
    var dbClick = document.createElement('li');
    dbClick.innerHTML = '<span class="bold">Double click</span> a node to see all the games ' +
      'that school played. Double click again, to return to the normal view.';
    list.appendChild(dbClick);

    var drag = document.createElement('li');
    drag.innerHTML = '<span class="bold">Click and drag</span> to move nodes around.'
    list.appendChild(drag);

    var filter = document.createElement('li');
    filter.innerHTML = 'Use the <span class="bold">select menu</span> to filter by Conference.'
    list.appendChild(filter);

    containDiv.appendChild(list);
  }

  d3.json('data/football.json', function(error, graph) {
    var graphContainer = document.getElementById('graph-container');

    renderTitle(
      graphContainer,
      'American College Football Games from 2000',
    );

    renderSelection(
      graphContainer,
      'select-conference',
      uniqueConference(graph.nodes));

    var dg = directed_graph(d3.select('#graph-container'))
              .filterSelector(d3.select('#select-conference'))
              .data(graph);

    dg.render();

    renderInstructions(graphContainer);
  });
})();