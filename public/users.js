$(document).ready(function () {
  //Checking whether user is sign in or out
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("You have signed in");
    } else {
      alert("Your login session has expired or you have logged out");
      window.location.href = "index.html";
    }
  });
  // Retrieving username from firestore and appending it
  auth.onAuthStateChanged((user) => {
    if (user) {
      db.collection("users")
        .doc(user.uid)
        .get()
        .then((doc) => {
          let name = doc.data().username + "'s";
          $("#user").text(transformUser(name));
        })
        .catch((e) => {
          $(".error1").text(e.message);
        });
    }
  });

  //Realtime event listener for existing and future todo tasks
  auth.onAuthStateChanged((user) => {
    db.collection(user.uid).onSnapshot((queryDocs) => {
      const changedDocs = queryDocs.docChanges();
      changedDocs.forEach((changedDoc) => {
        if (changedDoc.type === "added") {
          renderData(changedDoc.doc.data());
        }
        if (changedDoc.type === "modified") {
          $("li[data-id=" + changedDoc.doc.id + "]").data(
            "completed",
            changedDoc.doc.data().completed
          );
          $("li[data-id=" + changedDoc.doc.id + "]").toggleClass("done");
        }
        if (changedDoc.type === "removed") {
          $("li[data-id=" + changedDoc.doc.id + "]").remove();
        }
      });
    });
  });

  // Retrieving existing todo list from firestore can be achieved this way or real time event listeners
  //   auth.onAuthStateChanged((user) => {
  //     if (user) {
  //       db.collection(user.uid)
  //         .get()
  //         .then((query) => {
  //           if (query.size === 0) return;
  //           else {
  //             query.forEach(function (doc) {
  //               renderData(doc.data());
  //             });
  //           }
  //         })
  //         .catch((e) => {
  //           $(".error1").text(e.message);
  //         });
  //     }
  //   });

  // Pulled from Firebase; class that generates random ID
  class AutoId {
    static newId() {
      // Alphanumeric characters
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let autoId = "";
      for (let i = 0; i < 20; i++) {
        autoId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return autoId;
    }
  }

  //Adding new todos to firestore
  //"this" keyword için function ın execute oldugu zamanki environment önemli
  //"this" is not part of the closure scope, it can be thought of as an additional parameter to the function that is bound at the call site. If the method is not called as a method then the global object is passed as this. In the browser, the global object is identical to window. For example, consider the following funciton,
  $("#todoInput").keypress(function (e) {
    if (e.which === 13) {
      const task = $(this).val();
      auth.onAuthStateChanged((user) => {
        if (user) {
          const newId = AutoId.newId();
          const docRef = db.collection(user.uid).doc();
          docRef
            .set({
              targetID: docRef.id,
              task: task,
              completed: false,
            })
            .then(() => {
              $("#todoInput").val(""); //?why $(this) can not be used, instead use $("#todoInput")
            })
            .catch((e) => {
              $(".error1").text(e.message);
            });
        }
      });
    }
  });
  //Updating the tasks from firestore
  $(".list").on("click", "li", function (event) {
    const updatedli = $(this).attr("data-id");
    const isDone = !$(this).data("completed");
    auth.onAuthStateChanged((user) => {
      db.collection(user.uid).doc(updatedli).update({
        completed: isDone,
      });
    });
  });

  //Deleting the tasks from firestore
  $(".list").on("click", "span", function (event) {
    event.stopPropagation();
    const deletedli = $(this).parent().attr("data-id");
    auth.onAuthStateChanged((user) => {
      db.collection(user.uid).doc(deletedli).delete();
    });
  });

  //Sign out
  $("#logout").click(function () {
    auth.signOut();
  });
});

// Function to remove possible operators and capitalize the initial of username which is a string
function transformUser(name) {
  //There might be a better way for this by using replace() method
  let newName = name
    .split("")
    .filter(function (value) {
      return "_/-()=+%#&?*:;".indexOf(value) === -1;
    })
    .join("");
  return capitalize(newName);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderData(data) {
  const li = $(
    `<li class='task'>${capitalize(
      data.task
    )}<span><i class='fas fa-trash'></i></span></li>`
  );
  li.attr("data-id", data.targetID);
  li.data("completed", data.completed);
  if (data.completed) {
    li.addClass("done");
  }
  $(".list").append(li);
}
