// function drawall() {
//     var average = drawline();
//     //drawpie(average);
// }

function auto_update(obj) {
    var date1 = '<option value="01">01</option> <option value="02">02</option> <option value="03">03</option> <option value="04">04</option> <option value="05">05</option> <option value="06">06</option>'+
                '<option value="07">07</option> <option value="08">08</option> <option value="09">09</option> <option value="10">10</option> <option value="11">11</option> <option value="12">12</option> <option value="13">13</option>'+
                '<option value="14">14</option> <option value="15">15</option> <option value="16">16</option> <option value="17">17</option> <option value="18">18</option> <option value="19">19</option>'+
                '<option value="20">20</option> <option value="21">21</option> <option value="22">22</option> <option value="23">23</option> <option value="24">24</option> <option value="25">25</option>'+
                '<option value="26">26</option> <option value="27">27</option> <option value="28">28</option>'
    var date2 = '<option value="29">29</option> <option value="30">30</option>'
    var date3 = '<option value="31">31</option>'
    var month = $('#date_month').val()
    //console.log('')
    if(month == '02'){
        $('#date_day').children().remove()
        $('#date_day').append(date1)
    }else if(month == '04' || month == '06' || month == '09' || month == '11'){
        $('#date_day').children().remove()
        $('#date_day').append(date1 + date2)
    }else{
        $('#date_day').children().remove()
        $('#date_day').append(date1 + date2 + date3)
    }
}


function auto_update_end() {
    var date1 = '<option value="01">01</option> <option value="02">02</option> <option value="03">03</option> <option value="04">04</option> <option value="05">05</option> <option value="06">06</option>'+
                '<option value="07">07</option> <option value="08">08</option> <option value="09">09</option> <option value="10">10</option> <option value="11">11</option> <option value="12">12</option> <option value="13">13</option>'+
                '<option value="14">14</option> <option value="15">15</option> <option value="16">16</option> <option value="17">17</option> <option value="18">18</option> <option value="19">19</option>'+
                '<option value="20">20</option> <option value="21">21</option> <option value="22">22</option> <option value="23">23</option> <option value="24">24</option> <option value="25">25</option>'+
                '<option value="26">26</option> <option value="27">27</option> <option value="28">28</option>'
    var date2 = '<option value="29">29</option> <option value="30">30</option>'
    var date3 = '<option value="31">31</option>'
    var month = $('#date_month_end').val()
    //console.log('')
    if(month == '02'){
        $('#date_day_end').children().remove()
        $('#date_day_end').append(date1)
    }else if(month == '04' || month == '06' || month == '09' || month == '11'){
        $('#date_day_end').children().remove()
        $('#date_day_end').append(date1 + date2)
    }else{
        $('#date_day_end').children().remove()
        $('#date_day_end').append(date1 + date2 + date3)
    }
}


function drawline(obj) {
    console.log($(obj).prev().attr("id"))
    var machine = $('#machine').val();
    var month = $('#date_month').val();
    var day = $('#date_day').val();
    var month_end = $('#date_month_end').val();
    var day_end = $('#date_day_end').val();

    var title = {
       text: null
    };

    var yAxis = {
      title: {
         text: 'Server Usage (%)'
      },
      plotLines: [{
         value: 0,
         width: 1,
         color: '#808080'
      }],
        tickInterval: 10,
      min: 0,
       max :100
   };

   var legend = {
      //layout: 'vertical',
      borderWidth: 0
   };

   var credits = {
      enabled: false
   };


   var title_pie = {
       text: null
   };

   var chart_pie = {
       plotBackgroundColor: null,
       plotBorderWidth: null,
       plotShadow: false
   };
   var credits_pie = {
      enabled: false
   };

    $.ajax({
    type:"GET",
    url: "/cpu_usage/",
    data: {machine: machine, month: month , day: day, month_end: month_end, day_end: day_end},
    success: function(dict){
        var arg = eval(dict);
        var xAxis = {
               categories: arg[1],
               tickInterval: 3
         };

        if(parseInt(month_end) - parseInt(month) > 2){
            xAxis.tickInterval=3;
        }

        var sum = 0;
        for(var i=0; i<arg[0].length; i++){
            sum = sum + arg[0][i];
        }

        var average = sum/arg[0].length ;
        $('#usage').html(average + '%');
        //var arg = JSON.parse(dict);
        var list_cpu = {
            name: 'CPU',
            data: arg[0]
        };

        var list_ram = {
            name: 'RAM',
            data: arg[2]
        };

        var list_io = {
            name: 'IO',
            data: arg[3]
        };

        //console.log(list_cpu);
        var series = new Array();
        //series.push(temp);

       series.push(list_cpu);
        series.push(list_ram);
        series.push(list_io);
       var json = {};

       json.title = title;
       json.xAxis = xAxis;
       json.yAxis = yAxis;
       json.credits = credits;
       json.legend = legend;
       json.series = series;
       $('#container1').highcharts(json);

       var series_pie= [{
          type: 'pie',
          name: 'Browser share',
          data: [
             {
                name: 'Usage',
                y: average,
                sliced: true,
                selected: true
             },
             ['Free',    100-average]
          ]
       }];

       var json_pie = {};
       json_pie.title = title_pie;
       json_pie.chart = chart_pie;
       json_pie.credits = credits_pie;
       json_pie.series = series_pie;
       $('#container').highcharts(json_pie);


    },
    error: function(){
        alert("false");
    }
});

};


function drawmultiline(obj) {
    //var selected = $("#example-multiple option:selected");
    $("#multi-draw").children().remove();
    var query_date = $('#special-query').val()
    var selected = $("#example-multiple").val()
    //console.log(selected.length)
    console.log(query_date)
    var myDate = new Date();
    var toyear = myDate.getFullYear()
    //var toyear = '2018'
    var tomonth = myDate.getMonth() + 1
    if(tomonth<10){
        tomonth = '0' + tomonth
    }
    //var tomonth = '04'
    var today = myDate.getDate()
    var todate = toyear + '-' + tomonth + '-' + today

    for(var i=0; i<selected.length; i++){
        draw_for_multi(selected[i], todate, query_date)
        console.log(selected[i])
    }
}


function draw_for_multi(machine, todate, query_date) {
    console.log(machine)
    //var line = "<div id=\"" + machine + "\" style=\"width: 50%; height: 300px; left: 35%\">"+ machine + "</div><hr>"
    var line = "<div id=\"" + machine + "\" style=\"width: 70%; height: 300px; margin-left: 15%\"></div>"
    $("#multi-draw").append(line)

    var yAxis = {
      title: {
         text: 'Server Usage (%)'
      },
      plotLines: [{
         value: 0,
         width: 1,
         color: '#808080'
      }],
        tickInterval: 10,
        min: 0,
        max :100
   };

   var legend = {
      //layout: 'vertical',
      borderWidth: 0
   };

   var credits = {
      enabled: false
   };

    $.ajax({
    type:"GET",
    url: "/draw_multi/",
    data: {machine: machine, todate: todate, query_date: query_date},
    success: function(dict){
        var arg = eval(dict);
        var title = {
           text: machine
        };
        var xAxis = {
               categories: arg[1],
               tickInterval: 1
         };
        if(parseInt(query_date) > 23 || parseInt(query_date) < 800){
            xAxis.tickInterval=23;
            for(var i=0;i<arg[1].length;i+=23){
                var str = arg[1][i].split(' ')
                arg[1][i] = str[0]
            }
            xAxis.categories=arg[1]
        }

        if(parseInt(query_date) > 800){
            xAxis.tickInterval=23*7;
            for(var i=0;i<arg[1].length;i+=23){
                var str = arg[1][i].split(' ')
                arg[1][i] = str[0]
            }
            xAxis.categories=arg[1]
        }

        var list_cpu = {
            name: 'CPU',
            data: arg[0]
        };

        var list_ram = {
            name: 'RAM',
            data: arg[2]
        };

        var list_io = {
            name: 'IO',
            data: arg[3]
        };

        console.log(list_cpu);
        var series = new Array();

        series.push(list_cpu);
        series.push(list_ram);
        series.push(list_io);
       var json = {};

       json.title = title;
       json.xAxis = xAxis;
       json.yAxis = yAxis;
       json.credits = credits;
       json.legend = legend;
       json.series = series;
        $("#"+machine).highcharts(json);
    },
    error: function(){
        alert("false");
    }
});
}


function rerank(obj) {
    //console.log($(obj).attr('id'))
    //$(obj).attr('id'))
    var key = $(obj).attr('id')
    $.ajax({
        type:"GET",
        url: "/rank_server/",
        data: {key: key},
        success: function(dict){
            var arg = eval(dict);
            var first = '<tr><td>Server Name <i class="fa fa-sort" aria-hidden="true" id="server-rank" onclick="rerank(this)"></i></td>\n' +
                '<td>Platform <i class="fa fa-sort" aria-hidden="true" id="platform-rank" onclick="rerank(this)"></i></td>\n' +
                '<td>HardDisk <i class="fa fa-sort" aria-hidden="true" id="harddisk-rank" onclick="rerank(this)"></i></td>\n' +
                '<td>CPU <i class="fa fa-sort" aria-hidden="true" id="cpu-rank" onclick="rerank(this)"></i></td>\n' +
                '<td>RAM <i class="fa fa-sort" aria-hidden="true" id="ram-rank" onclick="rerank(this)"></i></td>\n' +
                '<td>Current User <i class="fa fa-sort" aria-hidden="true" id="user-rank" onclick="rerank(this)"></i></td>\n' +
                '</tr>'
            console.log(arg[0].length)
            var start = '<tr><td>'
            var link = '</td><td>'
            var end = '</td></tr>'
            var trtd = ''
            for(var i =0; i<arg.length; i++){
                trtd = trtd + start
                for(var j=0; j<arg[0].length; j++){
                    if(j==(arg[0].length-1)){
                        trtd = trtd + arg[i][j] + end
                    }else {
                        trtd = trtd + arg[i][j] + link
                    }

                }
            }
            console.log(trtd)
            var all=first + trtd
            $('#server-info').children().remove()
            $('#server-info').append(all)


        },
        error: function(){
            alert("false");
        }
    });
}


/*function rank_number(rank_name) {
    var array = ['server-rank', 'platform-rank', 'harddisk-rank', 'cpu-rank', 'ram-rank', 'user-rank']
    for(var i = 0; i< array.length; i++){
        if(rank_name==array[i]){
            return i;
        }
    }
}*/


/*
function spec_query() {
    var query_date = $('#special-query').val()
    var title = {
       text: null
    };

    var yAxis = {
      title: {
         text: 'Server Usage (%)'
      },
      plotLines: [{
         value: 0,
         width: 1,
         color: '#808080'
      }],
        tickInterval: 10,
        min: 0,
        max :100
   };

   var legend = {
      //layout: 'vertical',
      borderWidth: 0
   };

   var credits = {
      enabled: false
   };

    $.ajax({
    type:"GET",
    url: "/draw_multi/",
    data: {machine: machine, todate: todate},
    success: function(dict){
        var arg = eval(dict);
        var xAxis = {
               categories: arg[1],
               tickInterval: 1
         };
        /!*if(parseInt(month_end) - parseInt(month) > 2){
            xAxis.tickInterval=3;
        }*!/

        var list_cpu = {
            name: 'CPU',
            data: arg[0]
        };

        var list_ram = {
            name: 'RAM',
            data: arg[2]
        };

        var list_io = {
            name: 'IO',
            data: arg[3]
        };

        console.log(list_cpu);
        var series = new Array();

       series.push(list_cpu);
        series.push(list_ram);
        series.push(list_io);
       var json = {};

       json.title = title;
       json.xAxis = xAxis;
       json.yAxis = yAxis;
       json.credits = credits;
       json.legend = legend;
       json.series = series;
        $("#"+machine).highcharts(json);
    },
    error: function(){
        alert("false");
    }
});
}*/


// function drawpie(usage){
//     var title_pie = {
//        text: null
//    };
//    var chart_pie = {
//        plotBackgroundColor: null,
//        plotBorderWidth: null,
//        plotShadow: false
//    };
//     console.log(usage)
//     var free = 100 -usage;
//     console.log(free)
//    var series_pie= [{
//       type: 'pie',
//       name: 'Browser share',
//       data: [
//          {
//             name: 'Usage',
//             y: 46,
//             sliced: true,
//             selected: true
//          },
//          ['Free',    54],
//       ]
//    }];
//    var credits_pie = {
//       enabled: false
//    };
//    // Radialize the colors
//    Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
//       return {
//          radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
//          stops: [
//             [0, color],
//             [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
//          ]
//       };
//    });
//
//    var json_pie = {};
//    json_pie.title = title_pie;
//    json_pie.chart = chart_pie;
//    json_pie.credits = credits_pie;
//    json_pie.series = series_pie;
//    $('#container').highcharts(json_pie);
// };