import { Injectable } from '@angular/core';

import { DropdownQuestion } from '../../form/question-dropdown';
import { QuestionBase } from '../../form/question-base';
import { TextboxQuestion } from '../../form/question-textbox';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class QuestionService {

  getDefaultQuestion() {
        const question: QuestionBase<any> = new TextboxQuestion({
            key: 'all',
            label: 'All',
            placeholder: 'type in your search terms such as species names,'
                          + 'e.g., quercus, honeybee or environmental terms, e.g., grassland',
            required: true,
            order: 1,
            concepts: [],
            sparqlTemplate: '({Organism broader="<queryTerm>"} OR {Organism inst="<queryTerm>"}\n'
                        + ' OR {Environment broader="<queryTerm>"} OR {Environment inst="<queryTerm>"}\n'
                        + ' OR {Quality broader="<queryTerm>"} OR {Quality inst="<queryTerm>"}\n'
                        + ' OR {Material broader="<queryTerm>"} OR {Material inst="<queryTerm>"}\n'
                        + ' OR {Process broader="<queryTerm>"} OR {Process inst="<queryTerm>"})\n'

        });
       return question;
      }

      getQuestions():any {

        const questions: QuestionBase<any>[] = [

          new TextboxQuestion({
            key: 'organism',
            label: 'Organism',
            icon: 'local_florist',
            placeholder: 'species names, e.g., quercus, honeybee',
            required: false,
            order: 1,
            concepts: [],
            sparqlTemplate: '({Organism broader="<queryTerm>"} OR {Organism inst="<queryTerm>"})',
            defaultTemplate: '((<queryTerm> IN {Organism}) OR (<queryTerm> OVER {Organism}) OR (<queryTerm> AND {Organism}))'

          }),

          new TextboxQuestion({
            key: 'environment',
            label: 'Environment',
            icon: 'landscape',
            type: 'text',
            placeholder: 'environmental terms, e.g., grassland, "shrub layer"',
            required: false,
            order: 2,
            concepts: [],
            sparqlTemplate: '({Environment broader="<queryTerm>"} OR {Environment inst="<queryTerm>"})',
            defaultTemplate: '((<queryTerm> IN {Environment}) OR (<queryTerm> OVER {Environment}) OR (<queryTerm> AND {Environment}))'
          }),

          new TextboxQuestion({
              key: 'quality',
              label: 'Quality',
              icon: 'dataset',
              type: 'text',
              placeholder: 'phenotypes, data attributes, e.g., length, height, pH',
              required: false,
              order: 3,
              concepts: [],
              sparqlTemplate: '({Quality broader="<queryTerm>"} OR {Quality inst="<queryTerm>"})',
              defaultTemplate: '((<queryTerm> IN {Quality}) OR (<queryTerm> OVER {Quality}) OR (<queryTerm> AND {Quality}))'
               }),

           new TextboxQuestion({
                key: 'process',
                label: 'Process',
                type: 'text',
                icon: 'cyclone',
                placeholder: 'biological and chemical processes, e.g., "nitrogen cycle"',
                required: false,
                order: 4,
                concepts: [],
                // tslint:disable-next-line:max-line-length
                sparqlTemplate: '({Process broader="<queryTerm>"} OR {Process inst="<queryTerm>"} )',
                defaultTemplate: '((<queryTerm> IN {Process}) OR (<queryTerm> OVER {Process}) OR (<queryTerm> AND {Process}))'
              }),

          new TextboxQuestion({
              key: 'material',
              label: 'Material & Substance',
              type: 'text',
              icon: 'science',
              placeholder: 'materials, substances, chemicals, e.g., sediment, CO2, nutrients',
              required: false,
              order: 5,
              concepts: [],
              // tslint:disable-next-line:max-line-length
              sparqlTemplate: '({Material broader="<queryTerm>"} OR {Material inst="<queryTerm>"}  )',
              defaultTemplate: '((<queryTerm> IN {Material}) OR (<queryTerm> OVER {Material}) OR (<queryTerm> AND {Material}))'
            })

        ];

    return of(questions.sort((a, b) => a.order - b.order));
  }
}
