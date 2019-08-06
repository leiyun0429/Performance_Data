//document.write("<script language=javascript src='table_tool.js'></script>");
jQuery(function ($) {
    copyFn()
    $("#query_condition").bootstrapTable({
        //	url: './GetData.txt',         //请求后台的URL（*）
        //	method: 'get',                      //请求方式（*）
        striped: true,                      //是否显示行间隔色
        pagination: true,                   //是否显示分页（*）
        //sortable: true,  					//是否启用排序
        //sortOrder: "asc",                   //排序方式
        //	sidePagination: "client",           //分页方式：client客户端分页，server服务端分页（*）
        pageNumber: 1,                       //初始化加载第一页，默认第一页
        pageSize: 7,							//每页的记录行数（*）

    });

    $('#filter_result').on('shown.bs.modal', function () {
      filter_query_table()
    })

    window.onload = function (ev) {
        $('form#upload').submit(function(event) {
            event.preventDefault();
            var filename_check = ['csv', 'ini', '7z']
            var data = new FormData(this);

            var array = new Array()
            var files = document.getElementById('files').files;
            for (var i=0; i<files.length; i++){
                var file = files[i];
                array.push(file.name)

            }
            console.log(array)
            //var array = data.getAll('filename')


            var filename = []
            var flag = true
            if(array.length == filename_check.length){
                for(var i=0; i<array.length; i++){
                    //filename.push(array[i].name.split('.')[1])
                    filename.push(array[i].split('.')[1])
                    }

                for(var i=0; i<filename_check.length; i++){
                    if(filename.indexOf(filename_check[i]) == -1){
                        flag = false
                        break;
                    }
                }

                if(flag == false){
                    alert('File Formats are wrong');
                }else{
                    $('#myDialog').css('pointer-events', 'none')
                    $('#myDialog').css('background-color', 'gray')
                    ne = new dynamic()
                    $.ajax({
                        type:"POST",
                        async: true,
                        url: "/upload/",
                        data: data,
                        processData: false,
                        contentType: false,
                        xhr: function(){
                            xhr_request = $.ajaxSettings.xhr()
                            if(xhr_request.upload){
                                xhr_request.upload.addEventListener('progress', function (ev1) {
                                    var loaded = ev1.loaded;
                                    var total = ev1.total;
                                    console.log(total)
                                    var percent = Math.floor(100*loaded/total)+"%";
                                    var load = Math.floor(100*loaded/total)
                                    $('#loadprogress').attr('value', load)
                                    //$('#progressdisplay').attr('value','Upload state:' + percent)
                                    $('#progressdisplay').html('Upload state:' + percent)
                                }, false)
                            }
                            return xhr_request
                        },
                        success: function(dict){
                            clearInterval(ne.timers)
                            $('#myDialog').css('pointer-events', 'auto')
                            $('#myDialog').css('background-color', '#FFC')
                            var arg = eval(dict)
                            console.log(arg)
                            //alert(arg.count + ' file upload successfully')
                            $('#upload_status').html(arg.message)
                        },
                        error: function(){
                            console.log('false')
                            $('#myDialog').css('pointer-events', 'auto')
                            $('#myDialog').css('background-color', '#FFC')
                        }
                    });
                }
            }else {
                alert('Files Number is Wrong!')
            }
        });
    }

    var app = ''
    var cookie_array = document.cookie.split('; ')
    for(var i=0;i<cookie_array.length;i++){
        var key_value = cookie_array[i].split('=')
        if(key_value[0]=='app'){
            app = key_value[1]
            break
        }
    }

    if(app==''){
        $(".page_list").first().css("color","#1075d9");
        query_box('speccpu', true)
    }else {
        $("#li-clink").find('a').each(function () {
            if($(this).attr('value').toLowerCase()==app){
                $('#orderColumn').val($(this).attr('value'))
                $(this).css("color","#1075d9");
                if(app=='lmbench-stream'||app=='lmbench-latency'){
                    $(".page_list1").next('ul').show()
                    $('.page_list1').find('img').attr("src","/static/spec/plugin/decoration/img/down.png");
                }else {
                    $(".page_list1").next('ul').hide()
                }
            }
        })
        query_box(app, true)
    }

    setInterval(CheckIfOutTime, 30000)

});


function CheckIfOutTime() {
    if(getCookie('user_number') == null){
        window.location.href = window.location.protocol + window.location.host
        return
    }
}

var Global_Filter_Table_Id = []
var GLOBAL_STANDARD = {
    STANDARD_TITLE: '',
    STANDARD_IDS: '',
    STANDARD_DATA_FORM: '',
    STANDARD_DATA_FIGURE: '',
    STANDARD_SOFT_CONFIG: '',
    STANDARD_HARD_CONFIG: '',
    STANDARD_TUNE: '',
    STANDARD_TUNE_CUNSTOMIZATION: ''
}

var gettype=Object.prototype.toString


var ii = 20

function dynamic() {

    function dymamic_status() {

        if(ii==19){
            $('#upload_status').empty().html('Waiting upload.')
            ii=0;
        }else {
            $('#upload_status').append('.')
            ii += 1
        }
     }

     this.timers = setInterval(dymamic_status, 1000)
}


// function data_gain() {
//     var query = $('#query').serialize()
//     console.log(query)
//         $.ajax({
//         type:"GET",
//         url: "/spec/query_result_list",
//         data: {query: query},
//         success: function(dict){
//
//         }
//     })
// }


function query_box(obj,flag) {
    if(flag==false){
        var app = $(obj).attr('value')
        app = app.toLowerCase()
        console.log(app)
    }else {
        var app = obj
        $('a[value="SpecCPU"]').parent().css("background-color","lightcyan")
    }

    var select = '<select '
    var back_select = '</select>'
    var style = ' class="check-down" multiple="multiple" '
    var style_name = ' name='
    var option = '<option '
    var back_option = '</option>'
    var option_value = ' value='
    var back = '>'
    var filter_string = ''
    var filter_extra = ''
    var li = '<li style="margin-bottom: 0px;height:25px;" data-stopPropagation="true">'
    var back_li = '</li>'
    var label = '<label class="checkbox" style="margin-left:25px;">'
    var back_label = '</label>'
    var input = '<input type="checkbox" style="float:left;" onclick="add_filters(this)" value='
    var query_box_dict = {
        version: 'Release',
        cpu_type: 'SoC',
        total_threads: 'Threads',
        board_type: 'Platform',
        os: 'OS',
        kernel: 'Kernel',
        gcc: 'GCC',
        username: 'Tester',
        last_update: 'Time',
        disk_type: 'Disk_Type',
        speed: 'NIC'
    }

    $.ajax({
        type: "GET",
        url: "/spec/spec_filter",
        data: {name: app},
        success: function (dict) {
            var filter_item = eval(dict)
            console.log(filter_item)
            var default_items = filter_item.defaultts
            var extra_items = filter_item.extra
            var release_attr = filter_item.release_attr
            $('#query').empty()
            //This is filter box
            for(var items in default_items){
                filter_string += select + ' id=' + '"' + items + '"' + style_name + '"' + items + '"' + style + back
                for(var i=0; i<default_items[items].length;i++){
                    if(items=='version' || items=='cpu_type' || items=='board_type'){
                        filter_string += option + option_value + '"' + default_items[items][i] + '"' + back + default_items[items][i].replace('_', ' ') + back_option
                    }else {
                        filter_string += option + option_value + '"' + default_items[items][i] + '"' + back + default_items[items][i] + back_option
                    }
                }

                filter_string += back_select
                $('#query').append(filter_string)
                $('#' + items).multiselect({
                    buttonWidth: 70,
                    includeSelectAllOption: false,
                    allSelectedText:'select all',
                    nonSelectedText: query_box_dict[items],
                    selectedList:4,
                    numberDisplayed: 3,
                });
                filter_string = ''
            }

            $('#query').find('input[value=reference_data]').each(function () {
                $(this).parent().parent().parent().empty().append('<a><label class="checkbox" style="padding: 3px 20px 3px 3px;font-weight: bold"> Reference Data</label></a>')
            })

            //This is filter box
            for(var i=0; i<extra_items.length; i++){
                filter_extra += li + label + input + '"' + extra_items[i] + '"' + back + query_box_dict[extra_items[i]] + back_label + back_li
            }
            $('#add_filter').empty()
            $('#add_filter').append(filter_extra)

            var cookie_array = document.cookie.split('; ')
            var params = ''
            for(var i=0;i<cookie_array.length;i++){
                var key_value = cookie_array[i].split('path=')
                if(key_value[0]=='copy_'){
                    params = key_value[1]
                    params = params.substring(1, params.length-1)
                    delCookie('copy_path')
                    break
                }
            }

            if(params==''){
                draw_all_data('latest')
            }else {
                draw_all_data(params)
            }

        }
    });
}


function delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime()+1);
    var cval= getCookie(name);
    if(cval!=null){
        document.cookie= name + "="+cval+";expires="+exp.toUTCString() + ';path=/';
    }
}


function getCookie(name) {
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
    return unescape(arr[2]);
    else
    return null;
}



var Global_Filter_Param = ''
var Global_Filter_Id = ''

function filter_query_table() {
    Global_Filter_Table_Id = []
    var query = $('#query').serialize()
    $('#filter_checkbox').attr('checked', false)
    $('#filter_checkbox').css('display', 'none')
    $('#filter_result').find('button[class="btn btn-primary"]').prop('disabled', true)
    if(query == ''){
        var id = $('#query').children().children().eq(0).attr('id')
        $('#'+ id).find('option').each(function(){
            var value = $(this).attr('value')
            query += id + '=' + value + '&'
        });
        query = query.substring(0, query.length-1)
    }
    var back = '>'
    var tr = '<tr>'
    var back_tr = '</tr>'
    var td = '<td '
    var back_td = '</td>'
    var label = '<label style="display:block;">'
    var back_label = '</label>'
    var input = '<input style="text-align: center;vertical-align: middle" onclick="RefreshFilterStatus(this)" '
    var td_style = ''
    var query_condition_str = ''
    var name = 'query_item'
    var query_box_dict = {
        version: 'Release',
        cpu_type: 'SoC',
        total_threads: 'Threads',
        board_type: 'Platform',
        os: 'OS',
        kernel: 'Kernel',
        gcc: 'GCC',
        username: 'Tester',
        last_update: 'Time',
        disk_type: 'Disk_Type',
        speed: 'NIC'
    }
    Global_Filter_Param = query

    $.ajax({
        type:"GET",
        url: "/spec/filter_query_table/",
        //async: true,
        data: {query: query},
        success: function(dict){
            $("#query_condition").bootstrapTable('destroy');
            $('#query_condition').empty()
            var conditions = eval(dict)
            var bootstap_init = [{
                field: '',
                title: '',
                valign:"middle",
                align:"left",
            }]

            var title = conditions['filter_table_title']
            for(var j=0; j<title.length;j++){
                bootstap_init.push({
                    field: query_box_dict[title[j]],
                    title: query_box_dict[title[j]],
                    valign: "middle",
                    align: "center",
                })
            }
            delete conditions.filter_table_title

            if(Object.getOwnPropertyNames(conditions).length ==1){
                for(var key in conditions){
                    key = key.replace('filter_table_', '')
                    draw_all_data(key)
                }
            }

            for(var key in conditions){
                var condition = conditions[key]
                key = key.replace('filter_table_', '')
                query_condition_str += tr + td + td_style + back + label + input + 'name=' + name + ' value=' + key + ' type="checkbox"' + back + back_label + back_td
                for(var i=0; i<condition.length; i++){
                    if(i==0){
                        query_condition_str += td + td_style + back + condition[i].replace('_', ' ') + back_td
                    }else {
                        query_condition_str += td + td_style + back + condition[i] + back_td
                    }
                }
                query_condition_str += back_tr
            }
            $('#filter_checkbox').css('display', 'inline')
            $('#query_condition').append(query_condition_str)
            $("#query_condition").bootstrapTable({
                //	url: './GetData.txt',         //请求后台的URL（*）
                //	method: 'get',                      //请求方式（*）
                striped: true,                      //是否显示行间隔色
                pagination: true,                   //是否显示分页（*）
                //sortable: true,  					//是否启用排序
                //sortOrder: "asc",                   //排序方式
                //	sidePagination: "client",           //分页方式：client客户端分页，server服务端分页（*）
                pageNumber: 1,                       //初始化加载第一页，默认第一页
                pageSize: 10,							//每页的记录行数（*）
                //	showRefresh: true,                   //刷新按钮
                //	buttonsAlign： "left",                //按钮对齐方式
                //	toolbar： "#toolbar",                 //指定工具栏
                //	toolbarAlign: "right",
                // pageList:[10, 25, 50, 100],
                columns: bootstap_init,
                onPageChange: function (e, number, size) {
                    $('#query_condition').find('input[name=query_item]').each(function () {
                        if(Global_Filter_Table_Id.indexOf($(this).val())!=-1){
                            $(this).prop('checked', true)
                        }
                    })
                    check_if_checkboxs_all('query_condition', 'filter_checkbox')
                },
            });
            $('#filter_result').find('button[class="btn btn-primary"]').prop('disabled', false)
            $('.fixed-table-loading').html('Loaded successfully.')
        },
        error: function(){
        }
    });
}


function RefreshFilterStatus(obj) {
    if($(obj)[0].checked){
        if(Global_Filter_Table_Id.indexOf($(obj).val() == -1)){
            Global_Filter_Table_Id.push($(obj).val())
        }
    }else {
        if(Global_Filter_Table_Id.indexOf($(obj).val() == -1)){
            Global_Filter_Table_Id.splice(Global_Filter_Table_Id.indexOf($(obj).val()), 1)
        }
    }

    let flag = []
    $('#query_condition').find('input[type=checkbox]').each(function () {
        if(flag.indexOf($(this)[0].checked) == -1){
            flag.push($(this)[0].checked)
        }
    })
    if(flag.length==1 && flag[0]==true){
        $('#filter_checkbox').prop("checked", true)
    }else {
        $('#filter_checkbox').prop("checked", false)
    }

}


var standard_option = ['speccpu', 'specjbb', 'lmbench', 'Iperf', 'FIO']
var soc_option = ['CPU_Type', 'Total_Socket', 'Cores_Per_Socket', 'Threads_Per_Core', 'Total_Threads', 'Cpu_Frequency', 'Cpu_Max_Frequency', 'Cpu_Min_Frequency', 'L1_Cache_Size', 'L2_Cache_Size', 'L3_Cache_Size']
var hard_option = ['Platform', 'Memory_Total_Size', 'Total_Memory', 'Memory_Speed', 'Memory_Configured_Clock', 'NIC_Info', 'Disk_Info', 'PCIe_Info']
var soft_option = ['OS', 'Linux_Kernel', 'BIOS', 'GCC', 'GLIBC', 'JDK', 'SPEC_CPU', 'SPEC_JBB', 'Lmbench', 'Iperf', 'FIO']
var tune_option = ['Cpu_Avaiable_Govorner', 'Cpu_Current_Govorner', 'Irq_Balance_Status', 'Tuned_Profile', 'Firewall_Status', 'Auditd_Status', 'Customization']


function draw_data_table(standard_title, standard_id, standard_data_form) {
    var label = ''
    var app = Object.keys(standard_data_form)[0]
    if(Object.keys(standard_data_form[app]).length != 0){
        var data_object = new draw_table(standard_data_form)

        var second_multi = data_object.second_multi

        var header = tr + td + '1' + col + '1' + '" style="font-weight: bold' + fu + 'Standard' + back_td + td + '1' + col + second_multi  + '" style="font-weight: bold' + fu + 'Items' + back_td
        for(var i=0; i<standard_title.length;i++){
            var stand = standard_title[i].split(',')
            header += td + '1' + col + '1' + '" style="font-weight: bold' + fu + stand[0] + '<br><span style="font-size: 11px">  <input type="checkbox" style="display: none" value=' + standard_id[i] + '>' + stand[1] + '</span>' + back_td
        }
        var summary_header = header + back_tr;
        label += summary_header
        label += data_object.label
        //console.log(label)

    }
    $('#summary').empty()
    $('#summary').append(label)

    line_color()
    deleteCol(0)
}


function draw_data_figure(standard_data_figure) {
    $('#chart').empty()
    $('#chart').parent().css('display' , 'block')
    $('#chart').css('display' , 'block')
    var figure_count = 0
    var echarts_list = []
    for(var test in standard_data_figure){
        figure_count += 1
        var count = standard_data_figure[test]['data'].length
        echarts_list.push(new draw_figure(standard_data_figure[test], test, count))
    }
    setTimeout(function (){
        window.onresize = function () {
            for(var i=0; i<echarts_list.length; i++){
                echarts_list[i].resize()
                var option = echarts_list[i].getOption()
                console.log(option)
                if(document.body.clientWidth < 1200){
                    option.legend[0].show = false
                    echarts_list[i].setOption(option)
                }else {
                    option.legend[0].show = true
                    echarts_list[i].setOption(option)
                }
            }
        }
    },200)
    var figure_height = figure_count * 460
    $('#chart').css('height' , figure_height.toString() + 'px')
}


function draw_software_config(standard_title, standard_soft_config) {
    var config_name = 'SoftWare Configuration'
    var config_temp = ''
    config_temp += tr + '<td class="th_summary" style="font-weight: bold;width: 230px">' + 'NAME' + back_td
    for(var i=0; i<standard_title.length; i++){
        var stand = standard_title[i].split(',')
        config_temp += '<td class="td_summary" style="font-weight: bold">' + stand[0] + '<br><span style="font-size: 11px">' + stand[1] + back_td
    }
    config_temp += back_tr
    var soft = draw_config('software', standard_soft_config)
    var soft_configuration =  config_temp + soft
    $('#software').empty()
    $('#software').append(soft_configuration)

}


function draw_tune_config(standard_title, standard_tune) {
    var config_name = 'SoftWare Configuration'
    var config_temp = ''
    config_temp += tr + '<td class="th_summary" style="font-weight: bold;width: 230px">' + 'NAME' + back_td
    for(var i=0; i<standard_title.length; i++){
        var stand = standard_title[i].split(',')
        config_temp += '<td class="td_summary" style="font-weight: bold">' + stand[0] + '<br><span style="font-size: 11px">' + stand[1] + back_td
    }
    config_temp += back_tr
    var tune = draw_config('tune', standard_tune)
    var tune_configuration =  config_temp + tune
    $('#system-setting').empty()
    $('#system-setting').append(tune_configuration)

}


function draw_hardware_config(standard_title, standard_hard_config) {
    var config_name = 'SoftWare Configuration'
    var config_temp = ''
    config_temp += tr + '<td class="th_summary" style="font-weight: bold;width: 230px">' + 'NAME' + back_td
    for(var i=0; i<standard_title.length; i++){
        var stand = standard_title[i].split(',')
        config_temp += '<td class="td_summary" style="font-weight: bold">' + stand[0] + '<br><span style="font-size: 11px">' + stand[1] + back_td
    }
    config_temp += back_tr
    var hard = draw_config('hardware', standard_hard_config)
    var hard_configuration =  config_temp + hard
    $('#hardware').empty()
    $('#hardware').append(hard_configuration)

}


function draw_soc_config(standard_title, standard_hard_config) {
    var config_name = 'SoftWare Configuration'
    var config_temp = ''
    config_temp += tr + '<td class="th_summary" style="font-weight: bold;width: 230px">' + 'NAME' + back_td
    for(var i=0; i<standard_title.length; i++){
        var stand = standard_title[i].split(',')
        config_temp += '<td class="td_summary" style="font-weight: bold">' + stand[0] + '<br><span style="font-size: 11px">' + stand[1] + back_td
    }
    config_temp += back_tr
    var soc = draw_config('soc', standard_hard_config)
    var soc_configuration = config_temp + soc
    $('#soc').empty()
    $('#soc').append(soc_configuration)

}


function draw_all_config(standard_title, standard_soft_config, standard_hard_config, standard_tune){
    var config_name = ['SOC Configuration', 'HardWare Configuration', 'SoftWare Configuration', 'Tune']
    var config_header = []
    for(var j=0; j<config_name.length;j++) {
        var config_temp  = ''
        config_temp += tr + '<td class="th_summary" style="font-weight: bold;width: 230px">' + 'NAME' + back_td
        for(var i=0; i<standard_title.length; i++){
            var stand = standard_title[i].split(',')
            config_temp += '<td class="td_summary" style="font-weight: bold">' + stand[0] + '<br><span style="font-size: 11px">' + stand[1] + back_td
        }
        config_temp += back_tr
        config_header.push(config_temp)
    }

    var soft = draw_config('software', standard_soft_config)

    var hard = draw_config('hardware', standard_hard_config)
    var soc = draw_config('soc', standard_hard_config)

    var tune = draw_config('tune', standard_tune)

    var soc_configuration = config_header[0] + soc
    $('#soc').empty()
    $('#soc').append(soc_configuration)
    var hard_configuration =  config_header[1] + hard
    $('#hardware').empty()
    $('#hardware').append(hard_configuration)
    var soft_configuration =  config_header[2] + soft
    $('#software').empty()
    $('#software').append(soft_configuration)
    var tune_configuration =  config_header[3] + tune
    $('#system-setting').empty()
    $('#system-setting').append(tune_configuration)
    line_color()

}


function draw_all_data(obj) {
    if(obj == 'haha'){
        var temp = ''
        var temp_array = []
        for(var h=0;h<Global_Filter_Table_Id.length;h++){
            if(temp_array.indexOf(Global_Filter_Table_Id[h])==-1){
                temp_array.push(Global_Filter_Table_Id[h])
            }
        }
        if(temp_array.length==0){
            return alert('Choose number should not be zero!')
        }
        for(var k=0;k<temp_array.length;k++){
            temp += 'query_item=' + temp_array[k]
            if(k!=temp_array.length-1){
                temp += '&'
            }
        }
        var data = temp
        Global_Filter_Id = data
        var data_list = data.split('&')
        if(data_list.length>10){
            alert('Choosed numbers is over 10!')
            return
        }
        Global_Filter_Table_Id = []
        var url = "/spec/standard_query/"
    }else if(obj == 'latest' || (obj.indexOf('app=')>-1 && obj.indexOf('&')==-1)){
        var data = {}
        var url = "/spec/standard_latest/"
    }else if(obj.indexOf('=')>-1){
        var data = obj
        var url = "/spec/standard_query/"
    }
    else {
        var data = {'query_item': obj}
        var url = "/spec/standard_query/"
        Global_Filter_Id = 'query_item=' + obj
    }

    $.ajax({
        type:"GET",
        url: url,
        data: data,
        cache: false,
        success: function(dict){
            var arg = eval(dict)
            GLOBAL_STANDARD.STANDARD_IDS = arg.standard_ids

            GLOBAL_STANDARD.STANDARD_TITLE = arg.standard_title
            //Draw data table
            GLOBAL_STANDARD.STANDARD_DATA_FORM = arg.standard_data_form
            draw_data_table(GLOBAL_STANDARD.STANDARD_TITLE, GLOBAL_STANDARD.STANDARD_IDS, GLOBAL_STANDARD.STANDARD_DATA_FORM)

            //Draw Figure
            GLOBAL_STANDARD.STANDARD_DATA_FIGURE = arg.standard_data_figure
            draw_data_figure(GLOBAL_STANDARD.STANDARD_DATA_FIGURE)

            //Draw Config
            GLOBAL_STANDARD.STANDARD_SOFT_CONFIG = arg.standard_soft_config
            GLOBAL_STANDARD.STANDARD_HARD_CONFIG = arg.standard_hard_config
            GLOBAL_STANDARD.STANDARD_TUNE = arg.standard_tune

            draw_all_config(GLOBAL_STANDARD.STANDARD_TITLE, GLOBAL_STANDARD.STANDARD_SOFT_CONFIG, GLOBAL_STANDARD.STANDARD_HARD_CONFIG, GLOBAL_STANDARD.STANDARD_TUNE)

            GLOBAL_STANDARD.STANDARD_TUNE_CUNSTOMIZATION  = arg.standard_tune_customization
            tunetable(GLOBAL_STANDARD.STANDARD_IDS, GLOBAL_STANDARD.STANDARD_TITLE, GLOBAL_STANDARD.STANDARD_TUNE_CUNSTOMIZATION)
            commenttable(GLOBAL_STANDARD.STANDARD_TITLE, GLOBAL_STANDARD.STANDARD_IDS, arg.standard_comments)
            $('#filter_result').modal('hide');
            draw_advanced_setting()
            var column_array = ['summary', 'chart', 'soc', 'hardware', 'software', 'system-setting']
            for(var i=0; i<column_array.length;i++){
                $('#' + column_array[i]).parent().parent().css('display', 'block')
            }
        },
        error: function(){
            var column_array = ['summary', 'chart', 'soc', 'hardware', 'software', 'system-setting']
            var notice_null = '<h2 style="text-align: center;vertical-align: middle">No More Data!</h2>'
            for(var i=0; i<column_array.length;i++){
                $('#' + column_array[i]).empty()
                $('#' + column_array[i]).append(notice_null)
            }
            $('#myModal').modal('hide');
        }
    });
}


function rowStyle(row, index) {
    var classes = [
      'active',
      'success',
      'info',
      'warning',
      'danger'
    ]

    if (index % 2 === 0) {
      return {
        classes: classes[index%classes.length]
      }
    }
    return {
      css: {
        color: 'blue'
      }
    }
  }


function line_color() {
    $('table').each(function(){
        $(this).find('tr:even').css("background","#ccc");
        $(this).find('tr:odd').css("background","#eee");
        $(this).children().children().eq(0).css("background","lightgreen");
        if($(this).attr("id")=='tunebox'){
            $(this).children().children().eq(0).css("background","white");
        }
    });
    var flag = 0
    $('#summary').each(function(){
        $(this).find('tr:even').css("background","transparent");
        $(this).find('tr:odd').css("background","transparent");
        $(this).children().children().eq(0).css("background","lightgreen");
    });

    $('#summary tr').each(function(){
        $(this).children('td').each(function () {
            if(flag%2==0){
                $(this).css("background-color","#ccc")
            }else {
                $(this).css("background-color","#eee")
            }
        })
        flag += 1
    });

    flag = 0
    $('#summary').children().children().eq(0).children().each(function () {
        $(this).css("background","lightgreen");
    })
}


function deleteCol(number) {
    var index = number;
    var table = document.getElementById("summary");
    var len = table.rows.length;
    for (var i = 0; i < len; i++) {
        console.log(i)
        var number = $(table.rows[i]).children().eq(0).attr('rowspan')
        table.rows[i].deleteCell(index);
        i += parseInt(number) -1
    }
}


function draw_config(name, config){
    var str = ''
    var temp;
    if(name == 'software'){
        var config_order = soft_option
    }else if(name == 'hardware'){
        var config_order = hard_option
    }else if(name == 'tune'){
        var config_order = tune_option
    }else{
        var config_order = soc_option
    }
    for(var j=0;j<config_order.length;j++){
        var values = config_order[j]

        if(config[values] != undefined){

            str += tr + '<td class="th_summary">' + values + back_td
            for(var i=0; i<config[values].length; i++){
                if(values=='NIC_Info'){
                    var network = [' ', 'speed: ', 'driver: ', 'vendor: ', 'bus: ']
                    var netstr = ''
                    temp = config[values][i].split(';')
                    for(var k=0; k<temp.length; k++){
                        var network_list = temp[k].replace('"', '').split(',')
                        for(var s=0; s<network_list.length;s++){
                            if(s==network_list.length-1){
                                netstr += network[s] + network_list[s] + '<br>'
                            }else {
                                netstr += network[s] + network_list[s] + '<br>&nbsp&nbsp&nbsp'
                            }
                        }
                    }
                    //temp = config[values][i].replace(/"/g, '').replace(/,/g, '<br>&nbsp&nbsp&nbsp').replace(/;/g, '<br>')
                    str += '<td class="td_summary" style="text-align: left">' + netstr + back_td
                }else if(values=='Disk_Info'){
                    var disk = [' ', 'size: ', 'type: ', 'interface: ', 'io_scheduler: ', 'vendor: ']
                    var diskstr = ''
                    temp = config[values][i].split(';')
                    for(var k=0; k<temp.length; k++){
                        var disk_list = temp[k].replace('"', '').split(',')
                        for(var s=0; s<disk_list.length;s++){
                            if(s==disk_list.length-1){
                                diskstr += disk[s] + disk_list[s] + '<br>'
                            }else {
                                diskstr += disk[s] + disk_list[s] + '<br>&nbsp&nbsp&nbsp'
                            }

                        }
                    }
                    //temp = config[values][i].replace(/"/g, '').replace(/,/g, '<br>&nbsp&nbsp&nbsp').replace(/;/g, '<br>')
                    str += '<td class="td_summary" style="text-align: left">' + diskstr + back_td
                }
                else if(values=='PCIe_Info'){
                    temp = config[values][i].replace(/"/g, '').replace(/;/g, '<br>')
                    str += '<td class="td_summary" style="text-align: left">' + temp + back_td
                }
                else {
                    temp = config[values][i]
                    str += '<td class="td_summary">' + temp + back_td
                }
            }
            str += back_tr

        }
    }
    return str
}


function add_filters(obj) {
    console.log($(obj).val())
    var condition = $(obj).val()
    if(obj.checked == true){
        $(obj).parent().parent().css("background-color","#337ab7");
        var option = '<option '
        var back_option = '</option>'
        var option_value = ' value='
        var back = '>'
        var select = '<select '
        var back_select = '</select>'
        var style = ' class="check-down" multiple="multiple" '
        var style_name = ' name='
        var query_box_dict = {
            version: 'Release',
            cpu_type: 'SoC',
            total_threads: 'Threads',
            board_type: 'Platform',
            os: 'OS',
            kernel: 'Kernel',
            gcc: 'GCC',
            username: 'Tester',
            last_update: 'Time',
            disk_type: 'Disk_Type',
            speed: 'NIC'
        }
        var filter_time = {
            'One Day': '1 day',
            'Two Days': '2 day',
            'Five Days': '5 day',
            'One Week': '1 week',
            'Two Weeks': '2 week',
            'Three Weeks': '3 week',
            'One Month': '1 month',
            'Two Months': '2 month',
        }
        $.ajax({
            type: "GET",
            url: "/spec/add_filters",
            data: {condition: condition},
            success: function (dict) {
                var filter_item = eval(dict)
                console.log(filter_item)
                for(var item in filter_item){
                    if(item=='last_update') {
                        style = ''
                        var filter_string = ''
                        filter_string += select + ' id=' + '"' + item + '"' + style_name + '"' + item + '"' + style + back
                        for(var i=0; i<filter_item[item].length;i++){
                            console.log(filter_time[filter_item[item][i]])
                            filter_string += option + option_value + '"' + filter_time[filter_item[item][i]] + '"' + back + filter_item[item][i] + back_option
                        }

                        filter_string += back_select
                        $('#query').append(filter_string)
                        $('#' + item).multiselect({
                            buttonWidth: 70,
                            buttonText: function(options, select) {
                                        return 'Time';
                                    },
                        });
                        filter_string = ''
                    }else {
                        var filter_string = ''
                        filter_string += select + ' id=' + '"' + item + '"' + style_name + '"' + item + '"' + style + back
                        for(var i=0; i<filter_item[item].length;i++){
                            filter_string += option + option_value + '"' + filter_item[item][i] + '"' + back + filter_item[item][i] + back_option
                        }

                        filter_string += back_select
                        $('#query').append(filter_string)
                        $('#' + item).multiselect({
                            buttonWidth: 70,
                            includeSelectAllOption: false,
                            allSelectedText:'select all',
                            nonSelectedText: query_box_dict[item],
                            selectedList:4,
                            numberDisplayed: 3,
                        });
                        filter_string = ''
                    }

                }

            }
        });
    }
    else {
        $('#'+ condition).parent().remove()
        $(obj).parent().parent().css("background-color","#fff");
    }


}


function query_condition_checkboxs() {
    select_checkboxs_all('query_condition')
}


function select_checkboxs_all(obj) {
    var flag = false
    $('#'+obj).find('input[type=checkbox]').each(function () {
        if(!$(this)[0].checked){
            flag = true
        }
    })
    if(flag){
        $('#'+obj).find('input[type=checkbox]').prop("checked", true)
        $('#'+obj).find('input[type=checkbox]').each(function () {
            if(Global_Filter_Table_Id.indexOf($(this).val()) == -1){
                Global_Filter_Table_Id.push($(this).val())
            }
        })
        $('#filter_checkbox').prop("checked", true)
    }else {
        $('#'+obj).find('input[type=checkbox]').removeAttr('checked')
        $('#'+obj).find('input[type=checkbox]').each(function () {
            if (Global_Filter_Table_Id.indexOf($(this).val() != -1)) {
                Global_Filter_Table_Id.splice(Global_Filter_Table_Id.indexOf($(this).val()), 1)
            }
        })
    }
}


function check_if_checkboxs_all(obj, target1) {
    var flag = false
    $('#'+obj).find('input[type=checkbox]').each(function () {
        console.log($(this)[0].checked)
        if(!$(this)[0].checked){
            flag = true
        }
    })
    if(flag){
        $('#'+target1).removeAttr('checked')
    }else {
        $('#'+target1).prop("checked", true)
    }
}


var turn_obj = {
    'update': {}
}


function tunetable(standard_ids, standard_title, tune_customer) {
     // list tune table add id=source-*
    // var tunetable_name=['HSRP_V1.4_REP2_AW2.1_40','HSRP_V1.4_REP2_AW2.1_46','HSRP_V1.4_REP2_AW2.1_48']
    $('#textedit').children().remove()
    $('#tunetable').children().remove()
    turn_obj['update'] = {}
    var turntablelength=standard_title.length;
    var TunetableList = '<table class="tunebox" id="tunebox" style="margin-bottom: 0px;margin-top:5px;">'
    TunetableList += '<tr style="background-color:white;display: inline-flex">'
    for(var i=0;i<turntablelength;i++){
        TunetableList+='<td class="btn btn-primary th_summary1" style="height: 50px;" onclick="select_turn_table(this)" id="source-' + i + '">' + standard_title[i].replace(',', '<br>') +'</td>'
    }
    TunetableList += '</tr>'
    TunetableList += '</table>'
    $("#tunetable").append(TunetableList);

   //add textarea order to tune table length.
    for( var i=0;i<turntablelength;i++){
        turn_obj['update'][standard_ids[i]] = tune_customer[i]
        var TextareaList= '<textarea class="tune-text"  id="target-' + i + '" style="display:none; resize: none;" type="text"  name="tune" value="' + standard_ids[i] + '">' + tune_customer[i] + '</textarea>'
        $("#textedit").append(TextareaList);
    }
}

//selected the tune table to edit
function select_turn_table(obj) {
    $(obj).css({"background-color":"#2ce32c","color":"#1B548D"}).siblings().css({"background-color":"lightgreen","color":"black"});
    var title_id=$(obj).attr("id")
    var text_id=title_id.replace(/source/i,"target");
    $("#"+text_id).show().siblings().css("display","none");
}

function updateTune() {
    $('#textedit').find('textarea').each(function () {
        turn_obj['update'][$(this).attr('value')] = $(this).val()
    })
    $.ajax({
        type:"GET",
        url: "/spec/updateTune/",
        //async: true,
        data: turn_obj['update'],
        success: function(dict){
            var result = eval(dict)
            alert(result['flag'])
        },
        error: function(obj){
            alert(obj.statusText)
        }
    })
}

// Click 'Edit' button,display checkbox and button value set 'Delete'
function CheckBtn() {
      var checkId = document.getElementById("check-btn");
      var data_num=0
      var delete_case_name=$("#orderColumn").val()
      var delete_list='<input type="text" style="border:none;width: -webkit-fill-available;text-align: center;vertical-align: middle;font: 15px Times New Roman;font-weight:bold; color:#2E5E79;" id="deletetitle"  value="' + delete_case_name +'"readonly="readonly" ><br><br>'
      $("#ResetBtn").css("display","inline");

      if(checkId.value == "Edit"){
          checkId.value="Delete"
          $('#summary').find('input[type=checkbox]').each(function(){ $(this).css("display", "inline"); });
      }else{
           $('#check-btn').attr({"data-toggle":"modal", "data-target":"#delete-modal"});
           //if select some data to delete,display those name in detele box
           $('#summary').find('input[type=checkbox]').each(function(){
               if($(this).is(':checked')){
                   var select_delete=$(this).parent().parent().text();
                   delete_list+= '<input type="checkbox" style="display:none; border:none;margin-top: 5px; width: -webkit-fill-available;font: 12px Times New Roman;font-weight:bold; color:black;"  value="' + $(this).val() + '" checked="" >' + select_delete + ' <br>'
                   data_num=data_num+1
                }

           });
           // if no data need to delete and clicked 'Delete' button,print some info.
           if(data_num ==0){
               delete_list+= '<input type="text" style="text-align: center;vertical-align: middle; border:none;margin-top: 5px; width: -webkit-fill-available;font: 15px Times New Roman;font-weight:bold; color:black;"  value="Please select data to delete." ><br>'
           }

             $("#data_list").empty();
             $("#data_list").append(delete_list);
       }

}

//click filter button and reset 'Edit' button attribution
function btnvalue(){
    document.getElementById("check-btn").value="Edit";
    $('#check-btn').attr({"data-toggle":"", "data-target":""});
    $("#ResetBtn").css("display","none");
    $('#summary').find('input[type=checkbox]').each(function(){ $(this).css("display", "none"); });
}

//close delete box
function ClearDelBox(){
    $("#data_list").empty();
}

//click 'Cancel' button for undo delete interface
function ResetBtn(){
    document.getElementById("check-btn").value="Edit";
    $("#ResetBtn").css("display","none");
    $('#check-btn').attr({"data-toggle":"", "data-target":""});
    $("#data_list").empty();
    $('#summary').find('input[type=checkbox]').each(function(){
       $(this).removeAttr('checked');
       $(this).css("display","none");
    });
}

function DeleteHsrp() {
    var checkboxs = []
    $('#summary').find('input[type=checkbox]').each(function(){
       checkboxs.push($(this).val())
    });
    var list = ''
    $('#data_list').find('input[type=checkbox]').each(function(){
       var number = checkboxs.indexOf($(this).val())
        checkboxs.splice(number, 1)
       list += $(this).val() + '&'
    });

    if(list.length==0){
        $('#delete-modal').modal('hide');
        alert('Forbidden Submit')
    }else {
        $.ajax({
            type: "GET",
            url: "/spec/spec_delete",
            data: {delete_list: list},
            success: function (dict) {
                var result = eval(dict)
                $('#delete-modal').modal('hide')
                alert(result['flag'])
                var warningstring=/Data deleted successfully/;
                var infowarning=result['flag']
                if(warningstring.test(infowarning)){
                    if(checkboxs.length==0){
                        var column_array = ['summary', 'chart', 'soc', 'hardware', 'software', 'system-setting']
                        var notice_null = '<h2 style="text-align: center;vertical-align: middle">No More Data!</h2>'
                        for(var i=0; i<column_array.length;i++){
                            $('#' + column_array[i]).empty()
                            $('#' + column_array[i]).append(notice_null)
                        }
                    }else {
                        var data = ''
                        for(var i=0;i<checkboxs.length;i++){
                            data += 'query_item=' + checkboxs[i] + '&'
                        }
                        data = data.substring(0, data.length-1)
                        draw_all_data(data)
                    }
                }
            },
            error: function(){
                $('#delete-modal').modal('hide');
            }
        })

    }
}

var GLOBAL_ADVANCED = {
    STANDARD_DICT: {},
    STANDARD_STRING: ''
}


function draw_advanced_setting() {
    //Draw advanced data
    var form = GLOBAL_STANDARD.STANDARD_DATA_FORM
    for(var key in form){
        recursive_standard_data(form[key],GLOBAL_ADVANCED.STANDARD_DICT, key)
    }

    GLOBAL_ADVANCED.STANDARD_STRING = draw_advanced(GLOBAL_ADVANCED.STANDARD_DICT, '')
    $('#advanced_form').empty().append(GLOBAL_ADVANCED.STANDARD_STRING)
    $('#advanced_form').children().eq(0).children('label').eq(0).css('display', 'none')
    GLOBAL_ADVANCED.STANDARD_DICT = {}
    GLOBAL_ADVANCED.STANDARD_STRING = ''

    //Draw advanced software
    var software = GLOBAL_STANDARD.STANDARD_SOFT_CONFIG
    var software_dict = recursive_standard_config(software, 'software', 'all/not')
    GLOBAL_ADVANCED.STANDARD_STRING = draw_advanced(software_dict, GLOBAL_ADVANCED.STANDARD_STRING)
    $('#advanced_software').empty().append(GLOBAL_ADVANCED.STANDARD_STRING)
    $('#advanced_software').children().eq(0).children('label').eq(0).css('display', 'none')
    GLOBAL_ADVANCED.STANDARD_STRING = ''

    //Draw advanced hardware
    var hardware_set = GLOBAL_STANDARD.STANDARD_HARD_CONFIG
    var soc = {};var hardware = {}
    for(var i=0;i<soc_option.length;i++){
        soc[soc_option[i]] = hardware_set[soc_option[i]]
    }
    for(var i=0;i<hard_option.length;i++){
        hardware[hard_option[i]] = hardware_set[hard_option[i]]
    }

    var soc_dict = recursive_standard_config(soc, 'soc', 'all/not')
    var hardware_dict = recursive_standard_config(hardware, 'hardware', 'all/not')
    GLOBAL_ADVANCED.STANDARD_STRING = draw_advanced(soc_dict, GLOBAL_ADVANCED.STANDARD_STRING)
    $('#advanced_soc').empty().append(GLOBAL_ADVANCED.STANDARD_STRING)
    $('#advanced_soc').children().eq(0).children('label').eq(0).css('display', 'none')
    GLOBAL_ADVANCED.STANDARD_STRING = ''
    GLOBAL_ADVANCED.STANDARD_STRING = draw_advanced(hardware_dict, GLOBAL_ADVANCED.STANDARD_STRING)
    $('#advanced_hardware').empty().append(GLOBAL_ADVANCED.STANDARD_STRING)
    $('#advanced_hardware').children().eq(0).children('label').eq(0).css('display', 'none')
    GLOBAL_ADVANCED.STANDARD_STRING = ''

        //Draw advanced software
    var tune = GLOBAL_STANDARD.STANDARD_TUNE
    var tune_dict = recursive_standard_config(tune, 'System Setting', 'all/not')
    GLOBAL_ADVANCED.STANDARD_STRING = draw_advanced(tune_dict, GLOBAL_ADVANCED.STANDARD_STRING)
    $('#advanced_tune').empty().append(GLOBAL_ADVANCED.STANDARD_STRING)
    $('#advanced_tune').children().eq(0).children('label').eq(0).css('display', 'none')
    GLOBAL_ADVANCED.STANDARD_STRING = ''
    Advanced_Checkbox.Init_number = 0
    Advanced_Checkbox.CheckboxArray = []
}


function recursive_standard_config(configs, config_name, all) {
    var config = []
    for(var key in configs){
        config.push(key)
    }
    var config_dict = {}
    config_dict[config_name] = config
    var config_select = {}
    config_select[all] = config_dict
    return config_select
}


function recursive_standard_data(data, dict, key) {
    for(var temp in data){
        if(gettype.call(data[temp]) == '[object Object]'){
            if(!dict.hasOwnProperty(key)){
                dict[key] = {}
            }
            recursive_standard_data(data[temp],dict[key], temp)
        }else {
            if(gettype.call(dict[key]) == '[object Undefined]'){
                dict[key] = []
                dict[key].push(temp)
            }else {
                dict[key].push(temp)
            }
        }
    }
}


function draw_advanced(data, string) {
    for(var key in data){
        if(gettype.call(data[key]) == '[object Object]'){
            Advanced_Checkbox.Init_number += 1
            string += '<div><label style="width: 180px;"><input type="checkbox" checked="checked" onclick="advanced_selected_all(this)"' + ' checkbox_number="' + Advanced_Checkbox.Init_number  + '" value="' + key + '">' + key + '</label>'
            string += draw_advanced(data[key], '')
            string += '</div>'
        }else {
            Advanced_Checkbox.Init_number += 1
            string += '<div style="padding-left: 25px"><label><input type="checkbox" checked="checked" onclick="advanced_selected_all(this)"' + ' checkbox_number="' + Advanced_Checkbox.Init_number  + '"  value="' + key + '">' + key + '</label><br>'

            string += '<div style="padding-left: 25px; width:260px; position:relative; display:inline-table;">'
            for(var i=0; i<data[key].length;i++){
                Advanced_Checkbox.Init_number += 1
                if(i%2==0){
                    string += '<label><input type="checkbox" checked="checked" name="advanced"' + ' checkbox_number="' + Advanced_Checkbox.Init_number  + '"  value="' + data[key][i] + '">' + data[key][i] + '</label><br>'
                }
            }
            string += '</div>'
            string += '<div style="float:right; width:260px;position:relative;">'
            for(var i=0; i<data[key].length;i++){
                if(i%2!=0){
                    string += '<label><input type="checkbox" checked="checked" name="advanced"' + ' checkbox_number="' + Advanced_Checkbox.Init_number  + '"  value="' + data[key][i] + '">' + data[key][i] + '</label><br>'
                }
             }
            string += '</div>'

            string += '</div>'
        }
    }
    return string
}


//entry
function apply_advanced_form() {
    var advanced_data = []
    var media = '=='
    $('#advanced_form').find('input[name=advanced]:not(:checked)').each(function () {
        var temp = $(this).val()
        var flag = $(this)
        while(typeof(flag.parent().parent().parent().attr('id'))=='undefined'){
            flag = flag.parent().parent().parent().children().eq(0).children().eq(0)
            temp = flag.val() + media + temp
        }
        advanced_data.push(temp)
    })
    var form_temp = deepClone(GLOBAL_STANDARD.STANDARD_DATA_FORM)

    for(var i=0; i<advanced_data.length; i++){
        var strings = advanced_data[i].split(media)
        remove_advanced(form_temp, strings.reverse())
    }
    var temp_form = delete_object_null_all(form_temp)

    if($.isEmptyObject(temp_form)){
        $('#summary').parent().parent().css('display', 'none')
    }else {
        $('#summary').parent().parent().css('display', 'block')
        draw_data_table(GLOBAL_STANDARD.STANDARD_TITLE, GLOBAL_STANDARD.STANDARD_IDS, temp_form)
    }

    apply_advanced_figure(advanced_data, media)

    return {'advanced_form': advanced_data}

}


function apply_advanced_figure(advanced_data, media) {
    var figure = deepCopy(GLOBAL_STANDARD.STANDARD_DATA_FIGURE)
    var cookie_array = document.cookie.split('; ')
    for(var i=0;i<cookie_array.length;i++){
        var key_value = cookie_array[i].split('=')
        if(key_value[0]=='app'){
            var app = key_value[1]
        }
    }
    for(var i=0; i<advanced_data.length; i++){
        var string_arr = advanced_data[i].split(media)
        if(string_arr.length>2){
            string_arr.reverse().pop()
            string_arr.reverse()
        }

        string_arr = rebuild(app,string_arr)
        var array_number = figure[string_arr[0]]['xaxis'].indexOf(string_arr[1])
        if(array_number!=-1){
            figure[string_arr[0]]['xaxis'].splice(array_number, 1)
            for(var j=0;j<figure[string_arr[0]]['data'].length;j++){
                if(array_number!=-1){
                    figure[string_arr[0]]['data'][j]['data'].splice(array_number, 1)
                }
            }
        }

        if(figure[string_arr[0]]['xaxis'].length==0){
            delete figure[string_arr[0]]
        }
    }

    if($.isEmptyObject(figure)){
        $('#chart').parent().css('display', 'none')
    }else {
        $('#chart').parent().css('display', 'block')
        draw_data_figure(figure)
    }
}


function rebuild(app, array){
    var target_array = []
    if(app=='lmbench-stream'){
        var new_array = array[1].split('(')
        target_array.push(array[0] +'(MB/s)')
        target_array.push(new_array[0])
    }
    if(app=='lmbench-latency'){
        var new_array = array[1].split('(')
        target_array.push(array[0] +'(ns)')
        target_array.push(new_array[0])
    }
    if(app=='fio'){
        target_array.push(array[0] + array[3])
        target_array.push(array[2] + '-iodepth' + array[1])
    }
    if(target_array.length==0){
        return array
    }
    return target_array
}


function apply_advanced_soft() {
    var advanced_data = []
    $('#advanced_software').find('input[name=advanced]:not(:checked)').each(function () {
        var temp = $(this).val()
        advanced_data.push(temp)
    })
    var config_temp = deepClone(GLOBAL_STANDARD.STANDARD_SOFT_CONFIG)

    for(var i=0; i<advanced_data.length; i++){
        delete config_temp[advanced_data[i]]
    }

    if($.isEmptyObject(config_temp)){
        $('#software').parent().parent().css('display', 'none')
    }else {
        $('#software').parent().parent().css('display', 'block')
        draw_software_config(GLOBAL_STANDARD.STANDARD_TITLE, config_temp)
    }

    return {'advanced_soft': advanced_data}

}


function apply_advanced_tune() {
    var advanced_data = []
    $('#advanced_tune').find('input[name=advanced]:not(:checked)').each(function () {
        var temp = $(this).val()
        advanced_data.push(temp)
    })
    var config_temp = deepClone(GLOBAL_STANDARD.STANDARD_TUNE)

    for(var i=0; i<advanced_data.length; i++){
        delete config_temp[advanced_data[i]]
    }

    if($.isEmptyObject(config_temp)){
        $('#system-setting').parent().parent().css('display', 'none')
    }else {
        $('#system-setting').parent().parent().css('display', 'block')
        draw_tune_config(GLOBAL_STANDARD.STANDARD_TITLE, config_temp)
    }

    return {'advanced_tune': advanced_data}

}


function apply_advanced_hard() {
    var advanced_data = []
    $('#advanced_hardware').find('input[name=advanced]:not(:checked)').each(function () {
        var temp = $(this).val()
        advanced_data.push(temp)
    })
    var hardware_set = deepClone(GLOBAL_STANDARD.STANDARD_HARD_CONFIG)
    var hardware = {}
    for(var i=0;i<hard_option.length;i++){
        hardware[hard_option[i]] = hardware_set[hard_option[i]]
    }

    var config_temp = deepClone(hardware)

    for(var i=0; i<advanced_data.length; i++){
        delete config_temp[advanced_data[i]]
    }

    if($.isEmptyObject(config_temp)){
        $('#hardware').parent().parent().css('display', 'none')
    }else {
        $('#hardware').parent().parent().css('display', 'block')
        draw_hardware_config(GLOBAL_STANDARD.STANDARD_TITLE, config_temp)
    }

    return {'advanced_hard': advanced_data}

}


function apply_advanced_soc() {
    var advanced_data = []
    $('#advanced_soc').find('input[name=advanced]:not(:checked)').each(function () {
        var temp = $(this).val()
        advanced_data.push(temp)
    })
    var hardware_set = deepClone(GLOBAL_STANDARD.STANDARD_HARD_CONFIG)
    var soc = {};
    for(var i=0;i<soc_option.length;i++){
        soc[soc_option[i]] = hardware_set[soc_option[i]]
    }

    var config_temp = deepClone(soc)

    for(var i=0; i<advanced_data.length; i++){
        delete config_temp[advanced_data[i]]
    }
    if($.isEmptyObject(config_temp)){
        $('#soc').parent().parent().css('display', 'none')
    }else {
        $('#soc').parent().parent().css('display', 'block')
        draw_soc_config(GLOBAL_STANDARD.STANDARD_TITLE, config_temp)
    }

    return {'advanced_soc': advanced_data}

}


function apply_advanced() {
    apply_advanced_form()
    apply_advanced_soc()
    apply_advanced_hard()
    apply_advanced_soft()
    apply_advanced_tune()
    $('#operation_modal').modal('hide');
    line_color()
    Advanced_Checkbox.CheckboxArray = []
    $('#operation_modal').find('input:not(:checked)').each(function () {
        Advanced_Checkbox.CheckboxArray.push($(this).attr('checkbox_number'))
    })

}


function remove_advanced(obj, array) {
  for(var key in obj) {
    if (array.indexOf(key) != -1){
        array.pop(array.indexOf(key))
        if (array.length==0){
            delete obj[key]
            return obj
        } else {
            obj = remove_advanced(obj[key], array)
        }
    }
    else{

    }
  }
  return obj
}


function advanced_selected_all(obj) {
    if($(obj).prop('checked') == false){
        $(obj).parent().parent().find('input').each(function () {
        $(this).prop('checked', false)
        })
    }else {
        $(obj).parent().parent().find('input').each(function () {
        $(this).prop('checked', true)
        })
    }

}


function deepClone(obj){
    let objClone = Array.isArray(obj)?[]:{};
    if(obj && typeof obj==="object"){
        for(var key in obj){
            if(obj.hasOwnProperty(key)){
                if(obj[key]&&typeof obj[key] ==="object"){
                    objClone[key] = deepClone(obj[key]);
                }else{
                    objClone[key] = obj[key];
                }
            }
        }
    }
    return objClone;
}


function isObj(obj) {    return (typeof obj === 'object' || typeof obj === 'function') && obj !== null}

function deepCopy(obj) {
    let tempObj = Array.isArray(obj) ? [] : {}
    for(let key in obj) {
        tempObj[key] = isObj(obj[key]) ? deepCopy(obj[key]) : obj[key]
    }    return tempObj
}



function delete_object_nullss(obj) {
    for(var key in obj){
        if(typeof(obj[key]) == 'object') {
            if($.isEmptyObject(obj[key])){
                delete obj[key]
            }else {
                delete_object_nullss(obj[key])
            }
        }else {

        }

    }
    return obj
}


function delete_object_null_all(form_temp) {
    var form_json = JSON.stringify(form_temp)
    var temp_form = delete_object_nullss(form_temp)
    var temp_json = JSON.stringify(temp_form)
    while(form_json != temp_json){
        form_json = temp_json
        temp_form = delete_object_nullss(form_temp)
        temp_json = JSON.stringify(temp_form)
    }

    return temp_form
}


var Advanced_Checkbox = {
    Init_number: 0,
    CheckboxArray: [],
}


function Reset_Advanced_Status() {
    $('#operation_modal').find('input[type=checkbox]').each(function () {
        if(Advanced_Checkbox.CheckboxArray.indexOf($(this).attr('checkbox_number'))>-1){
            $(this).prop('checked', false)
        }else {
            $(this).prop('checked', true)
        }
    })
}


function copyToClipBoard(){
    var clipBoardContent="";
    var app = ''
    var cookie_array = document.cookie.split('; ')
    for(var i=0;i<cookie_array.length;i++){
        var key_value = cookie_array[i].split('=')
        if(key_value[0]=='app'){
            app = key_value[1]
            break
        }
    }
    if(Global_Filter_Id == ''){
        clipBoardContent+= window.location.origin + window.location.pathname + '?' + 'app=' + app
    }else {
        clipBoardContent+= window.location.origin + window.location.pathname + '?' + 'app=' + app + '&' + Global_Filter_Id + '&' + Global_Filter_Param;
    }
    return clipBoardContent
}


function copyFn() {
    var clipboard = new Clipboard('.copy-btn', {
        text: function(trigger) {
            return copyToClipBoard()
        }
    });
    clipboard.on('success', function() {
        alert('Copy success!');
    });
    clipboard.on('error', function(e) {
        alert('Please select text copy manually!');
    });
}

//setup comment table occording to filter button select
function commenttable(standard_title, standard_ids, standard_comments) {
     // list comment table add id=source-*
    $('#commenttable').children().remove()
    $('#commentboxlist').children().remove()
    var CommentBoxList = ''
    var commenttablelength = standard_title.length;

    var commenttableList = '<table class="tunebox" id="commentbox" style="margin-top: 0px;margin-top:5px;">'
    commenttableList += '<tr style="background-color:white;display: inline-flex">'
    for(var i=0;i<commenttablelength;i++){
       commenttableList+='<td class="btn btn-primary th_summary1" style="height: 50px;" onclick="select_comment_table(this)" id="Source-' + i + '">' + standard_title[i].replace(',', '<br>') +'</td>'
    }
    commenttableList += '</tr>'
    commenttableList += '</table>'

    $("#commenttable").append(commenttableList);
    //every comment table has some comment lists
    for(var j=0;j<standard_ids.length;j++){
        var k=0
        console.log(standard_ids[j])
        console.log(standard_comments)
        console.log(standard_comments[standard_ids[j]])
        var commenteachlist = standard_comments[standard_ids[j]].length
        CommentBoxList += '<div class="CommentBoxList" id="Target-' + j + '" style="display:none;">'
        for(k=0;k<commenteachlist;k++){
            CommentBoxList += '<i class="fa fa-angle-right" type="button" data-toggle="collapse" data-target="#commenttext' + j + k + '" id="commentright' + j + k + '" style="font-size:20px; padding-top:10px; color:#1B548D;margin-left: 10px;cursor: pointer;" onclick="AngleRight(this)"></i>'
            CommentBoxList += `<input type="text" class="comment-title" id="author-comment${j}${k}" value="${standard_comments[standard_ids[j]][k].username}  ${standard_comments[standard_ids[j]][k].comment_time}" readonly="readonly">`
            CommentBoxList += '<i class="fa fa-pencil" id="pencil' + j + k + '" type="button" style="font-size:16px; padding-top:3px; color:#1B548D;margin-right:10px; cursor:pointer;" onclick="Pencil(this)"></i>'
            CommentBoxList += '<i class="fa fa-save" id="save' + j + k +'"type="button" style="font-size:15px; padding-top:3px;margin-right:10px;color:#1B548D; display:none; cursor:pointer;" onclick="CommentEditSave(this)"></i>'
            CommentBoxList += '<i class="fa fa-trash-o" id="trashcomment' + j + k + '" data-toggle="modal" data-target="#strash-modal"  type="button" style="font-size:15px; padding-top:3px;color:#1B548D; cursor:pointer;" onclick="strashcomment(this)"></i><br>'
            CommentBoxList += '<div class="collapse" id="commenttext' + j + k + '" style="margin-left: 10px;">'
            CommentBoxList += `<textarea class="comment-text" id="focuscomment${j}${k}" type="text"  name="comment-text" comment_id="${standard_comments[standard_ids[j]][k].comment_id}" style="resize: none;" value="${standard_comments[standard_ids[j]][k].content}" >${standard_comments[standard_ids[j]][k].content} </textarea>`
            CommentBoxList += '</div>'
        }
        CommentBoxList += '<div id="newcommentset' + j + '" style="display:none;margin-left: 10px;">'
        CommentBoxList += '<input type="text" class="comment-title" id="newcommenttitle' + j +'"style="margin:0px;" value="New Comment:" readonly="readonly">'
        CommentBoxList += '<textarea class="comment-text collapse in" comment_id="' + standard_ids[j] + '" id="commenttextnew' + j + '" type="text" style="resize: none; margin-left: 10px;" name="comment-text" value=""> </textarea>'

        CommentBoxList += '<input  style="font-weight:bold; float:right; margin-right:19%; margin-bottom:10px;" id="newcommentcancel' + j + '" type="button" onclick="newcommentcancel(this)" value="Cancel">'
        CommentBoxList += '<input  style="font-weight:bold; float:right;" id="newcommentsave' + j + '" type="button" onclick="newcommentsave(this)" value="Save">'
        CommentBoxList +='</div>'

        CommentBoxList += '<br><button class="btn btn-default" type="button" id="newcomment' + j + '"  style="margin-left:10px;margin-bottom:10px;font-size:15px;heigh:30px" onclick="newcomment(this)">Comment <i class="fa fa-commenting-o" style="font-size:20px;"></i></button>'

        CommentBoxList += '</div>'
    }
    $("#commentboxlist").append(CommentBoxList);
}

// Selected the comment table to edit,just open this one and color Highlight
function select_comment_table(obj) {
    $(obj).css({"background-color":"#2ce32c","color":"#1B548D"}).siblings().css({"background-color":"lightgreen","color":"black"});
    var title_id=$(obj).attr("id")
    var text_id=title_id.replace(/Source/i,"Target");
    $("#"+text_id).show().siblings().css("display","none");
    $("#commentboxlist").css("border","1px solid #ccc");

    //If the user and the commenter are the same person,icons "pencil" "trashcomment" and "save" are displayed
    var loginname=new RegExp($(".inline-ul").find("b").text());
    var CommentIdList=[]; // list comments id in every comment table
    $(".CommentBoxList").children("input.comment-title").each(function(){
                        CommentIdList.push($(this).attr("id"));
                });
    for (var i=0;i<CommentIdList.length;i++){
        var commentname=$("#"+CommentIdList[i]).val();
        var commentNumber=CommentIdList[i].replace(/author-comment/i,"");
        var commenttextclass=CommentIdList[i].replace(/author-comment/i,"commenttext");
        var textstatusvalue=$("#"+commenttextclass).attr("class");
        var patt=/collapse in/;
        if(loginname.test(commentname)==false){
            $("#pencil"+commentNumber).css("display","none");
            $("#trashcomment"+commentNumber).css("display","none");
            $("#save"+commentNumber).css("display","none");
            $("#focuscomment"+commentNumber).attr("readonly","readonly");
        }else{
            $("#pencil"+commentNumber).css("display","inline");
            $("#trashcomment"+commentNumber).css("display","inline");
        }
    }
}

// Click "pencil" icon to open or collapse textarea and change "angle-right" or "angle-right" status
function Pencil(obj){
   var textidvalue=$(obj).attr('id');
   var commenttextvalue=textidvalue.replace(/pencil/i,"commenttext");
   var commentnameid=textidvalue.replace(/pencil/i,"author-comment");
   var commentdown=textidvalue.replace(/pencil/i,"commentright");
   var focuscommentid=textidvalue.replace(/pencil/i,"focuscomment");
   var commentname=$("#"+commentnameid).val();
   var saveidvalue=textidvalue.replace(/pencil/i,"save");
   var loginname=new RegExp($(".inline-ul").find("b").text());

   $("#"+commenttextvalue).attr("class","collapse in");
   $("#"+commenttextvalue).find("textarea").focus();
   $("#"+commentdown).attr("class","fa fa-angle-down");
   //$("#"+textidvalue).css("color","#ccc").siblings().css("color","#1B548D");

   // If the user and commenter are the same person and opened 'commenttext',display "save" icon
   if(loginname.test(commentname)){
       $("#"+saveidvalue).css("display","inline");
   }else{
       $("#"+saveidvalue).css("display","none");
   }
}

// Click 'save' icon
function CommentEditSave(obj){
   var saveidvalue=$(obj).attr('id');
   var Pencilid=saveidvalue.replace(/save/i,"pencil");
   var textcommentid=Pencilid.replace(/pencil/i,"focuscomment");
   let content = $("#"+textcommentid).val()
   let comment_id = $("#"+textcommentid).attr('comment_id');
   //$("#"+Pencilid).css("color","#1B548D");
   $.ajax({
        type: "GET",
        url: "/spec/modify_spec_comment",
        data: {comment_id: comment_id, content: content},
        success: function (dict) {

        },
        error: function(){

        }
    })

}

// Click "angle-down" or "angle-right" icon status occording to textarea collapse or open
function AngleRight(obj){
   var textidvalue=$(obj).attr('id');
   var commenttextvalue=textidvalue.replace(/commentright/i,"commenttext");
   var saveidvalue=textidvalue.replace(/commentright/i,"save");
   var commentnameid=textidvalue.replace(/commentright/i,"author-comment");
   var commentname=$("#"+commentnameid).val();
   var textstatusvalue=$("#"+commenttextvalue).attr("class");

   var patt=/collapse in/;
   var loginname=new RegExp($(".inline-ul").find("b").text());

   // Change the status of '$(obj)' depending on 'commenttext' status
   if (patt.test(textstatusvalue)){
       $("#"+textidvalue).attr("class","fa fa-angle-right");
   }else{
       $("#"+textidvalue).attr("class","fa fa-angle-down");
   }

   //If the user and commenter are the same person and opened 'commenttext',display "save" icon
   if( loginname.test(commentname)){
       if( patt.test(textstatusvalue)){
           $("#"+saveidvalue).css("display","none");
       }else{
           $("#"+saveidvalue).css("display","inline");
       }
   }
}

//click "strash" icon,read author info to strash-moda
function strashcomment(obj){
    var strashid=$(obj).attr('id');
    var commentauthorid=strashid.replace(/trashcomment/i,"author-comment");
    var textcommentid=strashid.replace(/trashcomment/i,"focuscomment");
    var authorinfo=$("#"+commentauthorid).attr("value");
    $("#deleteauthor").val(authorinfo);
    $("#deleteauthor").attr('comment_id', $('#' + textcommentid).attr('comment_id'));
    $("#deleteauthor").attr('comment_delete', $('#' + textcommentid).attr('id'));
}

// Click 'comment' button, display a new comment box.
function newcomment(obj){
    var newcommentid=$(obj).attr('id');
    var commentnewshow=newcommentid.replace(/newcomment/i,"newcommentset");
    $("#"+commentnewshow).css("display","inline");
    $("#"+newcommentid).css("display","none")
}

//Click 'cancel' button in new comment box,exit new comment status
function newcommentcancel(obj){
    var commentcancelid=$(obj).attr('id');
    var commentnewclose=commentcancelid.replace(/newcommentcancel/i,"newcommentset");
    var commentbtnid=commentcancelid.replace(/newcommentcancel/i,"newcomment");
    var textcommentid=commentcancelid.replace(/newcommentcancel/i,"commenttextnew");
    $("#"+commentnewclose).css("display","none");
    $("#"+commentbtnid).css("display","inline");
    $("#"+textcommentid).val("");
}

// Click 'save' button in new comment box
function newcommentsave(obj){
    var commentsaveid=$(obj).attr('id');
    var commentnewclose=commentsaveid.replace(/newcommentsave/i,"newcommentset");
    var commentbtnid=commentsaveid.replace(/newcommentsave/i,"newcomment");
    var textcommentid=commentsaveid.replace(/newcommentsave/i,"commenttextnew");
    let item_target = $(obj).parent().parent().attr('id').replace(/Target/i,"Source")
    console.log(item_target)
   $("#"+commentnewclose).css("display","none");
   $("#"+commentbtnid).css("display","inline");
   let content = $("#"+textcommentid).val()
   let case_id = $("#"+textcommentid).attr('comment_id');
   let username = $(".inline-ul").find("b").text()
   $.ajax({
        type: "GET",
        url: "/spec/insert_spec_comment",
        data: {comment_id: case_id, content: content, standard_ids: GLOBAL_STANDARD.STANDARD_IDS.toString()},
        success: function (dict) {
            commenttable(GLOBAL_STANDARD.STANDARD_TITLE, GLOBAL_STANDARD.STANDARD_IDS, eval(dict))
            $('#' + item_target).click()
        },
        error: function(){

        }
    })
}

function deleteComment() {
    let comment_id = $("#deleteauthor").attr('comment_id')
   $.ajax({
        type: "GET",
        url: "/spec/delete_spec_comment",
        data: {comment_id: comment_id},
        success: function (dict) {
            $('#strash-modal').modal('hide')
            let target = $("#deleteauthor").attr('comment_delete')
            console.log(target)
            $('#' + target).remove()
            let save = target.replace(/focuscomment/, 'save')
            let trashcomment = target.replace(/focuscomment/, 'trashcomment')
            let pencil = target.replace(/focuscomment/, 'pencil')
            let author_comment = target.replace(/focuscomment/, 'author-comment')
            let commentright = target.replace(/focuscomment/, 'commentright')
            let commenttext = target.replace(/focuscomment/, 'commenttext')
            $('#' + save).remove()
            $('#' + pencil).remove()
            $('#' + author_comment).remove()
            $('#' + commentright).remove()
            $('#' + commenttext).remove()
            $('#' + trashcomment).remove()

        },
        error: function(){
            $('#strash-modal').modal('hide')
        }
    })
}
