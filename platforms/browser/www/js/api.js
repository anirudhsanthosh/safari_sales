let Safari = function () {
  const safari = {
    url: `http://bestwishess.online/safari/usersc/plugins/apibuilder/auth`,
    login: (username, password, callback) => {
      const url = `${safari.url}/login.php`;
      const data = new FormData();
      data.set("username", username);
      data.set("password", password);
      axios({
        method: "post",
        url: url,
        data,
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          callback({ status: "error", message: "internal error" });
          //console.log(error);
        });
    },
    changePassword: (
      key,
      oldPassword,
      newPassword,
      confirmPassword,
      callback
    ) => {
      if (key.length < 8) {
        callback({
          status: "error",
          error: true,
          message: "Please check key",
        });
        return;
      }
      if (newPassword !== confirmPassword) {
        callback({
          status: "error",
          error: true,
          message: "New passwords dont match",
        });
        return;
      }
      if (newPassword === oldPassword) {
        callback({
          status: "error",
          error: true,
          message: "New passwords and Current password are same",
        });
        return;
      }
      if (newPassword.length < 5) {
        callback({
          status: "error",
          error: true,
          message: "New password is too short",
        });
        return;
      }
      const url = `${safari.url}/change_password.php`;
      axios({
        method: "post",
        url: url,
        data: JSON.stringify({ key, oldPassword, newPassword }),
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          callback({ status: "error", message: "internal error" });
        });
    },
    createUser: function (
      key = "",
      fname = "",
      lname = "",
      username = "",
      email = "",
      password = "",
      confirmPassword = "",
      phone = 0,
      callback = (e) => console.log(e)
    ) {
      const data = {
        key,
        fname,
        lname,
        username,
        email,
        password,
        confirmPassword,
        phone,
      };
      let error = false;
      for (let [_k, _v] of Object.entries(data)) {
        if (_v.length < 5) error = true;
      }
      if (error) {
        callback({ status: "error", message: "check all fields" });
        return;
      }
      if (data.password.length < 8) {
        callback({
          status: "error",
          message:
            "Passwords is too short, it should be minimum 8 character long",
        });
        return;
      }
      if (data.password !== data.confirmPassword) {
        callback({ status: "error", message: "Passwords doesn't match" });
        return;
      }

      if (
        data.phone.toString().length !== 10 ||
        typeof data.phone != "number"
      ) {
        callback({
          status: "error",
          message: "phone number must be a 10 digit number",
        });
        return;
      }
      const url = `${safari.url}/create_user.php`;
      axios({
        method: "post",
        url: url,
        data: JSON.stringify(data),
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          callback({ status: "error", message: "internal error" });
        });
    },
    updateUser: function (
      key = "",
      update_user = "",
      fname = "",
      lname = "",
      username = "",
      email = "",
      phone = 0,
      callback = (e) => console.log(e)
    ) {
      const data = {
        key,
        update_user,
        fname,
        lname,
        username,
        email,
        phone,
      };
      let error = false;
      for (let [_k, _v] of Object.entries(data)) {
        if (_v.length < 5) error = true;
      }
      if (error) {
        callback({ status: "error", message: "check all fields" });
        return;
      }
      if (
        data.phone.toString().length !== 10 ||
        typeof data.phone != "number"
      ) {
        callback({
          status: "error",
          message: "phone number must be a 10 digit number",
        });
        return;
      }
      const url = `${safari.url}/update_user.php`;
      axios({
        method: "post",
        url: url,
        data: JSON.stringify(data),
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          callback({ status: "error", message: "internal error" });
        });
    },
    userSettings: function (
      key = "",
      fname = "",
      lname = "",
      username = "",
      email = "",
      phone = 0,
      callback = (e) => console.log(e)
    ) {
      const data = {
        key,
        fname,
        lname,
        username,
        email,
        phone,
      };
      let error = false;
      for (let [_k, _v] of Object.entries(data)) {
        if (_v.length < 5) error = true;
      }
      if (error) {
        callback({ status: "error", message: "check all fields" });
        return;
      }
      if (
        data.phone.toString().length !== 10 ||
        typeof data.phone != "number"
      ) {
        callback({
          status: "error",
          message: "phone number must be a 10 digit number",
        });
        return;
      }
      const url = `${safari.url}/user_settings.php`;
      axios({
        method: "post",
        url: url,
        data: JSON.stringify(data),
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          callback({ status: "error", message: "internal error" });
        });
    },
    resetPassword: function (
      key = "",
      update_user = "",
      callback = (e) => console.log(e)
    ) {
      const data = {
        key,
        update_user,
      };
      let error = false;
      for (let [_k, _v] of Object.entries(data)) {
        if (_v.length < 5) error = true;
      }
      if (error) {
        callback({ status: "error", message: "check all fields" });
        return;
      }
      const url = `${safari.url}/reset_password.php`;
      axios({
        method: "post",
        url: url,
        data: JSON.stringify(data),
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          callback({ status: "error", message: "internal error" });
        });
    },
    getUsers: function (key = "", callback = (e) => console.log(e)) {
      if (key.length < 8) {
        callback({ status: "error", message: "check key" });
        return;
      }
      const url = `${safari.url}/get_users.php`;
      axios({
        method: "post",
        url: url,
        data: JSON.stringify({ key }),
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          callback({ status: "error", message: "internal error" });
        });
    },
    createSalesOverview: function (
      key = "",
      amount = "",
      walkin = "",
      converted = "",
      qnty = "",
      at = "",
      vip = "",
      other = "",
      callback = (e) => {
        console.log(e);
      }
    ) {
      if (key.length < 8) {
        callback({ status: "error", message: ["check key"] });
        return;
      }
      if (
        amount == "" ||
        walkin == "" ||
        converted == "" ||
        qnty == "" ||
        at == "" ||
        vip == "" ||
        other == ""
      ) {
        callback({ status: "error", message: ["check input fields"] });
        return;
      }
      const url = `${safari.url}/create_sales_overview.php`;
      const data = {
        key,
        amount,
        converted,
        walkin,
        qnty,
        at,
        vip,
        other,
      };
      axios({
        method: "post",
        url: url,
        data: JSON.stringify(data),
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          callback({ status: "error", message: ["internal error"] });
        });
    },
    getAllSalesOverview: function (
      key = "",
      callback = (e) => console.log(e),
      offset = 0
    ) {
      if (key.length < 8) {
        callback({ status: "error", message: ["check key"] });
        return;
      }
      const url = `${safari.url}/view_sales_overview.php`;

      axios({
        method: "post",
        url: url,
        data: JSON.stringify({ key, offset }),
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          callback({ status: "error", message: ["internal error"] });
        });
    },
    getAllTargets: function (key = "", callback = (e) => console.log(e)) {
      if (key.length < 8) {
        callback({ status: "error", message: ["check key"] });
        return;
      }
      const url = `${safari.url}/view_all_target.php`;
      axios({
        method: "post",
        url: url,
        data: JSON.stringify({ key }),
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          callback({ status: "error", message: ["internal error"] });
        });
    },
    punchAttendance: function (
      key = "",
      lattitude = "",
      longitude = "",
      accuracy = "",
      mock = "",
      status = "",
      callback = (e) => console.log(e)
    ) {
      if (key.length < 8) {
        callback({ status: "error", message: ["check key"] });
        return;
      }
      if (
        !lattitude.toString().length ||
        !longitude.toString().length ||
        !accuracy.toString().length ||
        !mock.toString().length ||
        !status.toString().length
      ) {
        callback({
          status: "error",
          message: ["Something is not right, please try again!"],
        });
        return;
      }
      const url = `${safari.url}/attendance.php`;

      axios({
        method: "post",
        url: url,
        data: JSON.stringify({
          key,
          lattitude,
          longitude,
          accuracy,
          mock,
          status,
        }),
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          callback({ status: "error", message: ["internal error"] });
        });
    },
    getAttendanceStatus: function (key = "", callback = (e) => console.log(e)) {
      if (key.length < 8) {
        callback({ status: "error", message: ["check key"] });
        return;
      }
      const url = `${safari.url}/getAttendanceStatus.php`;
      axios({
        method: "post",
        url: url,
        data: JSON.stringify({ key }),
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          console.log(error);
          callback({ status: "error", message: ["internal error"] });
        });
    },
    changePhone: function (
      key = "",
      phone = "",
      callback = (e) => console.log(e)
    ) {
      if (key.length < 8) {
        callback({ status: "error", message: ["check key"] });
        return;
      }
      if (!phone.toString().length || isNaN(phone)) {
        callback({
          status: "error",
          message: ["Please check phone number"],
        });
        return;
      }
      const url = `${safari.url}/changePhone.php`;

      axios({
        method: "post",
        url: url,
        data: JSON.stringify({
          key,
          phone,
        }),
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          callback({ status: "error", message: ["internal error"] });
        });
    },
    changeEmail: function (
      key = "",
      email = "",
      callback = (e) => console.log(e)
    ) {
      if (key.length < 8) {
        callback({ status: "error", message: ["check key"] });
        return;
      }
      if (!email.toString().length) {
        callback({
          status: "error",
          message: ["Please check Email"],
        });
        return;
      }
      const url = `${safari.url}/changeEmail.php`;

      axios({
        method: "post",
        url: url,
        data: JSON.stringify({
          key,
          email,
        }),
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          callback({ status: "error", message: ["internal error"] });
        });
    },
    getDashboardData: function (key = "", callback = (e) => console.log(e)) {
      if (key.length < 8) {
        callback({ status: "error", message: ["check key"] });
        return;
      }
      const url = `${safari.url}/getDashboardData.php`;
      axios({
        method: "post",
        url: url,
        data: JSON.stringify({ key }),
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          console.log(error);
          callback({
            status: "error",
            message: [
              "Unable to contact server, Please check network connection",
            ],
          });
        });
    },
    getTargetHistory: function (key = "", callback = (e) => console.log(e)) {
      if (key.length < 8) {
        callback({ status: "error", message: ["check key"] });
        return;
      }
      const url = `${safari.url}/view_target_history.php`;
      axios({
        method: "post",
        url: url,
        data: JSON.stringify({ key }),
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          console.log(error);
          callback({
            status: "error",
            message: [
              "Unable to contact server, Please check network connection",
            ],
          });
        });
    },
    getAttandanceHistory: function (
      key = "",
      from = "",
      to = "",
      callback = (e) => console.log(e)
    ) {
      if (key.length < 8) {
        callback({ status: "error", message: ["check key"] });
        return;
      }
      const url = `${safari.url}/view_attendance_history.php`;
      axios({
        method: "post",
        url: url,
        data: JSON.stringify({ key, from, to }),
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          console.log(error);
          callback({
            status: "error",
            message: [
              "Unable to contact server, Please check network connection",
            ],
          });
        });
    },
    appFeedback: function (
      key = "",
      firebase_device_token = "",
      firebase_app_id = "",
      app_version = "",
      callback = (e) => console.log(e)
    ) {
      if (key.length < 8) {
        callback({ status: "error", message: ["check key"] });
        return;
      }
      const url = `${safari.url}/appFeedback.php`;
      axios({
        method: "post",
        url: url,
        data: JSON.stringify({
          key,
          firebase_device_token,
          firebase_app_id,
          app_version,
        }),
      })
        .then((response) => {
          const { data } = response;
          callback(data);
        })
        .catch((error) => {
          console.log("feedback error", error);
          callback({
            status: "error",
            message: [
              "Unable to contact server, Please check network connection",
            ],
          });
        });
    },
  };
  return safari;
};
