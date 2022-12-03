# [Dai:Si] - Semantic Search Extension

This repository provides an extended version of [Dataset Search UI - Dai:Si](https://github.com/fusion-jena/DaiSi) - an application that provides a user interface for querying a dataset search index. 
It consists of two parts: a backend server (Node Server) and a frontend (Angular application). 
The Node middleware server handles the index requests and provides a convinent API for the frontend - a modular Angular app that can be easily adjusted for a specific domain. 

* [Angular app] 
* [Node Server] 

[Angular app]: https://github.com/fusion-jena/daisi-semantic-search/tree/main/DatasetSearch
[Node Server]: https://github.com/fusion-jena/DatasetSearchUI/tree/master/node

## Extension

The extension comprises:

1. a new Node module 'biodiv' for [GATE Mímir](https://github.com/GateNLP/mimir) enabling a semantic search over an index with biological dataset
2. a user interface allowing a form-based input based on domain specific categories
3. a classical UI with one input field that recognizes biological categories (entity types)

## Demo

A live demo is available here: https://semsearch.fmi.uni-jena.de/daisi/

The Node Server and its swagger API is also available: https://semsearch.fmi.uni-jena.de/daisi-api/api-docs/


## How to setup Dataset Search UI for an own index

Please get further information on how to setup Dai:Si for your own index from the original GitHub repository: https://github.com/fusion-jena/DaiSi

## Issue Tracking

Please report bugs and issues in the GitHub issue tracker.

## Changelog

03.12.2022 initial release 0.1

## License
<Dataset Search UI - Semantic Search Extension> is distributed under the terms of the GNU LGPL v3.0. (https://www.gnu.org/licenses/lgpl-3.0.en.html) 
