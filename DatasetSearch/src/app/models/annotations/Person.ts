import {Annotation} from './Annotation';
import { AnnotationInstance } from './AnnotationInstance';

export class Person extends AnnotationInstance<any> {
  gender: string;


  constructor (options: {} = {}) {
    super(options);
     this.gender = options['gender'] === undefined ? undefined : options['gender'];
     
  }

  

  getGender(): string {
      return this.gender;
  }

 
}


