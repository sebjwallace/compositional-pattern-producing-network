
var ng = {}

ng.math = {

    randomInt(min,max){
        return Math.floor(Math.random() * (max-min)) + min
    },

    probable(prob){
        return Math.random() < prob
    }

}

ng.util = {

    sumNodes(nodes){
        var sum = 0
        for(var i = 0; i < nodes.length; i++)
            sum += nodes[i].compute()
        return sum
    },

    createClosure(v){
        return function(){
            return v
        }
    }

}

class NgNode {

    constructor(inputs,callback){
        this.inputs = []
        this.key = Math.random() * 10
        this.__value = null
        this.observers = []
        this.dependencies = {}
        this.passed = false
        this.attributes = {}
        this.callback = callback || function(){}

        this.registerInputs(inputs)
    }

    registerInputs(inputs){
        for(var i in inputs){
            if(this.dependencies[inputs[i].key] != null)
                continue
            inputs[i].observe(this)
            this.dependencies[inputs[i].key] = false
            this.inputs.push(inputs[i])
        }
        return this
    }

    unregisterInputs(inputs){
        for(var i in inputs){
            inputs[i].ignore(this)
            delete this.dependencies[inputs[i].key]
            for(var n in this.inputs)
                if(this.inputs[n].key == inputs[i].key)
                    this.inputs.splice(n,1)
        }
        return this
    }

    observe(observer){
        this.observers.push(observer)
        return this
    }

    ignore(observer){
        for(var i in this.observers)
            if(this.observers[i].key == observer.key)
                this.observers.splice(i,1)
        return this
    }

    pass(key){
        if(!this.passed){
            this.passed = true
            for(var i in this.observers)
                this.observers[i].fill(key)
        }
        return this
    }

    fill(key){
        this.dependencies[key] = true
        var filled = true
        for(var i in this.dependencies)
            if(!this.dependencies[i])
                filled = false
        if(filled){
            this.__value = this.compute()
            this.callback(this.__value,this)
            this.pass(this.key)
        }
        return this
    }

    reset(){
        for(var i in this.dependencies)
            this.dependencies[i] = false
        this.passed = false
        this.__value = null
    }

    setAttribute(attr,val){
        this.attributes[attr] = val
        return this
    }

    getAttribute(attr){
        return this.attributes[attr]
    }

    compute(){
        // override this method
    }

}

ng.node = {

    constant: class extends NgNode{

        constructor(input){
            super([],null)
            this.value = input
        }

        compute(){
            return this.value
        }

    },

    variable: class extends NgNode{

        constructor(input){
            super([],null)
            this.value = input
        }

        set(v){
            this.value = v
            return this
        }

        compute(){
            return this.value
        }

    },

    add: class extends NgNode{

        compute(){
            return this.__value || ng.util.sumNodes(this.inputs)
        }

    },

    subtract: class extends NgNode{

        compute(){
            return this.__value || this.inputs.reduce(function(t,n){
                return t - n.compute()
            },0)
        }

    },

    multiply: class extends NgNode{

        compute(){
            return this.__value || this.inputs.reduce(function(t,n){
                return t * n.compute()
            },1)
        }

    },

    divide: class extends NgNode{

        compute(){
            return this.__value || this.inputs.reduce(function(t,n){
                return t / n.compute()
            },1)
        }

    },

    exp: class extends NgNode{

        compute(){
            return this.__value || (ng.util.sumNodes(this.inputs) * ng.util.sumNodes(this.inputs))
        }

    },

    binary: class extends NgNode{

        compute(){
            return this.__value || ng.util.sumNodes(this.inputs) >= 1 ? 1 : 0
        }

    },

    linear: class extends NgNode{

        compute(){
            return this.__value || ng.util.sumNodes(this.inputs)
        }

    },

    sin: class extends NgNode{

        compute(){
            return this.__value || Math.sin(ng.util.sumNodes(this.inputs))
        }

    },

    cos: class extends NgNode{

        compute(){
            return this.__value || Math.cos(ng.util.sumNodes(this.inputs))
        }

    },

    tanh: class extends NgNode{

        compute(){
            return this.__value || Math.tanh(ng.util.sumNodes(this.inputs))
        }

    },

    sigmoid: class extends NgNode{

        compute(){
            return this.__value || 1/(1+Math.pow(Math.E, -(ng.util.sumNodes(this.inputs))))
        }

    },

    bipolarSigmoid: class extends NgNode{

        compute(){
            return this.__value || (2.0 / (1.0 + Math.exp(-4.9 * ng.util.sumNodes(this.inputs)))) - 1.0
        }

    },

    guassian: class extends NgNode{

        compute(){
            return this.__value || 2 * Math.exp(-Math.pow(ng.util.sumNodes(this.inputs) * 2.5, 2)) - 1
        }

    },

    rectifier: class extends NgNode{

        compute(){
            var v = ng.util.sumNodes(this.inputs)
            return this.__value || v >= 1 ? v : 0
        }

    },

    invert: class extends NgNode{

        compute(){
            return this.__value || -(ng.util.sumNodes(this.inputs))
        }

    },

    weight: class extends NgNode{

        constructor(input,weight,callback){
            super([input],callback)
            this.weight = weight
        }

        randomize(){
            this.weight = ng.math.randomInt(-10,10) / 10
        }

        compute(){
            return this.__value || this.inputs[0].compute() * this.weight
        }

    },

    neuron: class extends NgNode{

        constructor(inputs,activation,callback){
            for(var i in inputs)
                inputs[i] = new ng.node.weight(inputs[i],1)
            var input = [new ng.node[activation]([new ng.node.add(inputs)])]
            super(input,callback)
            this.weights = inputs
        }

        randomizeWeights(){
            for(var i in this.weights)
                this.weights[i].randomize()
        }

        compute(){
            return this.inputs[0].compute()
        }

    }

}

class NgNetwork {

    constructor(json){
        this.design = json
        this.nodes = []
        this.inputs = []
        this.hidden = []
        this.outputs = []
        this.construct()
    }

    construct(){
        this.inputs = []
        this.outputs = []
        this.nodes = []
        var d = this.design
        d.nodes = []
        for(var i in d.inputs){
            this.inputs[i] = this.nodes[i] = new ng.node[d.inputs[i].node](d.inputs[i].value)
            d.nodes.push(d.inputs[i])
        }
        for(var i in d.hidden){
            var inputs = []
            for(var n in d.hidden[i].inputs)
                inputs[n] = this.nodes[d.hidden[i].inputs[n]]
            var node = new ng.node[d.hidden[i].node](inputs)
            this.hidden.push(node)
            this.nodes.push(node)
            d.nodes.push(d.hidden[i])
        }
        for(var i in d.outputs){
            var inputs = []
            for(var n in d.outputs[i].inputs)
                inputs[n] = this.nodes[d.outputs[i].inputs[n]]
            var node = new ng.node[d.outputs[i].node](inputs)
            node.setAttribute('index',i)
            this.outputs[i] = node
            this.nodes.push(node)
            d.nodes.push(d.outputs[i])
        }
    }

    feedforward(inputs){
        for(var i in this.nodes)
            this.nodes[i].reset()
        var outputs = []
        for(var i in this.outputs)
            this.outputs[i].callback = function(v,n){
                outputs[n.getAttribute('index')] = v}
        for(var i in inputs)
            this.inputs[i].set(inputs[i]).fill()
        return outputs
    }

    fromJSON(json){
        this.design = json
        this.construct()
    }

}

ng.network = {

    cppn: class extends NgNetwork {

        nodeTypes = ['multiply','divide','sigmoid','guassian','sin','cos','tanh','invert','exp']

        constructor(numInputs,numOutputs){
            var design = {inputs:[],hidden:[],outputs:[]}
            for(var i = 0; i < numInputs; i++)
                design.inputs[i] = {node:'variable',value:1}
            for(var i = 0; i < numOutputs; i++)
                design.outputs[i] = {node:'sigmoid',inputs:[]}
            super(design)
        }

        insertNode(){
            var nodeType = this.nodeTypes[ng.math.randomInt(0,this.nodeTypes.length-1)]
            var node = new ng.node[nodeType]([])
            this.hidden.push(node)
            this.nodes.push(node)
        }

        insertNodeBetween(beforeNodes,afterNodes){
            var node = new ng.node.sigmoid(beforeNodes)
            for(var i in afterNodes)
                afterNodes[i].registerInputs([node])
            this.hidden.push(node)
            this.nodes.push(node)
        }

        insertEdgeBetween(beforeNode,afterNode){
            if(beforeNode.key != afterNode.key)
                afterNode.registerInputs([beforeNode])
        }

        removeEdgeBetween(beforeNode,afterNode){
            afterNode.unregisterInputs([beforeNode])
        }

        removeNode(node){
            for(var i in this.nodes){
                this.nodes[i].unregisterInputs([node])
                if(this.nodes[i].key == node.key)
                    this.nodes.splice(i,1)
            }
            for(var i in this.hidden)
                if(this.hidden[i].key == node.key)
                    this.hidden.splice(i,1)
        }

        insertRandomNode(){
            var nodeType = this.nodeTypes[ng.math.randomInt(0,this.nodeTypes.length-1)]
            var min = this.inputs.length
            var max = this.nodes.length - this.outputs.length
            var ran = ng.math.randomInt(min,max)
            var numInputs = ng.math.randomInt(1,ran)
            var inputs = []
            for(var i = 0; i < numInputs; i++)
                inputs.push(this.nodes[ng.math.randomInt(0,ran)])
            var node = new ng.node[nodeType](inputs)
            var numOutputs = ng.math.randomInt(ran,this.nodes.length-1)
            for(var i = 0; i < numOutputs; i++)
                this.nodes[ng.math.randomInt(ran,this.nodes.length)].registerInputs([node])
            this.nodes.splice(ran,0,node)
            this.hidden.push(node)
        }

    }

}
