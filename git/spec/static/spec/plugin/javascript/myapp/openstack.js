
$(document).ready(function() {
   var chart = {
      type: 'pie',
      options3d: {
         enabled: true,
         alpha: 45
      }
   };
   var title = {
      text: 'OpenStack 测试数据'
   };
   var subtitle = {
      text: 'OpenStack 3D圆环图'
   };

   var plotOptions = {
      pie: {
         innerSize: 100,
         depth: 45
      }
   };
   var series= [{
         name: 'haha',
         data: [
            ['Bananas', 8],
            ['Kiwi', 3],
            ['Mixed nuts', 1],
            ['Oranges', 6],
            ['Apples', 8],
            ['Pears', 4],
            ['Clementines', 4],
            ['Reddish (bag)', 1],
            ['Grapes (bunch)', 1]
         ]
   }];

   var json = {};
   json.chart = chart;
   json.title = title;
   json.subtitle = subtitle;
   json.plotOptions = plotOptions;
   json.series = series;
   $('#container').highcharts(json);
});