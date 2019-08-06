
function check(){
    var username = $('#username').val();
    var password = $('#password').val();
    if(username == ''){
        alert('The name cannot be empty.');
        return false
    }else if(password == ''){
        alert('The password cannot be empty.');
        return false
    }else{
        return true
    }
}

$(document).ready(function() {
    $("#myForm").animate({
       top:'20%',
    });

    var temp_status=$("#myForm").is(":visible");
    if (temp_status){
        $(".right-part").find("*").prop('disabled', true);
    }else {
        $(".right-part").find("*").prop('disabled', false);
   }


    if (!!window.ActiveXObject || "ActiveXObject" in window){
        alert("Please Use Chrome!")
        window.location.href = window.location.protocol + window.location.host + '/404'
    }

   // selected input tag by 'tab' keyboard,the outline color changed
    $("input").focus(function(){
        $(this).css("outline-color","#1B548D");
        $(".form-control").css("outline-color","#1B548D");
    });

});

function closeForm(){
    var x = document.getElementById("myForm");
    x.style.display="none";
    $(".right-part").find("*").prop('disabled', false);
}

