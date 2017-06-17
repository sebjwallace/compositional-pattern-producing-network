
var net = new ng.network.cppn(4,3)

var stage = document.getElementById('stage')
var stageBounds = stage.getBoundingClientRect()
var index = {}

var mouseOnNode = null
var mouseOffNode = null

document.body.onkeypress = function(){
    net.insertNode()
    render()
}

function render(){

    stage.innerHTML = ''

    function createEl(node,x,y){
        var obj = index[node.key] || {}
        x = obj.x || x
        y = obj.y || y
        var el = document.createElementNS('http://www.w3.org/2000/svg','rect')
        stage.appendChild(el)
        el.setAttribute('x',x)
        el.setAttribute('y',y)
        el.setAttribute('height',10)
        el.setAttribute('width',10)
        el.setAttribute('fill','grey')
        el.setAttribute('rx','5')
        el.setAttribute('ry','5')
        var line = document.createElementNS('http://www.w3.org/2000/svg','line')
        line.setAttribute('style','stroke:rgba(0,0,0,0.4);stroke-width:1')
        stage.appendChild(line)
        el.onmousedown = function(e){
            if(e.altKey){
                net.removeNode(node)
                render()
                return
            }
            mouseOnNode = node
            line.setAttribute('x1',index[node.key].x+5)
            line.setAttribute('y1',index[node.key].y+5)
            document.body.onmousemove = function(e){
                var x = e.clientX - stageBounds.left
                var y = e.clientY - stageBounds.top
                if(e.ctrlKey){
                    el.setAttribute('x',x - 5)
                    el.setAttribute('y',y - 5)
                    index[node.key].x = x - 5
                    index[node.key].y = y - 5
                }
                else{
                    line.setAttribute('x2',x)
                    line.setAttribute('y2',y)
                }
            }
            document.body.onmouseup = function(e){
                line.setAttribute('x2',x+5)
                line.setAttribute('y2',y+5)
                document.body.onmousemove = null
                document.body.onmouseup = null
                if(!e.ctrlKey)
                    net.insertEdgeBetween(mouseOnNode,mouseOffNode)
                render()
            }
        }
        el.onmouseenter = function(){
            mouseOffNode = node
        }
        var text = document.createElementNS('http://www.w3.org/2000/svg','text')
        text.textContent = node.constructor.name
        text.setAttribute('x',x)
        text.setAttribute('y',y)
        text.setAttribute('font-size','10px')
        stage.appendChild(text)
        index[node.key] = {
            el: el,
            node: node,
            x: x,
            y: y
        }
        return el
    }

    for(var i in net.inputs){
        var containerWidth = stage.getAttribute('width')
        var spacingX = containerWidth / net.inputs.length
        var node = net.inputs[i]
        createEl(node,spacingX*i,0)
    }

    for(var i in net.hidden){
        var containerWidth = stage.getAttribute('width')
        var containerHeight = stage.getAttribute('width')
        var spacingX = containerWidth / net.hidden.length
        var node = net.hidden[i]
        var y = (index[node.key] || {}).y || (containerHeight / 2) + ng.math.randomInt(-50,50)
        createEl(node,spacingX*i,y)
    }

    for(var i in net.outputs){
        var containerWidth = stage.getAttribute('width')
        var containerHeight = stage.getAttribute('height')
        var spacingX = containerWidth / net.outputs.length
        var node = net.outputs[i]
        var el = createEl(node,spacingX*i,containerHeight-10)
    }

    for(var i in index){
        var obj = index[i]
        for(var n in obj.node.inputs){
            var inputIndex = obj.node.inputs[n].key
            var inputObj = index[inputIndex]
            var line = document.createElementNS('http://www.w3.org/2000/svg','line')
            line.setAttribute('x1',inputObj.x + 5)
            line.setAttribute('y1',inputObj.y + 5)
            line.setAttribute('x2',obj.x + 5)
            line.setAttribute('y2',obj.y + 5)
            line.setAttribute('style','stroke:rgba(0,0,0,0.4);stroke-width:2')
            line.__input = obj.node.inputs[n]
            line.__node = obj.node
            line.onclick = function(){
                net.removeEdgeBetween(this.__input,this.__node)
                render()
            }
            stage.appendChild(line)
        }
    }

    var canvas = document.getElementById('canvas')
    var ctx = canvas.getContext('2d')
    ctx.clearRect(0,0,500,500)

    for(var y = 0; y < 200; y++){
        for(var x = 0; x < 200; x++){
            var center = 100
            var dx = Math.abs(center - x)
            var dy = Math.abs(center - y)
            var dist = Math.sqrt(dx*dx + dy*dy)
            var output = net.feedforward([x/10,y/10,dist/100,10])
            var r = parseInt(255 * (output[0] || 0))
            var g = parseInt(255 * (output[1] || 0))
            var b = parseInt(255 * (output[2] || 0))
            ctx.fillStyle = 'rgb('+r+','+g+','+b+')'
            ctx.fillRect(x,y,1,1)
        }
    }

}

render()
