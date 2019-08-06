function convertCanvasToImage(obj){
    //snap_background()
    var download_type = $(obj).html()
    var form_data = new FormData();
    var count = -1
    var snapshots_id = ['summary', 'chart', 'soc', 'hardware', 'software', 'system-setting']
    form_data.append('snapshots', snapshots_id.join(','));
    form_data.append('source', 'standard');
    form_data.append('filetype', download_type)

    for(var i=0; i<snapshots_id.length;i++){
        var item = snapshots_id[i]
        if($("#" + item).parent().parent().attr('display')=='none'){

        }else {
            html2canvas($("#" + item)[0], {scale:2,logging:false,useCORS:true,async:false}).then(function (canvas) {
                var dataUrl = canvas.toDataURL('image/jpeg')
                f(dataUrl)
            })
        }
    }

    function f(pic) {
        count += 1
        form_data.append(snapshots_id[count%snapshots_id.length], pic)

        if(count%snapshots_id.length == snapshots_id.length-1){
            $.ajax({
               url: '/snapshots/',
               type: 'POST',
               data:  form_data,
               processData: false,
               contentType: false,
               success: function(callback){
                   //retr_background()
                   var link = eval(callback)['link']
                   var url = '/file_download/' + link
                   downloadURI(url, link)
               }
            });
        }
    }
}

function snap_background() {
    $('table').each(function(){
        $(this).find('tr:even').css("background-color","transparent")
        $(this).find('tr:odd').css("background-color","transparent");
    });
    $('table tr').each(function(){
        $(this).children('td').each(function () {
            $(this).css("background-color","transparent")
        })
    });
}


function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    console.log(link.href)
    link.click();
}


function retr_background() {
    $('table').each(function(){
        $(this).find('tr:even').css("background","#ccc");
        $(this).find('tr:odd').css("background","#eee");
        $(this).children().children().eq(0).css("background","lightgreen");
    });
}