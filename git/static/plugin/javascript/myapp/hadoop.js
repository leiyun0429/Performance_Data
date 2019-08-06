$('#hadoop-aw-sele').hide();
$('#hadoop-x86-sele').hide();
var listNginx = new Array();
var show_conf = new Array();
var temp = {
    name: 'chengshuai',
    data: [32.24, 28.089, 44.876, 50.299, 55.359, 58.146, 41.387, 69.3, 28.102, 227.92, 666.269, 159.855]
    };
listNginx.push(temp);

//切换到多项选择查看数据(查看方式一)
function awChoose() {
    $('#hadoop-sele').show();
    $('#hadoop-sele-x86').show();
    $('#hadoop-aw-sele').hide();
    $('#hadoop-x86-sele').hide();
}
//切换到对比选择查看数据(查看方式二)
function xChoose() {
    $('#hadoop-sele').hide();
    $('#hadoop-sele-x86').hide();
    $('#hadoop-aw-sele').show();
    $('#hadoop-x86-sele').show();
}



$(document).ready(function() {
   var chart = {
      type: 'column'
   };
   var title = {
      text: 'Hadoop 测试数据比较'
   };
   var subtitle = {
      text: 'Source: 华芯通半导体'
   };
   var xAxis = {
      categories: ['HadoopSleep','HadoopSort','HadoopTerasort','HadoopWordcount','HadoopDfsioe-read','HadoopDfsioe-write','HadoopAggregation','HadoopJoin','HadoopScan','HadoopPagerank','HadoopBayes','HadoopKmeans'],
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
         '<td style="padding:0"><b>{point.y:.1f} sec</b></td></tr>',
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

   var series= [{
        name: 'HSRP1.1',
            data: [32.24, 28.089, 44.876, 50.299, 55.359, 58.146, 41.387, 69.3, 28.102, 227.92, 666.269, 159.855]
        }, {
            name: 'HSRP1.01',
            data: [38.454, 36.923, 58.782, 62.469, 73.215, 74.741, 65.771, 102.064, 52.516, 280.816, 759.477, 192.543]
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
   json.credits = credits;
   $('#container').highcharts(json);

});

//多项选择查看数据函数
function submitMul(obj) {
    console.log('haha')
   var chart = {
      type: 'column'
   };
   var title = {
      text: 'Hadoop 测试数据比较'
   };
   var subtitle = {
      text: 'Source: 华芯通半导体'
   };
   var xAxis = {
      categories: ['HadoopSleep','HadoopSort','HadoopTerasort','HadoopWordcount','HadoopDfsioe-read','HadoopDfsioe-write','HadoopAggregation','HadoopJoin','HadoopScan','HadoopPagerank','HadoopBayes','HadoopKmeans'],
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
         '<td style="padding:0"><b>{point.y:.1f} sec</b></td></tr>',
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

   var colors= ['#058DC7', '#50B432', '#ED561B', '#DDDF00',
             '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'];
    var filename = $(obj).text();
    $.ajax({
       url: '/hadoop_mulselect/',
       type: 'POST',
       data: {filename: filename},
        //必须注释
        //processData: false,
       //contentType: false,
       success: function(obj){
           var arg = eval(obj);
           console.log(arg)
           //console.log(arg[1].kernel)
           var list = {
                  name: arg[0].title,
                  data: [parseInt(arg[0].hadoopsleep), parseInt(arg[0].hadoopsort), parseInt(arg[0].hadoopteraort), parseInt(arg[0].hadoopwordcount), parseInt(arg[0].hadoopdfsioe_read), parseInt(arg[0].hadoopdfsioe_write) ,
                        parseInt(arg[0].hadoopaggregation), parseInt(arg[0].hadoopjoin), parseInt(arg[0].hadoopscan), parseInt(arg[0].hadooppagerank), parseInt(arg[0].hadoopbayes), parseInt(arg[0].hadoopkmeans)]
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
            json.chart = chart;
            json.title = title;
            json.subtitle = subtitle;
            json.tooltip = tooltip;
            json.xAxis = xAxis;
            json.yAxis = yAxis;
            json.series = listNginx;
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
      text: 'Hadoop 测试数据比较'
   };
   var subtitle = {
      text: 'Source: 华芯通半导体'
   };
   var xAxis = {
      categories: ['HadoopSleep','HadoopSort','HadoopTerasort','HadoopWordcount','HadoopDfsioe-read','HadoopDfsioe-write','HadoopAggregation','HadoopJoin','HadoopScan','HadoopPagerank','HadoopBayes','HadoopKmeans'],
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
         '<td style="padding:0"><b>{point.y:.1f} sec</b></td></tr>',
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
        url: '/hadoop_compare/',
        data: {key: key, key1: key1},
        success: function(dict){

            var arg = eval(dict);
            console.log(arg)
            //var arg = JSON.parse(dict);
            var list = {
                  name: arg[0].title,
                  data: [parseInt(arg[0].hadoopsleep), parseInt(arg[0].hadoopsort), parseInt(arg[0].hadoopteraort), parseInt(arg[0].hadoopwordcount), parseInt(arg[0].hadoopdfsioe_read), parseInt(arg[0].hadoopdfsioe_write) ,
                        parseInt(arg[0].hadoopaggregation), parseInt(arg[0].hadoopjoin), parseInt(arg[0].hadoopscan), parseInt(arg[0].hadooppagerank), parseInt(arg[0].hadoopbayes), parseInt(arg[0].hadoopkmeans)]
            };

            var list_x86 = {
                  name: arg[1].title,
                  data: [parseInt(arg[1].hadoopsleep), parseInt(arg[1].hadoopsort), parseInt(arg[1].hadoopteraort), parseInt(arg[1].hadoopwordcount), parseInt(arg[1].hadoopdfsioe_read), parseInt(arg[1].hadoopdfsioe_write) ,
                        parseInt(arg[1].hadoopaggregation), parseInt(arg[1].hadoopjoin), parseInt(arg[1].hadoopscan), parseInt(arg[1].hadooppagerank), parseInt(arg[1].hadoopbayes), parseInt(arg[1].hadoopkmeans)]
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


//nginx页面的数据导入到数据库
function Split() {
    var filename = $('#import_data').val();
    filename = "hadoop/" + filename;
    $.ajax({
       url: '/hadoop_split/',
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


//Hadoop数据管理界面的删除指定行数据
function delNginx(obj) {
    var temp = obj
    //console.log($(temp).parent().css("background-color","red"))
    //console.log($(temp).parent().parent().children().eq(0).text())
    //var title = $(temp).parent().parent().children().eq(0).children().val()
    var title = $(temp).parent().parent().children().eq(0).text()
    $.ajax({
        type:"GET",
        url: "/delhadoop/",
        data: {title: title},
        success: function(callback){
                window.location.reload()
           }
    })
}
//hadoop数据管理界面的修改指定行数据
function modNginx(obj) {
    var title = new Array(13);
    title[0] = $(obj).parent().parent().children().eq(0).text()
    for(var i=1; i<13; i++){
      title[i] = $(obj).parent().parent().children().eq(i).children().val()
    }
    var str = JSON.stringify(title)
    $.ajax({
        type:"GET",
        url: "/modhadoop/",
        data: {title: str},
        success: function(callback){
               console.log('yes')
                window.location.reload()
           }
    })
}
