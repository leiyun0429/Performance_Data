$(document).ready(function() {
   var chart = {
      zoomType: 'xy'
   };
   var subtitle = {
      text: 'Source: Hadoop 测试数据比较'
   };
   var title = {
      text: '华芯通半导体'
   };
   var xAxis = {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      crosshair: true
   };
   var yAxis= [{ // 第一条Y轴
      labels: {
         format: '{value}\xB0C',
         style: {
            color: Highcharts.getOptions().colors[1]
         }
      },
      title: {
         text: 'Temperature',
         style: {
            color: Highcharts.getOptions().colors[1]
         }
      }
   }, { // 第二条Y轴
      title: {
         text: 'Rainfall',
         style: {
            color: Highcharts.getOptions().colors[0]
         }
      },
      labels: {
         format: '{value} mm',
         style: {
            color: Highcharts.getOptions().colors[0]
         }
      },
      opposite: true
   }];
   var tooltip = {
      shared: true
   };
   var legend = {
      layout: 'vertical',
      align: 'left',
      x: 120,
      verticalAlign: 'top',
      y: 100,
      floating: true,
      backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
   };
   var series= [{
         name: 'Rainfall',
            type: 'column',
            yAxis: 1,
            data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
            tooltip: {
                valueSuffix: ' mm'
            }

         }, {
            name: 'Temperature',
            type: 'spline',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
            tooltip: {
                valueSuffix: '\xB0C'
           }
        }
   ];

   var json = {};
   json.chart = chart;
   json.title = title;
   json.subtitle = subtitle;
   json.xAxis = xAxis;
   json.yAxis = yAxis;
   json.tooltip = tooltip;
   json.legend = legend;
   json.series = series;
   $('#container').highcharts(json);
});
