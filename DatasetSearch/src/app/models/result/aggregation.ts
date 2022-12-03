import {Facet} from './facet';

// filter box on the left side
export class Aggregation {
    // the containing items in the box
    private facets: Facet[];
    // the id of the checkbox
    private id: string;
    // the title of the checkbox
    private title: string;
    // the name of the icon (mat-icon)
    private icon: string;

    getFacets(): Facet[] {
        return this.facets;
    }

    setFacets(facets: Facet[]): void {
        this.facets = facets;
    }

    getId(): string {
        return this.id;
    }

    setId(id: string): void {
        this.id = id;
    }

    getTitle(): string {
        return this.title;
    }

    setTitle(title: string): void {
        this.title = title;
    }

    getIcon(): string {
        return this.icon;
    }

    setIcon(icon: string): void {
        this.icon = icon;
    }


}
