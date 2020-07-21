/********************
 *  globals
 *
 * ********************** */

safari = new Safari();
const USER = "safari_user";
const LOGIN = "safari_login";
const SALES_OVERVIEW = "sales_overview";
const VERSION = `1.2.0`;
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

  try {
    unsubscribeToTopic(subscribedTopics.get().split(","));
  } catch (e) {
    console.log(e);
  }

  return true;
};

/************************
 *
 * global ons event listners
 *
 *
 */

// event listner for all page initialization events
document.addEventListener("init", function (event) {
  // console.log("init called");
});

// ons ready event entry point of app

ons.ready(() => {
  console.log(navigator);
  if (navigator) {
    navigator.splashscreen.hide();
  }

  // selecting ons navigator to load page loginpage or dashboard

  const navigatr = document.querySelector("#navigator");
  if (isLoggedIn()) {
    navigatr.resetToPage("dashboard.html");
  } else {
    navigatr.resetToPage("login.html");
  }

  // checking weather the firebase plugin exist or not
  try {
    if (FirebasePlugin) {
      FirebasePlugin.onTokenRefresh(
        function (fcmToken) {
          console.log("token changed");
          sendFeedback();
        },
        function (error) {
          console.error(error);
        }
      );
      sendFeedback();

      // notification opening event
      FirebasePlugin.onMessageReceived(
        function (message) {
          console.log("Message type: " + message.messageType);
          if (message.messageType === "notification") {
            console.log("Notification message received");
            if (message.tap) {
              console.log("Tapped in " + message.tap);
            }
          }
          console.dir(message);
          loadPage("add-new-sale.html");
        },
        function (error) {
          console.error(error);
        }
      );
    }
  } catch (e) {
    console.log("from try block", e);
  }

  // disable landscapemode
  window.screen.orientation.lock("portrait");

  // setting up local notification

  if (cordova.plugins.notification.local) {
    for (let i = 0; i < 10; i++) {
      const today = new Date();
      const id = Math.round(Math.random() * 1000 * 45845);
      today.setMinutes(today.getMinutes() + i);
      const randomTime = Math.round(Math.random() * 1000);
      console.log("id: ", id, "today: ", today);
      setTimeout(() => {
        cordova.plugins.notification.local.schedule({
          id,
          title: "Sale Report Reminder",
          text: "Please send sale report before 8.05 PM.",
          trigger: { at: today },
        });
      }, randomTime);
    }
  }
}); // end of ons initialization

// function for showing side menu
const openMenu = () => {
  document.querySelector("#menu").open();
};

// controlling page title while changing tabs
document.addEventListener("prechange", ({ target, tabItem }) => {
  if (target.matches("#attendance-tabbar")) {
    document.querySelector(
      "#attendance-home-toolbar .center"
    ).innerHTML = tabItem.getAttribute("label");
  }

  if (target.matches("#target-tabbar")) {
    document.querySelector(
      "#target-home-toolbar .center"
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

// changing pages
const loadPage = (page) => {
  document.querySelector("#menu").close();
  document
    .querySelector("#navigator")
    .bringPageTop(page, { animation: "fade" });
};

const showModal = function () {
  var modal = document.querySelector("ons-modal#mainModal");
  if (modal.visible) {
    modal.hide();
    return;
  }
  modal.show();
};

const notification = (message) => {
  ons.notification.alert(message);
};

const toast = (message) => {
  bottomToast.hide();
  document.querySelector("#bottomToastMessage").innerHTML = message;
  bottomToast.show();
};

const flashToast = function (message = "", options = { timeout: 2300 }) {
  const toast = ons.notification.toast(message, options);
  toast.then((e) => {}).catch((e) => {});
};

/**************************
 *
 * Sales data settiing and geting
 *
 */

const salesOverView = {};
salesOverView.set = (obj, options = { reverse: false }) => {
  if (typeof obj != "object") return false;
  let sales = [];
  if (isJson(localStorage.getItem(SALES_OVERVIEW))) {
    sales = isJson(localStorage.getItem(SALES_OVERVIEW));
  }
  if (options.reverse) sales = [...sales, ...obj];
  if (!options.reverse) sales = [...obj, ...sales];
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
  document.querySelector("#target").classList.add("empty");
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
  getTargetError();
  document.querySelector("#target").classList.remove("empty");
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

    if (
      e.data.daily.length === 0 &&
      e.data.monthly.length === 0 &&
      e.data.weekly.length === 0
    ) {
      getTargetError();
    }

    e.data.daily.map((target) => {
      const listItem = document.createElement("ons-list-item");
      listItem.onclick = function () {
        this.classList.add("animation-target-roadrunner");
        const self = this;
        setTimeout(() => {
          self.classList.remove("animation-target-roadrunner");
        }, 2800);
      };
      listItem.innerHTML = `<div class="left">
                                    <ons-icon
                                      icon="md-chart"
                                      size="50px"
                                      class="list-item__icon"
                                      style="color: rgb(74, 41, 216)"
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
      listItem.onclick = function () {
        this.classList.add("animation-target-roadrunner");
        const self = this;
        setTimeout(() => {
          self.classList.remove("animation-target-roadrunner");
        }, 2800);
      };
      listItem.innerHTML = `<div class="left">
                                    <ons-icon
                                      icon="md-chart"
                                      size="50px"
                                      class="list-item__icon"
                                      style="color: rgb(74, 41, 216)"
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
              backgroundColor: ["rgb(76, 175, 80)", "rgb(244, 67, 54)"],
              borderColor: ["rgb(76, 175, 80)", "rgb(244, 67, 54)"],
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
            fontColor: "rgb(74, 41, 216)",
            fontFamily: "Arial",
          },
          legend: {
            display: false,
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
      listItem.onclick = function () {
        this.classList.add("animation-target-roadrunner");
        const self = this;
        setTimeout(() => {
          self.classList.remove("animation-target-roadrunner");
        }, 2800);
      };
      listItem.innerHTML = `<div class="left">
                                    <ons-icon
                                      icon="md-chart"
                                      size="50px"
                                      class="list-item__icon"
                                      style="color: rgb(74, 41, 216)"
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

// progress bar for dashboard

class ProgressRing extends HTMLElement {
  constructor() {
    super();
    const parentWidth = this.parentNode.clientWidth;
    const stroke = this.getAttribute("stroke");
    const radius = this.getAttribute("radius");

    const normalizedRadius = radius - stroke * 2;
    this._circumference = normalizedRadius * 2 * Math.PI;

    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `
    
      <svg
        viewBox="0 0 100 100" style="width:100%;height:100%"
       >
         
         <circle
           stroke-dasharray="${this._circumference}"
           style="stroke-dashoffset:0"
           stroke-width="${stroke}"
           fill="transparent"
           r="${normalizedRadius}"
           cx="${radius}"
           cy="${radius}"
        />
         
         <circle
           id="bar"
           stroke-dasharray="${this._circumference} ${this._circumference}"
           style="stroke-dashoffset:${this._circumference}"
           stroke-width="${stroke}"
           fill="transparent"
           r="${normalizedRadius}"
           cx="${radius}"
           cy="${radius}"
        />

        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">0%</text>
      </svg>

      <style>
        circle {
          stroke-dashoffset: 0;
          transition: stroke-dashoffset 1s linear;
          stroke: rgb(39,19,147);
          stroke-width: 1em;
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
        }
        
        svg #bar {
                  stroke: rgb(51,162,254);
                  stroke-dashoffset: 400;
                }
        svg text {
                  fill: #fff;
                  /*stroke-width:1;
                  stroke: #fff;*/
                  font-size:1.8em;
                  font-weight:bold;
                }
        .animate{
            animation: spin 0.8s ;
        }

        @keyframes spin {
                        from {
                            transform: rotate(-90deg);
                          }
                        to {
                              transform: rotate(270deg);
                            }
                        }
      </style>
    `;
    const self = this;
    setTimeout(() => {
      self.animate();
    }, 150);
  }

  setProgress(percent) {
    const actualPercent = percent;
    percent = percent > 100 ? 100 : percent <= 0 ? 0.1 : percent;
    const offset = this._circumference - (percent / 100) * this._circumference;
    const circle = this._root.querySelector("#bar");
    circle.style.strokeDashoffset = offset;
    const text = this._root.querySelector("text");
    text.innerHTML = `${actualPercent}%`;
  }

  static get observedAttributes() {
    return ["progress"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "progress") {
      this.setProgress(newValue);
    }
  }

  animate() {
    this._root.querySelector("#bar").classList.remove("animate");
    const self = this;
    setTimeout(() => {
      self._root.querySelector("#bar").classList.add("animate");
    }, 100);
  }
}
// defining new progress element
window.customElements.define("progress-ring", ProgressRing);

// server controlled functions

function disableApp(content = "") {
  if (content === "")
    content = `<div style="display:flex;align-items: center;;justify-content:center;width:100%;height:100%; color:red;">
                  Sorry, Please contact administrator!
              </div>`;
  document.write(content);
}

function popupMessage(content = "") {
  if (content === "") return;
  const popup = document.querySelector(".popupMessage");
  const close = document.querySelector("#popupClose");
  const contentArea = document.querySelector("#popupContent");
  // onclick event for close button
  close.onclick = () => {
    popup.classList.add("hide");
    setTimeout(() => {
      popup.style.display = "none";
      popup.classList.remove("hide");
    }, 500);
  };
  contentArea.innerHTML = content;
  popup.style.display = "flex";
}

// firebaseX plugin functions
function getFirebaseToken() {
  return new Promise((resolve, reject) => {
    FirebasePlugin.getToken(
      function (fcmToken) {
        resolve(fcmToken);
      },
      function (error) {
        reject(error);
      }
    );
  });
}

function getFirebaseAppInstance() {
  return new Promise((resolve, reject) => {
    FirebasePlugin.getId(
      function (appInstanceId) {
        resolve(appInstanceId);
      },
      function (error) {
        reject(error);
      }
    );
  });
}
const subscribedTopics = {
  tag: "SUBSCRIBED_TOPICS",
  get: function () {
    return localStorage.getItem(this.tag);
  },
  set: function (content) {
    return localStorage.setItem(this.tag, content);
  },
};
function subscribeToTopic(topics = []) {
  if (topics.length === 0 && typeof topics !== "object") return;
  topics.map((topic) => {
    if (topic.length === 0) return;
    FirebasePlugin.subscribe(
      topic,
      function () {
        console.log("Subscribed to topic");
      },
      function (error) {
        console.error("Error subscribing to topic: " + error);
      }
    );
  });
}

function unsubscribeToTopic(topics = []) {
  if (topics.length === 0 && typeof topics !== "object") return;
  topics.map((topic) => {
    if (topic.length === 0) return;
    FirebasePlugin.unsubscribe(
      topic,
      function () {
        console.log("Unsubscribed from topic");
      },
      function (error) {
        console.error("Error unsubscribing from topic: " + error);
      }
    );
  });
}

// feedback functions

async function sendFeedback() {
  const firebaseToken = await getFirebaseToken();
  console.log(firebaseToken);
  const appId = await getFirebaseAppInstance();
  console.log(appId);
  const version = VERSION;
  console.log(version);

  safari.appFeedback(
    user.get("key"),
    firebaseToken,
    appId,
    version,
    (callback = (e) => {
      console.log("feed back callback", e);
    })
  );
}
