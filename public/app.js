$(document).ready(function () {
  // Sign up
  $("form").submit(function (e) {
    e.preventDefault();
    const username = $.trim($("#username").val());
    const email = $("#email").val();
    const password = $("#password").val();
    auth
      .createUserWithEmailAndPassword(email, password)
      .then(function (credential) {
        db.collection("users") //Does this needs to be returned?
          .doc(credential.user.uid)
          .set({
            username: username,
            email: email,
          })
          .then(function (e) {
            window.location.href = "login.html";
          })
          .catch(function (e) {
            console.log("posting error");
            $("#error1").text(e.message);
            $("form").trigger("reset");
          });
      })
      .catch(function (e) {
        console.log("sign up error");
        $("error1").text(e.message);
        $("form").trigger("reset");
      });
  });

  $("#signup").click(function () {
    $("#register").addClass("visible");
    $("#main").addClass("notvisible");
    $("body").addClass("bodyColor");
  });

  $("#close").click(function () {
    $("#register").removeClass("visible");
    $("#main").removeClass("notvisible");
    $("body").removeClass("bodyColor");
  });
});
