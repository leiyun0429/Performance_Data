jQuery(function($){
    var param = window.location.search.substring(1)
    param.substring(1, param.length-1)
    data_summary(param)

    if(param==''){
        var release_name_lists =  $('#release_name').html().split('_')
        var release_checked = ''
        if(release_name_lists.length==3){
            release_checked = release_name_lists[0] + '_' + release_name_lists[1] + '.' + release_name_lists[2]
        }else {
            release_checked = release_name_lists
        }
        $('.my_summary').find('input').each(function () {
            if($(this).val()==release_checked){
                $(this).attr("checked", true)
                var click_ul = $(this).parents('ul[class="my-submenu"]')
                if(click_ul.is(":hidden")){
                    $(".my-submenu").hide();
                    click_ul.slideDown();
                }
            }
        });
    }else {
        var param_array = param.split('&')
        var release_checked = []
        for(var i=0;i<param_array.length;i++){
            var release_map = param_array[i].split('=')
            release_checked.push(release_map[1])
        }
        $('.my_summary').find('input').each(function () {
            if(release_checked.indexOf($(this).val())>-1){
                $(this).attr("checked", true)
                var click_ul = $(this).parents('ul[class="my-submenu"]')
                if(click_ul.is(":hidden")){
                    $(".my-submenu").hide();
                    click_ul.slideDown();
                }
            }
        });
    }

    copyFn()


    $('#release_name').html('summary')

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

            var filename = []
            var flag = true
            if(array.length == filename_check.length){
                for(var i=0; i<array.length; i++){
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
                                    var percent = Math.floor(100*loaded/total)+"%";
                                    var load = Math.floor(100*loaded/total)
                                    $('#loadprogress').attr('value', load)
                                    $('#progressdisplay').html('Upload state:' + percent)
                                }, false)
                            }
                            return xhr_request
                        },
                        success: function(dict){
                            $('#myDialog').css('pointer-events', 'auto')
                            $('#myDialog').css('background-color', '#FFC')
                            var arg = eval(dict)
                            //alert(arg.count + ' file upload successfully')
                            $('#upload_status').html(arg.message)
                        },
                        error: function(){
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

    setInterval(CheckIfOutTime, 30000)

});


function getCookie(name) {
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
    return unescape(arr[2]);
    else
    return null;
}

function CheckIfOutTime() {
    if(getCookie('user_number') == null){
        window.location.href = window.location.protocol + window.location.host
        return
    }
}

//Draw Summary Table
var divv = '<div style="overflow: auto">'
var back_divv = '</div>'

var standard_option = ['SPECCPU', 'SPECjbb', 'LMbench', 'iPerf', 'FIO']
var soc_option = ['CPU_Type', 'Total_Socket', 'Cores_per_Socket', 'Threads_per_Core', 'Total_Threads', 'CPU_Frequency', 'CPU_Max_Frequency', 'CPU_Min_Frequency', 'L1_Cache_Size', 'L2_Cache_Size', 'L3_Cache_Size']
var hard_option = ['Platform', 'Memory_Total_Size', 'Total_Memory', 'Memory_Speed', 'Memory_Configured_Clock', 'NIC_Info', 'Disk_Info', 'PCIe_Info']
var soft_option = ['OS', 'Linux_Kernel', 'BIOS', 'GCC', 'GLIBC', 'JAVA', 'SPEC_CPU', 'SPEC_JBB', 'Lmbench', 'Iperf', 'FIO']
var tune_option = ['CPU_Avaiable_Govorner', 'CPU_Current_Govorner', 'IRQ_Balance_Status', 'Tuned_Profile', 'Firewall_Status', 'Auditd_Status', 'Customization']

var Global_Filter_Param = ''

function data_summary(param) {
    var release_name = $('#release_name').html()
    if(param==''){
        if(release_name=='summary'){
            var query_release = $('.my_summary').serialize()
        }else {
            var summary_release = ''
            var release_name_list =  $('#release_name').html().split('_')
            if(release_name_list.length==3){
                summary_release = release_name_list[0] + '_' + release_name_list[1] + '.' + release_name_list[2]
            }else {
                summary_release = release_name_list
            }
            var query_release = 'release=' + summary_release
        }
    }else {
        var query_release = param
    }

    if(query_release == ''){
        return alert('Bad Option')
    }

    Global_Filter_Param = query_release

    $.ajax({
        type:"GET",
        url: "/query_release/",
        data: query_release,
        success: function(dict){
            var arg = eval(dict);
            if (arg.hasOwnProperty('flag')) {
                if(!document.getElementById('summary')){
                    var string = ''
                    string += '<div class="box round first"><h2><b style="font-size: 18px">Benchmark Results Summary</b></h2><input type="button" style="float:right;border-radius:5px;font-weight:bold;font-size: 11px; margin-right:1%;margin-top:-28px;height:23px" value="Copy Link" class="copy-btn"><div style="overflow: auto"><table class="summary-table1" id="summary"></table></div></div>'
                    string += '<div class="box round first lala"><h2><b style="font-size: 18px">SoC Configuration</b></h2><div style="overflow: auto"><table class="summary-table1" id="soc"></table></div></div>'
                    string += '<div class="box round first lala"><h2><b style="font-size: 18px">Hardware Configuration</b></h2><div style="overflow: auto"><table class="summary-table1" id="hardware"></table></div></div>'
                    string += '<div class="box round first lala"><h2><b style="font-size: 18px">Software Configuration</b></h2><div style="overflow: auto"><table class="summary-table1" id="software"></table></div></div>'
                    string += '<div class="box round first lala"><h2><b style="font-size: 18px">System Setting</b></h2><div style="overflow: auto"><table class="summary-table1" id="tune"></table></div></div>'
                    $('#summary_table').append(string);
                }

                var column_array = ['summary', 'soc', 'hardware', 'software', 'tune']
                var notice_null = '<h2 style="text-align: center;vertical-align: middle">No More Data!</h2>'
                for(var i=0; i<column_array.length;i++){
                    $('#' + column_array[i]).empty()
                    $('#' + column_array[i]).append(notice_null)
                }
                return
            }

            if(Object.getOwnPropertyNames(arg.summary_data).length>0){
                $('#summary_table').children().remove()
                var summary_title = arg.summary_title

                try {
                    var summary_data = change_data_order(arg.summary_data)
                    var data_object = new draw_table(summary_data)
                    var label  = data_object.label
                    var second_multi_tmp = data_object.second_multi

                    var title = '<div class="box round first"><h2><b style="font-size: 18px">Benchmark Results Summary</b></h2><input type="button" style="float:right;border-radius:5px;font-weight:bold;font-size: 11px; margin-right:1%;margin-top:-28px;height:23px" value="Copy Link" class="copy-btn">\n' + divv + '<table class="summary-table1" id="summary">'
                    var header = tr + td + '1' + col + '1' + '" style="font-weight: bold' + fu + 'Standard' + back_td + td + '1' + col + second_multi_tmp  + '" style="font-weight: bold' + fu + 'Items' + back_td
                    for(var i=0; i<summary_title.length;i++){
                        header += td + '1' + col + '1' + '" style="font-weight: bold' + fu + summary_title[i] + back_td
                    }
                    var summary_header = header + back_tr;
                    label =title + summary_header + label + '</tabel>' + back_divv + back_divv

                    $('#summary_table').append(label);
                }
                catch (e) {

                }finally {
                    // //Make global var be back
                    // height = 0;
                    // width = 0;
                    // width_list = [];
                    // count = 0
                    // cols = 0
                    // count_width = 0
                    // summery_str = ''
                }

                //Draw config
                var config_name = ['SoC Configuration', 'Hardware Configuration', 'Software Configuration', 'System Setting']
                var id_name = ['soc', 'hardware', 'software', 'tune']
                var config_header = []
                for(var j=0; j<config_name.length;j++) {
                    var config_temp = '<div class="box round first lala"><h2>' + '<b style="font-size: 18px">' + config_name[j] + '</b>' + '</h2>' + divv + '<table class="summary-table1" id=' + id_name[j] + '>'
                    config_temp += tr + '<td class="th_summary" style="font-weight: bold">' + 'NAME' + back_td
                    for(var i=0; i<summary_title.length; i++){
                        config_temp += '<td class="td_summary" style="font-weight: bold">' + summary_title[i] + back_td
                    }
                    config_temp += back_tr
                    config_header.push(config_temp)
                }

                var soft = draw_config('software',arg.summary_soft_config)
                soft += '</tabel>' + back_divv + back_divv

                var hard = draw_config('hardware', arg.summary_hard_config)
                hard += '</tabel>' + back_divv + back_divv

                var soc = draw_config('soc', arg.summary_hard_config)
                soc += '</tabel>' + back_divv + back_divv

                var tune = draw_config('tune', arg.summary_tune)
                tune += '</tabel>' + back_divv + back_divv

                var soc_configuration = config_header[0] + soc

                $('#summary_table').append(soc_configuration)
                var hard_configuration =  config_header[1] + hard
                $('#summary_table').append(hard_configuration)
                var soft_configuration =  config_header[2] + soft
                $('#summary_table').append(soft_configuration)
                var tune_configuration =  config_header[3] + tune
                $('#summary_table').append(tune_configuration)
                second_multi = 1;
                line_color()
            }
            else {
                alert('No more data!')
            }

        },
        error: function(){
            console.log('false')
        }
    });
}

function change_data_order(object) {
    var right_order = {}
    for(var i=0; i<standard_option.length; i++){
        var temp = standard_option[i]
        if(object[temp] != undefined){
            right_order[temp] = object[temp]
        }
    }
    return right_order
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

function line_color() {
    $('table').each(function(){
        $(this).find('tr:even').css("background","#ccc");
        $(this).find('tr:odd').css("background","#eee");
        $(this).children().children().eq(0).css("background","lightgreen");
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

function copyToClipBoard(){
    var clipBoardContent="";
    if(Global_Filter_Param == ''){
        clipBoardContent+= window.location.origin + window.location.pathname
    }else {
        clipBoardContent+= window.location.origin + window.location.pathname + '?' + Global_Filter_Param;
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
