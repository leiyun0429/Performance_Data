jQuery(function($){
    home_table()

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


var patt=new RegExp(".ppt");
var tr = '<tr'
var label_end = '>'
var td_style = ' class="td_style" '
var back_tr = '</tr>'
var td = '<td'
var back_td = '</td>'
var str = ''
var a = '<a'
var back_a = '</a>'
var a_style = ' href="'
var double_symbol = '" '
var link_img = '<img src="../static/plugin/decoration/img/star_list.png">'
var inner_style_link = '<i class="fa fa-external-link" style="float:left;margin-left:19%;"></i> <span style="font-style:italic; float:left; padding-left:7px;text-decoration: underline;font-weight: lighter">'
var inner_style_ppt = '<i class="fa fa-file-powerpoint-o" style="float:left;margin-left:19%;"></i> <span style="font-style:italic; float:left;padding-left:7px;text-decoration: underline;font-weight: lighter">'
var inner_style_pdf = '<i class="fa fa-file-pdf-o" style="float:left;margin-left:19%;"></i> <span style="font-style:italic; float:left;padding-left:7px;text-decoration: underline;font-weight: lighter">'
var home_rank
//var title = '<thead><tr><th style="text-align: center; vertical-align: middle; "><div class="th-inner">Release</div><div class="fht-cell"></div></th><th style="text-align: center; vertical-align: middle; "><div class="th-inner">SoC</div><div class="fht-cell"></div></th><th style="text-align: center; vertical-align: middle; "><div class="th-inner">Platform</div><div class="fht-cell"></div></th><th style="text-align: center; vertical-align: middle; "><div class="th-inner">Release Date</div><div class="fht-cell"></div></th><th style="text-align: center; vertical-align: middle; "><div class="th-inner">Summary_Link</div><div class="fht-cell"></div></th></tr></thead>'

function home_table() {
     $.ajax({
        type:"GET",
        url: "/home_table/",
        success: function(dict) {
            var arg = eval(dict)
            home_rank = arg
            for(var i=0; i<arg.length; i++){
                str += tr + label_end
                var length = arg[i].length
                for(var j=0;j<arg[i].length-4;j++){
                    if(j==0){
                        str += td + td_style + label_end + arg[i][j].replace('_', ' ') + back_td
                    }else {
                        str += td + td_style + label_end + arg[i][j] + back_td
                    }
                }
                //str += td + td_style + label_end + a + a_style + arg[i][length-2] + double_symbol + label_end + link_img + arg[i][length-1] + back_a + back_td
                str += td + td_style + label_end


                if(arg[i][length-4] != ''){
                    str += a + a_style + arg[i][length-4] + double_symbol + label_end + inner_style_link + 'Release Summary' + '</span>' + back_a
                }
                if(arg[i][length-4] != '' && arg[i][length-3] != ''){
                    str += '<br>'
                }
                if(arg[i][length-3] != '' && patt.test(arg[i][length-3])==true){
                    str += a + a_style + arg[i][length-3] + double_symbol + label_end + inner_style_ppt + 'Release Report' + '</span>' + back_a
                }
		if(arg[i][length-3] != '' && patt.test(arg[i][length-3])==false){
                    str += a + a_style + arg[i][length-3] + double_symbol + label_end + inner_style_pdf + 'Release Report' + '</span>' + back_a
                }
                str += back_td

                str += td + td_style + label_end
                if(arg[i][length-2] != '') {
                    str += a + a_style + arg[i][length - 2] + double_symbol + label_end + inner_style_link + 'Release Summary' + '</span>' + back_a
                }
                if(arg[i][length-2] != '' && arg[i][length-1] != ''){
                    str += '<br>'
                }
                if(arg[i][length-1] != '' && patt.test(arg[i][length-1])==true) {
                    str += a + a_style + arg[i][length-1] + double_symbol + label_end + inner_style_ppt + 'Release Report' + '</span>' + back_a
                }
			
		if(arg[i][length-1] != '' && patt.test(arg[i][length-1])==false) {
                    str += a + a_style + arg[i][length-1] + double_symbol + label_end + inner_style_pdf + 'Release Report' + '</span>' + back_a
                }


                str += back_td
                str += back_tr
            }
            //console.log(str)
            $('#table_page').empty()
            //$('#table_page').append(title + str)
            $('#table_page').append(str)
            $("table tr:even").css("background-color","lightblue");
            $("table tr").eq(0).css("background-color", '#5bc0de');
            $("table tr").eq(0).css("font-size", '17px');

            $("#table_page").bootstrapTable({
				//	url: './GetData.txt',         //请求后台的URL（*）
				//	method: 'get',                      //请求方式（*）
				striped: true,                      //是否显示行间隔色
				pagination: true,                   //是否显示分页（*）
				sortable: true,  					//是否启用排序
				sortOrder: "asc",                   //排序方式
				//	sidePagination: "client",           //分页方式：client客户端分页，server服务端分页（*）
				pageNumber: 1,                       //初始化加载第一页，默认第一页
				pageSize: 10,							//每页的记录行数（*）
				//	showRefresh: true,                   //刷新按钮
				//	buttonsAlign： "left",                //按钮对齐方式
				//	toolbar： "#toolbar",                 //指定工具栏
				//	toolbarAlign: "right",
				columns: [{
					field: 'Release',
					title: 'Release',
					valign:"middle",
					align:"center",
				}, {
					field: 'SoC',
					title: 'SoC',
					valign:"middle",
					align:"center",

				}, {
					field: 'Platform',
                    title: 'Platform',
					valign:"middle",
					align:"center",


                }, {
					field: 'Release Date',
                    title: 'Release Date',
					valign:"middle",
					align:"center",


                }, {
					field: 'Standard Bench',
                    title: 'Standard Bench',
					valign:"middle",
					align:"center",
                }, {
					field: 'APP Bench',
                    title: 'APP Bench',
					valign:"middle",
					align:"center",
                }],

                });
        },
        error: function(){
            console.log('false')
        }
     });
}
