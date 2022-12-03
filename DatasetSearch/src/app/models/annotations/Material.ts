import {Annotation} from './Annotation';
import {AnnotationInstance} from './AnnotationInstance';

export class Material extends AnnotationInstance<any> {

    URI: string;
    

    constructor(options: {} = {}) {
        super(options);
        this.URI = options['URI'] === undefined ? undefined : options['URI'];


    }

    getURI(): string {
        return this.URI;
    }
   
}


