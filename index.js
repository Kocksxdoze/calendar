let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let rangeStart;
let rangeEnd;
let data;

function dateRange() {
  const startDate = new Date(currentYear, currentMonth, 1)
    .toISOString()
    .split("T")[0];
  const endDate = new Date(currentYear, currentMonth + 1, 0)
    .toISOString()
    .split("T")[0];
  rangeStart = `range_start=${startDate}`;
  rangeEnd = `range_end=${endDate}`;
}
dateRange();

// data fetcher
function loadData() {
  let xhr = new XMLHttpRequest();
  xhr.open(
    "GET",
    `http://bb.bizclimb.com/ajax_dates.php?${rangeStart}&${rangeEnd}`,
    true
  );
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        data = JSON.parse(xhr.responseText);
        console.log(data);
        Calendar();
      } else {
        console.error("Error data fetch: " + xhr.status);
      }
    }
  };
  xhr.send();
}

// Calendar main function
function Calendar() {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const today = new Date().getDate(); // for dot on number

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startingDay = firstDayOfMonth.getDay();

  document.getElementById("month-year").innerHTML =
    monthNames[currentMonth] + " " + currentYear;

  let calendarDaysHTML = "";
  const todayDate = new Date(currentYear, currentMonth, today);
  const isCurrentMonth = currentMonth === new Date().getMonth();

  for (let i = 0; i < startingDay; i++) {
    calendarDaysHTML += "<span></span>";
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(currentYear, currentMonth, i);
    const dateString = currentDate.toISOString().split("T")[0];
    let clickable = false;

    if (isCurrentMonth && currentDate < todayDate) {
      clickable = false;
    } else {
      const foundDate = data.find((item) => item.date === dateString);
      if (foundDate) {
        clickable = true;
      }
    }

    let dayClass = clickable ? "clickable" : "unclickable";
    if (i === today && isCurrentMonth) {
      if (!clickable) {
        dayClass = "unclickable";
        calendarDaysHTML += `<span class='${dayClass}' data-date='${dateString}'>${i}<span class='dot-unclickable'></span></span>`;
      } else {
        dayClass = "day";
        calendarDaysHTML += `<span class='${dayClass}' data-date='${dateString}'>${i}<span class='dot'></span></span>`;
      }
    } else {
      calendarDaysHTML += `<span class='${dayClass}' data-date='${dateString}'>${i}</span>`;
    }
  }

  document.getElementById("calendar-days").innerHTML = calendarDaysHTML;
  setupDay();
}

updatingPrevButton();

//functions to swap month
function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  updatingPrevButton();
  dateRange();
  loadData();
  loadingFunction();
}
function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  updatingPrevButton();
  dateRange();
  loadData();
  loadingFunction();
}

//loader for calendar months
function loadingFunction() {
  let loader = document.querySelector(".loader");
  let dayButtons = document.querySelectorAll(".day, .future-day");
  let calendar = document.querySelector(".calendar");

  loader.style.display = "block";
  calendar.style.opacity = "0.6";

  dayButtons.forEach(function (button) {
    button.style.pointerEvents = "none";
    button.style.color = "gray";
    button.style.backgroundColor = "transparent";
  });
  setTimeout(function () {
    dayButtons.forEach(function (button) {
      button.style.pointerEvents = "";
      button.style.color = "#0060e6";
      button.style.backgroundColor = "";
    });
    calendar.style.opacity = 1;
    loader.style.display = "none";
  }, 3500);
}

// function for check month now and if the month < month now button prev will be disabled
function updatingPrevButton() {
  let prevButton = document.querySelector(".prev");
  let now = new Date();

  if (currentMonth <= now.getMonth()) {
    prevButton.style.pointerEvents = "none";
    prevButton.style.color = "gray";
  } else {
    prevButton.style.pointerEvents = "";
    prevButton.style.color = "#0060e6";
  }
}

// main function for hidden elements that appear, back button and time marks
function showInfo(day) {
  let infoDiv = document.querySelector(".day-info ");

  let selectedDate = new Date(currentYear, currentMonth, day);
  let dayOfWeek = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
  let monthName = selectedDate.toLocaleDateString("en-US", { month: "long" });

  let infoText = "";

  let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    infoText +=
      `<div class="fixed-dates">` +
      `<p class='week-day'>` +
      dayOfWeek +
      "</p>" +
      "<br/> " +
      '<p class="other-settings">' +
      monthName +
      " " +
      day +
      ", " +
      currentYear +
      "</p>" +
      "</div>" +
      "\n" +
      '<h2 class="time-select">Select a Time</h2>';
  } else {
    infoText +=
      `<div class="fixedDateDiv">` +
      `<p class="fixedDate">` +
      day +
      " " +
      monthName +
      ", " +
      dayOfWeek +
      `</p>` +
      `</div>` +
      "\n";
  }

  let daysdisable = document.querySelector("calendar-days");
  if (Array.isArray(data) && data.length > 0) {
    let selectedDayTimes = data
      .map((item) => {
        if (item.date === selectedDate.toISOString().split("T")[0]) {
          return item.spots
            .map((time) => {
              return (
                '<div class="button-row"><button class="time-button">' +
                time.split(" ")[1] +
                "</button></div>"
              );
            })
            .join("\n");
        }
        return "";
      })
      .filter((time) => time !== "");
    if (selectedDayTimes.length > 0) {
      infoText += selectedDayTimes.join("\n");
    } else {
      infoText.style.display = "none";
      daysdisable.style.color = "gray";
    }
  } else {
    console.error("Data array is undefined");
  }
  infoDiv.innerHTML = infoText;

  let buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("buttons-container");
  let buttonRows = document.querySelectorAll(".button-row");
  buttonRows.forEach(function (buttonRow) {
    buttonsContainer.appendChild(buttonRow.cloneNode(true)); // Клонируем и добавляем каждый div .button-row в новый div
    buttonRow.parentNode.removeChild(buttonRow); // Удаляем оригинальный div .button-row
  });
  let dayInfo = document.querySelector(".day-info");
  dayInfo.appendChild(buttonsContainer);

  let currentInfoDiv = document.querySelector(".day-info");

  if (currentInfoDiv) {
    currentInfoDiv.remove();
  }

  document.querySelector(".calendar-main").appendChild(infoDiv).style.display =
    "block";

  let backButton = document.querySelector(".back-button");
  if (window.innerWidth < 800) {
    backButton.style.display = "block";
  }

  let timeButtons = document.querySelectorAll(".time-button");
  timeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      timeButtons.forEach(function (btn) {
        btn.disabled = false;
        btn.classList.remove("disabled");
      });

      let currentNextButtons = document.querySelectorAll(".next-button");
      currentNextButtons.forEach(function (nextButton) {
        nextButton.remove();
      });

      let timeSlot = button.closest(".button-row");
      let nextButton = document.createElement("button");
      nextButton.textContent = "NEXT";
      nextButton.classList.add("next-button");
      nextButton.addEventListener("click", function () {
        let selectedTime = button.innerText;
        let meetingTimeDiv = document.querySelector(".meeting-time");

        meetingTimeDiv.style.borderRight = "1px solid rgba(26, 26, 26, 0.1)";
        meetingTimeDiv.style.paddingRight = "30px";
        meetingTimeDiv.style.paddingLeft = "30px";

        let remainingTime = TimeCalculator(selectedTime);
        meetingTimeDiv.textContent = remainingTime;
      });

      timeSlot.appendChild(nextButton);

      button.disabled = true;
      button.classList.add("disabled");
    });
  });
}

let meetingTime = document.querySelector("#meeting-time");
if (meetingTime) {
  let infoPanelName = document.createElement("p");
  let infoPanelElement = document.createElement("h3");
  let divContainer = document.createElement("div");
  let svgText = document.createTextNode("15 Min.");
  const svgElement = new Image();

  divContainer.setAttribute("id", "svg-and-text");
  infoPanelElement.classList.add("id", "info-text");
  infoPanelName.setAttribute("id", "info-name");

  svgElement.src = "img/clocks.svg";
  svgElement.alt = "Clocks Image";

  svgElement.width = 20;
  svgElement.height = 20;

  const pathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathElement.setAttribute("fill", "rgba(26, 26, 26, 0.61)");
  pathElement.setAttribute("fill-rule", "evenodd");
  pathElement.setAttribute(
    "d",
    "M3 10a7 7 0 1114 0 7 7 0 01-14 0zm7-9a9 9 0 100 18 9 9 0 000-18zm1 5a1 1 0 10-2 0v4.032l-2.64 2.2a1 1 0 101.28 1.536l3-2.5A1 1 0 0011 10.5V6z"
  );

  svgElement.appendChild(pathElement);
  meetingTime.appendChild(svgElement);

  divContainer.appendChild(svgElement);
  divContainer.appendChild(svgText);

  meetingTime.style.borderRight = "1px solid rgba(26, 26, 26, 0.1)";
  meetingTime.style.paddingRight = "100px";
  meetingTime.style.paddingLeft = "30px";

  infoPanelName.textContent = "Marija Ilic";
  infoPanelElement.textContent = "15 Minutes";
  meetingTime.appendChild(infoPanelName);
  meetingTime.appendChild(infoPanelElement);
  meetingTime.appendChild(divContainer);
}

// time calculator for meeting-time div
function TimeCalculator(selectedTime) {
  let currentTime = new Date();
  let selectedDateTime = new Date();
  let [hours, minutes] = selectedTime.split(":");
  selectedDateTime.setHours(hours, minutes, 0, 0);

  if (selectedDateTime < currentTime) {
    selectedDateTime.setDate(selectedDateTime.getDate() + 1);
  }

  let timeDiff = selectedDateTime.getTime() - currentTime.getTime();

  let daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  let hoursRemaining = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  let minutesRemaining = Math.floor(
    (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
  );
  let infoPanel = document.querySelector(".meeting-time");
  let infoPanelName = document.createElement("p");
  let infoPanelElement = document.createElement("p");
  let svgText = document.createTextNode(`${minutesRemaining} Min.`);
  let divContainer = document.createElement("div");
  const svgElement = new Image();

  infoPanelName.setAttribute("id", "info-name");
  infoPanelElement.setAttribute("id", "infoPanelText");
  divContainer.setAttribute("id", "svg-and-text");

  svgElement.src = "img/clocks.svg";
  svgElement.alt = "Clocks Image";

  svgElement.width = 20;
  svgElement.height = 20;

  const pathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathElement.setAttribute("fill", "rgba(26, 26, 26, 0.61)");
  pathElement.setAttribute("fill-rule", "evenodd");
  pathElement.setAttribute(
    "d",
    "M3 10a7 7 0 1114 0 7 7 0 01-14 0zm7-9a9 9 0 100 18 9 9 0 000-18zm1 5a1 1 0 10-2 0v4.032l-2.64 2.2a1 1 0 101.28 1.536l3-2.5A1 1 0 0011 10.5V6z"
  );

  svgElement.appendChild(pathElement);
  infoPanel.appendChild(svgElement);

  svgElement.onload = function loader() {
    infoPanelName.textContent = "Marija Ilic ";
    if (hoursRemaining < 1) {
      infoPanelElement.textContent += `${minutesRemaining} Minutes Meeting.`;
    } else {
      infoPanelElement.textContent += ` ${hoursRemaining} Hours and ${minutesRemaining} Minutes Meeting.`;
    }

    divContainer.appendChild(svgElement);
    divContainer.appendChild(svgText);

    infoPanel.appendChild(infoPanelName);
    infoPanel.appendChild(infoPanelElement);
    infoPanel.appendChild(divContainer);
  };

  if (daysRemaining === 0) {
    if (hoursRemaining < 1) {
      return document.addEventListener("DOMContentLoaded", function () {
        let div = document.createElement("div");
        div.setAttribute("id", "clock-svg");
        document.getElementById("clock-svg").appendChild(infoPanel);

        loader();
      });
    } else {
      return document.addEventListener("DOMContentLoaded", function () {
        let div = document.createElement("div");
        div.setAttribute("id", "clock-svg");
        document.getElementById("clock-svg").appendChild(infoPanel);

        loader();
      });
    }
  } else {
    return (
      daysRemaining +
      " Days, " +
      hoursRemaining +
      " Hours and " +
      minutesRemaining +
      " Minutes Meeting."
    );
  }
}

// creating div and time selection menu
function setupDay() {
  let days = document.querySelectorAll(".calendar-days span");
  days.forEach(function (day) {
    if (day.classList.contains("past-day")) {
      day.classList.add("disabled-day");
      day.addEventListener("click", function () { });
    } else {
      day.addEventListener("click", function () {
        showInfo(this.textContent);
        if (window.innerWidth < 768) {
          document.querySelector(".calendar").style.display = "none";
        }
      });
    }
  });
}

// mobile arrow back button onclick
let backButton = document.querySelector(".back-button");
backButton.addEventListener("click", function () {
  document.querySelector(".day-info").style.display = "none";
  document.querySelector(".calendar").style.display = "block";
  this.style.display = "none";
});

// Data timing loading
function loadDataAndSetupHandlers() {
  loadData();

  setTimeout(setupDay, 4000);
}
loadDataAndSetupHandlers();

// css main loader
document.addEventListener("DOMContentLoaded", function () {
  let calendar = document.querySelector(".calendar");
  let loader = document.querySelector(".loader");
  let dayButtons = document.querySelectorAll(".day, .future-day");

  dayButtons.forEach(function (button) {
    button.style.pointerEvents = "none";
    button.style.color = "gray";
    button.style.backgroundColor = "transparent";
  });

  setTimeout(function () {
    Calendar();
    dayButtons.forEach(function (button) {
      button.style.pointerEvents = "";
      button.style.color = "#0060e6";
      button.style.backgroundColor = "";
    });
    calendar.style.opacity = 1;
    loader.style.display = "none";
  }, 5000);
});

// js adaptive changes for PC, laptop, phone and tablet
let meetingTimeDivCreated = false;
window.addEventListener("resize", function () {
  let calendarMain = document.querySelector(".calendar-main");
  let calendar = document.querySelector(".calendar");
  let dayInfo = document.querySelector(".day-info");
  let meetingTimeDiv = document.querySelector(".meeting-time");
  let mainDiv = document.querySelector(".main");
  let backButton = document.querySelector(".back-button");
  let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (window.innerWidth < 1024 && window.innerWidth > 800) {
    mainDiv.insertBefore(meetingTimeDiv, mainDiv.firstChild);
    mainDiv.style.flexDirection = "column";
    mainDiv.style.gap = "10px";
    mainDiv.style.border = "1px solid rgba(26, 26, 26, 0.1)";
    mainDiv.style.boxShadow = "0 1px 8px 0 rgb(0 0 0/8%)";
    calendarMain.style.border = "none";
    calendarMain.style.boxShadow = "none";
    calendarMain.style.flexWrap = "nowrap";
    mainDiv.style.width = "700px";
    calendar.style.display = "block";
    meetingTimeDiv.style.borderRight = "none";
    meetingTimeDiv.style.borderBottom = "1px solid rgba(26, 26, 26, 0.1)";
    meetingTimeDiv.style.paddingBottom = "45px";
    meetingTimeDiv.style.paddingLeft = "30px";
  } else if (window.innerWidth < 800) {
    calendarMain.insertBefore(meetingTimeDiv, calendarMain.firstChild);
    calendarMain.style.flexDirection = "column";
    meetingTimeDiv.style.borderRight = "none";
    meetingTimeDiv.style.width = "100%";
    calendar.style.width = "auto";

    if (dayInfo.style.display == "block") {
      calendar.style.display = "none";
      backButton.style.display = "block";
    } else {
      calendar.style.display = "block";
    }
  } else {
    calendarMain.insertBefore(meetingTimeDiv, calendarMain.firstChild);
    mainDiv.style.width = "auto";
    mainDiv.style.flexDirection = "row";
    mainDiv.style.border = "none";
    mainDiv.style.boxShadow = "none";
    calendarMain.style.border = "1px solid rgba(26, 26, 26, 0.1)";
    calendarMain.style.boxShadow = "0 1px 8px 0 rgb(0 0 0/8%)";
    calendarMain.style.flexFlow = "";
    calendar.style.display = "block";
    meetingTimeDiv.style.borderRight = "1px solid rgba(26, 26, 26, 0.1)";
  }
});
