function convertCanvasToSummaryImage(obj){
    var query_release = $('.my_summary').serialize()
    if(query_release == ''){
        return alert('Bad Option Release!')
    }
    var checked = query_release.split('&')
    if(checked.length > 1){
        return alert('Choosed Options are over 1!')
    }
    console.log(checked)
    var hsrp_shadow = checked[0].split('=')
    var hsrp = hsrp_shadow[1]

    var download_type = $(obj).html()
    var form_data = new FormData();
    var count = -1
    var snapshots_id = ['summary', 'soc', 'hardware', 'software', 'tune']
    form_data.append('snapshots', snapshots_id.join(','));
    form_data.append('source', 'summary');
    form_data.append('filetype', download_type)
    form_data.append('hsrp', hsrp)

    for(var i=0; i<snapshots_id.length;i++){
        var item = snapshots_id[i]
        html2canvas($("#" + item)[0], {scale:2,logging:false,useCORS:true,async:false}).then(function (canvas) {
            var dataUrl = canvas.toDataURL('image/jpeg')
            f(dataUrl)
        })
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
                   var link = eval(callback)['link']
                   var url = '/file_download/' + link
                   downloadURI(url, link)
               }
            });
        }
    }
}


function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    console.log(link.href)
    link.click();
}
