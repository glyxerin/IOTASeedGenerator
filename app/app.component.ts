import {Component, OnInit} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  randomIOTASeed = '';
  changedRandomIOTASeed = '';

  changedPositionData = [];

  showClipboardContent = false;
  randomSeedCopiedToClipboard = false;

  subscription: Subscription;

  currentMousemoveCoordinates = [];

  currentPercentage = 0;

  settings = {
    options: 1
  };

  ngOnInit() {
    console.log('IOTA seed generator v0.43 2018/01/28');
    document.body.onpaste = function(e) {
      document.getElementById('clipboard-text').innerText = e.clipboardData.getData("Text");
      e.preventDefault();
    };
  }

  setClipboardTextElementContent(text: string) {
    document.getElementById('clipboard-text').innerText = text;
  }

  copyRandomIOTASeed() {
    this.randomSeedCopiedToClipboard = true;
  }

  generateRandomIOTASeedWithMouseMove() {
    this.subscription =
      Observable.fromEvent(document, 'mousemove')
        .subscribe(e => {
          const offsetX: any = (e as any).offsetX;
          const offsetY: any = (e as any).offsetY;

          this.currentMousemoveCoordinates.push(
            {
              offsetX: offsetX,
              offsetY: offsetY
            }
          );

          if (this.currentMousemoveCoordinates.length > 15) {
            const sumValue = this.sumUpCurrentMouseCoordinates(this.currentMousemoveCoordinates);

            this.addNewCharToRandomIOTASeedString(sumValue % 26);

            this.currentPercentage = this.calculateCurrentPercentage(this.randomIOTASeed.length);
            this.currentMousemoveCoordinates = [];

            if (this.randomIOTASeed.length > 80) {
              this.subscription.unsubscribe();
            }
          }
        });
  }

  sumUpCurrentMouseCoordinates(currentMousemoveCoordinates: Array<any>): number {
    let result = 0;

    for (const singleCoordinate of currentMousemoveCoordinates) {
      result = result + singleCoordinate.offsetX + singleCoordinate.offsetY;
    }

    return result;
  }

  calculateCurrentPercentage(currentSeedLength: number): number {
    let result = 0;

    if (currentSeedLength > 80) {
      result = 100;
    } else {
      result = Math.floor((currentSeedLength / 81) * 100);
    }

    return result;
  }

  readClipboard() {
    this.showClipboardContent = true;
  }

  resetData() {
    this.randomIOTASeed = '';
    this.changedRandomIOTASeed = '';
    this.changedPositionData = [];

    this.showClipboardContent = false;
    this.randomSeedCopiedToClipboard = false;

    this.currentPercentage = 0;

    this.setClipboardTextElementContent('');
  }

  addNewCharToRandomIOTASeedString(position: number) {
    const allowedChars = '9ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    this.randomIOTASeed += allowedChars[position];
  }

  generateRandomIOTASeed() {
    this.resetData();

    const allowedChars = '9ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';

    for (let i = 81; i > 0; --i) {
      result += allowedChars[Math.round(Math.random() * (allowedChars.length - 1))];
    }
    this.randomIOTASeed = result;
    this.changedRandomIOTASeed = result;
  }

  generateChangedPositionData() {
    this.changedPositionData = this.compareIOTASeedStrings(this.randomIOTASeed, this.changedRandomIOTASeed);
  }

  compareIOTASeedStrings(srcString, dstString) {
    const result = [];

    for (let i = 0; i < srcString.length; i++) {

      if (srcString[i] !== dstString[i]) {
        result.push(
          {
            position: i,
            srcChar: srcString[i],
            dstChar: dstString[i]
          }
        );
      }
    }
    return result;
  }
}
