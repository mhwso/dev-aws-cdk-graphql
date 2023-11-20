import { Component, Input, OnInit } from '@angular/core'
import { ValidationKeys, ValidationRule, ValidationRules } from '../../enums/ValidationRules'
import { IonText } from '@ionic/angular/standalone'
import { NgForOf, NgIf } from '@angular/common'
import { FormGroup } from '@angular/forms'

@Component({
  selector: 'app-error-container',
  templateUrl: './error-container.component.html',
  styleUrls: ['./error-container.component.scss'],
  standalone: true,
  imports: [IonText, NgForOf, NgIf],
})
export class ErrorContainerComponent implements OnInit {
  constructor() {}

  @Input() form: FormGroup | undefined
  @Input() field: string = ''

  validationSet: ValidationRule[] | undefined

  validationRules = ValidationRules
  ngOnInit() {
    this.validationSet = this.validationRules[this.field as ValidationKeys]
  }
}
