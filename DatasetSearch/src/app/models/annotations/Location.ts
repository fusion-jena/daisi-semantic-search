import {Annotation} from './Annotation';
import { AnnotationInstance } from './AnnotationInstance';


export class Location extends Annotation<string> {
  locType: string;
  // instances: AnnotationInstance[];

  constructor (options: {} = {}) {
    super(options);
    this.locType = options['locType'] === undefined ? undefined : options['locType'];

  }

  getLocType(): string {
   return this.locType;
  }
}


