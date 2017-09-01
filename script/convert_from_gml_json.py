"""Script to Convert and Clean data

This module converts American College Football data
from Graph Modeling Language (GML) into JavaScript
Object Notation (JSON).

Citation for Data:


Packages Used:
    NetworkX - for parseing the GML and converting into a
           python dictionary
    Json - for writing to a json file
    re - for cleaning and reformating tasks
"""
import json
import re
import os
import networkx as nx
from networkx.readwrite import json_graph

# Global constant used to store the names of Conferences referenced by each node.
# Names taken from the football.txt file.
CONFERENCES = ['Atlantic Coast', 'Big East', 'Big Ten', 'Big Twelve',
               'Conference USA', 'Independents', 'Mid-American', 'Mountain West',
               'Pacific Ten', 'Southeastern', 'Sun Belt', 'Western Athletic']

# Files to read and write
GML_FILE = '../original_data/football.gml'
JSON_FILE = '../src/data/football.json'

def update_gml_format(old_gml):
    """File containing original data places brackets denoting
    sections of the markup on separate lines. This syntax
    is no longer supported by NetworkX's GML parser.
    This function implements a solution suggested by Makan on
    https://stackoverflow.com/questions/32895291/unexpected-error-reading-gml-graph/
    """
    return re.sub(r'\s+\[', ' [', old_gml).strip()

def clean_json(data):
    """The original data referenced Conferences by number and did not
    have spaces between University names. This function adds the Conference
    name to the data and place spaces, when appropriate, in University names.
    """
    for node in data['nodes']:
        node['label'] = re.sub(r'\B([A-Z])[^A-Z]', r' \1', node['label'])
        node['value'] = CONFERENCES[node['value']]

def convert_to_json(data):
    """This function handles the parsing, cleaning, and conversion process.
    """
    gml_data = nx.parse_gml(data, label='id')
    json_data = json_graph.node_link_data(gml_data)
    clean_json(json_data)
    return json.dumps( {
        'nodes': json_data['nodes'],
        'links': json_data['links']},
        indent = 2)

def main():
    """Main function handles reading the data from file, then writing it
    to a new file.
    """
    dir = os.path.dirname(__file__)
    with open(os.path.join(dir, GML_FILE), 'r') as in_file, \
            open(os.path.join(dir, JSON_FILE), 'w') as out_file:
        gml_data = update_gml_format(in_file.read())
        out_file.write(convert_to_json(gml_data))

if __name__ == '__main__':
    main();