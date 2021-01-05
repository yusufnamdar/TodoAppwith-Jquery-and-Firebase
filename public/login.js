$(document).ready(function () {
  //Sign in
  $("form").submit(function (e) {
    e.preventDefault();
    const email = $("#email").val();
    const password = $("#password").val();
    auth
      .signInWithEmailAndPassword(email, password)
      .then(function () {
        window.location.href = "users.html";
      })
      .catch((e) => {
        console.log("sign in error");
        $("#error1").text(e.message);
        $("form").trigger("reset");
      });
  });
});
