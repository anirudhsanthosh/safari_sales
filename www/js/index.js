/********************
 *  globals
 *
 * ********************** */

safari = new Safari();
const USER = "safari_user";
const LOGIN = "safari_login";
const SALES_OVERVIEW = "sales_overview";
const user = {};

/***********************
 *
 *        user and logging functions
 *
 *
 * ************************** */

user.set = (obj) => {
  if (typeof obj != "object") return false;
  let user = {};
  if (isJson(localStorage.getItem(USER))) {
    user = isJson(localStorage.getItem(USER));
  }
  user = { ...user, ...obj };
  localStorage.setItem(USER, JSON.stringify(user));
  return user;
};

user.get = function (prop = "") {
  const user = isJson(localStorage.getItem(USER));

  if (prop === "") return user;
  if (!user) return false;
  if (user[prop]) return user[prop];
  return false;
};

const isLoggedIn = () => {
  let loggedStatus = false;
  if (isJson(localStorage.getItem(LOGIN))) {
    loggedStatus = isJson(localStorage.getItem(LOGIN)).status;
  }
  if (user.get() && loggedStatus) return true;
  return false;
};

const logOut = () => {
  localStorage.clear();

  const navigator = document.querySelector("#navigator");
  navigator.resetToPage("login.html");
  document.querySelector("#menu").close();
  document.querySelector("#menu").removeAttribute("swipeable");
  return true;
};

/************************
 *
 * global ons event listners
 *
 *
 */

document.addEventListener("init", function (event) {
  // console.log("init called");
});

ons.ready(() => {
  // setting local push notification
  console.log(navigator);
  if (navigator) {
    //navigator.splashscreen.hide();
  }

  if (!localStorage.pushNotification) {
    if (!cordova.plugins.notification.local) return;
    cordova.plugins.notification.local.schedule({
      id: 1515151 * Math.round(Math.random * 1000),
      title: "Sale Report Reminder",
      text: "Please send sale report before 8.05 PM....",
      foreground: false,
      vibrate: true,
      trigger: { every: { hour: 20, minute: 0 }, count: 1000 },
    });

    localStorage.pushNotification = 1;
  }

  cordova.plugins.notification.local.on("click", console.log);
  cordova.plugins.notification.local.getScheduled((e) => {
    if (e.length == 0) {
      //localStorage.removeItem("pushNotification");
      cordova.plugins.notification.local.schedule({
        id: 1515151 * Math.round(Math.random * 1000),
        title: "Sale Report Reminder",
        text: "Please send sale report before 8.05 PM....",
        foreground: true,
        vibrate: true,
        trigger: { every: { hour: 20, minute: 0 }, count: 1000 },
      });
      console.log("notification list is empty");
    }
  });
  showModal();
  const navigatr = document.querySelector("#navigator");
  if (isLoggedIn()) {
    navigatr.resetToPage("home.html");
  } else {
    navigatr.resetToPage("login.html");
  }
  // disable landscape
  window.screen.orientation.lock("portrait");
});

const openMenu = () => {
  document.querySelector("#menu").open();
};
// controlling page title while changing tabs
document.addEventListener("prechange", ({ target, tabItem }) => {
  console.log("prechange called");
  if (target.matches("#tabbar")) {
    document.querySelector(
      "#home-toolbar .center"
    ).innerHTML = tabItem.getAttribute("label");
  }
});

/***************
 *
 * helper functions
 *
 */

const isJson = function (str) {
  let response = false;
  try {
    response = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return response;
};

const loadPage = (page) => {
  document.querySelector("#menu").close();
  document
    .querySelector("#navigator")
    .bringPageTop(page, { animation: "fade" });
};

const showModal = function () {
  var modal = document.querySelector("ons-modal");
  if (modal.visible) {
    modal.hide();
    return;
  }
  modal.show();
};
showModal();
const notification = (message) => {
  ons.notification.alert(message);
};

const toast = (message) => {
  bottomToast.hide();
  document.querySelector("#bottomToastMessage").innerHTML = message;
  bottomToast.show();
};

const flashToast = function (message = "", options = { timeout: 2300 }) {
  ons.notification.toast(message, options);
};

/**************************
 *
 * Sales data settiing and geting
 *
 */

const salesOverView = {};
salesOverView.set = (obj) => {
  if (typeof obj != "object") return false;
  let sales = [];
  if (isJson(localStorage.getItem(SALES_OVERVIEW))) {
    sales = isJson(localStorage.getItem(SALES_OVERVIEW));
  }
  sales = [...obj, ...sales];
  localStorage.setItem(SALES_OVERVIEW, JSON.stringify(sales));
  return sales;
};

salesOverView.get = function (prop = "") {
  const sales = isJson(localStorage.getItem(SALES_OVERVIEW));
  if (!sales) return false;
  if (prop === "") return sales;
  if (sales[prop]) return sales[prop];
  return false;
};

salesOverView.reset = function () {
  localStorage.removeItem(SALES_OVERVIEW);
};

// target page functions

function getTargetError() {
  document.querySelector(".trgetChart").classList.add("d-none");
  const listItem = document.createElement("ons-list-item");

  listItem.innerHTML = `
                                <div class="center">
                                  <span class="list-item__title">Target is not provided, Pull down to refresh.</span
                                  >
                                </div>`;
  targetList.appendChild(listItem);
}

function getTargetData() {
  showModal();
  safari.getAllTargets(user.get("key"), (e) => {
    showModal();
    targetList.innerHTML = "";
    if (typeof e != "object") {
      toast("Service unavailable please try again later !");
      getTargetError();
      return;
    }

    if (e.status != "success" || !e.data) {
      if (typeof e.message == "object") {
        e.message.map((message) => {
          ons.notification.toast(message, { timeout: 1300 });
        });
        getTargetError();
        return;
      }
      getTargetError();
      ons.notification.toast(e.message, { timeout: 2000 });
      return;
    }

    // updating user data too
    if (e.data.userData) {
      user.set(e.data.userData);
    }

    if (
      e.data.daily.length === 0 &&
      e.data.monthly.length === 0 &&
      e.data.weekly.length === 0
    ) {
      getTargetError();
    }
    e.data.daily.map((target) => {
      const listItem = document.createElement("ons-list-item");
      listItem.innerHTML = `<div class="left">
                                    <ons-icon
                                      icon="md-chart"
                                      size="50px"
                                      class="list-item__icon"
                                      style="color: rgb(41, 121, 255)"
                                    ></ons-icon>
                                  </div>
                                  <div class="center">
                                    <span class="list-item__title">Target For Today (${
                                      target.period
                                    })  </span
                                    >
                                    <span class="list-item__subtitle">Target : ${
                                      target.target
                                    }</span>
                                    <span class="list-item__subtitle">Completed : ${
                                      target.amount
                                    } (${
        target.amount / target.target
          ? Math.round((target.amount / target.target) * 100)
          : 0
      }%)</span>

                                  </div>
                                  <div class="right d-flex flex-column justify-content-center align-items-center">
                                    <div class="w-100">
                                      <ons-progress-circular value="${
                                        target.amount / target.target
                                          ? Math.round(
                                              (target.amount / target.target) *
                                                100
                                            )
                                          : 0
                                      }" secondary-value="100"></ons-progress-circular>
                                      
                                    </div>
                                    <div class="w-100 text-center">
                                      ${
                                        target.amount / target.target
                                          ? Math.round(
                                              (target.amount / target.target) *
                                                100
                                            )
                                          : 0
                                      }%
                                    </div>
                                  </div>`;
      targetList.appendChild(listItem);
    });
    e.data.monthly.map((target) => {
      const date = new Date(Date.parse(target.period));
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
      const listItem = document.createElement("ons-list-item");
      listItem.innerHTML = `<div class="left">
                                    <ons-icon
                                      icon="md-chart"
                                      size="50px"
                                      class="list-item__icon"
                                      style="color: rgb(41, 121, 255)"
                                    ></ons-icon>
                                  </div>
                                  <div class="center">
                                    <span class="list-item__title">
                                    Monthly Target (${
                                      monthNames[date.getMonth()]
                                    }, ${date.getFullYear()})
                                    </span>
                                    <span class="list-item__subtitle">
                                      Target :${target.target}
                                    </span>
                                    <span class="list-item__subtitle">
                                      Completed :${target.amount} (${
        target.amount / target.target
          ? Math.round((target.amount / target.target) * 100)
          : 0
      }%)
                                    </span>
                                  </div>
                                  <div class="right d-flex flex-column justify-content-center align-items-center">
                                    <div class="w-100">
                                      <ons-progress-circular value="${
                                        target.amount / target.target
                                          ? Math.round(
                                              (target.amount / target.target) *
                                                100
                                            )
                                          : 0
                                      }" secondary-value="100"></ons-progress-circular>
                                      
                                    </div>
                                    <div class="w-100 text-center">
                                      ${
                                        target.amount / target.target
                                          ? Math.round(
                                              (target.amount / target.target) *
                                                100
                                            )
                                          : 0
                                      }%
                                    </div>
                                  </div>`;
      targetList.appendChild(listItem);
      document.querySelector(".trgetChart").classList.remove("d-none");
      let chart = new Chart(ctx, {
        // The type of chart we want to create
        type: "doughnut",

        // The data for our dataset
        data: {
          labels: ["Sales", "Remaining Target"],
          datasets: [
            {
              backgroundColor: ["rgb(41, 121, 255)", "rgb(200, 200, 200)"],
              borderColor: ["rgb(41, 121, 255)", "rgb(200, 200, 200)"],
              borderAlign: ["inner", "inner"],
              data: [
                target.amount ? target.amount : 0,
                target.target - (target.amount ? target.amount : 0),
              ],
            },
          ],
        },

        // Configuration options go here
        options: {
          title: {
            display: true,
            text: "Monthly Target",
            fontColor: "rgb(41, 121, 255)",
            fontFamily: "Arial",
          },
          legend: {
            display: true,
            position: "right",
            align: "end",
          },
        },
      });
    });
    if (e.data.weekly.length !== 0) {
      const header = document.createElement("ons-list-header");
      header.textContent = `Weekly and Other targets`;
      targetList.appendChild(header);
    }

    e.data.weekly.map((target) => {
      const listItem = document.createElement("ons-list-item");
      listItem.innerHTML = `<div class="left">
                                    <ons-icon
                                      icon="md-chart"
                                      size="50px"
                                      class="list-item__icon"
                                      style="color: rgb(41, 121, 255)"
                                    ></ons-icon>
                                  </div>
                                  <div class="center">
                                    <span class="list-item__title">${
                                      target.title
                                    }    </span
                                    >
                                    <span class="list-item__subtitle">Period :  ${
                                      target.start_date
                                    } -  ${target.end_date}  </span
                                    >
                                    <span class="list-item__subtitle">Target : ${
                                      target.target
                                    }</span>
                                    <span class="list-item__subtitle">
                                      Completed :${target.amount} (${
        target.amount / target.target
          ? Math.round((target.amount / target.target) * 100)
          : 0
      }%)
                                    </span>
                                  </div>
                                  <div class="right d-flex flex-column justify-content-center align-items-center">
                                    <div class="w-100">
                                      <ons-progress-circular value="${
                                        target.amount / target.target
                                          ? Math.round(
                                              (target.amount / target.target) *
                                                100
                                            )
                                          : 0
                                      }" secondary-value="100"></ons-progress-circular>
                                      
                                    </div>
                                    <div class="w-100 text-center">
                                      ${
                                        target.amount / target.target
                                          ? Math.round(
                                              (target.amount / target.target) *
                                                100
                                            )
                                          : 0
                                      }%
                                    </div>
                                  </div>`;
      targetList.appendChild(listItem);
    });
  });
}

//

// mocklocation identification

const mocklocation = () => {
  return new Promise((resolve, reject) => {
    if (cordova.platformId !== "android") {
      resolve(false);
    }
    window.plugins.mockgpschecker.check(successCallback, errorCallback);
    function successCallback(result) {
      console.log("from mocklocation: ", result); // true - enabled, false - disabled
      resolve(result.isMock);
    }

    function errorCallback(error) {
      console.log(error);
      reject(error);
    }
  });
};

function profileEdit(e) {
  const type = e.getAttribute("data-name");
  switch (type) {
    case "editPhone":
      new editPhone();
      break;
    case "editEmail":
      new editEmail();
      break;
    case "editPassword":
      new editPassword();
      break;
  }
  showEditDialogue();
}

const showEditDialogue = function () {
  const dialogue = document.querySelector("#editDialogue");
  if (dialogue) {
    dialogue.show();
  }
};
const hideEditDialogue = function () {
  const dialogue = document.querySelector("#editDialogue");
  const dialogueContent = document.querySelector("#editDialogueContent");
  if (dialogue) {
    dialogue
      .hide()
      .then(() => {
        dialogueContent.innerHTML = "";
      })
      .catch(() => {});
  }
};

class editPhone {
  constructor() {
    this.heading = document.createElement("h4");
    this.heading.innerHTML = "Change Phone Number";
    this.heading.classList.add("pb-3");

    this.input = document.createElement("ons-input");
    this.input.setAttribute("placeholder", "Phone");
    this.input.setAttribute("type", "number");
    this.input.setAttribute("modifier", "underbar");
    this.input.setAttribute("float", true);
    this.input.value = user.get("phone");
    this.input.classList.add("m-2");

    this.submit = document.createElement("ons-button");
    this.submit.onclick = () => {
      this.submitButtonClick();
    };
    this.submit.classList.add("m-2");
    this.submit.innerHTML = "Edit";

    this.cancel = document.createElement("ons-button");
    this.cancel.onclick = hideEditDialogue;
    this.cancel.classList.add("m-2");
    this.cancel.innerHTML = "Cancel";

    this.dialogueContent = document.querySelector("#editDialogueContent");
    if (!this.dialogueContent) return;
    this.dialogueContent.appendChild(this.heading);
    this.dialogueContent.appendChild(this.input);
    this.dialogueContent.appendChild(this.submit);
    this.dialogueContent.appendChild(this.cancel);
  }
  serverResponse(e) {
    showModal();
    if (typeof e != "object") {
      toast("Service unavailable please try again later !");
      return;
    }

    if (e.status != "success") {
      if (typeof e.message == "object") {
        e.message.map((message) => {
          ons.notification.toast(message, { timeout: 1300 });
        });
        return;
      }
      ons.notification.toast(e.message, { timeout: 2000 });
      return;
    }
    if (!e.data || e.data.length === 0)
      ons.notification.toast("Faild to update phone number", {
        timeout: 2000,
      });
    user.set(e.data);
    document.querySelector("#phone").innerText = e.data.phone;
    ons.notification.toast(e.message, { timeout: 2000 });
    hideEditDialogue();
  }
  submitButtonClick() {
    if (this.input.value.length !== 10)
      return ons.notification.toast("phone number must contain 10 digits", {
        timeout: 2000,
      });
    if (isNaN(this.input.value))
      return ons.notification.toast("phone number must contain 10 digits", {
        timeout: 2000,
      });
    if (user.get("phone") == this.input.value)
      return ons.notification.toast("your old number and new number are same", {
        timeout: 2000,
      });
    showModal();
    safari.changePhone(user.get("key"), this.input.value, this.serverResponse);
  }
}

class editEmail {
  constructor() {
    this.heading = document.createElement("h4");
    this.heading.innerHTML = "Change Email Address";
    this.heading.classList.add("pb-3");

    this.input = document.createElement("ons-input");
    this.input.setAttribute("placeholder", "Email");
    this.input.setAttribute("type", "text");
    this.input.setAttribute("modifier", "underbar");
    this.input.setAttribute("float", true);
    this.input.value = user.get("email");
    this.input.classList.add("m-2");

    this.submit = document.createElement("ons-button");
    this.submit.onclick = () => {
      this.submitButtonClick();
    };
    this.submit.classList.add("m-2");
    this.submit.innerHTML = "Edit";

    this.cancel = document.createElement("ons-button");
    this.cancel.onclick = hideEditDialogue;
    this.cancel.classList.add("m-2");
    this.cancel.innerHTML = "Cancel";

    this.dialogueContent = document.querySelector("#editDialogueContent");
    if (!this.dialogueContent) return;
    this.dialogueContent.appendChild(this.heading);
    this.dialogueContent.appendChild(this.input);
    this.dialogueContent.appendChild(this.submit);
    this.dialogueContent.appendChild(this.cancel);
  }
  serverResponse(e) {
    showModal();
    if (typeof e != "object") {
      toast("Service unavailable please try again later !");
      return;
    }

    if (e.status != "success") {
      if (typeof e.message == "object") {
        e.message.map((message) => {
          ons.notification.toast(message, { timeout: 1300 });
        });
        return;
      }
      ons.notification.toast(e.message, { timeout: 2000 });
      return;
    }
    if (!e.data || e.data.length === 0)
      ons.notification.toast("Faild to update Email ID", {
        timeout: 2000,
      });
    user.set(e.data);
    document.querySelector("#email").innerText = e.data.email;
    ons.notification.toast(e.message, { timeout: 2000 });
    hideEditDialogue();
  }
  submitButtonClick() {
    if (this.input.value.length === 0)
      return ons.notification.toast("Email id cannot be blank", {
        timeout: 2000,
      });
    showModal();
    safari.changeEmail(user.get("key"), this.input.value, this.serverResponse);
  }
}

class editPassword {
  constructor() {
    this.heading = document.createElement("h4");
    this.heading.innerHTML = "Change Password";
    this.heading.classList.add("pb-3");

    this.input = document.createElement("ons-input");
    this.input.setAttribute("placeholder", "New Password");
    this.input.setAttribute("type", "text");
    this.input.setAttribute("modifier", "underbar");
    this.input.setAttribute("float", true);

    this.oldPassword = document.createElement("ons-input");
    this.oldPassword.setAttribute("placeholder", "Old Password");
    this.oldPassword.setAttribute("type", "text");
    this.oldPassword.setAttribute("modifier", "underbar");
    this.oldPassword.setAttribute("float", true);
    this.oldPassword.classList.add("mb-3");

    this.input.classList.add("m-2");

    this.submit = document.createElement("ons-button");
    this.submit.onclick = () => {
      this.submitButtonClick();
    };
    this.submit.classList.add("m-2");
    this.submit.innerHTML = "Edit";

    this.cancel = document.createElement("ons-button");
    this.cancel.onclick = hideEditDialogue;
    this.cancel.classList.add("m-2");
    this.cancel.innerHTML = "Cancel";

    this.dialogueContent = document.querySelector("#editDialogueContent");
    if (!this.dialogueContent) return;
    this.dialogueContent.appendChild(this.heading);
    this.dialogueContent.appendChild(this.oldPassword);
    this.dialogueContent.appendChild(this.input);
    this.dialogueContent.appendChild(this.submit);
    this.dialogueContent.appendChild(this.cancel);
  }
  serverResponse(e) {
    showModal();
    if (typeof e != "object") {
      toast("Service unavailable please try again later !");
      return;
    }

    if (e.status != "success") {
      if (typeof e.message == "object") {
        e.message.map((message) => {
          ons.notification.toast(message, { timeout: 1300 });
        });
        return;
      }
      ons.notification.toast(e.message, { timeout: 2000 });
      return;
    }
    ons.notification.toast(e.message, { timeout: 2000 });
    hideEditDialogue();
  }
  submitButtonClick() {
    if (this.input.value.length === 0 || this.oldPassword.value.length === 0)
      return ons.notification.toast("Password cannot be blank", {
        timeout: 2000,
      });
    showModal();
    safari.changePassword(
      user.get("key"),
      this.oldPassword.value,
      this.input.value,
      this.input.value,
      this.serverResponse
    );
  }
}
