$('#hhvm-aw-sele').hide();
$('#hhvm-x86-sele').hide();
var listNginx = new Array();
var show_conf = new Array();
/*var temp = {
    name: 'xuwei',
    data: [12971.09, 1198.73, 1674.21, 1033.17, 5518.04, 418.64, 213.89, 743.63,7671.99, 4896.41, 4012.56, 1153.33, 295.35]
    };
listNginx.push(temp);*/

//切换到多项选择查看数据(查看方式一)
function awChoose() {
    $('#hhvm-sele').show();
    $('#hhvm-sele-x86').show();
    $('#hhvm-aw-sele').hide();
    $('#hhvm-x86-sele').hide();
}

//切换到对比选择查看数据(查看方式二)
function xChoose() {
    $('#hhvm-sele').hide();
    $('#hhvm-sele-x86').hide();
    $('#hhvm-aw-sele').show();
    $('#hhvm-x86-sele').show();
}

//nginx页面的数据导入到数据库
function Split() {
    var filename = $('#update_data').val();
    filename = "hhvm/" + filename;
    $.ajax({
       url: '/hhvm_split/',
       type: 'POST',
       data: {filename: filename},
        //必须注释
        //processData: false,
       //contentType: false,
       success: function(arg){
           arg = eval(arg)
           if(arg.status){
               alert(arg.message)
           }else{
               alert(arg.message)
           }
           window.location.reload()
       }
    });
}


//HHVM数据管理界面的删除指定行数据
function delNginx(obj) {
    var temp = obj
    //console.log($(temp).parent().css("background-color","red"))
    //console.log($(temp).parent().parent().children().eq(0).text())
    //var title = $(temp).parent().parent().children().eq(0).children().val()
    var title = $(temp).parent().parent().children().eq(0).text()
    $.ajax({
        type:"GET",
        url: "/delhhvm/",
        data: {title: title},
        success: function(callback){
                window.location.reload()
           }
    })
}

//nginx数据管理界面的修改指定行数据
function modNginx(obj) {
    var title = new Array(14);
    title[0] = $(obj).parent().parent().children().eq(0).text()
    for(var i=1; i<14; i++){
      title[i] = $(obj).parent().parent().children().eq(i).children().val()
    }
    var str = JSON.stringify(title)
    $.ajax({
        type:"GET",
        url: "/modhhvm/",
        data: {title: str},
        success: function(callback){
               console.log('yes')
                window.location.reload()
           }
    })
}



$(document).ready(function() {

   var chart = {
      type: 'column'
   };
   var title = {
      text: 'HHVM 测试数据比较'
   };
   var subtitle = {
      text: 'Source: 华芯通半导体'
   };
   var xAxis = {
      categories: ['toys-hello-world','wordpress','drupal7','mediawiki','codeigniter-hello-world','toys-fibonacci','magento1','drupal8-no-cache','drupal8-page-cache','laravel4-hello-world','laravel5-hello-world','sugarcrm-login-page', 'sugarcrm-home-page'],
      crosshair: true
   };
   var yAxis = {
      min: 0,
      title: {
         text: 'Req/Sec'
      }
   };
   var tooltip = {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
         '<td style="padding:0"><b>{point.y:.1f} req/sec</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
   };
   var plotOptions = {
      column: {
         pointPadding: 0.2,
         borderWidth: 0
      }
   };


   var series= [{
        name: 'HSRP1.1',
            data: [12971.09, 1198.73, 1674.21, 1033.17, 5518.04, 418.64, 213.89, 743.63,7671.99, 4896.41, 4012.56, 1153.33, 295.35]
        }, {
            name: 'HSRP1.01',
            data: [9499.80, 994.41, 1493.66, 1064.68, 5211.80, 399.28, 191.45, 672.90, 4111.23, 3190.15, 2463.38, 1034.88, 279.91]
   }];

   var json = {};
   json.chart = chart;
   json.title = title;
   json.subtitle = subtitle;
   json.tooltip = tooltip;
   json.xAxis = xAxis;
   json.yAxis = yAxis;
   json.series = series;
   json.plotOptions = plotOptions;

   $('#container').highcharts(json);

});


//多项选择查看数据函数
function submitMul(obj) {

    var chart = {
      type: 'column'
   };
   var title = {
      text: 'HHVM 测试数据比较'
   };
   var subtitle = {
      text: 'Source: 华芯通半导体'
   };
   var colors= ['#058DC7', '#50B432', '#ED561B', '#DDDF00',
                 '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'];
   var xAxis = {
      categories: ['toys-hello-world','wordpress','drupal7','mediawiki','codeigniter-hello-world','toys-fibonacci','magento1','drupal8-no-cache','drupal8-page-cache','laravel4-hello-world','laravel5-hello-world','sugarcrm-login-page', 'sugarcrm-home-page'],
      crosshair: true
   };
   var yAxis = {
      min: 0,
      title: {
         text: 'Req/Sec'
      }
   };
   var tooltip = {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
         '<td style="padding:0"><b>{point.y:.1f} req/sec</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
   };
   var plotOptions = {
      column: {
         pointPadding: 0.2,
         borderWidth: 0,
         // colorByPoint:true
      }
   };
   var credits = {
      enabled: false
   };
   var series = [];

    var filename = $(obj).text();
    console.log(filename)
    $.ajax({
       url: '/mulselect_hhvm/',
       type: 'POST',
       data: {filename: filename},
        //必须注释
        //processData: false,
       //contentType: false,
       success: function(obj){
           var arg = eval(obj);

           //console.log(arg[1].kernel);

           var list = {
                  name: arg[0].title,
                    //color: colors[count],
                  data: [parseInt(arg[0].toys_hello_world), parseInt(arg[0].wordpress), parseInt(arg[0].drupal7), parseInt(arg[0].mediawiki), parseInt(arg[0].codeigniter), parseInt(arg[0].toys_fibonacci) ,
                        parseInt(arg[0].magento1), parseInt(arg[0].drupal8_no_cache), parseInt(arg[0].drupal8_page_cache), parseInt(arg[0].laravel4), parseInt(arg[0].laravel5), parseInt(arg[0].sugarcrm_login_page), parseInt(arg[0].sugarcrm_home_page)]
            };
           //list.color = colors[7];
           var length = listNginx.length;
           if(length > 0){
               for(var i=0; i<length; i++){
                   if(listNginx[i].name == list.name){
                   listNginx.splice(i, 1);
                   break;
                   }
                   if(i == (listNginx.length-1)){
                   listNginx.push(list);
                   }
               }
           }
           else {
               listNginx.push(list);
           }
           //This is for line color
           var length_now = listNginx.length;
           for(var i=0; i<length_now; i++){
               listNginx[i].color = colors[i]
           }

           series=series.concat(listNginx)
           //series.push(listNginx)
           //console.log(listNginx[0].name);
           //console.log(listNginx.length);
           var json = {};
            json.chart = chart;
            json.title = title;
            json.subtitle = subtitle;
            json.tooltip = tooltip;
           // json.colors = colors;
            json.xAxis = xAxis;
            json.yAxis = yAxis;
            json.series = series;
            json.plotOptions = plotOptions;
            json.credits = credits;
           $('#container').highcharts(json);
           //nginx-conf
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
    console.log(key1)
    console.log(key)
    var chart = {
      type: 'column'
   };
   var title = {
      text: 'HHVM 测试数据比较'
   };
   var subtitle = {
      text: 'Source: 华芯通半导体'
   };
   var xAxis = {
      categories: ['toys-hello-world','wordpress','drupal7','mediawiki','codeigniter-hello-world','toys-fibonacci','magento1','drupal8-no-cache','drupal8-page-cache','laravel4-hello-world','laravel5-hello-world','sugarcrm-login-page', 'sugarcrm-home-page'],
      crosshair: true
   };
   var yAxis = {
      min: 0,
      title: {
         text: 'Req/Sec'
      }
   };
   var tooltip = {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
         '<td style="padding:0"><b>{point.y:.1f} req/sec</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
   };
   var plotOptions = {
      column: {
         pointPadding: 0.2,
         borderWidth: 0
      }
   };
   var credits = {
      enabled: false
   };

    $.ajax({
        type:"GET",
        url: '/hhvm_compare/',
        data: {key: key, key1: key1},
        success: function(dict){

            var arg = eval(dict);
            console.log(arg)
            //var arg = JSON.parse(dict);
            var list = {
                  name: arg[0].title,
                  data: [parseInt(arg[0].toys_hello_world), parseInt(arg[0].wordpress), parseInt(arg[0].drupal7), parseInt(arg[0].mediawiki), parseInt(arg[0].codeigniter), parseInt(arg[0].toys_fibonacci) ,
                        parseInt(arg[0].magento1), parseInt(arg[0].drupal8_no_cache), parseInt(arg[0].drupal8_page_cache), parseInt(arg[0].laravel4), parseInt(arg[0].laravel5), parseInt(arg[0].sugarcrm_login_page), parseInt(arg[0].sugarcrm_home_page)]
            };

            var list_x86 = {
                  name: arg[1].title,
                  data: [parseInt(arg[1].toys_hello_world), parseInt(arg[1].wordpress), parseInt(arg[1].drupal7), parseInt(arg[1].mediawiki), parseInt(arg[1].codeigniter), parseInt(arg[1].toys_fibonacci) ,
                        parseInt(arg[1].magento1), parseInt(arg[1].drupal8_no_cache), parseInt(arg[1].drupal8_page_cache), parseInt(arg[1].laravel4), parseInt(arg[1].laravel5), parseInt(arg[1].sugarcrm_login_page), parseInt(arg[1].sugarcrm_home_page)]
            };

            var series = new Array();
            //series.push(temp);
            series.push(list);
            series.push(list_x86);
            console.log(series);
           var json = {};
            json.chart = chart;
            json.title = title;
            json.subtitle = subtitle;
            json.tooltip = tooltip;
            json.xAxis = xAxis;
            json.yAxis = yAxis;
            json.series = series;
            json.plotOptions = plotOptions;
            json.credits = credits;

           $('#container').highcharts(json);
        },
        error: function(){
            alert("false");
        }
    });
}

