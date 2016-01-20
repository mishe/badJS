 (function(global) {
        var oldErrFn = global.onerror,
                list=[],
                timeout,
                imgs=document.images,
                imgLen=imgs.length,
                cfg={
                    url:'',
                    delay:1000
                };

        for(var i=0;i<imgLen;i++){
            (function(img){
                if(img.complete){
                    if(img.fileSize==0 || img.width==0 && img.height==0){
                        addNewError({
                            msg:location.href+',图片加载失败',
                            target:img.src,
                            rowNum:0,
                            colNum:0
                        });
                    }
                }
                img.onerror=function(){
                    addNewError({
                        msg:location.href+',图片加载失败',
                        target:img.src,
                        rowNum:0,
                        colNum:0
                    });
                }
            }(imgs[i]));
        }

        global.onerror = function(msg, url, line, col,error) {
            msg=(error && error.stack)||msg;
            addNewError({
                msg: msg,
                target: url||'',
                rowNum: line||1,
                colNum: col||1
            });
            oldErrFn && oldErrFn.apply(global,arguments);
            return true;
        };


        function addNewError(msg) { // 将错误推到缓存池
            list.push(JSON.stringify(msg));
            clearTimeout(timeout);
            timeout=setTimeout(function(){
                sendError();
            },cfg.delay);
        }

        function charLen(string) {
            if (!string) return 0;
            return string.replace(/[^\x00-\xff]/g, '00').length;
        }

        function init(opts){
            for (var key in opts) {
                cfg[key] = opts[key];
            }
            //todo 取出本地发送失败的，继续发送
//                reSendInfo();
        }

        function sendError(){
            var img=new Image(),
                count= 0,
                infos='',
                infosLen=0,
                info,
                infoLen;
            while(list.length){
                info=list.shift();
                infoLen=parseInt(charLen(info),10);
                //分段处理
                if(infosLen+infoLen>2000){
                    list.unshift(info);
                    setTimeout(sendError,0);
                    break;
                }else{
                    infos+=info;
                    infosLen+=infoLen;
                    count++;
                }
            }
            img.src=cfg.url+'infos='+infos+'&count='+count+'&_t='+(+new Date);
            img.onerror=function(){
                //todo 存入本地，下次继续发送
            }
        }

        return global.jsm={
            init:init,
            send:addNewError
        }

    }(this));
