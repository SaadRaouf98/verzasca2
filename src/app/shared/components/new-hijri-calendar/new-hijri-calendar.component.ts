import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';

import * as moment from 'moment-hijri';
import 'moment-hijri';

@Component({
  selector: 'app-new-hijri-calendar',
  templateUrl: './new-hijri-calendar.component.html',
  styleUrls: ['./new-hijri-calendar.component.scss'],
})
export class NewHijriCalendarComponent implements OnInit {
  selectedDate: Date | null = null;

  constructor(
    private dialogRef: MatDialogRef<NewHijriCalendarComponent>,
    private elementRef: ElementRef,
    private toastr: CustomToastrService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      maxDate: Date | null;
      editable: boolean;
      selectedDate: Date | null;
    }
  ) {
    this.selectedDate = data.selectedDate;
  }

  createHijriDate(hijriYear: number, hijriMonth: number, hijriDay: number) {
    const hijriDate = moment('1446-06-01', 'iYYYY-iM-iD').locale('en');
    // Convert to Gregorian
    const gregorianDate = new Date(hijriDate.format('YYYY-MM-DD'));
  }

  ngOnInit() {
    //this.createHijriDate(1446, 1, 1);
    //@ts-ignore
    // document.getElementById('currentYear').innerText = new Date().getFullYear();

    // Umm Al Qura Calendar
    let gYearSelect = document.getElementById('gYear');
    let gMonthSelect = document.getElementById('gMonth');

    let now = new Date();
    for (let i = now.getFullYear() - 100; i <= now.getFullYear() + 200; i++) {
      let gOptionYear = document.createElement('option');
      //@ts-ignore
      gOptionYear.value = i;
      //@ts-ignore
      gOptionYear.text = i;
      if (i === now.getFullYear()) gOptionYear.selected = true;
      //@ts-ignore
      gYearSelect.appendChild(gOptionYear);
    }

    for (let i = 1; i <= 12; i++) {
      let gOptionMonth = document.createElement('option');
      //@ts-ignore
      gOptionMonth.value = i - 1;
      gOptionMonth.text = new Intl.DateTimeFormat('ar-US', {
        month: 'long',
      }).format(new Date(now.getFullYear(), i - 1, 1));
      if (i === now.getMonth() + 1) gOptionMonth.selected = true;
      //@ts-ignore
      gMonthSelect.appendChild(gOptionMonth);
    }

    //@ts-ignore
    gYearSelect.addEventListener('change', this.generateCalendar.bind(this));
    //@ts-ignore
    gMonthSelect.addEventListener('change', this.generateCalendar.bind(this));

    if (this.selectedDate) {
      let gMonthSelect = document.getElementById('gMonth');
      //@ts-ignore
      gMonthSelect.value = this.selectedDate.getMonth();

      let gYearSelect = document.getElementById('gYear');
      //@ts-ignore
      gYearSelect.value = this.selectedDate.getFullYear();
    }

    this.generateCalendar();
    this.displayCurrentSelectedDate();

    var styleTage = document.createElement('style');
    styleTage.type = 'text/css';
    styleTage.textContent = `
      :root {
  --green-color: #00a362;
  --dark-green-color: #007244;
  --gray-light-color: #f2f4fa;
  --white-color: #ffffff;
  --black-color: #000000;
  --text-color: #000000;
  --border-color: #ccc;
}

body.dark-mode {
  --green-color: #00a362;
  --dark-green-color: #007244;
  --gray-light-color: #1f2020;
  --white-color: #0c0c0c;
  --black-color: #000000;
  --text-color: #ffffff;
  --border-color: #ccc;
}

header {
  color: var(--white-color);
  text-align: center;
  padding: 10px;
  background-color: var(--green-color);
}

header h1 {
  font-size: 28px;
  font-weight: 600;
}

p {
  font-size: 17px;
  line-height: 1.5em;
}



.menu-toggle {
  display: none;
  cursor: pointer;
  font-size: 20px;
  color: var(--white-color);
  padding: 8px;
  border-radius: 5px;
  background-color: var(--green-color);
}

.menu-toggle i {
  margin-right: 5px;
}

nav a {
  color: var(--white-color);
  text-decoration: none;
  padding: 8px;
  border-radius: 5px;
  transition: color 0.3s;
}

nav a:hover {
  color: var(--white-color);
  background-color: var(--green-color);
}

.main-btn {
  cursor: pointer;
  display: inline;
  align-items: center;
  color: var(--white-color);
}

.main-btn > span {
  font-size: 20px;
  font-weight: 600;
  padding: 7px;
  margin-right: 5px;
  border-radius: 5px;
  background-color: var(--green-color);
}

.dark-mode-btn {
  font-size: 20px;
  cursor: pointer;
  display: inline;
  align-items: center;
  color: var(--white-color);
  padding: 7px;
  border-radius: 5px;
  background-color: var(--green-color);
}

.body-content {
  max-width: 1200px;
  //box-shadow: 0 3px 10px rgb(0 0 0 / 0.2);
  border-radius: 10px;
  padding: 20px;
  margin-top: -4em;
}

#calendarHeader {
  text-align: center;
  margin: 0px;
  padding: 15px 0px;
  border-radius: 5px 5px 0px 0px;
  background-color: var(--green-color); /* Set background color to green */
}
  #islamicDate{
  flex-basis: 30%;
  text-align: right;
  }

    #gregorianDate{
    flex-basis: 30%;
    text-align: left;
  }
   
#dateInfo {
  font-size: 17px;
  color: var(--white-color);
  margin: 10px 20px 20px 20px;
  align-items: center;
  display: flex; /* Add flex display */
  justify-content: space-between; /* Align items with space in between */
}

#todayButtonContainer {
  text-align: center;
}
#todayButton {
flex-basis: 30%;
  cursor: pointer;
  font-size: 17px;
  color: var(--white-color);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  padding: 5px;
  background-color: var(--green-color);
  transition: background-color 0.3s;
}

#todayButton:hover {
  background-color: var(--text-color);
}

.nav-icon {
  font-size: 22px;
  font-weight: 600;
  color: var(--white-color);
  cursor: pointer;
  margin: 0 5px;
  transition: color 0.3s;
}

.nav-icon:hover {
  color: var(--text-color);
}

#gMonth {
  font-size: 18px;
  padding: 5px;
  margin-left: 8px;
}
#gYear {
  font-size: 18px;
  padding: 5px;
  margin-right: 8px;
}

select {
  margin: 0 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--white-color);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

td {
  padding: 8px;
  text-align: center;
}

th {
  font-size: 17px;
  font-weight: 600;
  background-color: var(--gray-light-color);
  color: var(--text-color);
  padding: 10px;
}
tr {
  border: 1px solid var(--border-color);
}

.today {
  color: var(--black-color);
  background-color: #ff0;
}




/* Responsive styles */
@media only screen and (max-width: 768px) {
  nav {
    padding: 5px;
  }

  .menu-toggle {
    display: block;
  }

  nav a {
    margin-top: 10px;
  }

  .menu-items {
    display: none;
    position: absolute;
    top: 130px;
    left: 0;
    right: 0;
    background-color: var(--dark-green-color);
    border-radius: 5px;
    padding: 10px;
  }

  .menu-items a {
    display: block;
    margin-bottom: 8px;
  }

  .menu-toggle.active + .menu-items {
    display: block;
  }
  .body-content {
    max-width: 90%;
    padding: 15px;
  }

  .main-btn > span {
    margin-right: 0px;
  }
  #navigationIcons {
    padding: 5px;
  }

  .nav-icon {
    font-size: 18px;
  }

  #gMonth,
  #gYear {
    font-size: 16px;
    margin: 5px;
  }

  #todayButton {
    font-size: 18px;
    padding: 4px 6px 4px 6px;
  }

  th,
  td {
    padding: 6px;
  }

  th {
    font-size: 16px;
    padding: 8px;
  }
}

@media only screen and (max-width: 600px) {
  header h1 {
    font-size: 25px;
  }
  nav {
    padding: 3px;
  }
  .menu-toggle {
    font-size: 18px;
    padding: 6px;
  }
  .main-btn > span {
    font-size: 18px;
    padding: 6px;
  }
  .dark-mode-btn {
    font-size: 18px;
    padding: 6px;
  }
  .body-content {
    max-width: 90%;
    padding: 10px;
  }
  #dateInfo {
    font-size: 13px;
    margin: 10px 10px 10px 10px;
  }
}

@media only screen and (max-width: 370px) {
  header h1 {
    font-size: 22px;
  }
  #calendarHeader {
    padding: 10px 0px;
  }
  #todayButton {
    font-size: 16px;
  }
  #dateInfo {
    margin: 5px 10px 8px 8px;
  }
  .nav-icon {
    font-size: 16px;
    font-weight: 500;
    margin: 0 3px;
  }
  #gMonth {
    font-size: 16px;
    padding: 2px;
    margin-left: 0px;
  }
  #gYear {
    font-size: 16px;
    padding: 2px;
    margin-left: 0px;
  }

  td {
    padding: 5px;
  }

  th {
    font-size: 16px;
    padding: 5px;
  }
}

.selected{
color: white;
background-color: green;
}
    `;

    this.elementRef.nativeElement.appendChild(styleTage);
  }

  displayCurrentSelectedDate() {
    if (this.selectedDate) {
      let gregorianDate = document.getElementById('gregorianDate');
      let islamicDate = document.getElementById('islamicDate');

      // Display Gregorian and Islamic dates
      let formattedGregorianDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(
        new Date(
          this.selectedDate?.getFullYear(),
          this.selectedDate?.getMonth(),
          this.selectedDate?.getDate()
        )
      );

      let formattedIslamicDate = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(
        new Date(
          this.selectedDate?.getFullYear(),
          this.selectedDate?.getMonth(),
          this.selectedDate?.getDate()
        )
      );
      //@ts-ignore
      gregorianDate.textContent = formattedGregorianDate;
      //@ts-ignore
      islamicDate.textContent = formattedIslamicDate;
    }
  }

  selectCell() {
    let calendar = document.getElementById('calendar');
    let gYearSelect = document.getElementById('gYear');
    let gMonthSelect = document.getElementById('gMonth');

    var arr = [...Array.from(calendar!.children)];
    arr.forEach((tr, index) => {
      if (index !== 0) {
        const tdArr = [...Array.from(tr!.children)];
        tdArr.forEach((td) => {
          if (td) {
            if (td.childNodes.length) {
              const dayNum = parseInt(
                //@ts-ignore
                td.childNodes[0].childNodes[0].innerHTML
              );

              const selectedDateDay = this.selectedDate?.getDate();
              const selectedDateMonth = this.selectedDate?.getMonth();
              const selectedDateYear = this.selectedDate?.getFullYear();

              if (
                dayNum === selectedDateDay &&
                //@ts-ignore
                parseInt(gMonthSelect!.value) === selectedDateMonth &&
                //@ts-ignore
                parseInt(gYearSelect!.value) === selectedDateYear
              ) {
                td.classList.add('selected');
              }
            }
          }
        });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  changeYear(delta: any) {
    let gYearSelect = document.getElementById('gYear');
    //@ts-ignore
    gYearSelect.value = parseInt(gYearSelect.value) + delta;
    this.generateCalendar();
  }

  changeMonth(delta: any) {
    let gMonthSelect = document.getElementById('gMonth');
    //@ts-ignore
    gMonthSelect.value = (parseInt(gMonthSelect.value) + delta + 12) % 12;
    this.generateCalendar();
  }

  goToToday() {
    let now = new Date();
    let todayYear = now.getFullYear();
    let todayMonth = now.getMonth();
    let gYearSelect = document.getElementById('gYear');
    let gMonthSelect = document.getElementById('gMonth');

    //@ts-ignore
    gYearSelect.value = todayYear;
    //@ts-ignore
    gMonthSelect.value = todayMonth;

    this.generateCalendar();
  }

  generateCalendar() {
    let calendar = document.getElementById('calendar');
    let gYearSelect = document.getElementById('gYear');
    let gMonthSelect = document.getElementById('gMonth');
    let now = new Date();
    //@ts-ignore
    while (calendar?.rows.length > 1) {
      //@ts-ignore
      calendar.deleteRow(1);
    }
    //@ts-ignore
    let gYear = parseInt(gYearSelect.value);
    //@ts-ignore
    let gMonth = parseInt(gMonthSelect.value);
    let firstDay = new Date(gYear, gMonth, 1).getDay();
    let daysInMonth = new Date(gYear, gMonth + 1, 0).getDate();
    let day = 1;

    for (let i = 0; i < 6; i++) {
      let row = document.createElement('tr');
      for (let j = 0; j < 7; j++) {
        let cell = document.createElement('td');
        if ((i > 0 || j >= firstDay) && day <= daysInMonth) {
          let date = new Date(gYear, gMonth, day);
          cell.onclick = () =>
            this.onSelectCell(
              date,
              cell,
              new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
              }).format(date)
            );

          let iUmmAlQura = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
            day: 'numeric',
            month: 'numeric',
          }).format(date);

          cell.innerHTML =
            '<span style="cursor: pointer;"><div class="gregorian">' +
            day +
            '</div>' +
            iUmmAlQura +
            '</span>';
          if (day === now.getDate() && gMonth === now.getMonth() && gYear === now.getFullYear()) {
            cell.className = 'today';
          }
          day++;
        }
        row.appendChild(cell);
      }

      //@ts-ignore
      calendar.appendChild(row);
      if (day > daysInMonth) break;
    }

    //Check to see if there is a selected date, Color it
    this.selectCell();
  }

  onSelectCell(gregorianDate: Date, cell: HTMLTableCellElement, hijriDate?: string) {
    if (!this.data.editable) {
      return;
    }

    if (this.data.maxDate && gregorianDate > this.data.maxDate) {
      this.toastr.warning('عفوا , لايمكن اختيار تاريخ اكبر من تاريخ اليوم');
      return;
    }

    //Remove class 'selected' from all cells
    let calendar = document.getElementById('calendar');
    var arr = [...Array.from(calendar!.children)];
    arr.forEach((tr) => {
      const tdArr = [...Array.from(tr!.children)];
      tdArr.forEach((td) => {
        if (td && td.classList.contains('selected')) {
          td.classList.remove('selected');
        }
      });
    });
    //Add class 'selected' for selected cell
    cell.classList.add('selected');
    this.selectedDate = gregorianDate;

    this.displayCurrentSelectedDate();
  }

  onSubmit(): void {
    const hijriDateString = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).format(this.selectedDate!);
    // Step 1: Remove ' AH' and split the string by '/'
    const dateParts = hijriDateString.replace(' AH', '').split('/');

    // Step 2: Reorder the parts to match 'DD/MM/YYYY'
    const reorderedDate = `${dateParts[2]}/${dateParts[0]}/${dateParts[1]}`;

    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data: {
        selectedGregorianDate: this.selectedDate,
        selectedHijriDate: reorderedDate,
      },
    });
  }
}
