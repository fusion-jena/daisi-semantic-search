import {Result} from '../models/result/result';

export interface SearchResult {
    result: Result;
    paginationClicked(from): void;
}
