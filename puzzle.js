/**
 * @Method 简单拼图方法
 * @param
 * * args args.puzzleDom 大容器对象（必传）
 * args.settings.randomArray 随机数,由服务端提供，没有就自己生成一组随机数（用于测试）
 * args.settings.puzzleType 拼图类型
 * *  3*3->3
 * *  4*4->4
 * *  6*6->6
 * args.settings.开始按钮
 * args.puzzleTime 限制时间
 * 注意：
 *     如果传入的回调函数想调用原来的作用域，请bind();
 *     eg：new game.myPuzzle({
            puzzleDom:document.getElementById('picbox'),
            settings:{
                startbtn:document.getElementById('go'),
                puzzleType:3,
                puzzleTime:0,
                successCallback:self.egg.bind(self)
            }
        });

 */
if(!window.game){
    window.game = {};
}
game.myPuzzle = function(args){
    /*调用的时候没有初始化的话就初始化一次*/
    if(!(this instanceof arguments.callee)){
        return new arguments.callee(args);
    }
    this.init(args);
};
game.myPuzzle.prototype={
    constructor:game.myPuzzle,
    hasTouch:'ontouchstart' in window ? true : false,
    init:function(args){
        /*局部变量来接受当前的this*/
        var that = this;
        /*禁止拼的参数*/
        this.complete = false;
        /*如果传入的对象是一个Dom对象就把他看作是我们的大容器盒子*/
        if(args.puzzleDom && typeof args.puzzleDom == 'object'){
            this.parentDom = args.puzzleDom;
        }
        /*如果不存在父容器就停止初始化*/
        if(!this.parentDom)return false;
        /*父容器css：相对定位，overflow：hidden，zindex:100*/
        this.parentDom.style.position = 'relative';
        this.parentDom.style.overflow = 'hidden';
        this.parentDom.style.zIndex = '102';
        /*初始化传入的参数*/
        this.settings = {};
        /*默认类型  默认的拼图类型，如果没设置就是3*3*/
        this.settings.puzzleType = args.settings.puzzleType?args.settings.puzzleType:3;
        /*开始按钮*/
        if(args.settings.startbtn && typeof args.settings.startbtn == 'object'){
            this.settings.startbtn = args.settings.startbtn?args.settings.startbtn:null;
        }
        /*默认的限制时间*/
        this.settings.puzzleTime = args.settings.puzzleTime>=0&&args.settings.puzzleTime?args.settings.puzzleTime:0;
        /*传入随机数,没传就自己生成一个吧（randomTest方法）*/
        if(args.settings.randomArray && typeof args.settings.randomArray == 'object'){
            this.settings.randomArray = args.settings.randomArray;
        }else{
            this.settings.randomArray = this.randomTest();
            console.log(this.settings.randomArray);
        }
        //判断拼图类型和随机数长度是否匹配
        if(Math.pow(this.settings.puzzleType,2) != this.settings.randomArray.length){
            return false;
        }else{
            //this.random(this.settings.randomArray);
        }
        /*成功之后的回调函数*/
        this.settings.successCallback = args.settings.successCallback&&typeof(args.settings.successCallback)=='function'?args.settings.successCallback:null;
        this._puzzle();
        },
    _puzzle:function(){
        /*局部变量来接受当前的this*/
        var that = this,
        /*滑动的类型*/
            type = this.settings.puzzleType == 3?3:this.settings.puzzleType,
        /*父容器的高度和宽度*/
            parentHeight = this.parentHeight = this.parentDom.clientHeight,
            parentWidth = this.parentWidth =  this.parentDom.clientWidth,
        /*子容器的高度和宽度*/
            partHeight = this.partHeight = Math.ceil(this.parentDom.clientHeight/type),
            partWidth = this.partWidth = Math.ceil(this.parentDom.clientWidth/type);
        var html = "", arr = this.settings.randomArray, length = Math.pow(parseInt(type),2);
        for(var i = 0 ; i < length ; i++){
                html += '<div class="part" data-index="' + arr[i]
                        + '" data-curposition="'+ i +'" style="width:'+partWidth
                        +'px;height:'+partHeight+'px;background-size:'+parentWidth+'px '+parentHeight+'px;background-position:'
                        +(-partWidth*parseInt(arr[i] %type))+'px '
                        + partHeight*parseInt(-(arr[i] /type)).toFixed(0) + 'px;left:'
                        + partWidth*parseInt((i%type)) + 'px;top:'
                        + partHeight*parseInt((i/type)).toFixed(0) + 'px;"></div>';
        }
        this.parentDom.innerHTML=html;
        this.part = this.parentDom.children;
        this.bindEvents();
    },
    randomTest:function(){
        var randomPart = new Array();
        //生成顺序数
        for(var i = 0 , length = Math.pow(parseInt(this.settings.puzzleType),2) ; i < length ; i++ ){  //随机打乱
            randomPart.push(i);
        }
        // 数组随机排列
        return  function(paramsArray){
                    // 对顺序数组洗牌
                    for (var i = paramsArray.length-1; i >=0; i--) {
                        var randomIndex = Math.floor(Math.random()*(i+1)),
                        _itemAtIndex = paramsArray[randomIndex];
                        paramsArray[randomIndex] = paramsArray[i];
                        paramsArray[i] = _itemAtIndex;
                    }
                    return paramsArray;
                }(randomPart);
    },
    bindEvents:function(){
        var that = this;
        var dx,dy,newLeft,newtop,startTime,endTime;
        var preventScroll = function(e) {
            e.preventDefault();
            return false;
        };

        // 如果有开始按钮，为开始按钮绑定事件
        if(this.settings.startbtn){
            this.settings.startbtn.addEventListener(that.hasTouch ? 'touchstart' : 'mousedown',function(){
                startTime = Date.parse(new Date());  //获取到期1970年1月1日到当前时间的毫秒数，这个方法不常见，这里为试用
                that.parentDom.style.background = 'none';
                for(var i = 0 , len = that.part.length; i < len; i++){
                    that.part[i].style.display="block";
                }
            });
            // 开始按钮功能以后再扩展开始功能吧。懒得写了
        }
        this.parentDom.addEventListener(that.hasTouch ? 'touchstart' : 'onMouseOver',function(event){
            window.addEventListener(that.hasTouch ? 'touchstart' : 'onMouseOver', preventScroll );//禁止页面滚动
            if(that.complete) return false;
            if(event.target == that.parentDom) return false;
            event.target.style.zIndex = 100;                          //设置拖拽元素的z-index值，使其在最上面。
            dx = event.touches[0].pageX;    //记录触发拖拽的水平状态发生改变时的位置
            dy = event.touches[0].pageY;     //记录触发拖拽的垂直状态发生改变时的位置
            event.target.startX = event.target.offsetLeft;                    //记录当前初始状态水平发生改变时的位置
            event.target.startY = event.target.offsetTop;
            //offsetTop等取得的值与event.target.style.left获取的值区别在于前者不带px,后者带px
            event.target.style.opacity = '0.6';
            event.target.style.transition=event.target.style.webkitTransition='none';
        });
        this.parentDom.addEventListener(that.hasTouch ? 'touchmove': 'onMouseMove',function(event){
            if(that.complete) return false;
            if(event.target == that.parentDom) return false;
            newLeft = event.touches[0].pageX - dx;   //记录拖拽的水平状态发生改变时的偏移量
            newtop = event.touches[0].pageY - dy;   //记录拖拽的竖直状态发生改变时的偏移量
            if(newLeft <= -event.target.startX){               //限制边界代码块，拖拽区域不能超出边界的一半
               newLeft = -event.target.startX;
            }else if(newLeft >= (that.parentWidth - event.target.startX - that.partWidth)){
                newLeft=(that.parentWidth - event.target.startX - that.partWidth);
            }
            if(newtop <= -event.target.startY){
               newtop = -event.target.startY;
            }else if(newtop >= (that.parentHeight - that.partHeight - event.target.startY)){
                newtop = (that.parentHeight - that.partHeight - event.target.startY);
            }
            event.target.style.transform = event.target.webkitTransform = 'translate3d('+newLeft+'px,'+newtop+'px,0px)';

        });
        this.parentDom.addEventListener(that.hasTouch ? 'touchend':'onMouseOut',function(e){
            if(that.complete) return false;
            if(event.target == that.parentDom) return false;
            event.target.style.opacity = '1';
            event.target.style.zIndex = 1;
            event.target.endX = event.changedTouches[0].pageX - dx;
            event.target.endY = event.changedTouches[0].pageY - dy;    //记录滑动结束时的位置，与进入元素对比，判断与谁交换

            var obj = that.change(event.target,event.target.endX,event.target.endY);  //调用交换函数
              //添加css3动画效果
            obj.style.transition = obj.style.webkitTransition = 'all 0.5s ease 0s';   //添加css3动画效果
            if(obj == event.target){  //如果交换函数返回的是自己
                event.target.style.transform = event.target.webkitTransform = 'translate3d(0px,0px,0px)';
            }else{
                var objLeft = parseInt(obj.style.left),
                    objTop = parseInt(obj.style.top),
                    targetLeft = event.target.offsetLeft,
                    targetTop = event.target.offsetTop;
                    obj.style.left = event.target.style.left;
                obj.style.top = event.target.style.top;
                event.target.style.left = objLeft + 'px';
                event.target.style.top = objTop + 'px';
                obj.style.transform = obj.style.webkitTransform = 'translate3d(0px,0px,0px)';
                event.target.style.transform = event.target.style.webkitTransform = 'translate3d(0px,0px,0px)';
                var _index = obj.getAttribute('data-curposition');
                obj.setAttribute('data-curposition',event.target.getAttribute('data-curposition'));
                event.target.setAttribute('data-curposition',_index);
                if(that.isSuccess()){
                    if(that.settings.successCallback){
                        window.removeEventListener(that.hasTouch ? 'touchstart' : 'onMouseOver', preventScroll );//禁止页面滚动
                        that.settings.successCallback()
                    };
                }

            }
        });
    },
    change:function(obj){
        var getTranslate3d = function(ele,coordinate){
            var tarobj = ele.style.transform ||  ele.style.webkitTransform;
            switch(coordinate.toLowerCase()){
                case'x':
                    return parseFloat(tarobj.match(/\-?[0-9]+\.?[0-9]*/g)[1]);
                    break;
                case'y':
                    return parseFloat(tarobj.match(/\-?[0-9]+\.?[0-9]*/g)[2]);
                    break;
                case'z':
                    return parseFloat(tarobj.match(/\-?[0-9]+\.?[0-9]*/g)[3]);
                    break;
                default:
                    alert('传xyz');
            }
        };
        //交换函数，判断拖动元素的位置是不是进入到目标原始1/2，这里采用绝对值得方式
        var x = obj.offsetLeft + getTranslate3d(obj,'x'),y = obj.offsetTop + getTranslate3d(obj,'y');
        for(var i=0;i<this.part.length;i++){ //还必须判断是不是当前原素本身。将自己排除在外
            if(Math.abs(this.part[i].offsetLeft-x)<=this.partWidth/2&&Math.abs(this.part[i].offsetTop-y)<=this.partHeight/2&&this.part[i]!=obj)
                return this.part[i];
        }
        return obj;   //返回当前
    },
    isSuccess:function(){  //判断成功标准
        var oriPosition='';
        for(var i = 0 ; i < this.part.length ; i++){
            oriPosition += this.part[i].getAttribute('data-curposition');
        }
        if(this.settings.randomArray.toString().replace(/,/g, "") == oriPosition){
            this.complete = true;
            return true;
        }
        return false;
    }


};
