
var ng = {}

ng.math = {

    randomInt(min,max){
        return (Math.random() * (max-min)) + min
    },

    probable(prob){
        return Math.random() < prob
    }

}

class NgNode{

    constructor(inputs,callback){
        this.inputs = inputs
        this.key = Math.random()
        this.observers = []
        this.dependencies = {}
        this.passed = false
        this.attributes = {}
        this.callback = callback || function(){}

        this.registerInputs(inputs)
    }

    registerInputs(inputs){
        for(var i in inputs){
            inputs[i].observe(this)
            this.dependencies[inputs[i].key] = false
        }
        return this
    }

    unregisterInputs(inputs){
        for(var i in inputs){
            inputs[i].ignore(this)
            delete this.dependencies[inputs[i].key]
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
            var value = this.compute()
            this.callback(value,this)
            this.pass(this.key)
        }
        return this
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

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return this.inputs.reduce(function(t,n){
                return t + n.compute()
            },0)
        }

    },

    subtract: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return this.inputs.reduce(function(t,n){
                return t + n.compute()
            },0)
        }

    },

    multiply: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return this.inputs.reduce(function(t,n){
                return t * n.compute()
            },1)
        }

    },

    binary: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return this.inputs[0].compute() >= 1 ? 1 : 0
        }

    },

    linear: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return this.inputs[0].compute()
        }

    },

    sin: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return Math.sin(this.inputs[0].compute())
        }

    },

    cos: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return Math.cos(this.inputs[0].compute())
        }

    },

    tanh: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return Math.tanh(this.inputs[0].compute())
        }

    },

    sigmoid: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return 1/(1+Math.pow(Math.E, -this.inputs[0].compute()))
        }

    },

    bipolarSigmoid: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return (2.0 / (1.0 + Math.exp(-4.9 * this.inputs[0].compute()))) - 1.0
        }

    },

    guassian: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return 2 * Math.exp(-Math.pow(this.inputs[0].compute() * 2.5, 2)) - 1
        }

    },

    rectifier: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            var v = this.inputs[0].compute()
            return v >= 1 ? v : 0
        }

    },

    invert: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return -(this.inputs[0].compute())
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
            return this.inputs[0].compute() * this.weight
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

class NgNetwork{

    constructor(json){
        this.design = json
        this.nodes = []
        this.inputs = []
        this.outputs = []
        this.construct()
    }

    construct(){
        var d = this.design
        for(var i in d.inputs)
            this.inputs[i] = this.nodes[i] = new ng.node[d.inputs[i].node](d.inputs[i].value)
        for(var i in d.hidden){
            var inputs = []
            for(var n in d.hidden[i].inputs)
                inputs[n] = this.nodes[d.hidden[i].inputs[n]]
            var node = new ng.node[d.hidden[i].node](inputs)
            this.nodes.push(node)
        }
        for(var i in d.outputs){
            var inputs = []
            for(var n in d.outputs[i].inputs)
                inputs[n] = this.nodes[d.outputs[i].inputs[n]]
            var node = new ng.node[d.outputs[i].node](inputs)
            node.setAttribute('index',i)
            this.outputs[i] = node
            this.nodes.push(node)
        }
    }

    feedforward(inputs){
        var outputs = []
        for(var i in this.outputs)
            this.outputs[i].callback = function(v,n){
                outputs[n.getAttribute('index')] = v}
        for(var i in inputs)
            this.inputs[i].set(inputs[i]).fill()
        return outputs
    }

}

var json = {
    inputs: [
        {node:'variable',value:1},
        {node:'variable',value:4}
    ],
    hidden: [
        {node:'add',inputs:[0,1]},
        {node:'multiply',inputs:[1,2]}
    ],
    outputs: [
        {node:'linear',inputs:[3]}
    ]
}


var net = new NgNetwork(json)
