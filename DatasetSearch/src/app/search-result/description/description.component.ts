import {Component, Input, OnInit} from '@angular/core';
import {Description} from '../../models/result/description';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.css']
})
export class DescriptionComponent implements OnInit {
  @Input() des: Description;
  @Input() showBiodiv: boolean;
  showMore = false;
  constructor() { }

  ngOnInit(): void {
    //console.log(this.des);
  }
  showLess(length): boolean {
    if (this.showMore === true) {
      return true;
    }else {
      return length <= 600;
    }
  }
  
}
