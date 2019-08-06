function draw_figure(figure, name, count) {
    var line = "<div id=\"" + name + "\" style=\"width: 100%; height: 440px;display: inline-block;\"></div>"
    var div_line = '<div style="width: 100%; height: 2px; background-color: aqua;margin-top: 5px"></div>'
    $('#chart').append(line)
    $('#chart').append(div_line)
    var series = figure['data']

    var length = series.length
    var percent = parseInt(80/(length+2))
    percent = percent.toString() + '%'
    console.log(percent)
    console.log(figure)

    var legend_lines = parseInt(count/3) + 1
    var legend_top = '20px'
    var grid_top = '60px'
    if(legend_lines==2){
        legend_top = '25px'
        grid_top = '90px'
    }
    if(legend_lines==3){
        legend_top = '25px'
        grid_top = '100px'
    }
    if(legend_lines==4){
        legend_top = '15px'
        grid_top = '120px'
    }

    if(figure['xaxis'].length >8){
        var rotate = 45
        var fontsize = 10
    }
    else {
        var rotate = 0
        var fontsize = 12
    }

    for(var i=0; i<series.length;i++){
        series[i].barWidth = percent
        series[i].type = 'bar'
    }

    var option = {
                title : {
                    text: name
                },
                tooltip : {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow',
                        label: {
                            show: true
                        }
                    }
                },
                grid: {
                  top: grid_top
                },
                color: ['#5B9BD5','#ED7D31','#70AD47', '#A5A5A5', '#FFC000', '#4472C4', '#997300','#264478', '#9E480E', '#43682B'],
                toolbox: {
                    show : true,
                    orient: 'vertical',
                    feature : {
                        mark : {show: true},
                        dataView : {show: true, readOnly: true, title: 'DataView'},
                        magicType: {show: true, type: ['line', 'bar'], title: {line: 'Switch Line', bar: 'Switch Bar'}},
                        restore : {show: true, title: 'Back'},
                        saveAsImage : {show: true, title: 'Save'}
                    },
                    itemGap: 20,
                    right: 17,
                    top: 70
                },
                legend: {
                    layout: 'vertical',
                    top: legend_top,
                    align: 'right',
                    verticalAlign: 'middle',
                },
                xAxis: {
                    type: 'category',
                    data: figure['xaxis'],
                    axisLabel: {
                        interval:0,
                        fontSize: fontsize,
                        fontStyle: 'italic',
                        rotate: rotate,
                        width: 0
                    }
                },
                yAxis: {
                    title: {
                        text: 'size'
                    },
                }
            }
    option.series = series
    let echart_obj = echarts.init(document.getElementById(name))
    echart_obj.setOption(option)
    return echart_obj
}