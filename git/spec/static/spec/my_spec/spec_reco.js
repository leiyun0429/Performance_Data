//document.write("<script language=javascript src='table_tool.js'></script>");
jQuery(function ($) {

    window.onload = function (ev) {
        $('form#upload').submit(function(event) {
            event.preventDefault();
            var filename_check = ['csv', 'ini', 'exe']
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
                                    $('#progressdisplay').attr('value','upload state:' + percent)
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

    // window.onload = function (ev) {
    //     $('form#query_all').submit(function(event) {
    //
    //         event.preventDefault();
    //         var data = new FormData(this);
    //
    //         console.log(data)
    //         $.ajax({
    //             type:"POST",
    //             url: "/standard_query/",
    //             data: data,
    //             success: function(dict){
    //                 var arg = eval(dict)
    //                 console.log(arg)
    //             },
    //             error: function(){
    //             }
    //         });
    //     });
    // }

    query_box('speccpu', true)
});


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
    var li = '<li>'
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
            console.log(default_items)
            $('#query').empty()
            //This is filter box
            for(var items in default_items){
                filter_string += select + ' id=' + '"' + items + '"' + style_name + '"' + items + '"' + style + back
                for(var i=0; i<default_items[items].length;i++){
                    filter_string += option + option_value + '"' + default_items[items][i] + '"' + back + default_items[items][i] + back_option
                }

                filter_string += back_select
                $('#query').append(filter_string)
                $('#' + items).multiselect({
                    buttonWidth: 80,
                    includeSelectAllOption: false,
                    allSelectedText:'select all',
                    nonSelectedText: query_box_dict[items],
                    selectedList:4,
                    numberDisplayed: 3,
                });
                filter_string = ''
            }

            //This is filter box
            for(var i=0; i<extra_items.length; i++){
                filter_extra += li + label + input + '"' + extra_items[i] + '"' + back + query_box_dict[extra_items[i]] + back_label + back_li
            }
            $('#add_filter').empty()
            $('#add_filter').append(filter_extra)

        }
    });
}


function filter_query_table() {
    var query = $('#query').serialize()
    var back = '>'
    var tr = '<tr>'
    var back_tr = '</tr>'
    var td = '<td '
    var back_td = '</td>'
    var label = '<label style="display:block;">'
    var back_label = '</label>'
    var input = '<input '
    var td_style = 'class="td-modal"'
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
    var count=0

    $.ajax({
        type:"GET",
        url: "/spec/filter_query_table/",
        //async: true,
        data: {query: query},
        success: function(dict){
            $('#query_condition').empty()
            var conditions = eval(dict)

            var title = conditions['title']
            query_condition_str += tr + td + td_style + back + '&nbsp' + td
            for(var j=0; j<title.length;j++){
                query_condition_str += td + td_style + back + query_box_dict[title[j]] + td
            }
            query_condition_str += back_tr
            delete conditions.title

            if(Object.getOwnPropertyNames(conditions).length ==1){
                for(var key in conditions){
                    draw_all_data(key)
                }
            }

            for(var key in conditions){
                query_condition_str += tr + td + td_style + back + label + input + 'name=' + name + ' value=' + key + ' type="checkbox"' + back + back_label + back_td
                var condition = conditions[key]
                for(var i=0; i<condition.length; i++){
                    query_condition_str += td + td_style + back + condition[i] + back_td
                }
                query_condition_str += back_tr
            }

            $('#query_condition').append(query_condition_str)
            line_color()

        },
        error: function(){

        }
    });
}


// //Draw Summary Table
// var divv = '<div style="overflow: auto">'
// var back_divv = '</div>'
// var second_multi = 1;
// var tr = '<tr>';
// var back_tr = '</tr>';
// var td = '<td class="td_summary" rowspan=\"';
// var fu = '\">';
// var back_td = '</td>';
// var summery_str = '';
// var temp = tr;
// var col = '\" colspan=\"';
// var count = 0;
// var cols = 0;
// var count_width = 0;
// var width = 0
// var width_list = []
// var height = 0;
// var standard_option = ['speccpu', 'specjbb', 'lmbench', 'Iperf', 'FIO']
// var soc_option = ['CPU_Type', 'Total_Socket', 'Cores_per_Socket', 'Threads_per_Core', 'Total_Threads', 'CPU_Frequency', 'CPU_Max_Frequency', 'CPU_Min_Frequency', 'L1_Cache_Size', 'L2_Cache_Size', 'L3_Cache_Size']
// var hard_option = ['Platform', 'Memory_Total_Size', 'Total_Memory', 'Memory_Speed', 'Memory_Configured_Clock', 'Netcard_Info', 'Disk_Info', 'PCI_Info']
// var soft_option = ['OS', 'Linux_Kernel', 'BIOS', 'GCC', 'GLIBC', 'JAVA', 'SPEC_CPU', 'SPEC_JBB', 'Lmbench', 'Iperf', 'FIO']
// var tune_option = ['CPU_Avaiable_Govorner', 'CPU_Current_Govorner', 'IRQ_Balance_Status', 'Tuned_Profile', 'Firewall_Status', 'Auditd_Status', 'Customization']
//
//
// function data_summary() {
//     var release_name =  $('#release_name').html().replace('_', '.')
//     if(release_name=='summary'){
//         var query_release = $('.my_summary').serialize()
//     }else {
//         var query_release = 'release=' + release_name
//     }
//
//     $('#summary_table').children().remove()
//
//     console.log(query_release)
//     $.ajax({
//         type:"GET",
//         url: "/query_release/",
//         data: query_release,
//         success: function(dict){
//             var arg = eval(dict);
//             var summary_title = arg.summary_title
//
//             var summary_data = change_data_order(arg.summary_data)
//             second_width_multi(summary_data)
//             var label = draw_summary_table(summary_data)
//             var title = '<div class="box round first"><h2><b style="font-size: 18px">Release Summary Information</b></h2>' + divv + '<table class="summary-table1">'
//             var header = tr + td + '1' + col + '1' + '" style="font-weight: bold' + fu + 'Standard' + back_td + td + '1' + col + second_multi  + '" style="font-weight: bold' + fu + 'Items' + back_td
//             for(var i=0; i<summary_title.length;i++){
//                 header += td + '1' + col + '1' + '" style="font-weight: bold' + fu + summary_title[i] + back_td
//             }
//             var summary_header = header + back_tr;
//             label =title + summary_header + label + '</tabel>' + back_divv + back_divv
//
//             $('#summary_table').append(label);
//
//             //Make global var be back
//             height = 0;
//             width = 0;
//             width_list = [];
//             count = 0
//             cols = 0
//             count_width = 0
//             summery_str = ''
//
//             //Draw config
//             var config_name = ['SOC Configuration', 'HardWare Configuration', 'SoftWare Configuration', 'Tune']
//             var config_header = []
//             for(var j=0; j<config_name.length;j++) {
//                 console.log(config_name[j])
//                 var config_temp = '<div class="box round first lala"><h2>' + '<b style="font-size: 18px">' + config_name[j] + '</b>' + '</h2>' + divv + '<table class="summary-table1">'
//                 config_temp += tr + '<td class="td_summary" style="font-weight: bold">' + 'NAME' + back_td
//                 for(var i=0; i<summary_title.length; i++){
//                     config_temp += '<td class="td_summary" style="font-weight: bold">' + summary_title[i] + back_td
//                 }
//                 config_temp += back_tr
//                 config_header.push(config_temp)
//             }
//             //var config_header = '<div class="box round first"><h2>SOC Configuration</h2>' + divv + '<table class="summary-table1">'
//             //config_header += tr + '<td class="td_summary" style="font-weight: bold">' + 'NAME' + back_td
//             //console.log(config_header)
//             var soft = draw_config('software',arg.summary_soft_config)
//             soft += '</tabel>' + back_divv + back_divv
//             //soft = tr + '<td class="td_summary" style="font-weight: bold" colspan="' + (summary_title.length+1).toString() +  '\">' + 'SoftWare Configuration' + back_td + back_tr + soft
//             var hard = draw_config('hardware', arg.summary_hard_config)
//             hard += '</tabel>' + back_divv + back_divv
//             //hard = tr + '<td class="td_summary" style="font-weight: bold" colspan="' + (summary_title.length+1).toString() +  '\">' + 'HardWare Configuration' + back_td + back_tr + hard
//             var soc = draw_config('soc', arg.summary_hard_config)
//             soc += '</tabel>' + back_divv + back_divv
//             //soc = tr + '<td class="td_summary" style="font-weight: bold" colspan="' + (summary_title.length+1).toString() +  '\">' + 'SOC' + back_td + back_tr + soc
//             var tune = draw_config('tune', arg.summary_tune)
//             tune += '</tabel>' + back_divv + back_divv
//             //tune = tr + '<td class="td_summary" style="font-weight: bold" colspan="' + (summary_title.length+1).toString() +  '\">' + 'Tune' + back_td + back_tr + tune
//             //var configuration = config_header + soc + hard  + soft + tune
//             //var configuration = config_header[0] + soc + config_header[1] + hard +config_header[2] + soft + config_header[3] + tune
//             var soc_configuration = config_header[0] + soc
//             //$('#summary_table').children().remove()
//             $('#summary_table').append(soc_configuration)
//             var hard_configuration =  config_header[1] + hard
//             $('#summary_table').append(hard_configuration)
//             var soft_configuration =  config_header[2] + soft
//             $('#summary_table').append(soft_configuration)
//             var tune_configuration =  config_header[3] + tune
//             $('#summary_table').append(tune_configuration)
//             second_multi = 1;
//             line_color()
//         },
//         error: function(){
//             console.log('false')
//         }
//     });
// }
//
// //for table's height
// function table_height(arg){
//     height = 0;
//     dict_height(arg);
//     //console.log(height);
//     return height
// }
//
// function dict_height(arg) {
//     for(var i in arg){
//         if(arg[i] instanceof Array){
//             console.log(i + ' :in')
//             height += 1
//         }
//         else {
//             console.log(i + ' :out')
//             dict_height(arg[i])
//         }
//     }
// }
//
// function deal_repeat_array(lists) {
//     var new_list = []
//     for(var i=0;i<lists.length;i++){
//         if(new_list.indexOf(lists[i]) == -1){
//             new_list.push(lists[i])
//         }
//     }
//     return new_list
// }
//
// function second_width_multi(items) {
//     dict_width(items)
//     console.log('width_list:' + width_list)
//     var array = deal_repeat_array(width_list)
//     var result = 1
//     for(var i=0; i<array.length;i++){
//         result = result* array[i]
//     }
//     second_multi = result
//     return result
// }
//
// function dict_width(items) {
//     for(var item in items){
//        if(items[item] instanceof Array){
//            width_list.push(width)
//            console.log(item)
//         }
//         else {
//            width += 1;
//            dict_width(items[item])
//         }
//     }
//     width = width - 1
// }
//
// function draw_summary_table(arg) {
//     app_table(arg)
//     return summery_str
// }
//
// function app_table(items) {
//     for(var item in items){
//         if(items[item] instanceof Array){
//             var rows = 0
//         }else {
//             var rows = table_height(items[item])
//         }
//
//         if(rows==0){
//             rows = 1;
//         }
//         if(count==0){
//             cols=1
//         }else {
//             cols = second_multi/width_list[count_width]
//         }
//         temp += td + rows + col + cols + fu + item + back_td;
//         if(items[item] instanceof Array){
//             count_width += 1
//             temp += tabel_data_conn(items[item])
//             temp += back_tr;
//             summery_str += temp
//             temp =  tr;
//         }
//         else {
//             count += 1
//             app_table(items[item])
//         }
//     }
//     count = count - 1;
// }
//
// function tabel_data_conn(array){
//     var str = '';
//     for(var i=0; i<array.length;i++){
//         str += '<td class="td_summary">' + array[i] + back_td
//     }
//     return str
// }
//
//
//
// function change_data_order(object) {
//     var right_order = {}
//     for(var i=0; i<standard_option.length; i++){
//         var temp = standard_option[i]
//         if(object[temp] != undefined){
//             right_order[temp] = object[temp]
//         }
//     }
//     return right_order
// }
//
// function draw_config(name, config){
//     var str = ''
//     var temp;
//     if(name == 'software'){
//         var config_order = soft_option
//     }else if(name == 'hardware'){
//         var config_order = hard_option
//     }else if(name == 'tune'){
//         var config_order = tune_option
//     }else{
//         var config_order = soc_option
//     }
//     for(var j=0;j<config_order.length;j++){
//         var values = config_order[j]
//
//         if(config[values] != undefined){
//
//             str += tr + '<td class="th_summary">' + values + back_td
//             for(var i=0; i<config[values].length; i++){
//                 if(values=='Netcard_Info'){
//                     var network = [' ', 'speed: ', 'driver: ', 'vendor: ', 'bus: ']
//                     var netstr = ''
//                     temp = config[values][i].split(';')
//                     for(var k=0; k<temp.length; k++){
//                         var network_list = temp[k].replace('"', '').split(',')
//                         for(var s=0; s<network_list.length;s++){
//                             if(s==network_list.length-1){
//                                 netstr += network[s] + network_list[s] + '<br>'
//                             }else {
//                                 netstr += network[s] + network_list[s] + '<br>&nbsp&nbsp&nbsp'
//                             }
//                         }
//                     }
//                     //temp = config[values][i].replace(/"/g, '').replace(/,/g, '<br>&nbsp&nbsp&nbsp').replace(/;/g, '<br>')
//                     str += '<td class="td_summary" style="text-align: left">' + netstr + back_td
//                 }else if(values=='Disk_Info'){
//                     var disk = [' ', 'size: ', 'type: ', 'interface: ', 'io_scheduler: ', 'vendor: ']
//                     var diskstr = ''
//                     temp = config[values][i].split(';')
//                     for(var k=0; k<temp.length; k++){
//                         var disk_list = temp[k].replace('"', '').split(',')
//                         for(var s=0; s<disk_list.length;s++){
//                             if(s==disk_list.length-1){
//                                 diskstr += disk[s] + disk_list[s] + '<br>'
//                             }else {
//                                 diskstr += disk[s] + disk_list[s] + '<br>&nbsp&nbsp&nbsp'
//                             }
//
//                         }
//                     }
//                     //temp = config[values][i].replace(/"/g, '').replace(/,/g, '<br>&nbsp&nbsp&nbsp').replace(/;/g, '<br>')
//                     str += '<td class="td_summary" style="text-align: left">' + diskstr + back_td
//                 }
//                 else if(values=='PCI_Info'){
//                     temp = config[values][i].replace(/"/g, '').replace(/;/g, '<br>')
//                     str += '<td class="td_summary" style="text-align: left">' + temp + back_td
//                 }
//                 else {
//                     temp = config[values][i]
//                     str += '<td class="td_summary">' + temp + back_td
//                 }
//             }
//             str += back_tr
//
//         }
//     }
//     return str
// }
//
// function line_color() {
//     $('table').each(function(){
//         $(this).find('tr:even').css("background","#ccc");
//         $(this).find('tr:odd').css("background","#eee");
//         $(this).children().children().eq(0).css("background","lightgreen");
//     });
// }
var standard_option = ['speccpu', 'specjbb', 'lmbench', 'Iperf', 'FIO']
var soc_option = ['CPU_Type', 'Total_Socket', 'Cores_per_Socket', 'Threads_per_Core', 'Total_Threads', 'CPU_Frequency', 'CPU_Max_Frequency', 'CPU_Min_Frequency', 'L1_Cache_Size', 'L2_Cache_Size', 'L3_Cache_Size']
var hard_option = ['Platform', 'Memory_Total_Size', 'Total_Memory', 'Memory_Speed', 'Memory_Configured_Clock', 'NIC_Info', 'Disk_Info', 'PCIe_Info']
var soft_option = ['OS', 'Linux_Kernel', 'BIOS', 'GCC', 'GLIBC', 'JAVA', 'SPEC_CPU', 'SPEC_JBB', 'Lmbench', 'Iperf', 'FIO']
var tune_option = ['CPU_Avaiable_Govorner', 'CPU_Current_Govorner', 'IRQ_Balance_Status', 'Tuned_Profile', 'Firewall_Status', 'Auditd_Status', 'Customization']

function draw_all_data(obj) {
    if(obj == 'haha'){
        var data = $('#query_all').serialize();
    }else {
        var data = {'query_item': obj}
    }

    $.ajax({
        type:"GET",
        url: "/spec/standard_query/",
        data: data,
        //async: false,
        // processData: false,
        // contentType: false,
        success: function(dict){
            var arg = eval(dict)
            var label = ''
            console.log(arg)

            var standard_title = arg.standard_title
            //Draw data table
            var data_object = new draw_table(arg.standard_data_form)

            var second_multi = data_object.second_multi

            var header = tr + td + '1' + col + '1' + '" style="font-weight: bold' + fu + 'Standard' + back_td + td + '1' + col + second_multi  + '" style="font-weight: bold' + fu + 'Items' + back_td
            for(var i=0; i<standard_title.length;i++){
                var stand = standard_title[i].split(',')
                header += td + '1' + col + '1' + '" style="font-weight: bold' + fu + stand[0] + '<br><span style="font-size: 11px">' + stand[1] + '</span>' + back_td
            }
            var summary_header = header + back_tr;
            label += summary_header
            label += data_object.label
            //console.log(label)
            $('#lala').empty()
            $('#lala').append(label)
            line_color()
            deleteCol(0)

            //Draw Figure
            $('#chart').empty()
            var figure = arg.standard_data_figure
            var figure_count = 0
            for(var test in figure){
                figure_count += 1
                draw_figure(figure[test], test)
            }
            var figure_height = figure_count * 400
            $('#chart').css('display' , 'block')
            $('#chart').css('height' , figure_height.toString() + 'px')

            $('#myModal').modal('hide');


            //Draw Config
            var config_name = ['SOC Configuration', 'HardWare Configuration', 'SoftWare Configuration', 'Tune']
            var config_header = []
            for(var j=0; j<config_name.length;j++) {
                //var config_temp = '<div class="box round first lala"><h2>' + '<b style="font-size: 18px">' + config_name[j] + '</b>' + '</h2>' + divv + '<table class="summary-table1">'
                var config_temp  = ''
                config_temp += tr + '<td class="th_summary" style="font-weight: bold;width: 230px">' + 'NAME' + back_td
                for(var i=0; i<standard_title.length; i++){
                    var stand = standard_title[i].split(',')
                    config_temp += '<td class="td_summary" style="font-weight: bold">' + stand[0] + '<br><span style="font-size: 11px">' + stand[1] + back_td
                }
                config_temp += back_tr
                config_header.push(config_temp)
            }
            var soft = draw_config('software',arg.standard_soft_config)
            //soft += '</tabel>' + back_divv + back_divv
            var hard = draw_config('hardware', arg.standard_hard_config)
            //hard += '</tabel>' + back_divv + back_divv
            var soc = draw_config('soc', arg.standard_hard_config)
            //soc += '</tabel>' + back_divv + back_divv
            //var tune = draw_config('tune', arg.standard_tune)
            //tune += '</tabel>' + back_divv + back_divv
            var soc_configuration = config_header[0] + soc
            $('#soc').empty()
            $('#soc').append(soc_configuration)
            var hard_configuration =  config_header[1] + hard
            $('#hardware').empty()
            $('#hardware').append(hard_configuration)
            var soft_configuration =  config_header[2] + soft
            $('#software').empty()
            $('#software').append(soft_configuration)
            //var tune_configuration =  config_header[3] + tune
            //$('#summary_table').append(tune_configuration)
            second_multi = 1;
            line_color()


        },
        error: function(){
            $('#myModal').modal('hide');
        }
    });

}


function draw_figure(figure, name) {
    var line = "<div id=\"" + name + "\" style=\"width: 100%; height: 380px;display: inline-block;\"></div>"
    var div_line = '<div style="width: 100%; height: 2px; background-color: aqua;margin-top: 5px"></div>'
    $('#chart').append(line)
    $('#chart').append(div_line)
    var series = figure['data']
    for(var i=0; i<series.length;i++){
        series[i].barWidth = '15%'
    }
    // for(var i=1;i<chart.length;i++){
    //     legend_label.push(chart[i].shift())
    //     var temp = {
    //         name: legend_label[i-1],
    //         type: 'bar',
    //         data: chart[i]
    //     }
    //     series.push(temp)
    // }
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
                color: ['#5B9BD5','#ED7D31','#70AD47', '#A5A5A5', '#FFC000', '#4472C4', '#997300','#264478', '#9E480E', '#43682B'],
                toolbox: {
                    show : true,
                    feature : {
                        mark : {show: true},
                        dataView : {show: true, readOnly: false},
                        magicType: {show: true, type: ['line', 'bar']},
                        restore : {show: true},
                        saveAsImage : {show: true}
                    }
                },
                legend: {
                    layout: 'vertical',
                    top: '20px',
                    align: 'right',
                    verticalAlign: 'middle',
                },
                xAxis: {
                    type: 'category',
                    data: figure['xaxis']
                },
                yAxis: {
                    title: {
                        text: 'size'
                    },
                }
            }
    option.series = series
    console.log(option)
    echarts.init(document.getElementById(name)).setOption(option)
}


function line_color() {
    $('table').each(function(){
        $(this).find('tr:even').css("background","#ccc");
        $(this).find('tr:odd').css("background","#eee");
        $(this).children().children().eq(0).css("background","lightgreen");
    });
}


function deleteCol(number) {
    var index = number;
    var table = document.getElementById("lala");
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
        $.ajax({
            type: "GET",
            url: "/spec/add_filters",
            data: {condition: condition},
            success: function (dict) {
                var filter_item = eval(dict)
                for(var item in filter_item){
                    var filter_string = ''
                    filter_string += select + ' id=' + '"' + item + '"' + style_name + '"' + item + '"' + style + back
                    for(var i=0; i<filter_item[item].length;i++){
                        filter_string += option + option_value + '"' + filter_item[item][i] + '"' + back + filter_item[item][i] + back_option
                    }

                    filter_string += back_select
                    $('#query').append(filter_string)
                    $('#' + item).multiselect({
                        buttonWidth: 80,
                        includeSelectAllOption: false,
                        allSelectedText:'select all',
                        nonSelectedText: query_box_dict[item],
                        selectedList:4,
                        numberDisplayed: 3,
                    });
                    filter_string = ''
                }

            }
        });
    }
    else {
        $('#'+ condition).parent().remove()
    }


}


