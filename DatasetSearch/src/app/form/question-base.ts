export class QuestionBase<T> {
  value: T;
  key: string;
  label: string;
  icon: string;
  required: boolean;
  order: number;
  controlType: string;
  type: string;
  options: {key: string, value: string}[];
  placeholder: string;
  concepts: string[];
  sparqlTemplate: string;
  sparqlRelatedTerms: string;
  defaultTemplate: string;
  selectAll: boolean;

  constructor(options: {
    value?: T;
    key?: string;
    label?: string;
    icon?: string;
    required?: boolean;
    order?: number;
    controlType?: string;
    type?: string;
    options?: {key: string, value: string}[];
  } = {}) {
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.icon = options.icon || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
    this.type = options.type || '';
    this.options = options.options || [];
    this.placeholder = options['placeholder'] || '';
    this.concepts = options['concepts'];
    this.sparqlTemplate = options['sparqlTemplate'];
    this.sparqlRelatedTerms = options['sparqlRelatedTerms'];
    this.defaultTemplate = options['defaultTemplate'];
    this.selectAll = options['selectAll'] || false;
  }
}


