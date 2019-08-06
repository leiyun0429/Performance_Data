//Draw Summary Table
var divv = '<div style="overflow: auto">'
var back_divv = '</div>'
var second_multi = 1;
var tr = '<tr>';
var back_tr = '</tr>';
var td = '<td class="td_summary" rowspan=\"';
var fu = '\">';
var back_td = '</td>';
var temp = tr;
var col = '\" colspan=\"';
var summery_str = '';
var count = 0;
var cols = 0;
var count_width = 0;
var width = 0
var width_list = []
var height = 0;

function draw_table(summary_data) {
    if(Object.keys(summary_data).length != 0) {
        try {
            second_width_multi(summary_data)
            var label = draw_summary_table(summary_data)
            this.label = label
            this.second_multi = second_multi
        } catch (e) {

        } finally {
            //Make global var be back
            height = 0;
            width = 0;
            width_list = [];
            count = 0
            cols = 0
            count_width = 0
            summery_str = ''
            second_multi = 1;
        }
    }
}



//Draw data table func
function table_height(arg){
    height = 0;
    dict_height(arg);
    //console.log(height);
    return height
}

function dict_height(arg) {
    for(var i in arg){
        if(arg[i] instanceof Array){
            height += 1
        }
        else {
            dict_height(arg[i])
        }
    }
}

function deal_repeat_array(lists) {
    var new_list = []
    for(var i=0;i<lists.length;i++){
        if(new_list.indexOf(lists[i]) == -1){
            new_list.push(lists[i])
        }
    }
    return new_list
}

function second_width_multi(items) {
    dict_width(items)
    var array = deal_repeat_array(width_list)
    var result = 1
    for(var i=0; i<array.length;i++){
        result = result* array[i]
    }
    second_multi = result
    return result
}

function dict_width(items) {
    for(var item in items){
       if(items[item] instanceof Array){
           width_list.push(width)
        }
        else {
           width += 1;
           dict_width(items[item])
        }
    }
    width = width - 1
}

function draw_summary_table(arg) {
    app_table(arg)
    return summery_str
}

function app_table(items) {
    for(var item in items){
        if(items[item] instanceof Array){
            var rows = 0
        }else {
            var rows = table_height(items[item])
        }

        if(rows==0){
            rows = 1;
        }
        if(count==0){
            cols=1
        }else {
            cols = second_multi/width_list[count_width]
        }
        temp += td + rows + col + cols + fu + item + back_td;
        if(items[item] instanceof Array){
            count_width += 1
            temp += tabel_data_conn(items[item])
            temp += back_tr;
            summery_str += temp
            temp =  tr;
        }
        else {
            count += 1
            app_table(items[item])
        }
    }
    count = count - 1;
}

function tabel_data_conn(array){
    var str = '';
    for(var i=0; i<array.length;i++){
        str += '<td class="td_summary">' + array[i] + back_td
    }
    return str
}