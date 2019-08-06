var temp = {
    name: 'worker auto',
    data: [294250.89, 565966.57, 567764.90, 571334.51, 567293.04, 569351.36,
        560691.88, 571230.21, 581800.45]
    };
$('#x86-sele').hide();
$('#x862-sele').hide();
$('#nginx-page').hide()
var listNginx = new Array();
var show_conf = new Array();
listNginx.push(temp);

//通过手动输入测试数据方式
$(document).ready(function(){
    $.ajaxSetup({
         data: {csrfmiddlewaretoken: '{{ csrf_token }}' },
    });
    $('#formadd').submit(function(){
        var title = $("#id_title").val();
        var conn50 = $("#id_conn50").val();
        var conn100 = $("#id_conn100").val();
        var conn300 = $("#id_conn300").val();
        var conn500 = $("#id_conn500").val();
        var conn700 = $("#id_conn700").val();
        var conn1000 = $("#id_conn1000").val();
        var conn1500 = $("#id_conn1500").val();
        var conn2000 = $("#id_conn2000").val();
        var conn2500 = $("#id_conn2500").val();

        var checknum=new Array(9);
        checknum[0]=conn50;
        checknum[1]=conn100;
        checknum[2]=conn300;
        checknum[3]=conn500;
        checknum[4]=conn700;
        checknum[5]=conn1000;
        checknum[6]=conn1500;
        checknum[7]=conn2000;
        checknum[8]=conn2500;

        if(title.length == 0){
            alert('主题不能为空！');
            return false;
        }
        for(var i=0; i< checknum.length; i++){
            if(checknum[i] < 1 && !isNaN(checknum[i])){
                alert('检测到非法输入，请重试!');
                return false;
            }
        }

        $.ajax({
            type:"POST",
            data: {title:title, conn50:conn50, conn100:conn100, conn300:conn300, conn500:conn500, conn700:conn700, conn1000:conn1000, conn1500:conn1500, conn2000:conn2000, conn2500:conn2500},
            url: "{% url 'insert_nginx' %}",
            cache: false,
            dataType: "html",
            success: function(result){
                alert(result);
            },
            error: function(){
                alert("false");
            }
        });
        return false;
    });

});


//多项选择查看数据函数
function submitMul(obj) {
    var title = {
    text: 'Nginx 测试数据比较'
    };
    var subtitle = {
        text: 'Source: 华芯通半导体'
    };
    var xAxis = {
        categories: ['50', '100', '300', '500', '700', '1000'
            ,'1500', '2000', '2500']
    };
    var yAxis = {
        title: {
            text: 'Request'
        },
        plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
        }]
    };
    var tooltip = {
      valueSuffix: '\xB0C'
    };

   var colors= ['#058DC7', '#50B432', '#ED561B', '#DDDF00',
             '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'];

    var legend = {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
    };
    var filename = $(obj).text();
    $.ajax({
       url: '/mulselect/',
       type: 'POST',
       data: {filename: filename},
        //必须注释
        //processData: false,
       //contentType: false,
       success: function(obj){

           var arg = eval(obj);

           var list = {
                  name: arg[0].title,
                  data: [parseInt(arg[0].conn50), parseInt(arg[0].conn100), parseInt(arg[0].conn300), parseInt(arg[0].conn500), parseInt(arg[0].conn700), parseInt(arg[0].conn1000) ,
                        parseInt(arg[0].conn1500), parseInt(arg[0].conn2000), parseInt(arg[0].conn2500)]
            };
           var length = listNginx.length;
           for(var i=0; i<length; i++){
               if(listNginx[i].name == list.name){
                   listNginx.splice(i, 1);
                   break;
               }
               if(i == (listNginx.length-1)){
                   listNginx.push(list);
               }
           }

           var length_now = listNginx.length;
           for(var i=0; i<length_now; i++){
               listNginx[i].color = colors[i]
           }
           //console.log(listNginx[0].name);
           //console.log(listNginx.length);
           var json = {};
           json.title = title;
           json.subtitle = subtitle;
           json.xAxis = xAxis;
           json.yAxis = yAxis;
           json.tooltip = tooltip;
           json.legend = legend;
           json.series = listNginx;
           $('#container').highcharts(json);
           //nginx-conf

           //This is to add a new config element to UI
            var color = ["</td><td class=\"success\">", "</td><td class=\"warning\">", "</td><td class=\"danger\">", "</td><td class=\"info\">"]
           var conf = [arg[1].title, arg[1].time, arg[1].owner, arg[1].hardplatform, arg[1].kernel, arg[1].cpu_num, arg[1].cpu_fre, arg[1].cpu_mod, arg[1].mem_fre, arg[1].nic_card, arg[1].app_version, arg[1].tool_version, arg[1].gcc_version, arg[1].os_version, arg[1].description]
           //console.log(conf);
           var str = "<tr><td class=\"active\">";
            for (var i = 0; i < conf.length; i++)
            {
                if(i == conf.length-1){
                    str += conf[i] + "</td></tr>"
                }

                else {
                    str += conf[i] + color[i%color.length];
                }

            }
            //This is to check if our array includes the config element, if has.delete it,else add it
            var conf_length = show_conf.length;
            if(conf_length == 0){
                show_conf.push(str);
            }else {
                for(var i=0; i<conf.length; i++){
                    if(show_conf[i]==str){
                        console.log('del')
                        show_conf.splice(i, 1);
                        break;
                    }
                    if(i == (conf.length-1)){
                        show_conf.push(str);
                    }
                }
            }

            var strstr = '';
            for(var i=0; i<show_conf.length; i++){
                strstr += show_conf[i];
            }
            $("#nginx-conf").children().children().eq(0).nextAll().remove();
           $("#nginx-conf").append(strstr);

           //nginc-conf-end
       }
    });
}

//X86和AW两项数据对查看
function drawline() {
    var key1 = $('#x86').val();
    var key = $('#aw').val();
    var title = {
    text: 'Nginx 测试数据比较'
};
var subtitle = {
    text: 'Source: 华芯通半导体'
};
var xAxis = {
    categories: ['50', '100', '300', '500', '700', '1000'
        ,'1500', '2000', '2500']
};
var yAxis = {
    title: {
        text: 'Request'
    },
    plotLines: [{
        value: 0,
        width: 1,
        color: '#808080'
    }]
};

var legend = {
    layout: 'vertical',
    align: 'right',
    verticalAlign: 'middle',
    borderWidth: 0
};
var temp = {
    name: 'worker auto',
    data: [294250.89, 565966.57, 567764.90, 571334.51, 567293.04, 569351.36,
        560691.88, 571230.21, 581800.45]
};
    $.ajax({
        type:"GET",
        url: "/nginx_compare/",
        data: {key: key, key1: key1},
        success: function(dict){

            var arg = eval(dict);
            //var arg = JSON.parse(dict);
            var list = {
                  name: arg[0].title,
                  data: [parseInt(arg[0].conn50), parseInt(arg[0].conn100), parseInt(arg[0].conn300), parseInt(arg[0].conn500), parseInt(arg[0].conn700), parseInt(arg[0].conn1000) ,
                        parseInt(arg[0].conn1500), parseInt(arg[0].conn2000), parseInt(arg[0].conn2500)]
            };

            var list_x86 = {
                  name: arg[1].title,
                  data: [parseInt(arg[1].conn50), parseInt(arg[1].conn100), parseInt(arg[1].conn300), parseInt(arg[1].conn500), parseInt(arg[1].conn700), parseInt(arg[1].conn1000) ,
                        parseInt(arg[1].conn1500), parseInt(arg[1].conn2000), parseInt(arg[1].conn2500)]
            };

            var series = new Array();
            //series.push(temp);
            series.push(list);
            series.push(list_x86);
            console.log(series);
           var json = {};

           json.title = title;
           json.subtitle = subtitle;
           json.xAxis = xAxis;
           json.yAxis = yAxis;
           json.legend = legend;
           json.series = series;

           $('#container').highcharts(json);
        },
        error: function(){
            alert("false");
        }
    });
}

//默认初始加载曲线
/*$(document).ready(function() {
   var title = {
       text: 'Nginx 测试数据比较'
   };
   var subtitle = {
        text: 'Source: 华芯通半导体'
   };
   var xAxis = {
       categories: ['50', '100', '300', '500', '700', '1000'
              ,'1500', '2000', '2500']
   };
   var yAxis = {
      title: {
         text: 'Request'
      },
      plotLines: [{
         value: 0,
         width: 1,
         color: '#808080'
      }]
   };

   var legend = {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      borderWidth: 0
   };

   var temp = {
         name: 'worker auto',
         data: [294250.89, 565966.57, 567764.90, 571334.51, 567293.04, 569351.36,
				560691.88, 571230.21, 581800.45]
      }

    var series1 = new Array();

    var series =  [
         /* {% for nginx in nginx_list %}
          {
             name: '{{ nginx.title }}',
             data: [{{ nginx.conn50 }}, {{ nginx.conn100 }}, {{ nginx.conn300 }}, {{ nginx.conn500 }}, {{ nginx.conn700 }}, {{ nginx.conn1000 }},
                 {{ nginx.conn1500 }}, {{ nginx.conn2000 }}, {{ nginx.conn2500 }}]
          },
         // {% endfor %}
   ];
    series.push(temp)
   var json = {};

   json.title = title;
   json.subtitle = subtitle;
   json.xAxis = xAxis;
   json.yAxis = yAxis;
   json.legend = legend;
   json.series = series;

   $('#container').highcharts(json);
});*/

//文件上传
function FileUpload() {
    var form_data = new FormData();
    var file_info = $('#file_upload')[0].files[0];
    form_data.append('file', file_info);
    $.ajax({
       url: '/upload/',
       type: 'POST',
       data: form_data,
       processData: false,
       contentType: false,
       success: function(callback){
           console.log('yes')
       }
    });
}

//查看方式一的左侧数据翻页
function selePage(obj){
    //console.log(obj.value)
    $.ajax({
    type:'GET',
    url:'/nginx_aw_page/',
    data:{number: obj.value},
    success: function (arg) {
        //$('#nginx-data').hide();
        var temp = eval(arg);
        var temp_length = 0;
        console.log(temp[1].title);
        console.log(temp[0]['hehe'])
        for(var haha in temp){
            temp_length += 1;
        }
        console.log(temp_length)
        $('#nginx-sele').children().remove();
        var butt = "<button class=\"list-group-item list-group-item-danger\" onclick=\"submitMul(this)\" >"
        var color = "</button>"
        var str = "";
        for(var i=1; i<temp_length;i++){
           str += butt + temp[i].title + color;
        }
        $('#nginx-sele').append(str);//翻页
        $('#nginx-sele').append(temp[0]['hehe']);//页码
        console.log(str)
    }
})
}

//nginx页面的数据导入到数据库
function Split() {
    var filename = $('#import_data').val();
    filename = "nginx/" + filename;
    $.ajax({
       url: '/split/',
       type: 'POST',
       data: {filename: filename},
        //必须注释
        //processData: false,
       //contentType: false,
       success: function(callback){
           console.log('yes');
           window.location.reload()
       }
    });
}

//切换到多项选择查看数据(查看方式一)
function awChoose() {
    $('#nginx-sele').show();
    $('#nginx-sele-x86').show();
    $('#x86-sele').hide();
    $('#x862-sele').hide();
}
//切换到对比选择查看数据(查看方式二)
function xChoose() {
    $('#nginx-sele').hide();
    $('#nginx-sele-x86').hide();
    $('#x86-sele').show();
    $('#x862-sele').show();
}

//nginx数据管理界面的页码实现
function changePage(obj) {
    var number = $(obj).text()
    $.ajax({
        type:'GET',
        url:'/nginx_page/',
        data:{number:number},
        success: function (arg) {
            //console.log(arg)
            $('#nginx-data').hide();
            $('#nginx-pager').hide();
            $('#nginx-page').show();
            var temp = eval(arg);
            var temp_length = 0
            console.log(temp[1].title);
            for(var haha in temp){
                temp_length += 1;
            }
            console.log(temp_length)
            $('#nginx-page').children().remove();
            var butt = "<button class=\"fas fa-times\" onclick=\"delNginx(this)\"></button><button class=\"fas fa-edit\" onclick=\"modNginx(this)\"></button></td>"
            var color = ["</td><td class=\"success\"><input class=\"nginx-data-list\" size=\"8\" value=\"","</td><td class=\"warning\"><input class=\"nginx-data-list\" size=\"8\" value=\"", "</td><td class=\"danger\"><input class=\"nginx-data-list\" size=\"8\" value=\"","</td><td class=\"info\"><input class=\"nginx-data-list\" size=\"8\" value=\"", "<td class=\"active\">", "</td><td class=\"warning\">"]
            var str = "<tr><td class=\"active\">项目</td><td class=\"success\">并发数： 50</td><td class=\"warning\">并发数：100</td><td class=\"danger\">并发数：300</td><td class=\"info\">并发数：500</td><td class=\"success\">并发数：700</td><td class=\"warning\">并发数：1000</td><td class=\"danger\">并发数：1500</td><td class=\"info\">并发数：2000</td><td class=\"success\">并发数：2500</td><td class=\"warning\">操作</td></tr>"
            for(var i=1; i<temp_length;i++){
               str += "<tr>" + color[4] + temp[i].title + color[0] + temp[i].conn50 + "\"" + color[1] + temp[i].conn100 + "\"" + color[2] + temp[i].conn300 + "\"" + color[3] + temp[i].conn500 + "\"" + color[0] + temp[i].conn700 + "\"" + color[1] + temp[i].conn1000 + "\"" + color[2] + temp[i].conn1500 + "\"" + color[3] + temp[i].conn2000 + "\"" + color[0] + temp[i].conn2500 + "\"" +color[5] + butt + "</tr>";
            }
            //str += "</tr>"
            $('#nginx-page').append(str);
            $('#nginx-page').append(temp[0]['hehe']);
            console.log(str)
        }
    })
}

//nginx数据管理界面的删除指定行数据
function delNginx(obj) {
    var temp = obj
    //console.log($(temp).parent().css("background-color","red"))
    //console.log($(temp).parent().parent().children().eq(0).text())
    //var title = $(temp).parent().parent().children().eq(0).children().val()
    var title = $(temp).parent().parent().children().eq(0).text()
    $.ajax({
        type:"GET",
        url: "/delnginx/",
        data: {title: title},
        success: function(callback){
               console.log('yes')
                window.location.reload()
           }
    })
}

//nginx数据管理界面的修改指定行数据
function modNginx(obj) {
    var title = new Array(10);
    title[0] = $(obj).parent().parent().children().eq(0).text()
    for(var i=1; i<10; i++){
      title[i] = $(obj).parent().parent().children().eq(i).children().val()
    }
    var str = JSON.stringify(title)
    $.ajax({
        type:"GET",
        url: "/modnginx/",
        data: {title: str},
        success: function(callback){
               console.log('yes')
                window.location.reload()
           }
    })
}
