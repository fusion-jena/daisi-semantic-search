import {AnnotationInstance} from './AnnotationInstance';

export class Annotation<T> {
    body: string;
    type: string;
    term: string;
    icon: string;

    instances: AnnotationInstance<any>[];

    constructor(options: { body?: string, type?: string, term?: string} = {}) {

        this.body = options.body === undefined ? undefined : options.body;
        this.type = options.type === undefined ? undefined : options.type;
        this.term = options.term === undefined ? undefined : options.term;
        this.instances = [];

    }

    /*setTypeSpecificSettings(options:
       {scientificName?: string, URI?: string, gender?: string, locType?: string}): void;

    getScientificName(): string;*/

    addInstances(instances: AnnotationInstance<any>[]) {
        if (instances !== null && instances !== undefined && instances.length > 0) {

            instances.forEach(instance => {
                this.instances.push(instance);
            });
        }
    }

    addInstance(instance: AnnotationInstance<any>) {
        if (instance !== null && instance !== undefined) {
         
           this.instances.push(instance);
           
        }
    }
    
    
    // abstract addInstances(instances: AnnotationInstance[]): void;

}


