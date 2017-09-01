# NCAA College Football Interactive Graph

## Description

Solution to a data visualization assignment for the [Data Mining](https://www.coursera.org/specializations/data-mining) specialization on Coursera.

## Data Source

University of California Network Data Repository. (2017). American College Football [Data File]. From [https://networkdata.ics.uci.edu/data.php?id=5](https://networkdata.ics.uci.edu/data.php?id=5)

## Changes Made to Data

`multigraph 1` was added to the header of the downloaded GML data file in order to facilitate parsing by the NetworkX package. This addition was suggested by Aric Hagberg on the [Reading GML files raises NetworkXError: edge is duplicated](https://groups.google.com/forum/#!topic/networkx-discuss/kF2sbuLjGwY) Google Group thread.