document.addEventListener("DOMContentLoaded", function () {

 AuthGuard.requireAdmin((user,data)=>{
  initAdminPanel(user,data);
 });

});