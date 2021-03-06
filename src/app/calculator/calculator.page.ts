import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ClientDataService } from '../services/client-data.service';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.page.html',
  styleUrls: ['./calculator.page.scss'],
})
export class CalculatorPage {
  today = new Date()
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .split('/')
    .reverse()
    .join('-');
  clientID = '';
  linkData = {} as any;
  recordId: any;
  timePeriodObject: { d: number; m: number; y: number; tm: number };
  interestObj: {
    interest: number;
    newPrincipal?: number;
    newInterest?: number;
    tm?: number;
  };
  advIntShow = false;
  showCalculatedData = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private clientsDataService: ClientDataService,
    private toastController: ToastController
  ) {}

  ionViewWillEnter() {
    this.activatedRoute.params.subscribe((params) => {
      this.clientID = params.key;
      this.recordId = params.id;

      if (this.clientID !== '0') {
        this.clientsDataService.getClientByKey(this.clientID).then((res) => {
          this.linkData = res.data.find((record) => record.id == this.recordId);
          this.linkData.name = res.name;
          this.linkData.endDate = this.today;
        });
      }
      this.linkData.endDate = this.today;
    });
  }

  onSubmit(formRef) {
    if (formRef.valid) {
      this.timePeriodObject = this.clientsDataService.calculateTimeperiod(
        formRef.value.startDate,
        formRef.value.endDate
      );

      if (!isNaN(this.timePeriodObject.d)) {
        this.interestObj = this.clientsDataService.calcaulateInterest(
          formRef.value.principal,
          this.timePeriodObject.tm,
          formRef.value.interest
        );

        this.showCalculatedData = true;
        this.presentToast();
        this.advIntShow = this.interestObj.newInterest ? true : false;
      } else {
        this.showCalculatedData = false;
        this.dateInputErrorAlert();
      }
    }
  }

  dateInputErrorAlert() {
    const alert = document.createElement('ion-alert');
    alert.header = 'Please check the dates';
    alert.message = 'End date should be greater than Start Date';
    alert.buttons = ['Ok'];

    document.body.appendChild(alert);
    return alert.present();
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Interest Calculated Successfully',
      duration: 1500,
      position: 'top',
    });
    toast.present();
  }

  currencyFormat(value) {
    const formattedValue = new Intl.NumberFormat('en-IN').format(
      value.toFixed(2)
    );
    return `??? ${formattedValue}`;
  }
}
