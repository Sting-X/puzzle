if(!window.game){
    window.game = {};
}
game.lianliankan = function(args){
    if(!(this instanceof arguments.callee)){
        return  new arguments.callee(args);
    }
    this.init(args);
};
game.lianliankan.prototype =  {
    constructor:game.lianliankan,
    hasTouch:'ontouchstart' in window ? true : false,
    init:function(args){
        var that = this;
        /*禁止拼的参数*/
        this.complete = false;
        /*如果传入的对象是一个Dom对象就把他看作是我们的大容器盒子*/
        if(args.Dom && typeof args.Dom == 'object'){
            this.parentDom = args.Dom;
        }
        /*如果不存在父容器就停止初始化*/
        if(!this.parentDom)return false;
        /*父容器css：相对定位，overflow：hidden，zindex:100*/
        this.parentDom.style.position = 'relative';
        this.parentDom.style.overflow = 'hidden';
        /*初始化传入的参数*/
        this.settings = {};
        /*默认类型  默认的拼图类型，如果没设置就是6*6（请输入偶数）*/
        this.settings.Type = args.settings.Type?args.settings.Type:6;
        /*防止输入奇数，还是验证一下吧*/
        this.settings.Type = (this.settings.Type%2==0)?this.settings.Type:this.settings.Type-1;
        /*开始按钮*/
        if(args.settings.startbtn && typeof args.settings.startbtn == 'object'){
            this.settings.startbtn = args.settings.startbtn?args.settings.startbtn:null;
        }
        /*剩余时间显示元素*/
        if(args.settings.remainTimeDom && typeof args.settings.remainTimeDom == 'object'){
            this.settings.remainTimeDom = args.settings.remainTimeDom?args.settings.remainTimeDom:null;
        }
        /*默认的限制时间*/
        this.settings.Time = args.settings.Time>=0&&args.settings.Time?args.settings.Time:0;
        /*传入随机数,没传就自己生成一个吧（generateSeries方法）*/
        if(args.settings.randomArray && typeof args.settings.randomArray == 'object'){
            this.settings.randomArray = args.settings.randomArray;
        }else{
            this.settings.randomArray = this.generateSeries();
            /*hack 以后请删掉*/ 
            for(var s = 0,slen = this.settings.randomArray.length; s<slen ; s++){
                this.settings.randomArray[s] = this.settings.randomArray[s] == 'part5'?'part1':this.settings.randomArray[s];
            }
            /*hack*/ 
            console.log(this.settings.randomArray);
        }
        //判断拼图类型和随机数长度是否匹配
        if(Math.pow(this.settings.Type,2) != this.settings.randomArray.length){
            alert("初始化失败！");
            return false;
        }else{
            //this.random(this.settings.randomArray);
        }
        /*游戏成功之后的回调函数*/
        this.settings.successCallback = args.settings.successCallback&&typeof(args.settings.successCallback)=='function'?args.settings.successCallback:null;
        /*游戏失败之后的回调函数*/
        this.settings.failCallback = args.settings.failCallback&&typeof(args.settings.failCallback)=='function'?args.settings.failCallback:null;
        /*一些必要的参数*/
        this.data = {};
        this.started = false;
        this.disappear = 0;
        this.path=[];
        this.createDom();
    },
    createDom:function(){
        var that = this,
            type = this.settings.Type,
        /*父容器的高度和宽度*/
            parentHeight = this.parentHeight = this.parentDom.clientHeight,
            parentWidth = this.parentWidth =  this.parentDom.clientWidth,
        /*子容器的高度和宽度*/
            partHeight = this.partHeight = Math.ceil(this.parentDom.clientHeight/type),
            partWidth = this.partWidth = Math.ceil(this.parentDom.clientWidth/type);
        var html = "", length = Math.pow(parseInt(type),2);
        for(var i = 0 ; i < length ; i++){
            html += '<button type="button" data-point={"x":'+ parseInt((i/type)).toFixed(0) +',"y":'+ i%type +'} style="width:'+partWidth
                    +'px;height:'+partHeight+'px;left:'
                    + partWidth*parseInt((i%type)) + 'px;top:'
                    + partHeight*parseInt((i/type)).toFixed(0) + 'px;" class="lianlian-btn"><div class="lianlian-btn-holder" style="width:'+partWidth
                    +'px;height:'+partHeight+'px;background-size:'+parentWidth+'px '+partHeight+'px;"></div></button>';
        }
        this.parentDom.innerHTML=html;
        this.part = this.parentDom.children;
        this.refresh();
        this.bindEvents();
    },
    refresh:function(){
        var that = this,
            h = [],
            v = [],
            clsName = "",
            clsEle = null;
        for (var k = 0, l = this.settings.randomArray.length; k < l; k++) {
            that.part[k].className += " " + this.settings.randomArray[k];
        }
        for(var i = 0;i<this.settings.Type;i++){
            var pointV = new Array(),pointH = new Array();
            for(var j = 0;j < this.settings.Type; j++){
                pointV.push(1);
                pointH.push(1);
            }
            h.push(pointV);
            v.push(pointH);
            // 自己定义样式的话就把下面注释了吧
            clsName = 'part'+i;
            clsEle = document.getElementsByClassName(clsName);
            for(var m = 0,len = clsEle.length; m < len ; m++){
                clsEle[m].children[0].style.backgroundPosition ="-"+ this.partWidth*i+'px'+' 0px';
            }
        }
        this.data = {
            h:h,
            v:v
        };
    },
    bindEvents:function(){
        var that = this,
            type = this.settings.Type,
            preventScroll = function(e) {
                e.preventDefault();
                return false;
            };

        this.parentDom.addEventListener(that.hasTouch ? 'touchstart' : 'click', function (event) {
            if(event.target == that.parentDom) return false;
            var style = event.target.style,
                self = this,
                hasSelected = document.getElementsByClassName('selected');
            window.addEventListener(that.hasTouch ? 'touchstart' : 'onMouseOver', preventScroll );//禁止页面滚动
            if (!that.started) {
                that.start();
                that.started = true;
            }
            if (hasClass(event.target,'selected')) {
                removeClass(event.target,'selected');
                return false;
            }
            if (hasClass(event.target,'disappear')) {
                return false;
            }

            addClass(event.target,'selected');
            if (hasSelected.length > 1) {
                if (hasSelected[0].parentElement.className !== hasSelected[1].parentElement.className) {
                    for(var j = 0,Len = hasSelected.length;j<Len; j++){
                        removeClass(hasSelected[0],'selected');
                    }
                    return false;
                }
                if(hasSelected[0] == event.target){
                    var start_point = JSON.parse(event.target.parentElement.getAttribute('data-point')),
                        end_point = JSON.parse(hasSelected[1].parentElement.getAttribute('data-point')),
                        reachable_points = [];
                }else{
                    var start_point = JSON.parse(hasSelected[0].parentElement.getAttribute('data-point')),
                        end_point = JSON.parse(event.target.parentElement.getAttribute('data-point')),
                        reachable_points = [];
                }
                var ret = getReachablePoints(hasSelected[0].parentElement, hasSelected[1].parentElement, reachable_points);
                if (ret) {
                    for(var i = 0; i<2; i++){
                        addClass(hasSelected[0],'disappear');
                        removeClass(hasSelected[0],'selected');
                    }
                    that.disappear += 2;
                    that.data.h[start_point.y][start_point.x] = 0;
                    that.data.v[start_point.x][start_point.y] = 0;
                    that.data.h[end_point.y][end_point.x] = 0;
                    that.data.v[end_point.x][end_point.y] = 0;

                    // if (document.getElementsByClassName('disappear').length === width * width) {
                    //     self.finish();
                    // }
                    if (that.hasDisappear === Math.pow(type,2)) {
                        that.finish();
                    }
                    that.path.push(start_point.x + ',' + start_point.y + ' ' + end_point.x + ',' + end_point.y);
                }
                else {
                    for(var i = 0; i<hasSelected.length; i++){
                        removeClass(hasSelected[0],'selected');
                    }
                }
            }
           if(that.disappear == Math.pow(type,2)){
                if(that.finish()){
                    console.log("finished");
                    that.settings.successCallback?that.settings.successCallback():"";
                 }else{
                    console.log("error");
                    that.settings.failCallback?that.settings.failCallback():"";
                }
           }
        });
        this.parentDom.addEventListener(that.hasTouch ? 'touchend' : 'onMouseLeave', function (event) {
            window.removeEventListener(that.hasTouch ? 'touchstart' : 'onMouseOver', preventScroll );//禁止页面滚动
        })
        function getReachablePoints(startEle, endEle, reachable_points) {
            if(startEle == endEle) return false;
            if (!reachable_points) {
                reachable_points = [];
            }
            var start_point = JSON.parse(startEle.getAttribute('data-point')),
                end_point = JSON.parse(endEle.getAttribute('data-point'));
            //先看看是否是直线相连
            if (start_point.x === end_point.x) {
                if (verticalLine(start_point, end_point)) {
                    reachable_points.push('h');
                    return true;
                }
            }
            else if (start_point.y === end_point.y) {
                if (horizontalLine(start_point, end_point)) {
                    reachable_points.push('v');
                    return true;
                }
            }
                //二条线
            else {
                var ret = twoLine(start_point, end_point, reachable_points);
                if (ret) {
                    return ret;
                }
            }
            //三条线
            return threeLine(start_point, end_point, reachable_points);
        }

        function horizontalLine(start_point, end_point) {
            var h_data = that.data.h[start_point.y], num = 0;
            for (var i = Math.min(end_point.x, start_point.x) + 1; i < Math.max(end_point.x, start_point.x) ; i++) {
                num += h_data[i];
            }
            return num === 0;
        }

        function verticalLine(start_point, end_point) {
            var v_data = that.data.v[start_point.x], num = 0;
            for (var i = Math.min(end_point.y, start_point.y) + 1; i < Math.max(end_point.y, start_point.y) ; i++) {
                num += v_data[i];
            }
            return num === 0;
        }

        function twoLine(start_point, end_point, reachable_points) {
            var key_point1 = { x: start_point.x, y: end_point.y }, key_point2 = { x: end_point.x, y: start_point.y };
            if (that.data.h[key_point1.y][key_point1.x] === 0 && verticalLine(start_point, key_point1) && horizontalLine(end_point, key_point1)) {
                reachable_points.push(key_point1);
                return true;
            }
            else if (that.data.h[key_point2.y][key_point2.x] === 0 && verticalLine(end_point, key_point2) && horizontalLine(start_point, key_point2)) {
                reachable_points.push(key_point2);
                return true;
            }
            return false;
        }

        function threeLine(start_point, end_point, reachable_points) {
            var points = getOneLinePoints(start_point);
            for (var i = 0, l = points.length; i < l; i++) {
                var ret = twoLine(points[i], end_point, reachable_points);
                if (ret) {
                    //reachable_points.push(points[i]);
                    return ret;
                }
            }
            return false;
        }

        function getOneLinePoints(point, direction, ret) {
            var ret = ret || [], v_data = that.data.v, h_data = that.data.h, num = 0;
            //左
            if (!direction || direction === 'x-') {
                if (point.x > 0 && v_data[point.x - 1][point.y] === 0) {
                    ret.push({ x: point.x - 1, y: point.y });
                    getOneLinePoints({ x: point.x - 1, y: point.y }, 'x-', ret);
                }
            }
            //右
            if (!direction || direction === 'x+') {
                if (point.x < type - 1 && v_data[point.x + 1][point.y] === 0) {
                    ret.push({ x: point.x + 1, y: point.y });
                    getOneLinePoints({ x: point.x + 1, y: point.y }, 'x+', ret);
                }
            }
            //上
            if (!direction || direction === 'y+') {
                if (point.y > 0 && v_data[point.x][point.y - 1] === 0) {
                    ret.push({ x: point.x, y: point.y - 1 });
                    getOneLinePoints({ x: point.x, y: point.y - 1 }, 'y+', ret);
                }
            }
            //下
            if (!direction || direction === 'y-') {
                if (point.y < type - 1 && v_data[point.x][point.y + 1] === 0) {
                    ret.push({ x: point.x, y: point.y + 1 });
                    getOneLinePoints({ x: point.x, y: point.y + 1 }, 'y-', ret);
                }
            }
            return ret;
        }
        function hasClass(obj, cls) {
            return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
        }
        function addClass(obj, cls) {
            if (!hasClass(obj, cls)) obj.className += " " + cls;
        }
        function removeClass(obj, cls) {
            if (hasClass(obj, cls)) {
                var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
                obj.className = obj.className.replace(reg, ' ');
            }
        }
    },
    start:function () {
        if(this.settings.Time&&this.settings.remainTimeDom){
            var that = this, time = 60,type = this.settings.Type;
            that.intervalId = window.setInterval(function () {
                time--;
                that.remainTimeDom.innerText = time;
                if (time <= 0) {
                    window.clearInterval(self.intervalId);
                   if(this.disappear == Math.pow(type,2)){
                        if(this.finish()){
                            console.log("finished");
                            that.settings.successCallback?that.settings.successCallback():"";
                         }else{
                            console.log("errpr");
                            that.settings.failCallback?that.settings.failCallback():"";
                        }
                   }
                }
            }, 1000);
        }
    },
    finish:function(){
        return this.checkValid(this.path.join(";"));
    },
    // 生成随机排列，防锁死验证
    generateSeries:function(){
        var that = this,
            type = this.settings.Type,
            // classList = ['chicken', 'chips', 'cake', 'pizza', 'roll', 'chocolate'],
            classList = [],
            num_map = [],
            series = [];
        for(var m = 0; m < type; m++){
            num_map.push(0);
            classList.push("part"+m);
        }
        //第一排随机生成无所谓
        for (var n = 0; n < type + 1; n++) {
            var ran = Math.round(Math.random()*(type - 1)),
                y = parseInt((n/type)).toFixed(0),
                x = n - y * type;
                num_map[ran]++;
            series.push(classList[ran]);
        }
        //从第二排开始控制不能出来死锁图案, 如下图案
        // ■ ★
        // ★ ■
        for(;n<Math.pow(type,2);n++){
            ran = Math.round(Math.random()*(type - 1));
            y = parseInt((n/type)).toFixed(0);
            x = n - y * type;
            // 记录图案生成了几次
            if (num_map[ran] < 6) {
                //num_map[ran]++;
            }else{
                for(var k = 0; k < type; k++){
                    if(num_map[k]<6){
                        ran = k;
                        break;
                    }
                }
            }
            //如果与左上角连线一样, 前一个与右上角连线一样，换一个图案
            if(series[n - type - 1] === classList[ran] && series[n - type] === series[n - 1]){
                temp = ran;
                desc = Math.random() > 0;
                ran = -1;
                for(var j = desc ? type - 1:0 ; desc ? (j >= 0):(j < count) ; (desc ? j-- : j++)){
                    if(temp !== j && num_map[j] <6){
                        ran = j;
                        break;
                    }
                }
            }
            //如果库存中只剩余一种图案，当前图案跟前一个交换
            if(ran === -1){
                num_map[temp]++;
                series.push(series[n-1]);
                series[n-1] = classList[temp];
            }else{
                num_map[ran]++;
                series.push(classList[ran]);
            }
        }
        this.series = series;
        return series;
    },
    //验证前端发来的连连看路径是否是真实的
    checkValid:function(path){
        var type = this.type,
            points = path.split(";"),
            series = this.series;
        if(points.length < Math.pow(type,2)/ 2) {
            alert( '您的游戏数据存在异常，不能进行抽奖');
            return false;
        }
        // if(time > 60) {
        //     alert('您没有在60秒内完成游戏，不能进行抽奖');
        //     return false;
        // }
        if(series.length == Math.pow(type,2)) {
            for(var i = 0; i < points.length; i++) {
                point = points[i].split(" ");
                start_point = point[0].split(",");
                end_point = point[1].split(",");
                start_x = start_point[0];
                start_y = start_point[1];
                end_x = end_point[0];
                end_y = end_point[1];
                if(series[start_y * type + $start_x] !== series[end_y * type + end_x]) {
                    alert('您的游戏数据存在异常，不能进行抽奖');
                    return false;
                }
            }
        }
        return true;
    }
};